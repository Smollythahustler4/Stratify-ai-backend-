const csvParser    = require("csv-parser");
const xlsx         = require("xlsx");
const { Readable } = require("stream");
const path         = require("path");
const { getFileType } = require("./fileTypes");

async function parseFile(buffer, originalName) {
  const fileType = getFileType(originalName);

  if (!fileType) {
    throw Object.assign(new Error(`Unsupported file type: ${path.extname(originalName)}`), { status: 415 });
  }

  if (fileType.category === "tabular") {
    const ext = path.extname(originalName).toLowerCase();
    if (ext === ".csv")                    return { rows: await parseCsv(buffer, ","),  content: null, fileType };
    if (ext === ".tsv" || ext === ".tab")  return { rows: await parseCsv(buffer, "\t"), content: null, fileType };
    if (ext === ".xlsx" || ext === ".xls") return { rows: parseExcel(buffer),            content: null, fileType };
  }

  if (fileType.key === "json") {
    const text = buffer.toString("utf8");
    try {
      const parsed = JSON.parse(text);
      return { rows: Array.isArray(parsed) ? parsed : null, content: text, fileType };
    } catch (e) {
      throw Object.assign(new Error(`Invalid JSON: ${e.message}`), { status: 422 });
    }
  }

  let content;
  try   { content = buffer.toString("utf8"); }
  catch { content = buffer.toString("latin1"); }

  return { rows: null, content, fileType };
}

function parseCsv(buffer, separator) {
  return new Promise((resolve, reject) => {
    const rows   = [];
    const stream = Readable.from(buffer.toString("utf8"));
    stream
      .pipe(csvParser({ separator }))
      .on("data",  (row) => rows.push(row))
      .on("end",   ()    => resolve(rows))
      .on("error", reject);
  });
}

function parseExcel(buffer) {
  const workbook  = xlsx.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet     = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet, { defval: "" });
}

module.exports = { parseFile };
