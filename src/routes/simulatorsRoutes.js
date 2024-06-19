const express = require('express')
const simulatorsController = require('../controllers/simulatorsController.js')
const router = express.Router()
const path = require('path')
const {body} = require('express-validator')
const admMiddleware = require('../middlewares/admMiddleware.js')

const simulatorsFormsValidations = require('../validations/simulatorsFormsValidations.js')

//Routes
router.get('/create',admMiddleware,simulatorsController.createSimulator)
router.post('/create',admMiddleware,simulatorsFormsValidations.createSimulatorForm,simulatorsController.storeSimulator)
router.get('/create-exercise',admMiddleware,simulatorsController.createExercise)
router.post('/create-exercise',admMiddleware,simulatorsFormsValidations.createExerciseForm,simulatorsController.storeExercise)
router.get('/simulators-data',admMiddleware,simulatorsController.simulatorsData)
router.get('/exercises-data',admMiddleware,simulatorsController.exercisesData)

module.exports = router

