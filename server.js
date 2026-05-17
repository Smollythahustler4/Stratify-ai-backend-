require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");

const config = require("./utils/config");

const { initSentry, sentryErrorHandler } = require("./middleware/sentry");
const { requestId }                      = require("./middleware/requestId");
const { createLogger }                   = require("./middleware/logger");
const { rateLimiter }                    = require("./middleware/rateLimiter");
const { authenticate }                   = require("./middleware/auth");
const { fail, CODES }                    = require("./utils/respond");

const healthRoutes   = require("./routes/health");
const cleanRoutes    = require("./routes/clean");
const downloadRoutes = require("./routes/download");
const formatsRoutes  = require("./routes/formats");

const app = express();

initSentry(app);
app.use(requestId);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" }, contentSecurityPolicy: false }));
app.use(cors({ origin: config.corsOrigin, methods: ["GET", "POST", "OPTIONS"], allowedHeaders: ["Content-Type", "x-api-key", "Authorization", "x-request-id"], exposedHeaders: ["X-Request-ID", "Content-Disposition"] }));
app.options("*", cors());
app.use(createLogger());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(rateLimiter);
app.use(authenticate);

app.use("/api", healthRoutes);
app.use("/api", cleanRoutes);
app.use("/api", downloadRoutes);
app.use("/api", formatsRoutes);

app.get("/", (req, res) => {
  res.json({
    product: "Stratify AI API",
    version: "1.0.0",
    status: "running",
    environment: config.env,
    endpoints: {
      health:   "GET  /api/health",
      formats:  "GET  /api/formats",
      clean:    "POST /api/clean",
      download: "GET  /api/download/:fileId",
    },
  });
});

sentryErrorHandler(app);

app.use((err, req, res, _next) => {
  console.error("[ERROR]", err.message);
  if (err.code === "LIMIT_FILE_SIZE") {
    return fail(res, `File too large. Max is ${config.maxFileSizeMb} MB.`, 413, CODES.FILE_TOO_LARGE, req);
  }
  if (err.status) return fail(res, err.message, err.status, CODES.BAD_REQUEST, req);
  return fail(res, config.isProd ? "Unexpected error." : err.message, 500, CODES.SERVER_ERROR, req);
});

app.use((req, res) => {
  fail(res, `Route not found: ${req.method} ${req.path}`, 404, CODES.NOT_FOUND, req);
});

const server = app.listen(config.port, () => {
  console.log(`\n✅ Stratify AI API running on port ${config.port}`);
  console.log(`   Auth   : ${config.apiKey ? "API key required" : "No API key set"}`);
  console.log(`   AI     : ${config.anthropicApiKey ? "Claude AI enabled" : "Rule-based only"}`);
  console.log(`   Sentry : ${config.sentryDsn ? "Enabled" : "Disabled"}\n`);
});

function shutdown(signal) {
  console.log(`\n[SHUTDOWN] ${signal} received...`);
  server.close(() => { console.log("[SHUTDOWN] Done."); process.exit(0); });
  setTimeout(() => process.exit(1), 10000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));
process.on("unhandledRejection", (r) => console.error("[UNHANDLED]", r));
process.on("uncaughtException",  (e) => { console.error("[UNCAUGHT]", e.message); shutdown("uncaughtException"); });

module.exports = app;
