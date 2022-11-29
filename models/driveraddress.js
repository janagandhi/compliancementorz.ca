const sequelizePaginate = require('sequelize-paginate');
// const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const driveraddress = sequelize.define('driveraddress', {
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
    driverAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    driverState: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    driverCity: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    driverCountry: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    driverProvince: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    driverPostalCode: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    driverFromDate: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    driverToDate: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'driveraddress',
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
  sequelizePaginate.paginate(driveraddress);
  return driveraddress;
};
