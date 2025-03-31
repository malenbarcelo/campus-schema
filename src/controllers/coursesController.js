const db = require('../../database/models')
const sequelize = require('sequelize');
const readXlsFile = require('read-excel-file/node')
const {validationResult} = require('express-validator')
const functions = require('./functions/filterCommissionFunctions')
const {commissionSimulatorsData} = require('./functions/commissionData')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
const commissionData = require('./functions/commissionData');
const filterCommissionFunctions = require('./functions/filterCommissionFunctions')
const usersQueries = require('./dbQueries/usersQueries')
const coursesQueries = require('./dbQueries/coursesQueries')
const courseCommissionsQueries = require('./dbQueries/courseCommissionsQueries')

const coursesController = {
    createCourse: async(req,res) => {
        try{
            const companies = await db.Companies.findAll()
            const simulators = await db.Simulators.findAll()

            return res.render('courses/createCourse',{
                title:'Crear curso',
                simulators,
                companies,
                user:req.session.userLogged
            })

        }catch(error){
            return res.send("Error")
        }
    },
    storeCourse: async(req,res) => {
        try{
            const companies = await db.Companies.findAll()
            const simulators = await db.Simulators.findAll()
            const keys = Object.keys(req.body)
            const notSimulatorKey = ['selectCompany','courseName','courseDescription']
            const resultValidation = validationResult(req)

            if(resultValidation.errors.length > 0){
                return res.render('courses/createCourse',{
                    errors:resultValidation.mapped(),
                    oldData: req.body,
                    title:'Crear curso',
                    companies,
                    simulators,
                    user:req.session.userLogged,
                    })
            }

            //Get company
            let company = ''
            let idCompany = ''

            if(req.session.userLogged.id_user_categories == 1){
                company = await db.Companies.findOne({
                    attributes:['id'],
                    where:{company_name: req.body.selectCompany},
                    nest:true,
                    raw:true
                })
                idCompany = company.id
            }else{
                idCompany = req.session.userLogged.id_companies
            }

            //Get course number
            let courseNumber = await db.Courses.findOne({
                where:{id_companies:idCompany},
                attributes:[[sequelize.fn('max', sequelize.col('course_number')),'max']],
                raw:true,
                nest:true
                })

            if(!courseNumber.max){
                courseNumber.max = 0
            }

            //Create course
            await db.Courses.create({
                course_name: req.body.courseName,
                course_description: req.body.courseDescription,
                id_companies: idCompany,
                course_number:courseNumber.max + 1,
                enabled:1
            })

            //Associate simulators to course
            const idCourse = await db.Courses.findOne({
                attributes:['id'],
                where:{course_name:req.body.courseName, id_companies:idCompany}
                })
                //get course id
                for (let i = 0; i < keys.length; i++) {
                if (!notSimulatorKey.includes(keys[i])){
                    await db.Courses_simulators.create({
                        id_courses: idCourse.dataValues.id,
                        id_simulators: parseInt(keys[i])
                    })
                }
            }

            const successMessage1 = true

            return res.render('courses/createCourse',{
                title:'Crear curso',
                simulators,
                companies,
                successMessage1,
                user:req.session.userLogged,
            })


        }catch(error){
            return res.send("Error")
        }
    },
    createCommission: async(req,res) => {
        try{
            const companies = await db.Companies.findAll()
            const courses = await db.Courses.findAll({where:{id_companies:req.session.userLogged.id_companies}})
            const teachers = await db.Users.findAll({where:{
                id_companies:req.session.userLogged.id_companies,
                id_user_categories:3
            }})
            return res.render('courses/createCommission',{
                title:'Crear comisión',
                companies,
                courses,
                teachers,
                user:req.session.userLogged
            })

        }catch(error){
            return res.send("Error")
        }
    },
    storeCommission: async(req,res) => {
        try{
            const companies = await db.Companies.findAll()
            
            var courses = []
            var teachers = []
            var company = ''
                        
            //if user logged is an administrator
            if(req.session.userLogged.id_user_categories == 1 && req.body.selectCompany != 'default'){
                company =  await db.Companies.findOne({
                    where:{company_name:req.body.selectCompany},
                    raw:true
                })
                courses = await db.Courses.findAll({where:{
                    id_companies:company.id,
                }})
                teachers = await db.Users.findAll({where:{
                    id_companies:company.id,
                    id_user_categories:3
                }})
                
            }else{
                courses = await db.Courses.findAll({where:{id_companies:req.session.userLogged.id_companies}})
            
                teachers = await db.Users.findAll({where:{
                    id_companies:req.session.userLogged.id_companies,
                    id_user_categories:3
                }})
            }

            const resultValidation = validationResult(req)

            if(resultValidation.errors.length > 0){
                return res.render('courses/createCommission',{
                    title:'Crear comisión',
                    errors:resultValidation.mapped(),
                    oldData: req.body,
                    companies,
                    courses,
                    teachers,
                    user:req.session.userLogged
                })
            }

            //get course data
            var idCompany = ''
            if (req.session.userLogged.id_user_categories == 1) {
                idCompany = company.id
            }else{
                idCompany = req.session.userLogged.id_companies
            }

            const courseData = await db.Courses.findOne({
                attributes:['id','course_number'],
                where:{course_name:req.body.courseName, id_companies:idCompany},
                nest:true,
                raw:true
                })

            //get commission
            const courseNumber = courseData.course_number.toString()

            let commissionQty = await db.Course_commissions.findOne({
                where:{id_courses:courseData.id},
                attributes:[[sequelize.fn('count', sequelize.col('id_courses')),'count']],
                raw:true,
                nest:true
                })

            commissionQty = (commissionQty.count + 1).toString()

            const commission = '#' + courseNumber.padStart(3,'0') + commissionQty.padStart(4,'0')

            //create commission
            await db.Course_commissions.create({
                id_courses: courseData.id,
                start_date: req.body.startDateCommission,
                end_date: req.body.endDateCommission,
                commission: commission,
                id_teachers:parseInt(req.body.teacherName),
                enabled:1
            })

            //get commission id
            const idCommission = await db.Course_commissions.findOne({
                where:{
                    commission:commission,
                    id_courses:courseData.id
                },
                raw:true
            })

            //add teachers to commission
            await db.Course_commissions_teachers.create({
                id_course_commissions: idCommission.id,
                id_teachers:parseInt(req.body.teacherName)
            })

            if (req.body.teacherName2 != 'default') {
                await db.Course_commissions_teachers.create({
                    id_course_commissions: idCommission.id,
                    id_teachers:parseInt(req.body.teacherName2)
                })
            }

            if (req.body.teacherName3 != 'default') {
                await db.Course_commissions_teachers.create({
                    id_course_commissions: idCommission.id,
                    id_teachers:parseInt(req.body.teacherName3)
                })
            }

            const successMessage1 = true

            return res.render('courses/createCommission',{
                title:'Crear comisión',
                companies,
                courses,
                teachers,
                successMessage1,
                user:req.session.userLogged
            })
            
        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    myCourses:async(req,res) => {
        try{
            const date = new Date()
            date.setHours(00)
            date.setMinutes(00)
            date.setSeconds(00)
            var commissions = []
            var courses = []

            //if user logged is an administrator, get company courses and commissions
            if (req.session.userLogged.id_user_categories == 2) {

                courses = await coursesQueries.companyCourses(req.session.userLogged.id_companies)
                const idCourses = courses.map( c => c.id)
                commissions = await courseCommissionsQueries.companyCommissions(idCourses)

            }

            //if user logged is a teacher, get teacher courses and commissions
            if (req.session.userLogged.id_user_categories == 3) {

                courses = await coursesQueries.companyCourses(req.session.userLogged.id_companies)
                let idCourses = courses.map( c => c.id)
                commissions = await courseCommissionsQueries.companyCommissions(idCourses)
                commissions = commissions.map(c => c.get({ plain: true }))
                commissions = commissions.filter(c => c.teachers_data.length > 0)
                
                commissions = commissions.filter(item =>
                    item.teachers_data.some(teacher => teacher.id_teachers == req.session.userLogged.id)
                )

                idCourses = commissions.map(c => c.id_courses)
                idCourses = [...new Set(idCourses)]

                courses = courses.filter(c => idCourses.includes(c.id))
                
            }

            //if user logged is a student, get student courses and commissions
            if (req.session.userLogged.id_user_categories == 4) {
                courses = await coursesQueries.companyCourses(req.session.userLogged.id_companies)
                let idCourses = courses.map( c => c.id)
                commissions = await courseCommissionsQueries.companyCommissions(idCourses)
                commissions = commissions.map(c => c.get({ plain: true }))
                commissions = commissions.filter(c => c.course_commission_student.length > 0)
                
                commissions = commissions.filter(item =>
                    item.course_commission_student.some(student => student.id_students == req.session.userLogged.id)
                )

                idCourses = commissions.map(c => c.id_courses)
                idCourses = [...new Set(idCourses)]

                courses = courses.filter(c => idCourses.includes(c.id))
                
            }

            return res.render('courses/myCourses',{title:'Mis Cursos',commissions,courses,date})

        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    filterCommission: async(req,res) => {
        try{

            const idCommission = req.params.idCommission

            const commission = await filterCommissionFunctions.commissionSelected(idCommission)

            const idSimulators = await commissionData.idSimulators(idCommission)

            const idStudents = await commissionData.idStudents(idCommission)

            let data = await commissionData.data(idSimulators,idStudents)

            //add exercises results to data
            await commissionData.exercisesResults(data)

            //add steps data to data
            await commissionData.stepsData(data)

            return res.render('courses/commissions',{title:'Comisiones',data,commission})
            
        }catch(error){
        console.log(error)
        return res.send('Ha ocurrido un error')
    }
},
    filterCommission2: async(req,res) => {
        try{

            //get commission
            const idCommission = req.params.idCommission
            const commission = await db.Course_commissions.findOne({
                where:{id:req.params.idCommission},
                include:[{all:true}]
            })

            //get simulators and array with simulators ids
            const simulators = await db.Courses_simulators.findAll({
                where:{id_courses:commission.id_courses},
                attributes:['id']
            })

            let idsSimulators = simulators.map(simulator => simulator.id)
            let commissionSimulators = await db.Simulators.findAll({
                where:{id:idsSimulators},
                order:[['simulator_name','ASC']],
            })

            //get students and array with students ids
            const students = await db.Course_commissions_students.findAll({
                where:{id_course_commissions:idCommission}
            })
            let idsStudents = students.map(student => student.id_students)
            let commissionStudents = await db.Users.findAll({
                where:{id:idsStudents},
                order:[['last_name','ASC']],
            })

            //get exercises results and array with exercises ids

            //return res.send(commission)

            return res.render('courses/commissions',{title:'Comisiones',commission,commissionSimulators})


        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    filterCommissionAndStudent: async(req,res) => {
        try{
            const idCommission = req.params.idCommission
            const idStudent = req.params.idStudent
            var data =[]

            //get course
            const course = await db.Course_commissions.findOne({
                where:{id:idCommission},
                raw:true,
                nest:true,
                include:[{all:true}]
            })

            

            //get simulators
            const simulators = await db.Courses_simulators.findAll({
                where:{id_courses:course.id_courses},
                raw:true,
                nest:true,
                include:[{all:true}]
            })

            //add simulators to data
            simulators.forEach(simulator => {
                data.push({'id_simulator':simulator.id_simulators,'simulator_name':simulator.course_simulator.simulator_name})
            });
            //order by simulator_name
            data.sort((a,b)=> (a.simulator_name < b.simulator_name ? -1 : 1))

            //get simulator exercises and add to data
            for (let i = 0; i < data.length; i++) {
                data[i].simulator_exercises = []
                const exercises = await db.Exercises.findAll({
                    where:{id_simulators:data[i].id_simulator},
                    order:[['exercise_name','ASC']],
                    raw:true
                })
                for (let j = 0; j < exercises.length; j++) {
                    data[i].simulator_exercises.push({'exercise_id':exercises[j].id,'exercise_name':exercises[j].exercise_name})
                    for (let k = 0; k < data[i].simulator_exercises.length; k++) {
                        data[i].simulator_exercises[k].student_results =[]
                        const studentResults = await db.Exercises_results.findAll({
                            where:{
                                id_users:idStudent,
                                id_simulators:data[i].id_simulator,
                                id_exercises:data[i].simulator_exercises[k].exercise_id
                            },
                            order:[['date','DESC']],
                            raw:true
                        })
                        if(studentResults == ''){
                            data[i].simulator_exercises[k].student_results.push({'id_exercise':data[i].simulator_exercises[k].exercise_id,'id_exercises_result':'-','date':'-','grade':'-','duration_secs':'-'})
                        }else{
                            
                            studentResults.forEach(studentResult => {
                                const fullDate = new Date(parseInt(studentResult.date))
                                const day = fullDate.getDate()
                                const month = fullDate.getMonth()
                                const year = fullDate.getFullYear()
                                const date = day +'/' + month + '/' + year

                                data[i].simulator_exercises[k].student_results.push({'id_exercise':data[i].simulator_exercises[k].exercise_id,'id_exercises_result':studentResult.id,'date':date,'grade':studentResult.grade,'duration_secs':studentResult.duration_secs})
                            });
                        }
                    }
                }
            }

            //get exercises steps and add to data
            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < data[i].simulator_exercises.length; j++) {
                    //get exercise steps
                    const exerciseSteps = await db.Exercises_answers.findAll({
                        attributes:[[sequelize.fn('DISTINCT', sequelize.col('description')), 'description']],
                        order:[['description','ASC']],
                        where:{id_exercises:data[i].simulator_exercises[j].exercise_id},
                        raw:true
                    })
                    //separate code from description
                    exerciseSteps.forEach(exerciseStep => {
                        const array = exerciseStep.description.split('_')
                        exerciseStep.code=array[0]
                        exerciseStep.description=array[1]
                    })
                    data[i].simulator_exercises[j].exercise_steps = exerciseSteps
                }
            }

            for (let i = 0; i < data.length; i++){
                for (let j = 0; j < data[i].simulator_exercises.length; j++) {
                    for (let k = 0; k < data[i].simulator_exercises[j].student_results.length; k++) {

                        const idExerciseResult = data[i].simulator_exercises[j].student_results[k].id_exercises_result

                        const idExercise = data[i].simulator_exercises[j].student_results[k].id_exercise

                        const allSteps = await db.Exercises_answers.findAll({
                            attributes:[[sequelize.fn('DISTINCT', sequelize.col('description')), 'description']],
                            where:{id_exercises : idExercise},
                            order:[['description','ASC']],
                            raw:true
                        })

                        for (let l = 0; l < allSteps.length; l++) {

                            const stepData = await db.Exercises_answers.findAll({
                                where:{
                                    id_exercises_results : idExerciseResult,
                                    description:allSteps[l].description
                                },
                                raw:true
                            })

                            allSteps[l].id_exercises_results = data[i].simulator_exercises[j].student_results[k].id_exercises_result

                            if(stepData == null || stepData == [] || stepData == ''){
                                allSteps[l].type = '-'
                                allSteps[l].log_time = '-'
                                allSteps[l].observations = '-'
                                allSteps[l].id = '-'
                            }else{
                                allSteps[l].type = stepData[0].type
                                allSteps[l].log_time = stepData[0].log_time
                                allSteps[l].observations = stepData[0].observations
                                allSteps[l].id = stepData[0].id
                                
                            }
                        }

                        data[i].simulator_exercises[j].student_results[k].steps_results = allSteps 
                        
                    }
                }
            }

            
            return res.render('courses/studentCommissions',{title:'Comisiones',course,data})
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    coursesData: async(req,res) => {
        try{
          const courses = await db.Courses.findAll({
            order:[['course_name',"ASC"]],
            raw:true,
            nest:true,
            include:[{all:true}]
          })

          console.log(courses)
  
          return res.render('courses/allCourses',{title:'Cursos',courses})
        }catch(error){
          return res.send('Error')
        }
      },
      assignStudents: async(req,res) => {
        try{
            // const students = await db.Users.findAll({
            //     where:{
            //         id_user_categories:4,
            //         id_companies:req.session.userLogged.id_companies
            //     },
            //     nest:true,
            //     raw:true
            // })


            const companies = await db.Companies.findAll({raw:true,nest:true})

            const students = await db.Tokens.findAll({ // en realidad son not assigned tokens, le deje el mismo nombre para no tener qe camiar todo
                where:{
                    id_user_categories:4,
                    id_companies: req.session.userLogged.id_companies,
                    id_users: null
                },
                nest:true,
                raw:true
            })
            
            const courses = await db.Courses.findAll({
                where: {id_companies:req.session.userLogged.id_companies},
                raw:true,
                nest:true
            })

            return res.render('courses/assignStudents',{
                title:'Asignar alumnos',
                companies,
                courses,
                students,
                user:req.session.userLogged
            })

        }catch(error){
            return res.send("Error")
        }
    },
    processAssignStudents: async(req,res) => {
        try{
            const companies = await db.Companies.findAll({raw:true,nest:true})

            var idCompany = ''
            
            if(req.session.userLogged.id_user_categories == 1 && req.body.selectCompany != 'default' ){
                const company = await db.Companies.findAll({
                    where:{company_name:req.body.selectCompany},
                    raw:true
                })
                idCompany = company[0].id                
            }else{
                idCompany = req.session.userLogged.id_companies
            }
            const courses = await db.Courses.findAll({
                where: {id_companies:idCompany},
                raw:true,
                nest:true
            })
            // const students = await db.Users.findAll({
            //     where:{
            //         id_user_categories:4,
            //         id_companies:idCompany
            //     },
            //     nest:true,
            //     raw:true
            // })

            const students = await db.Tokens.findAll({ // en realidad son not assigned tokens, le deje el mismo nombre para no tener qe camiar todo
                where:{
                    id_user_categories:4,
                    id_companies: req.session.userLogged.id_companies,
                    id_users: null
                },
                nest:true,
                raw:true
            })

            const resultValidation = validationResult(req)

            if (resultValidation.errors.length > 0){
                const courseCommissions = await db.Course_commissions.findAll({
                    include: [{association: "course_commission_course"}],
                    nest:true,
                    raw:true
                })
                const commissionsFiltered = []
                courseCommissions.forEach(courseCommission => {
                    if(courseCommission.course_commission_course.course_name == req.body.selectCourse){
                        commissionsFiltered.push(courseCommission)
                    }

                });

                return res.render('courses/assignStudents',{
                    errors:resultValidation.mapped(),
                    oldData: req.body,
                    title:'Asignar alumnos',
                    companies,
                    courses,
                    students,
                    commissionsFiltered,
                    user:req.session.userLogged
                    })
            }

            const file = req.file.filename
            idCommission = req.body.selectCommission
            const emails = await readXlsFile('public/files/assignStudents/' + file)

            const studentsToAssign = await db.Users.findAll({
                attributes:['id'],
                where:{
                    user_email: emails,
                },
                nest:true,
                raw:true
            })

            const studentsCommissions= []

            for (let i = 0; i < studentsToAssign.length; i++) {
                const validation = await db.Course_commissions_students.findOne({
                    where:{
                        id_course_commissions:parseInt(idCommission),
                        id_students:studentsToAssign[i].id
                    }
                })
                if(!validation){
                    studentsCommissions.push({
                        id_course_commissions:parseInt(idCommission),
                        id_students:studentsToAssign[i].id
                    })
                }
            }

            for (let i = 0; i < studentsCommissions.length; i++){
                await db.Course_commissions_students.create(studentsCommissions[i])
            }

            const successMessage = true

            return res.render('courses/assignStudents',{
                title:'Asignar alumnos',
                companies,
                courses,
                students,
                successMessage,
                user:req.session.userLogged
            })


        }catch(error){
            res.send('Error')
        }
    },     
}

module.exports = coursesController