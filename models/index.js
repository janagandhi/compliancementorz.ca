const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);

const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
  
db.admin = require("./admin.js")(sequelize, Sequelize);
db.company = require("./company.js")(sequelize, Sequelize);
db.driver = require("./driver.js")(sequelize, Sequelize);
db.trailer = require("./trailer.js")(sequelize, Sequelize);
db.truck = require("./truck.js")(sequelize, Sequelize);
db.loginaudit = require("./loginaudit.js")(sequelize, Sequelize);
db.driverexp_history = require("./driverexp_history.js")(sequelize, Sequelize);
db.truckexp_history = require("./truckexp_history.js")(sequelize, Sequelize);
db.trailerexp_history = require("./trailerexp_history.js")(sequelize, Sequelize);
db.driverdetails = require("./driverdetails.js")(sequelize, Sequelize);
db.driveraddress = require("./driveraddress.js")(sequelize, Sequelize);
db.employmenthistory = require("./employmenthistory.js")(sequelize, Sequelize);
db.employementhistroyaddress = require("./employementhistroyaddress.js")(sequelize, Sequelize);
db.drivinghistory = require("./drivinghistory.js")(sequelize, Sequelize);
db.drivinghistoryaddress = require("./drivinghistoryaddress.js")(sequelize, Sequelize);
db.certificateauth = require("./certificateauth.js")(sequelize, Sequelize);
db.drivinghistoryaccident = require("./drivinghistoryaccident.js")(sequelize, Sequelize);
db.drivinghistoryviolations = require("./drivinghistoryviolations.js")(sequelize, Sequelize);
db.fileupload = require("./fileupload.js")(sequelize, Sequelize);
db.feedback = require("./feedback.js")(sequelize, Sequelize);
db.hos = require("./hos.js")(sequelize, Sequelize);
db.questiongroupone = require("./questiongroupone.js")(sequelize, Sequelize);
db.questiongrouptwo = require("./questiongrouptwo.js")(sequelize, Sequelize);
db.reference = require("./reference.js")(sequelize, Sequelize);
db.canadahos = require("./canadahos.js")(sequelize, Sequelize);
db.usquestion = require("./usquestion.js")(sequelize, Sequelize);
db.weightDimensions = require("./weightDimensions.js")(sequelize, Sequelize);
db.flabted_checklist = require("./flabted_checklist.js")(sequelize, Sequelize);
db.companychecklist = require("./companychecklist.js")(sequelize, Sequelize);
db.companyquiz = require("./companyquiz.js")(sequelize, Sequelize);
db.disclaimer = require("./disclaimer.js")(sequelize, Sequelize);
db.driverCompany = require("./driverCompany.js")(sequelize, Sequelize);
db.visitor = require("./visitor.js")(sequelize, Sequelize);
db.purpose = require("./purpose.js")(sequelize, Sequelize);
db.safetyLaws = require("./safetyLaws.js")(sequelize, Sequelize);
db.motorVehicleDriverCertificate = require("./motor_vehicle_driver.js")(sequelize, Sequelize);
db.annualreview = require("./annualReview.js")(sequelize, Sequelize);

// fs
  // .readdirSync(__dirname)
  // .filter(file => {
  //   return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  // })
  // .forEach(file => {
  //   const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
  //   db[model.name] = model;
  // });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});


module.exports = db;
