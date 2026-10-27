import { useData } from "../context/DataContext.jsx";
import { useFormValidation } from "../utils/useFormValidation.js";
import Button from "./Button.jsx";
import FormInput from "./FormInput.jsx";
import Modal from "./Modal.jsx";

const isRate = [[(value) => value !== "" && Number(value) >= 0, "Enter a rate of 0 or more."]];

const RULES = {
  name: [[(value) => value.length >= 2, "Give the category a name."]],
  clean: isRate,
  light: isRate,
  heavy: isRate,
  source: [[(value) => value.length > 0, "Say where these rates come from."]],
};

// Admin: the form for adding a plastic category, or editing one, with its three rates.
//   category, rate: the category being edited and its rate row (leave both out to add a new category)
//   onSave:         receives the form values when they are valid
export default function CategoryDialog({ category = null, rate = null, onSave, onClose }) {
  const { data } = useData();
  const form = useFormValidation(RULES, {
    name: category?.name ?? "",
    note: category?.note ?? "",
    clean: String(rate?.clean ?? ""),
    light: String(rate?.light ?? ""),
    heavy: String(rate?.heavy ?? ""),
    source: rate?.source ?? "",
  });

  function handleSubmit(event) {
    event.preventDefault();
    if (form.validateForm()) onSave(form.values);
  }

  return (
    <Modal onClose={onClose}>
      <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
        <h2 className="text-[1.25rem] font-bold">{category ? `Edit ${category.name}` : "New plastic category"}</h2>
        <FormInput form={form} name="name" id="category-name" label="Name" />
        <FormInput form={form} name="note" id="category-note" label="Examples" placeholder="What goes in this category" />
        <div className="grid grid-cols-3 gap-3">
          {data.conditions.map((condition) => (
            <FormInput key={condition.id} form={form} name={condition.id} id={`category-${condition.id}`} label={condition.name} type="number" />
          ))}
        </div>
        <FormInput form={form} name="source" id="category-source" label="Rate source" placeholder="Where these numbers come from" />
        <div className="flex flex-wrap justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">
            {category ? "Save changes" : "Add category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
