export function toJSONPlugin(schema, { hide = [] } = {}) {
  schema.set("toJSON", {
    versionKey: false,
    flattenMaps: true, 
    transform(document, output) {
      delete output._id;
      hide.forEach((field) => delete output[field]);
      return output;
    },
  });
}
