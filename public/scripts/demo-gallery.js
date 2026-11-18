const gallery = document.querySelector("#demo-gallery");

if (gallery) {
  const tabs = Array.from(gallery.querySelectorAll("[data-demo-tab]"));
  const video = gallery.querySelector("#demo-video");
  const panel = gallery.querySelector("#demo-panel");
  const title = gallery.querySelector("#demo-title");
  const meta = gallery.querySelector("#demo-meta");
  const description = gallery.querySelector("#demo-description");

  const activate = (tab) => {
    for (const item of tabs) {
      item.setAttribute("aria-selected", String(item === tab));
      item.tabIndex = item === tab ? 0 : -1;
    }
    panel.setAttribute("aria-labelledby", tab.id);
    video.pause();
    video.classList.add("is-switching");
    video.poster = tab.dataset.poster;
    video.src = tab.dataset.video;
    video.load();
    video.addEventListener("loadeddata", () => video.classList.remove("is-switching"), {
      once: true,
    });
    title.textContent = tab.dataset.title;
    meta.textContent = tab.dataset.meta;
    description.textContent = tab.dataset.description;
  };

  for (const [index, tab] of tabs.entries()) {
    tab.addEventListener("click", () => activate(tab));
    tab.addEventListener("keydown", (event) => {
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      tabs[next].focus();
      activate(tabs[next]);
    });
  }
}
