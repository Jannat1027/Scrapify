import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiErrorMessage } from "../../services/api.js";
import { HOME_PAGE_FOR_ROLE } from "../../services/marketplace.js";
import { useFormValidation } from "../../utils/useFormValidation.js";
import { isEmail } from "../../utils/validation.js";
import Button from "../Button.jsx";
import FormField from "../FormField.jsx";
import FormInput from "../FormInput.jsx";
import Icon from "../Icon.jsx";

const RULES = {
  email: [
    [(value) => value.length > 0, "Enter the email you signed up with."],
    [isEmail, "That doesn't look like an email yet. It should look like name@shop.com."],
  ],
  password: [[(value) => value.length > 0, "Enter your password."]],
};

function blockedMessageFor(error) {
  if (error.response?.status !== 403) return null;
  const reason = error.response.data?.message || "";
  if (/suspend/i.test(reason)) {
    return { icon: "ban", title: "This account is suspended", text: "Email hello@scrapify.app with your shop name and we'll look into it." };
  }
  return { icon: "clock", title: "Your account is waiting for approval", text: "An admin checks every new account, usually within a day. You can log in as soon as it is approved." };
}

export default function LoginForm({ onSwitch }) {
  const { logIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const form = useFormValidation(RULES, { email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverProblem, setServerProblem] = useState("");

  async function tryLogIn(email, password) {
    setBlockedMessage(null);
    setServerProblem("");
    setSubmitting(true);
    try {
      const user = await logIn(email.trim().toLowerCase(), password);
      const wantedPage = location.state?.from;
      const home = HOME_PAGE_FOR_ROLE[user.role];
      navigate(wantedPage && wantedPage.startsWith(home) ? wantedPage : home, { replace: true });
    } catch (error) {
      const blocked = blockedMessageFor(error);
      if (blocked) setBlockedMessage(blocked);
      else setServerProblem(apiErrorMessage(error));
      setSubmitting(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (form.validateForm()) tryLogIn(form.values.email, form.values.password);
  }

  return (
    <>
      <h1 className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl">Welcome back</h1>
      <p className="mt-2 text-ink/60">Log in to your Scrapify workspace.</p>

      <form className="mt-8 grid gap-5" onSubmit={handleSubmit} noValidate>
        <FormInput form={form} name="email" label="Email" type="email" autoComplete="email" placeholder="you@shop.com" />

        <FormField id="password" label="Password" problem={serverProblem || form.problems.password}>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              className="input pr-12"
              autoComplete="current-password"
              placeholder="Your password"
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

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        New to Scrapify?{" "}
        <button type="button" className="link text-[length:inherit]" onClick={onSwitch}>
          Create an account
        </button>
      </p>
    </>
  );
}
