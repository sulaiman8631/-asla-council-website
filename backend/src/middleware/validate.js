const { validationResult } = require("express-validator");
const { fail } = require("../lib/response");

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return fail(res, errors.array()[0].msg, 400);
  }
  return next();
}

module.exports = validate;
