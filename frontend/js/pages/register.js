const registerForm = S.$("#registerForm");
const taken = (email) => S.db.where("users", (u) => u.email === email.toLowerCase()).length > 0;

const ROLE_CHOICES = [["operator", "store", "role.operatorHint"], ["recycler", "factory", "role.recyclerHint"]];
S.render(S.$("#roleChoices"), ROLE_CHOICES.map(([role, icon, hint], i) =>
  S.ui.choice("role", role, `<b>${S.t(`role.${role}`)}</b>`, { icon, hint: S.t(hint), checked: i === 0 })).join(""));

const areas = S.options(S.db.all("locations"));
S.render(S.$("#registerFields"), `
  ${S.field({ id: "name", label: "auth.name", auto: "name" })}
  ${S.field({ id: "org", label: "auth.org", auto: "organization" })}
  <div data-field class="sm:col-span-2">
    <label class="label" for="location">${S.t("auth.location")}</label>
    <select class="input" id="location" name="location">
      <option value="" selected disabled>Choose your area</option>${areas}
    </select>
  </div>
  ${S.field({
    id: "regEmail", name: "email", label: "auth.email", type: "email", auto: "email",
    hint: "you@shop.com", wide: true,
  })}
  ${S.field({
    id: "regPassword", name: "password", label: "auth.password", type: "password", auto: "new-password",
    hint: "6+ characters, including a number", wide: true,
  })}`);

// Each rule says exactly what to change, so nobody is left guessing why the button won't work.
const checkAllFields = S.validate(registerForm, {
  name: [[(v) => v.length >= 2, "Add your full name so buyers know who they're dealing with."]],
  org: [[(v) => v.length >= 2, "Add your shop or organisation name. It appears on every listing."]],
  location: [[(v) => v, "Choose the area where you collect or buy plastic."]],
  email: [
    [(v) => v, "Add an email. Your approval arrives there."],
    [S.isEmail, "That doesn't look like an email yet. It should look like name@shop.com."],
    [(v) => !taken(v), "This email already has an account. Log in instead, or use a different email."],
  ],
  password: [
    [(v) => v.length >= 6, "Use at least 6 characters."],
    [(v) => /\d/.test(v), "Add at least one number, for example greenbin24."],
  ],
  terms: [[(checked) => checked, "Tick the box to accept the terms and privacy policy."]],
});

// Demo mode approves new accounts instantly and signs them in, so every feature can be shown straight away.
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!checkAllFields()) return;

  const field = registerForm.elements;
  const user = S.db.insert("users", {
    id: S.uid("u"),
    name: field.name.value.trim(),
    org: field.org.value.trim(),
    role: field.role.value,
    location: field.location.value,
    email: field.email.value.trim().toLowerCase(),
    status: "approved",
    joined: new Date().toISOString(),
  });

  S.session.set(user);
  S.$("#openWorkspace").href = S.base + S.HOME[user.role];
  registerForm.hidden = true;
  S.$("#done").hidden = false;
  setTimeout(() => S.go(S.HOME[user.role]), 3500);
});
