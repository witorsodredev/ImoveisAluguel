const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "Teste";

function verifyToken(req, res, next) {
  const token = req.headers["x-access-token"];

  if (!token) {
    return res.status(401).json({ error: "Token ausente" });
  }

  if (token !== ACCESS_TOKEN) {
    return res.status(403).json({ error: "Token inválido" });
  }

  next();
}

module.exports = verifyToken;
