const gallery = document.querySelector("#demo-gallery");

if (gallery) {
  const demos = JSON.parse(gallery.dataset.demos || "[]");
  const caseMap = new Map();
  for (const demo of demos) {
    const key = `${demo.dataset}:${demo.caseId}`;
    if (!caseMap.has(key)) {
      caseMap.set(key, {
        key,
        caseId: demo.caseId,
        dataset: demo.dataset,
        title: demo.title,
        variants: [],
      });
    }
    caseMap.get(key).variants.push(demo);
  }

  const cases = Array.from(caseMap.values());
  const caseButtons = Array.from(gallery.querySelectorAll("[data-case-button]"));
  const datasetButtons = Array.from(gallery.querySelectorAll("[data-dataset-button]"));
  const rail = gallery.querySelector("[data-case-rail]");
  const previous = gallery.querySelector("[data-case-prev]");
  const next = gallery.querySelector("[data-case-next]");
  const counter = gallery.querySelector("[data-case-counter]");
  const viewSwitch = gallery.querySelector("[data-view-switch]");
  const panel = gallery.querySelector("#demo-panel");
  const video = gallery.querySelector("#demo-video");
  const title = gallery.querySelector("#demo-title");
  const meta = gallery.querySelector("#demo-meta");
  const description = gallery.querySelector("#demo-description");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const state = {
    dataset: cases[0].dataset,
    caseKey: cases[0].key,
    caseByDataset: new Map([[cases[0].dataset, cases[0].key]]),
    viewByCase: new Map(),
  };

  const visibleCases = () => cases.filter((item) => item.dataset === state.dataset);
  const currentCase = () => cases.find((item) => item.key === state.caseKey);
  const currentVariant = (item) => {
    const viewId = state.viewByCase.get(item.key);
    return item.variants.find((variant) => variant.viewId === viewId) || item.variants[0];
  };

  function centerActiveCase(button) {
    if (!button) return;
    const railRect = rail.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const left =
      rail.scrollLeft +
      buttonRect.left -
      railRect.left -
      (rail.clientWidth - buttonRect.width) / 2;
    rail.scrollTo({ left, behavior: reducedMotion.matches ? "auto" : "smooth" });
  }

  function setVideo(demo) {
    video.pause();
    video.classList.add("is-switching");
    video.poster = demo.poster;
    video.src = demo.video;
    video.setAttribute(
      "aria-label",
      `${demo.title}, ${demo.interaction}, ${demo.view}: synchronized comparison of GT and four methods`,
    );
    video.load();
    title.textContent = `${demo.title} · ${demo.interaction}`;
    meta.textContent = `${demo.dataset} · ${demo.family}`;
    description.textContent = demo.description;
  }

  function renderViews(item, selected) {
    viewSwitch.hidden = item.variants.length <= 1;
    viewSwitch.setAttribute("aria-label", `${item.title} camera view`);
    const buttons = item.variants.map((variant) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = variant.view;
      button.dataset.viewButton = variant.viewId;
      button.setAttribute("aria-pressed", String(variant === selected));
      button.addEventListener("click", () => {
        state.viewByCase.set(item.key, variant.viewId);
        render();
      });
      return button;
    });
    viewSwitch.replaceChildren(...buttons);
  }

  function render({ scroll = false, focus = false } = {}) {
    const item = currentCase();
    const selected = currentVariant(item);
    const visible = visibleCases();
    const index = visible.findIndex((entry) => entry.key === item.key);
    let activeButton = null;

    for (const button of datasetButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.datasetButton === state.dataset));
    }
    for (const button of caseButtons) {
      const selectedCase = button.dataset.caseKey === item.key;
      button.hidden = button.dataset.dataset !== state.dataset;
      button.setAttribute("aria-selected", String(selectedCase));
      button.tabIndex = selectedCase ? 0 : -1;
      if (selectedCase) activeButton = button;
    }

    rail.setAttribute("aria-label", `${state.dataset} cases`);
    panel.setAttribute("aria-labelledby", activeButton.id);
    previous.disabled = index <= 0;
    next.disabled = index === visible.length - 1;
    counter.textContent = `Case ${index + 1} of ${visible.length}`;
    renderViews(item, selected);
    setVideo(selected);

    if (scroll) centerActiveCase(activeButton);
    if (focus) activeButton.focus({ preventScroll: true });
  }

  function activateCase(key, options = {}) {
    const item = cases.find((entry) => entry.key === key);
    if (!item) return;
    state.caseKey = key;
    state.caseByDataset.set(item.dataset, key);
    render(options);
  }

  function moveCase(offset, focus = false) {
    const visible = visibleCases();
    const index = visible.findIndex((item) => item.key === state.caseKey);
    const target = visible[index + offset];
    if (target) activateCase(target.key, { scroll: true, focus });
  }

  for (const button of datasetButtons) {
    button.addEventListener("click", () => {
      const dataset = button.dataset.datasetButton;
      state.dataset = dataset;
      const item = visibleCases()[0];
      activateCase(state.caseByDataset.get(dataset) || item.key, { scroll: true });
    });
  }

  for (const button of caseButtons) {
    button.addEventListener("click", () => activateCase(button.dataset.caseKey, { scroll: true }));
    button.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") moveCase(1, true);
      else if (event.key === "ArrowLeft") moveCase(-1, true);
      else if (event.key === "Home") activateCase(visibleCases()[0].key, { scroll: true, focus: true });
      else if (event.key === "End") {
        const visible = visibleCases();
        activateCase(visible[visible.length - 1].key, { scroll: true, focus: true });
      } else return;
      event.preventDefault();
    });
  }

  previous.addEventListener("click", () => moveCase(-1));
  next.addEventListener("click", () => moveCase(1));
  video.addEventListener("loadeddata", () => video.classList.remove("is-switching"));
  video.addEventListener("error", () => {
    video.classList.remove("is-switching");
    description.textContent = "This video could not be loaded. Please choose another case or try again.";
  });

  render();
}
