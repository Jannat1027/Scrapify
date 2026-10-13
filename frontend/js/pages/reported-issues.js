// Admin: disputes raised about listings. Resolve them, or suspend the account at fault.
const reportsWith = (status) => S.db.where("reports", (report) => report.status === status);

// The other party is whoever the reporter traded with on that listing.
const otherPartyId = (report, listing) => (report.by === listing.operatorId ? listing.recyclerId : listing.operatorId);

const party = (label, user) => `
  <div class="well">
    <p class="text-xs muted">${label}</p>
    <p class="font-semibold">${S.esc(user.org)}</p>
    <p class="text-xs muted">${S.t(`role.${user.role}`)} · ${S.ui.badge(user.status)}</p>
  </div>`;

function reportActions(report, other) {
  if (report.status !== "open") {
    return `<p class="text-sm muted">${report.resolution ? `Resolution: ${S.esc(report.resolution)}` : "Resolved"}</p>`;
  }
  const suspend = other && other.status !== "suspended"
    ? S.ui.action("suspend", other.id, `Suspend ${S.esc(other.org)}`, "ban", "btn-danger")
    : "";
  return `
    <div class="flex flex-wrap gap-2">
      ${S.ui.action("resolve", report.id, S.t("act.resolve"), "check", "btn-primary")}${suspend}
    </div>`;
}

function reportCard(report) {
  const listing = S.db.find("listings", report.listingId);
  const otherId = otherPartyId(report, listing);
  const other = otherId && S.user(otherId);
  const batch = `${S.esc(S.cat(listing.category).name)} · ${listing.weight} kg · ${S.taka(listing.price)}`;

  return `
    <article class="glass grid gap-5 p-6 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <div class="flex flex-wrap items-center gap-2">
          ${S.ui.badge(report.status)}
          <span class="text-xs muted">${report.id} · ${S.date(report.date)} · listing ${listing.id}</span>
        </div>
        <p class="mt-3 text-lg">“${S.esc(report.reason)}”</p>
        <p class="mt-2 text-sm muted">${batch} · ${S.ui.badge(listing.status)}</p>
        <div class="mt-5">${reportActions(report, other)}</div>
      </div>
      <div class="grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-1">
        ${party("Reported by", S.user(report.by))}
        ${other ? party("Other party", other) : ""}
      </div>
    </article>`;
}

const EMPTY = { open: "No open reports. All quiet.", resolved: "Nothing resolved yet." };
const redraw = S.ui.tabs(
  S.$("#tabs"),
  ["open", "resolved"],
  { label: (status) => S.t(`status.${status}`), count: (status) => reportsWith(status).length },
  (status) => {
    const reports = reportsWith(status);
    S.render(S.$("#list"), reports.length
      ? reports.map(reportCard).join("")
      : `<div class="glass">${S.ui.empty("shield-check", EMPTY[status])}</div>`);
  },
);

S.onAction(S.$("#list"), {
  async resolve(id) {
    const note = await S.ask({
      title: "Resolve this report",
      text: "Both parties get an email with your note.",
      field: "What was decided?",
      confirm: "Mark resolved",
    });
    if (!note) return;
    S.db.update("reports", id, { status: "resolved", resolution: note });
    S.toast("Report resolved.");
    redraw();
  },
  async suspend(id) {
    const user = S.user(id);
    const confirmed = await S.ask({
      title: `Suspend ${user.org}?`,
      text: "They lose access until an admin approves them again.",
      confirm: "Suspend account",
      danger: true,
    });
    if (!confirmed) return;
    S.db.update("users", id, { status: "suspended" });
    S.toast(`${user.org} suspended.`, "red");
    redraw();
  },
});
