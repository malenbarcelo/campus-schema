//Middleware de ruta
function guestMiddleware(req,res,next){
    if(req.session.userLogged){
        if(req.session.userLogged.id_user_categories == 1){
            return res.redirect('/tokens/generate')

        }else{
            return res.redirect('/courses/my-courses')
        }
        
    }
    return next()
}
module.exports=guestMiddleware