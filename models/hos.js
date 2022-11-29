// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  const hos = sequelize.define('hos', {
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
    dateData: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    durationData: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    selectedDate: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    duration: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    actualDate: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    AdminApprove: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    hosAttachment_attachment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    totalDuration: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.TEXT,
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'hos',
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
  sequelizePaginate.paginate(hos);
  return hos
};
