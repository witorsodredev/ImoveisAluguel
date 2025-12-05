
/**
 * Import jsonwebtoken para autenticaçào na pagina principal administrativa
 */

const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "Teste";
// Middleware simples para verificar token
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

/**
 * server.js - VERSÃO COMPLETA COM PERSISTÊNCIA
 * 
 * Adicionado:
 * - Salvamento de imóveis em JSON
 * - Endpoint para listar imóveis
 * - Endpoint para adicionar imóvel
 */

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========================================
// CONFIGURAÇÃO DE PERSISTÊNCIA
// ========================================

/**
 * Caminho do arquivo de dados
 * 
 * Armazena todos os imóveis em formato JSON
 */
const DATA_FILE = path.join(__dirname, 'data', 'properties.json');

/**
 * Cria pasta data se não existir
 */
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Inicializa arquivo de dados se não existir
 */
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

/**
 * Lê imóveis do arquivo
 * 
 * @returns {Array} Lista de imóveis
 */
function readProperties() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler arquivo de dados:', error);
    return [];
  }
}

/**
 * Salva imóveis no arquivo
 * 
 * @param {Array} properties - Lista de imóveis
 */
function writeProperties(properties) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(properties, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar arquivo de dados:', error);
    return false;
  }
}

// ========================================
// CONFIGURAÇÃO DO MULTER (igual ao anterior)
// ========================================

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas imagens são aceitas.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// ========================================
// ROTAS DA API
// ========================================

/**
 * ROTA: GET /api/properties
 * 
 * Lista todos os imóveis cadastrados
 * 
 * Retorna array de imóveis do arquivo JSON
 */
app.get('/api/properties', (req, res) => {
  const properties = readProperties();
  res.json(properties);
});

/**
 * ROTA: POST /api/properties
 * 
 * Adiciona novo imóvel
 * 
 * FLUXO:
 * 1. Recebe dados do imóvel (com URLs das imagens já enviadas)
 * 2. Lê imóveis existentes
 * 3. Adiciona novo imóvel
 * 4. Salva no arquivo
 * 5. Retorna imóvel criado
 */
app.post('/api/properties', verifyToken, (req, res) => {
  try {
    /**
     * Valida dados obrigatórios
     */
    const requiredFields = ['title', 'description', 'price', 'location', 'bedrooms', 'bathrooms', 'area', 'type', 'images', 'contact'];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ 
          error: `Campo obrigatório ausente: ${field}` 
        });
      }
    }

    /**
     * Lê imóveis existentes
     */
    const properties = readProperties();

    /**
     * Cria novo imóvel
     * 
     * Gera ID único baseado no maior ID existente
     */
    const newProperty = {
      id: properties.length > 0 ? Math.max(...properties.map(p => p.id)) + 1 : 1,
      ...req.body,
      available: true,
      createdAt: new Date().toISOString()
    };

    /**
     * Adiciona à lista
     */
    properties.push(newProperty);

    /**
     * Salva no arquivo
     */
    const saved = writeProperties(properties);

    if (!saved) {
      return res.status(500).json({ 
        error: 'Erro ao salvar imóvel' 
      });
    }

    /**
     * Retorna imóvel criado
     */
    res.status(201).json({
      message: 'Imóvel cadastrado com sucesso',
      property: newProperty
    });

  } catch (error) {
    console.error('Erro ao criar imóvel:', error);
    res.status(500).json({ 
      error: 'Erro interno ao criar imóvel',
      details: error.message 
    });
  }
});

/**
 * ROTA: DELETE /api/properties/:id
 * 
 * Remove imóvel e suas imagens
 */
