import { dominio } from "./dominio.js"

function dateToString(date) {

    const dateArray = date.split("-")

    // get year, month, day
    const day = dateArray[2]
    const month = dateArray[1]
    const year = dateArray[0]

    //format with 2 digists
    const formattedDay = day.toString().padStart(2, '0')
    const formattedMonth = month.toString().padStart(2, '0')

    //get formatted date
    const dateString = `${formattedDay}/${formattedMonth}/${year}`;

    return dateString
}

function formatDateToString(date) {
    
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`

    return formattedDate
}


function unCheckElements(elementsToUncheck) {
    selectAll.checked = false    
    elementsToUncheck.forEach(element => {
        const select = document.getElementById('select_' + element.id)                                
        select.checked = false
    })
}

export {dateToString,formatDateToString,unCheckElements}