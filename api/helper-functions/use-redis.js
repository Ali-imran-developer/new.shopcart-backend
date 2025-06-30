const redisConnect = require("../redisConnect");

const setCache = async (key, data, expirySeconds = 60 * 20) => {
  try {
    const client = redisConnect();
    await client.set(key, JSON.stringify(data), { ex: expirySeconds });
    console.log(`✅ Redis set for key: ${key}`);
  } catch (err) {
    console.error("❌ Redis SET error:", err);
  }
};

const getCache = async (key) => {
  try {
    const client = redisConnect();
    const cached = await client.get(key);
    if (!cached) return null;
    if (typeof cached === "object" && Array.isArray(cached)) {
      return cached;
    }
    if (typeof cached === "string") {
      const trimmed = cached.trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        return JSON.parse(trimmed);
      }
    }
    console.warn("⚠️ Cached value is neither valid JSON nor a usable object.");
    return null;
  } catch (err) {
    console.error("❌ Redis GET error:", err.message);
    return null;
  }
};

module.exports = { setCache, getCache };
