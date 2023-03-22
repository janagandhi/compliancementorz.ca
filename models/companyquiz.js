// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  const companyquiz = sequelize.define('companyquiz', {
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
    weightdimensions: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    
    safetylawsquiz: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    tableName: 'companyquiz',
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
  companyquiz.associate = (models) => {
    companyquiz.belongsTo(models.company, {
      as : "d",
      foreignKey : "company_id",
      targetKey : "id"
    })
  }
  sequelizePaginate.paginate(companyquiz);
  return companyquiz;
};
