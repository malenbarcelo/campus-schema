const express = require('express')
const path = require('path')
const publicPath =  path.resolve('./public')
const cors = require('cors')
const session = require('express-session')
const userLoggedMiddleware = require('./src/middlewares/userLoggedMiddleware.js')
const bcrypt = require('bcryptjs')
const app = express()
//const nodemailer = require('nodemailer');

//routes
const indexRoutes = require('./src/routes/indexRoutes.js')
const usersRoutes = require('./src/routes/usersRoutes.js')
const tokensRoutes = require('./src/routes/tokensRoutes.js')
const coursesRoutes = require('./src/routes/coursesRoutes.js')
const apisRoutes = require('./src/routes/apisRoutes.js')
const simulatorsRoutes = require('./src/routes/simulatorsRoutes.js')
const companiesRoutes = require('./src/routes/companiesRoutes.js')


//use public as statis
app.use(express.static(publicPath))

//use cors to allow any website to connet to my app
app.use(cors())

//get forms info as objects
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//set views folder in src/views
app.set('views', path.join(__dirname, 'src/views'));

//set templates extension (ejs)
app.set('view engine','ejs')

//configure session
app.use(session({
    secret:'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: null // cookie expires when navigator is closed
      }
}))

//middlewares
app.use(userLoggedMiddleware)

//Declare and listen port
const APP_PORT = 3003
app.listen(APP_PORT,() => console.log("Servidor corriendo en puerto " + APP_PORT))

//Routes
app.use('/',indexRoutes)
app.use('/users',usersRoutes)
app.use('/tokens',tokensRoutes)
app.use('/courses',coursesRoutes)
app.use('/apis',apisRoutes)
app.use('/simulators',simulatorsRoutes)

app.use('/companies',companiesRoutes)

console.log(bcrypt.hashSync('user1',10))




