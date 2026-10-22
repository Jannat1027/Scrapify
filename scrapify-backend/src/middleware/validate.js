// Checks req.body against a zod schema and replaces it with the cleaned values.
// On failure the error middleware answers 400 with the first problem found.
export function validate(schema) {
  return (req, res, next) => {
    req.body = schema.parse(req.body ?? {});
    next();
  };
}
