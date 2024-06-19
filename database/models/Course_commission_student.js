module.exports = (sequelize, DataTypes) => {

   const alias = "Course_commissions_students"
   const cols = {
   id:{
      type : DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement : true,
      allowNull: false
   },
   id_course_commissions:{
      type: DataTypes.INTEGER,
      allowNull: false,
   },
   id_students:{
      type: DataTypes.INTEGER,
      allowNull: false,
   }
}   
   const config = {
   tableName : 'course_commissions_students',
   timestamps : false
   }
   const Course_commission_student = sequelize.define(alias, cols, config)

   Course_commission_student.associate = (models) => {
      Course_commission_student.belongsTo(models.Users,{
          as:'commission_user',
          foreignKey: 'id_students'
      }),
      Course_commission_student.belongsTo(models.Course_commissions,{
         as:'commission_data',
         foreignKey: 'id_course_commissions'
     })
      
   }
   
   return Course_commission_student
}