import { dominio } from "./dominio.js"

window.addEventListener('load',async()=>{
    
    const selectCompany = document.getElementById('selectCompany')
    const selectCourse = document.getElementById('selectCourse')
    const selectTeacher = document.getElementById('selectTeacher')
    const selectTeacher2 = document.getElementById('selectTeacher2')
    const selectTeacher3 = document.getElementById('selectTeacher3')
    const companies = await (await fetch(dominio + '/apis/companies')).json()
    
    selectCompany.addEventListener("change",async(e)=>{

        var companyCourses = []
        var companyTeachers = []
        
        //get the selected option
        const selectedOption = (e.target.options[e.target.selectedIndex]).innerText

        const company = companies.filter(company => company.company_name == selectedOption)

        if(company.length > 0){

            //empty course and teacher select 
            selectCourse.innerHTML='<option value="default" selected>--Seleccione un curso--</option>'
            selectTeacher.innerHTML='<option value="default" selected>--Seleccione un profesor--</option>'
            selectTeacher2.innerHTML='<option value="default" selected>--Seleccione un profesor--</option>'
            selectTeacher3.innerHTML='<option value="default" selected>--Seleccione un profesor--</option>'
            
            //get company id
            const company = companies.filter(company => company.company_name == selectedOption)
            const idCompany = company[0].id
            
            //get company courses
            companyCourses = await (await fetch(dominio + '/apis/company-courses/' + idCompany)).json()

            //complete courses select
            for (let i = 0; i < companyCourses.length; i++) {
                const courseName = companyCourses[i].course_name
                selectCourse.innerHTML += '<option value="' + courseName + '">' + courseName + '</option>'
            }

            //get company teachers
            companyTeachers = await (await fetch(dominio + '/apis/company-teachers/' + idCompany)).json()

            //complete teachers select
            for (let i = 0; i < companyTeachers.length; i++) {
                selectTeacher.innerHTML += '<option value=' + companyTeachers[i].id + '>' + companyTeachers[i].last_name + ', ' + companyTeachers[i].first_name + ' (' + companyTeachers[i].user_email + ')</option>'

                selectTeacher2.innerHTML += '<option value=' + companyTeachers[i].id + '>' + companyTeachers[i].last_name + ', ' + companyTeachers[i].first_name + ' (' + companyTeachers[i].user_email + ')</option>'

                selectTeacher3.innerHTML += '<option value=' + companyTeachers[i].id + '>' + companyTeachers[i].last_name + ', ' + companyTeachers[i].first_name + ' (' + companyTeachers[i].user_email + ')</option>'
            }
        }else{
            //empty course and teacher select 
            selectCourse.innerHTML='<option value="default" selected>--Seleccione un curso--</option>'
            selectTeacher.innerHTML='<option value="default" selected>--Seleccione un curso--</option>'
            selectTeacher2.innerHTML='<option value="default" selected>--Seleccione un curso--</option>'
            selectTeacher3.innerHTML='<option value="default" selected>--Seleccione un curso--</option>'
        }
    })
})


