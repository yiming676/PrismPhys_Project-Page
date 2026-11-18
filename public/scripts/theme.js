const root = document.documentElement;
const media = window.matchMedia("(prefers-color-scheme: dark)");
const storageKey = "prismphys-theme";

function savedTheme() {
  try {
    const value = localStorage.getItem(storageKey);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  const button = document.querySelector("#theme-toggle");
  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  if (button) {
    button.setAttribute("aria-label", label);
    button.setAttribute("aria-pressed", String(theme === "dark"));
    button.setAttribute("title", label);
  }
  const themeColor = document.querySelector("#theme-color");
  if (themeColor) themeColor.setAttribute("content", theme === "dark" ? "#111518" : "#ffffff");
}

applyTheme(savedTheme() ?? (media.matches ? "dark" : "light"));

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(root.dataset.theme);
  const button = document.querySelector("#theme-toggle");
  if (!button) return;

  button.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("theme-transition");
      window.setTimeout(() => root.classList.remove("theme-transition"), 340);
    }
    applyTheme(next);
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      // The selected theme still applies when storage is unavailable.
    }
  });

  media.addEventListener("change", (event) => {
    if (!savedTheme()) applyTheme(event.matches ? "dark" : "light");
  });
});
