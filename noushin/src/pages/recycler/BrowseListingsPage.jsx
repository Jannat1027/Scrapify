import { useState } from "react";
import Button from "../../components/Button.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ListingCard from "../../components/ListingCard.jsx";
import ListingDetailsDialog from "../../components/ListingDetailsDialog.jsx";
import SearchInput from "../../components/SearchInput.jsx";
import SelectFilter from "../../components/SelectFilter.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { formatTaka } from "../../utils/format.js";

const EMPTY_FILTERS = { search: "", type: "", condition: "", place: "", minKg: "" };

export default function BrowseListingsPage() {
  const { data, claimListing } = useData();
  const showToast = useToast();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [detailsListing, setDetailsListing] = useState(null);
  const [claimingListing, setClaimingListing] = useState(null);

  function handleFilterChange(event) {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  }

  function matchesFilters(listing) {
    const query = filters.search.trim().toLowerCase();
    if (listing.status !== "available") return false;
    if (query && !`${listing.id} ${listing.location}`.toLowerCase().includes(query)) return false;
    if (filters.type && listing.category !== filters.type) return false;
    if (filters.condition && listing.condition !== filters.condition) return false;
    if (filters.place && listing.location !== filters.place) return false;
    if (listing.weight < (Number(filters.minKg) || 0)) return false;
    return true;
  }

  async function confirmClaim() {
    if (await claimListing(claimingListing.id)) showToast("Batch claimed. You'll find it under My claims.");
  }

  const shownListings = data.listings.filter(matchesFilters);
  const hasFilters = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse listings</h1>
          <p className="text-ink/60">Graded batches from verified collection points. Fixed prices, first to claim wins.</p>
        </div>
        <p className="badge tone-green">{`${shownListings.length} available`}</p>
      </div>

      <div className="glass grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_140px]">
        <SearchInput
          value={filters.search}
          onChange={(value) => setFilters({ ...filters, search: value })}
          placeholder="Search ID or location"
        />
        <SelectFilter name="type" value={filters.type} onChange={handleFilterChange} allLabel="All plastic types" options={data.categories} />
        <SelectFilter name="condition" value={filters.condition} onChange={handleFilterChange} allLabel="Any condition" options={data.conditions} />
        <SelectFilter name="place" value={filters.place} onChange={handleFilterChange} allLabel="All locations" options={data.locations} />
        <input name="minKg" type="number" min="0" className="input" placeholder="Min kg" value={filters.minKg} onChange={handleFilterChange} />
      </div>
      {hasFilters && (
        <Button size="sm" variant="ghost" icon="x" className="w-fit" onClick={() => setFilters(EMPTY_FILTERS)}>
          Clear filters
        </Button>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {shownListings.length === 0 && <EmptyState icon="search-x" text="No batches match these filters right now." inGlass />}
        {shownListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing}>
            <Button size="sm" icon="eye" className="flex-1" onClick={() => setDetailsListing(listing)}>
              Details
            </Button>
            <Button size="sm" variant="primary" icon="hand-coins" className="flex-1" onClick={() => setClaimingListing(listing)}>
              Claim batch
            </Button>
          </ListingCard>
        ))}
      </div>

      {detailsListing && (
        <ListingDetailsDialog
          listing={detailsListing}
          onClose={() => setDetailsListing(null)}
          onClaim={() => {
            setDetailsListing(null);
            setClaimingListing(detailsListing);
          }}
        />
      )}
      {claimingListing && (
        <ConfirmDialog
          title="Claim this batch?"
          text={`${claimingListing.weight} kg for ${formatTaka(claimingListing.price)}. The operator is notified straight away.`}
          confirmLabel="Claim batch"
          onConfirm={confirmClaim}
          onClose={() => setClaimingListing(null)}
        />
      )}
    </>
  );
}
