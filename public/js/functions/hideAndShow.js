export default function hideAndShow(data,j,angleName) {

        for (let k = 0; k < data.exercises.length; k++) {

            const angleRight = document.getElementById('angleRight' + data.id + data.exercises[k].id)
            const angleLeft = document.getElementById('angleLeft' + data.id + data.exercises[k].id)
            const stepsData = document.querySelectorAll('.stepsData_' + data.id + data.exercises[k].id)
            const th = document.getElementById('th_' + data.id + data.exercises[k].id)

            if (angleName == 'angleRight') {

                divObs.classList.add('notVisible')
                divExDetails.classList.add('notVisible')
                
                if (k == j) {
                    
                    angleRight.classList.add('notVisible')
                    angleLeft.classList.remove('notVisible')

                    stepsData.forEach(element => {
                        element.classList.remove('notVisible')
                    })

                    th.classList.add('selectedEx')

                }else{

                    angleRight.classList.remove('notVisible')
                    angleLeft.classList.add('notVisible')

                    stepsData.forEach(element => {
                        element.classList.add('notVisible')
                    })

                    th.classList.remove('selectedEx')
                }
            }else{

                stepsData.forEach(element => {
                    element.classList.add('notVisible')
                })

                th.classList.remove('selectedEx')

                divObs.classList.add('notVisible')

                divExDetails.classList.add('notVisible')

                angleRight.classList.remove('notVisible')
                
                angleLeft.classList.add('notVisible')
            }
    }

}

