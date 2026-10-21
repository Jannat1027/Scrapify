import { useData } from "../context/DataContext.jsx";
import { categoryColor, findCategory } from "../services/marketplace.js";
import MeterList from "./MeterList.jsx";

// One bar per plastic type in a batch, e.g. Clear PET 60%, Hard HDPE 25%.
export default function CompositionBars({ composition }) {
  const { data } = useData();
  const rows = Object.entries(composition).map(([categoryId, percent]) => ({
    label: findCategory(data, categoryId).name,
    valueText: `${percent}%`,
    percent,
    color: categoryColor(categoryId),
  }));
  return <MeterList rows={rows} />;
}
