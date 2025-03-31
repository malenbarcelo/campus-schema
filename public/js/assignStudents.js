import { dominio } from "./dominio.js"

window.addEventListener('load',async()=>{

    const selectCourse = document.getElementById('selectCourse')
    const selectCommission = document.getElementById('selectCommission')
    const selectCompany = document.getElementById('selectCompany')
    const noteForAdministrator = document.getElementById('noteForAdministrator')
    const divErrorSelectCompany = document.getElementById('divErrorSelectCompany')
    const divError = document.getElementById('divErrorSelectCourse')
    const companies = await (await fetch(dominio + '/apis/companies')).json()
    const courses = await (await fetch(dominio + '/apis/courses')).json()
    const allCommissions = await (await fetch(dominio + '/apis/commissions')).json()
    const notAssignedTokens = await (await fetch(dominio + '/apis/not-assigned-tokens')).json()
    var idCompany = ''
    
    if(selectCompany != null){

        selectCompany.addEventListener("change",async(e)=>{

            selectCommission.innerHTML='<option value="default" selected></option>'

            const selectedOption = (e.target.options[e.target.selectedIndex]).innerText

            if(selectedOption != '--Seleccione una institución--'){

                selectCourse.classList.remove('isInvalid')
                selectCompany.classList.remove('isInvalid')
                divError.innerHTML = ''
                divErrorSelectCompany.innerHTML = ''
                
                //get company id
                const company = companies.filter(company => company.company_name == selectedOption )
                idCompany = company[0].id

                //get cmpany students
                const companyStudents = await (await fetch(dominio + '/apis/company-students/' + idCompany)).json()
                const availableTokens = notAssignedTokens.filter(nat => nat.id_companies == idCompany && nat.id_user_categories == 4)

                //add administrator note
                // if(companyStudents.length == 0){
                //     noteForAdministrator.innerHTML = '<p class="p1"><i class="fa-solid fa-triangle-exclamation"></i> La institución no posee licencias de alumnos disponibles.</p>'
                // }else{

                //     noteForAdministrator.innerHTML = '<p class="p1"><i class="fa-solid fa-triangle-exclamation"></i> Tiene un total de ' + availableTokens.length + ' licencias de alumno disponibles para asignar.</p>'


                //     // noteForAdministrator.innerHTML = '<p class="p1"><i class="fa-solid fa-triangle-exclamation"></i> Puede asignar un máximo de '+ companyStudents.length +' alumnos a cada comisión, en caso de necesitar más cupos, solicite nuevos tokens de alumnos para la institución.</p>'
                // }

                //get company courses
                const companyCourses = await (await fetch(dominio + '/apis/company-courses/' + idCompany)).json()
                selectCourse.innerHTML='<option value="default" selected></option>'
                for (let i = 0; i < companyCourses.length; i++) {
                    selectCourse.innerHTML += '<option value=' + companyCourses[i].course_name + '>' + companyCourses[i].course_name + '</option>'
                }

            }else{
                noteForAdministrator.innerHTML = ''
                selectCourse.innerHTML='<option value="default" selected></option>'
            }
        })
    }else{
        idCompany = document.getElementById('idCompany').innerHTML
    }
    
    selectCourse.addEventListener("change",async(e)=>{

        //get the selected option
        const selectedOption = (e.target.options[e.target.selectedIndex]).innerText

        //get course id
        const courseId = courses.filter(course => (course.course_name == selectedOption && course.id_companies == idCompany))

        //get commissions
        var commissionsFiltered = []

        if(selectCourse.value != 'default'){
            commissionsFiltered = allCommissions.filter(commission =>commission.id_courses == courseId[0].id)
        }

        const commissionsForSelect = []

        if(commissionsFiltered){
            commissionsFiltered.forEach(commission => {
                commissionsForSelect.push({id:commission.id, commissionName:commission.commission + ': [inicio: ' + commission.start_date + ' -- fin: ' + commission.end_date + "]"})
            })
        }

        selectCommission.innerHTML='<option value="default" selected></option>'

        for (let i = 0; i < commissionsForSelect.length; i++) {
            selectCommission.innerHTML += '<option value=' + commissionsForSelect[i].id + '>' + commissionsForSelect[i].commissionName + '</option>'
        }

        if (commissionsForSelect.length == 0 && selectCourse.value != 'default') {
            selectCourse.classList.add('isInvalid')
            const divError = document.getElementById('divErrorSelectCourse')
            divError.innerHTML = 'El curso seleccionado no tiene comisiones asociadas. Primero debe crear una comisión'
        }else{
            selectCourse.classList.remove('isInvalid')
            const divError = document.getElementById('divErrorSelectCourse')
            divError.innerHTML = ''
        }
        }),
    selectCommission.addEventListener("change",async(e)=>{
        selectCommission.classList.remove('isInvalid')
        const divError2 = document.getElementById('divErrorSelectCommission')
        divError2.innerHTML = ''
    })
})