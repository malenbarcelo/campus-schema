import { dominio } from "./dominio.js"
import { globals } from "./globals.js"
import { dateToString } from "./generalFunctions.js"

function printTableUsers(dataToPrint) {

    bodyUsers.innerHTML = ''
    selectAll.checked = false

    let counter = 0

    //printTable
    dataToPrint.forEach(element => {

        const rowClass = counter % 2 == 0 ? 'tBody1 tBodyEven' : 'tBody1 tBodyOdd'
        const dateString = dateToString(element.register_date)
        
        //print table
        const line1 = '<th class="' + rowClass + '">' + element.last_name + ', ' + element.first_name + '</th>'
        const line2 = '<th class="' + rowClass + '">' + (element.id_document == null ? '' : element.id_document) + '</th>'
        const line3 = '<th class="' + rowClass + '">' + element.user_email + '</th>'    
        const line4 = '<th class="' + rowClass + '">' + element.user_user_category.category_name + '</th>'
        const line5 = '<th class="' + rowClass + '">' + dateString + '</th>'
        const line6 = '<th class="' + rowClass + '"><i class="fa-solid fa-user-pen bodyIcon" id="edit_' + element.id + '"></i></th>'
        const line7 = '<th class="' + rowClass + '"><i class="fa-solid fa-unlock-keyhole bodyIcon" id="restore_' + element.id + '"></i></th>'
        const line8 = '<th class="' + rowClass + '"><i class="fa-solid fa-user-xmark bodyIcon" id="block_' + element.id + '"></i></th>'
        const line9 = '<th class="' + rowClass + '"><input type="checkbox" id="select_' + element.id + '"></th>'

        bodyUsers.innerHTML += '<tr>' + line1 + line2 + line3 + line4 + line5 + line6 + line7 + line8 + line9 + '</tr>'

        counter += 1    })

    eventListenersUsers(dataToPrint)
    
}

function eventListenersUsers(dataToPrint) {

    dataToPrint.forEach(element => {

        const blockUser = document.getElementById('block_' + element.id)
        const restorePsw = document.getElementById('restore_' + element.id)
        const selectUser = document.getElementById('select_' + element.id)
        const editUser = document.getElementById('edit_' + element.id)

        //block user
        blockUser.addEventListener('click',async()=>{
            globals.selectedUsers = []
            globals.selectedUsers.push(element)
            blockUsersQuestion.innerText = '¿Confirma que desea dar de baja al usuario'            
            userToBlock.innerHTML = '<b>' + element.last_name + ', ' + element.first_name + '</b> ?'
            blockPopup.style.display = 'block'
        })

        //restore password
        restorePsw.addEventListener('click',async()=>{
            globals.selectedUsers = []
            globals.selectedUsers.push(element)
            restoreQuestion.innerText = '¿Confirma que desea restablecer la contraseña del usuario'
            userToRestore.innerHTML = '<b>' + element.last_name + ', ' + element.first_name + '</b> ?'
            restorePopup.style.display = 'block'
        })

        //edit user
        editUser.addEventListener('click',async()=>{

            globals.selectedUsers = []
            globals.commissionsToAdd = []
            globals.commissionsToDelete = []
            globals.userCommissionCompany = await (await fetch(dominio + '/apis/commissions/user-commissions/' + globals.idCompany + '/' + element.id)).json()
            globals.newCommissions = globals.userCommissionCompany            
            globals.selectedUsers.push(element)
            userId.innerText = element.id
            userLastName.value = element.last_name
            userFirstName.value = element.first_name
            userEmail.value = element.user_email
            userDNI.value = element.id_document
            userCategory.value = element.user_user_category.category_name
            if (element.id_user_categories != 4) {
                userCommissions.classList.add('notVisible')                
            }else{
                userCommissions.classList.remove('notVisible')
            }
            
            if (globals.userCommissionCompany.length > 0) {
                printTableCommissions(globals.userCommissionCompany)
                yesCommissions.classList.remove('notVisible')
                noCommissions.classList.add('notVisible')
            }else{
                noCommissions.classList.remove('notVisible')
                yesCommissions.classList.add('notVisible')
            }
            
            editUserDataError.style.display = 'none'
            editPopup.style.display = 'block'
        })

        //select users
        selectUser.addEventListener('click',async()=>{

            if (selectUser.checked) {
                globals.selectedUsers.push(element)
            }else{
                selectAll.checked = false
                globals.selectedUsers = globals.selectedUsers.filter(g => g.id != element.id)
            }

            if (globals.selectedUsers.length > 1) {
                showDGAs()
            }else{
                hideDGAs()
            }
        })
    })    
}

async function getUsers(companies) {
    
    let users = []
    const idUserCategory = userLoggedCategory.innerText

    if (idUserCategory == 1) { // user logged is "Administrador general"
        users = await (await fetch(dominio + '/apis/users')).json()
    }else{ // user logged is "Administrador institución"
        const idCompany = companies.filter(c => c.company_name == companyName.innerText)[0].id
        users = await (await fetch(dominio + '/apis/users/' + idCompany)).json()
    }

    return users

}

