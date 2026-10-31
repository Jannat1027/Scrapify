import { useData } from "../context/DataContext.jsx";
import { categoryColor, findCategory } from "../services/marketplace.js";
import MeterList from "./MeterList.jsx";

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
