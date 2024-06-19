const {body} = require('express-validator')
const path = require('path')
const readXlsFile = require('read-excel-file/node')
const db = require('../../database/models')
const functions = require('../controllers/functions/tokensFunctions')
const fs = require('fs')

const tokensFormsValidations = {
    generateTokensFormValidations: [
        body('company')
            .custom(async(value,{ req }) => {
                if(req.body.company == 'default'){
                    throw new Error('Seleccione una compañía')
                }
                return true
            }),
        body('admTokens')
            .custom(async(value,{ req }) => {
                if(req.body.admTokens == '' && req.body.teacherTokens == '' && req.body.studentTokens == ''){
                    throw new Error('Debe seleccionar al menos un token para generar')
                }
                return true
            }),
        ],
        assignTokensFormValidations: [
        
            body('selectCompany')
                .custom(async(value,{ req }) => {
                    if(req.session.userLogged.id_user_categories == 1){
                        if(req.body.selectCompany == 'default'){
                            throw new Error('Seleccione una compañía')
                        }
                    }
                    return true
                }),
                body('fileAssignTokens')
                .custom(async(value,{ req }) => {
                    if(req.session.userLogged.id_user_categories != 1 || req.body.selectCompany != 'default')
                    {
                        let file = req.file
                        let acceptedExtensions = ['.xls','.xlsx','.xlsm']
                        if(!file){
                            throw new Error('Debes subir un archivo')
                        }else{
                            let fileExtension = path.extname(file.originalname)
                                if(!acceptedExtensions.includes(fileExtension)){
                                    throw new Error(`Las extensiones aceptadas son ${acceptedExtensions.join(',')}`)
                            }else{
                                const fileName = req.file.filename
                                var idCompany = ''

                                if (req.session.userLogged.id_user_categories == 1 && req.body.selectCompany != 'default') {
                                    const company = await db.Companies.findOne({
                                        where:{company_name:req.body.selectCompany},
                                        raw:true
                                    })
                                    idCompany = company.id
                                }else{
                                    idCompany = req.session.userLogged.id_user_categories
                                }

                                const notAssignedAdm = await functions.notAssignedTokens(idCompany,2)
                                const notAssignedTeacher = await functions.notAssignedTokens(idCompany,3)
                                const notAssignedStudent = await functions.notAssignedTokens(idCompany,4)

                                let tokensToAssign = await readXlsFile('public/files/assignTokens/' + fileName)

                                let emptyFields = 0
                                tokensToAssign.forEach(tokenToAssign => {
                                    if(tokenToAssign[0] == null || tokenToAssign[1] == null || tokenToAssign[2] == null || tokenToAssign[3] == null || tokenToAssign[4] == null){
                                        emptyFields += 1
                                    }
                                })

                                if(emptyFields > 0){
                                    throw new Error('Se encontraron campos vacíos en el archivo a subir')
                                }else{
                                    let adms = 0
                                    let teachers = 0
                                    let students = 0
                                    tokensToAssign.forEach(tokenToAssign => {
                                        if (tokenToAssign[4] == 2) {
                                            adms += 1
                                        }else{
                                            if (tokenToAssign[4] == 3) {
                                                teachers += 1
                                            }else{
                                                if (tokenToAssign[4] == 4) {
                                                    students += 1
                                                }
                                            }
                                        }
                                    })
                                    
                                    if (adms > notAssignedAdm.length || teachers > notAssignedTeacher.length || students > notAssignedStudent.length) {
                                        throw new Error('La cantidad de tokens a asignar super la cantidad de tokens disponibles en al menos una de las categorías de usuario. Si necesita más licencias, comuníquese con el administrador')
                                    }else{
                                        let emails = []
                                        tokensToAssign.forEach(tokenToAssign => {
                                            emails.push(tokenToAssign[3])
                                        })
                                        //remove duplicates
                                        let emailsFiltered = emails.filter((email,
                                            index) => emails.indexOf(email) === index)

                                        if (emails.length > emailsFiltered.length) {
                                            throw new Error('Se encontraron emails repetidos en el archivo. Cada email debe ser único')
                                        }else{
                                            const registeredEmails = await db.Users.findAll({
                                                where:{user_email:emails},
                                                raw:true
                                            })
                                            if(registeredEmails.length > 0){
                                                throw new Error('Se encontraron usuarios ya registrados en la base. Se aceptan únicamente usuarios nuevos')
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return true})
        ]
    }

    
            
    

module.exports = tokensFormsValidations

