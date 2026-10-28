import { Outlet } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";

// The frame around public pages (landing page, plastic guide): navbar on top, footer at the bottom.
// <Outlet /> is replaced by whichever page matches the current address.
export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
