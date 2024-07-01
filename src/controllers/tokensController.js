const db = require('../../database/models')
const functions = require('./functions/tokensFunctions')
const {validationResult} = require('express-validator')
const readXlsFile = require('read-excel-file/node')
const bcrypt = require('bcryptjs')
const fs = require('fs')

//Controllers
const tokensController = {
    generate: async(req,res) => {
      try{
        const companies = await db.Companies.findAll()
        return res.render('tokens/tokensGeneration',{title:'Crear token',companies})
      }catch(error){
        return res.send('Error')
      }
    },
    store: async(req,res) => {
      try{
        const companies = await db.Companies.findAll()
        const resultValidation = validationResult(req)
        if (resultValidation.errors.length > 0){
          return res.render('tokens/tokensGeneration',{
                    errors:resultValidation.mapped(),
                    oldData: req.body,
                    title:'Crear token',
                    companies
                })
            }
        //define company id
        const company = await db.Companies.findOne({
          attributes:['id'],
          where:{company_name:req.body.company},
          nest:true,
          raw:true
        })
        const idCompany = company.id
        
        //generate tokens for company administrators (if applies)
        // id for company administrators is 2
        const companyAdmTokensQty = req.body.admTokens
        if(companyAdmTokensQty > 0){
          for (let i = 0; i < companyAdmTokensQty; i++) {
            const token = await functions.tokenGenerator() //new token number
            await functions.tokenStore(token,idCompany,2,null) //store token in database
          }
        }
        
        //generate tokens for teachers (if applies)
        // id for teachers is 3
        const teacherTokensQty = req.body.teacherTokens
        if(teacherTokensQty > 0){
          for (let i = 0; i < teacherTokensQty; i++) {
            const token = await functions.tokenGenerator() //new token number
            await functions.tokenStore(token,idCompany,3,null) //store token in database
          }
        }
        
        //generate tokens for srudents (if applies)
        // id for students is 4
        const studentTokensQty = req.body.studentTokens
        if(studentTokensQty > 0){
          for (let i = 0; i < studentTokensQty; i++) {
            const token = await functions.tokenGenerator() //new token number
            await functions.tokenStore(token,idCompany,4,null) //store token in database
          }
        }

        const successMessage1 = 'Tokens generados con éxito'

        return res.render('tokens/tokensGeneration',{
          title:'Crear token',
          companies,
          successMessage1
        })
        
    }catch(error){
        res.send('Ha ocurrido un error')
      }
    }
}
module.exports = tokensController

