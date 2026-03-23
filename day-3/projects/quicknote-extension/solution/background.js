// QuickNote Background Service Worker
// Handles context menu creation and note storage

// Create context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-quicknote",
    title: "Save to QuickNote",
    contexts: ["selection"]
  });
  console.log("QuickNote: Context menu created");
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-to-quicknote") {
    const selectedText = info.selectionText;

    if (!selectedText || selectedText.trim() === "") {
      return;
    }

    // Create the note object
    const note = {
      id: Date.now().toString(),
      text: selectedText.trim(),
      url: tab.url || "",
      title: tab.title || "Unknown Page",
      timestamp: new Date().toISOString()
    };

    // Save the note to chrome.storage.local
    chrome.storage.local.get({ notes: [] }, (result) => {
      const notes = result.notes;
      notes.unshift(note); // Add new note to the beginning
      chrome.storage.local.set({ notes }, () => {
        console.log("QuickNote: Note saved", note);

        // Send message to content script to show toast notification
        chrome.tabs.sendMessage(tab.id, {
          action: "showToast",
          message: "Note saved!"
        }).catch(() => {
          // Content script might not be loaded (e.g., chrome:// pages)
          console.log("QuickNote: Could not show toast (content script not available)");
        });
      });
    });
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getNotes") {
    chrome.storage.local.get({ notes: [] }, (result) => {
      sendResponse({ notes: result.notes });
    });
    return true; // Keep the message channel open for async response
  }

  if (request.action === "deleteNote") {
    chrome.storage.local.get({ notes: [] }, (result) => {
      const notes = result.notes.filter(note => note.id !== request.noteId);
      chrome.storage.local.set({ notes }, () => {
        sendResponse({ success: true, notes });
      });
    });
    return true;
  }

  if (request.action === "clearAllNotes") {
    chrome.storage.local.set({ notes: [] }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
