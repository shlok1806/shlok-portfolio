import { Outlet } from "react-router";
import { Navigation } from "./components/Navigation";
import { CustomCursor } from "./components/CustomCursor";
import { ScrollProgress } from "./components/ScrollProgress";
import { Footer } from "./components/Footer";

export default function Root() {
  return (
    <div className="min-h-screen flex flex-col">
      <CustomCursor />
      <ScrollProgress />
      <Navigation />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
