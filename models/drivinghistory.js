// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  const Drivinghistory = sequelize.define('drivinghistory', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    driverId: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    company_id: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    accidents: {
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
    },
    traficConvintions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    traficConvintionsDate: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    traficConvintionsCharge: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    traficConvintionsLocation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    traficConvintionsPenalty: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    deniedLicense: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    licensePermit: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    drivingExperience: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    classofEquipment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    equipmentType: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    equipmentStartDate: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    equipmentEndDate: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    aprox: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    listProvinces: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    listCourses: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    education: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    signature: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    updatedDate: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    approveStatus: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'drivinghistory',
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
  Drivinghistory.associate = (models) => {
    Drivinghistory.belongsTo(models.driver, {
      as : "d",
      foreignKey : "driverID",
      targetKey : "id"
    })
  }
  sequelizePaginate.paginate(Drivinghistory);
  return Drivinghistory;
};
