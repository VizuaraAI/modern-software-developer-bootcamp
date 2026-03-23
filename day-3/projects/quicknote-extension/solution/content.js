// QuickNote Content Script
// Runs on every page to show toast notifications when notes are saved

// Listen for messages from the background service worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showToast") {
    showToast(request.message);
    sendResponse({ success: true });
  }
  return true;
});

// Show a brief toast notification on the page
function showToast(message) {
  // Remove any existing toast first
  const existingToast = document.getElementById("quicknote-toast");
  if (existingToast) {
    existingToast.remove();
  }

  // Create the toast element
  const toast = document.createElement("div");
  toast.id = "quicknote-toast";
  toast.className = "quicknote-toast";

  // Create icon (checkmark)
  const icon = document.createElement("span");
  icon.className = "quicknote-toast-icon";
  icon.textContent = "\u2713";

  // Create message text
  const text = document.createElement("span");
  text.className = "quicknote-toast-text";
  text.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(text);
  document.body.appendChild(toast);

  // Trigger the slide-in animation
  requestAnimationFrame(() => {
    toast.classList.add("quicknote-toast-visible");
  });

  // Auto-dismiss after 2.5 seconds
  setTimeout(() => {
    toast.classList.remove("quicknote-toast-visible");
    toast.classList.add("quicknote-toast-hiding");

    // Remove from DOM after the fade-out animation
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, 2500);
}
