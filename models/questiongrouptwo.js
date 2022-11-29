// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  const questiongrouptwo = sequelize.define('questiongrouptwo', {
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
      allowNull: false
    },
    question14: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    question15: {
      type: DataTypes.TEXT,
      allowNull: false
    },
	question16: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    question17: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    question18: {
      type: DataTypes.TEXT,
      allowNull: false
    },
	question19: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    question20: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    question21: {
      type: DataTypes.TEXT,
      allowNull: false
    },
	question22: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    question23: {
      type: DataTypes.TEXT,
      allowNull: false
    },
	question24: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    question25: {
      type: DataTypes.TEXT,
      allowNull: false
    },
	question26: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    question27: {
      type: DataTypes.TEXT,
      allowNull: false
    },
	question28: {
      type: DataTypes.TEXT,
      allowNull: false
    },
	question29: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    question30: {
      type: DataTypes.TEXT,
      allowNull: false
    },
	question31: {
      type: DataTypes.TEXT,
      allowNull: false
    },
	question32: {
      type: DataTypes.TEXT,
      allowNull: false
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
    tableName: 'questiongrouptwo',
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
  questiongrouptwo.associate = (models) => {
    questiongrouptwo.belongsTo(models.driver, {
      as : "d",
      foreignKey : "driverID",
      targetKey : "id"
    })
  }
  sequelizePaginate.paginate(questiongrouptwo);
  return questiongrouptwo;
};
