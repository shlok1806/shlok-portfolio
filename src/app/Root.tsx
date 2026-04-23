import { Outlet, useLocation } from "react-router";
import { Navigation } from "./components/Navigation";

export default function Root() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen">
      <Navigation />
      <Outlet />
    </div>
  );
}
