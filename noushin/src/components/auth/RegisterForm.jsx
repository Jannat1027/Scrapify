import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import api, { apiErrorMessage } from "../../services/api.js";
import { useFormValidation } from "../../utils/useFormValidation.js";
import { isEmail } from "../../utils/validation.js";
import Button from "../Button.jsx";
import ChoiceTile from "../ChoiceTile.jsx";
import FormField from "../FormField.jsx";
import FormInput from "../FormInput.jsx";
import Icon from "../Icon.jsx";

const ROLE_CHOICES = [
  { role: "operator", label: "Operator", hint: "Scrap shop or NGO", icon: "store" },
  { role: "recycler", label: "Recycler", hint: "Bulk buyer", icon: "factory" },
];

// Sign-up. New accounts must confirm their email (link sent by the API) before they can log in.
// New accounts also wait as "pending" until an admin approves them.
export default function RegisterForm({ onSwitch }) {
  const { register } = useAuth();
  const [newUser, setNewUser] = useState(null); // set after a successful sign-up
  const [locations, setLocations] = useState([]); // known areas, offered as suggestions; any area can be typed
  const [submitting, setSubmitting] = useState(false);
  const [serverProblem, setServerProblem] = useState("");

  useEffect(() => {
    api
      .get("/locations")
      .then((response) => setLocations(response.data.locations))
      .catch((error) => setServerProblem(apiErrorMessage(error)));
  }, []);

  // Each rule says exactly what to change, so nobody is left guessing why the button won't work.
  const rules = {
    name: [[(value) => value.length >= 2, "Add your full name so buyers know who they're dealing with."]],
    org: [[(value) => value.length >= 2, "Add your shop or organisation name. It appears on every listing."]],
    location: [[(value) => value.trim().length >= 2, "Write the area where you collect or buy plastic, like Uttara, Dhaka."]],
    email: [
      [(value) => value.length > 0, "Add an email. Your approval arrives there."],
      [isEmail, "That doesn't look like an email yet. It should look like name@shop.com."],
    ],
    password: [
      [(value) => value.length >= 6, "Use at least 6 characters."],
      [(value) => /\d/.test(value), "Add at least one number, for example greenbin24."],
    ],
    terms: [[(checked) => checked === true, "Tick the box to accept the terms and privacy policy."]],
  };
  const emptyForm = { role: "operator", name: "", org: "", location: "", email: "", password: "", terms: false };
  const form = useFormValidation(rules, emptyForm);

  // Clear the form so the next visit to sign-up starts fresh, then show the login form.
  function goToLogIn() {
    setNewUser(null);
    form.resetForm();
    onSwitch();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerProblem("");
    if (!form.validateForm()) return;

    const { values } = form;
    setSubmitting(true);
    try {
      const user = await register({
        role: values.role,
        name: values.name.trim(),
        org: values.org.trim(),
        location: values.location.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
      setNewUser(user);
    } catch (error) {
      // "This email already has an account" and other server answers appear under the button.
      setServerProblem(apiErrorMessage(error));
    }
    setSubmitting(false);
  }

  if (newUser) {
    return (
      <div className="animate-rise py-10 text-center">
        <span className="icon-tile mx-auto h-16 w-16 text-[1.875rem]">
          <Icon name="mail" />
        </span>
        <h2 className="mt-6 text-2xl font-bold">Account created</h2>
        <p className="mt-3 text-ink/60">
          {newUser.status === "pending"
            ? "We emailed you a link. Open it to confirm your email. An admin then checks your account, usually within a day, and you can log in as soon as it's approved."
            : "We emailed you a link. Open it to confirm your email, then you can log in. Check spam if it isn't there."}
        </p>
        <p className="mt-4 text-sm text-ink/60">
          Then log in with <b>{newUser.email}</b>.
        </p>
        <button type="button" className="btn btn-primary mt-8" onClick={goToLogIn}>
          Go to log in <Icon name="arrow-right" />
        </button>
      </div>
    );
  }

  return (
    <form className="mt-8 grid gap-5" onSubmit={handleSubmit} noValidate>
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Create your account</h1>
        <p className="text-ink/60">An admin verifies every account before trading starts.</p>
      </div>

      <fieldset>
        <legend className="label">I am a</legend>
        <div className="grid grid-cols-2 gap-3">
          {ROLE_CHOICES.map((choice) => (
            <ChoiceTile
              key={choice.role}
              name="role"
              value={choice.role}
              checked={form.values.role === choice.role}
              onChange={form.handleChange}
              label={choice.label}
              hint={choice.hint}
              icon={choice.icon}
            />
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput form={form} name="name" id="register-name" label="Full name" autoComplete="name" />
        <FormInput form={form} name="org" id="register-org" label="Shop / organisation" autoComplete="organization" />
      </div>

      <FormField id="register-location" label="Location" problem={form.problems.location}>
        <input
          id="register-location"
          name="location"
          className="input"
          list="register-location-suggestions"
          autoComplete="address-level2"
          maxLength={80}
          placeholder="Your area, e.g. Uttara, Dhaka"
          value={form.values.location}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
        />
        <datalist id="register-location-suggestions">
          {locations.map((place) => (
            <option key={place} value={place} />
          ))}
        </datalist>
      </FormField>

      <FormInput form={form} name="email" id="register-email" label="Email" type="email" autoComplete="email" placeholder="you@shop.com" />
      <FormInput
        form={form}
        name="password"
        id="register-password"
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="6+ characters, including a number"
      />

      <FormField id="register-terms" problem={form.problems.terms}>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-ink/60">
          <input className="mb-[3px] ml-1 mr-[3px] mt-1 h-4 w-4 accent-emerald-600" type="checkbox" name="terms" checked={form.values.terms} onChange={form.handleChange} />
          <span>I agree to the terms of use and the privacy policy.</span>
        </label>
      </FormField>

      {serverProblem && (
        <p className="flex items-start gap-1.5 text-[0.8125rem] text-red-600" role="alert">
          <Icon name="circle-alert" className="mt-px" />
          <span>{serverProblem}</span>
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Creating…" : "Create account"}
      </Button>
      <p className="text-center text-sm text-ink/60">
        Already registered?{" "}
        <button type="button" className="link text-[length:inherit]" onClick={onSwitch}>
          Log in
        </button>
      </p>
    </form>
  );
}
