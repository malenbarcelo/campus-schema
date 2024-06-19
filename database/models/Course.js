module.exports = (sequelize, DataTypes) => {

   const alias = "Courses"
   const cols = {
   id:{
      type : DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement : true,
      allowNull: false
   },
   course_name:{
      type: DataTypes.STRING,
      allowNull: false,
   },
   course_description:{
      type: DataTypes.STRING,
      allowNull: true,
   },
   course_number:{
      type: DataTypes.INTEGER,
      allowNull: false,
   },
   id_companies:{
   type: DataTypes.INTEGER,
   allowNull: false,
   },
   enabled:{
      type: DataTypes.INTEGER,
      allowNull: true,
   }
   }
   const config = {
   tableName : 'courses',
   timestamps : false
   }
   const Course = sequelize.define(alias, cols, config)

   Course.associate = (models) => {
      Course.belongsTo(models.Companies,{
          as:'course_company',
          foreignKey: 'id_companies'
      }),
      Course.belongsToMany(models.Simulators,{
         as:'course_simulator',
         through:'courses_simulators',
         foreignKey: 'id_courses',
         otherKey: 'id_simulators',
         timestamps:false
     })

   }
   return Course
}