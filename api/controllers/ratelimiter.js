// require("dotenv").config();
// const { Redis } = require("@upstash/redis");

// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN,
// });

// const rateLimiter = (limit = 10, windowSeconds = 1) => {
//   return async (req, res, next) => {
//     try {
//       const ip =
//         req.ip ||
//         req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
//         "unknown";

//       const key = `ratelimit:${ip}`;
//       const count = await redis.incr(key);

//       if (count === 1) {
//         await redis.expire(key, windowSeconds);
//       }

//       if (count > limit) {
//         return res.status(429).json({
//           success: false,
//           error: "Too many requests. Please slow down.",
//         });
//       }

//       next();
//     } catch (err) {
//       console.error("Rate limiter error:", err);
//       next();
//     }
//   };
// };

// module.exports = rateLimiter;