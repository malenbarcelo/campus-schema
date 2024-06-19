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
    },
    assignation: async(req,res) => {
      try{
        const idCompany = req.session.userLogged.id_companies
        const notAssignedAdm = await functions.notAssignedTokens(idCompany,2)
        const notAssignedTeacher = await functions.notAssignedTokens(idCompany,3)
        const notAssignedStudent = await functions.notAssignedTokens(idCompany,4)
        const companies = await db.Companies.findAll({raw:true})
        const userLogged = req.session.userLogged
        
        return res.render('tokens/tokensAssignation',{
          title:'Asignar token',
          notAssignedAdm,
          notAssignedTeacher,
          notAssignedStudent,
          userLogged,
          companies
        })
        }catch(error){
        return res.send('Error')
      }
    },
    assignationProcess: async(req,res) =>{
      try{
        const companies = await db.Companies.findAll()
        const resultValidation = validationResult(req)
        var idCompany = ""

        //get companyId
        if(req.session.userLogged.id_companies != 1){
          idCompany = req.session.userLogged.id_companies
        }else{
          if (req.body.selectCompany == 'default') {
            idCompany = 0
          }else{
            const company = await db.Companies.findOne({
              where:{company_name:req.body.selectCompany},
              raw:true
            })
            idCompany = company.id
          }
        }
        
        if (resultValidation.errors.length > 0){
          const notAssignedAdm = await functions.notAssignedTokens(idCompany,2)
          const notAssignedTeacher = await functions.notAssignedTokens(idCompany,3)
          const notAssignedStudent = await functions.notAssignedTokens(idCompany,4)
          return res.render('tokens/tokensAssignation',{
                    errors:resultValidation.mapped(),
                    oldData: req.body,
                    title:'Asignar tokens',
                    companies,
                    notAssignedAdm,
                    notAssignedTeacher,
                    notAssignedStudent,
                })
            }

        const file = req.file.filename
        const usersToCreate = await readXlsFile('public/files/assignTokens/' + file)

        //create user
        for (let i = 0; i < usersToCreate.length; i++) {
          await db.Users.create({
            first_name: usersToCreate[i][0],
            last_name: usersToCreate[i][1],
            id_document: usersToCreate[i][2],
            user_email: usersToCreate[i][3],
            password:bcrypt.hashSync(usersToCreate[i][3],10),
            id_user_categories: usersToCreate[i][4],
            id_companies: idCompany,
            enabled:1
          })
          //get created user id
          const idUser = await db.Users.findOne({
            attributes:['id'],
            where:{user_email: usersToCreate[i][3]},
            nest:true,
            raw:true
          })
          
          //find a token to assign
          const token = await db.Tokens.findOne({
            attributes:['id'],
            where:{
              id_companies:idCompany,
              id_user_categories: usersToCreate[i][4],
              id_users:null
            },
            nest:true,
            raw:true
          })
          
          //assign token
          await db.Tokens.update(
            { id_users: idUser.id },
            { where: { id: token.id } }
          )
        }

        const notAssignedAdm = await functions.notAssignedTokens(idCompany,2)
        const notAssignedTeacher = await functions.notAssignedTokens(idCompany,3)
        const notAssignedStudent = await functions.notAssignedTokens(idCompany,4)
        const successMessage1 = 'Tokens asignados con éxito'

        //Delete file
        var filePath = 'public/files/assignTokens/' + file 
        fs.unlinkSync(filePath);

        return res.render('tokens/tokensAssignation',{
          title:'Asignar token',
          notAssignedAdm,
          notAssignedTeacher,
          notAssignedStudent,
          successMessage1,
          companies
        }) 

      }catch(error){
          return res.send('Ha ocurrido un error')
      }

    }
}
module.exports = tokensController

