// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  // return sequelize.define('company', {
    const company = sequelize.define('company', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    username: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    management_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    phone: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    safety_coordinator: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    safety_coordinator_phone: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cvor: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cvor_expiry: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    mc_number: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    mc_pin: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    usdot: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fmcsa: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ky: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nm: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ny: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fein: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ezee: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ifta: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    business_identificaton: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    mvid: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sunpass: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pre_pass: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    best_pass: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    scac: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    carrier_code: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    irp_accountno: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    irp_renewal: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    svi_number: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    insurance_company: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    broker_detail: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    policy_number: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    exp_date: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    drug_alcohol: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    psp_account: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ctpat: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ctpat_password: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    smartway: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pip: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    us_canadian_bond: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    wsib_account: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    eld_username: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    eld_password: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fuel_company_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fuel_company_username: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fuel_company_password: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ace_username: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ace_password: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    hazmat: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    hazmat_exp: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dashcam_username: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dashcam_password: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    trailer_trackers: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    trailer_password: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    attention: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    street: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cityStateZip: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fax: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    updated_on: {
      type: DataTypes.TEXT,
      allowNull: true
    }, alert_frequency: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    alert: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'company',
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
  sequelizePaginate.paginate(company);
  return company;
};
