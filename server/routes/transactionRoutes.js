const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// @desc    Get all transactions
// @route   GET /api/transactions
router.get('/', async (req, res) => {
    console.log('GET /api/transactions hit');
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (err) {
        console.error('Fetch Error:', err);
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// @desc    Add transaction
// @route   POST /api/transactions
router.post('/', async (req, res) => {
    console.log('POST /api/transactions hit', req.body);
    try {
        const { description, amount, type } = req.body;
        const transaction = await Transaction.create({ description, amount, type });
        return res.status(201).json({
            success: true,
            data: transaction
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages
            });
        } else {
            console.error('Add Transaction Error:', err);
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
    }
});

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'No transaction found'
            });
        }

        await transaction.deleteOne();

        return res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.error('Delete Error:', err);
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = router;
