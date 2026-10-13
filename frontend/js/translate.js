// Bangla mode: translates every visible text, placeholder, title and aria-label, including anything rendered later.
// Phrases come from js/lang/bn-*.js; app.js loads all of this only when বাংলা is selected.
(() => {
  const DICT = Object.assign({}, ...S.BN);
  const { PATTERNS, WORDS } = S.BN_RULES;
  const WORD_PATTERN = new RegExp(`\\b(${Object.keys(WORDS).join("|")})\\b`, "g");
  const DIGITS = "০১২৩৪৫৬৭৮৯";
  const ATTRIBUTES = ["placeholder", "title", "aria-label"];
  const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CODE"]);

  // A known phrase, or a list like "LDPE film, Mixed / other" translated item by item.
  const word = (text) => DICT[text] ?? text.split(", ").map((part) => DICT[part] ?? part).join(", ");

  // Sentences with live values: "$1", "$2" … in the template become the translated captured values.
  function fromPattern(text) {
    const rule = PATTERNS.find(([pattern]) => pattern.test(text));
    if (!rule) return null;
    const groups = text.match(rule[0]);
    return rule[1].replace(/\$(\d)/g, (_, i) => word(groups[i]));
  }

  function phrase(text) {
    const quoted = text.match(/^“(.+)”$/);
    if (quoted) return `“${phrase(quoted[1])}”`;
    if (DICT[text]) return DICT[text];
    if (text.includes(" · ")) return text.split(" · ").map(phrase).join(" · ");
    return fromPattern(text) ?? text;
  }

  // Digits become Bangla numerals, except inside emails and record IDs such as SC-1042.
  const numerals = (text) =>
    text.replace(/\S+/g, (token) => (/@|^[A-Z]{2}-\w+/.test(token) ? token : token.replace(/\d/g, (d) => DIGITS[d])));

  S.tr = (text) => {
    const clean = text.replace(/\s+/g, " ").trim();
    if (!/[A-Za-z0-9]/.test(clean)) return text;
    const translated = numerals(phrase(clean).replace(WORD_PATTERN, (w) => WORDS[w]));
    if (translated === clean) return text;
    // Keep a single space where the original had leading or trailing whitespace.
    const [, lead, tail] = text.match(/^(\s*)[\s\S]*?(\s*)$/);
    return (lead && " ") + translated + (tail && " ");
  };

  const translateText = (node) => {
    const next = S.tr(node.data);
    if (next !== node.data) node.data = next;
  };
  const translateAttributes = (el) =>
    ATTRIBUTES.forEach((name) => {
      const value = el.getAttribute(name);
      if (value && S.tr(value) !== value) el.setAttribute(name, S.tr(value));
    });

  const skipped = (node) => SKIP.has((node.parentElement || node).tagName);

  function walk(root) {
    if (skipped(root)) return;
    if (root.nodeType === Node.TEXT_NODE) return translateText(root);
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    translateAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => (skipped(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      node.nodeType === Node.TEXT_NODE ? translateText(node) : translateAttributes(node);
    }
  }

  walk(document.body);
  document.title = S.tr(document.title);

  // Anything added or changed later (dialogs, toasts, animation captions) is translated as it appears.
  new MutationObserver((changes) => {
    changes.forEach((change) => {
      if (change.type === "characterData") walk(change.target);
      else if (change.type === "attributes") translateAttributes(change.target);
      else change.addedNodes.forEach(walk);
    });
  }).observe(document.body, {
    subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTES,
  });
  new MutationObserver(() => {
    if (document.title !== S.tr(document.title)) document.title = S.tr(document.title);
  }).observe(document.querySelector("title"), { childList: true });

  document.documentElement.style.opacity = "";
  document.dispatchEvent(new Event("translated"));
})();
