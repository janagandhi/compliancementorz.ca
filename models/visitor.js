// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  const visitor = sequelize.define('visitor', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    date: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    visitor_name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    visitor_company: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    time_in: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    time_out: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    purpose_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    phone: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    remarks:{
      type: DataTypes.TEXT,
      allowNull: true
    },
    email_id: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    device_id: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    signature: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'visitor',
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
  visitor.associate = (models) => {
    visitor.belongsTo(models.purpose, {
      as : "purpose",
      atrtributes:"name,id",
      foreignKey : "purpose_id",
      targetKey : "id"
    })
  }
  sequelizePaginate.paginate(visitor);
  return visitor;
};
