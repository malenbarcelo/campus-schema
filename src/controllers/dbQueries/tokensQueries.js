const db = require('../../../database/models')
const sequelize = require('sequelize')

const tokensQueries = {
    companyTokensToAssign: async(idCompany) => {
        const tokensToAssign = await db.Tokens.findAll({
            where:{
                id_companies:idCompany,
                id_users:null
            },
            raw:true,
        })
        return tokensToAssign
    },
    tokensToAssign: async(idUserCategory,idCompany) => {
        
        const tokensToAssign = await db.Tokens.findAll({
            where:{
                id_companies:idCompany,
                id_users:null,
                id_user_categories:idUserCategory
            },
            raw:true,
        })
        return tokensToAssign
    },
    assignTokens: async(usersToCreate,companyId) => {

        for (let i = 0; i < usersToCreate.length; i++) {
            
            const idUserCategory = usersToCreate[i].id_user_categories

            const findUser = await db.Users.findOne({
                where:{
                    user_email:usersToCreate[i].user_email
                },
                raw:true,
            })

            const idUser = findUser.id

            const findToken = await db.Tokens.findOne({
                where:{
                    id_companies:companyId,
                    id_users:null,
                    id_user_categories:idUserCategory
                },
                raw:true,
            })

            const tokenId = findToken.id

            await db.Tokens.update(
                {
                id_users:idUser,
                },
                {
                    where:{
                        id:tokenId,
                    }
                }
            )
        }
    },
}

module.exports = tokensQueries