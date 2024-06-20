function getElements() {
    
    //users.ejs
    const userLoggedCategory = document.getElementById('userLoggedCategory')
    const selectCompany = document.getElementById('selectCompany')
    const companyName = document.getElementById('companyName')
    const filterName = document.getElementById('filterName')
    const filterEmail = document.getElementById('filterEmail')
    const filterDni = document.getElementById('filterDni')
    const filterCategory = document.getElementById('filterCategory')
    const filterDate = document.getElementById('filterDate')
    const unfilterUsers = document.getElementById('unfilterUsers')
    const bodyUsers = document.getElementById('bodyUsers')
    const thIcon1 = document.getElementById('thIcon1')
    const thIcon2 = document.getElementById('thIcon2')
    const thIcon3 = document.getElementById('thIcon3')    
    const selectAll = document.getElementById('selectAll')    
    const loader = document.getElementById('loader')
    const DGAblockUsers = document.getElementById('DGAblockUsers')
    const DGAassignCommissions = document.getElementById('DGAassignCommissions')
    const DGArestorePasswords = document.getElementById('DGArestorePasswords')
    const DGAcreateUsers = document.getElementById('DGAcreateUsers')    
    
    //popups
    const blockPopup = document.getElementById('blockPopup')
    const restorePopup = document.getElementById('restorePopup')
    const assignPopup = document.getElementById('assignPopup')
    const editPopup = document.getElementById('editPopup')
    const confirmEditionPopup = document.getElementById('confirmEditionPopup')
    const okEditPopup = document.getElementById('okEditPopup')
    const createPopup = document.getElementById('createPopup')
    const okCreatePopup = document.getElementById('okEditPopup')    

    //close and cancel popups
    const blockPopupClose = document.getElementById('blockPopupClose')
    const blockPopupCancel = document.getElementById('blockPopupCancel')    
    const restorePopupClose = document.getElementById('restorePopupClose')
    const restorePopupCancel = document.getElementById('restorePopupCancel')
    const assignPopupClose = document.getElementById('assignPopupClose')
    const assignPopupCancel = document.getElementById('assignPopupCancel')
    const editPopupClose = document.getElementById('editPopupClose')
    const editPopupCancel = document.getElementById('editPopupCancel')
    const confirmEditionPopupClose = document.getElementById('confirmEditionPopupClose')
    const confirmEditionPopupCancel = document.getElementById('confirmEditionPopupCancel')
    const createPopupClose = document.getElementById('createPopupClose')
    const createPopupCancel = document.getElementById('createPopupCancel')    
    
    //popup elements
    const blockUsersQuestion = document.getElementById('blockUsersQuestion')
    const userToBlock = document.getElementById('userToBlock')
    const blockPopupAccept = document.getElementById('blockPopupAccept')
    const okBlockPopup = document.getElementById('okBlockPopup')
    const restoreQuestion = document.getElementById('restoreQuestion')
    const userToRestore = document.getElementById('userToRestore')
    const restorePopupAccept = document.getElementById('restorePopupAccept')
    const okRestorePopup = document.getElementById('okRestorePopup')
    const selectCourseAssign = document.getElementById('selectCourseAssign')
    const selectCommissionAssign = document.getElementById('selectCommissionAssign')
    const assignPopupAccept = document.getElementById('assignPopupAccept')
    const assignFrom = document.getElementById('assignFrom')
    const selectCommissionError = document.getElementById('selectCommissionError')
    const selectCommissionErrorText = document.getElementById('selectCommissionErrorText')
    const okAssignPopup = document.getElementById('okAssignPopup')
    const userId = document.getElementById('userId')
    const userFirstName = document.getElementById('userFirstName')
    const userLastName = document.getElementById('userLastName')
    const userDNI = document.getElementById('userDNI')
    const userEmail = document.getElementById('userEmail')
    const userCategory = document.getElementById('userEmail')
    const userCommissions = document.getElementById('userCommissions')
    const noCommissions = document.getElementById('noCommissions')
    const yesCommissions = document.getElementById('yesCommissions')
    const DGAblockFromEdit = document.getElementById('DGAblockFromEdit')
    const editPopupAccept = document.getElementById('editPopupAccept')
    const editUserDataError = document.getElementById('editUserDataError')
    const confirmEditionPopupAccept = document.getElementById('confirmEditionPopupAccept')
    const DGAassignCommission = document.getElementById('DGAassignCommission')

    //create user popup
    const createUserCategory = document.getElementById('createUserCategory')
    const createUserLastName = document.getElementById('createUserLastName')
    const createUserFirstName = document.getElementById('createUserFirstName')
    const createUserEmail = document.getElementById('createUserEmail')
    const createUserDNI = document.getElementById('createUserDNI')
    const createUserIcon = document.getElementById('createUserIcon')
    const createUsersQty = document.getElementById('createUsersQty')
    const createError = document.getElementById('createError')
    const createErrorText = document.getElementById('createErrorText')
    const createError2 = document.getElementById('createError2')
    const createErrorText2 = document.getElementById('createErrorText2')
    const createCommissionData = document.getElementById('createCommissionData')
    const cuppTitleIcon = document.getElementById('cudppTitleIcon')
    const uploadExcelPopupAccept = document.getElementById('uploadExcelPopupAccept')
    const uploadExcel = document.getElementById('uploadExcel')
    const uploadExcelInput = document.getElementById('uploadExcelInput')
    const uploadExcelPopupCancel = document.getElementById('uploadExcelPopupCancel')
    const excelError = document.getElementById('excelError')
    const downloadTemplate = document.getElementById('downloadTemplate')
    const cuppTitleText = document.getElementById('cuppTitleText')
    const createUserCourse = document.getElementById('createUserCourse')

    //define arrays with elements
    const thIcons = [thIcon1,thIcon2,thIcon3]
    const filters = [selectCompany,filterName,filterEmail,filterDni,filterCategory,filterDate]
    const DGAs = [DGAblockUsers,DGAassignCommissions,DGArestorePasswords]
    const DGAsassignCommissions = [DGAassignCommission,DGAassignCommissions]
    const closeAndCancel = [blockPopupClose,blockPopupCancel,restorePopupClose,restorePopupCancel,assignPopupClose,assignPopupCancel,editPopupClose,editPopupCancel,confirmEditionPopupClose, confirmEditionPopupCancel,createPopupClose,createPopupCancel,uploadExcelPopupCancel]

    return {thIcons,filters,DGAs,closeAndCancel,DGAsassignCommissions}
}


export {getElements}