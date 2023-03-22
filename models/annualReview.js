// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  const annualreview = sequelize.define('annualreview', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    companyid: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    driverid: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    date_review: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    drivermeet: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    signature: {
      type: DataTypes.TEXT,
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'annualreview',
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
  annualreview.associate = (models) => {
    annualreview.belongsTo(models.driver, {
      as : "d",
      foreignKey : "driverid",
      targetKey : "id"
    })
  }
  sequelizePaginate.paginate(annualreview);
  return annualreview;
};
