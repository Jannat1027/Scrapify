// Operator: pick or drop a photo, shrink it in the browser, then send it for grading.
const fileInput = S.$("#photo");
const dropzone = S.$("#dropzone");
const preview = S.$("#preview");
let photo = null;

const TIPS = [
  ["layers", "Single layer, shot from above"],
  ["sun", "Bright, even light. No dark corners"],
  ["focus", "Hold steady so the photo is sharp"],
  ["box", "One batch per photo"],
];
S.render(S.$("#tips"), TIPS.map(([icon, text]) => `
  <li class="flex items-center gap-3">
    <span class="icon-tile !h-11 !w-11">${S.ui.icon(icon)}</span><span class="text-sm">${text}</span>
  </li>`).join(""));

// Resizes to at most 1280px and re-encodes as JPEG, so uploads stay small on mobile data.
const compress = (file, maxSide = 1280, quality = 0.75) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = S.make("canvas", { width: img.width * scale, height: img.height * scale });
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      canvas.toBlob(resolve, "image/jpeg", quality);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });

const readAsDataUrl = (blob) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });

// Shows or clears the chosen photo and enables the buttons that need one.
function showPhoto(blob, info) {
  photo = blob;
  preview.hidden = !blob;
  S.$("#dropHint").hidden = Boolean(blob);
  if (blob) preview.src = URL.createObjectURL(blob);
  S.$("#fileInfo").textContent = info;
  S.$("#analyse").disabled = S.$("#retake").disabled = !blob;
}

async function usePhoto(file) {
  if (!file?.type.startsWith("image/")) return S.toast("Please choose an image file.", "red");
  const small = await compress(file);
  const kb = (bytes) => (bytes / 1024).toFixed(0);
  showPhoto(small, `${kb(file.size)} KB → ${kb(small.size)} KB after compression`);
}

fileInput.addEventListener("change", () => usePhoto(fileInput.files[0]));
S.$("#retake").addEventListener("click", () => {
  fileInput.value = "";
  showPhoto(null, "No photo selected");
});

// Drag and drop onto the drop zone.
dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("over");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("over"));
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("over");
  usePhoto(e.dataTransfer.files[0]);
});

S.$("#analyse").addEventListener("click", async () => {
  S.$("#analysing").hidden = false;
  const [grading, image] = await Promise.all([S.grade(photo), readAsDataUrl(photo)]);
  S.store.set("draftScan", { ...grading, image, date: new Date().toISOString() });
  location.assign("scan-result.html?draft=1");
});

// Phone hand-off: the QR code opens a one-time upload link tied to this session.
const sessionId = S.uid("QR");
S.$("#sessionId").textContent = sessionId;

S.$$("[data-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    const name = tab.dataset.tab;
    S.$$("[data-tab]").forEach((other) => other.classList.toggle("active", other === tab));
    S.$$("[data-panel]").forEach((panel) => (panel.hidden = panel.dataset.panel !== name));
    if (name === "phone" && !S.$("#qr").childElementCount && window.QRCode) {
      new QRCode(S.$("#qr"), { text: `${S.base}operator/new-scan.html?session=${sessionId}`, width: 180, height: 180 });
    }
  });
});
