import { dominio } from "./dominio.js"

window.addEventListener('load',async()=>{
    
    const selectCompany = document.getElementById('selectCompany')
    const notAssignedTokens = await (await fetch(dominio + '/apis/not-assigned-tokens')).json()
    const companies = await (await fetch(dominio + '/apis/companies')).json()
    const tokensToAssignText = document.getElementById('tokensToAssignText')
    const admTokensToAssignText = document.getElementById('admTokensToAssignText')
    const teacherTokensToAssignText = document.getElementById('teacherTokensToAssignText')
    const studentTokensToAssignText = document.getElementById('studentTokensToAssignText')
    const tokensToAssignText2 = document.getElementById('tokensToAssignText2')
    const admTokensToAssignText2 = document.getElementById('admTokensToAssignText2')
    const teacherTokensToAssignText2 = document.getElementById('reacherTokensToAssignText2')
    const studentTokensToAssignText2 = document.getElementById('studentTokensToAssignText2')
    const noTokensToAssignText2 = document.getElementById('noTokensToAssignText2')
    const noTokensToAssignText = document.getElementById('noTokensToAssignText')
    
    selectCompany.addEventListener("change",async(e)=>{

        if(tokensToAssignText2){
            tokensToAssignText2.innerHTML = ''
            admTokensToAssignText2.classList.add('divFlex6Display')
            teacherTokensToAssignText2.classList.add('divFlex6Display')
            studentTokensToAssignText2.classList.add('divFlex6Display')
            noTokensToAssignText2.classList.add('divFlex6Display')
        }        

        //get the selected option
        const selectedOption = (e.target.options[e.target.selectedIndex]).innerText
        //get selected company
        const selectedCompany = companies.filter(company => company.company_name == selectedOption );

        //administrator tokens to assign
        if(selectedOption != '--Seleccione una institución--'){
            const notAssignedAdm = notAssignedTokens.filter(token => token.id_companies == selectedCompany[0].id && token.id_user_categories == 2)
            const notAssignedTeacher = notAssignedTokens.filter(token => token.id_companies == selectedCompany[0].id && token.id_user_categories == 3)
            const notAssignedStudent = notAssignedTokens.filter(token => token.id_companies == selectedCompany[0].id && token.id_user_categories == 4)

            if ((notAssignedAdm.length + notAssignedTeacher.length + notAssignedStudent.length) > 0 ) {
                tokensToAssignText.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Tiene para asignar un total de ' + (notAssignedAdm.length + notAssignedTeacher.length + notAssignedStudent.length) + ' licencias a distribuir de la siguiente manera:'
                admTokensToAssignText.innerHTML = '<div>Licencias de Administrador: </div><div>' + notAssignedAdm.length +'</div>'
                teacherTokensToAssignText.innerHTML = '<div>Licencias de Profesor: </div><div>' + notAssignedTeacher.length +'</div>'
                studentTokensToAssignText.innerHTML = '<div>Licencias de Alumno: </div><div>' + notAssignedStudent.length +'</div>'
                
                admTokensToAssignText.classList.remove('divFlex6Display')
                teacherTokensToAssignText.classList.remove('divFlex6Display')
                studentTokensToAssignText.classList.remove('divFlex6Display')
                noTokensToAssignText.classList.add('divFlex6Display')
            }
            
        }else{
            tokensToAssignText.innerHTML = ''
            noTokensToAssignText.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> No posee licencias pendientes de asignación.'
            admTokensToAssignText.classList.add('divFlex6Display')
            teacherTokensToAssignText.classList.add('divFlex6Display')
            studentTokensToAssignText.classList.add('divFlex6Display')
            noTokensToAssignText.classList.remove('divFlex6Display')
        }
    })
})


