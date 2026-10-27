import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Brand from "../../components/Brand.jsx";
import Button from "../../components/Button.jsx";
import FormField from "../../components/FormField.jsx";
import Icon from "../../components/Icon.jsx";
import LanguageButton from "../../components/LanguageButton.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import api, { apiErrorMessage } from "../../services/api.js";
import { HOME_PAGE_FOR_ROLE } from "../../services/marketplace.js";

const EMPTY = { name: "", org: "", location: "", email: "", password: "" };

// Operator sign-up. The new account waits for an admin to approve it before it can log in.
export default function RegisterPage() {
  const { user, register } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [locations, setLocations] = useState([]);
  const [problem, setProblem] = useState(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api
      .get("/locations")
      .then((response) => setLocations(response.data.locations))
      .catch((error) => setProblem(apiErrorMessage(error)));
  }, []);

  if (user) return <Navigate to={HOME_PAGE_FOR_ROLE[user.role] || "/login"} replace />;

  const set = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  async function handleSubmit(event) {
    event.preventDefault();
    if (Object.values(form).some((value) => !value.trim())) {
      setProblem("Fill in every field.");
      return;
    }
    setSubmitting(true);
    setProblem(undefined);
    try {
      await register({ ...form, email: form.email.trim().toLowerCase() });
      setDone(true);
    } catch (error) {
      setProblem(apiErrorMessage(error));
    }
    setSubmitting(false);
  }

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="glass w-[min(480px,100%)] px-6 py-8 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <Brand />
          <LanguageButton />
        </div>

        {done ? (
          <div className="mt-8 grid justify-items-center gap-3 text-center">
            <Icon name="circle-check" size={40} className="text-forest" />
            <h1 className="text-2xl font-bold tracking-tight">Account created</h1>
            <p className="text-ink/60">An admin has to approve your account before you can log in. Try logging in again later.</p>
            <Link to="/login" className="btn btn-primary mt-2">
              Back to log in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mt-8 text-3xl font-bold tracking-tight">Create your account</h1>
            <p className="mt-2 text-ink/60">For scrap shops and collection points.</p>

            <form className="mt-6 grid gap-4" onSubmit={handleSubmit} noValidate>
              <FormField id="name" label="Full name">
                <input id="name" className="input" autoComplete="name" value={form.name} onChange={set("name")} />
              </FormField>
              <FormField id="org" label="Shop or organisation">
                <input id="org" className="input" value={form.org} onChange={set("org")} />
              </FormField>
              <FormField id="location" label="Area">
                <select id="location" className="input" value={form.location} onChange={set("location")}>
                  <option value="">Choose your area</option>
                  {locations.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField id="email" label="Email">
                <input id="email" type="email" className="input" autoComplete="email" value={form.email} onChange={set("email")} />
              </FormField>
              <FormField id="password" label="Password" problem={problem}>
                <input
                  id="password"
                  type="password"
                  className="input"
                  autoComplete="new-password"
                  placeholder="6+ characters, with a number"
                  value={form.password}
                  onChange={set("password")}
                />
              </FormField>
              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Creating…" : "Create account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-ink/60">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-forest hover:underline">
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
