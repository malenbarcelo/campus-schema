const db = require('../../database/models')
const {validationResult} = require('express-validator')
const usersQueries = require('./dbQueries/usersQueries')

const indexController = {

    login: (req,res) => {

        req.session.destroy()

        return res.render('users/login',{title:'Iniciar Sesión'})

    },
    processLogin: async(req, res) => {
        try{

            const resultValidation = validationResult(req)

            if (resultValidation.errors.length > 0){
                return res.render('users/login',{
                    errors:resultValidation.mapped(),
                    oldData: req.body,
                    title:'Iniciar Sesión'
                })
            }

            if(req.body.email == req.body.password){
                const alertMessage = 'Debe cambiar la contraseña'
                const email = req.body.email
                return res.render('users/changePassword',{
                    oldData: req.body,
                    title:'Cambiar contraseña',
                    alertMessage
                })
            }

            const userToLogin = await usersQueries.findUser(req.body.email)

            delete userToLogin.password

            req.session.userLogged = userToLogin

            if (userToLogin.id_user_categories == 1) {
                return res.redirect('/tokens/generate')
            }
            else{
                return res.redirect('/courses/my-courses')
            }

        }catch(error){
                res.send('Ha ocurrido un error')
            }
    },
    logout: (req,res) => {
        req.session.destroy()
        return res.redirect('/')

    },

}
module.exports = indexController

