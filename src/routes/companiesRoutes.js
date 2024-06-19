const express = require('express')
const companiesController = require('../controllers/companiesController.js')
const router = express.Router()
const admsMiddleware = require('../middlewares/admsMiddleware.js')
const admMiddleware = require('../middlewares/admMiddleware.js')
const authMiddleware = require('../middlewares/authMiddleware.js')
const teacherMiddleware = require('../middlewares/teacherMiddleware.js')

//Routes
router.get('/view-companies',companiesController.viewCompanies)


module.exports = router
