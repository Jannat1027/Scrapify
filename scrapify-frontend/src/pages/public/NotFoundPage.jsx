import { Link } from "react-router-dom";
import Icon from "../../components/Icon.jsx";

// Shown for any address that doesn't match a route.
export default function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <main className="glass relative w-full max-w-lg overflow-hidden p-10 text-center animate-rise">
        <div className="absolute -top-24 left-1/2 z-[-1] h-56 w-56 -translate-x-1/2 rounded-full bg-mint/20 blur-[64px]" />
        <p className="text-[6rem] font-extrabold leading-none tracking-tighter text-gradient">404</p>
        <h1 className="mb-3 mt-4 text-2xl font-bold">This page went out with the recycling</h1>
        <p className="text-ink/60">The link may be old, or the page has moved. Let's get you back on track.</p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link to="/" className="btn btn-primary">
            <Icon name="house" /> Go home
          </Link>
          <Link to="/guide" className="btn">
            <Icon name="book-open" /> Plastic guide
          </Link>
        </div>
      </main>
    </div>
  );
}