app.delete('/api/properties/:id', verifyToken, (req, res) => {
  try {
    const id = parseInt(req.params.id);

    /**
     * Lê imóveis
     */
    let properties = readProperties();

    /**
     * Encontra imóvel
     */
    const property = properties.find(p => p.id === id);

    if (!property) {
      return res.status(404).json({ 
        error: 'Imóvel não encontrado' 
      });
    }

    /**
     * Remove imagens do disco
     */
    if (property.images && property.images.length > 0) {
      property.images.forEach(imageUrl => {
        const filename = imageUrl.split('/').pop();
        const filePath = path.join(uploadDir, filename);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    /**
     * Remove imóvel da lista
     */
    properties = properties.filter(p => p.id !== id);

    /**
     * Salva
     */
    writeProperties(properties);

    res.json({ 
      message: 'Imóvel removido com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao remover imóvel:', error);
    res.status(500).json({ 
      error: 'Erro ao remover imóvel',
      details: error.message 
    });
  }
});

// Rotas de upload (mantém as anteriores)
app.post('/api/upload', verifyToken, upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ 
      error: 'Nenhuma imagem foi enviada' 
    });
  }

  const imageUrls = req.files.map(file => {
    return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
  });

  res.json({
    message: 'Upload realizado com sucesso',
    images: imageUrls,
    count: imageUrls.length
  });
});

app.delete('/api/upload/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ 
      error: 'Arquivo não encontrado' 
    });
  }

  try {
    fs.unlinkSync(filePath);
    res.json({ 
      message: 'Imagem removida com sucesso' 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao remover imagem',
      details: error.message 
    });
  }
});

app.get('/api/health', verifyToken, (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'Arquivo muito grande. Máximo 5MB por imagem.' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'Muitos arquivos. Máximo 5 imagens.' 
      });
    }
    return res.status(400).json({ 
      error: err.message 
    });
  }

  if (err.message.includes('não permitido')) {
    return res.status(400).json({ 
      error: err.message 
    });
  }

  res.status(500).json({ 
    error: 'Erro interno do servidor',
    details: err.message 
  });
});


// API PARA ACESSO ADMINISTRATIVO DA PAGINA DASHBOARD
app.post("/api/token-login", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token não informado" });
  }

  if (token !== ACCESS_TOKEN) {
    return res.status(401).json({ error: "Token inválido" });
  }

  return res.json({
    ok: true,
    name: "Administrador",
    token: ACCESS_TOKEN
  });
});



// TESTE EDIT ////////////////////////////////////////////////////////////////////


// Rota GET para buscar um imóvel específico por ID
app.get('/api/properties/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Buscando imóvel com ID: ${id}`);

  try {
    // Ler o arquivo JSON atual (que é um array diretamente)
    const properties = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

    // Encontrar o imóvel pelo ID
    const property = properties.find(p => p.id === parseInt(id));

    if (!property) {
      console.log(`Imóvel com ID ${id} não encontrado`);
      return res.status(404).json({ error: 'Imóvel não encontrado' });
    }

    console.log(`Imóvel encontrado: ${property.title}`);
    res.json(property);

  } catch (error) {
    console.error('Erro ao buscar imóvel:', error);
    res.status(500).json({ error: 'Erro ao buscar imóvel' });
  }
});


// Rota PUT para atualizar um imóvel existente
app.put('/api/properties/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Atualizando imóvel com ID: ${id}`);
  const updatedProperty = req.body;

  try {
    // Ler o arquivo JSON atual (array)
    const properties = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

    // Encontrar o índice do imóvel a ser atualizado
    const index = properties.findIndex(p => p.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ error: 'Imóvel não encontrado' });
    }

    // Preservar o ID original e atualizar os outros campos
    const property = {
      ...properties[index],
      ...updatedProperty,
      id: parseInt(id) // Garantir que o ID não mude
    };

    // Atualizar o imóvel no array
    properties[index] = property;

    // Salvar o arquivo JSON atualizado
    fs.writeFileSync(DATA_FILE, JSON.stringify(properties, null, 2));

    res.json({ 
      message: 'Imóvel atualizado com sucesso',
      property 
    });

  } catch (error) {
    console.error('Erro ao atualizar imóvel:', error);
    res.status(500).json({ error: 'Erro ao atualizar imóvel' });
  }
});



// Inicialização
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Servidor Backend Iniciado!           ║
╠════════════════════════════════════════╣
║   Porta: ${PORT}                       ╣
║   URL: http://localhost:${PORT}        ╣
║   Uploads: ${uploadDir}                ╣
║   Dados: ${DATA_FILE}                  ╣
╚════════════════════════════════════════╝
  `);
});

process.on('uncaughtException', (err) => {
  console.error('Erro não capturado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejeitada não tratada:', reason);
});
