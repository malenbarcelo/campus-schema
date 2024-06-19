import { dominio } from "./dominio.js"
import { globals } from "./globals.js"
import { printTableUsers, getUsers, getUsersFiltered,showDGAs, hideDGAs,printTableCommissions,printTableCreateUser } from "./usersFunctions.js"
import { getElements } from "./usersGetElements.js"
import { unCheckElements,dateToString,formatDateToString } from "./generalFunctions.js"

window.addEventListener('DOMContentLoaded',async()=>{

    //Define elements
    let usersFiltered = []
    let filtersApplied = 'no'

    //get elements
    const {thIcons,filters,DGAs,closeAndCancel,DGAsassignCommissions} = getElements()

    //data
    loader.style.display = 'block'
    const companies = await (await fetch(dominio + '/apis/companies')).json()
    const allUsers = await (await fetch(dominio + '/apis/users')).json()
    const courses = await (await fetch(dominio + '/apis/courses')).json()
    const commissions = await (await fetch(dominio + '/apis/commissions')).json()
    const usersCategories = await (await fetch(dominio + '/apis/users/users-categories')).json()
    let users = await getUsers(companies)
    globals.idCompany = userLoggedCategory.innerText == 1 ? 'allCompanies' : companies.filter(c => c.company_name == companyName.innerText)[0].id

    /*----------------------------users.ejs-----------------------------*/
    //print table
    printTableUsers(users)
    loader.style.display = 'none'

    //thIcons event listeners (show and hide)
    thIcons.forEach(icon => {
        const iconInfo = document.getElementById(icon.id + 'Info')
        icon.addEventListener("mouseover", async(e) => {
            const mouseX = e.clientX
            iconInfo.style.left = (mouseX - 330) + 'px'
            iconInfo.style.display = 'block'
        })

        icon.addEventListener("mouseout", async() => {
            iconInfo.style.display = 'none'
        })
    })

    //filters
    filters.forEach(filter => {
        if (filter) {
            filter.addEventListener("change", async() => {
                hideDGAs()
                bodyUsers.innerHTML = ''
                loader.style.display = 'block'
                users = await getUsers(companies)
                usersFiltered = getUsersFiltered(users)
                printTableUsers(usersFiltered)
                filtersApplied = 'yes'
                loader.style.display = 'none'
            })
        }
    })

    unfilterUsers.addEventListener("click", async() => {
        filterName.value = 'default'
        filterEmail.value = ''
        filterDni.value = ''
        filterCategory.value = 'default'
        filterDate.value = ''
        bodyUsers.innerHTML = ''
        loader.style.display = 'block'
        users = await getUsers(companies)
        usersFiltered = getUsersFiltered(users)
        printTableUsers(usersFiltered)
        filtersApplied = 'no'
        loader.style.display = 'none'
    })

    //close and cancel popups
    closeAndCancel.forEach(element => {
        element.addEventListener("click", async() => {
            let popupToClose = document.getElementById(element.id.replace('Close',''))
            popupToClose = document.getElementById(popupToClose.id.replace('Cancel',''))
            popupToClose.style.display = 'none'
        })
    })

    //block user popup
    blockPopupAccept.addEventListener("click", async() => {

        const data = {'users':globals.selectedUsers}

        await fetch(dominio + '/apis/users/block-users',{
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)  
        })

        //get updated users
        users = await getUsers(companies)

        //filter users if necessary
        usersFiltered = getUsersFiltered(users)

        //print table
        printTableUsers(usersFiltered)

        //unselect elements
        globals.selectedUsers = []
        unCheckElements(usersFiltered)
        hideDGAs()

        blockPopup.style.display = 'none'
        okBlockPopup.style.display = 'block'

        //hide okPopup after one second
        setTimeout(function() {
            okBlockPopup.style.display = 'none'
        }, 1000)

    })

    //restore password popup
    restorePopupAccept.addEventListener("click", async() => {

        const data = {'users':globals.selectedUsers}

        await fetch(dominio + '/apis/users/restore-passwords',{
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })

        //unselect elements
        globals.selectedUsers = []
        const usersToUncheck =  filtersApplied == 'no' ? users : usersFiltered
        unCheckElements(usersToUncheck)
        hideDGAs()

        restorePopup.style.display = 'none'        
        okRestorePopup.style.display = 'block';

        //hide okPopup after one second
        setTimeout(function() {
            okRestorePopup.style.display = 'none';
        }, 700)

    })

    //editPopup event listeners
    selectCourseAssign.addEventListener("change", async() => {
        
        selectCommissionAssign.innerHTML = '<option value="default" selected></option>'

        if (selectCourseAssign.value != 'default') {

            //get course id
            const courseId = selectCourseAssign.value

            //get commissions
            const filteredCommissions = commissions.filter(c => c.id_courses == courseId)

            filteredCommissions.forEach(element => {
                const startDate = dateToString(element.start_date)
                const endDate = dateToString(element.end_date)
                
                selectCommissionAssign.innerHTML += '<option value=' + element.id + '>' + element.commission + ' (' + startDate + ' - ' + endDate +')</option>'
            })
            
        }
    })

    assignPopupAccept.addEventListener("click", async() => {

        if (selectCommissionAssign.value == 'default') {
            selectCommissionErrorText.innerText = 'Debe elegir una comisión'
            selectCommissionError.style.display = 'flex'           
        }else{
            //assign from DGAs users.ejs
            if (assignFrom.innerText == 'DGAassignCommissions') {
                let nonStudentIds = 0

                globals.selectedUsers.forEach(user => {
                    if (user.id_user_categories != 4) {
                        nonStudentIds += 1
                    }
                })
                if (nonStudentIds > 0) {
                    selectCommissionErrorText.innerText = 'Solo puede asignar comisiones a perfiles de alumno'
                    selectCommissionError.style.display = 'flex'
                }else{
                    const data = {
                        'users':globals.selectedUsers,
                        'id_course_commissions':selectCommissionAssign.value
                    }

                    await fetch(dominio + '/apis/users/assign-commission',{
                    method:'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                    })

                    //unselect elements
                    globals.selectedUsers = []
                    const usersToUncheck =  filtersApplied == 'no' ? users : usersFiltered
                    unCheckElements(usersToUncheck)
                    hideDGAs(DGAs)

                    okAssignPopup.style.display = 'block'

                    //hide okPopup after one second
                    setTimeout(function() {
                        okAssignPopup.style.display = 'none';
                    }, 1000)
                }
            }else{//assign from DGAs users.ejs

                const commissionToAdd = commissions.filter( c => c.id == selectCommissionAssign.value)[0]

                const id = globals.newCommissions.reduce((max, obj) => (obj.id > max ? obj.id : max), 0) + 1
                
                globals.newCommissions.push({
                    id:id,
                    id_course_commissions: selectCommissionAssign.value,
                    id_students: globals.selectedUsers.id,
                    commission_data:{
                        commission:commissionToAdd.commission,
                        start_date:commissionToAdd.start_date,
                        end_date:commissionToAdd.end_date,
                        id_courses: selectCourseAssign.value
                    }
                })

                globals.commissionsToAdd.push({
                    id:id,
                    id_course_commissions:selectCommissionAssign.value,
                    id_students:globals.selectedUsers[0].id
                })
                
                printTableCommissions(globals.newCommissions)
                
            }
            noCommissions.classList.add('notVisible')
            yesCommissions.classList.remove('notVisible')
            assignPopup.style.display = 'none' 
        }        
            
    })

    //selectAll
    selectAll.addEventListener("click", async() => {
        const usersToCheck =  filtersApplied == 'no' ? users : usersFiltered
        globals.selectedUsers = []
        if (selectAll.checked) {
            
            showDGAs()

            //check elements
            usersToCheck.forEach(user => {
                const select = document.getElementById('select_' + user.id)                                
                select.checked = true
                globals.selectedUsers.push(user)
            })
        }else{
            hideDGAs()
            unCheckElements(usersToCheck)
        }
    })

    //DGA (Divs General Actions)
    DGAblockUsers.addEventListener("click", async() => {

        /*const position = DGAblockUsers.getBoundingClientRect()

        blockPopup.style.top = position.top + 'px'
        blockPopup.style.left = position.left + 'px'*/
        
        blockUsersQuestion.innerText = '¿Confirma que desea dar de baja a los usuarios seleccionados?'            
        userToBlock.innerHTML = ''
        blockPopup.style.display = 'block'        
    })

    DGArestorePasswords.addEventListener("click", async() => {
        restoreQuestion.innerText = '¿Confirma que desea restablecer las contraseñas de los usuarios seleccionados?'            
        userToRestore.innerHTML = ''
        restorePopup.style.display = 'block'        
    })

    DGAsassignCommissions.forEach(DGA => {
        DGA.addEventListener("click", async() => {

            selectCommissionError.style.display = 'none'

            assignFrom.innerText = DGA.id == 'DGAassignCommissions' ? 'DGAassignCommissions' : 'DGAassignCommission'
    
            //get courses
            const filteredCourses = globals.idCompany == 'allCompanies' ? courses : courses.filter(c => c.id_companies == globals.idCompany)
            
            //add selectCourse options
            selectCourseAssign.innerHTML = '<option value="default" selected></option>'
                
            filteredCourses.forEach(element => {
                selectCourseAssign.innerHTML += '<option value=' + element.id + '>' + element.course_name +'</option>'
            })
    
            //restore selectCommission
            selectCommissionAssign.innerHTML = '<option value="default" selected></option>'
    
            assignPopup.style.display = 'block'
        })        
    
    })    

    DGAblockFromEdit.addEventListener("click", async() => {
        const selectedUser = userId.innerText
        const restore = document.getElementById('restore_' + selectedUser)
        restorePopup.style.zIndex = '2'
        okRestorePopup.style.zIndex = '3'
        restore.click()
    })

    DGAcreateUsers.addEventListener("click", async() => {

        createUserCategory.innerHTML = '<option value="default"></option>'

        if (globals.idCompany != 'allCompanies') {
            const companyAdmins = await (await fetch(dominio + '/apis/tokens/tokens-to-assign/2/' + globals.idCompany)).json()
            globals.companyAdmins = companyAdmins.length

            const teachersToAssign = await (await fetch(dominio + '/apis/tokens/tokens-to-assign/3/' + globals.idCompany)).json()
            globals.teachersToAssign = teachersToAssign.length
            
            const studentsToAssign = await (await fetch(dominio + '/apis/tokens/tokens-to-assign/4/' + globals.idCompany)).json()
            globals.studentsToAssign = studentsToAssign.length

            createUsersQty.innerHTML = 'Puede crear un máximo de <b>' + globals.companyAdmins + '</b> usuarios <b>Administrador institución</b>, <b>' + globals.teachersToAssign + '</b> usuarios <b>Profesor</b> y <b>' + globals.studentsToAssign + '</b> usuarios <b>Alumno</b>.'

            createUserCategory.innerHTML += '<option value="2">Administrador institución</option>'
            createUserCategory.innerHTML += '<option value="3">Profesor</option>'
            createUserCategory.innerHTML += '<option value="4">Alumno</option>'
            
        }else{
            createUserCategory.innerHTML += '<option value="1">Administrador general</option>'
            createUsersQty.innerHTML = 'Sólo puede crear usuarios <b>Administrador general</b>'
        }

        createUserCategory.value = 'default'
        createUserLastName.value = ''
        createUserFirstName.value = ''
        createUserEmail.value = ''
        createUserDNI.value = ''
        createError.style.display = 'none'
        createError2.style.display = 'none'
        globals.usersToCreate = []
        createPopup.style.display = 'block'

    })

    editPopupAccept.addEventListener("click", async() => {
        if (userLastName.value == '' || userFirstName.value == '' || userDNI.value == '') {
            editUserDataError.style.display = 'flex'
        }else{
            editUserDataError.style.display = 'none'
            confirmEditionPopup.style.display = 'block'
        }
    })

    confirmEditionPopupAccept.addEventListener("click", async() => {

        const data = {

            'idUser':globals.selectedUsers[0].id,
            'commissionsToDelete':globals.commissionsToDelete,
            'userData':{
                last_name:userLastName.value,
                first_name:userFirstName.value,
                dni:userDNI.value
            },
            'commissionsToAdd':globals.commissionsToAdd
        }

        //delete data from course-commissions-students
        await fetch(dominio + '/apis/commissions/delete-commissions-students/',{
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })

        //add data to course-commissions-students
        await fetch(dominio + '/apis/commissions/add-commissions-students/',{
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })

        //edit personal data
        await fetch(dominio + '/apis/users/edit-user-data/',{
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })

        editPopup.style.display = 'none'
        confirmEditionPopup.style.display = 'none'

        loader.style.display = 'block'

        //get updated users
        users = await getUsers(companies)

        //filter users if necessary
        usersFiltered = getUsersFiltered(users)

        //print table
        printTableUsers(usersFiltered)

        //unselect elements
        globals.selectedUsers = []
        unCheckElements(usersFiltered)
        hideDGAs()
        
        loader.style.display = 'none'

        okEditPopup.style.display = 'block'

        //hide okPopup after one second
        setTimeout(function() {
            okEditPopup.style.display = 'none'
        }, 1000)
    })

    cudppTitleIcon.addEventListener("mouseover", async() => {
        createUsersQty.style.display = 'block'
    })

    cudppTitleIcon.addEventListener("mouseout", async() => {
        createUsersQty.style.display = 'none'
    })

    createUserIcon.addEventListener("click", async() => {        
        if (createUserCategory.value == 'default' || createUserLastName.value == '' || createUserFirstName.value == '' || createUserEmail.value == '' || createUserDNI.value == '') {
            createErrorText.innerText = 'Debe completar todos los campos'
            createError.style.display = 'flex'
        }else{
            const email = createUserEmail.value
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!regex.test(email)) {
                createErrorText.innerText = 'Email inválido'
                createError.style.display = 'flex'
            }else{
                const findUser = allUsers.filter(u => u.user_email == createUserEmail.value)
                if (findUser.length > 0) {
                    createErrorText.innerText = 'El usuario ' + createUserEmail.value + ' ya existe'
                    createError.style.display = 'flex'
                }else{
                    const findUserToCreate = globals.usersToCreate.filter(u => u.user_email == createUserEmail.value)
                    if (findUserToCreate.length > 0) {
                        createErrorText.innerText = 'Ya ingresó un usuario con el email:  ' + createUserEmail.value
                        createError.style.display = 'flex'
                    }else{

                        const categoryName = usersCategories.filter(c => c.id == createUserCategory.value)[0].category_name
                        const idUserCategory = createUserCategory.value
                        const tokensToAssign = await (await fetch(dominio + '/apis/tokens/tokens-to-assign/' + idUserCategory + '/' + globals.idCompany)).json()

                        const tokensToAssignQty = tokensToAssign.length
                        
                        const usersToCreate = globals.usersToCreate.filter( u => parseInt(u.id_user_categories) == parseInt(idUserCategory)).length

                        if (globals.idCompany != 'allCompanies' && tokensToAssignQty <= usersToCreate) {
                            createErrorText.innerText = 'Puede crear un máximo de ' + tokensToAssignQty + ' usuarios ' + categoryName + '. Si necesita más licencias debe solicitarlas al administrador.'
                            createError.style.display = 'flex'
                        }else{
                            createError.style.display = 'none'
                            const categoryName = usersCategories.filter(c => c.id == createUserCategory.value)[0].category_name
                            const newId = globals.usersToCreate.length == 0 ? 1 : Math.max(...globals.usersToCreate.map(element => element.id)) + 1
                            globals.usersToCreate.push({
                                id: newId,
                                id_user_categories : createUserCategory.value ,
                                last_name: createUserLastName.value,
                                first_name:createUserFirstName.value,
                                user_email: createUserEmail.value,
                                id_document: createUserDNI.value,
                                category_name: categoryName
                            })

                            printTableCreateUser(globals.usersToCreate)

                            createUserCategory.value = 'default'
                            createUserLastName.value = ''
                            createUserFirstName.value = ''
                            createUserEmail.value = ''
                            createUserDNI.value = ''
                        }
                    }
                }
            }
        }
    })

    createUserCourse.addEventListener("change", async() => {
        
        createUserCommission.innerHTML = '<option value="default" selected></option>'

        if (createUserCourse.value != 'default') {

            //get course id
            const courseId = createUserCourse.value

            //get commissions
            const filteredCommissions = commissions.filter(c => c.id_courses == courseId)

            filteredCommissions.forEach(element => {
                const startDate = dateToString(element.start_date)
                const endDate = dateToString(element.end_date)
                
                createUserCommission.innerHTML += '<option value=' + element.id + '>' + element.commission + ' (' + startDate + ' - ' + endDate +')</option>'
            })
            
        }
    })

    createPopupAccept.addEventListener("click", async() => {

        if (globals.usersToCreate.length == 0) {
            createErrorText.innerText = 'Debe ingresar al menos un usuario'
            createError.style.display = 'flex'
        }
        if (globals.usersToCreate.length > 0 ) {

            loader.style.display = 'block'
            
            const data = {
                'usersToCreate':globals.usersToCreate,
                'companyId':globals.idCompany,
                'commissionId':createUserCommission.value
            }

            createPopup.style.display = 'none'
    
            //create users
            await fetch(dominio + '/apis/users/create-users/',{
                method:'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            })

            let users = await getUsers(companies)
            const usersFiltered = globals.idCompany == 'allCompanies' ? users : users.filter( u => u.id_companies == globals.idCompany)
            printTableUsers(usersFiltered)
            
            //unselect elements
            globals.selectedUsers = usersFiltered
            unCheckElements(usersFiltered)
            hideDGAs()

            loader.style.display = 'none'

            okCreatePopup.style.display = 'block'

            //hide okPopup after one second
            setTimeout(function() {
                okCreatePopup.style.display = 'none'
            }, 1000)    
        }
    
    })

    uploadExcelAccept.addEventListener("click", async() => {
        
        const file = uploadExcelInput.files[0]
        
        if (file) {
            const teachersAllowed = await (await fetch(dominio + '/apis/tokens/tokens-to-assign/3/' + globals.idCompany)).json()
            const studentsAllowed = await (await fetch(dominio + '/apis/tokens/tokens-to-assign/3/' + globals.idCompany)).json()
            const adminsAllowed = await (await fetch(dominio + '/apis/tokens/tokens-to-assign/3/' + globals.idCompany)).json()

            let students = 0
            let teachers = 0
            let admins = 0

            const formData = new FormData()
            formData.append('excelFile', uploadExcelInput.files[0])

            const response = await fetch('/apis/users/read-excel-file', {
                method: 'POST',
                body: formData
              })

            const data = await response.json()

            //validations
            //at least one user
            if (data.length == 1) {
            excelError1.classList.remove('notVisible')
            }else{
            excelError1.classList.add('notVisible')
            }

            //complete data
            data.forEach(element => {
                if (element[0] == '' || element[1] == '' || element[2] == '' || element[3] == '' || element[4] == '') {
                    excelError2.classList.remove('notVisible')
                }else{
                    excelError2.classList.remove('notVisible')
                }
            })

            //   data.forEach(element => {
            //     students = element[4] == 4 ? (students + 1) : students
            //     teachers = element[4] == 3 ? (teachers + 1) : teachers
            //     admins = element[4] == 2 ? (admins + 1) : admins
            //   })

            //   console.log(students)
            //   console.log(teachers)
            //   console.log(admins)

        } else {
            console.log('ingrese un archivo')
        }
    })


})