module.exports = (sequelize, DataTypes) => {

   const alias = "Exercises"
   const cols = {
      id:{
         type : DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement : true,
         allowNull: false
      },
      exercise_name:{
         type: DataTypes.STRING,
         allowNull: false,
      },
      exercise_description:{
         type: DataTypes.STRING,
         allowNull: false,
      },
      id_simulators:{
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      enabled:{
         type: DataTypes.INTEGER,
         allowNull: false,
      }
   }
   const config = {
   tableName : 'exercises',
   timestamps : false
   }
   const Exercise = sequelize.define(alias, cols, config)

   Exercise.associate = (models) => {
      Exercise.belongsTo(models.Simulators,{
          as:'exercise_simulator',
          foreignKey: 'id_simulators'
      })
   }
   return Exercise
}