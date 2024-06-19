const {body} = require('express-validator')
const db = require('../../database/models')

const simulatorsFormsValidations = {
    createSimulatorForm: [
        body('simulatorName')
            .notEmpty().withMessage('Ingrese un simulador').bail()
            .custom(async(value,{ req }) => {
                const simulatorName = await db.Simulators.findOne({where:{simulator_name:req.body.simulatorName}})
                if (simulatorName) {
                throw new Error('Ya existe el simulador ' + req.body.simulatorName)
                }
                return true
            })
        ],
        createExerciseForm: [
            body('selectSimulator')
                .custom(async(value,{ req }) => {
                    if(req.body.selectSimulator == 'default'){
                        throw new Error('Seleccione un simulador')
                    }
                    return true
                }),
            body('exerciseName')
                .notEmpty().withMessage('Complete el nombre del ejercicio').bail()
                .custom(async(value,{ req }) => {
                    const exercise = await db.Exercises.findOne({
                        where:{exercise_name:req.body.exerciseName},
                        nest:true,
                        raw:true
                    })
                    if (exercise && exercise.id_simulators == req.body.selectSimulator) {
                    throw new Error('Ya existe el ejercicio ' + req.body.exerciseName + ' para el simulador seleccionado')
                    }
                    
                    return true
                }),
            ]
}

module.exports = simulatorsFormsValidations