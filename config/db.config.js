module.exports = {
  HOST: "localhost",
  USER: "complia6_company_info",
  PASSWORD: "company_info",
  DB: "complia6_company_info",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
