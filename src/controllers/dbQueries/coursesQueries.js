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
}

module.exports = coursesQueries