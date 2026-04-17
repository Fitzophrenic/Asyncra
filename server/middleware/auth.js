// middleware/auth.js
// This runs on every protected route before the actual route code
// It checks that the request has a valid JWT token
// If the token is valid it extracts the user's ID and adds it to the request
// If the token is missing or invalid it blocks the request with a 401 error

const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {

  // grab the Authorization header from the request
  // it should look like: "Bearer eyJhbGci..."
  const authHeader = req.headers.authorization;

  // if there's no Authorization header at all, block the request
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  // pull out just the token part after "Bearer "
  const token = authHeader.split(" ")[1];

  try {
    // verify the token using your JWT secret from .env
    // if the token was tampered with or expired this will throw an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach the user's ID to the request object
    // now any route that uses this middleware can access req.userId
    req.userId = decoded.userId;

    // call next() to move on to the actual route handler
    next();

  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;