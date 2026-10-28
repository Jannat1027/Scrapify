import { useData } from "../context/DataContext.jsx";
import { conditionName, findCategory, findUser } from "../services/marketplace.js";
import { formatDate, formatTaka } from "../utils/format.js";
import Button from "./Button.jsx";
import CompositionBars from "./CompositionBars.jsx";
import ConfidenceBadge from "./ConfidenceBadge.jsx";
import Modal from "./Modal.jsx";
import PlasticThumb from "./PlasticThumb.jsx";

// Everything a recycler wants to know about one batch before claiming it.
export default function ListingDetailsDialog({ listing, onClaim, onClose }) {
  const { data } = useData();
  const scan = data.scans.find((item) => item.id === listing.scanId);
  const operator = findUser(data, listing.operatorId);
  const perKg = formatTaka(listing.price / listing.weight);

  return (
    <Modal onClose={onClose} wide>
      <div className="grid gap-4">
        <div className="grid gap-6 sm:grid-cols-2">
          <PlasticThumb categoryId={listing.category} height="100%" photo={scan?.image} className="min-h-48" />
          <div>
            <p className="text-xs text-ink/60">{`${listing.id} · ${formatDate(listing.created)}`}</p>
            <h2 className="text-[1.5rem] font-bold">{findCategory(data, listing.category).name}</h2>
            <p className="mt-1 text-[1.875rem] font-extrabold text-gradient">{formatTaka(listing.price)}</p>
            <p className="text-sm text-ink/60">{`${listing.weight} kg · ${conditionName(data, listing.condition)} · ${perKg}/kg`}</p>
            <div className="rounded-xl border border-ink/10 bg-white/60 p-3 mt-5 text-sm">
              <p className="font-semibold">{operator.org}</p>
              <p className="text-ink/60">{`${listing.location} · ★ ${listing.operator?.rating ?? "New"}`}</p>
            </div>
          </div>
        </div>

        {scan && (
          <>
            <h3 className="font-semibold inline-flex flex-wrap items-center gap-2">
              AI composition <ConfidenceBadge confidence={scan.confidence} />
            </h3>
            <CompositionBars composition={scan.composition} />
          </>
        )}

        <div className="flex flex-wrap justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon="hand-coins" onClick={onClaim} disabled={listing.status !== "available"}>
            Claim batch
          </Button>
        </div>
      </div>
    </Modal>
  );
}
