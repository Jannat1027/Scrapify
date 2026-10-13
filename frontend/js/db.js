// Tiny localStorage store that keeps the demo data between page loads.
S.db = (() => {
  const KEY = "db.v1";
  const state = S.store.get(KEY, null) || structuredClone(SEED);
  const save = () => S.store.set(KEY, state);

  const db = {
    all: (table) => state[table],
    where: (table, test) => state[table].filter(test),
    find: (table, id) => state[table].find((row) => row.id === id),

    insert(table, row) {
      state[table].unshift(row);
      save();
      return row;
    },

    update(table, id, patch) {
      const row = db.find(table, id);
      Object.assign(row, patch);
      save();
      return row;
    },

    reset() {
      S.store.remove(KEY);
      location.reload();
    },
  };

  return db;
})();
