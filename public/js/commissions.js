import { dominio } from "./dominio.js"
import hideAndShow from "./functions/hideAndShow.js"

window.addEventListener('load',async()=>{

    const commissionId = document.getElementById('commissionId').innerText
    const data = await (await fetch(dominio + '/apis/commission-data/' + commissionId)).json()
    const divObs = document.getElementById('divObs')    
    const divObsDetails = document.getElementById('divObsDetails')
    const divExDetails = document.getElementById('divExDetails')
    const divX = document.getElementById('divX')
    
    for (let i = 0; i < data.length; i++) {

        const divSteps = document.getElementById('divSteps_' + data[i].id)

        for (let j = 0; j < data[i].exercises.length; j++) {

            const angleRight = document.getElementById('angleRight' + data[i].id + data[i].exercises[j].id)
            const angleLeft = document.getElementById('angleLeft' + data[i].id + data[i].exercises[j].id)

            angleRight.addEventListener("click",async(e)=>{

                //add ecercise steps info to div
                const exerciseSteps = data[i].exercises[j].steps

                const divStepsLine1 = '<div class=divExTitle><b>Ej ' + (j+1) + '. ' + data[i].exercises[j].exercise_name +'</b></div>'
                const divStepsLine2 = '<div class=divExTitle><b>Pasos:</b></div>'
                let divStepsLine3 = ''

                if (exerciseSteps.length == 0) {
                    divStepsLine3 = '<div class=divExData>No hay pasos registrados en el ejercicio</div>'
                }else{
                    exerciseSteps.forEach(step => {
                        divStepsLine3 += '<div class=divExData>' + step.code + ': ' + step.stepName + '</div>'
                    })
                }

                divSteps.innerHTML = divStepsLine1 + divStepsLine2 + divStepsLine3

                //show divSteps and hide angles
                divSteps.classList.remove('notVisible')
                
                //hide and show steps data according to selecion
                hideAndShow(data[i],j,'angleRight')
            })

            angleLeft.addEventListener("click",async(e)=>{
                
                //hide divSteps and hide angles
                divSteps.classList.add('notVisible')
                
                //hide and show steps data according to selecion
                hideAndShow(data[i],j,'angleLeft')

            })
        }

        for (let j = 0; j < data[i].studentsResults.length; j++) {

            const simulatorId = data[i].id
            const studentId = data[i].studentsResults[j].id
            const exercises = data[i].studentsResults[j].exercisesResults
            const firstName = data[i].studentsResults[j].first_name
            const lastName = data[i].studentsResults[j].last_name

            exercises.forEach(exercise => {
                
                const exerciseId = exercise.id_exercises                

                const plusCom = document.getElementById('plusCom_' + simulatorId + '_' + studentId + '_' + exerciseId)

                if (plusCom != null) {
                    plusCom.addEventListener("click",async(e)=>{

                        const exercise = data[i].exercises.filter(exercise => exercise.id == exerciseId)[0]
                        const exerciseName = exercise.exercise_name
                        const exerciseSteps = exercise.steps

                        const exercisesResults = await (await fetch(dominio + '/apis/exercises-results/' + exerciseId + '/' + studentId)).json()

                        divExDetails.innerHTML ='<div id="divX2">x</div>'
                        divExDetails.innerHTML += '<div class="divStudent"> <b>Alumno: </b> '+ lastName +', '+ firstName + '</div>'
                        divExDetails.innerHTML += '<div class="divExercise"><b>Ejercicio: </b>'+ exerciseName +'</div>'

                        var steps =''
                        exerciseSteps.forEach(step => {
                            steps += '<div class="divStepsCodes"><b>' + step.code + '</b></div>'
                        })

                        divExDetails.innerHTML += '<div class="divFlexExDetails"><div class="divExData3"><b>Fecha</b></div><div class="divExData2"><b>Nota</b></div><div class="divExData2"><b>Tiempo</b></div>' + steps + '</div>'

                        for (let j = 0; j < exercisesResults.length; j++) {
                            const fullDate = new Date(parseInt(exercisesResults[j].date))
                            const day = fullDate.getDate()
                            const month = fullDate.getMonth() + 1
                            const year = fullDate.getFullYear()
                            const date = day +'/' + month + '/' + year
                            var stepsResultsHtml = []
                            var result = ''

                            const stepsResults = exercisesResults[j].stepsResults

                            stepsResults.forEach(stepResult => {
                                if (stepResult.type == 'Paso realizado correctamente') {
                                    result = '<i class="fa-solid fa-check stepPassed"></i>'
                                }
                                if (stepResult.type == 'Error') {
                                    result = '<i class="fa-solid fa-xmark stepNotPassed2"></i>'
                                }
                                if (stepResult.type == '-') {
                                    result = '<i class="fa-solid fa-minus stepNotDone"></i>'
                                }
                                stepsResultsHtml += '<div class="div17">' + result + '</div>'
                                
                            })
                            
                            divExDetails.innerHTML += '<div class="divFlex9"><div class="divExInfo2">' + date + '</div><div class="divExInfo">' + exercisesResults[j].grade + '</div><div class="divExInfo">' + exercisesResults[j].duration_secs + '</div>' + stepsResultsHtml + '</div>'
                        }

                        const divX2 = document.getElementById('divX2')

                        divX2.addEventListener("click",async(e)=>{
                            console.log('hola')
                            divExDetails.classList.add('notVisible')
                        })

                        divExDetails.style.left = plusCom.getBoundingClientRect().x + window.scrollX + -200 + 'px'//because header is 200px

                        divExDetails.style.top = plusCom.getBoundingClientRect().y + window.scrollY + 'px'

                        divExDetails.classList.remove('notVisible')

                        })
                    }
                
            })            

            for (let k = 0; k < data[i].studentsResults[j].exercisesResults.length; k++) {

                const steps = data[i].studentsResults[j].exercisesResults[k].stepsData
                
                steps.forEach(step => {

                    const xDiv = document.getElementById('x_' + data[i].id + '_' + step.id_exercises + '_' + data[i].studentsResults[j].id + '_' + step.description)

                    if (xDiv != null) {

                        xDiv.addEventListener("click",async(e)=>{

                            const observations = step.observations

                            divObsDetails.innerHTML = '<div class=divExData>' + observations.replace(/\n/g, '<br><br>') + '</div>'
                            
                            divObs.style.left = xDiv.getBoundingClientRect().x + window.scrollX + -200 + 'px'//because header is 200px
                            divObs.style.top = xDiv.getBoundingClientRect().y + window.scrollY + 'px'

                            divObs.classList.remove('notVisible')
                            
                        })
                    }
                })
            }
        }
    }

    divX.addEventListener("click",async(e)=>{
        divObs.classList.add('notVisible')
    })

    

})

    
