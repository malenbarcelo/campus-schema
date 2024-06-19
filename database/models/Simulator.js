module.exports = (sequelize, DataTypes) => {
    const alias = "Simulators"
    const cols = {
      id:{
          type : DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement : true,
          allowNull: false
       },
       simulator_name:{
          type: DataTypes.STRING,
          allowNull: false,
       },
       description:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      enabled:{
       type: DataTypes.INTEGER,
       allowNull: false,
     }
    }
    const config = {
       tableName : 'simulators',
       timestamps : false
    }

    const Simulator = sequelize.define(alias, cols, config)

    Simulator.associate = function(models){
      Simulator.hasMany(models.Exercises, {
      as: "simulator_exercise",
      foreignKey: "id_simulators"
      });
      }

    return Simulator

 }