const db = require('../../../database/models')
const bcrypt = require('bcryptjs')

const filterCommissionFunctions = {
    commissionSelected: async(idCommission) => {
        try{
            const commission = await db.Course_commissions.findOne({
                include: [{association: 'course_commission_course'}],
                where:{id:idCommission},
                nest:true,
                raw:true
            })
            return commission
        }catch(error){
            res.send("Error")
        }
    },
    commissionSimulators: async(idCourses) => {
        try{
            const simulators = await db.Courses_simulators.findAll({
                where:{id_courses:idCourses},
                attributes:[['id_simulators','id']],
                nest:true,
                raw:true,
                include: [{association: 'course_simulator'}]
            })
            return simulators
        }catch(error){
            res.send("Error")
        }
    },
    commissionStudents: async(idCommission) => {
        try{
            const studentsData = []
            const students = await db.Course_commissions_students.findAll({
                where:{id_course_commissions:idCommission},
                nest:true,
                raw:true,
                include: [{association: 'commission_user'}]
            })
            students.forEach(student => {
                studentsData.push({'studentId':student.commission_user.id,'firstName':student.commission_user.first_name,'lastName':student.commission_user.last_name})
            });

            //order studentsData by lastName
            studentsData.sort((a,b)=> (a.lastName < b.lastName ? -1 : 1))

            return studentsData
            
        }catch(error){
            res.send("Error")
        }
    },
    simulatorExercises: async(idSimulator) => {
        try{
            const exercises = await db.Exercises.findAll({
                order:[['exercise_name','ASC']],
                attributes:[['id','exerciseId'],['exercise_name','exerciseName']],
                where:{id_simulators:idSimulator},
                nest:true,
                raw:true
            })
            return exercises
        }catch(error){
            res.send("Error")
        }
    },
    exercisesSteps: async(idSimulator) => {
        try{
            const exercises = await db.Exercises.findAll({
                order:[['exercise_name','ASC']],
                attributes:[['id','exerciseId'],['exercise_name','exerciseName']],
                where:{id_simulators:idSimulator},
                nest:true,
                raw:true
            })
            return exercises
        }catch(error){
            res.send("Error")
        }
    },
}

module.exports = filterCommissionFunctions