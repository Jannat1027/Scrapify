import { useData } from "../context/DataContext.jsx";
import { conditionName, findCategory } from "../services/marketplace.js";
import { formatDate, formatTaka } from "../utils/format.js";
import Fact from "./Fact.jsx";
import Icon from "./Icon.jsx";
import PlasticThumb from "./PlasticThumb.jsx";
import StatusBadge from "./StatusBadge.jsx";

export default function ListingCard({ listing, children }) {
  const { data } = useData();
  const category = findCategory(data, listing.category);
  const scan = data.scans.find((item) => item.id === listing.scanId);

  return (
    <article className="glass lift flex flex-col gap-4 p-4">
      <PlasticThumb categoryId={listing.category} photo={listing.photo || scan?.image} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{category.name}</h3>
          <p className="text-xs text-ink/60">
            {listing.id} · {conditionName(data, listing.condition)}
          </p>
        </div>
        <StatusBadge status={listing.status} />
      </div>
      <dl className="grid grid-cols-3 gap-2 text-[0.875rem]">
        <Fact label="Weight" value={`${listing.weight} kg`} />
        <Fact label="Price" value={formatTaka(listing.price)} />
        <Fact label="Per kg" value={formatTaka(listing.price / listing.weight)} />
      </dl>
      <p className="flex items-center gap-1.5 text-xs text-ink/60">
        <Icon name="map-pin" />
        {listing.location} · {formatDate(listing.created)}
      </p>
      {listing.status === "cancelled" && <p className="text-xs text-ink/60">{`Reason: ${listing.cancelReason || "not given"}`}</p>}
      {children && <div className="mt-auto flex flex-wrap gap-2">{children}</div>}
    </article>
  );
}
