import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Button from "../../components/Button.jsx";
import Icon from "../../components/Icon.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { PHOTO_CHECKLIST } from "../../data/content.js";
import { blobToDataUrl, compressImage, createSamplePhoto, gradePhoto } from "../../services/aiGrading.js";
import { saveToStorage, STORAGE_KEYS } from "../../services/storage.js";
import { makeId, nowIso } from "../../utils/format.js";

function tabClass(isActive) {
  const look = isActive ? "bg-white text-ink shadow-sm" : "text-ink/60";
  return `inline-flex h-9 items-center gap-1 rounded-full px-4 text-[0.875rem] font-semibold transition-all duration-150 ${look}`;
}

export default function NewScanPage() {
  const navigate = useNavigate();
  const showToast = useToast();

  const [activeTab, setActiveTab] = useState("upload");
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileInfo, setFileInfo] = useState("No photo selected");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [sampleCount, setSampleCount] = useState(0);
  const [phoneSessionId] = useState(() => makeId("QR"));

  useEffect(() => {
    if (!photo) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  async function choosePhoto(file) {
    if (!file || !file.type.startsWith("image/")) {
      showToast("Please choose an image file.", "red");
      return;
    }
    const smallPhoto = await compressImage(file);
    const kb = (bytes) => (bytes / 1024).toFixed(0);
    setPhoto(smallPhoto);
    setFileInfo(`${kb(file.size)} KB → ${kb(smallPhoto.size)} KB after compression`);
  }

  async function chooseSamplePhoto() {
    const sample = await createSamplePhoto(sampleCount);
    setSampleCount(sampleCount + 1);
    choosePhoto(new File([sample], "sample-batch.png", { type: "image/png" }));
  }

  function clearPhoto() {
    setPhoto(null);
    setFileInfo("No photo selected");
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    choosePhoto(event.dataTransfer.files[0]);
  }

  async function analyse() {
    setIsAnalysing(true);
    const grading = await gradePhoto(photo);
    const image = await blobToDataUrl(await compressImage(photo, 640, 0.7));
    const draftScan = { ...grading, image, date: nowIso(), corrected: false };

    saveToStorage(STORAGE_KEYS.draftScan, draftScan);
    navigate("/operator/scans/new", { state: { draftScan } });
  }

  return (
    <>
      <div className="px-1">
        <h1 className="text-3xl font-bold tracking-tight">New scan</h1>
        <p className="text-ink/60">Take one clear photo of the batch. We'll grade it and estimate a price.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="panel">
          <div className="inline-flex w-fit max-w-full flex-wrap gap-1 rounded-full border border-ink/10 bg-white/60 p-1">
            <button type="button" className={tabClass(activeTab === "upload")} onClick={() => setActiveTab("upload")}>
              <Icon name="image-up" /> Upload photo
            </button>
            <button type="button" className={tabClass(activeTab === "phone")} onClick={() => setActiveTab("phone")}>
              <Icon name="smartphone" /> Use phone (QR)
            </button>
          </div>

          {activeTab === "upload" && (
            <div className="mt-5">
              <label
                className={`grid min-h-[340px] cursor-pointer place-items-center rounded-3xl border-2 border-dashed p-6 text-center transition-all duration-150 ${
                  isDragging ? "border-mint bg-mint/5" : "border-ink/15 hover:border-mint hover:bg-mint/5"
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={(event) => {
                    choosePhoto(event.target.files[0]);
                    event.target.value = "";
                  }}
                />
                {previewUrl ? (
                  <img src={previewUrl} alt="Selected batch" className="max-h-[420px] rounded-2xl" />
                ) : (
                  <div className="grid justify-items-center gap-3">
                    <span className="icon-tile mx-auto h-16 w-16 text-[1.875rem]">
                      <Icon name="camera" />
                    </span>
                    <p className="text-[1.125rem] font-semibold">Drop a photo here or tap to take one</p>
                    <p className="text-sm text-ink/60">JPG or PNG. We shrink it on this device before uploading.</p>
                  </div>
                )}
              </label>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-ink/60">{fileInfo}</p>
                <div className="inline-flex flex-wrap items-center gap-2">
                  <Button icon="image" onClick={chooseSamplePhoto}>
                    Use a sample photo
                  </Button>
                  <Button icon="rotate-ccw" onClick={clearPhoto} disabled={!photo}>
                    Retake
                  </Button>
                  <Button variant="primary" icon="sparkles" onClick={analyse} disabled={!photo}>
                    Analyse batch
                  </Button>
                </div>
              </div>
              <p className="mt-4 flex items-start gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/[.08] px-3 py-2 text-amber-800 text-xs">
                <Icon name="info" />
                Demo: the analysis is simulated in the browser. No photo is uploaded and no real AI model runs.
              </p>
            </div>
          )}

          {activeTab === "phone" && (
            <div className="grid items-center gap-8 md:grid-cols-[auto_1fr] mt-5">
              <div className="mx-auto w-fit rounded-2xl bg-white p-4">
                <QRCodeSVG value={`${window.location.origin}/operator/new-scan?session=${phoneSessionId}`} size={180} />
              </div>
              <div>
                <h2 className="text-[1.25rem] font-semibold">Scan with your phone camera</h2>
                <ol className="mt-4 grid list-decimal gap-3 pl-5 marker:font-bold marker:text-forest text-sm text-ink/60">
                  <li>Open the camera app and point it at the code.</li>
                  <li>Take the photo on your phone.</li>
                  <li>It appears here automatically. No login needed on the phone.</li>
                </ol>
                <p className="mt-6 flex items-center gap-2 text-forest text-sm">
                  <span className="h-2 w-2 animate-ping rounded-full bg-mint" />
                  Waiting for photo · session <span className="font-mono">{phoneSessionId}</span>
                </p>
                <p className="mt-4 flex items-start gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/[.08] px-3 py-2 text-amber-800 text-xs">
                  <Icon name="info" />
                  Demo: the phone hand-off needs a backend to pass the photo along, so nothing will arrive here. Use
                  "Upload photo" instead.
                </p>
              </div>
            </div>
          )}
        </section>

        <aside className="panel">
          <h2 className="text-lg font-semibold">Photo checklist</h2>
          <p className="text-sm text-ink/60">Good photos mean higher confidence and a tighter price range.</p>
          <ul className="mt-6 grid gap-4">
            {PHOTO_CHECKLIST.map((tip) => (
              <li key={tip.text} className="flex items-center gap-3">
                <span className="icon-tile h-11 w-11">
                  <Icon name={tip.icon} />
                </span>
                <span className="text-sm">{tip.text}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {isAnalysing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/25 backdrop-blur-[4px]">
          <div className="glass grid justify-items-center gap-4 p-10 text-center">
            <span className="h-14 w-14 animate-spin rounded-full border-4 border-mint/20 border-t-mint" />
            <p className="text-[1.25rem] font-semibold">Grading your batch…</p>
            <p className="text-sm text-ink/60">Checking plastic types, contamination and photo quality.</p>
          </div>
        </div>
      )}
    </>
  );
}
