// Admin: approve, flag or suspend operator and recycler accounts.
const search = S.$("#search");
let currentTab = "pending";

const TABS = {
  pending: { label: "Pending approval", test: (user) => user.status === "pending" },
  operator: { label: "Operators", test: (user) => user.role === "operator" },
  recycler: { label: "Recyclers", test: (user) => user.role === "recycler" },
};
const traders = () => S.db.where("users", (user) => user.role !== "admin");
const inTab = (tab) => traders().filter(TABS[tab].test);

// The status changes that make sense from each status, and how each action button looks.
const NEXT = {
  pending: ["approved", "suspended"],
  approved: ["flagged", "suspended"],
  flagged: ["approved", "suspended"],
  suspended: ["approved"],
};
const ACTIONS = {
  approved: { key: "act.approve", icon: "check", style: "btn-primary" },
  flagged: { key: "act.flag", icon: "flag", style: "", note: "The account stays active but is marked for review." },
  suspended: {
    key: "act.suspend", icon: "ban", style: "btn-danger", note: "They won't be able to log in until approved again.",
  },
};

const account = (user) => `
  <p class="font-semibold">${S.esc(user.org)}</p>
  <p class="text-xs muted">${S.esc(user.name)} · ${S.esc(user.email)}</p>`;

const actionButtons = (user) => {
  const buttons = NEXT[user.status].map((status) => {
    const { key, icon, style } = ACTIONS[status];
    return S.ui.action(status, user.id, S.t(key), icon, style);
  });
  return `<div class="flex justify-end gap-2">${buttons.join("")}</div>`;
};

const COLUMNS = [
  { label: "Account", cell: account },
  { label: "Role", cell: (user) => S.t(`role.${user.role}`) },
  { label: "Location", cell: (user) => S.esc(user.location) },
  { label: "Joined", cell: (user) => S.date(user.joined) },
  { label: "Status", cell: (user) => S.ui.badge(user.status) },
  { label: "", cell: actionButtons },
];

function renderTable(tab = currentTab) {
  currentTab = tab;
  const query = search.value.trim().toLowerCase();
  const found = (user) => `${user.name} ${user.org} ${user.email}`.toLowerCase().includes(query);
  const empty = tab === "pending" ? "No accounts are waiting for approval." : "No users match your search.";
  S.render(S.$("#table"), S.ui.table(COLUMNS, inTab(tab).filter(found), empty));
}

const redraw = S.ui.tabs(S.$("#tabs"), Object.keys(TABS),
  { label: (tab) => TABS[tab].label, count: (tab) => inTab(tab).length }, renderTable);
search.addEventListener("input", () => renderTable());

// Approving is instant. Flagging or suspending asks for a note for the audit log.
const changeStatus = (status) => async (id) => {
  const user = S.user(id);
  const { key, note } = ACTIONS[status];
  const update = { status };
  if (note) {
    update.note = await S.ask({
      title: `${S.t(key)} ${user.org}?`,
      text: note,
      field: "Note for the audit log",
      confirm: S.t(key),
      danger: status === "suspended",
    });
    if (!update.note) return;
  }
  S.db.update("users", id, update);
  S.toast(`${user.org} is now ${S.t(`status.${status}`).toLowerCase()}.`);
  redraw();
};

S.onAction(S.$("#table"), Object.fromEntries(Object.keys(ACTIONS).map((status) => [status, changeStatus(status)])));
