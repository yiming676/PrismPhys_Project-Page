const button = document.querySelector("[data-copy-bibtex]");
const code = document.querySelector("#bibtex-code");

button?.addEventListener("click", async () => {
  if (!code) return;
  try {
    await navigator.clipboard.writeText(code.textContent ?? "");
    button.textContent = "Copied";
    window.setTimeout(() => (button.textContent = "Copy BibTeX"), 1600);
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(code);
    selection?.removeAllRanges();
    selection?.addRange(range);
    button.textContent = "Code selected";
  }
});
