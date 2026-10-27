import { useState } from "react";
import Button from "../../components/Button.jsx";
import CategoryDialog from "../../components/CategoryDialog.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import DataTable from "../../components/DataTable.jsx";
import Icon from "../../components/Icon.jsx";
import Notice from "../../components/Notice.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { categoryColor, findCategory } from "../../services/marketplace.js";
import { findStaleRates, STALE_RATE_DAYS } from "../../services/pricing.js";
import { daysSince, formatDate, nowIso } from "../../utils/format.js";

// The three rates from the category form, as numbers, plus the source and today's date.
function rateFields(values) {
  return {
    clean: Number(values.clean),
    light: Number(values.light),
    heavy: Number(values.heavy),
    source: values.source.trim(),
    updated: nowIso(),
  };
}

// Admin: the ৳/kg rate table, plastic categories and collection locations.
export default function PriceRatesPage() {
  const { data, updateRow, insertRow, removeRow } = useData();
  const showToast = useToast();
  // Typed but not yet saved values, e.g. { "pet.clean": "45" }.
  const [edits, setEdits] = useState({});
  // Which dialog is open: null, { type: "add" }, { type: "edit", rate } or { type: "delete", rate }
  const [dialog, setDialog] = useState(null);

  const staleCount = findStaleRates(data.rates).length;

  function valueShown(rate, conditionId) {
    const key = `${rate.id}.${conditionId}`;
    return key in edits ? edits[key] : String(rate[conditionId]);
  }

  function saveRow(rate) {
    const newRates = {};
    data.conditions.forEach((condition) => (newRates[condition.id] = Number(valueShown(rate, condition.id))));
    const anyInvalid = Object.values(newRates).some((value) => !(value >= 0) || Number.isNaN(value));
    if (anyInvalid) {
      showToast("Rates must be zero or more.", "red");
      return;
    }
    updateRow("rates", rate.id, { ...newRates, updated: nowIso() });

    // Forget the typed values of this row; the saved ones are shown now.
    const remainingEdits = { ...edits };
    data.conditions.forEach((condition) => delete remainingEdits[`${rate.id}.${condition.id}`]);
    setEdits(remainingEdits);
    showToast(`${findCategory(data, rate.id).name} rates saved.`);
  }

  function addCategory(values) {
    const id = values.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (data.categories.some((category) => category.id === id)) {
      showToast("That category already exists.", "red");
      return;
    }
    insertRow("categories", { id, name: values.name.trim(), note: values.note.trim(), icon: "recycle" });
    insertRow("rates", { id, ...rateFields(values) });
    setDialog(null);
    showToast(`${values.name.trim()} added.`);
  }

  // The category keeps its id, so scans and listings that use it keep working after a rename.
  function editCategory(rate, values) {
    updateRow("categories", rate.id, { name: values.name.trim(), note: values.note.trim() });
    updateRow("rates", rate.id, rateFields(values));
    setDialog(null);
    showToast(`${values.name.trim()} saved.`);
  }

  // How many scans and listings use a category. A category in use can't be deleted.
  function timesUsed(categoryId) {
    const scans = data.scans.filter((scan) => scan.composition[categoryId]).length;
    const listings = data.listings.filter((listing) => listing.category === categoryId).length;
    return scans + listings;
  }

  function askToDelete(rate) {
    const uses = timesUsed(rate.id);
    if (uses > 0) {
      showToast(`${findCategory(data, rate.id).name} is used by ${uses} scans and listings, so it can't be deleted.`, "red");
      return;
    }
    setDialog({ type: "delete", rate });
  }

  function deleteCategory(rate) {
    const name = findCategory(data, rate.id).name;
    removeRow("categories", rate.id);
    removeRow("rates", rate.id);
    showToast(`${name} deleted.`);
  }

  const columns = [
    {
      label: "Category",
      render: (rate) => (
        <span className="inline-flex flex-wrap items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ background: categoryColor(rate.id) }} />
          <b>{findCategory(data, rate.id).name}</b>
        </span>
      ),
    },
    ...data.conditions.map((condition) => ({
      label: `${condition.name} ৳`,
      render: (rate) => (
        <input
          className="input h-10 w-24 text-right tabular-nums"
          type="number"
          min="0"
          aria-label={`${condition.name} rate`}
          value={valueShown(rate, condition.id)}
          onChange={(event) => setEdits({ ...edits, [`${rate.id}.${condition.id}`]: event.target.value })}
        />
      ),
    })),
    { label: "Source", render: (rate) => <span className="text-sm text-ink/60">{rate.source}</span> },
    {
      label: "Last updated",
      render: (rate) => {
        const age = daysSince(rate.updated);
        return age > STALE_RATE_DAYS ? <span className="badge tone-amber">{`${age} days ago`}</span> : formatDate(rate.updated);
      },
    },
    {
      label: "",
      render: (rate) => (
        <div className="inline-flex flex-wrap items-center gap-2">
          <Button size="sm" icon="save" onClick={() => saveRow(rate)}>
            Save changes
          </Button>
          <Button size="sm" icon="pencil" aria-label="Edit category" title="Edit category" onClick={() => setDialog({ type: "edit", rate })} />
          <Button size="sm" variant="danger" icon="trash" aria-label="Delete category" title="Delete category" onClick={() => askToDelete(rate)} />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Price rates</h1>
          <p className="text-ink/60">৳ per kg by plastic type and condition. Every estimate on the platform uses this table.</p>
        </div>
        <Button variant="primary" icon="plus" onClick={() => setDialog({ type: "add" })}>
          Add category
        </Button>
      </div>

      {staleCount > 0 && (
        <Notice
          title={`${staleCount} rate${staleCount > 1 ? "s are" : " is"} out of date.`}
          text="Operators see a warning on these until you update them."
        />
      )}

      <section className="panel">
        <DataTable columns={columns} rows={data.rates} />
        <p className="text-xs text-ink/60 mt-5">
          <span>{`Rates older than ${STALE_RATE_DAYS} days are flagged to operators so they know an estimate may be off.`}</span>{" "}
          <span>A category that scans or listings already use can be renamed but not deleted.</span>
        </p>
      </section>

      <LocationsPanel />

      {dialog?.type === "add" && <CategoryDialog onSave={addCategory} onClose={() => setDialog(null)} />}
      {dialog?.type === "edit" && (
        <CategoryDialog
          category={findCategory(data, dialog.rate.id)}
          rate={dialog.rate}
          onSave={(values) => editCategory(dialog.rate, values)}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.type === "delete" && (
        <ConfirmDialog
          title={`Delete ${findCategory(data, dialog.rate.id).name}?`}
          text="The category and its rates are removed. No scans or listings use it."
          confirmLabel="Delete category"
          danger
          onConfirm={() => deleteCategory(dialog.rate)}
          onClose={() => setDialog(null)}
        />
      )}
    </>
  );
}

// The list of collection areas, used in sign-up and the recycler filters.
function LocationsPanel() {
  const { data, insertRow, removeRow } = useData();
  const showToast = useToast();
  const [newPlace, setNewPlace] = useState("");
  const [placeToRemove, setPlaceToRemove] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    const place = newPlace.trim();
    if (place.length < 3) {
      showToast("Enter a location of at least 3 characters.", "red");
      return;
    }
    if (data.locations.includes(place)) {
      showToast("That location is already listed.", "red");
      return;
    }
    insertRow("locations", place);
    setNewPlace("");
    showToast(`${place} added.`);
  }

  function removePlace(place) {
    removeRow("locations", place);
    showToast(`${place} removed.`);
  }

  return (
    <section className="panel">
      <h2 className="text-lg font-semibold">Collection locations</h2>
      <p className="text-sm text-ink/60">Shown in sign-up, listings and recycler filters.</p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {data.locations.map((place) => (
          <li key={place} className="badge tone-blue px-2.5 py-1.5 text-[0.875rem] before:hidden">
            <Icon name="map-pin" />
            {place}
            <button type="button" className="ml-0.5 grid h-5 w-5 place-items-center rounded-full opacity-60 hover:bg-sky-400/20 hover:opacity-100" aria-label={`Remove ${place}`} title="Remove" onClick={() => setPlaceToRemove(place)}>
              <Icon name="x" />
            </button>
          </li>
        ))}
      </ul>
      <form className="mt-5 flex max-w-md gap-2" onSubmit={handleSubmit}>
        <input
          className="input"
          placeholder="e.g. Tongi, Gazipur"
          value={newPlace}
          onChange={(event) => setNewPlace(event.target.value)}
        />
        <Button type="submit">Add</Button>
      </form>

      {placeToRemove && (
        <ConfirmDialog
          title={`Remove ${placeToRemove}?`}
          text="It disappears from sign-up and the recycler filters. Existing users and listings keep their location."
          confirmLabel="Remove location"
          danger
          onConfirm={() => removePlace(placeToRemove)}
          onClose={() => setPlaceToRemove(null)}
        />
      )}
    </section>
  );
}
