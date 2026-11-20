
const express = require('express');
const router = express.Router();

const {
    getStock,
    createStock
} = require('../controllers/stockController');

router.get('/', getStock);
router.post('/', createStock);

module.exports = router;
