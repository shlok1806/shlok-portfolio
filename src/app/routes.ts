import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Home from "./pages/Home";
import Crate from "./pages/Crate";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "crate", Component: Crate },
      { path: "crate/:recordId", Component: Crate },
    ],
  },
]);
