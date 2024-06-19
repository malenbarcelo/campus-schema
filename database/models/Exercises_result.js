module.exports = (sequelize, DataTypes) => {

   const alias = "Exercises_results"
   const cols = {
      id:{
         type : DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement : true,
         allowNull: false
      },
      id_exercises:{
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      id_users:{
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      id_simulators:{
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      date:{
         type: DataTypes.STRING,
         allowNull: false,
      },
      grade:{
         type: DataTypes.FLOAT,
         allowNull: false,
      },
      duration_secs:{
         type: DataTypes.INTEGER,
         allowNull: false,
      }
   }
   const config = {
   tableName : 'exercises_results',
   timestamps : false
   }
   const Exercises_result = sequelize.define(alias, cols, config)

   Exercises_result.associate = (models) => {
      Exercises_result.belongsTo(models.Exercises,{
          as:'exercise_result_exercise',
          foreignKey: 'id_exercises'
      }),
      Exercises_result.belongsTo(models.Users,{
         as:'exercise_result_user',
         foreignKey: 'id_users'
     })
     
   }
   return Exercises_result
}