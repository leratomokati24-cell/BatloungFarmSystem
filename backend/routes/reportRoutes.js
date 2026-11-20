
const express = require('express');
const router = express.Router();

const {
    dashboardSummary,
    recentSales,
    weeklySales,
    quickSummary,
    topFruits,
    revenueReport,
    topVendor,
    stockReport
} = require('../controllers/reportController');

router.get('/dashboard', dashboardSummary);
router.get('/recent-sales', recentSales);
router.get('/weekly-sales', weeklySales);
router.get('/quick-summary', quickSummary);

router.get('/top-fruits', topFruits);
router.get('/revenue', revenueReport);
router.get('/top-vendor', topVendor);
router.get('/stock', stockReport);

module.exports = router;
