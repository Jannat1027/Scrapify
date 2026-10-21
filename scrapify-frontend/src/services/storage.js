// Safe wrappers around the browser's localStorage.
// localStorage can throw (private windows, full storage), so every call is inside try/catch.
// All keys start with "scrapify." so they never clash with other sites on localhost.

function fullKey(key) {
  return `scrapify.${key}`;
}

export function loadFromStorage(key, fallbackValue) {
  try {
    const text = localStorage.getItem(fullKey(key));
    return text === null ? fallbackValue : JSON.parse(text);
  } catch {
    return fallbackValue;
  }
}

// Returns true when saved, false when the browser refused (for example, storage is full).
export function saveToStorage(key, value) {
  try {
    localStorage.setItem(fullKey(key), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(fullKey(key));
  } catch {
    // Nothing to do: the value simply stays.
  }
}

// The storage keys used by the app, in one place.
export const STORAGE_KEYS = {
  data: "db.v3", // change the version when seed.js changes shape, so old saved data is ignored
  session: "session",
  draftScan: "draftScan",
  language: "lang",
};
