// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  const drivinghistoryaccident = sequelize.define('drivinghistoryaccident', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    company_id: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    driverId: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    accidentsDate: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    accidentsNature: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    accidentsFatalities: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    accidentsInjuries: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    accidentsHazardous: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'drivinghistoryaccident',
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
  sequelizePaginate.paginate(drivinghistoryaccident);
  return drivinghistoryaccident
};
