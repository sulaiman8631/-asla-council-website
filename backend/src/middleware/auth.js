const jwt = require("jsonwebtoken");
const { fail } = require("../lib/response");

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return fail(res, "غير مصرح بالدخول", 401);
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload;
    return next();
  } catch (err) {
    return fail(res, "جلسة الدخول غير صالحة أو منتهية", 401);
  }
}

module.exports = auth;
