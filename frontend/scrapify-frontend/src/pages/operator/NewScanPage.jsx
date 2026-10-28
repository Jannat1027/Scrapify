import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Icon from "../../components/Icon.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { PHOTO_CHECKLIST } from "../../data/content.js";
import { blobToDataUrl, compressImage, createSamplePhoto, gradePhoto } from "../../services/aiGrading.js";
import { apiErrorMessage } from "../../services/api.js";
import { saveToStorage, STORAGE_KEYS } from "../../services/storage.js";
import { nowIso } from "../../utils/format.js";

export default function NewScanPage() {
  const navigate = useNavigate();
  const showToast = useToast();

  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileInfo, setFileInfo] = useState("No photo selected");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [sampleCount, setSampleCount] = useState(0);

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
    const smallPhoto = await compressImage(photo, 640, 0.7);
    let grading;
    try {
      grading = await gradePhoto(smallPhoto);
    } catch (error) {
      showToast(apiErrorMessage(error), "red");
      setIsAnalysing(false);
      return;
    }
    const image = await blobToDataUrl(smallPhoto);
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
            The photo is graded on the Scrapify server. Use a clear, well-lit photo for a higher confidence.
          </p>
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
