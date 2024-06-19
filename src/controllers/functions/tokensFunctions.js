const db = require('../../../database/models')
const bcrypt = require('bcryptjs')

const tokensFunctions = {
    tokenGenerator: async() => {
        try{
            const lastTokenId = await db.Tokens.max('id')
            const newToken = "token" + lastTokenId + 1
            token = bcrypt.hashSync(newToken,10)
            return token
        }catch(error){
            res.send("Error")
        }
    },
    tokenStore: async(token,idCompany,idUserCategory,idUser) => {
        try{
            await db.Tokens.create({
                token: token,
                id_companies: idCompany,
                id_user_categories: idUserCategory,
                id_users: idUser ? idUser : null
              })
        }catch(error){
            res.send("Error")
        }
    },
    notAssignedTokens:async(idCompany,idUserCategory) => {
        try{
            const notAsignedTokens = await db.Tokens.findAll({
                    include:[{association:'token_company'}],
                    where:{
                        id_companies:idCompany,
                        id_user_categories:idUserCategory,
                        id_users:null
                    },
                    nest:true,
                    raw:true,
                    include: [{all: true}],
                })
            return notAsignedTokens
            }catch(error){
                return res.send('Error')            
        }
    }
}

module.exports = tokensFunctions