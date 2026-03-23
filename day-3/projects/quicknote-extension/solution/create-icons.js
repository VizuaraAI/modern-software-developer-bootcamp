// QuickNote Icon Generator
// Run with: node create-icons.js
// Requires no external dependencies -- uses built-in Node.js modules
//
// This script creates simple PNG icons for the Chrome extension.
// It generates a purple rounded square with a white pencil/note symbol.

const fs = require("fs");

// Simple BMP-to-PNG is complex, so we generate minimal valid PNG files
// using a manual approach with zlib for compression.

const zlib = require("zlib");

function createPNG(size) {
  // Create RGBA pixel data
  const pixels = Buffer.alloc(size * size * 4, 0);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const cornerRadius = size * 0.22;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Check if pixel is inside the rounded rectangle
      if (isInsideRoundedRect(x, y, size * 0.1, size * 0.1, size * 0.8, size * 0.8, cornerRadius)) {
        // Background: purple gradient (#6366f1 to #8b5cf6)
        const t = y / size;
        const r = Math.round(99 + (139 - 99) * t);   // 6366f1 -> 8b5cf6
        const g = Math.round(102 + (92 - 102) * t);
        const b = Math.round(241 + (246 - 241) * t);

        pixels[idx] = r;
        pixels[idx + 1] = g;
        pixels[idx + 2] = b;
        pixels[idx + 3] = 255;

        // Draw a white "pencil/note" symbol in the center
        if (isInsideNoteIcon(x, y, size)) {
          pixels[idx] = 255;
          pixels[idx + 1] = 255;
          pixels[idx + 2] = 255;
          pixels[idx + 3] = 255;
        }
      }
    }
  }

  return encodePNG(pixels, size, size);
}

function isInsideRoundedRect(px, py, rx, ry, rw, rh, cr) {
  // Check if point is inside a rounded rectangle
  if (px < rx || px > rx + rw || py < ry || py > ry + rh) return false;

  // Check corners
  const corners = [
    { cx: rx + cr, cy: ry + cr },         // top-left
    { cx: rx + rw - cr, cy: ry + cr },     // top-right
    { cx: rx + cr, cy: ry + rh - cr },     // bottom-left
    { cx: rx + rw - cr, cy: ry + rh - cr } // bottom-right
  ];

  for (const corner of corners) {
    const inCornerRegion =
      (px < corner.cx && corner.cx === rx + cr || px > corner.cx && corner.cx === rx + rw - cr) &&
      (py < corner.cy && corner.cy === ry + cr || py > corner.cy && corner.cy === ry + rh - cr);

    if (inCornerRegion) {
      const dist = Math.sqrt((px - corner.cx) ** 2 + (py - corner.cy) ** 2);
      if (dist > cr) return false;
    }
  }

  return true;
}

function isInsideNoteIcon(px, py, size) {
  // Draw a simple notepad/document icon:
  // A rectangle (page) with horizontal lines (text lines)
  const pageLeft = size * 0.3;
  const pageRight = size * 0.7;
  const pageTop = size * 0.22;
  const pageBottom = size * 0.78;
  const lineThick = Math.max(1, Math.round(size * 0.04));

  // Page outline
  const isPageBorder =
    (px >= pageLeft && px <= pageRight && py >= pageTop && py <= pageTop + lineThick) || // top
    (px >= pageLeft && px <= pageRight && py >= pageBottom - lineThick && py <= pageBottom) || // bottom
    (px >= pageLeft && px <= pageLeft + lineThick && py >= pageTop && py <= pageBottom) || // left
    (px >= pageRight - lineThick && px <= pageRight && py >= pageTop && py <= pageBottom);   // right

  // Text lines inside the page
  const lineMarginX = size * 0.1;
  const isTextLine = (lineY) => {
    return px >= pageLeft + lineMarginX &&
           px <= pageRight - lineMarginX &&
           py >= lineY &&
           py <= lineY + lineThick;
  };

  const line1 = pageTop + size * 0.15;
  const line2 = pageTop + size * 0.27;
  const line3 = pageTop + size * 0.39;

  return isPageBorder || isTextLine(line1) || isTextLine(line2) || isTextLine(line3);
}

function encodePNG(pixels, width, height) {
  // Build raw image data with filter bytes
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0; // filter: None
    pixels.copy(
      rawData,
      y * (1 + width * 4) + 1,
      y * width * 4,
      (y + 1) * width * 4
    );
  }

  // Compress with zlib
  const compressed = zlib.deflateSync(rawData);

  // Build PNG file
  const chunks = [];

  // PNG signature
  chunks.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  chunks.push(createChunk("IHDR", ihdr));

  // IDAT chunk
  chunks.push(createChunk("IDAT", compressed));

  // IEND chunk
  chunks.push(createChunk("IEND", Buffer.alloc(0)));

  return Buffer.concat(chunks);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, "ascii");
  const crcData = Buffer.concat([typeBuffer, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

// CRC32 implementation for PNG chunks
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Generate both icon sizes
console.log("Generating QuickNote icons...");

const icon48 = createPNG(48);
fs.writeFileSync("icon48.png", icon48);
console.log("  Created icon48.png (48x48)");

const icon128 = createPNG(128);
fs.writeFileSync("icon128.png", icon128);
console.log("  Created icon128.png (128x128)");

console.log("Done! Icons are ready for the Chrome extension.");
