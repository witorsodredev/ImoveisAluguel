const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'Teste';

exports.tokenLogin = (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token não informado' });
  }

  if (token !== ACCESS_TOKEN) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  res.json({
    ok: true,
    name: 'Administrador',
    token: ACCESS_TOKEN
  });
};
