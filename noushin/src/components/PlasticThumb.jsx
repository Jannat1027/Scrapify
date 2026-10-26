import { useData } from "../context/DataContext.jsx";
import { categoryColor, findCategory } from "../services/marketplace.js";
import Icon from "./Icon.jsx";

// The photo of a batch when there is one, otherwise a soft coloured tile with the plastic type's icon.
//   photo: a saved scan's image (optional; the sample data has none)
//   className: extra classes, e.g. a minimum height
export default function PlasticThumb({ categoryId, height = 144, photo = "", className = "" }) {
  const { data } = useData(); // hooks must run before any early return
  if (photo) return <img src={photo} alt="Photo of the batch" className={`w-full rounded-2xl border border-ink/10 object-cover ${className}`} style={{ height }} />;

  const category = findCategory(data, categoryId);
  const style = {
    height,
    background: `radial-gradient(circle at 30% 20%, ${categoryColor(categoryId)}55, transparent 70%)`,
  };
  return (
    <div className={`grid place-items-center rounded-2xl border border-ink/10 ${className}`} style={style}>
      <Icon name={category.icon} size={40} className="opacity-80" />
    </div>
  );
}
