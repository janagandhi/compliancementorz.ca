const sequelizePaginate = require('sequelize-paginate');
// const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const drivinghistoryviolations = sequelize.define('drivinghistoryviolations', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    company_id: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    driverId: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    traficConvintionsDate: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    traficConvintionsCharge: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    traficConvintionsLocation: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    traficConvintionsPenalty: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'drivinghistoryviolations',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  sequelizePaginate.paginate(drivinghistoryviolations);
  return drivinghistoryviolations
};
