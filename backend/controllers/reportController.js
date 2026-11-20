
const reportModel = require('../models/reportModel');

// Dashboard statistics
async function dashboardSummary(req, res) {
    try {
        const result = await reportModel.getDashboardSummary();
        res.status(200).json(result);
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            message: 'Failed to load dashboard information.'
        });
    }
}

// Recent sales
async function recentSales(req, res) {
    try {
        const result = await reportModel.getRecentSales();
        res.status(200).json(result);
    } catch (error) {
        console.error('Recent sales error:', error);
        res.status(500).json({
            message: 'Failed to load recent sales.'
        });
    }
}

// Weekly sales
async function weeklySales(req, res) {
    try {
        const result = await reportModel.getWeeklySales();
        res.status(200).json(result);
    } catch (error) {
        console.error('Weekly sales error:', error);
        res.status(500).json({
            message: 'Failed to load weekly sales.'
        });
    }
}

// Quick Summary
async function quickSummary(req, res) {
    try {
        const result = await reportModel.getQuickSummary();
        res.status(200).json(result);
    } catch (error) {
        console.error('Quick summary error:', error);
        res.status(500).json({
            message: 'Failed to load quick summary.'
        });
    }
}

// Top five fruits
async function topFruits(req, res) {
    try {
        const result = await reportModel.getTopFruits();
        res.status(200).json(result);
    } catch (error) {
        console.error('Top fruits error:', error);
        res.status(500).json({
            message: 'Failed to load top fruits report.'
        });
    }
}

// Revenue report
async function revenueReport(req, res) {
    try {
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({
                message: 'Please provide start_date and end_date.'
            });
        }

        const result = await reportModel.getRevenue(
            start_date,
            end_date
        );

        res.status(200).json(result);
    } catch (error) {
        console.error('Revenue report error:', error);
        res.status(500).json({
            message: 'Failed to load revenue report.'
        });
    }
}

// Top vendor
async function topVendor(req, res) {
    try {
        const result = await reportModel.getTopVendor();
        res.status(200).json(result);
    } catch (error) {
        console.error('Top vendor error:', error);
        res.status(500).json({
            message: 'Failed to load top vendor report.'
        });
    }
}

// Stock report
async function stockReport(req, res) {
    try {
        const result = await reportModel.getStockReport();
        res.status(200).json(result);
    } catch (error) {
        console.error('Stock report error:', error);
        res.status(500).json({
            message: 'Failed to load stock report.'
        });
    }
}

module.exports = {
    dashboardSummary,
    recentSales,
    weeklySales,
    quickSummary,
    topFruits,
    revenueReport,
    topVendor,
    stockReport
};
