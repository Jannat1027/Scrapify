// Modal dialogs. S.dialog opens any form; S.ask covers the common "confirm, maybe with a reason" case.

// The Cancel + confirm row at the bottom of every dialog form.
S.ui.dialogButtons = (confirm, danger = false) => `
  <div class="flex justify-end gap-2">
    <button value="" formnovalidate class="btn">Cancel</button>
    <button value="ok" class="btn ${danger ? "btn-danger" : "btn-primary"}">${confirm}</button>
  </div>`;

// Opens a modal containing `content` (form fields plus S.ui.dialogButtons).
// Resolves with the form values when confirmed, or null when dismissed. Optional `rules` work like S.validate.
S.dialog = (content, rules = null) =>
  new Promise((resolve) => {
    const dialog = S.make("dialog", { className: "modal" });
    S.render(dialog, `<form method="dialog" class="grid gap-4" novalidate>${content}</form>`);
    const form = dialog.firstElementChild;
    const checkAll = rules ? S.validate(form, rules) : () => true;

    form.addEventListener("submit", (e) => {
      if (e.submitter?.value === "ok" && !checkAll()) e.preventDefault();
    });
    dialog.addEventListener("close", () => {
      resolve(dialog.returnValue === "ok" ? Object.fromEntries(new FormData(form)) : null);
      dialog.remove();
    });

    document.body.append(dialog);
    dialog.showModal();
  });

// The heading and optional explanation at the top of a dialog.
S.dialogTitle = (title, text = "") => `
  <h2 class="text-xl font-bold">${S.esc(title)}</h2>
  ${text && `<p class="text-sm muted">${S.esc(text)}</p>`}`;

// Resolves with the typed reason (when `field` is set), the chosen option, true for a plain confirm, or null.
S.ask = async ({ title, text = "", field = "", options = null, confirm = "Confirm", danger = false }) => {
  const last = options && options.length - 1;
  const choices = options && `
    <div class="grid grid-flow-col gap-2">
      ${options.map((option, i) => S.ui.choice("answer", option, option, { checked: i === last })).join("")}
    </div>`;
  const reason = field && `
    <div data-field>
      <textarea name="answer" class="input" placeholder="${S.esc(field)}"></textarea>
    </div>`;
  const rules = field ? { answer: [[(v) => v.length >= 5, "Add a few words so the other side understands."]] } : null;

  const values = await S.dialog(`
    ${S.dialogTitle(title, text)}
    ${choices || reason || ""}
    ${S.ui.dialogButtons(S.esc(confirm), danger)}`, rules);

  return values && (values.answer?.trim() || true);
};

// Sends a problem with a listing to the admin queue.
S.reportProblem = async (listingId) => {
  const reason = await S.ask({
    title: "Report a problem",
    text: `Listing ${listingId}`,
    field: "What went wrong?",
    confirm: "Send report",
  });
  if (!reason) return;
  S.db.insert("reports", {
    id: S.uid("RP"),
    listingId,
    by: S.session.get().id,
    reason,
    status: "open",
    date: new Date().toISOString(),
  });
  S.toast("Report sent. An admin will look into it.");
};
