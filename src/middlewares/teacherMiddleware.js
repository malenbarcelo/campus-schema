//Middleware de ruta -- Routes that can be reached by general administrator, company administrators and teachers
function teacherMiddleware(req,res,next){
    if(!req.session.userLogged){
        return res.redirect('/users/login')
    }else{
        if(req.session.userLogged.id_user_categories == 4){
            return res.redirect('/courses/my-courses')
        }
    }
    return next()
}
module.exports=teacherMiddleware