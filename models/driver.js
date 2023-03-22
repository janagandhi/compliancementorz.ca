// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  // return sequelize.define('driver', {
    const driver = sequelize.define('driver', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    driver_id: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    driver_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    driver_lastName: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    driver_license: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    mobile: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    alternativeEmail: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    phone_can: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    phone_usa: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    application_date: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    hire_date: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    inactive_date: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    canada_only: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    usa_only: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    driver_type: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    owner_operator_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    incorporation_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    hst: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    direct_deposit_details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    license_attachment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    license_expiry: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    province: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    country: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sin: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    medical_due_date: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fast_card_number: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fast_cart_expiry: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    passport: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nationality: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    passport_expiry: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    passport_attachment: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fast_card_attachment: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    work_permit: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    work_permit_expiry: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cvor: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cvor_abstract_attachment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    abstract_date: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cvor_abstract_date: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    psp_attachment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    psp_date: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    police_clearance_attachment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    police_clearance_date: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    roadtest_attachment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    roadtest_date: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    annual_review_attachment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    annual_review_date: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    training_document_attachment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    o_aggrement: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    wsib: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fuel_card: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    seals: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    blue_water: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    communication: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    message_details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Disclaimer_type: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Disclaimer_type: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    annualreview: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    updated_on: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    alert_frequency: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    last_edit: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'driver',
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
  driver.associate = (models) => {
    driver.belongsTo(models.reference, {
      as : "r",
      foreignKey : "id",
      targetKey : "driverId"
    })
  }
  sequelizePaginate.paginate(driver);
  return driver;
};
