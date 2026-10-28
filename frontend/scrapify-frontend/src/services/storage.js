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
  }
}

export const STORAGE_KEYS = {
  token: "token",
  draftScan: "draftScan",
  language: "lang",
};
