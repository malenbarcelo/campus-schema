const {body} = require('express-validator')
const bcrypt = require('bcryptjs')
const db = require('../../database/models');

const userFormsValidations = {
    loginFormValidations: [
        body('email')
            .notEmpty().withMessage('Ingrese un mail').bail()
            .isEmail().withMessage('Ingrese un mail válido')
            .custom(async(value,{ req }) => {
                const userToLogin = await db.Users.findOne({where:{user_email:req.body.email,enabled:1}})
                if (!userToLogin) {
                throw new Error('Usuario inválido')
                }
                return true
            }),
        body('password')
            .notEmpty().withMessage('Ingrese una contraseña')
            .custom(async(value,{ req }) => {
                const userToLogin = await db.Users.findOne({where:{user_email:req.body.email}})
                if(userToLogin){
                    if (!bcrypt.compareSync(req.body.password, userToLogin.password)) {
                        throw new Error('Contraseña inválida')
                    }
                }else{
                    throw new Error('Contraseña inválida')
                }
                return true
            })
    ],
    createCompanyFormValidations: [
        body('company')
            .notEmpty().withMessage('Ingrese una institución').bail()
            .custom(async(value,{ req }) => {
                const companyToCreate = await db.Companies.findOne({
                    where:{company_name:req.body.company},
                })
                if (companyToCreate) {
                throw new Error('Ya existe una institución con el nombre: ' + companyToCreate.dataValues.company_name)
                }
                return true
            }),
        body('firstName').notEmpty().withMessage('Ingrese el nombre del administrador'),
        body('lastName').notEmpty().withMessage('Ingrese el apellido del administrador'),
        body('email')
            .notEmpty().withMessage('Ingrese un mail')
            .isEmail().withMessage('Ingrese un mail válido')
            .custom(async(value,{ req }) => {
                const userEmail = await db.Users.findOne({where:{user_email:req.body.email}})
                if (userEmail) {
                throw new Error('Ya existe un usuario con ese email')
                }
                return true
            }),
    ],
    changePswFormValidations: [
        body('password')
            .notEmpty().withMessage('Ingrese una contraseña')
            .custom(async(value,{ req }) => {
                if (req.body.password != req.body.confirmPassword) {
                throw new Error('Las contraseñas no coinciden')
                }
                return true
            }),
        body('confirmPassword')
            .notEmpty().withMessage('Reingrese la contraseña')
            .custom(async(value,{ req }) => {
                if (req.body.password != req.body.confirmPassword) {
                throw new Error('Las contraseñas no coinciden')
                }
                return true
            }),
    ],
    restorePswFormValidations: [
        body('email')
            .notEmpty().withMessage('Ingrese un usuario')
            .custom(async(value,{ req }) => {
                const user =  await db.Users.findOne({
                    where:{user_email: req.body.email}
                })
                if (!user) {
                throw new Error('El usuario ingresado no existe')
                }
                return true
            })
    ]
}

module.exports = userFormsValidations