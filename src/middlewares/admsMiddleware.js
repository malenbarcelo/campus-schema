//Middleware de ruta -- Routes that can be reached by general administrator and company administrators
function admsMiddleware(req,res,next){
    if(!req.session.userLogged){
        return res.redirect('/users/login')
    }else{
        if(req.session.userLogged.id_user_categories != 1 && req.session.userLogged.id_user_categories != 2){
            return res.redirect('/courses/my-courses')
        }
    }
    return next()
}
module.exports=admsMiddleware