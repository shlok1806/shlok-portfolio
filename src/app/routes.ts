import { createBrowserRouter, redirect } from "react-router";
import Root from "./Root";
import Home from "./pages/Home";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "*", loader: () => redirect("/") },
    ],
  },
]);
