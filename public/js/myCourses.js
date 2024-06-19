import { dominio } from "./dominio.js"

window.addEventListener('load',async()=>{

    //get user logged courses
    const idCourses = await (await fetch(dominio + '/apis/courses-filtered')).json()
    
    idCourses.forEach(idCourse => {
        
        document.getElementById('plusMyCourses' + idCourse.id_courses).addEventListener("click",(e)=>{
            document.getElementById('commissionsCourse' + idCourse.id_courses).style.display = 'block'
            document.getElementById('plusMyCourses' + idCourse.id_courses).style.display = 'none'
            document.getElementById('minusMyCourses' + idCourse.id_courses).style.display = 'block'
        })
        
        document.getElementById('minusMyCourses' + idCourse.id_courses).addEventListener("click",(e)=>{
            document.getElementById('commissionsCourse' + idCourse.id_courses).style.display = 'none'
            document.getElementById('plusMyCourses' + idCourse.id_courses).style.display = 'block'
            document.getElementById('minusMyCourses' + idCourse.id_courses).style.display = 'none'
        })
    })
})
