// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  const Drivinghistoryaddress = sequelize.define('drivinghistoryaddress', {
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
      type: DataTypes.INTEGER,
      allowNull: true
    },
    province: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    license: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    attachment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    expiry: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'drivinghistoryaddress',
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
  sequelizePaginate.paginate(Drivinghistoryaddress);
  return Drivinghistoryaddress;
};
