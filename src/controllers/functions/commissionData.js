const db = require('../../../database/models')
const sequelize = require('sequelize')

const commissionData = {
    idSimulators: async(idCommission) => {

        let idSimulators = []
        
        const commissionCourses = await db.Course_commissions.findOne({
            where:{id:idCommission},
            raw:true
        })

        const courseId = commissionCourses.id_courses

        const simulators = await db.Courses_simulators.findAll({
            attributes:[[sequelize.fn('DISTINCT', sequelize.col('id_simulators')), 'id_simulators']],
            where:{id_courses:courseId},
            raw:true
        })

        simulators.forEach(simulator => {
            idSimulators.push(simulator.id_simulators)            
        })

        return idSimulators
    },
    idStudents: async(idCommission) => {

        let idStudents = []
        
        const commissionStudents = await db.Course_commissions_students.findAll({
            attributes:[[sequelize.fn('DISTINCT', sequelize.col('id_students')), 'id_students']],
            where:{id_course_commissions:idCommission},
            raw:true
        })

        commissionStudents.forEach(student => {
            idStudents.push(student.id_students)            
        })

        return idStudents
    },
    data: async(idSimulators,idStudents) => {

        let students = await db.Users.findAll({
            where:{id:idStudents},
            order:[['last_name','ASC']],
            attributes:['id','first_name','last_name'],
            raw:true
        })

        //add exercises results
        students.forEach(student => {
            student.exercisesResults = ''
        })
        
        let data = await db.Simulators.findAll({
            where:{id:idSimulators},
            raw:true
        })

        for (let i = 0; i < data.length; i++) {

            //add exercises
            let exercises = await db.Exercises.findAll({
                where:{id_simulators:data[i].id},
                raw:true
            })

            data[i].exercises = exercises

            //add steps    
            for (let j = 0; j < data[i].exercises.length; j++) {
                const steps = await db.Exercises_answers.findAll({
                    where:{id_exercises:data[i].exercises[j].id},
                    attributes:[[sequelize.fn('DISTINCT', sequelize.col('description')), 'description']],
                    raw:true
                })

                steps.forEach(step => {
                    const splitData = step.description.split('_')
                    step.code = splitData[0]
                    step.stepName = splitData[1]
                })

                //order by code
                steps.sort((a,b)=> (a.code < b.code ? -1 : 1))

                data[i].exercises[j].steps = steps
            }

            //add students
            data[i].studentsResults = students
        }

        return data
    },
    exercisesResults: async(data) => {

        for (let i = 0; i < data.length; i++) {

            let currentId = data[i].id
            
            let exercisesResults = await db.Exercises_results.findAll({
                where:{
                    id_simulators:data[i].id,
                },
                raw:true
            })
        
            data[i].studentsResults = data[i].studentsResults.map(result => {

                const filterResults = exercisesResults.filter(exercises => exercises.id_users == result.id)

                //get only de last result
                const maxDates = {}

                filterResults.forEach(element => {
                    const idExercises = element.id_exercises
                    const currentMaxDate = maxDates[idExercises]
                  
                    //compare and update max date
                    if (!currentMaxDate || element.date > currentMaxDate.date) {
                      maxDates[idExercises] = element
                    }
                })

                let filterResultsMaxDates = Object.values(maxDates)

                return {
                    ...result,
                    exercisesResults: [...result.exercisesResults, ...filterResultsMaxDates],
                }
            })
        }    },
    stepsData: async(data) => {

        for (let i = 0; i < data.length; i++) {

            for (let j = 0; j < data[i].studentsResults.length; j++) {

                for (let k = 0; k < data[i].studentsResults[j].exercisesResults.length; k++) {

                    const stepsData = await db.Exercises_answers.findAll({
                        where:{
                            id_exercises_results : data[i].studentsResults[j].exercisesResults[k].id
                        },
                        raw:true
                    })
                    
                    data[i].studentsResults[j].exercisesResults[k].stepsData = stepsData
                    
                }
                
            }
        }
    },
}
module.exports = commissionData