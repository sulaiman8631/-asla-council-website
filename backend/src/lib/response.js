function ok(res, data = null, message = "", status = 200) {
  return res.status(status).json({ success: true, data, message });
}

function fail(res, message = "حدث خطأ ما", status = 400) {
  return res.status(status).json({ success: false, message });
}

module.exports = { ok, fail };
