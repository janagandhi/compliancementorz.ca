// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  // return sequelize.define('company', {
    const company = sequelize.define('company', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    username: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    management_name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    phone: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    safety_coordinator: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    safety_coordinator_phone: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cvor: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cvor_expiry: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    mc_number: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    mc_pin: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    usdot: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fmcsa: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ky: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    nm: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ny: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fein: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ezee: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ifta: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    business_identificaton: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    mvid: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    sunpass: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    pre_pass: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    best_pass: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    scac: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    carrier_code: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    irp_accountno: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    irp_renewal: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    svi_number: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    insurance_company: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    broker_detail: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    policy_number: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    exp_date: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    drug_alcohol: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    psp_account: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ctpat: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ctpat_password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    smartway: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    pip: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    us_canadian_bond: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    wsib_account: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    eld_username: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    eld_password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fuel_company_name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fuel_company_username: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fuel_company_password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ace_username: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ace_password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    hazmat: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    hazmat_exp: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    dashcam_username: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    dashcam_password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    trailer_trackers: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    trailer_password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    attention: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    street: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cityStateZip: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fax: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    active: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    updated_on: {
      type: DataTypes.TEXT,
      allowNull: false
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
