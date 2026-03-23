// QuickNote Popup Script
// Handles displaying, searching, and deleting notes in the popup UI

let allNotes = [];

// DOM elements
const notesContainer = document.getElementById("notesContainer");
const noteCountEl = document.getElementById("noteCount");
const searchInput = document.getElementById("searchInput");
const footer = document.getElementById("footer");
const clearAllBtn = document.getElementById("clearAllBtn");

// Initialize popup
document.addEventListener("DOMContentLoaded", () => {
  loadNotes();

  // Search functionality: filter as you type
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    renderNotes(filterNotes(query));
  });

  // Clear all notes
  clearAllBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all notes? This cannot be undone.")) {
      chrome.runtime.sendMessage({ action: "clearAllNotes" }, () => {
        allNotes = [];
        renderNotes([]);
      });
    }
  });
});

// Load all notes from storage via background script
function loadNotes() {
  chrome.storage.local.get({ notes: [] }, (result) => {
    allNotes = result.notes || [];
    renderNotes(allNotes);
  });
}

// Filter notes based on search query
function filterNotes(query) {
  if (!query) return allNotes;
  return allNotes.filter(note =>
    note.text.toLowerCase().includes(query) ||
    note.title.toLowerCase().includes(query) ||
    note.url.toLowerCase().includes(query)
  );
}

// Render the notes list
function renderNotes(notes) {
  // Update count
  const totalCount = allNotes.length;
  noteCountEl.textContent = `${totalCount} note${totalCount !== 1 ? "s" : ""}`;

  // Show/hide footer
  footer.style.display = totalCount > 0 ? "flex" : "none";

  // Clear container
  notesContainer.innerHTML = "";

  // Empty state
  if (totalCount === 0) {
    notesContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">&#128466;</div>
        <h3>No notes yet</h3>
        <p>Highlight text on any page and right-click to save it as a note!</p>
      </div>
    `;
    return;
  }

  // No results for search
  if (notes.length === 0) {
    notesContainer.innerHTML = `
      <div class="no-results">No notes match your search.</div>
    `;
    return;
  }

  // Render each note
  notes.forEach(note => {
    const noteEl = createNoteElement(note);
    notesContainer.appendChild(noteEl);
  });
}

// Create a single note DOM element
function createNoteElement(note) {
  const noteItem = document.createElement("div");
  noteItem.className = "note-item";
  noteItem.dataset.id = note.id;

  // Extract a clean domain from the URL for display
  let displayDomain = "";
  try {
    const url = new URL(note.url);
    displayDomain = url.hostname.replace("www.", "");
  } catch {
    displayDomain = note.title || "Unknown";
  }

  noteItem.innerHTML = `
    <div class="note-content">
      <div class="note-text">${escapeHtml(note.text)}</div>
      <div class="note-meta">
        <a href="${escapeHtml(note.url)}" class="note-source" title="${escapeHtml(note.title)}" target="_blank">${escapeHtml(displayDomain)}</a>
        <span class="note-dot"></span>
        <span class="note-time">${formatRelativeTime(note.timestamp)}</span>
      </div>
    </div>
    <div class="note-actions">
      <button class="delete-btn" title="Delete note">&times;</button>
    </div>
  `;

  // Handle delete button click
  const deleteBtn = noteItem.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteNote(note.id, noteItem);
  });

  // Handle clicking on source link -- open in new tab
  const sourceLink = noteItem.querySelector(".note-source");
  sourceLink.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: note.url });
  });

  return noteItem;
}

// Delete a note
function deleteNote(noteId, noteElement) {
  // Animate out
  noteElement.style.transition = "opacity 0.2s, transform 0.2s";
  noteElement.style.opacity = "0";
  noteElement.style.transform = "translateX(20px)";

  setTimeout(() => {
    chrome.runtime.sendMessage({ action: "deleteNote", noteId }, (response) => {
      if (response && response.success) {
        allNotes = response.notes;
        const query = searchInput.value.trim().toLowerCase();
        renderNotes(filterNotes(query));
      }
    });
  }, 200);
}

// Format timestamp as relative time (e.g., "2 hours ago")
function formatRelativeTime(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 10) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 4) return `${diffWeek}w ago`;

  // For older notes, show the actual date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
  });
}

// Escape HTML to prevent XSS when rendering note text
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
