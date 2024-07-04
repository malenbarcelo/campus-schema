const express = require('express')
const multer = require('multer')
const path = require('path')
const usersController = require('../controllers/usersController.js')
const apisController = require('../controllers/apisController.js')
const admMiddleware = require('../middlewares/admMiddleware.js')
const authMiddleware = require('../middlewares/authMiddleware.js')
const admsMiddleware = require('../middlewares/admsMiddleware.js')
const teacherMiddleware = require('../middlewares/teacherMiddleware.js')
const router = express.Router()

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

//users
router.get('/users',admsMiddleware,apisController.users)
router.get('/users/users-categories',admsMiddleware,apisController.usersCategories)
router.post('/users/block-users',admsMiddleware,apisController.blockUsers)
router.post('/users/assign-commission',admsMiddleware,apisController.assignCommission)
router.post('/users/restore-passwords',apisController.restorePasswords)
router.post('/users/edit-user-data',admsMiddleware,apisController.editUserData)
router.post('/users/create-users',admsMiddleware,apisController.createUsers)
router.post('/users/read-excel-file',admsMiddleware,upload.single('excelFile'),apisController.readExcelFile)
router.get('/users/company-users/:idCompany',admsMiddleware,apisController.companyUsers)
router.get('/users/:email',apisController.loginValidation)
router.get('/users/find-user/:email',apisController.loginValidation) //API to Novaoil Rockit

//companies
router.get('/companies',admsMiddleware,apisController.companies)

//courses
router.get('/courses',admsMiddleware,apisController.courses)

//commissions
router.get('/commissions',admsMiddleware,apisController.commissions)
router.get('/commissions/user-commissions/:idCompany/:idUser',admsMiddleware,apisController.userCommissionCompany)
router.post('/commissions/delete-commissions-students',admsMiddleware,apisController.deleteCommissionsStudents)
router.post('/commissions/add-commissions-students',admsMiddleware,apisController.addCommissionsStudents)

//tokens
router.get('/tokens/tokens-to-assign/:idUserCategory/:idCompany',apisController.tokensToAssign)














router.get('/courses-filtered',authMiddleware,apisController.coursesFiltered)
router.post('/exercises',apisController.storeResults)
router.get('/user-exercises',authMiddleware,apisController.userLoggedExercises)
router.get('/not-assigned-tokens',admsMiddleware,apisController.notAssignedTokens)

router.get('/commissions/:idCommission',teacherMiddleware,apisController.studentsExercises)
router.get('/commission-data/:idCommission',teacherMiddleware,apisController.commissionData)
//router.get('/commission-data/:idCommission',apisController.commissionData)
router.get('/exercise-steps/:idExercise',teacherMiddleware,apisController.exerciseSteps)
router.get('/exercises-results/:idExercise/:idStudent',teacherMiddleware,apisController.exercisesResults)
//router.get('/exercises-results/:idExercise/:idStudent',apisController.exercisesResults)
router.get('/exercise-answers/:idExercise/:idStudent',teacherMiddleware,apisController.exerciseAnswers)
router.get('/steps-wrong-anwers/:idExercise',authMiddleware,apisController.userLoggedWrongAnswers)
router.get('/company-courses/:idCompany',admsMiddleware,apisController.companyCourses)
router.get('/company-teachers/:idCompany',admsMiddleware,apisController.companyTeachers)
router.get('/company-students/:idCompany',admsMiddleware,apisController.companyStudents)




module.exports = router
