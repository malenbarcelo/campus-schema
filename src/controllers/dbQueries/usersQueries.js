const db = require('../../../database/models')
const sequelize = require('sequelize')
const bcrypt = require('bcryptjs')

const usersQueries = {
    usersCategories: async() => {
        const usersCategories = await db.User_categories.findAll({
            order:[['category_name','ASC']],
            raw:true,
        })
        return usersCategories
    },
    users: async() => {
        const users = await db.Users.findAll({
            where:{enabled:1},
            order:[['last_name','ASC']],
            include: [
                {association: 'user_user_category'},
                {association: 'user_company'}
            ],
            raw:true,
            nest:true
        })
        return users
    },
    companyUsers: async(idCompany) => {
        const users = await db.Users.findAll({
            where:{enabled:1,id_companies:idCompany},
            order:[['last_name','ASC']],
            include: [
                {association: 'user_user_category'},
                {association: 'user_company'}
            ],
            raw:true,
            nest:true
        })
        return companyUsers
    },
    findUser: async(email) => {
        const user = await db.Users.findOne({
            where:{
                user_email:email,
            },
            include: [
                {association: 'user_company'}
            ],
            raw:true,
            nest:true
        })
        return user
    },
    findUserById: async(idUser) => {
        const findUser = await db.Users.findOne({
            where:{
                id:idUser,
            },
            raw:true,
        })
        return findUser
    },
    companyUsers: async(idCompany) => {
        const companyUsers = await db.Users.findAll({
            where:{
                id_companies:idCompany,
                enabled:1
            },
            order:[['last_name','ASC']],
            include: [
                {association: 'user_user_category'},
                {association: 'user_company'}
            ],
            raw:true,
            nest:true
        })
        return companyUsers
    },
    blockUser: async(ids) => {
        await db.Users.update(
            {enabled: 0},
            {where:{id:ids}})
    },
    restorePassword: async(idUser,newPassword) => {
        await db.Users.update(
            { password: newPassword },
            { where: { id: idUser } }
          )
    },
    companyTeachers: async(idCompany) => {
        const companyUsers = await db.Users.findAll({
            where:{
                id_companies:idCompany,
                id_user_categories:3,
            },
            raw:true,
        })
        return companyUsers
    },
    editUserData: async(idUser,userData) => {
        await db.Users.update(
            { 
                last_name: userData.last_name,
                first_name: userData.first_name,
                id_document:userData.dni

             },
            { where: { id: idUser } }
          )
    },
    createUsers: async(usersToCreate,companyId) => {

        for (let i = 0; i < usersToCreate.length; i++) {

            const password = bcrypt.hashSync(usersToCreate[i].user_email,10)

            await db.Users.create(
                {
                    first_name: usersToCreate[i].first_name, 
                    last_name: usersToCreate[i].last_name,
                    user_email: usersToCreate[i].user_email,
                    id_document:usersToCreate[i].id_document,
                    password:password,
                    id_user_categories:usersToCreate[i].id_user_categories,
                    id_companies:companyId,
                    enabled:1,
                    register_date:new Date()
                 }
            )
        }
    },
}

module.exports = usersQueries