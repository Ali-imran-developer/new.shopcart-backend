require("dotenv").config();
const { Redis } = require("@upstash/redis");

let redis;
const redisConnect = () => {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log("Connected to Redis via Upstash.");
  }
  return redis;
};

module.exports = redisConnect;