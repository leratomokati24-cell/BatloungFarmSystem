
const fruitModel = require('../models/fruitModel');

// Get all fruits
async function getFruits(req, res) {
    try {
        const fruits = await fruitModel.getAllFruits();

        res.status(200).json(fruits);
    } catch (error) {
        console.error('Get fruits error:', error);

        res.status(500).json({
            message: 'Failed to retrieve fruits.'
        });
    }
}

// Add a new fruit
async function createFruit(req, res) {
    try {
        const { fruit_name, description, status } = req.body;

        if (!fruit_name || !fruit_name.trim()) {
            return res.status(400).json({
                message: 'Fruit name is required.'
            });
        }

        const result = await fruitModel.createFruit({
            fruit_name: fruit_name.trim(),
            description: description || '',
            status: status || 'ACTIVE'
        });

        res.status(201).json({
            message: 'Fruit added successfully.',
            fruit_id: result.insertId
        });
    } catch (error) {
        console.error('Create fruit error:', error);

        res.status(500).json({
            message: 'Failed to add fruit.'
        });
    }
}

// Edit fruit details
async function editFruit(req, res) {
    try {
        const { id } = req.params;
        const { fruit_name, description, status } = req.body;

        if (!fruit_name || !fruit_name.trim()) {
            return res.status(400).json({
                message: 'Fruit name is required.'
            });
        }

        await fruitModel.updateFruit(id, {
            fruit_name: fruit_name.trim(),
            description: description || '',
            status: status || 'ACTIVE'
        });

        res.status(200).json({
            message: 'Fruit updated successfully.'
        });
    } catch (error) {
        console.error('Edit fruit error:', error);

        res.status(500).json({
            message: 'Failed to update fruit.'
        });
    }
}

// Activate or deactivate a fruit
async function changeFruitStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['ACTIVE', 'INACTIVE'].includes(status)) {
            return res.status(400).json({
                message: 'Status must be ACTIVE or INACTIVE.'
            });
        }

        await fruitModel.updateFruitStatus(id, status);

        res.status(200).json({
            message: 'Fruit status updated successfully.'
        });
    } catch (error) {
        console.error('Change fruit status error:', error);

        res.status(500).json({
            message: 'Failed to update fruit status.'
        });
    }
}

// Delete a fruit
async function removeFruit(req, res) {
    try {
        const { id } = req.params;

        await fruitModel.deleteFruit(id);

        res.status(200).json({
            message: 'Fruit deleted successfully.'
        });
    } catch (error) {
        console.error('Delete fruit error:', error);

        res.status(500).json({
            message: 'Failed to delete fruit.'
        });
    }
}

module.exports = {
    getFruits,
    createFruit,
    editFruit,
    changeFruitStatus,
    removeFruit
};
