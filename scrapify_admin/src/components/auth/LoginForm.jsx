import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "../../data/seed.js";
import { HOME_PAGE_FOR_ROLE, ROLE_LABELS } from "../../services/marketplace.js";
import { useFormValidation } from "../../utils/useFormValidation.js";
import { isEmail } from "../../utils/validation.js";
import Button from "../Button.jsx";
import FormField from "../FormField.jsx";
import FormInput from "../FormInput.jsx";
import Icon from "../Icon.jsx";

// Each rule says exactly what to fix.
const RULES = {
  email: [
    [(value) => value.length > 0, "Enter the email you signed up with."],
    [isEmail, "That doesn't look like an email yet. It should look like name@shop.com."],
  ],
  password: [
    [(value) => value.length > 0, "Enter your password."],
    [(value) => value.length >= 6, "Passwords on Scrapify are at least 6 characters. Check for a missing letter."],
  ],
};

// Accounts that can't log in yet get a clear next step instead of a generic error.
const BLOCKED_MESSAGES = {
  pending: {
    icon: "clock",
    title: "Your account is waiting for approval",
    text: "An admin checks every new account, usually within a day. We'll email you the moment you're approved. (Demo: log in as Admin and approve it under Users.)",
  },
  suspended: {
    icon: "ban",
    title: "This account is suspended",
    text: "Email hello@scrapify.app with your shop name and we'll look into it.",
  },
};

// SIMULATED login: the email must belong to a demo user; any password with 6+ characters is accepted.
export default function LoginForm({ onSwitch }) {
  const { data } = useData();
  const { logIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const form = useFormValidation(RULES, { email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState(null);

  // The password is not checked in the demo, so only the email is needed here.
  function tryLogIn(email) {
    setBlockedMessage(null);
    const user = data.users.find((person) => person.email === email.trim().toLowerCase());
    if (!user) {
      form.setFieldProblem("email", "No account uses this email. Check the spelling, or create an account below.");
      return;
    }
    if (BLOCKED_MESSAGES[user.status]) {
      setBlockedMessage(BLOCKED_MESSAGES[user.status]);
      return;
    }
    logIn(user);
    // Go back to the page the user tried to open, if it belongs to their role; otherwise to their dashboard.
    const wantedPage = location.state?.from;
    const home = HOME_PAGE_FOR_ROLE[user.role];
    navigate(wantedPage && wantedPage.startsWith(home) ? wantedPage : home);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (form.validateForm()) tryLogIn(form.values.email);
  }

  function logInAsDemo(account) {
    form.setValues({ email: account.email, password: DEMO_PASSWORD });
    tryLogIn(account.email);
  }

  const forgotLink = (
    <Link to="/guide#contact" className="text-xs link">
      Forgot password?
    </Link>
  );

  return (
    <>
      <h1 className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl">Welcome back</h1>
      <p className="mt-2 text-ink/60">Log in to your shop, recycler or admin workspace.</p>

      <form className="mt-8 grid gap-5" onSubmit={handleSubmit} noValidate>
        <FormInput form={form} name="email" label="Email" type="email" autoComplete="email" placeholder="you@shop.com" />

        <FormField id="password" label="Password" problem={form.problems.password} aside={forgotLink}>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              className="input pr-12"
              autoComplete="current-password"
              placeholder="At least 6 characters"
              value={form.values.password}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
            />
            <button
              type="button"
              className="absolute right-2 top-1.5 grid h-9 w-9 place-items-center rounded-lg text-ink/60 hover:text-ink"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
            >
              <Icon name={showPassword ? "eye-off" : "eye"} />
            </button>
          </div>
        </FormField>

        {blockedMessage && (
          <div className="flex gap-3 rounded-xl border border-amber-400/40 bg-amber-50/80 p-4 text-[0.875rem] text-amber-800" role="alert">
            <Icon name={blockedMessage.icon} className="mt-0.5 text-amber-700" />
            <div>
              <p className="font-semibold">{blockedMessage.title}</p>
              <p>{blockedMessage.text}</p>
            </div>
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" className="w-full">
          Log in
        </Button>
      </form>

      <div className="mt-7 rounded-2xl border border-dashed border-ink/15 p-4">
        <p className="kicker">Demo · one click, no password</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button key={account.role} type="button" className="btn btn-sm h-auto flex-col gap-1 px-1 py-3" onClick={() => logInAsDemo(account)}>
              <Icon name={account.icon} className="text-forest" />
              {ROLE_LABELS[account.role]}
            </button>
          ))}
        </div>
        <p className="text-xs text-ink/60 mt-3">
          Simulated login: there is no server, so passwords are not checked. Any demo email (see README) works with any
          6+ character password.
        </p>
      </div>

      <p className="mt-2 text-center text-sm text-ink/60">
        New to Scrapify?{" "}
        <button type="button" className="link text-[length:inherit]" onClick={onSwitch}>
          Create an account
        </button>
      </p>
    </>
  );
}
