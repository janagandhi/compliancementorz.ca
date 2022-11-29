// const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = function(sequelize, DataTypes) {
  // return sequelize.define('trailer', {
    const trailer = sequelize.define('trailer', {
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
    trailer_unit: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    vehicle_type: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    vin_number: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    license_plate_number: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    state: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rin: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fuel_card: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ip_pass: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    bridge_transponder: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    annual_safety_current: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    annual_safety_current_attachment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    annual_safety_last: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    annual_safety_last_attachment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    preventive_maintenance: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    preventive_maintenance_attachment: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    updated_on: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    alert_frequency: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    last_edit: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nextyearDate: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'trailer',
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
  sequelizePaginate.paginate(trailer);
  return trailer;
};