function getUsersFiltered(users) {

    let usersFiltered = users
    const idUserCategory = userLoggedCategory.innerText

    //company
    if (idUserCategory == 1) { // user logged is "Administrador general"

        globals.idCompany = selectCompany.value == 'default' ? 'allCompanies' : selectCompany.value

        usersFiltered = selectCompany.value == 'default' ? usersFiltered : usersFiltered.filter(u => u.id_companies == selectCompany.value)
    }

    //email
    usersFiltered = filterEmail.value == '' ? usersFiltered : usersFiltered.filter(u => u.user_email == filterEmail.value)

    //dni
    usersFiltered = filterDni.value == '' ? usersFiltered : usersFiltered.filter(u => u.id_document == filterDni.value)

    //user name
    usersFiltered = filterName.value == 'default' ? usersFiltered : usersFiltered.filter(u => u.id == filterName.value)

    //user category
    usersFiltered = filterCategory.value == 'default' ? usersFiltered : usersFiltered.filter(u => u.id_user_categories == filterCategory.value)

    //register date
    usersFiltered = filterDate.value == '' ? usersFiltered : usersFiltered.filter(u => u.register_date == filterDate.value)

    globals.selectedUsers = []

    return usersFiltered
}

function hideDGAs() {

    const DGAs = [DGAblockUsers,DGAassignCommissions,DGArestorePasswords]

    DGAs.forEach(DGA => {
        DGA.classList.add('notVisible')        
    })
}

function showDGAs() {

    const DGAs = [DGAblockUsers,DGAassignCommissions,DGArestorePasswords]

    DGAs.forEach(DGA => {
       DGA.classList.remove('notVisible')        
    })

    //if there is no company selected, unable assign commission
    if (globals.idCompany == 'allCompanies') {
        DGAassignCommissions.classList.add('notVisible')
    }
}

async function printTableCommissions(dataToPrint) {

    const courses = await (await fetch(dominio + '/apis/courses')).json()

    bodyCommissions.innerHTML = ''

    let counter = 0

    //printTable
    dataToPrint.forEach(element => {

        const rowClass = counter % 2 == 0 ? 'tBody1 tBodyEven' : 'tBody1 tBodyOdd'
        const dateStartString = dateToString(element.commission_data.start_date)
        const dateEndString = dateToString(element.commission_data.end_date)
        const courseName = courses.filter(c => c.id == element.commission_data.id_courses)[0].course_name
        
        //print table
        const line1 = '<th class="' + rowClass + '">' + courseName + '</th>'
        const line2 = '<th class="' + rowClass + '">' + element.commission_data.commission + ' (' + dateStartString + ' - ' + dateEndString + ')</th>'
        const line3 = '<th class="' + rowClass + '"><i class="fa-solid fa-xmark bodyIcon" id="deleteCommission_' + element.id + '"></i></th>'

        bodyCommissions.innerHTML += '<tr>' + line1 + line2 + line3 + '</tr>'

        counter += 1    
    })

    //add event listener
    
    dataToPrint.forEach(element => {
        
        const deleteCommission = document.getElementById('deleteCommission_' + element.id)

        deleteCommission.addEventListener("click", async() => {

            globals.newCommissions = globals.newCommissions.filter( n => n.id != element.id)

            globals.commissionsToDelete.push(element)
            globals.commissionsToAdd = globals.commissionsToAdd.filter(c => c.id != element.id)
            
            if (globals.newCommissions.length > 0) {
                printTableCommissions(globals.newCommissions)
                yesCommissions.classList.remove('notVisible')
                noCommissions.classList.add('notVisible')
            }else{
                noCommissions.classList.remove('notVisible')
                yesCommissions.classList.add('notVisible')
            }
            
        })
    })
    
}

async function printTableCreateUser(dataToPrint) {

    bodyCreateUser.innerHTML = ''

    let counter = 0

    //printTable
    dataToPrint.forEach(element => {

        const rowClass = counter % 2 == 0 ? 'tBody1 tBodyEven' : 'tBody1 tBodyOdd'
        
        //print table
        const line1 = '<th class="' + rowClass + '">' + element.category_name + '</th>'
        const line2 = '<th class="' + rowClass + '">' + element.last_name + '</th>'
        const line3 = '<th class="' + rowClass + '">' + element.first_name + '</th>'
        const line4 = '<th class="' + rowClass + '">' + element.user_email + '</th>'
        const line5 = '<th class="' + rowClass + '">' + element.id_document + '</th>'
        const line6 = '<th class="' + rowClass + '"><i class="fa-solid fa-xmark bodyIcon" id="deleteUserToCreate_' + element.id + '"></i></th>'

        bodyCreateUser.innerHTML += '<tr>' + line1 + line2 + line3 + line4 + line5 + line6 + '</tr>'

        counter += 1    
    })

    //add event listener    
    dataToPrint.forEach(element => {
        
        const deleteUserToCreate = document.getElementById('deleteUserToCreate_' + element.id)

        deleteUserToCreate.addEventListener("click", async() => {

            globals.usersToCreate = globals.usersToCreate.filter( u => u.id != element.id)
            printTableCreateUser(globals.usersToCreate)

            
        })
    })
}

export {printTableUsers,getUsers,getUsersFiltered,showDGAs,hideDGAs,printTableCommissions,printTableCreateUser}