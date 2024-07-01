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

                const companyTeachers = await usersQueries.companyTeachers(req.session.userLogged.id_companies)
                const idsTeachers = []

                companyTeachers.forEach(teacher => {
                    idsTeachers.push(teacher.id)
                })

                const teacherCommissions = await db.Course_commissions_teachers.findAll({
                    where:{id_teachers:idsTeachers},
                    raw:true,
                    nest:true,
                    include:[{association:'commission_data'}]
                })

                var teacherCourses = []

                for (let i = 0; i < teacherCommissions.length; i++) {
                    const course = await db.Courses.findOne({
                        where:{id:teacherCommissions[i].commission_data.id_courses},
                        raw:true
                    })

                    teacherCourses.push({'id_courses':teacherCommissions[i].commission_data.id_courses,'course_name':course.course_name})
                    
                }

                //remove duplicates
                teacherCourses = teacherCourses.filter(function({id_courses}) {
                    return !this.has(id_courses) && this.add(id_courses)
                    }, new Set)

                //order courses by course_name
                teacherCourses.sort((a,b)=> (a.course_name < b.course_name ? -1 : 1))

                commissions = teacherCommissions
                courses = teacherCourses
                

                /*const companyCourses = await db.Courses.findAll({
                    attributes:[['id','id_courses'],'course_name'],
                    where:{id_companies:req.session.userLogged.id_companies},
                    order:[['course_name','ASC']],
                    raw:true
                })

                const idsCompanyCourses = companyCourses.map(companyCourse => companyCourse.id_courses)

                const companyCommissions = await db.Course_commissions.findAll({
                    where:{id_courses:idsCompanyCourses},
                    include:[{association:'course_commission_course'}],
                    nest:true,
                    raw:true,
                })

                commissions = companyCommissions
                courses = companyCourses*/

            }

            //if user logged is a teacher, get teacher courses and commissions
            if (req.session.userLogged.id_user_categories == 3) {

                const teacherCommissions = await db.Course_commissions_teachers.findAll({
                    where:{id_teachers:req.session.userLogged.id},
                    raw:true,
                    nest:true,
                    include:[{association:'commission_data'}]
                })                

                /*const teacherCommissions = await db.Course_commissions.findAll({
                    where:{id_teachers:req.session.userLogged.id},
                    raw:true,
                    nest:true,
                    include:[{association:'course_commission_course'}]
                })*/

                var teacherCourses = []

                for (let i = 0; i < teacherCommissions.length; i++) {
                    const course = await db.Courses.findOne({
                        where:{id:teacherCommissions[i].commission_data.id_courses},
                        raw:true
                    })

                    teacherCourses.push({'id_courses':teacherCommissions[i].commission_data.id_courses,'course_name':course.course_name})
                    
                }

                //remove duplicates
                teacherCourses = teacherCourses.filter(function({id_courses}) {
                    return !this.has(id_courses) && this.add(id_courses)
                    }, new Set)

                //order courses by course_name
                teacherCourses.sort((a,b)=> (a.course_name < b.course_name ? -1 : 1))

                commissions = teacherCommissions
                courses = teacherCourses
            }

            //if user logged is a student, get student courses and commissions
            if (req.session.userLogged.id_user_categories == 4) {
                const studentCommissions = await db.Course_commissions_students.findAll({
                    where:{id_students:req.session.userLogged.id},
                    raw:true,
                    nest:true,
                    include:[{all:true}]
                })

                //add data to commission to get same array than companies and teachers
                studentCommissions.forEach(studentCommission => {
                    studentCommission.course_commission_course = {'id':studentCommission.commission_data.id_courses}
                    studentCommission.id = studentCommission.id_course_commissions
                    studentCommission.commission = studentCommission.commission_data.commission
                    studentCommission.start_date = studentCommission.commission_data.start_date
                    studentCommission.end_date = studentCommission.commission_data.end_date
                });

                let idsStudentCourses = studentCommissions.map(studentCommission => studentCommission.commission_data.id_courses)

                //remove duplicates
                idsStudentCourses = [...new Set(idsStudentCourses)];

                //get courses
                const studentCourses = await db.Courses.findAll({
                    where:{id:idsStudentCourses},
                    attributes:[['id','id_courses'],'course_name'],
                    raw:true
                })

                commissions = studentCommissions
                courses = studentCourses

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
}

module.exports = coursesController