const express = require('express')
const coursesController = require('../controllers/coursesController.js')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const {body} = require('express-validator')
const coursesFormsValidations = require('../validations/coursesFormsValidations.js')
const admsMiddleware = require('../middlewares/admsMiddleware.js')
const admMiddleware = require('../middlewares/admMiddleware.js')
const authMiddleware = require('../middlewares/authMiddleware.js')
const teacherMiddleware = require('../middlewares/teacherMiddleware.js')

//Multer config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve('public/files/assignStudents'))
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now()    
      const fileExtension = path.extname(file.originalname)   
      const fileName = file.originalname.replace(fileExtension,'')      
      cb(null, 'fileAssignStudents' + uniqueSuffix + fileExtension)
    }
  })

const upload = multer({storage: storage})  

//Routes
router.get('/create-course',admsMiddleware,coursesController.createCourse)
router.post('/create-course',admsMiddleware,coursesFormsValidations.createCourseFormValidations,coursesController.storeCourse)
router.get('/create-commission',admsMiddleware,coursesController.createCommission)
router.post('/create-commission',admsMiddleware,coursesFormsValidations.createCommissionFormValidation,coursesController.storeCommission)
router.get('/my-courses',authMiddleware,coursesController.myCourses)
router.get('/commissions/:idCommission',coursesController.filterCommission)
router.get('/commissions/:idCommission/:idStudent',authMiddleware,coursesController.filterCommissionAndStudent)
router.get('/courses-data',admMiddleware,coursesController.coursesData)
router.get('/students-assignation',admsMiddleware,coursesController.assignStudents)
router.post('/students-assignation',admsMiddleware,upload.single('fileAssignStudents'),coursesFormsValidations.assignStudentsFormValidations,coursesController.processAssignStudents)

module.exports = router
