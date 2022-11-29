// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  const fileupload =  sequelize.define('fileupload', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    company_id: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    driverId: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fileName: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fileType: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    updated_on: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'fileupload',
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
  fileupload.associate = (models) => {
    fileupload.belongsTo(models.driver, {
      as : "d",
      foreignKey : "driverID",
      targetKey : "id"
    })
  }
  sequelizePaginate.paginate(fileupload);
  return fileupload
};
