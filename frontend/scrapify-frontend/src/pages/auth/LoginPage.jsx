import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Brand from "../../components/Brand.jsx";
import Button from "../../components/Button.jsx";
import FormField from "../../components/FormField.jsx";
import LanguageButton from "../../components/LanguageButton.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiErrorMessage } from "../../services/api.js";
import { HOME_PAGE_FOR_ROLE } from "../../services/marketplace.js";

// Shown after the confirm-email link in the sign-up email sends the person back here.
const VERIFIED_MESSAGES = {
  ok: { tone: "text-forest", text: "Your email is confirmed. You can log in as soon as an admin has approved your account." },
  expired: { tone: "text-red-600", text: "That link has expired. Log in below and we'll offer to send a new one." },
  invalid: { tone: "text-red-600", text: "That link doesn't work any more. If your email is already confirmed, just log in." },
};

export default function LoginPage() {
  const { user, logIn, resendVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const verified = VERIFIED_MESSAGES[searchParams.get("verified")];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [problem, setProblem] = useState(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [needsVerifying, setNeedsVerifying] = useState(false);
  const [resendNote, setResendNote] = useState("");

  if (user) return <Navigate to={HOME_PAGE_FOR_ROLE[user.role]} replace />;

  async function tryLogIn(emailToTry, passwordToTry) {
    setSubmitting(true);
    setProblem(undefined);
    setNeedsVerifying(false);
    setResendNote("");
    try {
      const loggedIn = await logIn(emailToTry.trim().toLowerCase(), passwordToTry);
      navigate(location.state?.from || HOME_PAGE_FOR_ROLE[loggedIn.role], { replace: true });
    } catch (error) {
      setProblem(apiErrorMessage(error));
      setNeedsVerifying(error.response?.data?.code === "EMAIL_NOT_VERIFIED");
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResendNote("Sending…");
    try {
      setResendNote(await resendVerification(email.trim().toLowerCase()));
    } catch (error) {
      setResendNote(apiErrorMessage(error));
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setProblem("Enter your email and password.");
      return;
    }
    tryLogIn(email, password);
  }

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="glass w-[min(440px,100%)] px-6 py-8 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <Brand />
          <LanguageButton />
        </div>

        <h1 className="mt-8 text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-ink/60">Log in to your operator workspace.</p>
        {verified && (
          <p className={`mt-4 text-sm font-semibold ${verified.tone}`} aria-live="polite">
            {verified.text}
          </p>
        )}

        <form className="mt-8 grid gap-5" onSubmit={handleSubmit} noValidate>
          <FormField id="email" label="Email">
            <input
              id="email"
              type="email"
              className="input"
              autoComplete="email"
              placeholder="you@shop.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </FormField>

          <FormField id="password" label="Password" problem={problem}>
            <input
              id="password"
              type="password"
              className="input"
              autoComplete="current-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </FormField>

          {needsVerifying && (
            <p className="-mt-2 text-sm text-ink/60">
              Didn't get the email?{" "}
              <button type="button" className="font-semibold text-forest hover:underline" onClick={handleResend}>
                Send a new link
              </button>
              {resendNote && <span className="mt-1 block">{resendNote}</span>}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          New here?{" "}
          <Link to="/register" className="font-semibold text-forest hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
