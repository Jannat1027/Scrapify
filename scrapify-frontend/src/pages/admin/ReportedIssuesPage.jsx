import { useState } from "react";
import Button from "../../components/Button.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import PillTabs from "../../components/PillTabs.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { findCategory, findUser, otherPartyId, ROLE_LABELS, STATUS_LABELS } from "../../services/marketplace.js";
import { formatDate, formatTaka } from "../../utils/format.js";

const EMPTY_TEXT = { open: "No open reports. All quiet.", resolved: "Nothing resolved yet." };

// Admin: disputes raised about listings. Resolve them, or suspend the account at fault.
export default function ReportedIssuesPage() {
  const { data, updateRow } = useData();
  const showToast = useToast();
  const [currentTab, setCurrentTab] = useState("open");
  const [resolvingReport, setResolvingReport] = useState(null);
  const [suspendingUser, setSuspendingUser] = useState(null);

  const reportsWith = (status) => data.reports.filter((report) => report.status === status);
  const tabs = ["open", "resolved"].map((status) => ({ value: status, label: STATUS_LABELS[status], count: reportsWith(status).length }));

  function resolveReport(report, note) {
    updateRow("reports", report.id, { status: "resolved", resolution: note });
    showToast("Report resolved.");
  }

  function suspendUser(user) {
    updateRow("users", user.id, { status: "suspended" });
    showToast(`${user.org} suspended.`, "red");
  }

  return (
    <>
      <div className="px-1">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-ink/60">Disputes raised by operators and recyclers. Resolve them or suspend the account at fault.</p>
      </div>

      <PillTabs tabs={tabs} current={currentTab} onChange={setCurrentTab} label="Filter reports" />

      <div className="grid content-start gap-5">
        {reportsWith(currentTab).length === 0 && <EmptyState icon="shield-check" text={EMPTY_TEXT[currentTab]} inGlass />}
        {reportsWith(currentTab).map((report) => (
          <ReportCard key={report.id} report={report} onResolve={setResolvingReport} onSuspend={setSuspendingUser} />
        ))}
      </div>

      {resolvingReport && (
        <ConfirmDialog
          title="Resolve this report"
          text="Both parties get an email with your note."
          reasonPlaceholder="What was decided?"
          confirmLabel="Mark resolved"
          onConfirm={(note) => resolveReport(resolvingReport, note)}
          onClose={() => setResolvingReport(null)}
        />
      )}
      {suspendingUser && (
        <ConfirmDialog
          title={`Suspend ${suspendingUser.org}?`}
          text="They lose access until an admin approves them again."
          confirmLabel="Suspend account"
          danger
          onConfirm={() => suspendUser(suspendingUser)}
          onClose={() => setSuspendingUser(null)}
        />
      )}
    </>
  );
}

function ReportCard({ report, onResolve, onSuspend }) {
  const { data } = useData();
  const listing = data.listings.find((item) => item.id === report.listingId);
  const reporter = findUser(data, report.by);
  const otherId = listing ? otherPartyId(report, listing) : null;
  const otherParty = otherId ? findUser(data, otherId) : null;

  return (
    <article className="glass grid gap-5 p-6 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <div className="inline-flex flex-wrap items-center gap-2">
          <StatusBadge status={report.status} />
          <span className="text-xs text-ink/60">{`${report.id} · ${formatDate(report.date)} · listing ${report.listingId}`}</span>
        </div>
        <p className="mt-3 text-[1.125rem]">{`“${report.reason}”`}</p>
        {listing && (
          <p className="text-sm text-ink/60 inline-flex flex-wrap items-center gap-2 mt-2">
            {`${findCategory(data, listing.category).name} · ${listing.weight} kg · ${formatTaka(listing.price)}`}
            <StatusBadge status={listing.status} />
          </p>
        )}

        <div className="mt-5">
          {report.status === "open" ? (
            <div className="inline-flex flex-wrap items-center gap-2">
              <Button size="sm" variant="primary" icon="check" onClick={() => onResolve(report)}>
                Resolve
              </Button>
              {otherParty && otherParty.status !== "suspended" && (
                <Button size="sm" variant="danger" icon="ban" onClick={() => onSuspend(otherParty)}>
                  {`Suspend ${otherParty.org}`}
                </Button>
              )}
            </div>
          ) : (
            <p className="text-sm text-ink/60">{report.resolution ? `Resolution: ${report.resolution}` : "Resolved"}</p>
          )}
        </div>
      </div>

      <div className="grid content-start gap-3 sm:max-lg:grid-cols-2">
        <PartyBox label="Reported by" user={reporter} />
        {otherParty && <PartyBox label="Other party" user={otherParty} />}
      </div>
    </article>
  );
}

function PartyBox({ label, user }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white/60 p-3">
      <p className="text-xs text-ink/60">{label}</p>
      <p className="font-semibold">{user.org}</p>
      <p className="text-xs text-ink/60 inline-flex flex-wrap items-center gap-2">
        {ROLE_LABELS[user.role]} · <StatusBadge status={user.status} />
      </p>
    </div>
  );
}
