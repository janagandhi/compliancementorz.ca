// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  // return sequelize.define('driverexp_history', {
    const exphis = sequelize.define('company', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    driver_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    driver_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    companyname: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    company_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    mail_content: {
      type: DataTypes.STRING(255),
      allowNull: true
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
      allowNull: true
    },
    expiry_date: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    exprange: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    created_date: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'driverexp_history',
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
  sequelizePaginate.paginate(exphis);
  return exphis;
};
