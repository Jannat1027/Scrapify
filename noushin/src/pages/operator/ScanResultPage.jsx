import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button.jsx";
import ChoiceTile from "../../components/ChoiceTile.jsx";
import CompositionBars from "../../components/CompositionBars.jsx";
import ConfidenceBadge from "../../components/ConfidenceBadge.jsx";
import DataTable from "../../components/DataTable.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Fact from "../../components/Fact.jsx";
import Icon from "../../components/Icon.jsx";
import ListForSaleDialog from "../../components/ListForSaleDialog.jsx";
import Numpad from "../../components/Numpad.jsx";
import PlasticThumb from "../../components/PlasticThumb.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import {
  conditionName,
  createListing,
  createScan,
  describeGrading,
  findCategory,
  PHOTO_QUALITY_LABELS,
} from "../../services/marketplace.js";
import { calculatePrice, LOW_CONFIDENCE, mainCategoryOf } from "../../services/pricing.js";
import { loadFromStorage, removeFromStorage, STORAGE_KEYS } from "../../services/storage.js";
import { formatDate, formatPriceRange, formatTaka } from "../../utils/format.js";

// Operator: the AI result for one batch, a weight keypad, the price breakdown and "List for sale".
//   /operator/scans/new      -> the fresh draft from New scan (can be corrected, saved and listed)
//   /operator/scans/SC-1042  -> a saved scan from the history (can be listed if it isn't yet)
export default function ScanResultPage() {
  const { scanId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const showToast = useToast();
  const { user } = useAuth();
  const { data, insertRow } = useData();

  const isDraft = scanId === "new";
  // Only the draft can change on this page (manual correction), so only the draft lives in state.
  const [draft, setDraft] = useState(
    () => location.state?.draftScan || loadFromStorage(STORAGE_KEYS.draftScan, null),
  );
  const [weightText, setWeightText] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [showManualPicker, setShowManualPicker] = useState(false);
  const [showListDialog, setShowListDialog] = useState(false);

  const savedScan = data.scans.find((item) => item.id === scanId && item.operatorId === user.id);
  const scan = isDraft ? draft : savedScan;

  if (isDraft && !scan) return <Navigate to="/operator/new-scan" replace />;
  if (!scan) {
    return (
      <div className="glass">
        <EmptyState icon="search-x" text={`No scan called ${scanId} was found at your collection point.`} />
      </div>
    );
  }

  const weight = isDraft ? parseFloat(weightText) || 0 : scan.weight;
  const price = calculatePrice({ ...scan, weight }, data.rates);
  const mainTypeName = findCategory(data, mainCategoryOf(scan.composition)).name;
  const savedListing = isDraft ? null : data.listings.find((item) => item.scanId === scan.id);

  // A fresh draft the AI isn't sure about must be checked before it can be saved or listed.
  const unsure = scan.confidence < LOW_CONFIDENCE || scan.quality !== "good";
  const needsReview = isDraft && unsure && !scan.corrected && !reviewed;
  const canSaveDraft = weight > 0 && !needsReview;

  // The operator's choice replaces the AI's. The AI's first answer is kept in aiResult (the correction log).
  function applyManualChoice(categoryId, condition) {
    const aiResult = draft.aiResult || { composition: draft.composition, condition: draft.condition };
    setDraft({ ...draft, composition: { [categoryId]: 100 }, condition, corrected: true, aiResult });
    setShowManualPicker(false);
  }

  // Saves the draft to the scan history and returns the saved scan.
  function saveDraftScan() {
    const newScan = createScan(draft, user, weight);
    insertRow("scans", newScan);
    removeFromStorage(STORAGE_KEYS.draftScan);
    return newScan;
  }

  function saveWithoutListing() {
    const newScan = saveDraftScan();
    showToast("Scan saved to your history. You can list it later.");
    navigate(`/operator/scans/${newScan.id}`, { replace: true });
  }

  function publishListing(fixedPrice) {
    const scanToList = isDraft ? saveDraftScan() : scan;
    insertRow("listings", createListing(scanToList, fixedPrice));
    showToast("Batch listed. Verified recyclers can see it now.");
    navigate("/operator/listings");
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <Link to="/operator/history" className="text-sm text-ink/60 hover:text-ink">
            ← Scan history
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{isDraft ? "New scan" : scan.id}</h1>
        </div>
        <div className="inline-flex flex-wrap items-center gap-2">
          <ConfidenceBadge confidence={scan.confidence} />
          {scan.corrected && <span className="badge tone-violet">Corrected by you</span>}
        </div>
      </div>

      {needsReview && (
        <LowConfidencePanel
          scan={scan}
          onConfirm={() => setReviewed(true)}
          onChooseManually={() => setShowManualPicker(true)}
        />
      )}

      {showManualPicker && <ManualPicker onApply={applyManualChoice} />}

      <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        <section className="panel">
          {scan.image ? (
            <img src={scan.image} alt="Photo of the batch" className="max-h-80 w-full rounded-2xl object-cover" />
          ) : (
            <PlasticThumb categoryId={mainCategoryOf(scan.composition)} height={224} />
          )}
          <h2 className="text-lg font-semibold mt-5">What the AI sees</h2>
          <div className="mt-2">
            <CompositionBars composition={scan.composition} />
          </div>
          <dl className="grid grid-cols-2 gap-3 text-[0.875rem] mt-5">
            <Fact boxed label="Condition" value={conditionName(data, scan.condition)} />
            <Fact boxed label="Photo" value={PHOTO_QUALITY_LABELS[scan.quality]} />
            <Fact boxed label="Scanned" value={formatDate(scan.date)} />
            <Fact boxed label="Main type" value={mainTypeName} />
          </dl>
          {scan.aiResult && (
            <p className="mt-5 flex gap-2 rounded-xl border border-violet-400/35 bg-violet-400/[.08] p-3 text-sm">
              <Icon name="hand" className="mt-[0.15rem] text-violet-700" />
              <span>
                <b>Corrected by the operator.</b> {`The AI first said ${describeGrading(data, scan.aiResult)}; changed to ${describeGrading(data, scan)}.`}
              </span>
            </p>
          )}
          <p className="rounded-xl border border-ink/10 bg-white/60 p-3 mt-6 flex gap-2 text-xs text-ink/60">
            <Icon name="info" />
            AI grading is an estimate. Check the result before you list the batch. (In this demo the grading is
            simulated, not a real AI model.)
          </p>
        </section>

        <div className="grid content-start gap-5">
          {isDraft && (
            <section className="panel">
              <h2 className="text-lg font-semibold">Weight (kg)</h2>
              <p className="mt-3 rounded-2xl border border-ink/10 bg-white/60 px-5 py-3 text-right text-[2.25rem] font-bold tabular-nums">{weightText || "0"}</p>
              <Numpad text={weightText} onChange={setWeightText} />
            </section>
          )}

          <section className="panel">
            <p className="text-sm text-ink/60">Estimated price</p>
            <p className="text-[2.25rem] font-extrabold leading-[1.2] tracking-tight text-gradient">
              {weight ? formatPriceRange(price) : "Enter weight"}
            </p>
            <div className="mt-5">
              <PriceBreakdown lines={weight ? price.lines : []} />
            </div>

            {savedListing ? (
              <p className="text-sm text-ink/60 text-center mt-5 flex flex-wrap items-center justify-center gap-3">
                Listed as{" "}
                <Link className="link" to="/operator/listings">
                  {savedListing.id}
                </Link>{" "}
                · <StatusBadge status={savedListing.status} />
              </p>
            ) : (
              <>
                {!isDraft && <p className="text-sm text-ink/60 text-center mt-5">This scan is not listed yet.</p>}
                <Button
                  variant="primary"
                  size="lg"
                  icon="tag"
                  className="w-full mt-5"
                  disabled={isDraft && !canSaveDraft}
                  onClick={() => setShowListDialog(true)}
                >
                  List for sale
                </Button>
                {isDraft && (
                  <Button icon="save" className="w-full mt-2" disabled={!canSaveDraft} onClick={saveWithoutListing}>
                    Save to history without listing
                  </Button>
                )}
                {needsReview && <p className="text-xs text-ink/60 text-center mt-2">Check the AI result above first.</p>}
              </>
            )}
          </section>
        </div>
      </div>

      {showListDialog && (
        <ListForSaleDialog
          weight={weight}
          typeName={mainTypeName}
          price={price}
          onPublish={publishListing}
          onClose={() => setShowListDialog(false)}
        />
      )}
    </>
  );
}

// Asks the operator to confirm, retake or correct a result the AI is unsure about.
function LowConfidencePanel({ scan, onConfirm, onChooseManually }) {
  const reason =
    scan.quality !== "good"
      ? `The photo looks ${scan.quality}. A retake usually fixes this.`
      : `Confidence is only ${Math.round(scan.confidence * 100)}%. Confirm or pick the plastic yourself.`;

  return (
    <section className="glass border-amber-400/30 bg-amber-400/5 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="icon-tile border-amber-400/30 bg-amber-400/10 text-amber-700">
          <Icon name="circle-help" />
        </span>
        <div>
          <h2 className="text-lg font-semibold">We're not sure about this batch</h2>
          <p className="text-sm text-ink/60">{reason}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <button type="button" className="btn h-20 flex-col gap-1 rounded-2xl text-[1rem]" onClick={onConfirm}>
          <Icon name="thumbs-up" />
          Looks right
        </button>
        <Link to="/operator/new-scan" className="btn h-20 flex-col gap-1 rounded-2xl text-[1rem]">
          <Icon name="camera" />
          Retake photo
        </Link>
        <button type="button" className="btn h-20 flex-col gap-1 rounded-2xl text-[1rem]" onClick={onChooseManually}>
          <Icon name="hand" />
          Choose manually
        </button>
      </div>
    </section>
  );
}

// Lets the operator replace the AI result with their own choice of plastic type and condition.
function ManualPicker({ onApply }) {
  const { data } = useData();
  const showToast = useToast();
  const [categoryId, setCategoryId] = useState("");
  const [condition, setCondition] = useState("");

  function handleApply() {
    if (!categoryId || !condition) {
      showToast("Pick a plastic type and a condition.", "red");
      return;
    }
    onApply(categoryId, condition);
  }

  return (
    <section className="panel">
      <h2 className="text-lg font-semibold">Choose the plastic yourself</h2>
      <p className="text-sm text-ink/60">Your choice replaces the AI estimate and is logged for accuracy review.</p>

      <p className="label mt-5">Main plastic type</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {data.categories.map((category) => (
          <ChoiceTile
            key={category.id}
            name="manualType"
            value={category.id}
            checked={categoryId === category.id}
            onChange={() => setCategoryId(category.id)}
            label={category.name}
            icon={category.icon}
          />
        ))}
      </div>

      <p className="label mt-5">Condition</p>
      <div className="grid grid-cols-3 gap-3">
        {data.conditions.map((item) => (
          <ChoiceTile
            key={item.id}
            name="manualCondition"
            value={item.id}
            checked={condition === item.id}
            onChange={() => setCondition(item.id)}
            label={item.name}
          />
        ))}
      </div>

      <Button variant="primary" className="mt-5" onClick={handleApply}>
        Use my selection
      </Button>
    </section>
  );
}

// Line by line: how many kg of each type, at which rate, for how much.
function PriceBreakdown({ lines }) {
  const { data } = useData();
  const columns = [
    { label: "Type", render: (line) => findCategory(data, line.categoryId).name },
    { label: "Kg", render: (line) => line.kg.toFixed(1) },
    { label: "Rate", render: (line) => formatTaka(line.rate) },
    { label: "Amount", render: (line) => <b>{formatTaka(line.amount)}</b> },
  ];
  const rows = lines.map((line) => ({ ...line, id: line.categoryId }));
  return <DataTable columns={columns} rows={rows} emptyText="Enter the weight to see the breakdown." />;
}
