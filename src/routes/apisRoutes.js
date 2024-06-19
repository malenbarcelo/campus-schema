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
router.get('/users',apisController.users)
router.get('/users/users-categories',apisController.usersCategories)
router.post('/users/block-users',apisController.blockUsers)
router.post('/users/assign-commission',apisController.assignCommission)
router.post('/users/restore-passwords',apisController.restorePasswords)
router.post('/users/edit-user-data',apisController.editUserData)
router.post('/users/create-users',apisController.createUsers)
router.post('/users/read-excel-file',upload.single('excelFile'),apisController.readExcelFile)
router.get('/users/:idCompany',apisController.companyUsers)
router.get('/users/find-user/:email',apisController.loginValidation) //API to Novaoil Rockit

//companies
router.get('/companies',apisController.companies)

//courses
router.get('/courses',apisController.courses)

//commissions
router.get('/commissions',apisController.commissions)
router.get('/commissions/user-commissions/:idCompany/:idUser',apisController.userCommissionCompany)
router.post('/commissions/delete-commissions-students',apisController.deleteCommissionsStudents)
router.post('/commissions/add-commissions-students',apisController.addCommissionsStudents)

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
