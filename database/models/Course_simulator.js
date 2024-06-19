module.exports = (sequelize, DataTypes) => {

   const alias = "Courses_simulators"
   const cols = {
   id:{
      type : DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement : true,
      allowNull: false
   },
   id_courses:{
      type: DataTypes.INTEGER,
      allowNull: false,
   },
   id_simulators:{
      type: DataTypes.INTEGER,
      allowNull: false,
   }
}   
   const config = {
   tableName : 'courses_simulators',
   timestamps : false
   }
   const Course_simulator = sequelize.define(alias, cols, config)

   Course_simulator.associate = (models) => {
      Course_simulator.belongsTo(models.Simulators,{
          as:'course_simulator',
          foreignKey: 'id_simulators'
      })
   }

   return Course_simulator
}