// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  const safetyLaws = sequelize.define('safetyLaws', {
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
    question1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question3: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question4: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question5: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question6: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question7: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question8: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question9: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question10: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question11: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question12: {
      type: DataTypes.TEXT,
      allowNull: true
    },
	question13: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question14: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question15: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question16: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question17: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question18: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question19: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question20: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question21: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question22: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question23: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question24: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question25: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    signature: {
      type: DataTypes.TEXT,
      allowNull: true
    },
	rightorwrong: {
      type: DataTypes.TEXT,
      allowNull: true
    },
	result: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    create_date: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    updated_on: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    approveStatus: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'safetylaws',
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
  safetyLaws.associate = (models) => {
    safetyLaws.belongsTo(models.driver, {
      as : "d",
      foreignKey : "driverID",
      targetKey : "id"
    })
  }
  sequelizePaginate.paginate(safetyLaws);
  return safetyLaws;
};
