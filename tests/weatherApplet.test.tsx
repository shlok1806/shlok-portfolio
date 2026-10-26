import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Weather } from "@/components/os/applets/Weather";
import { WEATHER_TTL_MS, writeCachedWeather } from "@/lib/os/weather";

// No `globals: true` in vitest.config, so testing-library cannot unmount for us
afterEach(cleanup);

const NOW = new Date(2026, 9, 25, 15, 0, 0).getTime();
const HOUR = 60 * 60_000;
const answer = (tempF: number) => ({
  ok: true,
  json: () => Promise.resolve({ current: { temperature_2m: tempF, weather_code: 0, wind_speed_10m: 5 } }),
});

let visibility: DocumentVisibilityState = "visible";
const setVisibility = (v: DocumentVisibilityState) => {
  visibility = v;
  document.dispatchEvent(new Event("visibilitychange"));
};
/* Lets the fetch mock's promises settle inside React's act */
const settle = () => act(async () => {});
const temperature = () => document.querySelector("[data-slot='weather']")?.textContent;

describe("Weather applet", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    vi.setSystemTime(NOW);
    visibility = "visible";
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => visibility });
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("holds its slot with dashes until the first reading lands", async () => {
    let land: (v: unknown) => void = () => {};
    fetchMock.mockReturnValue(new Promise((r) => (land = r)));
    render(<Weather />);
    expect(temperature()).toBe("--°");
    await act(async () => land(answer(71.6)));
    expect(temperature()).toBe("72°");
  });

  it("shows a stale reading at once and swaps in the fresh one", async () => {
    writeCachedWeather({ tempF: 60, code: 3, windMph: 2, at: NOW - HOUR });
    fetchMock.mockResolvedValue(answer(64));
    render(<Weather />);
    expect(temperature()).toBe("60°");
    await settle();
    expect(temperature()).toBe("64°");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("keeps the stale reading when the ask fails, and says how old it is", async () => {
    writeCachedWeather({ tempF: 60, code: 3, windMph: 2, at: NOW - HOUR });
    fetchMock.mockRejectedValue(new TypeError("offline"));
    render(<Weather />);
    await settle();
    expect(temperature()).toBe("60°");
    expect(screen.getByLabelText(/weather in/i).getAttribute("title")).toMatch(/as of 14:00/);
  });

  it("does not show a reading too old to be true, and says when there is none", async () => {
    writeCachedWeather({ tempF: 60, code: 3, windMph: 2, at: NOW - 4 * HOUR });
    fetchMock.mockRejectedValue(new TypeError("offline"));
    render(<Weather />);
    expect(temperature()).toBe("--°");
    await settle();
    expect(screen.getByLabelText(/no reading/i)).toBeTruthy();
  });

  it("leaves a fresh reading alone, then asks once when the tab comes back after it went stale", async () => {
    writeCachedWeather({ tempF: 60, code: 0, windMph: 2, at: NOW - 60_000 });
    let land: (v: unknown) => void = () => {};
    fetchMock.mockReturnValue(new Promise((r) => (land = r)));
    render(<Weather />);
    expect(fetchMock).not.toHaveBeenCalled();

    act(() => setVisibility("hidden"));
    vi.setSystemTime(NOW + 2 * HOUR);
    act(() => vi.advanceTimersByTime(2 * HOUR));
    expect(fetchMock).not.toHaveBeenCalled();

    act(() => setVisibility("visible"));
    act(() => setVisibility("hidden"));
    act(() => setVisibility("visible"));
    act(() => window.dispatchEvent(new Event("online")));
    expect(fetchMock).toHaveBeenCalledOnce();

    await act(async () => land(answer(55)));
    expect(temperature()).toBe("55°");
  });

  it("asks again on its own once a reading on screen turns stale", async () => {
    writeCachedWeather({ tempF: 60, code: 0, windMph: 2, at: NOW });
    fetchMock.mockResolvedValue(answer(58));
    render(<Weather />);
    act(() => vi.advanceTimersByTime(WEATHER_TTL_MS - 1000));
    expect(fetchMock).not.toHaveBeenCalled();
    vi.setSystemTime(NOW + WEATHER_TTL_MS);
    act(() => vi.advanceTimersByTime(1000));
    expect(fetchMock).toHaveBeenCalledOnce();
    await settle();
    expect(temperature()).toBe("58°");
  });
});
