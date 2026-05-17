function meta(req) {
  return { timestamp: new Date().toISOString(), requestId: req && req.id ? req.id : null };
}

function ok(res, data, status, req) {
  return res.status(status || 200).json({ success: true, ...data, meta: meta(req) });
}

function fail(res, message, status, code, req) {
  return res.status(status || 400).json({ success: false, error: message, code: code || "BAD_REQUEST", meta: meta(req) });
}

const CODES = {
  BAD_REQUEST:      "BAD_REQUEST",
  UNAUTHORIZED:     "UNAUTHORIZED",
  FORBIDDEN:        "FORBIDDEN",
  NOT_FOUND:        "NOT_FOUND",
  FILE_TOO_LARGE:   "FILE_TOO_LARGE",
  UNSUPPORTED_TYPE: "UNSUPPORTED_TYPE",
  EMPTY_FILE:       "EMPTY_FILE",
  PARSE_ERROR:      "PARSE_ERROR",
  RATE_LIMITED:     "RATE_LIMITED",
  SERVER_ERROR:     "SERVER_ERROR",
};

module.exports = { ok, fail, CODES };
