import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Icon from "../../components/Icon.jsx";
import ListingCard from "../../components/ListingCard.jsx";
import MeterList from "../../components/MeterList.jsx";
import PillTabs from "../../components/PillTabs.jsx";
import ReportProblemDialog from "../../components/ReportProblemDialog.jsx";
import StatCard from "../../components/StatCard.jsx";
import Stars from "../../components/Stars.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { findCategory } from "../../services/marketplace.js";
import { formatTaka } from "../../utils/format.js";

const TABS = [
  { value: "claimed", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];
const GREEN_FADE = "linear-gradient(90deg, #3f9e74, #a7d7b8)";

function sumOf(items, key) {
  return items.reduce((total, item) => total + item[key], 0);
}

// Recycler: batches this buyer has claimed, plus where their plastic comes from.
export default function MyClaimsPage() {
  const { user } = useAuth();
  const { data, updateRow } = useData();
  const showToast = useToast();
  const [currentTab, setCurrentTab] = useState("claimed");
  // Which dialog is open: null or { type: "complete" | "cancel" | "rate" | "report", listingId }
  const [dialog, setDialog] = useState(null);

  const myClaims = data.listings.filter((listing) => listing.recyclerId === user.id);
  const withStatus = (status) => myClaims.filter((listing) => listing.status === status);
  const completed = withStatus("completed");
  const kgSourced = sumOf(completed, "weight");
  const spent = sumOf(completed, "price");

  // Each change is sent to the server first. A failed one has already shown the server's reason in a toast.
  async function completeClaim(listingId) {
    if (!(await updateRow("listings", listingId, { status: "completed" }))) return;
    showToast("Marked as completed.");
    setDialog({ type: "rate", listingId }); // ask for a rating straight after
  }

  async function cancelClaim(listingId, reason) {
    if (await updateRow("listings", listingId, { status: "cancelled", cancelReason: reason })) {
      showToast("Claim cancelled. The operator has been told why.");
    }
  }

  async function rateOperator(listingId, stars) {
    if (await updateRow("listings", listingId, { rating: Number(stars) })) showToast("Thanks for rating.");
  }

  const openDialog = (type, listingId) => setDialog({ type, listingId });
  const closeDialog = () => setDialog(null);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My claims</h1>
          <p className="text-ink/60">Batches you've claimed, plus where your plastic comes from.</p>
        </div>
        <Link to="/recycler" className="btn btn-primary">
          <Icon name="store" />
          Browse listings
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="package-check" label="Active claims" value={withStatus("claimed").length} hint="Waiting for pickup" />
        <StatCard icon="circle-check-big" label="Completed" value={completed.length} hint="All time" />
        <StatCard icon="weight" label="Plastic sourced" value={`${kgSourced} kg`} hint="Completed batches" />
        <StatCard
          icon="wallet"
          label="Spent"
          value={formatTaka(spent)}
          hint={kgSourced ? `${formatTaka(spent / kgSourced)} per kg on average` : "No purchases yet"}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="panel">
          <h2 className="text-lg font-semibold">Sourced by plastic type</h2>
          <SourcingBars listings={completed} groupBy="category" nameOf={(id) => findCategory(data, id).name} />
        </section>
        <section className="panel">
          <h2 className="text-lg font-semibold">Sourced by location</h2>
          <SourcingBars listings={completed} groupBy="location" nameOf={(place) => place} />
        </section>
      </div>

      <PillTabs
        tabs={TABS.map((tab) => ({ ...tab, count: withStatus(tab.value).length }))}
        current={currentTab}
        onChange={setCurrentTab}
        label="Filter claims"
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {withStatus(currentTab).length === 0 && <EmptyState icon="package-open" text="Nothing in this list." inGlass />}
        {withStatus(currentTab).map((listing) => (
          <ListingCard key={listing.id} listing={listing}>
            <ClaimActions listing={listing} onAction={openDialog} />
          </ListingCard>
        ))}
      </div>

      {dialog?.type === "complete" && (
        <ConfirmDialog
          title="Mark this batch as completed?"
          text="Confirm you have collected the batch and paid the fixed price."
          confirmLabel="Mark completed"
          onConfirm={() => completeClaim(dialog.listingId)}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === "cancel" && (
        <ConfirmDialog
          title="Cancel this claim?"
          text="The operator is notified with your reason."
          reasonPlaceholder="Reason for cancelling"
          confirmLabel="Cancel claim"
          danger
          onConfirm={(reason) => cancelClaim(dialog.listingId, reason)}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === "rate" && (
        <ConfirmDialog
          title="How was this operator?"
          text="Your rating helps other recyclers."
          options={["1", "2", "3", "4", "5"]}
          confirmLabel="Submit rating"
          onConfirm={(stars) => rateOperator(dialog.listingId, stars)}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === "report" && <ReportProblemDialog listingId={dialog.listingId} onClose={closeDialog} />}
    </>
  );
}

// The buttons under a claim card change with its status.
function ClaimActions({ listing, onAction }) {
  if (listing.status === "claimed") {
    return (
      <>
        <Button size="sm" variant="primary" icon="check" onClick={() => onAction("complete", listing.id)}>
          Mark completed
        </Button>
        <Button size="sm" variant="danger" onClick={() => onAction("cancel", listing.id)}>
          Cancel
        </Button>
        <Button size="sm" icon="flag" aria-label="Report a problem" title="Report a problem" onClick={() => onAction("report", listing.id)} />
      </>
    );
  }
  if (listing.status === "completed" && !listing.rating) {
    return (
      <Button size="sm" icon="star" onClick={() => onAction("rate", listing.id)}>
        Rate operator
      </Button>
    );
  }
  if (listing.rating) {
    return (
      <p className="text-sm">
        <Stars count={listing.rating} /> <span className="text-ink/60">your rating</span>
      </p>
    );
  }
  return null;
}

// Kilograms bought, grouped by plastic type or by location.
function SourcingBars({ listings, groupBy, nameOf }) {
  const totalKg = sumOf(listings, "weight");
  const kgByGroup = {};
  listings.forEach((listing) => {
    const group = listing[groupBy];
    kgByGroup[group] = (kgByGroup[group] || 0) + listing.weight;
  });

  const rows = Object.entries(kgByGroup)
    .sort((a, b) => b[1] - a[1])
    .map(([group, kg]) => ({ label: nameOf(group), valueText: `${kg} kg`, percent: (kg / totalKg) * 100, color: GREEN_FADE }));

  if (rows.length === 0) return <p className="text-sm text-ink/60 mt-5">Complete a claim to see your sourcing mix.</p>;
  return (
    <div className="mt-5">
      <MeterList rows={rows} />
    </div>
  );
}
