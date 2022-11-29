const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('loginaudit', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "userid"
    },
    name: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    logindatetime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    ipaddress: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: "cannot find IP"
    }
  }, {
    sequelize,
    tableName: 'loginaudit',
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
};
