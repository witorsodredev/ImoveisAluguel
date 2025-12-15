const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

// Rota GET para listar todos os imóveis
router.get('/', propertyController.getAllProperties);

// Rota POST para adicionar um novo imóvel
router.post('/', propertyController.addProperty);

// Rota DELETE para remover um imóvel
router.delete('/:id', propertyController.deleteProperty);

// Rota GET para buscar um imóvel específico
router.get('/:id', propertyController.getPropertyById);

// Rota PUT para atualizar um imóvel
router.put('/:id', propertyController.updateProperty);

module.exports = router;
