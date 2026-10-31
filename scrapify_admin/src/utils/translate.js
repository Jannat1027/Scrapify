import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "../services/storage.js";
import admin from "../data/bangla/admin.js";
import auth from "../data/bangla/auth.js";
import common from "../data/bangla/common.js";
import home from "../data/bangla/home.js";
import market from "../data/bangla/market.js";
import operator from "../data/bangla/operator.js";
import rules from "../data/bangla/rules.js";
import site from "../data/bangla/site.js";

const PHRASES = { ...common, ...home, ...site, ...auth, ...operator, ...market, ...admin };
const WORD_PATTERN = new RegExp(`\\b(${Object.keys(rules.WORDS).join("|")})\\b`, "g");
const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";
const TRANSLATED_ATTRIBUTES = ["placeholder", "title", "aria-label"];
const SKIPPED_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CODE"]);

export function isBanglaMode() {
  return loadFromStorage(STORAGE_KEYS.language, "en") === "bn";
}

export function toggleLanguage() {
  saveToStorage(STORAGE_KEYS.language, isBanglaMode() ? "en" : "bn");
  window.location.reload();
}

function translateWord(text) {
  if (PHRASES[text]) return PHRASES[text];
  return text.split(", ").map((part) => PHRASES[part] ?? part).join(", ");
}

function translateWithPattern(text) {
  const rule = rules.PATTERNS.find(([pattern]) => pattern.test(text));
  if (!rule) return null;
  const groups = text.match(rule[0]);
  return rule[1].replace(/\$(\d)/g, (_, index) => translateWord(groups[index]));
}

function translatePhrase(text) {
  const quoted = text.match(/^“(.+)”$/);
  if (quoted) return `“${translatePhrase(quoted[1])}”`;
  if (PHRASES[text]) return PHRASES[text];
  if (text.includes(" · ")) return text.split(" · ").map(translatePhrase).join(" · ");
  return translateWithPattern(text) ?? text;
}

function toBanglaDigits(text) {
  return text.replace(/\S+/g, (token) =>
    /@|^[A-Z]{2}-\w+/.test(token) ? token : token.replace(/\d/g, (digit) => BANGLA_DIGITS[digit]),
  );
}

export function translateText(text) {
  if (!isBanglaMode() || typeof text !== "string") return text;
  const clean = text.replace(/\s+/g, " ").trim();
  if (!/[A-Za-z0-9]/.test(clean)) return text;
  const translated = toBanglaDigits(translatePhrase(clean).replace(WORD_PATTERN, (word) => rules.WORDS[word]));
  if (translated === clean) return text;
  const [, leadingSpace, trailingSpace] = text.match(/^(\s*)[\s\S]*?(\s*)$/);
  return (leadingSpace && " ") + translated + (trailingSpace && " ");
}

function translateTextNode(node) {
  const next = translateText(node.data);
  if (next !== node.data) node.data = next;
}

function translateAttributes(element) {
  TRANSLATED_ATTRIBUTES.forEach((name) => {
    const value = element.getAttribute(name);
    if (value && translateText(value) !== value) element.setAttribute(name, translateText(value));
  });
}

function isSkipped(node) {
  return SKIPPED_TAGS.has((node.parentElement || node).tagName);
}

function translateTree(root) {
  if (isSkipped(root)) return;
  if (root.nodeType === Node.TEXT_NODE) return translateTextNode(root);
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  translateAttributes(root);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => (isSkipped(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
    else translateAttributes(node);
  }
}

export function startBanglaMode() {
  document.documentElement.lang = "bn";
  translateTree(document.body);

  new MutationObserver((changes) => {
    changes.forEach((change) => {
      if (change.type === "characterData") translateTree(change.target);
      else if (change.type === "attributes") translateAttributes(change.target);
      else change.addedNodes.forEach(translateTree);
    });
  }).observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: TRANSLATED_ATTRIBUTES,
  });
}
