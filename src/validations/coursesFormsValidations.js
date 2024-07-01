const {body} = require('express-validator')
const bcrypt = require('bcryptjs')
const db = require('../../database/models')
const path = require('path')
const readXlsFile = require('read-excel-file/node')

const coursesFormsValidations = {
    createCourseFormValidations: [
        body('selectCompany')
        .custom((value,{ req }) => {
            if(req.session.userLogged.id_user_categories == 1 && req.body.selectCompany == 'default'){
                throw new Error('Seleccione una institución')
            }
            return true
        }),
        body('courseName')
            .notEmpty().withMessage('Ingrese un nombre para el curso que desea crear')
            .custom(async(value,{ req }) => {
                var idCompany = ''
                if (req.session.userLogged.id_user_categories == 1) {
                    const company = await db.Companies.findOne({
                        where:{company_name:req.body.selectCompany},
                        raw:true
                    })
                    idCompany = company.id
                }else{
                    idCompany = req.session.userLogged.id_companies
                }

                const courseName = await db.Courses.findOne({where:{
                    course_name:req.body.courseName,
                    id_companies: idCompany
                }})
                if(courseName){
                    throw new Error('Ya existe un curso con el nombre "' + req.body.courseName + '" en la institución')
                }
                return true
            }),
            body('simulators')
                .custom(async(value,{ req }) => {
                const keys = Object.keys(req.body)
                const notSimulatorKey = ['selectCompany','courseName','courseDescription']
                let simulatorsQty = 0
                keys.forEach(key => {
                if (!notSimulatorKey.includes(key)){
                    simulatorsQty +=1
                }                
            })
                if(simulatorsQty == 0){
                    throw new Error('Debe asociar al menos un simulador al curso')
                }
                return true
            }),
    ],
    createCommissionFormValidation: [
        body('selectCompany')
        .custom((value,{ req }) => {
            if(req.session.userLogged.id_user_categories == 1 && req.body.selectCompany == 'default'){
                throw new Error('Seleccione una institución')
            }
            return true
        }),
        body('courseName')
            .custom(async(value,{ req }) => {
                if(req.body.courseName == 'default'){
                    throw new Error('Seleccione un curso')
                }
                return true
            }),
        body('teacherName')
        .custom(async(value,{ req }) => {
            if(req.body.teacherName == 'default'){
                throw new Error('Seleccione un profesor')
            }
            return true
        }),
        body('startDateCommission')
            .notEmpty().withMessage('Ingrese una fecha de inicio')
            .custom(async(value,{ req }) => {
                if(req.body.endDateCommission < req.body.startDateCommission){
                    throw new Error('error')
                }
                return true
            }),
        body('endDateCommission')
            .notEmpty().withMessage('Ingrese una fecha de finalización')
            .custom(async(value,{ req }) => {
                if(req.body.endDateCommission < req.body.startDateCommission){
                    throw new Error('La fecha de inicio del curso debe ser menor a la fecha de fin del mismo')
                }
                return true
            })
        ],
    assignStudentsFormValidations: [
        body('selectCompany')
            .custom(async(value,{ req }) => {
                if(req.session.userLogged.id_user_categories == 1 && req.body.selectCompany == 'default'){
                    throw new Error('Seleccione una institución')
                }
                return true
            }),
        body('selectCourse')
            .custom(async(value,{ req }) => {
                if(req.body.selectCourse == 'default'){
                    throw new Error('Seleccione un curso')
                }
                return true
            }),
        body('selectCommission')
            .custom(async(value,{ req }) => {
                if(req.body.selectCommission == 'default'){
                    throw new Error('Seleccione una comisión')
                }
                return true
            }),
        body('fileAssignStudents')
            .custom(async(value,{ req }) => {
                if(req.session.userLogged.id_user_categories == 1){
                    const company = await db.Companies.findAll({
                        where:{company_name:req.body.selectCompany},
                        raw:true
                    })
                    const idCompany = company[0].id
                }else{
                    idCompany = req.session.userLogged.id_companies
                }
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
                        const emails = await readXlsFile('public/files/assignStudents/' + fileName)
                        
                        const students = await db.Users.findAll({
                            where:{
                                id_user_categories:4,
                                id_companies:idCompany
                            },
                            nest:true,
                            raw:true
                        })
                        if(students.length < emails.length){
                            throw new Error('El archivo subido registra más de ' + students.length + ' alumnos')
                        }else{
                            let unknownUsers = []
                            for (let i = 0; i < emails.length; i++) {
                                const student = await db.Users.findOne({
                                    where:{
                                        user_email:emails[i][0],
                                        id_user_categories:4,
                                        id_companies: idCompany
                                    },
                                    nest:true,
                                    raw:true
                                })
                                if(!student){
                                    unknownUsers.push(emails[i][0])
                                }
                            }
                            if(unknownUsers.length > 0){
                                throw new Error('Algunos emails no fueron encontrados en el listado de alumnos de la institución')
                            }
                        }
                    }
                }
                return true})
    ]
}

module.exports = coursesFormsValidations