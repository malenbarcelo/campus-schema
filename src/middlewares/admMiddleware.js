//Middleware de ruta
function admMiddleware(req,res,next){
    if(!req.session.userLogged){
        return res.redirect('/users/login')
    }else{
        if(req.session.userLogged.id_user_categories !=1){
            return res.redirect('/courses/my-courses')
        }
        if(!req.session.userLogged){
            return res.redirect('/courses/my-courses')
        }
    }

    return next()
}
module.exports=admMiddleware