# QuickNote Chrome Extension — Build Prompts

Build a Chrome extension that lets you highlight text on any webpage and save it as a note. Built entirely with Claude Code from a plain-English description.

## Setup

Create a new empty folder called `quicknote-extension`, navigate into it, and open Claude Code:
```
mkdir quicknote-extension && cd quicknote-extension && claude
```

---

## Prompt 1 — Build the full extension

```
Build a complete Chrome Extension (Manifest V3) called QuickNote.

manifest.json:
- Name: "QuickNote", description: "Save highlighted text as notes", version "1.0", manifest_version 3
- Permissions: storage, contextMenus, activeTab, scripting
- Background service worker: background.js
- Content scripts: [content.js, content.css] injected into all URLs at document_idle
- Browser action with popup: popup.html, default icons at icon48.png (48x48) and icon128.png (128x128)

background.js (service worker):
- On install: create a context menu item "Save to QuickNote" with id "save-note",
  visible only when text is selected (contexts: ["selection"])
- On context menu click: build a note object { id (Date.now()), text (selected text),
  url (tab URL), title (tab title), timestamp (ISO string) }
- Load existing notes from chrome.storage.local, prepend the new note, save back
- Send a message to the active tab content script: { action: "showToast", message: "Note saved!" }

content.js + content.css:
- Listen for messages from background.js
- On "showToast": inject a toast div into the page at the bottom-right corner
  Styled: fixed position, bottom-right, dark background, white text, rounded corners
  The toast fades in, stays for 2 seconds, then fades out and is removed from the DOM

popup.html + popup.js:
- Clean, minimal UI showing all saved notes in reverse chronological order
- Header: "QuickNote" title with a note count badge
- Search input at the top — filters notes live as you type (matches text, title, or URL)
- Each note card shows:
  - The saved text (capped at 150 chars with ellipsis)
  - Page title as a clickable link to the original URL
  - Relative time (e.g., "2 hours ago", "just now", "3 days ago")
  - A delete button (X) that removes just that note
- Footer: "Clear all notes" button, hidden when there are no notes
- Empty state: centered message "No notes yet. Highlight text and right-click to save."

create-icons.js (Node.js script, no external dependencies):
- Generate icon48.png (48x48) and icon128.png (128x128)
- Each icon: teal/dark background, white "QN" text, centered
- Use only built-in Node.js Buffer and raw PNG encoding (no canvas, no sharp)
```

---

## Prompt 2 — Generate icons and load in Chrome

```
Run `node create-icons.js` to generate the icon files.
Then give me step-by-step instructions for loading this extension in Chrome Developer Mode.
```

---

## Prompt 3 — Debug if needed

If the extension does not work as expected after loading:
```
The extension is loaded in Chrome but [describe the specific problem].
Open the extension's service worker console (chrome://extensions > Details > Inspect views > service worker) and show me any errors.
Fix the issue.
```

---

## Verification checklist

- [ ] Extension loads in Chrome without any manifest errors
- [ ] Right-clicking selected text shows "Save to QuickNote" in the context menu
- [ ] A toast notification appears on the page after saving
- [ ] Clicking the extension icon opens the popup with saved notes
- [ ] Notes persist after closing and reopening Chrome
- [ ] Search filters notes as you type
- [ ] Individual delete buttons remove single notes
- [ ] "Clear all" removes all notes

## Chrome extension architecture (Manifest V3)

```
Highlight text + right-click
        |
        v
[Context Menu]  "Save to QuickNote"
        |
        v
[background.js]  Saves note to chrome.storage.local
        |         Sends message to content script
        v
[content.js]     Shows toast notification on the page

Click extension icon
        |
        v
[popup.html/js]  Reads from chrome.storage.local, renders notes
```
