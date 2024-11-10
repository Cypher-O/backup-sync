import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
  // 15 minutes
  windowMs: 15 * 60 * 1000,
  // Limit each IP to 100 requests per windowMs
  max: 100,
  message: "Too many requests, please try again later.",
});
