// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  // return sequelize.define('trailerexp_history', {
    const trailerexp_history = sequelize.define('trailerexp_history', {
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
    trailername: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    trailer_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    mail_content: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    to_mail: {
      type: DataTypes.STRING(255),
      allowNull: true
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
    tableName: 'trailerexp_history',
    timestamps: false
  });
  sequelizePaginate.paginate(trailerexp_history);
  return trailerexp_history;
};
