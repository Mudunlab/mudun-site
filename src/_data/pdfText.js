// Automatically extracts plain text from every research PDF at build time,
// so the full research is readable as real webpage text (for search engines
// and AI tools), without ever touching or re-typesetting the original file.
// This runs once per site build and is cached as global data.
const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

module.exports = async function () {
  const uploadsDir = path.join(__dirname, "..", "uploads");
  const result = {};

  async function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.name.toLowerCase().endsWith(".pdf")) {
        try {
          const buffer = fs.readFileSync(fullPath);
          const parser = new PDFParse({ data: buffer });
          const { text } = await parser.getText();
          await parser.destroy();

          // Clean up pdf-parse's page-separator artifacts (e.g. "-- 1 of 3 --")
          const cleaned = text.replace(/--\s*\d+\s*of\s*\d+\s*--/g, "").trim();

          // Key by the public URL the CMS actually produces for this file,
          // e.g. a file at src/uploads/foo.pdf becomes "/uploads/foo.pdf"
          const relative = path
            .relative(path.join(__dirname, ".."), fullPath)
            .split(path.sep)
            .join("/");
          result["/" + relative] = cleaned;
        } catch (err) {
          // A PDF that can't be parsed (e.g. a scanned image with no real
          // text layer) is skipped silently — the download/view buttons
          // still work fine; there's just no extracted-text section for it.
          console.warn(
            `[pdfText] Could not extract text from ${fullPath}: ${err.message}`
          );
        }
      }
    }
  }

  await walk(uploadsDir);
  return result;
};
