const { Parser } = require("json2csv");
const path       = require("path");

function serialize(parsed, originalName) {
  const { rows, content, fileType } = parsed;
  const base     = path.basename(originalName, path.extname(originalName));
  const filename = `${base}_cleaned${fileType.outputExt}`;

  if (rows && rows.length > 0) {
    const fields = Object.keys(rows[0]);
    const csv    = new Parser({ fields }).parse(rows);
    return { buffer: Buffer.from(csv, "utf8"), filename, mimeType: "text/csv; charset=utf-8" };
  }

  if (fileType.key === "json") {
    return { buffer: Buffer.from(content || "{}", "utf8"), filename, mimeType: "application/json; charset=utf-8" };
  }

  let mimeType = "text/plain; charset=utf-8";
  if (fileType.key === "html") mimeType = "text/html; charset=utf-8";
  if (fileType.key === "css")  mimeType = "text/css; charset=utf-8";

  return { buffer: Buffer.from(content || "", "utf8"), filename, mimeType };
}

module.exports = { serialize };
