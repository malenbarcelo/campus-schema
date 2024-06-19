const db = require('../../database/models')
//const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
const sequelize = require('sequelize');

const exercisesController = {
    storeResults: async(req,res) =>{
        try{
            const keys = Object.keys(req.body.answers)

            //store in exercises_results
            await db.Exercises_results.create({
                id_exercises: req.body.id_exercises,
                id_users: req.body.id_users,
                date: req.body.date,
                grade: req.body.grade,
                duration_secs: req.body.duration_secs
            })

            //get id of exercises_results
            const idExercisesResults = await db.Exercises_results.findOne({
                where:{
                    id_exercises: req.body.id_exercises,
                    id_users: req.body.id_users,
                    date: req.body.date,
                    grade: req.body.grade,
                    duration_secs: req.body.duration_secs
                },
                attributes:[[sequelize.fn('max', sequelize.col('id')),'max']],
                raw:true,
                nest:true
                })

            console.log(idExercisesResults.max)
            //store answers
            for (let i = 0; i < keys.length; i++) {
                await db.Exercises_answers.create({
                    id_exercises_results: idExercisesResults.max,
                    description: req.body.answers[i].description,
                    log_time: req.body.answers[i].log_time,
                    type: req.body.answers[i].type,
                    observations: req.body.answers[i].observations
                })
            }
            return res.status(200).json(req.body)
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
}
}
module.exports = exercisesController

