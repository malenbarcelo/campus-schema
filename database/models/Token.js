module.exports = (sequelize, DataTypes) => {

   const alias = "Tokens"
   const cols = {
   id:{
      type : DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement : true,
      allowNull: false
   },
   token:{
      type: DataTypes.STRING,
      allowNull: false,
   },
   id_companies:{
      type: DataTypes.INTEGER,
      allowNull: false,
      },
   id_user_categories:{
   type: DataTypes.INTEGER,
   allowNull: false,
   },
   id_users:{
      type: DataTypes.INTEGER,
      allowNull: true,
   }
   }
   const config = {
   tableName : 'tokens',
   timestamps : false
   }
   const Token = sequelize.define(alias, cols, config)

   Token.associate = (models) => {
      Token.belongsTo(models.Companies,{
          as:'token_company',
          foreignKey: 'id_companies'
      })
      Token.belongsTo(models.User_categories,{
         as:'token_user_category',
         foreignKey: 'id_user_categories'
      })
      Token.belongsTo(models.Users,{
         as:'token_user',
         foreignKey: 'id_users'
      })
  }
   return Token
}