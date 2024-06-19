module.exports = (sequelize, DataTypes) => {

   const alias = "Users"
   const cols = {
      id:{
         type : DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement : true,
         allowNull: false
      },
      first_name:{
         type: DataTypes.STRING,
         allowNull: false,
      },
      last_name:{
         type: DataTypes.STRING,
         allowNull: false,
      },
      id_document:{
         type: DataTypes.INTEGER,
         allowNull: true,
      },
      user_email:{
         type: DataTypes.STRING,
         allowNull: false,
      },
      password:{
         type: DataTypes.STRING,
         allowNull: false,
      },
      id_user_categories:{
      type: DataTypes.INTEGER,
      allowNull: false,
      },
      id_companies:{
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      enabled:{
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      register_date:{
         type: DataTypes.DATE,
         allowNull: false,
      },
   }
   const config = {
   tableName : 'users',
   timestamps : false
   }
   const User = sequelize.define(alias, cols, config)

   User.associate = (models) => {
      User.belongsTo(models.Companies,{
          as:'user_company',
          foreignKey: 'id_companies'
      })
      User.belongsTo(models.User_categories,{
         as:'user_user_category',
         foreignKey: 'id_user_categories'
      })
   }
   return User
}