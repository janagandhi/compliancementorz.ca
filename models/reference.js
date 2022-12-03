// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  const Reference = sequelize.define('reference', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    },
    formID: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    company_id: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    driverId: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employeeName: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employeeSin: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employeeDOB: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employeein: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employeeCSZ: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employeePhone: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employeeStreet: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employeeFax: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prospectiveEmployerName: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prospectiveEmployerAttention: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prospectiveEmployerPhone: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prospectiveEmployerStreet: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prospectiveEmployerCSZ: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prospectiveEmployerFax: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prospectiveEmployerEmail: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    applicantDate: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employedBy: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    jobDesignation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousfrom: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousto: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    motorVehicleForYou: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    whatType: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    whatTypeOther: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    whatTypeComment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reasonForLeaving: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    completeByCompany: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployerName: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployerEmail: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployerAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployerCSZ: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployerStreet: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployerFax: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployerPhone: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployerDate: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployerAnyInuries: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployertableoneDate: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployertableoneLocation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployertableoneInjuries: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployertableoneFatalities: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployertableoneHazmatSpill: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployertableTwoDate: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployertableTwoLocation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployertableTwoInjuries: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployertableTwoFatalities: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployertableTwoHazmatSpill: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployertableThreeDate: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployertableThreeLocation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployertableThreeInjuries: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployertableThreeFatalities: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previousEmployertableThreeHazmatSpill: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    companyPolicies: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    driverSign: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    companySign: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    RefPreviousEmployerEmail: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ApprovedFromEmail: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_date: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'reference',
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
  // Reference.associate = (models) => {
  //   Reference.belongsTo(models.driver, {
  //     as : "d",
  //     foreignKey : "driverId",
  //     targetKey : "id"
  //   })
  // }
  sequelizePaginate.paginate(Reference);
  return Reference;
};

