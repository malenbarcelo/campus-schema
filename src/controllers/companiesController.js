const {findCompanies} = require('./dbQueries/companiesQueries.js')
const usersQueries = require('./dbQueries/usersQueries.js')
const tokensQueries = require('./dbQueries/tokensQueries.js')

const companiesController = {
    viewCompanies: async(req,res) => {
        try{

            const templateTitle = 'Detalle de instituciones'
            const sheetTtitle = 'Instituciones'
            const dinamicView = 'companies'

            const companies = await findCompanies()

            //add users to companies
            let companiesData = await Promise.all(companies.map(async (company) => {

                const companyUsers = await usersQueries.companyUsers(company.id)
                const tokensToAssign = await tokensQueries.companyTokensToAssign(company.id)

                company.administrators = companyUsers.filter(user => user.id_user_categories == 2)
                company.teachers = companyUsers.filter(user => user.id_user_categories == 3)
                company.students = companyUsers.filter(user => user.id_user_categories == 4)
                company.tokensToAssign = tokensToAssign.length

                return company
            }))

            return res.render('dataTemplate',{
                title:sheetTtitle,
                templateTitle,
                companies,
                dinamicView
            })

        }catch(error){
            console.log(error)
            return res.send("Ha ocurrido un error")
        }
    },
}

module.exports = companiesController