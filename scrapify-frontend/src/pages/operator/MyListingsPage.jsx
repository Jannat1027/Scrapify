import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Icon from "../../components/Icon.jsx";
import ListingCard from "../../components/ListingCard.jsx";
import PillTabs from "../../components/PillTabs.jsx";
import ReportProblemDialog from "../../components/ReportProblemDialog.jsx";
import Stars from "../../components/Stars.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { findUser, STATUS_LABELS } from "../../services/marketplace.js";

const STATUSES = ["all", "available", "claimed", "completed", "cancelled"];

// Operator: every batch this shop has listed, filtered by status.
export default function MyListingsPage() {
  const { user } = useAuth();
  const { data, updateRow } = useData();
  const showToast = useToast();
  const [currentTab, setCurrentTab] = useState("all");
  // Which dialog is open: null, { type: "cancel", listingId } or { type: "report", listingId }
  const [dialog, setDialog] = useState(null);

  const myListings = data.listings.filter((listing) => listing.operatorId === user.id);
  const withStatus = (status) => myListings.filter((listing) => status === "all" || listing.status === status);
  const tabs = STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status], count: withStatus(status).length }));
  const shownListings = withStatus(currentTab);

  function cancelListing(listingId, reason) {
    updateRow("listings", listingId, { status: "cancelled", cancelReason: reason });
    showToast("Listing cancelled.");
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My listings</h1>
          <p className="text-ink/60">Batches you've put on the market and where each one stands.</p>
        </div>
        <Link to="/operator/new-scan" className="btn btn-primary">
          <Icon name="plus" />
          New scan
        </Link>
      </div>

      <PillTabs tabs={tabs} current={currentTab} onChange={setCurrentTab} label="Filter by status" />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {shownListings.length === 0 && <EmptyState icon="tags" text="No listings here yet." inGlass />}
        {shownListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing}>
            <ListingNote listing={listing} />
            {listing.status === "available" ? (
              <Button size="sm" variant="danger" icon="x" onClick={() => setDialog({ type: "cancel", listingId: listing.id })}>
                Cancel
              </Button>
            ) : (
              <Button size="sm" icon="flag" onClick={() => setDialog({ type: "report", listingId: listing.id })}>
                Report a problem
              </Button>
            )}
          </ListingCard>
        ))}
      </div>

      {dialog?.type === "cancel" && (
        <ConfirmDialog
          title="Cancel this listing?"
          text="Recyclers will no longer see it."
          reasonPlaceholder="Why are you cancelling?"
          confirmLabel="Cancel listing"
          danger
          onConfirm={(reason) => cancelListing(dialog.listingId, reason)}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.type === "report" && <ReportProblemDialog listingId={dialog.listingId} onClose={() => setDialog(null)} />}
    </>
  );
}

// The line under each card that says what happened to the batch.
function ListingNote({ listing }) {
  const { data } = useData();
  const buyer = listing.recyclerId ? findUser(data, listing.recyclerId).org : "";

  let note = null;
  if (listing.status === "claimed") {
    note = (
      <>
        Claimed by <b>{buyer}</b> · waiting for pickup
      </>
    );
  } else if (listing.status === "completed" && listing.rating) {
    note = (
      <>
        Rated <Stars count={listing.rating} /> by {buyer}
      </>
    );
  } else if (listing.status === "completed") {
    note = `Completed with ${buyer}`;
  }

  return note ? <p className="w-full text-xs text-ink/60">{note}</p> : null;
}
