// Form helpers: a labelled field builder and live validation with "what to fix" hints.
S.isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

// <option> tags from [value, label] pairs, or from plain strings used as both.
S.options = (items) => items
  .map((item) => (Array.isArray(item) ? item : [item, item]))
  .map(([value, label]) => `<option value="${S.esc(value)}">${S.esc(label)}</option>`)
  .join("");

// One labelled input. `label` is a labels.js key or plain text. `aside` sits next to the label,
// `suffix` inside the input, and `wide` makes the field span both columns of a two-column form.
S.field = ({ id, name = id, label, type = "text", auto = "off", hint = "", aside = "", suffix = "", wide }) => `
  <div data-field class="${wide ? "sm:col-span-2" : ""}">
    <div class="flex justify-between">
      <label class="label" for="${id}">${S.t(label)}</label>${aside}
    </div>
    <div class="relative">
      <input class="input ${suffix ? "pr-12" : ""}" id="${id}" name="${name}" type="${type}"
        autocomplete="${auto}" placeholder="${hint}">${suffix}
    </div>
  </div>`;

const HINT_CLASS = "mt-1.5 flex items-start gap-1.5 text-xs leading-snug";

// The one line under a field that says what is wrong, or that it looks good.
function showHint(input, problem) {
  const box = input.closest("[data-field]") || input.parentElement;
  const hint = box.querySelector(":scope > [data-hint]") || box.appendChild(S.make("p", { className: HINT_CLASS }));
  hint.dataset.hint = "";
  hint.setAttribute("aria-live", "polite");
  input.setAttribute("aria-invalid", Boolean(problem));
  input.classList.toggle("!border-red-400", Boolean(problem));
  input.classList.toggle("!border-mint", !problem);
  S.render(hint, problem
    ? `${S.ui.icon("circle-alert", "mt-px text-red-500")}<span class="text-red-600">${problem}</span>`
    : `${S.ui.icon("circle-check", "mt-px text-forest")}<span class="text-forest">Looks good</span>`);
}

// rules = { fieldName: [[isOk(value), "What to fix"], ...] }.
// A field is checked when the user leaves it, then on every change until it is fixed.
// Returns checkAll(), which checks every field and focuses the first one that needs fixing.
S.validate = (form, rules) => {
  const names = Object.keys(rules);
  const valueOf = (input) => (input.type === "checkbox" ? input.checked : input.value.trim());
  const problemIn = (name) => rules[name].find(([isOk]) => !isOk(valueOf(form.elements[name])))?.[1] || "";

  const check = (name) => {
    const problem = problemIn(name);
    showHint(form.elements[name], problem);
    return !problem;
  };

  names.forEach((name) => {
    const input = form.elements[name];
    const instant = input.type === "checkbox" || input.tagName === "SELECT";
    input.addEventListener("blur", () => valueOf(input) !== "" && check(name));
    input.addEventListener(instant ? "change" : "input", () => {
      if (instant || input.hasAttribute("aria-invalid")) check(name);
    });
  });

  return function checkAll() {
    const results = names.map(check);
    form.elements[names[results.indexOf(false)]]?.focus();
    return results.every(Boolean);
  };
};

// Puts a problem found after submitting (wrong email, blocked account) under a specific field.
S.fieldError = (input, message) => {
  showHint(input, message);
  input.focus();
};

// A big touch keypad for numbers: up to six characters and one decimal point. Calls onChange(text) on every key.
S.numpad = (el, onChange, text = "") => {
  const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];
  const button = (key) => `<button class="btn h-16 !rounded-2xl text-2xl" data-key="${key}">${key}</button>`;
  S.render(el, KEYS.map(button).join(""));
  el.addEventListener("click", (e) => {
    const key = e.target.closest("[data-key]")?.dataset.key;
    if (key === "⌫") text = text.slice(0, -1);
    else if (key && text.length < 6 && !(key === "." && text.includes("."))) text += key;
    onChange(text);
  });
};
