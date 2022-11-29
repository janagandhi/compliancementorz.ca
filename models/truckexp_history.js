// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  // return sequelize.define('truckexp_history', {
    const truckexp_history = sequelize.define('truckexp_history', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    driver_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    driver_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    companyname: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    company_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    truckname: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    truck_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    mail_content: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    to_mail: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    cc_email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    expiry_date: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    created_date: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'truckexp_history',
    timestamps: false
  });
  sequelizePaginate.paginate(truckexp_history);
  return truckexp_history;
};
