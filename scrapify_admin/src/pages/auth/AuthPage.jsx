import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthStoryPanel from "../../components/auth/AuthStoryPanel.jsx";
import LoginForm from "../../components/auth/LoginForm.jsx";
import RegisterForm from "../../components/auth/RegisterForm.jsx";
import Icon from "../../components/Icon.jsx";
import LanguageButton from "../../components/LanguageButton.jsx";

const DEFAULT_TITLE = "Scrapify · Fair prices for plastic";

export default function AuthPage({ mode }) {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = mode === "register" ? "Create account · Scrapify" : "Log in · Scrapify";
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [mode]);

  return (
    <div className="relative grid min-h-screen gap-4 p-4 lg:grid-cols-2">
      <AuthSide active={mode === "login"}>
        <LoginForm onSwitch={() => navigate("/register")} />
      </AuthSide>
      <AuthSide active={mode === "register"}>
        <RegisterForm onSwitch={() => navigate("/login")} />
      </AuthSide>
      <AuthStoryPanel mode={mode} />
    </div>
  );
}

function AuthSide({ active, children }) {
  return (
    <section
      className={`grid place-items-center py-6 transition-opacity duration-500 ${active ? "" : "max-lg:hidden lg:opacity-0"}`}
      inert={active ? undefined : ""}
    >
      <div className="glass w-full max-w-md p-7 sm:p-10 animate-rise">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="btn btn-ghost btn-sm -ml-3">
            <Icon name="arrow-left" />
            Home
          </Link>
          <LanguageButton className="lg:!hidden" />
        </div>
        {children}
      </div>
    </section>
  );
}
