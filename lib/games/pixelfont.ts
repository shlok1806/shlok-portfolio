/**
 * Tom Thumb, a 3x5 bitmap font - the smallest type that is still genuinely
 * readable, which is exactly what a 160x144 screen needs. Antialiased type next
 * to 8px blocks reads as a mistake; this does not.
 *
 * Glyph data converted from the original BDF (tom-thumb.bdf), MIT licensed:
 *
 *   Copyright 1999 Brian J. Swetland, 1999 Vassilii Khachaturov,
 *   Dan Marks, 2010 Robey Pointer
 *   https://robey.lag.net/2010/01/23/tiny-monospace-font.html
 *
 * The BDF is packed here into one string rather than shipped as a font file:
 * every glyph is six rows of three pixels, so a row fits in three bits and a
 * glyph in six characters. Printable ASCII only, indexed by code point - 32.
 */

/** Six rows per glyph, top first; bit 4 is the left pixel, bit 1 the right. */
const GLYPHS =
  "000000222020550000575750363620412410667530220000122210422240" +
  "525000027200000240007000000020112440355560262220612470612160" +
  "557110746160347570712440757570757160020200020240124210070700" +
  "421240712020257430257550656560344430655560747470747440347530" +
  "557550722270111520556550444470577550577750255520656440255730" +
  "657650342160722220555530555220557750552550552220712470744470" +
  "042100711170250000000070420000063570465560034430135530035630" +
  "127220035712465550202220101152456650622270077750065550025520" +
  "065564035531034440036360272230055530055720057770052250055312" +
  "073670324230220220621260360000";

const FIRST = 32;
const ROWS = 6;

/** One glyph plus the column of space after it. */
export const GLYPH_W = 4;
export const GLYPH_H = ROWS;

export const textWidth = (text: string) => Math.max(0, text.length * GLYPH_W - 1);

/**
 * Draws `text` with its top-left at (x, y), in whole pixels. Characters outside
 * printable ASCII are skipped rather than drawn as tofu.
 */
export function drawText(
  g: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
) {
  g.fillStyle = color;
  for (let i = 0; i < text.length; i++) {
    const slot = text.charCodeAt(i) - FIRST;
    if (slot < 0 || (slot + 1) * ROWS > GLYPHS.length) continue;
    const gx = x + i * GLYPH_W;
    for (let row = 0; row < ROWS; row++) {
      const bits = GLYPHS.charCodeAt(slot * ROWS + row) - 48;
      if (bits <= 0) continue;
      if (bits & 4) g.fillRect(gx, y + row, 1, 1);
      if (bits & 2) g.fillRect(gx + 1, y + row, 1, 1);
      if (bits & 1) g.fillRect(gx + 2, y + row, 1, 1);
    }
  }
}

/** Right-aligns `text` so its last pixel column lands on `right`. */
export function drawTextRight(
  g: CanvasRenderingContext2D,
  text: string,
  right: number,
  y: number,
  color: string,
) {
  drawText(g, text, right - textWidth(text), y, color);
}

export const pad = (n: number, width: number) =>
  String(Math.max(0, Math.floor(n))).padStart(width, "0");
