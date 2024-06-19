const db = require('../../database/models')
const {validationResult} = require('express-validator')

//Controllers
const simulatorsController = {
    createSimulator: async(req,res) => {
      try{
        return res.render('simulators/createSimulator',{title:'Crear simulador'})
      }catch(error){
        return res.send('Error')
      }
    },
    storeSimulator: async(req,res) => {
      try{

        const resultValidation = validationResult(req)

            if(resultValidation.errors.length > 0){
                return res.render('simulators/createSimulator',{
                    errors:resultValidation.mapped(),
                    oldData: req.body,
                    title:'Crear simulador',
                    })
            }

        const successMessage = 'Simulador creado con éxito'

        await db.Simulators.create({
          simulator_name: req.body.simulatorName,
          description: req.body.simulatorDescription,
          enabled: 1,
        }) 
        return res.render('simulators/createSimulator',{title:'Crear simulador',successMessage})
      }catch(error){
        return res.send('Error')
      }
    },
    createExercise: async(req,res) => {
      try{
        const simulators = await db.Simulators.findAll({
          attributes:['id','simulator_name'],
          order:[['simulator_name','ASC']],
          nest:true,
          raw:true
        })
        return res.render('simulators/createExercise',{title:'Crear ejercicio',simulators})
      }catch(error){
        return res.send('Error')
      }
    },
    storeExercise: async(req,res) => {
      try{
        const resultValidation = validationResult(req)
        const simulators = await db.Simulators.findAll({
          attributes:['id','simulator_name'],
          order:[['simulator_name','ASC']],
          nest:true,
          raw:true
        })

        if(resultValidation.errors.length > 0){
          
          return res.render('simulators/createExercise',{
                errors:resultValidation.mapped(),
                oldData: req.body,
                title:'Crear ejercicio',
                simulators
                })
        }

        await db.Exercises.create({
          exercise_name: req.body.exerciseName,
          exercise_description: req.body.exerciseDescription,
          id_simulators:req.body.selectSimulator,
          enabled: 1,
        })

        successMessage = 'Ejercicio creado con éxito'

        return res.render('simulators/createExercise',{title:'Crear ejercicio',simulators,successMessage})
      }catch(error){
        return res.send('Ha ocurrido un error')
      }
    },
    simulatorsData: async(req,res) => {
      try{
        const simulators = await db.Simulators.findAll({
          order:[['simulator_name',"ASC"]],
          raw:true
        })
        return res.render('simulators/allSimulators',{title:'Simuladores',simulators})
      }catch(error){
        return res.send('Error')
      }
    },
    exercisesData: async(req,res) => {
      try{
        const exercises = await db.Exercises.findAll({
         order:[['exercise_name',"ASC"]],
          raw:true,
          nest:true,
          include:[{all:true}]
        })
        return res.render('simulators/allExercises',{title:'Ejercicio',exercises})
      }catch(error){
        return res.send('Error')
      }
    },          
}
module.exports = simulatorsController

