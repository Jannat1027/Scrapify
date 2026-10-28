import { useState } from "react";
import Button from "../../components/Button.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import DataTable from "../../components/DataTable.jsx";
import PillTabs from "../../components/PillTabs.jsx";
import SearchInput from "../../components/SearchInput.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import api from "../../services/api.js";
import { useData } from "../../context/DataContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { ROLE_LABELS, STATUS_LABELS } from "../../services/marketplace.js";
import { formatDate } from "../../utils/format.js";

const TABS = [
  { value: "pending", label: "Pending approval", test: (user) => user.status === "pending" },
  { value: "operator", label: "Operators", test: (user) => user.role === "operator" },
  { value: "recycler", label: "Recyclers", test: (user) => user.role === "recycler" },
];

// Which status changes make sense from each status.
const NEXT_STATUSES = {
  pending: ["approved", "suspended"],
  approved: ["flagged", "suspended"],
  flagged: ["approved", "suspended"],
  suspended: ["approved"],
};

// How each action button looks. Actions with a note ask the admin to write a reason first.
const ACTIONS = {
  approved: { label: "Approve", icon: "check", variant: "primary" },
  flagged: { label: "Flag", icon: "flag", variant: "", note: "The account stays active but is marked for review." },
  suspended: { label: "Suspend", icon: "ban", variant: "danger", note: "They won't be able to log in until approved again." },
};

// Admin: approve, flag or suspend operator and recycler accounts.
export default function ManageUsersPage() {
  const { data, send } = useData();
  const showToast = useToast();
  const [currentTab, setCurrentTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [pendingChange, setPendingChange] = useState(null); // { user, newStatus } waiting for a note

  const traders = data.users.filter((user) => user.role !== "admin");
  const inTab = (tabValue) => traders.filter(TABS.find((tab) => tab.value === tabValue).test);
  const query = search.trim().toLowerCase();
  const shownUsers = inTab(currentTab).filter((user) =>
    `${user.name} ${user.org} ${user.email}`.toLowerCase().includes(query),
  );

  async function changeStatus(user, newStatus, note = "") {
    const body = note ? { status: newStatus, note } : { status: newStatus };
    if (await send(() => api.patch(`/admin/users/${user.id}/status`, body))) {
      showToast(`${user.org} is now ${STATUS_LABELS[newStatus].toLowerCase()}.`);
    }
  }

  // Approving happens at once; flagging and suspending first ask for a note for the audit log.
  function handleActionClick(user, newStatus) {
    if (ACTIONS[newStatus].note) setPendingChange({ user, newStatus });
    else changeStatus(user, newStatus);
  }

  const columns = [
    {
      label: "Account",
      render: (user) => (
        <>
          <p className="font-semibold">{user.org}</p>
          <p className="text-xs text-ink/60">{`${user.name} · ${user.email}`}</p>
        </>
      ),
    },
    { label: "Role", render: (user) => ROLE_LABELS[user.role] },
    { label: "Location", render: (user) => user.location },
    { label: "Joined", render: (user) => formatDate(user.joined) },
    { label: "Status", render: (user) => <StatusBadge status={user.status} /> },
    {
      label: "",
      render: (user) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {NEXT_STATUSES[user.status].map((newStatus) => (
            <Button
              key={newStatus}
              size="sm"
              variant={ACTIONS[newStatus].variant}
              icon={ACTIONS[newStatus].icon}
              onClick={() => handleActionClick(user, newStatus)}
            >
              {ACTIONS[newStatus].label}
            </Button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="px-1">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-ink/60">Verify new operators and recyclers, and act on accounts that cause problems.</p>
      </div>

      <section className="panel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <PillTabs
            tabs={TABS.map((tab) => ({ value: tab.value, label: tab.label, count: inTab(tab.value).length }))}
            current={currentTab}
            onChange={setCurrentTab}
            label="Filter users"
          />
          <SearchInput value={search} onChange={setSearch} placeholder="Search name, shop or email" className="w-full" />
        </div>
        <div className="mt-5">
          <DataTable
            columns={columns}
            rows={shownUsers}
            emptyText={currentTab === "pending" ? "No accounts are waiting for approval." : "No users match your search."}
          />
        </div>
      </section>

      {pendingChange && (
        <ConfirmDialog
          title={`${ACTIONS[pendingChange.newStatus].label} ${pendingChange.user.org}?`}
          text={ACTIONS[pendingChange.newStatus].note}
          reasonPlaceholder="Note for the audit log"
          confirmLabel={ACTIONS[pendingChange.newStatus].label}
          danger={pendingChange.newStatus === "suspended"}
          onConfirm={(note) => changeStatus(pendingChange.user, pendingChange.newStatus, note)}
          onClose={() => setPendingChange(null)}
        />
      )}
    </>
  );
}
