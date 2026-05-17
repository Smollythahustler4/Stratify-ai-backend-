function loadConfig() {
  const env    = process.env.NODE_ENV || "development";
  const isProd = env === "production";

  if (isProd && !process.env.API_KEY) {
    throw new Error("CONFIG ERROR: API_KEY must be set in production.");
  }

  const maxFileSizeMb = parseInt(process.env.MAX_FILE_SIZE_MB || "10", 10);
  if (isNaN(maxFileSizeMb) || maxFileSizeMb < 1 || maxFileSizeMb > 100) {
    throw new Error("CONFIG ERROR: MAX_FILE_SIZE_MB must be between 1 and 100.");
  }

  const fileTtlMs = parseInt(process.env.FILE_TTL_MS || "3600000", 10);
  if (isNaN(fileTtlMs) || fileTtlMs < 60000) {
    throw new Error("CONFIG ERROR: FILE_TTL_MS must be at least 60000.");
  }

  let corsOrigin = process.env.ALLOWED_ORIGIN || "*";
  if (isProd && corsOrigin === "*") {
    console.warn("[CONFIG] WARNING: ALLOWED_ORIGIN is * in production. Set it to your Lovable app URL.");
  }

  return {
    env,
    isProd,
    port:             parseInt(process.env.PORT || "3000", 10),
    apiKey:           process.env.API_KEY           || null,
    anthropicApiKey:  process.env.ANTHROPIC_API_KEY || null,
    sentryDsn:        process.env.SENTRY_DSN        || null,
    maxFileSizeMb,
    maxFileSizeBytes: maxFileSizeMb * 1024 * 1024,
    fileTtlMs,
    rateLimitMax:      parseInt(process.env.RATE_LIMIT_MAX       || "100",    10),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    corsOrigin,
    logLevel: process.env.LOG_LEVEL || (isProd ? "combined" : "dev"),
  };
}

let config;
try {
  config = loadConfig();
} catch (err) {
  console.error("\n❌", err.message, "\n");
  process.exit(1);
}

module.exports = config;
