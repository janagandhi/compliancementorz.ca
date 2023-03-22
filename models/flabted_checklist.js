// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  const flatbed_checklist = sequelize.define('flatbed_checklist', {
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
    online1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    online2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    online3: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    online4: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    online5: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    practical1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    practical2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    practical3: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    practical4: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    practical5: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    practical6: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    practical7: {
      type: DataTypes.TEXT,
      allowNull: true
    },
	practical8: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    practical9: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    practical10: {
      type: DataTypes.TEXT,
      allowNull: true
    },
	practical11: {
      type: DataTypes.TEXT,
      allowNull: true
    },
	practical12: {
      type: DataTypes.TEXT,
      allowNull: true
    },
	start_date: {
      type: DataTypes.TEXT,
      allowNull: true
    },
	end_date: {
      type: DataTypes.TEXT,
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'flatbed_checklist',
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
   flatbed_checklist.associate = (models) => {
    flatbed_checklist.belongsTo(models.driver, {
      as : "d",
      foreignKey : "driverID",
      targetKey : "id"
    })
  }
  sequelizePaginate.paginate(flatbed_checklist);
  return flatbed_checklist;
};
