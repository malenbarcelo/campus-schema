module.exports = (sequelize, DataTypes) => {

   const alias = "Course_commissions"
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
   start_date:{
      type: DataTypes.DATE,
      allowNull: false,
   },
   end_date:{
      type: DataTypes.DATE,
      allowNull: false,
   },
   commission:{
   type: DataTypes.STRING,
   allowNull: false,
   },
   enabled:{
      type: DataTypes.INTEGER,
      allowNull: true,
   }
   }
   const config = {
   tableName : 'course_commissions',
   timestamps : false
   }
   const Course_commission = sequelize.define(alias, cols, config)

   Course_commission.associate = (models) => {
      Course_commission.belongsTo(models.Courses,{
          as:'course_commission_course',
          foreignKey: 'id_courses'
      }),
      Course_commission.hasMany(models.Course_commissions_teachers,{
         as:'teachers_data',
         foreignKey: 'id_course_commissions',
         
     })
      Course_commission.hasMany(models.Course_commissions_students,{
         as:'course_commission_student',
         foreignKey: 'id_course_commissions'
     })

   }

   return Course_commission
}