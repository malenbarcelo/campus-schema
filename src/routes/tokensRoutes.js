const express = require('express')
const tokensController = require('../controllers/tokensController.js')
const router = express.Router()
const tokensFormsValidations = require('../validations/tokensFormsValidations.js')
const multer = require('multer')
const path = require('path')
const admMiddleware = require('../middlewares/admMiddleware.js')
const admsMiddleware = require('../middlewares/admsMiddleware.js')

//Multer config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve('public/files/assignTokens'))
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now()    
      const fileExtension = path.extname(file.originalname)   
      const fileName = file.originalname.replace(fileExtension,'')      
      cb(null, 'fileAssignTokens' + uniqueSuffix + fileExtension)
    }
  })

const upload = multer({storage: storage}) 

router.get('/generate',admMiddleware,tokensController.generate)
router.post('/generate',admMiddleware, tokensFormsValidations.generateTokensFormValidations,tokensController.store)
router.get('/assignation',admsMiddleware,tokensController.assignation)
router.post('/assignation',admsMiddleware,upload.single('fileAssignTokens'),tokensFormsValidations.assignTokensFormValidations,tokensController.assignationProcess)

module.exports = router
