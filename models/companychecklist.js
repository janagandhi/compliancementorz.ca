// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  const companychecklist = sequelize.define('companychecklist', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    flatbed_checklists: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    
    orientation_Checklists: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dry_van_checklists: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    tableName: 'companychecklist',
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
  companychecklist.associate = (models) => {
    companychecklist.belongsTo(models.company, {
      as : "d",
      foreignKey : "company_id",
      targetKey : "id"
    })
  }
  sequelizePaginate.paginate(companychecklist);
  return companychecklist;
};
