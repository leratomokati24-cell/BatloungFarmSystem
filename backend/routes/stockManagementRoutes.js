const express = require('express');

const router = express.Router();

const {
    getAllStock
} = require('../controllers/stockManagementController');

router.get('/', getAllStock);

module.exports = router;