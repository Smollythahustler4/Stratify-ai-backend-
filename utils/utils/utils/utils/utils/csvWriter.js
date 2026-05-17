const { Parser } = require("json2csv");

function rowsToCsvBuffer(rows) {
  if (!rows || rows.length === 0) return Buffer.from("", "utf8");
  const fields = Object.keys(rows[0]);
  const parser = new Parser({ fields });
  return Buffer.from(parser.parse(rows), "utf8");
}

module.exports = { rowsToCsvBuffer };
