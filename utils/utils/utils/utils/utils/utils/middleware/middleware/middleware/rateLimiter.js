const rateLimit       = require("express-rate-limit");
const config          = require("../utils/config");
const { fail, CODES } = require("../utils/respond");

const rateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max:      config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders:   false,
  skip:    (req) => req.path === "/api/health",
  handler: (req, res) => fail(res, "Too many requests. Slow down and try again.", 429, CODES.RATE_LIMITED, req),
});

const uploadLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max:      20,
  standardHeaders: true,
  legacyHeaders:   false,
  handler: (req, res) => fail(res, "Upload limit reached. Max 20 files per 15 minutes.", 429, CODES.RATE_LIMITED, req),
});

module.exports = { rateLimiter, uploadLimiter };
