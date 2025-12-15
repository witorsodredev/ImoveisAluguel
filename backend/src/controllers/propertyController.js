const fs = require('fs');
const path = require('path');
const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'properties.json');

// Função para ler os imóveis
function readProperties() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler arquivo de dados:', error);
    return [];
  }
}

// Função para escrever os imóveis
function writeProperties(properties) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(properties, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar arquivo de dados:', error);
    return false;
  }
}

// Controlador para obter todos os imóveis
exports.getAllProperties = (req, res) => {
  const properties = readProperties();
  res.json(properties);
};

// Controlador para adicionar um imóvel
exports.addProperty = (req, res) => {
  const requiredFields = ['title', 'description', 'price', 'location', 'bedrooms', 'bathrooms', 'area', 'type', 'images'];
  
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({ error: `Campo obrigatório ausente: ${field}` });
    }
  }

  const properties = readProperties();
  const newProperty = {
    id: properties.length > 0 ? Math.max(...properties.map(p => p.id)) + 1 : 1,
    ...req.body,
    createdAt: new Date().toISOString(),
  };

  properties.push(newProperty);
  writeProperties(properties);

  res.status(201).json({ message: 'Imóvel cadastrado com sucesso', property: newProperty });
};

// Controlador para remover um imóvel
exports.deleteProperty = (req, res) => {
  const id = parseInt(req.params.id);
  let properties = readProperties();
  const property = properties.find(p => p.id === id);

  if (!property) {
    return res.status(404).json({ error: 'Imóvel não encontrado' });
  }

  properties = properties.filter(p => p.id !== id);
  writeProperties(properties);

  res.json({ message: 'Imóvel removido com sucesso' });
};

// Controlador para buscar um imóvel específico
exports.getPropertyById = (req, res) => {
  const id = parseInt(req.params.id);
  const properties = readProperties();
  const property = properties.find(p => p.id === id);

  if (!property) {
    return res.status(404).json({ error: 'Imóvel não encontrado' });
  }

  res.json(property);
};

// Controlador para atualizar um imóvel
exports.updateProperty = (req, res) => {
  const id = parseInt(req.params.id);
  const updatedProperty = req.body;
  const properties = readProperties();
  const index = properties.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Imóvel não encontrado' });
  }

  properties[index] = { ...properties[index], ...updatedProperty };
  writeProperties(properties);

  res.json({ message: 'Imóvel atualizado com sucesso', property: properties[index] });
};
