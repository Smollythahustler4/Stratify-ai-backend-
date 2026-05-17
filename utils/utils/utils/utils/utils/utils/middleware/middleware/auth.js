const config          = require("../utils/config");
const { fail, CODES } = require("../utils/respond");

const PUBLIC_PATHS = ["/api/health", "/"];

function authenticate(req, res, next) {
  if (PUBLIC_PATHS.includes(req.path)) return next();
  if (!config.apiKey) return next();

  const provided =
    req.headers["x-api-key"] ||
    req.query.apiKey ||
    (req.headers["authorization"] || "").replace(/^Bearer\s+/i, "");

  if (!provided) return fail(res, "Missing API key. Send it as the x-api-key header.", 401, CODES.UNAUTHORIZED, req);
  if (provided !== config.apiKey) return fail(res, "Invalid API key.", 403, CODES.FORBIDDEN, req);

  next();
}

module.exports = { authenticate };
