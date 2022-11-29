// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  const employmenthistory = sequelize.define('employmenthistory', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    driverId: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    company_id: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employerName: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employerDate: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employerAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employerPosition: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employerContactPerson: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employerContactPersonNumber: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employerContactPersonEmail: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fmcrs: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "'No'"
    },
    jobDesignated: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "'No'"
    },
    updatedDate: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    approveStatus: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "'0'",
      comment: "0- unapproved. 1 approved"
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'employmenthistory',
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
  employmenthistory.associate = (models) => {
    employmenthistory.belongsTo(models.driver, {
      as : "d",
      foreignKey : "driverID",
      targetKey : "id"
    })
  }
  sequelizePaginate.paginate(employmenthistory);
  return employmenthistory
};
