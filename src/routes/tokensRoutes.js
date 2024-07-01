const express = require('express')
const tokensController = require('../controllers/tokensController.js')
const router = express.Router()
const tokensFormsValidations = require('../validations/tokensFormsValidations.js')
const multer = require('multer')
const path = require('path')
const admMiddleware = require('../middlewares/admMiddleware.js')
const admsMiddleware = require('../middlewares/admsMiddleware.js')

router.get('/generate',admMiddleware,tokensController.generate)
router.post('/generate',admMiddleware, tokensFormsValidations.generateTokensFormValidations,tokensController.store)


module.exports = router
