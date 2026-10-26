import { useState } from "react";
import Button from "./Button.jsx";
import FormField from "./FormField.jsx";
import Modal from "./Modal.jsx";
import { formatPriceRange } from "../utils/format.js";

// Asks the operator for the fixed price of a batch before it goes on the market.
// The price box starts at the middle of the estimate, which the operator can change.
export default function ListForSaleDialog({ weight, typeName, price, onPublish, onClose }) {
  const [fixedPrice, setFixedPrice] = useState(String(Math.round(price.total)));
  const [problem, setProblem] = useState(undefined);

  function handleSubmit(event) {
    event.preventDefault();
    if (!(Number(fixedPrice) > 0)) {
      setProblem("Enter a price above zero.");
      return;
    }
    onPublish(Number(fixedPrice));
  }

  return (
    <Modal onClose={onClose}>
      <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
        <h2 className="text-[1.25rem] font-bold">List this batch</h2>
        <p className="text-sm text-ink/60">
          {`${weight} kg of ${typeName}. Suggested range ${formatPriceRange(price)}.`}
        </p>
        <FormField id="fixedPrice" label="Fixed price (৳)" problem={problem}>
          <input
            id="fixedPrice"
            name="fixedPrice"
            className="input"
            type="number"
            min="1"
            value={fixedPrice}
            onChange={(event) => setFixedPrice(event.target.value)}
            autoFocus
          />
        </FormField>
        <p className="text-xs text-ink/60">Recyclers claim at this exact price. You can cancel while it's still available.</p>
        <div className="flex flex-wrap justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">
            Publish listing
          </Button>
        </div>
      </form>
    </Modal>
  );
}
