import { Link } from "react-router-dom";
import logoUrl from "../assets/logo.svg";

// The Scrapify logo and name. Clicking it goes to the landing page.
export default function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 text-[1.125rem] font-extrabold tracking-tight">
      <img src={logoUrl} alt="" className="h-9 w-9 drop-shadow-md" />
      Scrapify
    </Link>
  );
}
