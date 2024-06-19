const db = require('../../../database/models')
const sequelize = require('sequelize')

const courseCommissionsQueries = {
    commissions: async() => {
        const commissions = await db.Course_commissions.findAll({
            order:[['commission','ASC']],
            raw:true,
        })
        return commissions
    },
    findStudentByCommission: async(idStudent,idCommission) => {
        const findStudent = await db.Course_commissions_students.findAll({
            where:{
                id_course_commissions:idCommission,
                id_students:idStudent
            },
            raw:true,
        })
        return findStudent
    },
    assignCommission: async(idStudent,idCommission) => {
        await db.Course_commissions_students.create({
            id_course_commissions:idCommission,
            id_students:idStudent
        })
    },
    assignCommissionTeachers: async(idUser,idCommission) => {
        await db.Course_commissions_teachers.create({
            id_course_commissions:idCommission,
            id_teachers:idUser
        })
    },
    deleteCommissionsStudents: async(commissionsToDelete) => {
        for (let i = 0; i < commissionsToDelete.length; i++) {
            await db.Course_commissions_students.destroy({
                where:{
                    id:commissionsToDelete[i].id
                }
            })
        }        
    },
    addCommissionsStudents: async(commissionsToAdd,idUser) => {
        for (let i = 0; i < commissionsToAdd.length; i++) {
            await db.Course_commissions_students.create({
                id_course_commissions:commissionsToAdd[i].id_course_commissions,
                id_students:idUser,
            })
        }      
    },
    findUserCommissions: async(idUser) => {
        const findUserCommissions = await db.Course_commissions_students.findAll({
            where:{id_students:idUser},
            include: [
                {association: 'commission_data'}
            ],
            raw:true,
            nest:true
        })
        return findUserCommissions
    },
}

module.exports = courseCommissionsQueries