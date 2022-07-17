const express = require('express');
const router = express.Router()

//actions from db
const {
    getPortfolios, 
    insertTickers,
    createPortfolio,
    renamePortfolio,
    deletePortfolio,
    addHoldings,
    updatePortfolio
} = require('../controllers/portfolio')

router.route('/')
    .get(getPortfolios)
    .post(createPortfolio)
    .put(renamePortfolio)
    .delete(deletePortfolio)

router.route('/holdings')
    .post(addHoldings)

router.route('/update')
    .post(updatePortfolio)

module.exports = router