export function startGlassSpotlight() {
  let litPanel = null;

  document.addEventListener("pointermove", (event) => {
    const panel = event.target.closest?.(".glass");
    if (litPanel && litPanel !== panel) litPanel.style.removeProperty("--mx");
    litPanel = panel;
    if (!panel) return;

    const box = panel.getBoundingClientRect();
    panel.style.setProperty("--mx", `${event.clientX - box.left}px`);
    panel.style.setProperty("--my", `${event.clientY - box.top}px`);
  });
}
