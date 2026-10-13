const loginForm = S.$("#loginForm");
const notice = S.$("#formNotice");

const peekButton = `
  <button type="button" id="peek" class="absolute right-2 top-1.5 grid h-9 w-9 place-items-center rounded-lg muted"
    aria-label="Show password">${S.ui.icon("eye")}</button>`;
const forgotLink = `<a href="info.html#contact" class="text-xs text-forest hover:underline">Forgot password?</a>`;

S.render(S.$("#loginFields"), [
  S.field({ id: "email", label: "auth.email", type: "email", auto: "email", hint: "you@shop.com" }),
  S.field({
    id: "password", label: "auth.password", type: "password", auto: "current-password",
    hint: "At least 6 characters", aside: forgotLink, suffix: peekButton,
  }),
].join(""));

const checkAll = S.validate(loginForm, {
  email: [
    [(v) => v, "Enter the email you signed up with."],
    [S.isEmail, "That doesn't look like an email yet. It should look like name@shop.com."],
  ],
  password: [
    [(v) => v, "Enter your password."],
    [(v) => v.length >= 6, "Passwords on Scrapify are at least 6 characters. Check for a missing letter."],
  ],
});

// Accounts that can't log in yet get a clear next step instead of a generic error.
const BLOCKED = {
  pending: ["clock", "Your account is waiting for approval",
    "An admin checks every new account, usually within a day. We'll email you the moment you're approved."],
  suspended: ["ban", "This account is suspended",
    "Email hello@scrapify.app with your shop name and we'll look into it."],
};

function showNotice([icon, title, text]) {
  notice.hidden = false;
  S.render(notice, `
    ${S.ui.icon(icon, "mt-0.5 text-amber-700")}
    <div>
      <p class="font-semibold text-amber-800">${title}</p>
      <p class="mt-0.5 text-amber-800/80">${text}</p>
    </div>`);
}

// Demo accounts sign in with one click.
const DEMO = [["u1", "store", "operator"], ["u5", "factory", "recycler"], ["u9", "shield-check", "admin"]];
S.render(S.$("#demoUsers"), DEMO.map(([id, icon, role]) => `
  <button type="button" class="btn btn-sm !h-auto flex-col gap-1 py-3" data-user="${id}">
    ${S.ui.icon(icon, "text-forest")}${S.t(`role.${role}`)}
  </button>`).join(""));

S.$("#demoUsers").addEventListener("click", (e) => {
  const button = e.target.closest("[data-user]");
  if (!button) return;
  loginForm.email.value = S.user(button.dataset.user).email;
  loginForm.password.value = "demo1234";
  loginForm.requestSubmit();
});

S.$("#peek").addEventListener("click", (e) => {
  const hidden = loginForm.password.type === "password";
  loginForm.password.type = hidden ? "text" : "password";
  e.currentTarget.setAttribute("aria-label", hidden ? "Hide password" : "Show password");
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  notice.hidden = true;
  if (!checkAll()) return;

  const email = loginForm.email.value.trim().toLowerCase();
  const user = S.db.where("users", (u) => u.email === email)[0];
  const unknown = "No account uses this email. Check the spelling, or create an account below.";
  if (!user) return S.fieldError(loginForm.email, unknown);
  if (BLOCKED[user.status]) return showNotice(BLOCKED[user.status]);

  S.session.set(user);
  const next = S.param("next");
  next?.startsWith(S.base) ? location.assign(next) : S.go(S.HOME[user.role]);
});
