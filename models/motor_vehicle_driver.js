// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  const motor_vehicle_driver_certificate = sequelize.define('motor_vehicle_driver_certificate', {
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
    date1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    offence1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    vehicle1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    offence2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    vehicle2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date3: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    offence3: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location3: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    vehicle3: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date4: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    offence4: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location4: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date_certificate: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    signature: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'motor_vehicle_driver',
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
  motor_vehicle_driver_certificate.associate = (models) => {
    motor_vehicle_driver_certificate.belongsTo(models.driver, {
      as : "d",
      foreignKey : "driverId",
      targetKey : "id"
    })
  }
  sequelizePaginate.paginate(motor_vehicle_driver_certificate);
  return motor_vehicle_driver_certificate;
};
