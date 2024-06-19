module.exports = (sequelize, DataTypes) => {

   const alias = "Course_commissions_teachers"
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
   id_teachers:{
      type: DataTypes.INTEGER,
      allowNull: false,
   }
}   
   const config = {
   tableName : 'course_commissions_teachers',
   timestamps : false
   }
   const Course_commission_teacher = sequelize.define(alias, cols, config)

   Course_commission_teacher.associate = (models) => {
      Course_commission_teacher.belongsTo(models.Users,{
          as:'commission_user',
          foreignKey: 'id_teachers'
      }),
      Course_commission_teacher.belongsTo(models.Course_commissions,{
         as:'commission_data',
         foreignKey: 'id_course_commissions'
     })
      
   }
   
   return Course_commission_teacher
}