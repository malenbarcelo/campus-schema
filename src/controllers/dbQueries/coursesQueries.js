const db = require('../../../database/models')
const sequelize = require('sequelize')

const coursesQueries = {
    courses: async() => {
        const courses = await db.Courses.findAll({
            order:[['course_name','ASC']],
            raw:true,
        })
        return courses
    },
    companyCourses: async(idCompanies) => {

        const courses = await db.Courses.findAll({
            order:[['course_name','ASC']],
            where:{
                id_companies: idCompanies
            },
            include:[{
                association:'commission_data',
                include:[{association:'teachers_data'}]
            }],
            //raw:true,
            nest:true
        })
        return courses
    },
}

module.exports = coursesQueries