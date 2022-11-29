// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  const certificateauth = sequelize.define('certificateauth', {
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
    certificateID: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    approve: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    signature: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    adminSignature: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    certificateIDSixFirtstPrams: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    certificateIDSixSecondPrams: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'certificateauth',
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
  sequelizePaginate.paginate(certificateauth);
  return certificateauth;
};
