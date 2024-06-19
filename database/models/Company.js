module.exports = (sequelize, DataTypes) => {
    const alias = "Companies"
    const cols = {
        id:{
          type : DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement : true,
          allowNull: false
       },
       company_name:{
          type: DataTypes.STRING,
          allowNull: false,
       },
       enabled:{
         type: DataTypes.INTEGER,
         allowNull: false,
      },

    }
    const config = {
       tableName : 'companies',
       timestamps : false
    }

    const Company = sequelize.define(alias, cols, config)

    Company.associate = (models) => {
      Company.hasMany(models.Users, {
          as: 'company_users',
          foreignKey: 'id_companies'
      })
   }

    return Company

 }