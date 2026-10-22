// ---------------------------------------------------------------------------
// Shared schema plugin: how every document looks when it is sent as JSON.
// Each collection keeps the frontend's own string id ("u1", "SC-1042",
// "LS-2210"), so Mongo's internal _id and __v are hidden and the pages
// can keep using `row.id` without any changes.
// ---------------------------------------------------------------------------
export function toJSONPlugin(schema, { hide = [] } = {}) {
  schema.set("toJSON", {
    versionKey: false,
    flattenMaps: true, // composition maps go out as plain objects: { pet: 60, hdpe: 40 }
    transform(document, output) {
      delete output._id;
      hide.forEach((field) => delete output[field]);
      return output;
    },
  });
}
