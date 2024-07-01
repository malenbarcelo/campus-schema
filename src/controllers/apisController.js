const db = require('../../database/models')
const sequelize = require('sequelize')
const bcrypt = require('bcryptjs')
const commissionData = require('./functions/commissionData')
const usersQueries = require('./dbQueries/usersQueries')
const coursesQueries = require('./dbQueries/coursesQueries')
const courseCommissionsQueries = require('./dbQueries/courseCommissionsQueries')
const tokensQueries = require('./dbQueries/tokensQueries')
const readXlsFile = require('read-excel-file/node')

const apisController = {
    //USERS
    users: async(req,res) =>{
        try{
            const users = await usersQueries.users()
            return res.status(200).json(users)
        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    companyUsers: async(req,res) =>{
        try{
            const idCompany = req.params.idCompany
            const companyUsers = await usersQueries.companyUsers(idCompany)
            return res.status(200).json(companyUsers)
        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    blockUsers: async(req,res) =>{
        try{
            const data = req.body.users

            const ids = data.map(d => d.id)
            await usersQueries.blockUser(ids)
            return res.status(200).json()
        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    restorePasswords: async(req,res) =>{
        try{

            const data = req.body.users
            const ids = data.map(d => d.id)

            for (let i = 0; i < ids.length; i++) {
                const user = await usersQueries.findUserById(ids[i])
                const newPassword = bcrypt.hashSync(user.user_email,10)
                await usersQueries.restorePassword(ids[i],newPassword)
            }

            return res.status(200).json()
        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    editUserData: async(req,res) =>{
        try{

            const idUser = req.body.idUser
            const userData = req.body.userData

            await usersQueries.editUserData(idUser,userData)
            
            return res.status(200).json()

        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    usersCategories: async(req,res) =>{
        try{
            const usersCategories = await usersQueries.usersCategories()
            return res.status(200).json(usersCategories)
        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    createUsers: async(req,res) =>{
        try{

            const usersToCreate = req.body.usersToCreate
            const commissionId = parseInt(req.body.commissionId)
            const companyId = parseInt(req.body.companyId)

            //create users
            await usersQueries.createUsers(usersToCreate,companyId)

            //assign tokens
            await tokensQueries.assignTokens(usersToCreate,companyId)

            //assign commission if necessary            
            if (commissionId != '') {
                for (let i = 0; i < usersToCreate.length; i++) {
                    const idUserCategory = usersToCreate[i].id_user_categories
                    const idUser = await usersQueries.findUser(usersToCreate[i].user_email)
                    if (idUserCategory == 3) {
                        await courseCommissionsQueries.assignCommissionTeachers(idUser.id,commissionId)
                    }else{
                        await courseCommissionsQueries.assignCommission(idUser.id,commissionId)
                    }       
                }
            }
            
            return res.status(200).json()

        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    readExcelFile: async(req,res) =>{
        try{
            const file = req.file.filename
            const emails = await readXlsFile('public/files/assignStudents/' + file)
            console.log(file)
            return res.status(200).json(emails)
        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },

    //COURSES
    courses: async(req,res) =>{
        try{
            const courses = await coursesQueries.courses()
            return res.status(200).json(courses)
        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    commissions: async(req,res) =>{
        try{
            const commissions = await courseCommissionsQueries.commissions()
            return res.status(200).json(commissions)
        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    assignCommission: async(req,res) =>{
        try{
            const users = req.body.users
            const idCommission = req.body.id_course_commissions
            let usersIds = users.map(u => u.id)

            for (let i = 0; i < usersIds.length; i++) {
                const findStudent = await courseCommissionsQueries.findStudentByCommission(usersIds[i],idCommission)
                if (findStudent.length == 0) {
                    await courseCommissionsQueries.assignCommission(usersIds[i],idCommission)
                }
            }

            return res.status(200).json()

        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
   userCommissionCompany: async(req,res) =>{
        try{
            const idUser = req.params.idUser
            const idCompany = req.params.idCompany

            const userCommissions = await courseCommissionsQueries.findUserCommissions(idUser)
            const courses = await coursesQueries.courses()
            let userCommissionCompany = []

            if (idCompany == 'allCompanies') {
                userCommissionCompany = userCommissions
            }else{
                userCommissions.forEach(element => {
                    const company = courses.filter(c => c.id == element.commission_data.id_courses)[0].id_companies
                    if (company == idCompany) {
                        userCommissionCompany.push(element)
                    }
                })
            }

            return res.status(200).json(userCommissionCompany)

        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    deleteCommissionsStudents: async(req,res) =>{
        try{

            const commissionsToDelete = req.body.commissionsToDelete

            await courseCommissionsQueries.deleteCommissionsStudents(commissionsToDelete)

            return res.status(200).json()

        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    addCommissionsStudents: async(req,res) =>{
        try{

            const commissionsToAdd = req.body.commissionsToAdd
            const idUser = req.body.idUser

            await courseCommissionsQueries.addCommissionsStudents(commissionsToAdd,idUser)

            return res.status(200).json()

        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    //TOKENS
    tokensToAssign: async(req,res) =>{
        try{

            const idCompany = req.params.idCompany
            const idUserCategory = req.params.idUserCategory

            const tokensToAssign = await tokensQueries.tokensToAssign(idUserCategory,idCompany)

            return res.status(200).json(tokensToAssign)

        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },








    coursesFiltered:async(req,res) =>{
        try{
            var coursesFiltered = []

            /*if(req.session.userLogged.id_user_categories == 2){
                const idCompany = req.session.userLogged.id_companies
                coursesFiltered = await db.Courses.findAll({
                    attributes:[['id','id_courses']],
                    where:{id_companies:idCompany},
                    nest:true,
                    raw:true})
            }*/

            if(req.session.userLogged.id_user_categories == 2){

                const companyTeachers = await usersQueries.companyTeachers(req.session.userLogged.id_companies)

                const idsTeachers = []

                companyTeachers.forEach(teacher => {
                    idsTeachers.push(teacher.id)
                })

                commissions = await db.Course_commissions_teachers.findAll({
                    attributes: [[sequelize.fn('DISTINCT', sequelize.col('id_course_commissions')), 'id_course_commissions']],
                    where:{id_teachers:idsTeachers},
                    include:[{all:true}],
                    nest:true,
                    raw:true})

                var coursesFiltered = []

                commissions.forEach(commission => {
                    coursesFiltered.push({'id_courses':commission.commission_data.id_courses})
                })
                //remove duplicates
                coursesFiltered = coursesFiltered.filter(function({id_courses}) {
                    return !this.has(id_courses) && this.add(id_courses)
                    }, new Set)
            }

            if(req.session.userLogged.id_user_categories == 3){

                commissions = await db.Course_commissions_teachers.findAll({
                    attributes: [[sequelize.fn('DISTINCT', sequelize.col('id_course_commissions')), 'id_course_commissions']],
                    where:{id_teachers:req.session.userLogged.id},
                    include:[{all:true}],
                    nest:true,
                    raw:true})

                var coursesFiltered = []

                commissions.forEach(commission => {
                    coursesFiltered.push({'id_courses':commission.commission_data.id_courses})
                })
                //remove duplicates
                coursesFiltered = coursesFiltered.filter(function({id_courses}) {
                    return !this.has(id_courses) && this.add(id_courses)
                    }, new Set)
            }

            if(req.session.userLogged.id_user_categories == 4){
                commissions = await db.Course_commissions_students.findAll({
                    attributes: [[sequelize.fn('DISTINCT', sequelize.col('id_course_commissions')), 'id_course_commissions']],
                    where:{id_students:req.session.userLogged.id},
                    include:[{all:true}],
                    nest:true,
                    raw:true})

                var coursesFiltered = []

                commissions.forEach(commission => {
                    coursesFiltered.push({'id_courses':commission.commission_data.id_courses})
                });

                //remove duplicates
                coursesFiltered = coursesFiltered.filter(function({id_courses}) {
                    return !this.has(id_courses) && this.add(id_courses)
                    }, new Set)
            }

            return res.status(200).json(coursesFiltered)

        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    userLoggedExercises:async(req,res) =>{
        try{
            var courses = []
            var exercises = []

            //if user Logged is an administrator
            if(req.session.userLogged.id_user_categories == 2){
                courses = await db.Courses.findAll({
                    where:{id_companies: req.session.userLogged.id_companies},
                    raw:true
                })
            }

            //if user Logged is a teacher
            if(req.session.userLogged.id_user_categories == 3){
                const userCommissions = await db.Course_commissions_teachers.findAll({
                    where:{id_teachers:req.session.userLogged.id},
                    raw:true
                })

                const commissions = []

                userCommissions.forEach(commission => {
                    commissions.push(commission.id_course_commissions)
                });

                courses = await db.Course_commissions.findAll({
                    attributes: [[sequelize.fn('DISTINCT', sequelize.col('id_courses')), 'id']],
                    where:{id: commissions},
                    raw:true
                })
            }

            const idsCourses = courses.map(course => course.id)

            //get simulators
            const simulators = await db.Courses_simulators.findAll({
                attributes: [[sequelize.fn('DISTINCT', sequelize.col('id_simulators')), 'id_simulators']],
                where: {id_courses:idsCourses},
                raw:true
            })

            const idsSimulators = simulators.map(simulator => simulator.id_simulators)

            //get exercises
            if(req.session.userLogged.id_user_categories == 4){
                //get exercise
                exercises = await db.Exercises_results.findAll({
                    attributes: [[sequelize.fn('DISTINCT', sequelize.col('id_exercises')), 'id']],
                    where:{id_users: req.session.userLogged.id}
                })
                //add exercise_name
                for (let i = 0; i < exercises.length; i++) {
                    const exerciseName = await db.Exercises.findOne({
                        where:{id_exercises:exercises[i].id},
                        raw:true
                    })
                    exercises[i].exercise_name = exerciseName
                }
            }else{
                exercises = await db.Exercises.findAll({
                    attributes:['id','exercise_name','id_simulators'],
                    where:{id_simulators: idsSimulators},
                    raw:true
                })
            }

            return res.status(200).json(exercises)

        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    notAssignedTokens: async(req,res) =>{
        try{
            const notAssignedTokens = await db.Tokens.findAll({
                where:{id_users:null},
                nest:true
            })
            return res.status(200).json(notAssignedTokens)
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    companies: async(req,res) =>{
        try{
            const companies = await db.Companies.findAll({
                nest:true
            })
            return res.status(200).json(companies)
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    studentsExercises: async(req,res) =>{
        try{
            const idCommission = req.params.idCommission

            const studentsExercises = await db.Course_commissions_students.findAll({
                where:{id_course_commissions: idCommission},
                raw:true,
                nest:true,
                include:[{all:true}]
            })

        return res.status(200).json(studentsExercises)

        }catch(error){
            return res.send('Ha ocurrido un error')
        }

    },
    exercisesResults: async(req,res) =>{
        try{
            const idExercise = req.params.idExercise
            const idStudent = req.params.idStudent

            const exercisesResults = await db.Exercises_results.findAll({
                where:{id_exercises: idExercise,id_users:idStudent},
                order:[['date','DESC']],
                raw:true,
                nest:true,
                include:[{all:true}]
            })

            exercisesResults.map(exerciseResult => exerciseResult.stepsResults = [])

            //All exercises steps
            const exercisesSteps = await db.Exercises_answers.findAll({
                attributes: [[sequelize.fn('DISTINCT', sequelize.col('description')), 'description']],
                where:{id_exercises: idExercise},
                order:[['description','ASC']],
                raw:true
            })

            //Complete student exercises steps
            for (let i = 0; i < exercisesResults.length; i++) {
                for (let j = 0; j < exercisesSteps.length; j++) {
                    const stepResult = await db.Exercises_answers.findOne({
                        where:{id_exercises_results:exercisesResults[i].id,description:exercisesSteps[j].description},
                        raw:true
                    })

                    const arrayDescription = exercisesSteps[j].description.split("_")
                    const code = arrayDescription[0]
                    const description = arrayDescription[1]

                    if(stepResult){
                        exercisesResults[i].stepsResults.push({'code':code,'description':description,'log_time':stepResult.log_time,'type':stepResult.type,'observations':stepResult.observations})

                    }else{
                        exercisesResults[i].stepsResults.push({'code':code,'description':description,'log_time':'-','type':'-','observations':'-'})
                    }
                }
            }
            return res.status(200).json(exercisesResults)
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },

    exerciseAnswers: async(req,res) =>{
        try{
            const idExercise = req.params.idExercise
            const idStudent = req.params.idStudent

            const exercisesAnswers = await db.Exercises_answers.findAll({
                where:{id_exercises: idExercise, id_users: idStudent},
                raw:true,
            })

        return res.status(200).json(exercisesAnswers)

        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    userLoggedWrongAnswers: async(req,res) =>{
        try{
            const idStudent =  req.session.userLogged.id
            const idExercise =  req.params.idExercise

            const wrongAnswers = await db.Exercises_answers.findAll({
                where:{id_users: idStudent,id_exercises:idExercise, type:'Error'},
                raw:true,
            })

        return res.status(200).json(wrongAnswers)

        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    exerciseSteps: async(req,res) =>{
        try{
            const idExercise = req.params.idExercise

            //All exercises steps
            let exerciseSteps = await db.Exercises_answers.findAll({
                attributes: [[sequelize.fn('DISTINCT', sequelize.col('description')), 'description']],
                where:{id_exercises: idExercise},
                order:[['description','ASC']],
                raw:true
            })

            exerciseSteps.forEach(exerciseStep => {
                const arrayDescription = exerciseStep.description.split("_")

                exerciseStep.code = arrayDescription[0]
                exerciseStep.description = arrayDescription[1]

            });

            return res.status(200).json(exerciseSteps)

        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    storeResults: async(req,res) =>{
        try{
            const keys = Object.keys(req.body.answers)

            //find user token
            const token = await db.Tokens.findOne({
                attributes:['token'],
                where:{id_users:req.body.id_users},
                raw:true
            })

            if(bcrypt.compareSync(token.token,req.body.token_hashed)){
                //store in exercises_results
                await db.Exercises_results.create({
                    id_exercises: req.body.id_exercises,
                    id_users: req.body.id_users,
                    id_simulators:req.body.id_simulators,
                    date: req.body.date,
                    grade: req.body.grade,
                    duration_secs: req.body.duration_secs
                })

                //get id of exercises_results
                const idExercisesResults = await db.Exercises_results.findOne({
                    where:{
                        id_exercises: req.body.id_exercises,
                        id_users: req.body.id_users,
                        id_simulators: req.body.id_simulators,
                        date: req.body.date,
                    },
                    attributes:[[sequelize.fn('max', sequelize.col('id')),'max']],
                    raw:true,
                    nest:true
                    })

                //store answers
                for (let i = 0; i < keys.length; i++) {
                    await db.Exercises_answers.create({
                        id_exercises_results: idExercisesResults.max,
                        id_exercises:req.body.id_exercises,
                        id_users:req.body.id_users,
                        id_simulators:req.body.id_simulators,
                        description: req.body.answers[i].description,
                        log_time: req.body.answers[i].log_time,
                        type: req.body.answers[i].type,
                        observations: req.body.answers[i].observations
                    })
                }

                const postResult = {
                    'status':'Datos guardados correctamente'
                }
                return res.status(200).json(postResult)
            }else{
                const postResult = {
                    'status':'Error de validación'
                }
                return res.status(200).json(postResult)
            }

        }catch(error){
            return res.send(error)
        }
    },
    loginValidation: async(req,res) =>{
        try{
            const email = req.params.email

            //find user
            const userPassword = await db.Users.findOne({
                attributes:['id','password','first_name','last_name'],
                where:{user_email:email},
                raw:true,
            })

            //find token
            const userToken = await db.Tokens.findOne({
                attributes:['token'],
                where:{id_users:userPassword.id},
                raw:true,
            })

            const user = {
                'id_user': userPassword.id,
                'passwordHashed': userPassword.password,
                'tokenHashed': userToken == null ? 'NA': userToken.token,
                'first_name': userPassword.first_name,
                'last_name': userPassword.last_name,
            }

            return res.status(200).json(user)

        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    companyCourses:async(req,res) =>{
        try{
            idCompany = req.params.idCompany

            const companyCourses = await db.Courses.findAll({
                order:[['course_name','ASC']],
                where:{id_companies:idCompany},
                raw:true
            })
            return res.status(200).json(companyCourses)

        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    companyTeachers:async(req,res) =>{
        try{
            idCompany = req.params.idCompany

            const companyTeachers = await db.Users.findAll({
                where:{id_companies:idCompany, id_user_categories:3},
                raw:true
            })
            return res.status(200).json(companyTeachers)

        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    companyStudents:async(req,res) =>{
        try{
            idCompany = req.params.idCompany

            const companyStudents = await db.Users.findAll({
                where:{id_companies:idCompany, id_user_categories:4},
                raw:true
            })
            return res.status(200).json(companyStudents)

        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    commissionData:async(req,res) =>{
        try{
            idCommission = req.params.idCommission

            const idSimulators = await commissionData.idSimulators(idCommission)

            const idStudents = await commissionData.idStudents(idCommission)

            let data = await commissionData.data(idSimulators,idStudents)

            //add exercises results to data
            await commissionData.exercisesResults(data)

            //add steps data to data
            await commissionData.stepsData(data)

            return res.status(200).json(data)

        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },



}
module.exports = apisController

