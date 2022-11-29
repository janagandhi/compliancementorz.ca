// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  const employementhistroyaddress = sequelize.define('employementhistroyaddress', {
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
    employerName: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employerDate: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employerAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employerPosition: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employerContactPerson: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employerContactPersonNumber: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employerContactPersonEmail: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fmcrs: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "'No'"
    },
    jobDesignated: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "'No'"
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    state: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    country: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    province: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    postalCode: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fromDate: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    toDate: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'employementhistroyaddress',
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
  sequelizePaginate.paginate(employementhistroyaddress);
  return employementhistroyaddress
};
