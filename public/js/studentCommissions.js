import { dominio } from "./dominio.js"

window.addEventListener('load',async()=>{

    const userExercises = await (await fetch(dominio + '/apis/user-exercises')).json()
    
    const divStepComments = document.getElementById('divStepComments')

    for (let i = 0; i < userExercises.length; i++) {

        const wrongAnswers = await (await fetch(dominio + '/apis/steps-wrong-anwers/' + userExercises[i].id)).json()
        
        for (let j = 0; j < wrongAnswers.length; j++) {

            const observation = document.getElementById('obs_' + wrongAnswers[j].id)
            
            if(observation != null){
                observation.addEventListener("click",async(e)=>{

                    divStepComments.innerHTML ='<div class="div13" id="closeObservation">x</div>'
                    divStepComments.innerHTML += '<div class="div14"> <b>Observaciones: </b></div>'
                    divStepComments.innerHTML += '<div class="div15">'+ wrongAnswers[j].observations +'</div>'

                    divStepComments.style.display = 'block'
                    divStepComments.style.left = observation.getBoundingClientRect().x + window.pageXOffset + 'px'
                    divStepComments.style.top = observation.getBoundingClientRect().y + window.pageYOffset + 'px'

                    const closeObservation = document.getElementById('closeObservation')
                    
                    closeObservation.addEventListener("click",async(e)=>{
                        divStepComments.style.display = 'none'
                    })
                })
            }
    }

}

})