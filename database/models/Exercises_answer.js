module.exports = (sequelize, DataTypes) => {

   const alias = "Exercises_answers"
   const cols = {
      id:{
         type : DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement : true,
         allowNull: false
      },
      id_exercises_results:{
         type: DataTypes.INTEGER,
         allowNull: false,
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
      description:{
         type: DataTypes.STRING,
         allowNull: false,
      },
      log_time:{
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      type:{
         type: DataTypes.STRING,
         allowNull: false,
      },
      observations:{
         type: DataTypes.STRING,
         allowNull: true,
      },
   }
   const config = {
   tableName : 'exercises_answers',
   timestamps : false
   }
   const Exercises_answer = sequelize.define(alias, cols, config)

   Exercises_answer.associate = (models) => {
      Exercises_answer.belongsTo(models.Exercises_results,{
          as:'answer_result',
          foreignKey: 'id_exercises_results'
      })
   }
   return Exercises_answer
}