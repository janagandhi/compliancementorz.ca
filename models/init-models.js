var DataTypes = require("sequelize").DataTypes;
var _questiongroupone = require("./questiongroupone");

function initModels(sequelize) {
  var questiongroupone = _questiongroupone(sequelize, DataTypes);


  return {
    questiongroupone,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
