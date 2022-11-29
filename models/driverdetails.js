// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  const driverdetails = sequelize.define('driverdetails', {
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
    firstName: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    middleName: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lastName: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DOA: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    companyAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    companyCity: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    companyState: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    companyCountry: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    companyProvince: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    eventsCalCountry: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    eventsCalTimezone: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    companyPostalCode: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    position: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sin: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DriverAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DriverState: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DriverCity: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DriverCountry: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DriverProvince: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DriverPostalCode: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    belowThree: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DriverAddress1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DriverState1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DriverCity1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DriverCountry1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DriverProvince1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DriverPostalCode1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    phoneCanada: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    phoneUSA: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    emegencyName: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    emegencyContact: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DOB: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    age: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    legalRight: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    legalRightAtachment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    legalRightUSA: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    legalRightUSAAtachment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    legalRightyesno: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    FMCSA: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    referred: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    referredBy: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    bonded: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    convicted: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fastCard: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fastCardExpiry: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fastCardAttachment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fastCardneed: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fastCardyesno: {
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
    },
  }, {
    sequelize,
    tableName: 'driverdetails',
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
  sequelizePaginate.paginate(driverdetails);
  return driverdetails;
};
