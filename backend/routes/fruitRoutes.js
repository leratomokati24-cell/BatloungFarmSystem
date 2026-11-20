
const express = require('express');
const router = express.Router();

const {
    getFruits,
    createFruit,
    editFruit,
    changeFruitStatus,
    removeFruit
} = require('../controllers/fruitController');

// Get all fruits
router.get('/', getFruits);

// Add a fruit
router.post('/', createFruit);

// Edit fruit details
router.put('/:id', editFruit);

// Activate or deactivate a fruit
router.patch('/:id/status', changeFruitStatus);

// Delete a fruit
router.delete('/:id', removeFruit);

module.exports = router;
