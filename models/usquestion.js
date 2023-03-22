// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  const usquestion = sequelize.define('usquestion', {
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
	rightorwrong: {
      type: DataTypes.TEXT,
      allowNull: true
    },
	result: {
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
    tableName: 'usquestion',
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
  usquestion.associate = (models) => {
    usquestion.belongsTo(models.driver, {
      as : "d",
      foreignKey : "driverID",
      targetKey : "id"
    })
  }
  sequelizePaginate.paginate(usquestion);
  return usquestion;
};
