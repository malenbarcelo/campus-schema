const username = "schemasim_adm"
const password = "schemasimadm"
const database = "schemasim_db"

// const username = "schemasim_adm"
// const password = "schemasimadm"
// const database = "schemasim_db"

module.exports=
{
  "development": {
    "username": username,
    "password": password,
    "database": database,
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": username,
    "password": password,
    "database": database,
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": username,
    "password": password,
    "database": database,
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
