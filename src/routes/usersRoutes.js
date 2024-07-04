const express = require('express')
const usersController = require('../controllers/usersController.js')
const router = express.Router()
const userFormsValidations = require('../validations/userFormsValidations.js')
const guestMiddleWare = require('../middlewares/guestMiddleware.js')
const authMiddleware = require('../middlewares/authMiddleware.js')
const admMiddleware = require('../middlewares/admMiddleware.js')


router.get('/create-company',admMiddleware,usersController.createCompany)
router.post('/create-company',admMiddleware,userFormsValidations.createCompanyFormValidations,usersController.processCreateCompany)
router.get('/change-password',usersController.changePassword)
router.post('/change-password',userFormsValidations.changePswFormValidations,usersController.processChangePassword)
router.get('/login',guestMiddleWare,usersController.login)
router.post('/login',userFormsValidations.loginFormValidations,usersController.processLogin)


router.get('/logout',authMiddleware,usersController.logout)

//router.get('/',guestMiddleWare,usersController.login)

router.get('/logout',authMiddleware,usersController.logout)


router.get('/restore-password',admMiddleware,usersController.restorePassword)
router.post('/restore-password',admMiddleware,userFormsValidations.restorePswFormValidations,usersController.processRestorePassword)

///2.0
router.get('/',usersController.users)


module.exports = router
