const express = require('express')
const indexController = require('../controllers/indexController.js')
const router = express.Router()
const userFormsValidations = require('../validations/userFormsValidations.js')
const guestMiddleWare = require('../middlewares/guestMiddleware.js')
const authMiddleware = require('../middlewares/authMiddleware.js')
const admMiddleware = require('../middlewares/admMiddleware.js')

router.get('/',guestMiddleWare,indexController.login)
router.post('/login',userFormsValidations.loginFormValidations,indexController.processLogin)
router.get('/logout',authMiddleware,indexController.logout)
router.get('/login',guestMiddleWare,indexController.login)

module.exports = router
