const path = require('path');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const app = express();
const router = express.Router();
const session = require('express-session'); 
const fs = require('fs');
const mime = require('mime');
const ObjectsToCsv = require('objects-to-csv')
const json2csv = require('json2csv').parse;
const microServices = require("../services/index");
const db = require("../models");

//const createCsvWriter = require('csv-writer').createObjectCsvWriter;
//const moment = require('moment');

const { nextTick, getMaxListeners } = require('process');
// var pdf = require('html-pdf');
// var pdfMake = require("pdfmake/build/pdfmake");
// var pdfFonts = require("pdfmake/build/vfs_fonts");
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
// var fs = require('fs');
// var jsdom = require("jsdom");
// var { JSDOM } = jsdom;
// var { window } = new JSDOM("");
// var htmlToPdfMake = require("html-to-pdfmake");
// const HTMLToPDF = require('html-to-pdf');
// var pdfMake = require("pdfmake/build/pdfmake");
// var pdfFonts = require("pdfmake/build/vfs_fonts");
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
const Users = db.users;
const Loginaudit = db.loginaudit;
const Company = db.company;
const Driver = db.driver;
const DriverCompany = db.driverCompany;
const Truck = db.truck;
const Trailer = db.trailer;
const driverexp_history = db.driverexp_history;
const truckexp_history = db.truckexp_history;
const trailerexp_history = db.trailerexp_history;
const Driverdetails = db.driverdetails;
const Driveraddress = db.driveraddress;
const Employmenthistory = db.employmenthistory;
const Employementhistroyaddress = db.employementhistroyaddress;
const Drivinghistory = db.drivinghistory;
const Drivinghistoryaddress = db.drivinghistoryaddress;
const Drivinghistoryaccident = db.drivinghistoryaccident;
const Drivinghistoryviolations = db.drivinghistoryviolations;
const Certificateauth = db.certificateauth;
const Questiongroupone = db.questiongroupone;
const Questiongrouptwo = db.questiongrouptwo;
const Canadahos = db.canadahos;
const Usquestion = db.usquestion;
const Companychecklist = db.companychecklist;
const Flabted_checklist = db.flabted_checklist;
const Companyquiz = db.companyquiz;
const Disclaimer = db.disclaimer;
const weightDimensions = db.weightDimensions;
const safetyLaws = db.safetyLaws;

const motorVehicleDriverCertificate = db.motorVehicleDriverCertificate;
const annualreview = db.annualreview;

const Reference = db.reference;
const Hos = db.hos;
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;
const getMonthDifferenceFunction = microServices.getMonthDifference;
const fileUpload = microServices.filedataUpload;
const sendMail = microServices.sendMail;
const sendMailGrid = microServices.sendMailGrid;
const sendMailRef = microServices.sendMailRef;

app.use(session({
    secret: 'gtest',
    resave: false,
    saveUninitialized: true
}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
router.superadminGetDriveralertModule = ('/superadminGetDriveralertModule', async (req, res) => {
    console.log(req.session.userId);
    // let getcmpdtls  = await Company.findOne({where : {id : req.session.userId},raw : true}); 
    let getcmpdtls = await Company.findOne({ raw: true });
    res.render('superadmin/GetDriveralertModuleSuperadmin', {
        title: 'Manage Alert',
        getcmpdtls: getcmpdtls
    });
});
router.superadminGettruckalertModule = ('/superadminGettruckalertModule', async (req, res) => {
    // let getdriverdtls  = await truck.findOne({where : {id : req.session.userId},raw : true});
    let getcmpdtls = await Company.findOne({ raw: true });
    console.log(getcmpdtls);
    res.render('superadmin/GettruckalertModulesuperadmin', {
        title: 'Manage Alert',
        getcmpdtls: getcmpdtls
    });
});
router.superadminGettraileralertModule = ('/superadminGettraileralertModule', async (req, res) => {
    // let getdriverdtls  = await trailer.findOne({where : {id : req.session.userId},raw : true});
    let getcmpdtls = await Company.findOne({ raw: true });
    console.log(getcmpdtls);
    res.render('superadmin/GettraileralertModulesuperadmin', {
        title: 'Manage Alert',
        getcmpdtls: getcmpdtls
    });
});
router.alertfreq = ('/alertfreq/', async (req, res) => {
    console.log(req.body.st);
    let freq;
    if (req.body.st == "true") {
        freq = 0
    } else {
        freq = 1
    }
    // console.log(freq);
    // return false;
    let id = req.body.id;
    let update_year = await Company.update({ alert_frequency: freq }, {
        where: {
            id: id
        }
    });
    if (update_year) {
        res.json({ status: true, message: 'alert frequency Updated' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
// router.migration = ('/migration',async(req,res,parms) =>{
//     let getcronOrigin = await sequelize.query('SELECT * FROM companyO LIMIT 1', {
//                     raw: false, // pass true here if you have any mapped fields
//                   });
//                   console.log(getcronOrigin[0]);
//                 //   getcronOrigin[0].forEach(elData => {
// })
router.alertCron = ('/alertCron', async (req, res, parms) => {
    // --------------------------------------DRIVER CRON------------------------------------------
    crondata(30, "license_expiry")
    // crondata(15, "license_expiry")
    // crondata(7, "license_expiry")

    crondata(30, "medical_due_date")
    crondata(30, "passport_expiry")
    crondata(30, "work_permit_expiry")
    async function crondata(exprange, columnName) {
        //Check actual data matching exprange and columname
        let getcronOrigin = await sequelize.query('SELECT d.id AS driverID,d.email AS driverEmail,c.email AS companyEmail,c.id AS companyID,c.name AS companyname,d.driver_name,STR_TO_DATE(d.' + columnName + ', "%d/%m/%Y") AS ' + columnName + ' FROM driver AS d JOIN company AS c ON d.company_id = c.id WHERE d.active = 0 AND c.alert = 0 AND STR_TO_DATE(d.' + columnName + ', "%d/%m/%Y") >= DATE(NOW()) AND STR_TO_DATE(d.' + columnName + ', "%d/%m/%Y") <= DATE(NOW()) + INTERVAL ' + exprange + ' DAY;', {
            raw: false, // pass true here if you have any mapped fields
        });
        console.log('SELECT d.id AS driverID,d.email AS driverEmail,c.email AS companyEmail,c.id AS companyID,c.name AS companyname,d.driver_name,STR_TO_DATE(d.' + columnName + ', "%d/%m/%Y") AS ' + columnName + ' FROM driver AS d JOIN company AS c ON d.company_id = c.id WHERE d.active = 0 AND c.alert = 0 AND STR_TO_DATE(d.' + columnName + ', "%d/%m/%Y") >= DATE(NOW()) AND STR_TO_DATE(d.' + columnName + ', "%d/%m/%Y") <= DATE(NOW()) + INTERVAL ' + exprange + ' DAY;');
        // console.log(getcronOrigin[0].length);
        //   getcronOrigin[0].forEach(elData => {
        // for (let index = 0; index < getcronOrigin[0].length; index++) {
        for (let index = 0; index < getcronOrigin[0].length; index++) {
            // console.log(getcronOrigin[0][index].companyname);
            if (getcronOrigin[0][index].driverEmail != "" && getcronOrigin[0][index].driverEmail.length != 2 && getcronOrigin[0][index].companyEmail != "" && getcronOrigin[0][index].companyEmail != "NO") {
                // if (getcronOrigin[0][index].driverEmail.length != 2) {
                // console.log(getcronOrigin[0][index][columnName]);
                console.log('gtest');
                console.log(getcronOrigin[0][index].driverEmail);
                console.log(getcronOrigin[0][index].driverEmail.length);
                //Check company id freq
                // 0 - week 1 -month	
                // let freqNum = (exprange == 7) ? 0 : 1
                // Company.findOne({
                //     attributes: ['id', 'alert_frequency'], where: { id: getcronOrigin[0][index].companyID, alert_frequency: freqNum }, raw: true,
                // }).then(function (list) {
                //Check mail already sent to this company
                let driverexp_historyData = sequelize.query('SELECT * FROM `driverexp_history` WHERE `exprange` != ' + exprange + ' AND `company_id` = ' + getcronOrigin[0][index].companyID + ' AND `expiry_date` = STR_TO_DATE(' + getcronOrigin[0][index][columnName] + ', "%d-%m-%Y") AND `type` = ' + "'" + columnName + "'" + ' ORDER BY id DESC;');
                console.log('SELECT * FROM `driverexp_history` WHERE `exprange` != ' + exprange + ' AND `company_id` = ' + getcronOrigin[0][index].companyID + ' AND `expiry_date` = STR_TO_DATE(' + getcronOrigin[0][index][columnName] + ', "%d-%m-%Y") AND `type` = ' + "'" + columnName + "'" + ' ORDER BY id DESC;');
                if (driverexp_historyData != "") {
                    // console.log(getcronOrigin[0][index]);
                    let to = getcronOrigin[0][index].driverEmail;
                    let cc = getcronOrigin[0][index].companyEmail;
                    // let to = 'compliancementorzportal@gmail.com';
                    // let cc = 'compliancementorzportal@gmail.com';
                    let subject = columnName + ' Expiration Approaching';
                    let date = new Date();
                    var updated_on =
                        ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
                        ("00" + date.getDate()).slice(-2) + "-" +
                        date.getFullYear() + " " +
                        ("00" + date.getHours()).slice(-2) + ":" +
                        ("00" + date.getMinutes()).slice(-2) + ":" +
                        ("00" + date.getSeconds()).slice(-2);
                    let message = '<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width,initial-scale=1"> <meta name="x-apple-disable-message-reformatting"> <title></title> <style>table, td, div, h1, p{font-family: Arial, sans-serif;}@media screen and (max-width: 530px){.unsub{display: block; padding: 8px; margin-top: 14px; border-radius: 6px; background-color: #555555; text-decoration: none !important; font-weight: bold;}.col-lge{max-width: 100% !important;}}@media screen and (min-width: 531px){.col-sml{max-width: 27% !important;}.col-lge{max-width: 73% !important;}}</style></head><body style="margin:0;padding:0;word-spacing:normal;background-color:#939297;"> <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297;"> <table role="presentation" style="width:100%;border:none;border-spacing:0;"> <tr> <td align="center" style="padding:0;"> <table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;"> <tr> <td style="padding:40px 30px 30px 30px;text-align:center;font-size:24px;font-weight:bold;"> <a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="165" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> </td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Hi  ' + getcronOrigin[0][index].driver_name + ',</p> <br><p style="margin:0;"> This is the Reminder e-mail that your ' + columnName + ' Expiry on (' + getcronOrigin[0][index][columnName] + '). Please provide us the renewed ' + columnName + ' before the expiration date.</p></td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Thank you,</p><p style="margin:0;">Safety Department  </p><br><a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="90" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> <p style="margin:0;">Tel: 905-486-1666</p><p style="margin:0;">Web: www.compliancementorz.com</p></td></tr><tr> <td style="padding:30px;text-align:center;font-size:12px;background-color:#404040;color:#cccccc;"> <p style="margin:0;font-size:14px;line-height:20px;">&reg; compliancementorz 2022</p></td></tr></table> </td></tr></table> </div></body></html>';
                    let licenseData = 'asda';
                    // let licenseData = sendMail(to, cc, subject, message, req, res)
                    if (licenseData) {
                        //   res.json({status:true,message:'Mail sent'+to});
                        console.log('Mail sent' + to);
                    } else {
                        console.log('Something went wrong');
                        //   res.json({status:false,message:'Something went wrong'});
                    }
                    let create_Company = driverexp_history.create({ company_id: getcronOrigin[0][index].companyID, driver_id: getcronOrigin[0][index].companyID, companyname: getcronOrigin[0][index].companyname, driver_name: getcronOrigin[0][index].driver_name, mail_content: message, to_mail: to, type: columnName, expiry_date: getcronOrigin[0][index][columnName], exprange: exprange, created_date: updated_on });
                    return false
                } else {
                    console.log("mail failed");
                }
                // })
            }
        }
    }
    // --------------------------------------DRIVER CRON------------------------------------------
    // --------------------------------------TRUCK CRON------------------------------------------
    // crondataTruck(40, "annual_safety_current")
    async function crondataTruck(exprange, columnName) {
        //Check actual data matching exprange and columname
        let getcronOrigin = await sequelize.query('SELECT c.email AS companyEmail,t.id,t.truck_unit,STR_TO_DATE(t.' + columnName + ', "%d/%m/%Y") AS ' + columnName + ',t.company_id,c.id AS companyID,c.name AS companyname,(SELECT driver_name FROM driver WHERE id =  t.company_id LIMIT 1) AS driver_name FROM truck AS t JOIN company AS c ON c.id = t.company_id WHERE t.active = 0, STR_TO_DATE(t.' + columnName + ', "%d/%m/%Y") >= DATE(NOW()) AND STR_TO_DATE(t.' + columnName + ', "%d/%m/%Y") <= DATE(NOW()) + INTERVAL 40 DAY;', {
            raw: false, // pass true here if you have any mapped fields
        });
        console.log('length');
        console.log(getcronOrigin[0].length);
        //   getcronOrigin[0].forEach(elData => {
        // for (let index = 0; index < getcronOrigin[0].length; index++) {
        for (let index = 0; index < 1; index++) {
            console.log(getcronOrigin[0][index].companyID);
            //   console.log(columnName);
            //Check company id freq
            // 0 - week 1 -month	
            let freqNum = (exprange == 7) ? 0 : 1
            Company.findOne({
                attributes: ['id', 'alert_frequency'], where: { id: getcronOrigin[0][index].companyID, alert_frequency: freqNum }, raw: true,
            }).then(function (list) {
                //Check mail already sent to this company
                let driverexp_historyData = sequelize.query('SELECT * FROM `driverexp_history` WHERE `company_id` = ' + getcronOrigin[0][index].companyID + ' AND `expiry_date` = STR_TO_DATE(' + getcronOrigin[0][index][columnName] + ', "%d-%m-%Y") AND `type` = ' + "'" + columnName + "'" + ' ORDER BY id DESC;');
                if (driverexp_historyData != "") {
                    // let to = 'compliancementorzportal@gmail.com';
                    let to = getcronOrigin[0][index].companyEmail;
                    let cc = 'compliancementorzportal@gmail.com';
                    let subject = columnName + ' Expiration Approaching';
                    let date = new Date();
                    var updated_on =
                        ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
                        ("00" + date.getDate()).slice(-2) + "-" +
                        date.getFullYear() + " " +
                        ("00" + date.getHours()).slice(-2) + ":" +
                        ("00" + date.getMinutes()).slice(-2) + ":" +
                        ("00" + date.getSeconds()).slice(-2);
                    let message = '<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width,initial-scale=1"> <meta name="x-apple-disable-message-reformatting"> <title></title> <style>table, td, div, h1, p{font-family: Arial, sans-serif;}@media screen and (max-width: 530px){.unsub{display: block; padding: 8px; margin-top: 14px; border-radius: 6px; background-color: #555555; text-decoration: none !important; font-weight: bold;}.col-lge{max-width: 100% !important;}}@media screen and (min-width: 531px){.col-sml{max-width: 27% !important;}.col-lge{max-width: 73% !important;}}</style></head><body style="margin:0;padding:0;word-spacing:normal;background-color:#939297;"> <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297;"> <table role="presentation" style="width:100%;border:none;border-spacing:0;"> <tr> <td align="center" style="padding:0;"> <table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;"> <tr> <td style="padding:40px 30px 30px 30px;text-align:center;font-size:24px;font-weight:bold;"> <a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="165" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> </td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Hi ' + getcronOrigin[0][index].companyname + ',</p> <br><p style="margin:0;"> This is the Reminder e-mail that your Truck ' + getcronOrigin[0][index].truck_unit + '  ' + columnName + ' Expiry on (' + getcronOrigin[0][index][columnName] + ')</p>. Please provide us the renewed ' + columnName + ' before the expiration date.</td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Thank you,</p><p style="margin:0;">Safety Department  </p><br><a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="90" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> <p style="margin:0;">Tel: 905-486-1666</p><p style="margin:0;">Web: www.compliancementorz.com</p></td></tr><tr> <td style="padding:30px;text-align:center;font-size:12px;background-color:#404040;color:#cccccc;"> <p style="margin:0;font-size:14px;line-height:20px;">&reg; compliancementorz 2022</p></td></tr></table> </td></tr></table> </div></body></html>';
                    // let licenseData = sendMail(to, subject, message, req, res)
                    //   if(licenseData){
                    //       res.json({status:true,message:'Mail sent'});
                    //   }else{
                    //       res.json({status:false,message:'Something went wrong'});
                    //   }
                    console.log('mail sent to ');
                    truckexp_history.create({ truck_id: getcronOrigin[0][index].id, truckname: getcronOrigin[0][index].truck_unit, company_id: getcronOrigin[0][index].companyID, driver_id: getcronOrigin[0][index].companyID, companyname: getcronOrigin[0][index].companyname, driver_name: getcronOrigin[0][index].driver_name, mail_content: message, to_mail: to, type: columnName, expiry_date: getcronOrigin[0][index][columnName], created_date: updated_on });
                } else {
                    console.log("mail failed");
                }
            })
        }
    }
    // --------------------------------------TRUCK CRON------------------------------------------
    // --------------------------------------TRAILER CRON------------------------------------------
    // crondataTrailer(40, "preventive_maintenance")
    async function crondataTrailer(exprange, columnName) {
        //Check actual data matching exprange and columname
        let getcronOrigin = await sequelize.query('SELECT c.email AS companyEmail,t.id,t.trailer_unit,STR_TO_DATE(t.' + columnName + ', "%d/%m/%Y") AS ' + columnName + ',t.company_id,c.id AS companyID,c.name AS companyname,(SELECT driver_name FROM driver WHERE id =  t.company_id LIMIT 1) AS driver_name FROM trailer AS t JOIN company AS c ON c.id = t.company_id WHERE  t.active = 0,STR_TO_DATE(t.' + columnName + ', "%d/%m/%Y") >= DATE(NOW()) AND STR_TO_DATE(t.' + columnName + ', "%d/%m/%Y") <= DATE(NOW()) + INTERVAL 40 DAY;', {
            raw: false, // pass true here if you have any mapped fields
        });
        console.log('length');
        console.log(getcronOrigin[0].length);
        //   getcronOrigin[0].forEach(elData => {
        // for (let index = 0; index < getcronOrigin[0].length; index++) {
        for (let index = 0; index < 1; index++) {
            console.log(getcronOrigin[0][index].companyID);
            //   console.log(columnName);
            //Check company id freq
            // 0 - week 1 -month	
            let freqNum = (exprange == 7) ? 0 : 1
            Company.findOne({
                attributes: ['id', 'alert_frequency'], where: { id: getcronOrigin[0][index].companyID, alert_frequency: freqNum }, raw: true,
            }).then(function (list) {
                //Check mail already sent to this company
                let driverexp_historyData = sequelize.query('SELECT * FROM `driverexp_history` WHERE `company_id` = ' + getcronOrigin[0][index].companyID + ' AND `expiry_date` = STR_TO_DATE(' + getcronOrigin[0][index][columnName] + ', "%d-%m-%Y") AND `type` = ' + "'" + columnName + "'" + ' ORDER BY id DESC;');
                if (driverexp_historyData != "") {
                    // let to = 'compliancementorzportal@gmail.com';
                    let to = getcronOrigin[0][index].companyEmail;
                    let cc = 'compliancementorzportal@gmail.com';
                    let subject = columnName + ' Expiration Approaching';
                    let date = new Date();
                    var updated_on =
                        ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
                        ("00" + date.getDate()).slice(-2) + "-" +
                        date.getFullYear() + " " +
                        ("00" + date.getHours()).slice(-2) + ":" +
                        ("00" + date.getMinutes()).slice(-2) + ":" +
                        ("00" + date.getSeconds()).slice(-2);
                    let message = '<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width,initial-scale=1"> <meta name="x-apple-disable-message-reformatting"> <title></title> <style>table, td, div, h1, p{font-family: Arial, sans-serif;}@media screen and (max-width: 530px){.unsub{display: block; padding: 8px; margin-top: 14px; border-radius: 6px; background-color: #555555; text-decoration: none !important; font-weight: bold;}.col-lge{max-width: 100% !important;}}@media screen and (min-width: 531px){.col-sml{max-width: 27% !important;}.col-lge{max-width: 73% !important;}}</style></head><body style="margin:0;padding:0;word-spacing:normal;background-color:#939297;"> <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297;"> <table role="presentation" style="width:100%;border:none;border-spacing:0;"> <tr> <td align="center" style="padding:0;"> <table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;"> <tr> <td style="padding:40px 30px 30px 30px;text-align:center;font-size:24px;font-weight:bold;"> <a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="165" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> </td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Hi  ' + getcronOrigin[0][index].companyname + ',</p> <br><p style="margin:0;"> This is the Reminder e-mail that your Trailer ' + getcronOrigin[0][index].trailer_unit + ' ' + columnName + ' Expiry on  (' + getcronOrigin[0][index][columnName] + '). Please provide us the renewed ' + columnName + ' before the expiration date.</p></td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Thank you,</p><p style="margin:0;">Safety Department  </p><br><a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="90" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> <p style="margin:0;">Tel: 905-486-1666</p><p style="margin:0;">Web: www.compliancementorz.com</p></td></tr><tr> <td style="padding:30px;text-align:center;font-size:12px;background-color:#404040;color:#cccccc;"> <p style="margin:0;font-size:14px;line-height:20px;">&reg; compliancementorz 2022</p></td></tr></table> </td></tr></table> </div></body></html>';
                    // let licenseData = sendMail(to, subject, message, req, res)
                    //   if(licenseData){
                    //       res.json({status:true,message:'Mail sent'});
                    //   }else{
                    //       res.json({status:false,message:'Something went wrong'});
                    //   }
                    console.log('mail sent to ');
                    trailerexp_history.create({ trailer_id: getcronOrigin[0][index].id, trailername: getcronOrigin[0][index].trailer_unit, company_id: getcronOrigin[0][index].companyID, driver_id: getcronOrigin[0][index].companyID, companyname: getcronOrigin[0][index].companyname, driver_name: getcronOrigin[0][index].driver_name, mail_content: message, to_mail: to, type: columnName, expiry_date: getcronOrigin[0][index][columnName], created_date: updated_on });
                } else {
                    console.log("mail failed");
                }
            })
        }
    }
    // --------------------------------------TRAILER CRON------------------------------------------
})
router.GetDriveralerthistorySuperadmin = ('/GetDriveralerthistorySuperadmin', async (req, res) => {
    // This query will pull 7 days license_expiry
    let company1 = await sequelize.query('SELECT driver_id,driver_name,to_mail,companyname,created_date,COUNT(driver_id) AS mailcount,type,expiry_date FROM `driverexp_history`GROUP BY driver_id ORDER BY COUNT(driver_id) DESC;', {
        raw: true, // pass true here if you have any mapped fields
    });
    //   console.log(company1[0]);
    let data = company1[0];
    let fData = []
    let sl = 1
    data.forEach(el => {
        // console.log(el.driver_id);
        el["slno"] = sl;
        fData.push(el)
        sl = sl + 1
    });
    //   console.log(fData);
    //   return false
    res.render('superadmin/GetDriveralertModuleSuperadminHistory.ejs', {
        title: 'Manage Alert History',
        data: data
    });
})
router.GetDriveralerthistorySuperadminbyID = ('/GetDriveralerthistorySuperadminbyID', async (req, res) => {
    let driverid = req.query.id;
    // let driverid = 279
    res.render('superadmin/GetDriveralerthistorySuperadminbyID', {
        title: 'Get Alert History',
        driverid: driverid
    });
});
router.GetDriveralerthistorySuperadminbyIDdata = ('/GetDriveralerthistorySuperadminbyIDdata', async (req, res) => {
    // console.log(req.query.columns);
    console.log(req.query.draw);
    console.log(req.query.search.value);
    let col = req.query.columns[[0]].column || 'id';
    let direction = req.query.columns[[0]].dir || 'DESC';
    let columns = ['id', 'driver_id', 'driver_name', 'companyname', 'to_mail', 'type', 'expiry_date', 'created_date'];
    let searchKey = '';
    let where = [];
    // Search Conditions
    if (req.query.search.value) {
        if (req.query.search.value == "") {
            where.push({
                [Op.or]: [
                    { 'driver_id': { [Op.like]: `%` + req.query.search.value + `%` } }
                ]
            });
        } else {
            where.push({ ['driver_id']: { [Op.like]: `%` + req.query.search.value + `%` } });
        }
    } else {
        where.push({
            id: {
                [Op.ne]: ""
            }
        });
    }
    where.push({
        driver_id: req.query.driverid
    });
    const options = {
        page: ((req.query.start / req.query.length) + 1) || 1,
        paginate: parseInt(req.query.length) || 25,
        order: [[columns, col, direction]],
        attributes: columns,
        raw: true,
        where: where
    }
    await driverexp_history.paginate(options).then(function (dt) {
        // let data =  dt.docs.map(formData);
        // function formData(key) {
        let data = dt.docs.map(formData);
        // console.log(data);
        function formData(key, index) {
            index = index + 1
            // console.log(key);
            // let i = 1;
            key.id = key.id,
                Object.assign(key, {
                    slno: index
                });
            // key.id = key.id,
            // Object.assign(key, {
            //     action: "<a href='javascript:void(0)' data-id='"+key.id+"' id='editmodalid' class='btn  btn-warning editmodalclass'><span class='fas fa-edit'> Edit</span></a>&nbsp;"+
            //         "<a href='javascript:void(0)' data-id='"+key.id+"' id='' class='btn  btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a> " + 
            //         "<a href='javascript:void(0)' data-id='"+key.id+"' id='deletecompany' class='btn  btn-danger deletemodalclass'><span class='fas fa-trash'> Delete</span></a>"
            // });
            return key;
        }
        res.json({
            "recordsTotal": data.length,
            "recordsFiltered": dt.total,
            data
        });
        // console.log(data.length);
        // console.log(dt.total);
        console.log(data);
    });
})
router.GetTruckalertSuperadmin = ('/GetTruckalertSuperadmin', async (req, res) => {
    // console.log('test'); 
    let company1
    console.log(req.query.exptypeTruck);
    if (req.query.exprange == 'expired_list') {
        company1 = await sequelize.query('SELECT t.id,t.truck_unit,STR_TO_DATE(t.' + req.query.exptypeTruck + ', "%d/%m/%Y") AS ' + req.query.exptypeTruck + ',t.company_id,c.id AS driver,(SELECT driver_name FROM driver WHERE company_id =  t.company_id LIMIT 1) AS driver_name,c.name AS companyname FROM truck AS t JOIN company AS c ON c.id = t.company_id WHERE c.active = 0 AND  t.active = 0 AND STR_TO_DATE(t.' + req.query.exptypeTruck + ', "%d/%m/%Y") <= DATE(NOW())', {
            raw: true, // pass true here if you have any mapped fields
        });
    }
    else {
        company1 = await sequelize.query('SELECT t.id,t.truck_unit,STR_TO_DATE(t.' + req.query.exptypeTruck + ', "%d/%m/%Y") AS ' + req.query.exptypeTruck + ',t.company_id,c.id AS driver,(SELECT driver_name FROM driver WHERE company_id =  t.company_id LIMIT 1) AS driver_name,c.name AS companyname FROM truck AS t JOIN company AS c ON c.id = t.company_id WHERE c.active = 0 AND  t.active = 0 AND STR_TO_DATE(t.' + req.query.exptypeTruck + ', "%d/%m/%Y") >= DATE(NOW()) AND STR_TO_DATE(t.' + req.query.exptypeTruck + ', "%d/%m/%Y") <= DATE(NOW()) + INTERVAL ' + req.query.exprange + ' DAY;', {
            raw: true, // pass true here if you have any mapped fields
        });
    }
    let data1 = company1[0];
    let data = []
    let sl = 1
    data1.forEach(el => {
        el["slno"] = sl;
        data.push(el)
        sl = sl + 1
    });
    res.json({
        "recordsTotal": data.length,
        "recordsFiltered": data.length,
        data
    });
})
router.GetTruckalerthistorySuperadmin = ('/GetTruckalerthistorySuperadmin', async (req, res) => {
    // This query will pull 7 days license_expiry
    let company1 = await sequelize.query('SELECT driver_id,driver_name,to_mail,companyname,created_date,COUNT(driver_id) AS mailcount,type,expiry_date FROM `truckexp_history` GROUP BY driver_id ORDER BY COUNT(driver_id) DESC;', {
        raw: true, // pass true here if you have any mapped fields
    });
    //   let data = company1[0];
    let data1 = company1[0];
    let data = []
    let sl = 1
    data1.forEach(el => {
        // console.log(el.driver_id);
        el["slno"] = sl;
        data.push(el)
        sl = sl + 1
    });
    res.render('superadmin/GetTruckalertModuleSuperadminHistory.ejs', {
        title: 'Manage Alert History',
        data: data
    });
})
router.GetTruckalerthistorySuperadminbyID = ('/GetTruckalerthistorySuperadminbyID', async (req, res) => {
    let driverid = req.query.id;
    // let driverid = 279
    res.render('superadmin/GetTruckalerthistorySuperadminbyID', {
        title: 'Get Alert History',
        driverid: driverid
    });
});
router.GetTruckalerthistorySuperadminbyIDdata = ('/GetTruckalerthistorySuperadminbyIDdata', async (req, res) => {
    // console.log(req.query.columns);
    console.log(req.query.draw);
    console.log(req.query.search.value);
    let col = req.query.columns[[0]].column || 'id';
    let direction = req.query.columns[[0]].dir || 'DESC';
    let columns = ['id', 'driver_id', 'driver_name', 'companyname', 'to_mail', 'type', 'expiry_date', 'created_date'];
    let searchKey = '';
    let where = [];
    // Search Conditions
    if (req.query.search.value) {
        if (req.query.search.value == "") {
            where.push({
                [Op.or]: [
                    { 'driver_id': { [Op.like]: `%` + req.query.search.value + `%` } }
                ]
            });
        } else {
            where.push({ ['driver_id']: { [Op.like]: `%` + req.query.search.value + `%` } });
        }
    } else {
        where.push({
            id: {
                [Op.ne]: ""
            }
        });
    }
    where.push({
        driver_id: req.query.driverid
    });
    const options = {
        page: ((req.query.start / req.query.length) + 1) || 1,
        paginate: parseInt(req.query.length) || 25,
        order: [[columns, col, direction]],
        attributes: columns,
        raw: true,
        // where: { driver_id: req.query.driverid }
        where: where
    }
    await truckexp_history.paginate(options).then(function (dt) {
        let data = dt.docs.map(formData);
        function formData(key) {
            // key.id = key.id,
            // Object.assign(key, {
            //     action: "<a href='javascript:void(0)' data-id='"+key.id+"' id='editmodalid' class='btn  btn-warning editmodalclass'><span class='fas fa-edit'> Edit</span></a>&nbsp;"+
            //         "<a href='javascript:void(0)' data-id='"+key.id+"' id='' class='btn  btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a> " + 
            //         "<a href='javascript:void(0)' data-id='"+key.id+"' id='deletecompany' class='btn  btn-danger deletemodalclass'><span class='fas fa-trash'> Delete</span></a>"
            // });
            return key;
        }
        res.json({
            "recordsTotal": data.length,
            "recordsFiltered": dt.total,
            data
        });
        // console.log(data.length);
        // console.log(dt.total);
        console.log(data);
    });
})
router.GetTraileralertSuperadmin = ('/GetTraileralertSuperadmin', async (req, res) => {
    // return false;
    let company1
    console.log(req.query.exptypeTruck);
    if (req.query.exprange == 'expired_list') {
        company1 = await sequelize.query('SELECT t.id,t.trailer_unit,STR_TO_DATE(t.' + req.query.exptypeTruck + ', "%d/%m/%Y") AS ' + req.query.exptypeTruck + ',t.company_id,c.id AS driver,c.name AS companyname,(SELECT driver_name FROM driver WHERE company_id =  t.company_id LIMIT 1) AS driver_name,c.name AS companyname FROM trailer AS t JOIN company AS c ON c.id = t.company_id WHERE c.active = 0 AND  t.active = 0 AND STR_TO_DATE(t.' + req.query.exptypeTruck + ', "%d/%m/%Y") <= DATE(NOW())', {
            raw: true, // pass true here if you have any mapped fields
        });
    }
    else {
        company1 = await sequelize.query('SELECT t.id,t.trailer_unit,STR_TO_DATE(t.' + req.query.exptypeTruck + ', "%d/%m/%Y") AS ' + req.query.exptypeTruck + ',t.company_id,c.id AS driver,c.name AS companyname,(SELECT driver_name FROM driver WHERE company_id =  t.company_id LIMIT 1) AS driver_name,c.name AS companyname FROM trailer AS t JOIN company AS c ON c.id = t.company_id WHERE c.active = 0 AND  t.active = 0 AND STR_TO_DATE(t.' + req.query.exptypeTruck + ', "%d/%m/%Y") >= DATE(NOW()) AND STR_TO_DATE(t.' + req.query.exptypeTruck + ', "%d/%m/%Y") <= DATE(NOW()) + INTERVAL ' + req.query.exprange + ' DAY;', {
            raw: true, // pass true here if you have any mapped fields
        });
    }
    let data1 = company1[0];
    let data = []
    let sl = 1
    data1.forEach(el => {
        el["slno"] = sl;
        data.push(el)
        sl = sl + 1
    });
    res.json({
        "recordsTotal": data.length,
        "recordsFiltered": data.length,
        data
    });
})
router.GetTraileralerthistorySuperadmin = ('/GetTraileralerthistorySuperadmin', async (req, res) => {
    // This query will pull 7 days license_expiry
    let company1 = await sequelize.query('SELECT driver_id,driver_name,companyname,created_date,COUNT(driver_id) AS mailcount,type,expiry_date FROM `driverexp_history`GROUP BY driver_id ORDER BY COUNT(driver_id) DESC;', {
        raw: true, // pass true here if you have any mapped fields
    });
    let data = company1[0];
    res.render('superadmin/GetTraileralertModuleSuperadminHistory.ejs', {
        title: 'Manage Alert History',
        data: data
    });
})
router.GetTraileralerthistorySuperadminbyID = ('/GetTraileralerthistorySuperadminbyID', async (req, res) => {
    let driverid = req.query.id;
    // let driverid = 279
    res.render('superadmin/GetTraileralerthistorySuperadminbyID', {
        title: 'Get Alert History',
        driverid: driverid
    });
});
router.GetTraileralerthistorySuperadminbyIDdata = ('/GetTraileralerthistorySuperadminbyIDdata', async (req, res) => {
    // console.log(req.query.columns);
    console.log(req.query.draw);
    console.log(req.query.search.value);
    let col = req.query.columns[[0]].column || 'id';
    let direction = req.query.columns[[0]].dir || 'DESC';
    let columns = ['id', 'driver_id', 'driver_name', 'companyname', 'to_mail', 'expiry_date', 'created_date'];
    let searchKey = '';
    let where = [];
    // Search Conditions
    if (req.query.search.value) {
        if (req.query.search.value == "") {
            where.push({
                [Op.or]: [
                    { 'driver_id': { [Op.like]: `%` + req.query.search.value + `%` } }
                ]
            });
        } else {
            where.push({ ['driver_id']: { [Op.like]: `%` + req.query.search.value + `%` } });
        }
    } else {
        where.push({
            id: {
                [Op.ne]: ""
            }
        });
    }
    where.push({
        driver_id: req.query.driverid
    });
    const options = {
        page: ((req.query.start / req.query.length) + 1) || 1,
        paginate: parseInt(req.query.length) || 25,
        order: [[columns, col, direction]],
        attributes: columns,
        raw: true,
        where: { driver_id: req.query.driverid }
    }
    await trailerexp_history.paginate(options).then(function (dt) {
        let data = dt.docs.map(formData);
        function formData(key) {
            // key.id = key.id,
            // Object.assign(key, {
            //     action: "<a href='javascript:void(0)' data-id='"+key.id+"' id='editmodalid' class='btn  btn-warning editmodalclass'><span class='fas fa-edit'> Edit</span></a>&nbsp;"+
            //         "<a href='javascript:void(0)' data-id='"+key.id+"' id='' class='btn  btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a> " + 
            //         "<a href='javascript:void(0)' data-id='"+key.id+"' id='deletecompany' class='btn  btn-danger deletemodalclass'><span class='fas fa-trash'> Delete</span></a>"
            // });
            return key;
        }
        res.json({
            "recordsTotal": data.length,
            "recordsFiltered": dt.total,
            data
        });
        // console.log(data.length);
        // console.log(dt.total);
        console.log(data);
    });
})
// let driverid = req.query.driverid;
// console.log(driverid);
// console.log(req.query.draw);
// console.log(req.query.search.value);
// let col = req.query.columns[[0]].column || 'id';
// let direction = req.query.columns[[0]].dir || 'DESC';
// let columns = ['id','driver_name'];
// let searchKey = '';
// let where = [];
// // Search Conditions
// if(req.query.search.value) {
//     if(req.query.search.value ==""){
//         where.push({
//             [Op.or]:[
//                 {'driver_name' : {[Op.like] : `%`+req.query.search.value+`%`}}
//             ]
//         });
//     }else {
//         where.push({['driver_name']: {[Op.like] : `%`+ req.query.search.value+`%`}});
//     }
// }else{
//     where.push({
//         id : {
//             [Op.ne] : ""
//         }
//     });
// }
// const options = {
//     page: ((req.query.start/req.query.length)+1) || 1,
//     paginate: parseInt(req.query.length) || 25,
//     order: [[columns,col, direction]],
//     attributes : columns,
//     raw : true
//     // where : {driver_id:driverid}
// }
// await driverexp_history.paginate(options).then(function (dt) {
//     let data =  dt.docs.map(formData);
//     function formData(key) {
//         key.id = key.id,
//         key.name = key.name
//         return key;
//     }
//     res.json({
//         "recordsTotal": data.length,
//         "recordsFiltered": dt.total,
//         data
//     });
//     // console.log(data.length);
//     // console.log(dt.total);
//     // console.log(data);
// });
router.GetDriveralert = ('/GetDriveralert', async (req, res) => {
    console.log(req.query.exptype);
    // if (req.query.exptype == 'license_expiry') {
    // -------Driver cron----------
    // This query will pull 7 days license_expiry
    // let company1 = await sequelize.query('SELECT d.id,c.name AS companyname,d.driver_name,STR_TO_DATE(d.license_expiry, "%d/%m/%Y") AS license_expiry FROM driver AS d JOIN company AS c ON d.company_id = c.id WHERE STR_TO_DATE(d.license_expiry, "%d/%m/%Y") >= DATE(NOW()) + INTERVAL -7 DAY AND STR_TO_DATE(d.license_expiry, "%d/%m/%Y") < DATE(NOW()) + INTERVAL 0 DAY AND alert_frequency = 1;', {
    //     raw: true, // pass true here if you have any mapped fields
    //   });
    let company1 = await sequelize.query('SELECT d.id,c.name AS companyname,d.driver_name,STR_TO_DATE(d.license_expiry, "%d/%m/%Y") AS license_expiry FROM driver AS d JOIN company AS c ON d.company_id = c.id WHERE STR_TO_DATE(d.license_expiry, "%d/%m/%Y") >= DATE(NOW()) AND STR_TO_DATE(d.license_expiry, "%d/%m/%Y") <= DATE(NOW()) + INTERVAL 7 DAY;', {
        raw: true, // pass true here if you have any mapped fields
    });
    let data1 = company1[0];
    let data = []
    let sl = 1
    data1.forEach(el => {
        // console.log(el.driver_id);
        el["slno"] = sl;
        data.push(el)
        sl = sl + 1
    });
    // console.log(typeof(data));
    res.json({
        "recordsTotal": data.length,
        "recordsFiltered": data.length,
        data
    });
    // } else if (req.query.exptype == 'passport_expiry') {
    // }
})
// router.dashboard = ('/dashboard/', async (req, res) => {
//     console.log('dashboard');
//     console.log(req.session);
//     if (req.session.adminRole == 1) {
//         let getLogs = await Loginaudit.findAll({
//             limit: 5, order: [
//                 ['id', 'DESC']
//             ], raw: true
//         });
//         // console.log(getLogs);
//         // let getCmpCount = await Company.count({ distinct: 'id',where: {name:'test'}});
//         let getCmpCount = 1;
//         let getTruckCount = await Truck.count({ distinct: 'id' });
//         let getTrailerCount = await Trailer.count({ distinct: 'id' });
//         var d = new Date();
//         var strDate = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate();
//         // let getCmpCount  = await Company.count({distinct: 'id'})
//         // .then(function(count) {
//         // });
//         // console.log(getCmpCount);
//         // console.log(getLogs);
//         res.render('dashboard', {
//             title: 'Dashboard',
//             getLogs: getLogs,
//             getCmpCount: 1,
//             getTruckCount: getTruckCount,
//             getTrailerCount: getTrailerCount,
//             todaysday: strDate,
//             // email : req.session.email
//             email: 'test'
//         });
//     } else if (req.session.adminRole == 0) {
//         // res.render('companydashboard', {
//         //     title : 'companydashboard',
//         //     // email : req.session.email
//         //     email : 'test'
//         // });
//         res.redirect('/companydashboard');
//     } else {
//         res.redirect('/logout');
//     }
// });
router.company = (req, res) => {
    res.render('company', {
        title: 'Manage Company'
    });
};
router.getCompanyCSV = async (req, res) => {
    // let getcompany  = await Company.findOne({where : {id : req.session.userId},raw : true});
    let getcompany = await Company.findAll({ where: { active: 0 }, raw: true });
    const csv = new ObjectsToCsv(getcompany)
    let csvforming = await csv.toDisk('./public/temp/list.csv', { append: true })
    if (csvforming) {
        res.json({ status: true, filename: 'list.csv' });
    }
    // console.log(getcompany);
    // const csvString =  json2csv(getcompany);
    // res.setHeader('Content-disposition', 'attachment; filename=list.csv');
    // res.set('Content-Type', 'text/csv');
    // res.status(200).send(csvString);
}
router.getCompany = async (req, res) => {
    console.log('get company');
    // console.log(req.query.columns);
    // console.log(req.query.draw);
    // console.log(req.query.search.value);
    let col = req.query.columns[[0]].column || 'id';
    let direction = req.query.columns[[0]].dir || 'DESC';
    let columns = ['id', 'name', 'alert','active','status'];
    let searchKey = '';
    let where = [];
    // Search Conditions
    if (req.query.search.value) {
        if (req.query.search.value == "") {
            where.push({
                [Op.or]: [
                    { 'name': { [Op.like]: `%` + req.query.search.value + `%` } }
                ]
            });
        } else {
            where.push({ ['name']: { [Op.like]: `%` + req.query.search.value + `%` } });
        }
    } else {
        where.push({
            id: {
                [Op.ne]: ""
            }
        });
    }
    where.push({
        active: 0
    });
    const options = {
        page: ((req.query.start / req.query.length) + 1) || 1,
        paginate: parseInt(req.query.length) || 25,
        order: [[columns, col, direction]],
        attributes: columns,
        raw: true,
        where: where
    }
    await Company.paginate(options).then(function (dt) {
        // let index = 1;
        // console.log(dt.docs);
        let data = dt.docs.map(formData);
        // console.log(data);
        function formData(key, index) {
            console.log(key);
            index = parseInt(index) + 1 + parseInt(req.query.start);
            // console.log(key);
            // let i = 1;
            key.id = key.id,
                // console.log('------------------');
                // console.log(key.alert);
                key.name = key.name,
                Object.assign(key, {
                    slno: index
                });
            //0 - active   1 inactive
            if (key.alert == 0) {
                Object.assign(key, {
                    alert: "<input type='checkbox' id=''  data-id='" + key.id + "' class='alertcheckbox' checked/>"
                });
            } else {
                Object.assign(key, {
                    alert: "<input type='checkbox' id=''  data-id='" + key.id + "' class='alertcheckbox'/>"
                });
            }
            if (key.status == 1) {
                Object.assign(key, {
                    status: "<input type='checkbox' id=''  data-id='" + key.id + "' class='statuscheckbox' checked/>"
                });
            } else {
                Object.assign(key, {
                    status: "<input type='checkbox' id=''  data-id='" + key.id + "' class='statuscheckbox'/>"
                });
            }

            Object.assign(key, {
                action: "<a href='javascript:void(0)' data-id='" + key.id + "' id='editmodalid' class='btn  btn-warning editmodalclass'><span class='fas fa-edit'> Edit</span></a>&nbsp;" +
                    "<a href='javascript:void(0)' data-id='" + key.id + "' id='' class='btn  btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a> " +
                    "<a href='javascript:void(0)' data-id='" + key.id + "' id='deletecompany' class='btn  btn-danger deletemodalclass'><span class='fas fa-trash'> Delete</span></a>"
            });
            return key;
        }
        res.json({
            "recordsTotal": data.length,
            "recordsFiltered": dt.total,
            data
        });
        // console.log(data.length);
        // console.log(dt.total);
        // console.log(data);
    });
};
router.editCompany = ('/editCompany/', async (req, res) => {
    //    console.log(req.query);
    let id = req.query.id;
    let getcompany = await Company.findOne({ where: { id: id }, raw: true });
    // console.log(getcompany);
    if (getcompany) {
        res.json({ status: true, data: getcompany });
    }
    else {
        res.json({ status: false });
    }
});
router.deleteCompany = ('/deleteCompany/', async (req, res) => {
    console.log(req);
    let id = req.body.id;
    let update_year = await Company.update({ active: 1 }, {
        where: {
            id: id
        }
    });
    if (update_year) {
        res.json({ status: true, message: 'Company Deleted successfully' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});

router.updatealertCompany = ('/updatealertCompany/', async (req, res) => {
    console.log(req);
    let id = req.body.id;
    let alertStatus = req.body.alertStatus;
    let update_year = await Company.update({ alert: alertStatus }, {
        where: {
            id: id
        }
    });
    if (update_year) {
        res.json({ status: true, message: 'Company Alert updated successfully' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
router.updatestatusCompany = ('/updatestatusCompany/', async (req, res) => {
    console.log(req);
    let id = req.body.id;
    let status = req.body.status;
    let update_year = await Company.update({ status: status }, {
        where: {
            id: id
        }
    });
    if (update_year) {
        res.json({ status: true, message: 'Company Status updated successfully' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
router.superadmindriveractive = ('/superadmindriveractive/', async (req, res) => {
    // console.log(req);
    let id = req.body.id;
    let activeStatus = req.body.activeStatus;
    let update_year = await Driver.update({ active: activeStatus }, {
        where: {
            id: id
        }
    });
    if (update_year) {
        res.json({ status: true, message: 'Driver updated successfully' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
router.superadmintrukactive = ('/superadmintrukactive/', async (req, res) => {
    // console.log(req);
    let id = req.body.id;
    let activeStatus = req.body.activeStatus;
    let update_year = await Truck.update({ active: activeStatus }, {
        where: {
            id: id
        }
    });
    if (update_year) {
        res.json({ status: true, message: 'Truck updated successfully' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
router.superadmintraileractive = ('/superadmintraileractive/', async (req, res) => {
    // console.log(req);
    let id = req.body.id;
    let activeStatus = req.body.activeStatus;
    let update_year = await Trailer.update({ active: activeStatus }, {
        where: {
            id: id
        }
    });
    if (update_year) {
        res.json({ status: true, message: 'Tailer updated successfully' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});

router.createCompany = ('/createCompany/', async (req, res) => {
    let date = new Date();
    var updated_on =
        ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
        ("00" + date.getDate()).slice(-2) + "-" +
        date.getFullYear() + " " +
        ("00" + date.getHours()).slice(-2) + ":" +
        ("00" + date.getMinutes()).slice(-2) + ":" +
        ("00" + date.getSeconds()).slice(-2);
    console.log(req.session);
    Object.assign(req.body, {
        updated_on: updated_on // add json element
    });
    Object.assign(req.body, {
        company_id: req.session.userId // add json element
    });
    Object.assign(req.body, {
        active: 0 // add json element
    });
     if (req.body.fileupload_file != "") {
        let logo = 'public/uploads/company_logo/';
        let logodata = await fileUpload('logo', logo, req.body.fileupload_file, req, res)
        Object.assign(req.body, {
           logo: logodata // add json element
        });
    }
    const fData = JSON.parse(JSON.stringify(req.body))
    let create_Company = await Company.create(fData);
    if (create_Company) {
        res.json({ status: true, message: 'Company Created' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
router.updateCompany = ('/updateCompany/', async (req, res) => {
    try {
        console.log(req.body.id);
        const fData = JSON.parse(JSON.stringify(req.body))
        console.log(fData);
        let comp = await Company.update(fData, {
            where: {
                id: req.body.id
            }
        });
        if (comp) {
            res.json({ status: true, message: 'Company Updated' });
        } else {
            res.json({ status: false, message: 'Something went wrong' });
        }
    }
    catch (err) {
        throw Error(e)
    }
});
router.searchdriver = ('/searchdriver/', async (req, res) => {
    res.render('superadmin/searchdriver', {
        title: 'Search Driver',
    });
});
router.getsearchDriver = async (req, res) => {
   
    // console.log(req.query.search.value);
	let driver_name = req.query.driver_name;
	let driver_license = req.query.driver_license;
    let col = req.query.columns[[0]].column || 'driver.id';
    let direction = req.query.columns[[0]].dir || 'DESC';
    let columns = ['driver.id', 'driver_id', 'driver_name','password','driver_license', 'company_id','c.name'];
    let searchKey = '';
    let where = [];
    // Search Conditions
    if (req.query.search.value) {
        /*if (req.query.search.value != "") {
            where.push({
                [Op.or]: [
                    { 'name': { [Op.like]: `%` + req.query.search.value + `%` } }
                ]
            });
        } else {*/
            where.push({name: {[Op.iLike]: `%${req.body.search.value}%`}});
          //  where.push({ ["name"]: { [Op.like]: `%` + req.query.search.value + `%` } });
        //}
    } else {
        where.push({
            id: {
                [Op.ne]: ""
            }
        });
    }
    // where.push({
    //     active: 0
    // });
	console.log(driver_name);
	if(driver_name!=''){
		where.push({
			driver_name: driver_name
		});
	}
	if(driver_license!=''){
		where.push({
			driver_license: driver_license
		});
	}
    const options = {
        page: ((req.query.start / req.query.length) + 1) || 1,
        paginate: parseInt(req.query.length) || 25,
        order: [[columns, col, direction]],
        attributes: columns,
        raw: true,
        where: where,
		include: [{
            model: db.company,
            as: "c",
            required: false,
            raw: true
        }
        ]
    }
    await DriverCompany.paginate(options).then(function (dt) {
        let data = dt.docs.map(formData);
		
		console.log('fds');
        // function formData(key) {
        function formData(key, index) {
            index = index + 1
            Object.assign(key, {
                slno: index
            });
			console.log(key.company_id);
          
            key.id = key.id;
                key.company_name = key.name;
				
            return key;
        }
        res.json({
            "recordsTotal": data.length,
            "recordsFiltered": dt.total,
            data
        });
    });
};
// router. = async(req, res) =>{ 
router.driver = ('/driver/', async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
    // let getCompanydata  = await Driver.findAll({limit: 5,order: [
    //     ['id', 'DESC']
    // ],raw : true});
    console.log(getCompanydata);
    res.render('superadmin/driver_superadmin', {
        title: 'Manage Driver',
        getCompanydata: getCompanydata
    });
});
router.getDriver = async (req, res) => {
    // console.log('get driver');
    let cmpid = req.query.cmpid;
    // console.log(req.query.columns);
    // console.log(req.query.draw);
    // console.log(req.query.search.value);
    let col = req.query.columns[[0]].column || 'id';
    let direction = req.query.columns[[0]].dir || 'DESC';
    let columns = ['id', 'driver_id', 'driver_name','password','disclaimer_type', 'active'];
    let searchKey = '';
    let where = [];
    // Search Conditions
    if (req.query.search.value) {
        if (req.query.search.value == "") {
            where.push({
                [Op.or]: [
                    { 'driver_name': { [Op.like]: `%` + req.query.search.value + `%` } }
                ]
            });
        } else {
            where.push({ ['driver_name']: { [Op.like]: `%` + req.query.search.value + `%` } });
        }
    } else {
        where.push({
            id: {
                [Op.ne]: ""
            }
        });
    }
    // where.push({
    //     active: 0
    // });
    where.push({
        company_id: cmpid
    });
    const options = {
        page: ((req.query.start / req.query.length) + 1) || 1,
        paginate: parseInt(req.query.length) || 25,
        order: [[columns, col, direction]],
        attributes: columns,
        raw: true,
        where: where
    }
    await Driver.paginate(options).then(function (dt) {
        let data = dt.docs.map(formData);
        // function formData(key) {
        function formData(key, index) {
            index = parseInt(index) + 1 + parseInt(req.query.start)
            Object.assign(key, {
                slno: index
            });
            //0 - active   1 inactive
            if (key.active == 0) {
                Object.assign(key, {
                    active: "<input type='checkbox' id=''  data-id='" + key.id + "' class='activecheckbox' checked/>"
                });
            } else {
                Object.assign(key, {
                    active: "<input type='checkbox' id=''  data-id='" + key.id + "' class='activecheckbox'/>"
                });
            }
            key.id = key.id,
                //key.name = key.name,
                key.name = key.driver_name,
                Object.assign(key, {
                    action: "<a href='javascript:void(0)' data-id='" + key.id + "' id='editmodalid' class='btn  btn-warning editmodalclass'><span class='fas fa-edit'> Edit</span></a>&nbsp;" +
                        "<a href='javascript:void(0)' data-id='" + key.id + "' id='' class='btn btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a>&nbsp; " +
                        "<a href='javascript:void(0)' data-id='" + key.id + "' id='deletedriver' class='btn  btn-danger deletemodalclass'><span class='fas fa-trash'> Delete</span></a>"
                });
            return key;
        }
        res.json({
            "recordsTotal": data.length,
            "recordsFiltered": dt.total,
            data
        });
    });
};
router.editDriver = ('/editDriver/', async (req, res) => {
    //    console.log(req.query);
    let id = req.query.id;
    let getdriver = await Driver.findOne({ where: { id: id }, raw: true });
    // console.log(getdriver);
    if (getdriver) {
        res.json({ status: true, data: getdriver });
    }
    else {
        res.json({ status: false });
    }
});
router.deleteDriver = ('/deleteDriver/', async (req, res) => {
    console.log(req);
    let id = req.body.id;
    let update_year = await Driver.update({ active: 1 }, {
        where: {
            id: id
        }
    });
    if (update_year) {
        res.json({ status: true, message: 'driver Deleted successfully' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
router.updateDriver = ('/updateDriver/', async (req, res) => {
    if (req.body.license_attachment_file != "") {
        let license = 'public/uploads/attachment/license/';
        let licenseData = await fileUpload('license', license, req.body.license_attachment_file, req, res)
        Object.assign(req.body, {
            license_attachment: licenseData // add json element
        });
    }
    if (req.body.cvor_abstract_attachment_file != "") {
        let cvor_abstract = 'public/uploads/attachment/cvor_abstract/';
        let cvor_abstractData = await fileUpload('cvor_abstract', cvor_abstract, req.body.cvor_abstract_attachment_file, req, res)
        Object.assign(req.body, {
            cvor_abstract_attachment: cvor_abstractData // add json element
        });
    }
    if (req.body.psp_attachment_file != "") {
        let psp_attachment = 'public/uploads/attachment/psp/';
        let psp_attachmentData = await fileUpload('psp_attachment', psp_attachment, req.body.psp_attachment_file, req, res)
        Object.assign(req.body, {
            psp_attachment: psp_attachmentData // add json element
        });
    }
    // console.log(req.body);
    // return false
    if (req.body.police_clearance_attachment_file != "") {
        let police_clearance = 'public/uploads/attachment/police_clearance/';
        let police_clearanceData = await fileUpload('police_clearance', police_clearance, req.body.police_clearance_attachment_file, req, res)
        Object.assign(req.body, {
            police_clearance_attachment: police_clearanceData // add json element
        });
    }
    if (req.body.roadtest_attachment_file != "") {
        let roadtest = 'public/uploads/attachment/roadtest/';
        let roadtestData = await fileUpload('roadtest', roadtest, req.body.roadtest_attachment_file, req, res)
        Object.assign(req.body, {
            roadtest_attachment: roadtestData // add json element
        });
    }
    if (req.body.annual_review_attachment_file != "") {
        let annual_review = 'public/uploads/attachment/annual_review/';
        let annual_reviewData = await fileUpload('annual_review', annual_review, req.body.annual_review_attachment_file, req, res)
        Object.assign(req.body, {
            annual_review_attachment: annual_reviewData // add json element
        });
    }
    if (req.body.training_document_attachment_file != "") {
        let training_document = 'public/uploads/attachment/training_document/';
        let training_documentData = await fileUpload('training_document', training_document, req.body.training_document_attachment_file, req, res)
        Object.assign(req.body, {
            training_document_attachment: training_documentData // add json element
        });
    }
    if (req.body.passport_attachment_file != "") {
        let passport_attachment = 'public/uploads/attachment/passport/';
        let passport_attachmentData = await fileUpload('passport_attachment', passport_attachment, req.body.passport_attachment_file, req, res)
        Object.assign(req.body, {
            passport_attachment: passport_attachmentData // add json element
        });
    }
    if (req.body.fast_card_attachment_file != "") {
        let fast_card_attachment = 'public/uploads/attachment/fast_card/';
        let fast_card_attachmentData = await fileUpload('fast_card_attachment', fast_card_attachment, req.body.fast_card_attachment_file, req, res)
        Object.assign(req.body, {
            fast_card_attachment: fast_card_attachmentData // add json element
        });
    }

    let getdriver = await Driver.findOne({ where: { id: req.body.id }, raw: true });
    if (req.body.email != getdriver.email) {
        // console.log('-------------------------------');
        // let password = req.body.driver_license + '-' + req.body.driver_name
        
        var req_license = req.body.driver_license;
        var req_driver_name = req.body.driver_name;
        var password = req_license.slice(req_license.length - 4) + '-' + req_driver_name.slice(0, 3);

        let to = req.body.email
        let userName = req.body.driver_license
        let cc = 'compliancementorzportal@gmail.com'
        let subject = 'Welcome to new portal'
        let message = '<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width,initial-scale=1"> <meta name="x-apple-disable-message-reformatting"> <title></title> <style>table, td, div, h1, p{font-family: Arial, sans-serif;}@media screen and (max-width: 530px){.unsub{display: block; padding: 8px; margin-top: 14px; border-radius: 6px; background-color: #555555; text-decoration: none !important; font-weight: bold;}.col-lge{max-width: 100% !important;}}@media screen and (min-width: 531px){.col-sml{max-width: 27% !important;}.col-lge{max-width: 73% !important;}}</style></head><body style="margin:0;padding:0;word-spacing:normal;background-color:#939297;"> <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297;"> <table role="presentation" style="width:100%;border:none;border-spacing:0;"> <tr> <td align="center" style="padding:0;"> <table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;"> <tr> <td style="padding:40px 30px 30px 30px;text-align:center;font-size:24px;font-weight:bold;"> <a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="165" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> </td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Hi ' + req.body.driver_name + ',</p> <br><p style="margin:0;">Welcome to new portal <a target="_blank" href="https://compliancementorz.ca/driverLogin"> Click here to Login new portal </a>  <br> Your  User Name: ' + userName + ' <br>  Password :' + password + '</td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Thank you,</p><p style="margin:0;">Safety Department  </p><br><a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="90" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> <p style="margin:0;">Tel: 905-486-1666</p><p style="margin:0;">Web: www.compliancementorz.com</p></td></tr><tr> <td style="padding:30px;text-align:center;font-size:12px;background-color:#404040;color:#cccccc;"> <p style="margin:0;font-size:14px;line-height:20px;">&reg; compliancementorz 2022</p></td></tr></table> </td></tr></table> </div></body></html>'
        let newDriverEmail = sendMailGrid(to, cc, subject, message, req, res,'helpdesk@compliancementorz.ca')
        // console.log(newDriverEmail);

    }

console.log('check'+req.body.annualreview);
    const fData = JSON.parse(JSON.stringify(req.body));
    console.log('df'+fData.annualreview);
    let update_driver = await Driver.update(fData, {
        where: {
            id: req.body.id
        }
    });
    if (update_driver) {
        res.json({ status: true, message: 'Driver Updated' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
router.GetDriveralertSuperadmin = ('/GetDriveralertSuperadmin', async (req, res) => {
    console.log('gtest');
    console.log(req.query.exprange);
    let company1;
    if (req.query.exprange == 'expired_list') {
        company1 = await sequelize.query('SELECT d.id,c.name AS companyname,d.driver_name,STR_TO_DATE(d.' + req.query.exptype + ', "%d/%m/%Y") AS ' + req.query.exptype + ' FROM driver AS d JOIN company AS c ON d.company_id = c.id WHERE STR_TO_DATE(d.' + req.query.exptype + ', "%d/%m/%Y") <= DATE(NOW())', {
            raw: true, // pass true here if you have any mapped fields
        });
    } else {
        company1 = await sequelize.query('SELECT d.id,c.name AS companyname,d.driver_name,STR_TO_DATE(d.' + req.query.exptype + ', "%d/%m/%Y") AS ' + req.query.exptype + ' FROM driver AS d JOIN company AS c ON d.company_id = c.id WHERE  STR_TO_DATE(d.' + req.query.exptype + ', "%d/%m/%Y") >= DATE(NOW()) AND STR_TO_DATE(d.' + req.query.exptype + ', "%d/%m/%Y") <= DATE(NOW()) + INTERVAL ' + req.query.exprange + ' DAY;', {
            raw: true, // pass true here if you have any mapped fields
        });
    }
    let data1 = company1[0];
    let data = []
    let sl = 1
    data1.forEach(el => {
        // console.log(el.driver_id);
        el["slno"] = sl;
        data.push(el)
        sl = sl + 1
    });
    // console.log(typeof(data));
    res.json({
        "recordsTotal": data.length,
        "recordsFiltered": data.length,
        data
    });
    // } else if (req.query.exptype == 'passport_expiry') {
    // }
})
router.createDriver = ('/createDriver/', async (req, res) => {
    // console.log('test...');
    console.log(req.body);
	if (req.body.Disclaimer_type == "Yes") {
		req.body.disclaimer = 'Yes';
	}
	else{
		req.body.disclaimer = 'No';
	}
    if (req.body.license_attachment_file != "") {
        let license = 'public/uploads/attachment/license/';
        let licenseData = await fileUpload('license', license, req.body.license_attachment_file, req, res)
        Object.assign(req.body, {
            license_attachment: licenseData // add json element
        });
    }
    if (req.body.cvor_abstract_attachment_file != "") {
        let cvor_abstract = 'public/uploads/attachment/cvor_abstract/';
        let cvor_abstractData = await fileUpload('cvor_abstract', cvor_abstract, req.body.cvor_abstract_attachment_file, req, res)
        Object.assign(req.body, {
            cvor_abstract_attachment: cvor_abstractData // add json element
        });
    }
    if (req.body.psp_attachment_file != "") {
        let psp_attachment = 'public/uploads/attachment/psp/';
        let psp_attachmentData = await fileUpload('psp_attachment', psp_attachment, req.body.psp_attachment_file, req, res)
        Object.assign(req.body, {
            psp_attachment: psp_attachmentData // add json element
        });
    }
    if (req.body.passport_attachment_file != "") {
        let passport_attachment = 'public/uploads/attachment/passport/';
        let passport_attachmentData = await fileUpload('passport_attachment', passport_attachment, req.body.passport_attachment_file, req, res)
        Object.assign(req.body, {
            passport_attachment: passport_attachmentData // add json element
        });
    }
    if (req.body.fast_card_attachment_file != "") {
        let fast_card_attachment = 'public/uploads/attachment/fast_card/';
        let fast_card_attachmentData = await fileUpload('fast_card_attachment', fast_card_attachment, req.body.fast_card_attachment_file, req, res)
        Object.assign(req.body, {
            fast_card_attachment: fast_card_attachmentData // add json element
        });
    }
    // console.log(req.body);
    // return false
    if (req.body.police_clearance_attachment_file != "") {
        let police_clearance = 'public/uploads/attachment/police_clearance/';
        let police_clearanceData = await fileUpload('police_clearance', police_clearance, req.body.police_clearance_attachment_file, req, res)
        Object.assign(req.body, {
            police_clearance_attachment: police_clearanceData // add json element
        });
    }
    if (req.body.roadtest_attachment_file != "") {
        let roadtest = 'public/uploads/attachment/roadtest/';
        let roadtestData = await fileUpload('roadtest', roadtest, req.body.roadtest_attachment_file, req, res)
        Object.assign(req.body, {
            roadtest_attachment: roadtestData // add json element
        });
    }
    if (req.body.annual_review_attachment_file != "") {
        let annual_review = 'public/uploads/attachment/annual_review/';
        let annual_reviewData = await fileUpload('annual_review', annual_review, req.body.annual_review_attachment_file, req, res)
        Object.assign(req.body, {
            annual_review_attachment: annual_reviewData // add json element
        });
    }
    if (req.body.training_document_attachment_file != "") {
        let training_document = 'public/uploads/attachment/training_document/';
        let training_documentData = await fileUpload('training_document', training_document, req.body.training_document_attachment_file, req, res)
        Object.assign(req.body, {
            training_document_attachment: training_documentData // add json element
        });
    }
    let date = new Date();
    var updated_on =
        ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
        ("00" + date.getDate()).slice(-2) + "-" +
        date.getFullYear() + " " +
        ("00" + date.getHours()).slice(-2) + ":" +
        ("00" + date.getMinutes()).slice(-2) + ":" +
        ("00" + date.getSeconds()).slice(-2);
    var req_license = req.body.driver_license;
    var req_driver_name = req.body.driver_name;
    var req_password = req_license.slice(req_license.length - 4) + '-' + req_driver_name.slice(0, 3);
    console.log(req.session);
    Object.assign(req.body, {
        updated_on: updated_on // add json element
    });
    // Object.assign(req.body, {
    //     company_id : req.session.userId // add json element
    // });
    Object.assign(req.body, {
        active: 0 // add json element
    });
    Object.assign(req.body, {
        alert_frequency: 1 // add json element
    });
    Object.assign(req.body, {
        //password: req.body.driver_license + '-' + req.body.driver_name // add json element
        password: req_password // add json element
    });
    const fData = JSON.parse(JSON.stringify(req.body))
    // console.log(req.body.driver_license+'-'+req.body.driver_name);
    let to = req.body.email
    let userName = req.body.driver_license
    let cc = 'compliancementorzportal@gmail.com'
    let subject = 'Welcome to new portal'
    let message = '<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width,initial-scale=1"> <meta name="x-apple-disable-message-reformatting"> <title></title> <style>table, td, div, h1, p{font-family: Arial, sans-serif;}@media screen and (max-width: 530px){.unsub{display: block; padding: 8px; margin-top: 14px; border-radius: 6px; background-color: #555555; text-decoration: none !important; font-weight: bold;}.col-lge{max-width: 100% !important;}}@media screen and (min-width: 531px){.col-sml{max-width: 27% !important;}.col-lge{max-width: 73% !important;}}</style></head><body style="margin:0;padding:0;word-spacing:normal;background-color:#939297;"> <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297;"> <table role="presentation" style="width:100%;border:none;border-spacing:0;"> <tr> <td align="center" style="padding:0;"> <table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;"> <tr> <td style="padding:40px 30px 30px 30px;text-align:center;font-size:24px;font-weight:bold;"> <a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="165" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> </td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Hi ' + req.body.driver_name + ',</p> <br><p style="margin:0;">Welcome to new portal <a target="_blank" href="https://compliancementorz.ca/driverLogin"> Click here to Login new portal </a>  <br> Your  User Name: ' + userName + ' <br>  Password :' + req.body.password + '</td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Thank you,</p><p style="margin:0;">Safety Department  </p><br><a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="90" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> <p style="margin:0;">Tel: 905-486-1666</p><p style="margin:0;">Web: www.compliancementorz.com</p></td></tr><tr> <td style="padding:30px;text-align:center;font-size:12px;background-color:#404040;color:#cccccc;"> <p style="margin:0;font-size:14px;line-height:20px;">&reg; compliancementorz 2022</p></td></tr></table> </td></tr></table> </div></body></html>'
    let newDriverEmail = sendMailGrid(to, cc, subject, message, req, res,'helpdesk@compliancementorz.ca')
    console.log(newDriverEmail);
    if (newDriverEmail) {
        let create_driver = await Driver.create(fData);
        if (create_driver) {
            res.json({ status: true, message: 'Driver Created' });
        } else {
            res.json({ status: false, message: 'Something went wrong' });
        }
        // res.json({ status: true, message: 'Mail sent' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
// Truck crud
router.Truck = async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
    res.render('superadmin/truck_superadmin', {
        title: 'Manage Trucks',
        getCompanydata: getCompanydata
    });
};
router.getTruck = async (req, res) => {
    console.log('get truck');
    let cmpid = req.query.cmpid;
    // console.log(req.query.columns);
    console.log(req.query.draw);
    console.log(req.query.search.value);
    let col = req.query.columns[[0]].column || 'id';
    let direction = req.query.columns[[0]].dir || 'DESC';
    let columns = ['id', 'truck_unit', 'vehicle_type', 'vin_number', 'active'];
    let searchKey = '';
    let where = [];
    // Search Conditions
    if (req.query.search.value) {
        if (req.query.search.value != "") {
            where.push({
                [Op.or]: [
                    { 'truck_unit': { [Op.like]: `%` + req.query.search.value + `%` } }
                ]
            });
            where.push({
                [Op.or]: [
                    { 'vehicle_type': { [Op.like]: `%` + req.query.search.value + `%` } }
                ]
            });
            where.push({
                [Op.or]: [
                    { 'vin_number': { [Op.like]: `%` + req.query.search.value + `%` } }
                ]
            });
        } else {
            where.push({ ['truck_unit']: { [Op.like]: `%` + req.query.search.value + `%` } });
            where.push({ ['vehicle_type']: { [Op.like]: `%` + req.query.search.value + `%` } });
            where.push({ ['vin_number']: { [Op.like]: `%` + req.query.search.value + `%` } });
        }
    } else {
        where.push({
            id: {
                [Op.ne]: ""
            }
        });
    }

    where.push({
        company_id: cmpid
    });
    const options = {
        page: ((req.query.start / req.query.length) + 1) || 1,
        paginate: parseInt(req.query.length) || 25,
        order: [[columns, col, direction]],
        attributes: columns,
        raw: true,
        where: where
    }
    await Truck.paginate(options).then(function (dt) {
        let data = dt.docs.map(formData);
        // function formData(key) {
        function formData(key, index) {
            index = parseInt(index) + 1 + parseInt(req.query.start);
            Object.assign(key, {
                slno: index
            });
            //0 - active   1 inactive
            if (key.active == 0) {
                Object.assign(key, {
                    active: "<input type='checkbox' id=''  data-id='" + key.id + "' class='activecheckbox' checked/>"
                });
            } else {
                Object.assign(key, {
                    active: "<input type='checkbox' id=''  data-id='" + key.id + "' class='activecheckbox'/>"
                });
            }
            key.id = key.id,
                key.name = key.name,

                Object.assign(key, {
                    action: "<a href='javascript:void(0)' data-id='" + key.id + "' id='editmodalid' class='btn  btn-warning editmodalclass'><span class='fas fa-edit'> Edit</span></a>&nbsp;" +
                        "<a href='javascript:void(0)' data-id='" + key.id + "' id='' class='btn  btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a> " +
                        "<a href='javascript:void(0)' data-id='" + key.id + "' id='deletetruck' class='btn  btn-danger deletemodalclass'><span class='fas fa-trash'> Delete</span></a>"
                });
            return key;
        }
        res.json({
            "recordsTotal": data.length,
            "recordsFiltered": dt.total,
            data
        });
    });
};
router.editTruck = ('/editTruck/', async (req, res) => {
    let id = req.query.id;
    let getTruck = await Truck.findOne({ where: { id: id }, raw: true });
    if (getTruck) {
        res.json({ status: true, data: getTruck });
    }
    else {
        res.json({ status: false });
    }
});
router.deleteTruck = ('/deleteTruck/', async (req, res) => {
    console.log(req);
    let id = req.body.id;
    let update_year = await Truck.update({ active: 1 }, {
        where: {
            id: id
        }
    });
    if (update_year) {
        res.json({ status: true, message: 'truck Deleted successfully' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
router.updateTruck = ('/updateTruck/', async (req, res) => {
    if (req.body.annual_safety_current_attachment_file != "") {
        let truck_annual_safety_current = 'public/uploads/attachment/truck_annual_safety_current/';
        let annual_safety_current_attachmentdata = await fileUpload('truck_annual_safety_current', truck_annual_safety_current, req.body.annual_safety_current_attachment_file, req, res)
        Object.assign(req.body, {
            annual_safety_current_attachment: annual_safety_current_attachmentdata // add json element
        });
    } else {
        delete req.body['annual_safety_current_attachment']; // delete json element
    }
    if (req.body.annual_safety_last_attachment_file != "") {
        let truck_annual_safety_last = 'public/uploads/attachment/truck_annual_safety_last/';
        let annual_safety_last_attachmentdata = await fileUpload('truck_annual_safety_last', truck_annual_safety_last, req.body.annual_safety_last_attachment_file, req, res)
        Object.assign(req.body, {
            annual_safety_last_attachment: annual_safety_last_attachmentdata // add json element
        });
    } else {
        delete req.body['annual_safety_last_attachment']; // delete json element
    }
    if (req.body.preventive_maintenance_attachment_file != "") {
        let truck_preventive_maintenance_attachment = 'public/uploads/attachment/truck_preventive_maintenance_attachment/';
        let preventive_maintenance_attachmentdata = await fileUpload('truck_preventive_maintenance_attachment', truck_preventive_maintenance_attachment, req.body.preventive_maintenance_attachment_file, req, res)
        Object.assign(req.body, {
            preventive_maintenance_attachment: preventive_maintenance_attachmentdata // add json element
        });
    } else {
        delete req.body['preventive_maintenance_attachment']; // delete json element
    }
    const fData = JSON.parse(JSON.stringify(req.body))
    let update_truck = await Truck.update(fData, {
        where: {
            id: req.body.id
        }
    });
    if (update_truck) {
        res.json({ status: true, message: 'truck Updated' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
router.createTruck = ('/createTruck/', async (req, res, next) => {
    // console.log('test');
    // console.log(req.body);
    try {
        if (req.body.annual_safety_current_attachment_file != "") {
            let truck_annual_safety_current = 'public/uploads/attachment/truck_annual_safety_current/';
            let annual_safety_current_attachmentdata = await fileUpload('truck_annual_safety_current', truck_annual_safety_current, req.body.annual_safety_current_attachment_file, req, res)
            Object.assign(req.body, {
                annual_safety_current_attachment: annual_safety_current_attachmentdata // add json element
            });
        }
        else {
            delete req.body['annual_safety_current_attachment']; // delete json element
        }
        if (req.body.annual_safety_last_attachment_file != "") {
            let truck_annual_safety_last = 'public/uploads/attachment/truck_annual_safety_last/';
            let annual_safety_last_attachmentdata = await fileUpload('truck_annual_safety_last', truck_annual_safety_last, req.body.annual_safety_last_attachment_file, req, res)
            Object.assign(req.body, {
                annual_safety_last_attachment: annual_safety_last_attachmentdata // add json element
            });
        }
        else {
            delete req.body['annual_safety_last_attachment']; // delete json element
        }
        if (req.body.preventive_maintenance_attachment_file != "") {
            let truck_preventive_maintenance_attachment = 'public/uploads/attachment/truck_preventive_maintenance_attachment/';
            let preventive_maintenance_attachmentdata = await fileUpload('truck_preventive_maintenance_attachment', truck_preventive_maintenance_attachment, req.body.preventive_maintenance_attachment_file, req, res)
            Object.assign(req.body, {
                preventive_maintenance_attachment: preventive_maintenance_attachmentdata // add json element
            });
        } else {
            delete req.body['preventive_maintenance_attachment']; // delete json element
        }
        let date = new Date();
        var updated_on =
            ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
            ("00" + date.getDate()).slice(-2) + "-" +
            date.getFullYear() + " " +
            ("00" + date.getHours()).slice(-2) + ":" +
            ("00" + date.getMinutes()).slice(-2) + ":" +
            ("00" + date.getSeconds()).slice(-2);
        console.log(req.session);
        Object.assign(req.body, {
            updated_on: updated_on // add json element
        });
        // Object.assign(req.body, {
        //     company_id: req.body.company_id // add json element
        // });
        const fData = JSON.parse(JSON.stringify(req.body))
        let update_truck = await Truck.create(fData);
        if (update_truck) {
            res.json({ status: true, message: 'truck created' });
        } else {
            res.json({ status: false, message: 'Something went wrong' });
        }
    }
    catch (error) {
        throw error;
    }
});
// Trailer crud
router.Trailer = async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
    res.render('superadmin/trailer_superadmin', {
        title: 'Manage Trailers',
        getCompanydata: getCompanydata
    });
};
router.getTrailer = async (req, res) => {
    console.log('get trailer');
    let cmpid = req.query.cmpid;
    console.log(cmpid);
    // console.log(req.query.columns);
    console.log(req.query.draw);
    console.log(req.query.search.value);
    let col = req.query.columns[[0]].column || 'id';
    let direction = req.query.columns[[0]].dir || 'DESC';
    let columns = ['id', 'trailer_unit', 'vehicle_type', 'vin_number', 'active'];
    let searchKey = '';
    let where = [];
    // Search Conditions
    if (req.query.search.value) {
        if (req.query.search.value != "") {
            where.push({
                [Op.or]: [
                    { 'name': { [Op.like]: `%` + req.query.search.value + `%` } }
                ]
            });
        } else {
            where.push({ ['name']: { [Op.like]: `%` + req.query.search.value + `%` } });
        }
    } else {
        where.push({
            id: {
                [Op.ne]: ""
            }
        });
    }

    where.push({
        company_id: cmpid
    });
    const options = {
        page: ((req.query.start / req.query.length) + 1) || 1,
        paginate: parseInt(req.query.length) || 25,
        order: [[columns, col, direction]],
        attributes: columns,
        raw: true,
        where: { company_id: cmpid }
    }
    await Trailer.paginate(options).then(function (dt) {
        let data = dt.docs.map(formData);
        // function formData(key) {
        function formData(key, index) {
            index = parseInt(index) + 1 + parseInt(req.query.start)
            Object.assign(key, {
                slno: index
            });
            //0 - active   1 inactive
            if (key.active == 0) {
                Object.assign(key, {
                    active: "<input type='checkbox' id=''  data-id='" + key.id + "' class='activecheckbox' checked/>"
                });
            } else {
                Object.assign(key, {
                    active: "<input type='checkbox' id=''  data-id='" + key.id + "' class='activecheckbox'/>"
                });
            }
            key.id = key.id,
                key.name = key.name,

                Object.assign(key, {
                    action: "<a href='javascript:void(0)' data-id='" + key.id + "' id='editmodalid' class='btn  btn-warning editmodalclass'><span class='fas fa-edit'> Edit</span></a>&nbsp;" +
                        "<a href='javascript:void(0)' data-id='" + key.id + "' id='' class='btn  btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a> " +
                        "<a href='javascript:void(0)' data-id='" + key.id + "' id='deletetrailer' class='btn  btn-danger deletemodalclass'><span class='fas fa-trash'> Delete</span></a>"
                });
            return key;
        }
        res.json({
            "recordsTotal": data.length,
            "recordsFiltered": dt.total,
            data
        });
    });
};
router.editTrailer = ('/editTrailer/', async (req, res) => {
    let id = req.query.id;
    console.log(id);
    let getTrailer = await Trailer.findOne({ where: { id: id }, raw: true });
    console.log(getTrailer);
    if (getTrailer) {
        res.json({ status: true, data: getTrailer });
    }
    else {
        res.json({ status: false });
    }
});
router.deleteTrailer = ('/deleteTrailer/', async (req, res) => {
    console.log(req);
    let id = req.body.id;
    let update_year = await Trailer.update({ active: 1 }, {
        where: {
            id: id
        }
    });
    if (update_year) {
        res.json({ status: true, message: 'trailer Deleted successfully' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
// Traier crud
router.updateTrailer = ('/updateTrailer/', async (req, res) => {
    if (req.body.annual_safety_current_attachment_file != "") {
        let trailer_annual_safety_current = 'public/uploads/attachment/trailer_annual_safety_current/';
        let annual_safety_current_attachmentdata = await fileUpload('trailer_annual_safety_current', trailer_annual_safety_current, req.body.annual_safety_current_attachment_file, req, res)
        Object.assign(req.body, {
            annual_safety_current_attachment: annual_safety_current_attachmentdata // add json element
        });
    } else {
        delete req.body['annual_safety_current_attachment']; // delete json element
    }
    if (req.body.annual_safety_last_attachment_file != "") {
        let trailer_annual_safety_last = 'public/uploads/attachment/trailer_annual_safety_last/';
        let annual_safety_last_attachmentdata = await fileUpload('trailer_annual_safety_last', trailer_annual_safety_last, req.body.annual_safety_last_attachment_file, req, res)
        Object.assign(req.body, {
            annual_safety_last_attachment: annual_safety_last_attachmentdata // add json element
        });
    } else {
        delete req.body['annual_safety_last_attachment']; // delete json element
    }
    const fData = JSON.parse(JSON.stringify(req.body))
    let update_trailer = await Trailer.update(fData, {
        where: {
            id: req.body.id
        }
    });
    if (update_trailer) {
        res.json({ status: true, message: 'trailer Updated' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
router.createTrailer = ('/createTrailer/', async (req, res, next) => {
    if (req.body.annual_safety_current_attachment_file != "") {
        console.log(1);
        let trailer_annual_safety_current = 'public/uploads/attachment/trailer_annual_safety_current/';
        let annual_safety_current_attachmentdata = await fileUpload('trailer_annual_safety_current', trailer_annual_safety_current, req.body.annual_safety_current_attachment_file, req, res)
        Object.assign(req.body, {
            annual_safety_current_attachment: annual_safety_current_attachmentdata // add json element
        });
    }
    // else{
    //     delete req.body['annual_safety_current_attachment']; // delete json element
    // }
    if (req.body.annual_safety_last_attachment_file != "") {
        console.log(2);
        let trailer_annual_safety_last = 'public/uploads/attachment/trailer_annual_safety_last/';
        let annual_safety_last_attachmentdata = await fileUpload('trailer_annual_safety_last', trailer_annual_safety_last, req.body.annual_safety_last_attachment_file, req, res)
        Object.assign(req.body, {
            annual_safety_last_attachment: annual_safety_last_attachmentdata // add json element
        });
    }
    // else{
    //     delete req.body['annual_safety_last_attachment']; // delete json element
    // }
    if (req.body.preventive_maintenance_attachment_file != "") {
        console.log(3);
        let trailer_preventive_maintenance_attachment = 'public/uploads/attachment/trailer_preventive_maintenance_attachment/';
        let preventive_maintenance_attachmentdata = await fileUpload('trailer_preventive_maintenance_attachment', trailer_preventive_maintenance_attachment, req.body.preventive_maintenance_attachment_file, req, res)
        Object.assign(req.body, {
            preventive_maintenance_attachment: preventive_maintenance_attachmentdata // add json element
        });
    } else {
        delete req.body['preventive_maintenance_attachment']; // delete json element
    }
    let date = new Date();
    var updated_on =
        ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
        ("00" + date.getDate()).slice(-2) + "-" +
        date.getFullYear() + " " +
        ("00" + date.getHours()).slice(-2) + ":" +
        ("00" + date.getMinutes()).slice(-2) + ":" +
        ("00" + date.getSeconds()).slice(-2);
    console.log(req.session);
    Object.assign(req.body, {
        updated_on: updated_on // add json element
    });
    // Object.assign(req.body, {
    //     company_id: req.session.userId // add json element
    // });
    const fData = JSON.parse(JSON.stringify(req.body))
    let update_trailer = await Trailer.create(fData);
    if (update_trailer) {
        res.json({ status: true, message: 'trailer created' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
// ---------------------------Driver details form part A-----------------------------
router.updateDriverDetailsForm = async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
    res.render('superadmin/updateDriverDetailsForm', {
        title: 'Manage Driver Details',
        getCompanydata: getCompanydata
    });
};
router.getupdateDriverDetailsForm = async (req, res) => {
    console.log('get updateDriverDetailsForm');
    let cmpid = req.query.cmpid;
    console.log(cmpid);
    // console.log(req.query.columns);
    console.log(req.query.draw);
    console.log(req.query.search.value);
    let col = req.query.columns[[0]].column || 'id';
    let direction = req.query.columns[[0]].dir || 'DESC';
    let columns = ['id', 'firstName', 'DOA', 'comment', 'driverId'];
    let searchKey = '';
    let where = [];
    // Search Conditions
    if (req.query.search.value) {
        if (req.query.search.value != "") {
            console.log('sfdsdfsf');
            /*where.push({
                [Op.or]: [
                    { 'firstName': { [Op.like]: `%` + req.query.search.value + `%` } }
                ]
            });*/
            where.push({ ['firstName']: { [Op.like]: `%` + req.query.search.value + `%` } });
            
        } else {
            where.push({ ['firstName']: { [Op.like]: `%` + req.query.search.value + `%` } });
        }
    } else {
        where.push({
            id: {
                [Op.ne]: ""
            }
        });
    }
    /*where.push({
        active: 0
    });*/
    where.push({
        company_id: cmpid
    });
    console.log(where);
    const options = {
        page: ((req.query.start / req.query.length) + 1) || 1,
        paginate: parseInt(req.query.length) || 25,
        order: [[columns, col, direction]],
        attributes: columns,
        raw: true,
        where: where
    }
    await Driverdetails.paginate(options).then(function (dt) {
        let data = dt.docs.map(formData);
        // function formData(key) {
        function formData(key, index) {
            index = parseInt(index) + 1  + parseInt(req.query.start)
            Object.assign(key, {
                slno: index
            });
            console.log(key);
            key.driverId = key.driverId,
                key.firstName = key.firstName,
                Object.assign(key, {
                    action: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='editmodalid' class='btn  btn-warning editmodalclass'><span class='fas fa-edit'> Edit</span></a>&nbsp;" +
                        "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='viewmodalid' class='btn  btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a> " +
                        "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='deletedriverDtls' class='btn  btn-danger deletemodalclass'><span class='fas fa-trash'> Delete</span></a>" +
                        "<a href='javascript:void(0)' data-id='" + key.driverId + "' class='btn  btn-primary viewmodalclassaddress'><span class='fas fa-search'> View Address</span></a> "
                });
            return key;
        }
        res.json({
            "recordsTotal": data.length,
            "recordsFiltered": dt.total,
            data
        });
    });
};
router.superadmingetDriverDetails = ('.superadmingetDriverDetails/', async (req, res, next) => {
    let id = req.query.id;
    let tableData;
    // console.log(id);
    // let id = 788
    let getDtls = await Driveraddress.findAll({ where: { driverId: id }, raw: true });
    //Sort array by date
    getDtls.sort(function (a, b) {
        return new Date(a.driverToDate) - new Date(b.driverToDate)
    })
    if (getDtls) {
        await getDtls.forEach(function (getDetails, i) {
            // console.log(getDtls);
            // console.log(getDtls.driverId);
            let prvTo;
            let gap = '';
            let gapdata
            let currFrom = getDetails.driverFromDate
            if (i >= 1) {
                prvTo = getDtls[i - 1].driverToDate;
            } else {
                prvTo = '';
            }
            if (prvTo != "undefined" && prvTo != "") {
                console.log('prev' + prvTo);
                console.log(getDetails.driverFromDate);
                gap = getMonthDifferenceFunction(new Date(prvTo), new Date(getDetails.driverFromDate), req, res)
                gapdata = (gap >= 0) ? 0 : gap
            }
            console.log(getDtls);
            // gap =  getMonthDifferenceFunction(new Date(getDetails.driverFromDate),new Date(getDetails.driverToDate), req, res)
            if (gap >= 1 && gap != "undefined") {
                tableData += '<tr style="background-color: #e7000021;"><td>' + getDetails.driverAddress + '</td><td>' + getDetails.driverCity + '</td><td>' + getDetails.driverState + '</td><td>' + getDetails.driverCountry + '</td><td>' + getDetails.driverProvince + '</td><td>' + getDetails.driverPostalCode + '</td><td>' + getDetails.driverFromDate + '</td><td>' + getDetails.driverToDate + '</td><td>' + gap + '</td><td><a href="javascript:void(0)" data-prvTo=' + prvTo + ' data-currFrom=' + currFrom + ' data-id=' + getDetails.id + ' data-company_id=' + getDetails.company_id + ' data-driverId=' + getDetails.driverId + ' id="addmodalidaddress" class="btn btn-success addmodalclassaddress"<span class="fas fa-edit">Add</span></a></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="editmodalidaddress" class="btn btn-warning editmodalclassaddress"<span class="fas fa-edit"> Edit</span></a></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="deletemodalidaddress" class="btn btn-danger deletemodalclassaddress"<span class="fas fa-edit">Delete</span></a></td></tr>';
                // tableData += '<tr class="gap"><td colspan="9">'+gap+'Gap</td></tr>';
            } else {
                tableData += '<tr><td>' + getDetails.driverAddress + '</td><td>' + getDetails.driverCity + '</td><td>' + getDetails.driverState + '</td><td>' + getDetails.driverCountry + '</td><td>' + getDetails.driverProvince + '</td><td>' + getDetails.driverPostalCode + '</td><td>' + getDetails.driverFromDate + '</td><td>' + getDetails.driverToDate + '</td><td></td><td></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="editmodalidaddress" class="btn btn-warning editmodalclassaddress"<span class="fas fa-edit"> Edit</span></a></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="deletemodalidaddress" class="btn btn-danger deletemodalclass"<span class="fas fa-edit">Delete</span></a></td></tr>';
            }
        });
        // console.log(fData);
        console.log(tableData);
        res.json({ status: true, data: tableData });
    }
    else {
        res.json({ status: false });
    }
});
router.deleteDriverDetails = ('/deleteDriverDetails/', async (req, res) => {
    console.log(req);
    let id = req.body.id;
    let deleteDriverDtls = await Driverdetails.destroy({
        where: { driverId: id }
    });
    if (deleteDriverDtls) {
        res.json({ status: true, message: 'Driver Details Deleted successfully' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
router.superadminapproveDriver = ('/superadminapproveDriver/', async (req, res) => {
    console.log(req);
    let id = req.body.id;
    let approve = await Driverdetails.update({ approveStatus: 1 }, {
        where: {
            driverId: id
        }
    });
    if (approve) {
        res.json({ status: true, message: 'Approved successfully' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
// ---------------------------Driver details form part A----------------------------- end
// ---------------------------Employee histroy part B-----------------------------
router.updateemploymenthistoryFormSuperadmin = async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
    res.render('superadmin/updateemploymenthistoryFormSuperadmin', {
        title: 'Manage Employment History',
        getCompanydata: getCompanydata
    });
};
router.getupdateemploymenthistoryFormSuperadmin = async (req, res) => {
    console.log('get updateemploymenthistoryFormSuperadmin');
    let cmpid = req.query.cmpid;
    console.log(cmpid);
    // console.log(req.query.columns);
    console.log(req.query.draw);
    console.log(req.query.search.value);
    let col = req.query.columns[[0]].column || 'd.id';
    let direction = req.query.columns[[0]].dir || 'DESC';
    let columns = ['id', 'driverId', 'd.driver_name'];
    let searchKey = '';
    let where = [];
    let where1 = [];
    // Search Conditions
    if (req.query.search.value) {
        if (req.query.search.value == "") {
            /*where.push({
                [Op.or]: [
                    { 'employerName': { [Op.like]: `%` + req.query.search.value + `%` } }
                ]
            });*/
            where1.push({ ['driver_name']: { [Op.like]: `%` + req.query.search.value + `%` } });
        } else {
            where1.push({ ['driver_name']: { [Op.like]: `%` + req.query.search.value + `%` } });
        }
    } else {
        where.push({
            id: {
                [Op.ne]: ""
            }
        });
    }
    where1.push({
        active: 0
    });
    where.push({
        company_id: cmpid
    });
    const options = {
        page: ((req.query.start / req.query.length) + 1) || 1,
        paginate: parseInt(req.query.length) || 25,
        order: [[columns, col, direction]],
        attributes: columns,
        raw: true,
        where: { company_id: cmpid },
        include: [{
            model: db.driver,
            as: "d",
            required: true,
            // attributes : ['categories_name'],
            where: where1,
            raw: true
        }
        ]
    }
    await Employmenthistory.paginate(options).then(function (dt) {
        let data = dt.docs.map(formData);
        // function formData(key) {
        function formData(key, index) {
            index = parseInt(index) + 1 + parseInt(req.query.start)
            Object.assign(key, {
                slno: index
            });
            console.log(key);
            key.driverId = key.driverId,
                key.employerName = key.employerName,
                Object.assign(key, {
                    // action: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='editmodalid' class='btn  btn-warning editmodalclass'><span class='fas fa-edit'> Edit</span></a>&nbsp;" +
                    //     "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='viewmodalid' class='btn  btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a> " +
                    //     "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='deletedriverDtls' class='btn  btn-danger deletemodalclass'><span class='fas fa-trash'> Delete</span></a>" +
                    //     "<a href='javascript:void(0)' data-id='" + key.driverId + "' class='btn  btn-primary viewmodalclassaddress'><span class='fas fa-search'> View Address</span></a> "
                    action: "<a href='javascript:void(0)' data-id='" + key.driverId + "' class='btn  btn-primary viewmodalclassaddress'><span class='fas fa-search'> View / Edit Employment History</span></a> "
                });
            return key;
        }
        res.json({
            "recordsTotal": data.length,
            "recordsFiltered": dt.total,
            data
        });
    });
};
router.superadmingetemploymenthistory = ('.superadmingetemploymenthistory/', async (req, res, next) => {
    let id = req.query.id;
    let tableData;
    // console.log(id); 
    // let id = 788
    let getDtls = await Employementhistroyaddress.findAll({ where: { driverId: id }, raw: true });
    
    let driverId;
    let company_id;
    let doa;
    let driverdetails =  await Driverdetails.findOne({where:{driverId:id},limit: 1, order: [['id', 'DESC']], raw: true});
    console.log(driverdetails);
    if(driverdetails && driverdetails.DOA && driverdetails.DOA != null && driverdetails.DOA!=''){
    let ddate  = new Date(driverdetails.DOA);
        doa    = ddate.getFullYear() + "-" + ("0"+(ddate.getMonth()+1)).slice(-2) + "-" + ("0"+ddate.getDate()).slice(-2);
    }
    else{
    let d = new Date();
    doa   = d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0"+d.getDate()).slice(-2);
    }
    console.log('driver: '+doa);
    //Sort array by date
    getDtls.sort(function (a, b) {
        return new Date(a.toDate) - new Date(b.toDate)
    })
    if (getDtls) {
        let historyLength = getDtls.length-1;
        await getDtls.forEach(function (getDetails, i) {
            // console.log(getDtls);
            driverId = getDetails.driverId;
            company_id = getDetails.company_id;
          
            //console.log(doa);
            let prvTo;
            let gap = '';
            let gapdata
            let currFrom = getDetails.fromDate
            if (i >= 1) {
                prvTo = getDtls[i - 1].toDate;
            } else {
                prvTo = '';
            }
            
            if (prvTo != "undefined" && prvTo != "") {
              //  console.log('prev: ' + prvTo);
               // console.log('from Date: '+getDetails.fromDate);
                gap = getMonthDifferenceFunction(new Date(prvTo), new Date(getDetails.fromDate), req, res)
                gapdata = (gap >= 0) ? 0 : gap
            }
            if ( i == historyLength) {
                gap = getMonthDifferenceFunction(new Date(getDetails.toDate), new Date(doa), req, res)
                prvTo       = getDetails.toDate;
                currFrom    = doa;
            
            }
            // gap =  getMonthDifferenceFunction(new Date(getDetails.fromDate),new Date(getDetails.toDate), req, res)
            if (gap >= 1 && gap != "undefined") {
                tableData += '<tr style="background-color: #e7000021;"><td>' + getDetails.employerName + '</td><td>' + getDetails.employerAddress + '</td><td>' + getDetails.employerPosition + '</td><td>' + getDetails.employerContactPerson + '</td><td>' + getDetails.employerContactPersonNumber + '</td><td>' + getDetails.employerContactPersonEmail + '</td><td>' + getDetails.jobDesignated + '</td><td>' + getDetails.fmcrs + '</td><td>' + getDetails.fromDate + '</td><td>' + getDetails.toDate + '</td><td>' + gap + '</td><td><a href="javascript:void(0)" data-prvTo=' + prvTo + ' data-currFrom=' + currFrom + ' data-id=' + getDetails.id + ' data-company_id=' + getDetails.company_id + ' data-driverId=' + getDetails.driverId + ' id="addmodalidaddress" class="btn btn-success addmodalclassaddress"<span class="fas fa-edit">Add</span></a></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="editmodalidaddress" class="btn btn-warning editmodalclassaddress"<span class="fas fa-edit"> Edit</span></a></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="deletemodalidaddress" class="btn btn-danger deletemodalclassaddress"<span class="fas fa-edit">Delete</span></a></td></tr>';
                // tableData += '<tr class="gap"><td colspan="9">'+gap+'Gap</td></tr>';
            } else {
                tableData += '<tr><td>' + getDetails.employerName + '</td><td>' + getDetails.employerAddress + '</td><td>' + getDetails.employerPosition + '</td><td>' + getDetails.employerContactPerson + '</td><td>' + getDetails.employerContactPersonNumber + '</td><td>' + getDetails.employerContactPersonEmail + '</td><td>' + getDetails.jobDesignated + '</td><td>' + getDetails.fmcrs + '</td><td>' + getDetails.fromDate + '</td><td>' + getDetails.toDate + '</td><td></td><td></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="editmodalidaddress" class="btn btn-warning editmodalclassaddress"<span class="fas fa-edit"> Edit</span></a></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="deletemodalidaddress" class="btn btn-danger deletemodalclass"<span class="fas fa-edit">Delete</span></a></td></tr>';
            }
        });
        // console.log(driverId);
        //console.log(tableData);
        res.json({ status: true, data: tableData, driverId: driverId, company_id: company_id });
    }
    else {
        res.json({ status: false, driverId: driverId });
    }
});
router.deleteemploymenthistoryAddress = ('/deleteemploymenthistoryAddress/', async (req, res) => {
    console.log(req);
    let id = req.body.id;
    let deleteDriverDtls = await Employementhistroyaddress.destroy({
        where: { driverId: id }
    });
    if (deleteDriverDtls) {
        res.json({ status: true, message: 'Details Deleted successfully' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
router.superadminemploymenthistory = ('/superadminemploymenthistory/', async (req, res) => {
    console.log(req);
    let id = req.body.id;
    let approve = await Employementhistroyaddress.update({ approveStatus: 1 }, {
        where: {
            driverId: id
        }
    });
    if (approve) {
        res.json({ status: true, message: 'Approved successfully' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
router.superadminapproveemploymenthistory = ('/superadminapproveemploymenthistory/', async (req, res) => {
    console.log(req);
    let id = req.body.id;
    let approve = await Employmenthistory.update({ approveStatus: 1 }, {
        where: {
            driverId: id
        }
    });
    if (approve) {
        res.json({ status: true, message: 'Approved successfully' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
// ---------------------------Employee histroy part B----------------------------- end
// ---------------------------Driving histroy part C-----------------------------
router.updatedrivingHistoryFormSuperadmin = async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
    res.render('superadmin/updateDrivinghistoryFormSuperadmin', {
        title: 'Manage Driving History',
        getCompanydata: getCompanydata
    });
};
router.hosSuperadmin = async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
    res.render('superadmin/hosSuperadmin', {
        title: 'Manage Hours of Service',
        getCompanydata: getCompanydata
    });
};
router.generateReportPageSuperadmin = async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
    res.render('superadmin/generateReportPageSuperadmin', {
        title: 'Manage Generate Report',
        getCompanydata: getCompanydata
    });
};
router.generateReportPage = async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
    res.render('superadmin/generateReport', {
        title: 'Manage Generate Report',
        getCompanydata: getCompanydata
    });
};
router.generateReport = async (req, res) => {
    // var html = '<div class="card-body" id="updateEmployment_details"> <div style="text-align: center;"> <span> <h3> Motor 11111 Vehicle Drivers Certification of Compliance </h3> </span> </div><br><div class="row"> <div class="col-md-12"> <input type="hidden" name="company_id" id="company_id" value="1"> <input type="hidden" name="driverId" id="driverId" value="840"> <p align="justify">MOTOR CARRIER INSTRUCTIONS: The requirements in Part383 apply to every driver who operates in intrastate, interstate, or foreign commerce and operates a vehicle weighing 26,001 pounds or more, can transport more than 15 people, or transports hazardous materials that require placarding.</p><p align="justify"> The requirements in Part 391 apply to every driver who operates in interstate commerce and operates a vehicle weighing 10,001 pounds or more, can transport more than 15 people, or transports hazardous materials that require placarding. </p><h4> DRIVER REQUIREMENTS:</h4> <p align="justify">Parts 383 and 391 of the Federal Motor Carrier Safety Regulations contain some requirements that you, as a driver must comply with. These requirements are in effect as of July 1, 1987. They are as follows: </p><h4>1. POSSESS ONLY ONE LICENSE:</h4> <p align="justify"> You, as a commercial vehicle driver, may not possess more than one license. If you currently have more than one license, you should keep the license from your state of residence and return the additional licenses to the states that issued them. DESTROYING a license does not close the record in the state that issued it; you must notify the state. If a multiple license has been lost, stolen, or destroyed, you should close your record by notifying the state of issuance that you no longer want to be licensed by that state. </p><h4> 2. NOTIFICATION OF LICENSE SUSPENSION, REVOCATION OR CANCELLATION: </h4> <p align="justify"> Sections 392.42 and 383.33 of the Federal Motor Carrier Safety Regulations require that you notify your employer the next business day of any revocation or suspension of your drivers license. In addition, section 383.31 requires that any time you violate a state or local traffic law (other than parking), you must report it within 30 days to: 1) your employing motor carrier and 2) the state that issued your license (if the violation occurs in a state other than the one which issued your license).The notification to both the employer and state must be in Writing. </p><h4> The following license is the only one I will possess:</h4> <b>Drivers Name (Printed)</b>: mtest1601<br><b>Drivers License No:</b> mtest1601 <br><b>Exp Date:</b> <br><h4></h4>DRIVER CERTIFICATION:<br><b>Drivers Name:</b> mtest1601<br><b>Drivers Signature:</b> <img src="https://www.w3schools.com/images/lamp.jpg" alt="Lamp" width="32" height="32"> <br><b>Date:</b> 07-01-2022 15:42:13<br><input class="form-check-input" id="Iagree" name="Iagree" type="checkbox" value="1"> I certify that I have read and understood the above requirements. </div></div></div>';
    // var options = { base: 'file' };
    // pdf.create(html, options).toFile('businesscard.pdf', function(err, res) {
    //   if (err) return console.log(err);
    //   console.log(res); // { filename: '/app/businesscard.pdf' }
    // });
    // let htmlData = '<div>the html code</div>';
    // var html = htmlToPdfMake(htmlData, { window: window });
    // var docDefinition = {
    //     content: [
    //         html
    //     ]
    // };
    // //Generating random text 
    // let r1 = (Math.random() + 1).toString(36).substring(7);
    // let r2 = (Math.random() + 1).toString(36).substring(7);
    // let randomText = r1 + r2;
    // var pdfDocGenerator = pdfMake.createPdf(docDefinition);
    // pdfDocGenerator.getBuffer(function (buffer) {
    //     fs.writeFileSync('public/uploads/attachment/' + randomText + '.pdf', buffer);
    // });
    // if (pdfDocGenerator) {
    //     res.json({ status: true, fileName: randomText });
    // }
    // else {
    //     res.json({ status: false });
    // }
};
router.hosCompany = async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
    res.render('hosCompany', {
        title: 'Manage Hours of Service',
        getCompanydata: getCompanydata,
        company_id: req.session.userId
    });
};
router.gethosSuperadmin = async (req, res) => {
    console.log('get gethosSuperadmin');
    let cmpid = req.query.cmpid;
    console.log(cmpid);
    // console.log(req.query.columns);
    console.log(req.query.draw);
    console.log(req.query.search.value);
    let col = req.query.columns[[0]].column || 'id';
    let direction = req.query.columns[[0]].dir || 'DESC';
    let columns = ['id', 'firstName', 'company_id', 'driverId'];
    let searchKey = '';
    let where = [];
    // Search Conditions
    if (req.query.search.value) {
        if (req.query.search.value != "") {
            where.push({
                [Op.or]: [
                    { 'firstName': { [Op.like]: `%` + req.query.search.value + `%` } }
                ]
            });
        } else {
            where.push({ ['firstName']: { [Op.like]: `%` + req.query.search.value + `%` } });
        }
    } else {
        where.push({
            id: {
                [Op.ne]: ""
            }
        });
    }
   /* where.push({
        active: 0
    });*/
    where.push({
        company_id: cmpid
    });
    const options = {
        page: ((req.query.start / req.query.length) + 1) || 1,
        paginate: parseInt(req.query.length) || 25,
        order: [[columns, col, direction]],
        attributes: columns,
        raw: true,
        where:where
       // where: { company_id: cmpid }
    }
    let gethosdtls1;
    await Driverdetails.paginate(options).then(function (dt) {
        let data = dt.docs.map(formData);
        // function formData(key) {
        function formData(key, index) {
            gethosdtls1 =  Hos.findOne({ where: { driverId: key.driverId }, raw: true });
            console.log(key.driverId+'hos data'+gethosdtls1);
            index = parseInt(index) + 1 + parseInt(req.query.start)
            Object.assign(key, {
                slno: index
            });
            console.log(key);
            key.driverId = key.driverId;
                key.company_id = key.company_id;
                key.firstName = key.firstName;
                //Hos.findAll({ where: { driverId: driverId }, raw: true });
                
                if(gethosdtls1){
                    Object.assign(key, {
                        action: "<a href='javascript:void(0)' data-driverId='" + key.driverId + "'  data-company_id='" + key.company_id + "' id='editmodalid' class='btn  btn-primary editmodalclass'><span class='mdi mdi-account-search'> View HOS Report</span></a>&nbsp;"
                    });
                  
                }
                else{
                    Object.assign(key, {
                        action: "<a href='javascript:void(0)' data-driverId='" + key.driverId + "'  data-company_id='" + key.company_id + "' id='addmodalid' class='btn  btn-primary addmodalclass'><span class='mdi mdi-account-search'> Add HOS Report</span></a>&nbsp;"
                    });
                }
            return key;
        }
        res.json({
            "recordsTotal": data.length,
            "recordsFiltered": dt.total,
            data
        });
    });
};
router.generateReportCompany = async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
    res.render('generateReportCompany', {
        title: 'Manage Generate Report',
        getCompanydata: getCompanydata,
        company_id: req.session.userId
    });
};
router.getgenerateReportCompany = async (req, res) => {
    console.log('get gethosSuperadmin');
    let cmpid = req.query.cmpid;
    // console.log(cmpid);
    // console.log(req.query.columns);
    // console.log(req.query.draw);
    // console.log(req.query.search.value);
    let col = req.query.columns[[0]].column || 'id';
    let direction = req.query.columns[[0]].dir || 'DESC';
    let columns = ['id', 'firstName', 'company_id', 'driverId'];
    let searchKey = '';
    let where = [];
    console.log(req.query.search);
    // Search Conditions
    if (req.query.search.value) {
        if (req.query.search.value != "") {
            where.push({
                [Op.or]: [
                    { 'firstName': { [Op.like]: `%` + req.query.search.value + `%` } }
                ]
            });
        } else {
            where.push({ ['firstName']: { [Op.like]: `%` + req.query.search.value + `%` } });
        }
    } else {
        where.push({
            id: {
                [Op.ne]: ""
            }
        });
    }
    /*where.push({
        active: 0
    });*/
    where.push({
        company_id: cmpid
    });
    console.log(where);
    const options = {
        page: ((req.query.start / req.query.length) + 1) || 1,
        paginate: parseInt(req.query.length) || 25,
        order: [[columns, col, direction]],
        attributes: columns,
        raw: true,
        where: where
    }
    let dropdownvalue = "";
    let getchecklist = await Companychecklist.findOne({ where: { company_id: cmpid }, raw: true });
    console.log('checklist1'+getchecklist.flatbed_checklists);
    console.log('checklist2'+getchecklist.orientation_Checklists);
    console.log('checklist3'+getchecklist.dry_van_checklists);
    await Driverdetails.paginate(options).then(function (dt) {
        let data = dt.docs.map(formData);
        // function formData(key) {
        function formData(key, index) {
            index = parseInt(index) + 1 + parseInt(req.query.start)
            Object.assign(key, {
                slno: index
            });
            //console.log(key);
            key.driverId = key.driverId,
                key.company_id = key.company_id,
                key.firstName = key.firstName,
                dropdownvalue ="<select class='form-select selectboxcss1' data-driverId='" + key.driverId + "'  data-company_id='" + key.company_id + "' id='pdfGenerate'><option value=''>Select form to export</option><option value='PersonalDetails'>Personal Information</option><option value='employmentHistory'>Employment History</option><option value='drivingHistory'>Driving History</option><option value='motorvehicleCertificate'>Motor Vehicle Certificate</option><option value='medicalDecleration'>Medical Decleration Certificate</option><option value='driverAcknowledgement'>Driver Acknowledgement</option><option value='PSPDisclosure'>PSP Disclosure</option><option value='clearingHouseConsent'>Clearing House Consent</option><option value='compensatedWork'>Compensated Work</option><option value='drugAndAlcohol'>DrugAndAlcohol</option><option value='HOS'>Hos</option><option value='QuestionOne'>Interview Questions</option><option value='QuestionTwo'>Driver Manual</option><option value='Canadahos'>HOS Questionnaire for Canada SOUTH Regulations</option><option value='ushos'>HOS Questionnaire for US</option>";
                if(getchecklist && getchecklist.flatbed_checklists)
                    dropdownvalue = dropdownvalue +"<option value='flatbed_checklist'>Flabted Check List</option>";
                if(getchecklist && getchecklist.orientation_Checklists)
                    dropdownvalue = dropdownvalue +"<option value='orientation_checklist'>Dry Van Check List</option>";
                if(getchecklist && getchecklist.dry_van_checklists)
                    dropdownvalue = dropdownvalue +"<option value='dry_van_checklist'>Dump Truck Check List</option>";

                dropdownvalue = dropdownvalue +"<option value='disclaimer'>Disclaimer</option><option value='weightDimensions'>Weight & Dimensions</option><option value='safetyLaws'>Safety Laws Quiz</option><option value='annualReview'>U. S. DEPARTMENT OF TRANSPORTATION MOTOR CARRIER SAFETY PROGRAM ANNUAL REVIEW OF DRIVING RECORD</option><option value='motorvehicledriver'>MOTOR VEHICLE DRIVER’S CERTIFICATION OF VIOLATIONS</option><option value='ReferenceCertificate'>Reference Certificate</option><option value='All'>All</option></select>";
                Object.assign(key, {
                    // action: "<a href='javascript:void(0)' data-driverId='" + key.driverId + "'  data-company_id='" + key.company_id + "' id='editmodalid' class='btn  btn-primary editmodalclass'><span class='mdi mdi-account-search'> View Certificates</span></a>&nbsp;"
                    action: dropdownvalue
                });
            return key;
        }
        res.json({
            "recordsTotal": data.length,
            "recordsFiltered": dt.total,
            data
        });
    });
};
router.getHosDtlsSuperadmin = ('/getHosDtlsSuperadmin/', async (req, res, next) => {
    let driverId = req.query.driverId;
    let tableData;
    let getdriver = await Driver.findOne({ where: { id: driverId }, raw: true });
    // let getDriverdetails = await Driverdetails.findOne({ where: { driverId: driverId }, raw: true });
    let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: driverId }, raw: true });
    let getcmpdtls = await Company.findOne({ where: { id: getdriver.company_id }, raw: true });
    let gethosdtls = await Hos.findOne({ where: { driverId: driverId }, raw: true });
    let getDrivinghistoryaddress = await Drivinghistoryaddress.findOne({ where: { driverId: driverId }, order: [['id', 'DESC']], raw: true });
    let driverName = getdriver ? getdriver.driver_name : '';
    let driver_license = getdriver ? getdriver.driver_license : '';
    let getDrivinghistorySignature = getDrivinghistory ? getDrivinghistory.signature : '';
    let companyName = getcmpdtls ? getcmpdtls.name : '';
    let hosdateData = gethosdtls ? gethosdtls.dateData : '';
    let hosdurationData = gethosdtls ? gethosdtls.durationData : '';
    let hosselectedDate = gethosdtls ? gethosdtls.selectedDate : '';
    let hoscreatedAt = gethosdtls ? gethosdtls.createdAt : '';
    let totalDuration = gethosdtls ? gethosdtls.totalDuration : '';
    let hosAttachment_attachment = gethosdtls ? gethosdtls.hosAttachment_attachment : '';
    let getDrivinghistoryaddressprovince = getDrivinghistoryaddress ? getDrivinghistoryaddress.province : '';
    let getDrivinghistoryaddresslicense = getDrivinghistoryaddress ? getDrivinghistoryaddress.license : '';
    let getDtls = await Hos.findAll({ where: { driverId: driverId }, raw: true });

    
    let n = 1
    if (getDtls) {
        await getDtls.forEach(function (getDetails, i) {
            tableData += '<tr><td>' + n + '</td><td>' + getDetails.actualDate + '</td><td>' + getDetails.duration + '</td> <td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="editmodalidaddress" class="btn btn-warning editmodalclassaddress"<span class="fas fa-edit"> Edit</span></a></td> </tr>';
            n++;
        });
        // console.log(fData);
        console.log(tableData);
        res.json({ status: true, data: tableData, driverName: driverName, driver_license: driver_license, getDrivinghistorySignature: getDrivinghistorySignature, companyName: companyName, hosdateData: hosdateData, hosdurationData: hosdurationData, hosselectedDate: hosselectedDate, hoscreatedAt: hoscreatedAt, hosAttachment_attachment: hosAttachment_attachment, getDrivinghistoryaddressprovince: getDrivinghistoryaddressprovince, getDrivinghistoryaddresslicense: getDrivinghistoryaddresslicense, totalDuration: totalDuration });
    }
    else {
        res.json({ status: false });
    }
});
router.getHosByID = ('/getHosByID/', async (req, res) => {
    //    console.log(req.query);
    let id = req.query.id;
    let gethos = await Hos.findOne({ where: { id: id }, raw: true });
    // console.log(gethos);
    if (gethos) {
        res.json({ status: true, data: gethos });
    }
    else {
        res.json({ status: false });
    }
});
// Update single HOS id
router.updatehosByID = ('/updatehosByID/', async (req, res) => {
    console.log(req);
    let id = req.body.id;
    let duration = req.body.duration;
    let actualDate = req.body.actualDate;
    let driverId = req.body.driverId;
    let approve = await Hos.update({ duration: duration, actualDate: actualDate }, {
        where: {
            id: id
        }
    });
    let getDtls = await Hos.findAll({ where: { driverId: driverId }, raw: true });
    // console.log(getDtls);
    let Totalduration = 0;
    if (getDtls) {
        await getDtls.forEach(function (getDetails, i) {
            Totalduration += parseInt(getDetails.duration)
        });
    }
    let durationUpdate = await Hos.update({ totalDuration: Totalduration }, {
        where: {
            driverId: driverId
        }
    });
    // console.log(Totalduration);
    // return false
    if (durationUpdate) {
        res.json({ status: true, message: 'Updated successfully' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
router.getupdatedrivingHistoryFormSuperadmin = async (req, res) => {
    console.log('get updateDrivinghistoryFormSuperadmin');
    let cmpid = req.query.cmpid;
    console.log(cmpid);
    // console.log(req.query.columns);
    console.log(req.query.draw);
    console.log(req.query.search.value);
    let col = req.query.columns[[0]].column || 'd.id';
    let direction = req.query.columns[[0]].dir || 'DESC';
    let columns = ['id', 'accidents', 'comment', 'driverId', 'd.driver_name'];
    let searchKey = '';
    let where = [];
    let where1 = [];
    // Search Conditions
    if (req.query.search.value) {
        if (req.query.search.value != "") {
           /* where.push({
                [Op.or]: [
                    { 'accidents': { [Op.like]: `%` + req.query.search.value + `%` } }
                ]
            });*/
            
            where1.push({ ['driver_name']: { [Op.like]: `%` + req.query.search.value + `%` } });
        } else {
            where1.push({ ['driver_name']: { [Op.like]: `%` + req.query.search.value + `%` } });
        }
    } else {
        where.push({
            id: {
                [Op.ne]: ""
            }
        });
    }
    where1.push({
        'active': 0
    });
    where.push({
        company_id: cmpid
    });
    const options = {
        page: ((req.query.start / req.query.length) + 1) || 1,
        paginate: parseInt(req.query.length) || 25,
        order: [[columns, col, direction]],
        attributes: columns,
        raw: true,
       // where: { company_id: cmpid },
       where:where,
        include: [{
            model: db.driver,
            as: "d",
            required: true,
            where : where1,
            // attributes : ['categories_name'],
            raw: true
        }
        ]
    }
    await Drivinghistory.paginate(options).then(function (dt) {
        let data = dt.docs.map(formData);
        // function formData(key) {
        function formData(key, index) {
            index = parseInt(index) + 1 + parseInt(req.query.start)
            Object.assign(key, {
                slno: index
            });
            console.log(key);
            key.driverId = key.driverId,
                key.accidents = key.accidents,
                Object.assign(key, {
                    action: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='editmodalid' class='btn  btn-warning editmodalclass1'><span class='fas fa-edit'> Edit</span></a>&nbsp;" +
                        "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='viewmodalid' class='btn  btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a> " +
                        "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='deletedriverDtls' class='btn  btn-danger deletemodalclass'><span class='fas fa-trash'> Delete</span></a>" +
                        "<a href='javascript:void(0)' data-id='" + key.driverId + "' class='btn btn-info viewmodalclassaddress'><span class='fas fa-search'> View | Edit Address</span></a> " +
                        "<a href='javascript:void(0)' data-id='" + key.driverId + "' class='btn btn-dark viewmodalclassaccident'><span class='fas fa-search'> View | Edit Accident</span></a> " +
                        "<a href='javascript:void(0)' data-id='" + key.driverId + "' class='btn btn-secondary viewmodalclassviolations'><span class='fas fa-search'> View | Edit Violations</span></a> "
                });
            return key;
        }
        res.json({
            "recordsTotal": data.length,
            "recordsFiltered": dt.total,
            data
        });
    });
};
router.superadmingetDrivinghistory = ('superadmingetDrivinghistory/', async (req, res, next) => {
    let id = req.query.id;
    let tableData;
    // console.log(id); 
    // let id = 788
    let getDtls = await Drivinghistoryaddress.findAll({ where: { driverId: id }, raw: true });
    //Sort array by date
    getDtls.sort(function (a, b) {
        return new Date(a.toDate) - new Date(b.toDate)
    })
    if (getDtls) {
        await getDtls.forEach(function (getDetails, i) {
            // console.log(getDtls);
            // console.log(getDtls.driverId);
            // let prvTo;
            // let gap = '';
            // let gapdata 
            // let currFrom = getDetails.fromDate
            // if (i >= 1) {
            //     prvTo = getDtls[i-1].toDate;
            // }else{
            //     prvTo = '';
            // }
            // if(prvTo != "undefined" && prvTo != ""){
            //     console.log('prev'+prvTo);
            //     console.log(getDetails.fromDate);
            //     gap =  getMonthDifferenceFunction(new Date(prvTo),new Date(getDetails.fromDate), req, res)
            //     gapdata = (gap >= 0) ? 0 : gap
            // }
            console.log(getDtls);
            // gap =  getMonthDifferenceFunction(new Date(getDetails.fromDate),new Date(getDetails.toDate), req, res)
            // if (gap >= 1 && gap != "undefined"){
            //     tableData += '<tr style="background-color: #e7000021;"><td>'+getDetails.address+'</td><td>'+getDetails.state+'</td><td>'+getDetails.city+'</td><td>'+getDetails.country+'</td><td>'+getDetails.province+'</td><td>'+getDetails.postalCode+'</td><td>'+getDetails.fromDate+'</td><td>'+getDetails.toDate+'</td><td>'+gap+'</td><td><a href="javascript:void(0)" data-prvTo='+prvTo+' data-currFrom='+currFrom+' data-id='+getDetails.id+' data-company_id='+getDetails.company_id+' data-driverId='+getDetails.driverId+' id="addmodalidaddress" class="btn btn-success addmodalclassaddress"<span class="fas fa-edit">Add</span></a></td><td><a href="javascript:void(0)" data-id='+getDetails.id+' id="editmodalidaddress" class="btn btn-warning editmodalclassaddress"<span class="fas fa-edit"> Edit</span></a></td><td><a href="javascript:void(0)" data-id='+getDetails.id+' id="deletemodalidaddress" class="btn btn-danger deletemodalclassaddress"<span class="fas fa-edit">Delete</span></a></td></tr>';
            // } else{
            // tableData += '<tr><td>'+getDetails.address+'</td><td>'+getDetails.state+'</td><td>'+getDetails.city+'</td><td>'+getDetails.country+'</td><td>'+getDetails.province+'</td><td>'+getDetails.postalCode+'</td><td>'+getDetails.fromDate+'</td><td>'+getDetails.toDate+'</td><td></td><td></td><td><a href="javascript:void(0)" data-id='+getDetails.id+' id="editmodalidaddress" class="btn btn-warning editmodalclassaddress"<span class="fas fa-edit"> Edit</span></a></td><td><a href="javascript:void(0)" data-id='+getDetails.id+' id="deletemodalidaddress" class="btn btn-danger deletemodalclass"<span class="fas fa-edit">Delete</span></a></td></tr>';
            let attachmentpath = "uploads/attachment/drivinghistoryaddressAttachment/" + getDetails.attachment;
            tableData += '<tr><td>' + getDetails.province + '</td><td>' + getDetails.license + '</td><td>' + '<a class="btn btn-primary" target="_blank" id="attachment_file_link" href="' + attachmentpath + '">View <span class="glyphicon glyphicon-edit"></span><i style="font-size: 15px;" class="fas fa-search"></i></a>' + '</td><td>' + getDetails.type + '</td><td>' + getDetails.expiry + '</td>' + '<td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="editmodalidAddress" class="btn btn-warning editmodalclassaddress"<span class="fas fa-edit"> Edit</span></a></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="deletemodalidaddress" class="btn btn-danger deletemodalclass"<span class="fas fa-edit">Delete</span></a></td></tr>';
            // }
        });
        // console.log(fData);
        console.log(tableData);
        res.json({ status: true, data: tableData });
    }
    else {
        res.json({ status: false });
    }
});
router.deleteDrivinghistoryAddress = ('/deleteDrivinghistoryAddress/', async (req, res) => {
    console.log(req);
    let id = req.body.id;
    let deleteDriverDtls = await Drivinghistoryaddress.destroy({
        where: { driverId: id }
    });
    if (deleteDriverDtls) {
        res.json({ status: true, message: 'Details Deleted successfully' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
router.superadminDrivinghistory = ('/superadminDrivinghistory/', async (req, res) => {
    console.log(req);
    let id = req.body.id;
    let approve = await Drivinghistoryaddress.update({ approveStatus: 1 }, {
        where: {
            driverId: id
        }
    });
    if (approve) {
        res.json({ status: true, message: 'Approved successfully' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
router.superadminapproveDrivinghistory = ('/superadminapproveDrivinghistory/', async (req, res) => {
    console.log(req);
    let id = req.body.id;
    let approve = await Drivinghistory.update({ approveStatus: 1 }, {
        where: {
            driverId: id
        }
    });
    if (approve) {
        res.json({ status: true, message: 'Approved successfully' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
// // Get Single driver address id
router.superadmingetupdatedrivingHistoryAddress = ('/superadmingetupdatedrivingHistoryAddress/', async (req, res) => {
    // console.log(req.query);
    let id = req.query.id;
    console.log(id);
    let getDtls = await Drivinghistoryaddress.findOne({ where: { id: id }, raw: true });
    console.log(getDtls);
    if (getDtls) {
        res.json({ status: true, data: getDtls });
    }
    else {
        res.json({ status: false });
    }
});
// ---------------------------Driver histroy part C----------------------------- end
// ---------------------------Motor Vehicle Driver’s CERTIFICATION OF COMPLIANCE ----------------------------- start
// router.updatecompanymotorVehicleCertificate = async (req, res) => {
//     let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
//     res.render('companymotorVehicleCertificate', {
//         title: 'Manage companymotorVehicleCertificate',
//         getCompanydata: getCompanydata
//     });
// };
router.updatecompanymotorVehicleCertificate = async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
    res.render('motorVehicleCertificateCompany', {
        title: 'All Certificates',
        getCompanydata: getCompanydata,
        company_id: req.session.userId
    });
};
router.updatemotorVehicleCertificateSuperadminSuperadmin = async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
    res.render('superadmin/motorVehicleCertificateSuperadmin', {
        title: 'Manage Certificates',
        getCompanydata: getCompanydata
    });
};
router.getupdatemotorVehicleCertificateSuperadminSuperadmin = async (req, res) => {
    // console.log('get motorVehicleCertificateSuperadmin');
    let cmpid = req.query.cmpid;
    console.log(cmpid);
    // console.log(req.query.columns);
    console.log(req.query.draw);
    console.log(req.query.search.value);
    let col = req.query.columns[[0]].column || 'id';
    let direction = req.query.columns[[0]].dir || 'DESC';
    let columns = ['id', 'firstName', 'driverId', 'company_id'];
    let searchKey = '';
    let where = [];
    let where1 = [];
    // Search Conditions
    if (req.query.search.value) {
        if (req.query.search.value != "") {
            where.push({
                [Op.or]: [
                    { 'firstName': { [Op.like]: `%` + req.query.search.value + `%` } }
                ]
            });
            
        } else {
            where.push({ ['firstName']: { [Op.like]: `%` + req.query.search.value + `%` } });
        }
    } else {
        where.push({
            id: {
                [Op.ne]: ""
            }
        });
    }
   /* where.push({
        active: 0
    });*/
    where.push({
        company_id: cmpid
    });
    const options = {
        page: ((req.query.start / req.query.length) + 1) || 1,
        paginate: parseInt(req.query.length) || 25,
        order: [[columns, col, direction]],
        attributes: columns,
        raw: true,
        //where: { company_id: cmpid }
        where : where
    }
    await Driverdetails.paginate(options).then(function (dt) {
        let data = dt.docs.map(formData);
        // function formData(key) {
        function formData(key, index) {
            index = parseInt(index) + 1 + parseInt(req.query.start)
            Object.assign(key, {
                slno: index
            });
            console.log(key);
            key.driverId = key.driverId,
                key.company_id = key.company_id,
                key.accidents = key.accidents,
                Object.assign(key, {
                    action: "<a href='javascript:void(0)' data-id='" + key.driverId + "' data-certificateID = 1 id='viewmodalidMotor' class='btn  btn-success'><span class='fas fa-search'> View Motor Vehicle Driver’s Certification</span></a> " +
                        "<a href='javascript:void(0)' data-id='" + key.driverId + "' data-certificateID= 2 id='viewmodalMedical' class='btn  btn-primary'><span class='fas fa-search'> View Medical Declaration </span></a>" +
                        "<a href='javascript:void(0)' data-id='" + key.driverId + "' data-certificateID= 3 id='viewmodalDriverack' class='btn  btn-warning'><span class='fas fa-search'> View Driver Acknowledgement </span></a>" +
                        "<a href='javascript:void(0)' data-id='" + key.driverId + "' data-certificateID= 4 id='viewmodalpspDisclosure' class='btn  btn-info'><span class='fas fa-search'> View PSP Disclosure </span></a>" +
                        "<button data-id='" + key.driverId + "' data-company_id='" + key.company_id + "' data-certificateID= 5 id='viewmodalclearingHouseConsent' class='btn  btn-dark'><span class='fas fa-search'> View Clearing House Consent</span></button>" +
                        "<button data-id='" + key.driverId + "' data-company_id='" + key.company_id + "' data-certificateID= 6 id='viewmodalcompensatedwork' class='btn  btn-secondary'><span class='fas fa-search'> View Compensated Work</span></button>" +
                        "<button data-id='" + key.driverId + "' data-company_id='" + key.company_id + "' data-certificateID= 7 id='viewmodaldrugAndAlcohol' class='btn  btn-light'><span class='fas fa-search'> Drug And Alcohol</span></button> <br>"+
                        "<button data-id='" + key.driverId + "' data-company_id='" + key.company_id + "' id='viewmodalDisclaimer' class='btn  btn-danger'><span class='fas fa-search'> Disclaimer</span></button>"
                });
            return key;
        }
        res.json({
            "recordsTotal": data.length,
            "recordsFiltered": dt.total,
            data
        });
    });
};
router.editupdatemotorVehicleCertificateSuperadminSuperadmin = ('/editupdatemotorVehicleCertificateSuperadminSuperadmin/', async (req, res) => {
    // console.log(req.query);
    let id = req.query.id;
    console.log('------id---------');
    console.log(id);
    let getDriverdetails = await Driverdetails.findOne({ where: { driverId: id }, raw: true });
    // console.log(1);
    let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: id }, raw: true });
    // console.log(2);
    let getDriver = await Driver.findOne({ where: { id: id }, raw: true });
    let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: id, certificateID: req.query.certificateID }, raw: true });
    //    console.log(3);
    let getcmpdtls = await Company.findOne({ where: { id: getDriver.company_id }, raw: true });
    let CertificateauthDtlsf;
    let certificateIDSixFirtstPrams;
    let adminSignature;
    let certificateIDSixSecondPrams; 
    let certificateDate;
    let drugAlcoholPointone;
    let drugAlcoholPointtwo
    let drugAlcoholPointthree
    let drugAlcoholPointfour
    let drugAlcoholPointfive
    let drugAlcoholPointsix
    let orgName
    if (CertificateauthDtls != null) {
        CertificateauthDtlsf = CertificateauthDtls.approve
        certificateDate = CertificateauthDtls.date
        adminSignature = CertificateauthDtls.adminSignature
        certificateIDSixFirtstPrams = CertificateauthDtls.certificateIDSixFirtstPrams
        certificateIDSixSecondPrams = CertificateauthDtls.certificateIDSixSecondPrams
        drugAlcoholPointone = CertificateauthDtls.drugAlcoholPointone
        drugAlcoholPointtwo = CertificateauthDtls.drugAlcoholPointtwo
        drugAlcoholPointthree = CertificateauthDtls.drugAlcoholPointthree
        drugAlcoholPointfour = CertificateauthDtls.drugAlcoholPointfour
        drugAlcoholPointfive = CertificateauthDtls.drugAlcoholPointfive
        drugAlcoholPointsix = CertificateauthDtls.drugAlcoholPointsix
        orgName = CertificateauthDtls.orgName
    } else {
        CertificateauthDtlsf = false
        certificateDate = '';
        adminSignature = '';
        certificateIDSixFirtstPrams = '';
        certificateIDSixSecondPrams = '';
        drugAlcoholPointone = '';
        drugAlcoholPointtwo = '';
        drugAlcoholPointthree = '';
        drugAlcoholPointfour = '';
        drugAlcoholPointfive = '';
        drugAlcoholPointsix = '';
        orgName = '';
    }
    let signature = getDrivinghistory ? getDrivinghistory.signature : '';
    if (getDriverdetails) {
        res.json({ status: true, province: getDriver.province, driverName: getDriver.driver_name, driver_license: getDriver.driver_license, license_expiry: getDriver.license_expiry, getupdatedDate: getDriverdetails.getupdatedDate, signature: signature, companyProvince: getDriverdetails.companyProvince, getupdatedDate: getDrivinghistory ? getDrivinghistory.updatedDate : '', CertificateauthDtls: CertificateauthDtlsf, eventsCalTimezone: getDriverdetails.eventsCalTimezone, dob: getDriverdetails.DOB, companyName: getcmpdtls.name, adminSignature: adminSignature, certificateIDSixFirtstPrams: certificateIDSixFirtstPrams, certificateIDSixSecondPrams: certificateIDSixSecondPrams, certificateDate: certificateDate,drugAlcoholPointone:drugAlcoholPointone,drugAlcoholPointtwo:drugAlcoholPointtwo,drugAlcoholPointthree:drugAlcoholPointthree,drugAlcoholPointfour:drugAlcoholPointfour,drugAlcoholPointfive:drugAlcoholPointfive,drugAlcoholPointsix:drugAlcoholPointsix,orgName:orgName });
    }
    else {
        res.json({ status: false });
    }
});
// ---------------------------Motor Vehicle Driver’s CERTIFICATION OF COMPLIANCE ----------------------------- end
router.profile = (req, res) => {
    res.render('profile', {
        title: 'Manage profile'
    });
};
router.generatePdf = ('/generatePdf/', async (req, res) => {
    console.log(req.query);
    // return false
    let driverid = req.query.driverid;
    let pdfGenerate = req.query.pdfGenerate;
    let tableData = '';
    // console.log('------driverid---------');
    // console.log(driverid);
    let getDriverdetails = await Driverdetails.findOne({ where: { driverId: driverid }, raw: true });
    // // console.log(1);
    let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
    // // console.log(2); 
    // let getDriver = await Driver.findOne({ where: { id: driverid }, raw: true });
    // let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: id, certificateID: req.query.certificateID }, raw: true });
    // //    console.log(3);
     let getcmpdtls = await Company.findOne({ where: { id: getDriverdetails.company_id }, raw: true });

     
     let cmpd_img = '';
     let cmpd_img1 = '';
     if(getcmpdtls && getcmpdtls.logo!='' && getcmpdtls.logo!=null){
        cmpd_img = '<img src="uploads/company_logo/' + getcmpdtls.logo + '" style="width:151px;height:67px;position:absolute;left:2.5%">';
        cmpd_img1 = '<img src="uploads/company_logo/' + getcmpdtls.logo + '" style="width:151px;height:67px;position:absolute;left:2.5%;margin-top:-22px;">';
     }
     
    if (pdfGenerate == 'PersonalDetails') {
        if (getDriverdetails != null) {

            let ImagesAttachment
            let Drivinghistoryaddressdata = await Drivinghistoryaddress.findAll({ where: { driverId: driverid }, raw: true });
            //Sort array by date
            // if (Drivinghistoryaddressdata) {
            await Drivinghistoryaddressdata.forEach(function (getDetails, i) {
                let attachmentpath = "uploads/attachment/drivinghistoryaddressAttachment/" + getDetails.attachment;
                if (getDetails.attachment) {
                    ImagesAttachment = '<img src="' + attachmentpath + '">';
                } else {
                    ImagesAttachment = '';
                }

            });
            // }


            let getDtls = await Driveraddress.findAll({ where: { driverId: driverid }, raw: true });
            if (getDtls) {
                await getDtls.forEach(function (getDetails, i) {
                    tableData += '<tr><td style="border:1px solid #000;">' + getDetails.driverAddress + '</td><td style="border:1px solid #000;">' + getDetails.driverCity + '</td><td style="border:1px solid #000;">' + getDetails.driverState + '</td><td style="border:1px solid #000;">' + getDetails.driverCountry + '</td><td style="border:1px solid #000;">' + getDetails.driverProvince + '</td><td style="border:1px solid #000;">' + getDetails.driverPostalCode + '</td><td style="border:1px solid #000;">' + getDetails.driverFromDate + '</td><td style="border:1px solid #000;">' + getDetails.driverToDate + '</tr>';
                });
            }
            res.json({ status: true, datas: '<head><title>' + getDriverdetails.firstName + '_' + pdfGenerate + '</title></head><div id="updateEmployment_details"> <div style=""> <h3 style="text-align: center;margin-bottom:50px;">'+cmpd_img+' EMPLOYMENT APPLICATION</h3> </div><div style=";margin: 1px;" class="row"> <div> <div style="border: 2px dotted;padding: 5px;" > <h3 style="text-align:center">TO BE READ AND SIGNED BY APPLICANT </h3> <br><br><p align="justify"> I authorize you to make such investigations and inquiries of my personal, employment, financial or medical history and other related matters as may be necessary in arriving at an employment decision.(Generally, inquiries regarding medical history will be made only if and after a conditional offer of employment has been extended.) I here by release employers, schools, health care providers and other persons from all liability in responding to inquiries and releasing information in connection with my application. In the event of employment, I understand that false or misleading information given in my application or interview(s) may result in discharge. I also understand  that I am required to abide by all rules and regulations of the Company. I understand that information I provide regarding current and/or previous employers may be used, and those employer(s) will be contacted, for the purpose of investigating my safety performance history as required by 49 CFR 391.23(d) and (e). <br> I understand that I have the right to: Review information provided by previous employers; Have errors in the information corrected by previous employers and for those previous employers to re-send the corrected information to the prospective employer; and Have a rebuttal attached to the alleged erroneous information, if the previous employer(s) and I cannot agree on the accuracy of the information. </p><div> <p align="justify"><b>Signature:</b> <img src="uploads/attachment/drivinghistoryaddressSignature/' + getDrivinghistory.signature + '" id="signature" alt="user" width="150"> </p>  <p align="justify"><b>Driver Name:</b> <span id="">' + getDriverdetails.firstName + '</span></p>   <p align="justify"><b>Date:</b> <span id="">' + getDriverdetails.updatedDate + '</span></p></div></div><div style="break-after:page"></div><div style="border: 2px dotted;padding: 5px;" class="col-md-12"> <h3 style="text-align: center;padding: 30px;"> PERSONAL INFORMATION </h3> <p align="justify"><b>Applicant Name :</b> <span id="firstName">' + getDriverdetails.firstName + '</span> &nbsp;&nbsp;&nbsp; <b>Applicant Middle Name :</b> <span id="middleName">' + getDriverdetails.middleName + '</span> &nbsp;&nbsp;&nbsp; </p><p align="justify"> <b>Applicant Last Name :</b> <span id="lastName">' + getDriverdetails.lastName + '</span> <b>Date of Application :</b> <span id="DOA">' + getDriverdetails.DOA + '</span> &nbsp;&nbsp;&nbsp;</p><p align="justify"> <b>Email :</b> <span id="email">' + getDriverdetails.email + '</span> &nbsp;&nbsp;&nbsp; <b>Date of Birth :</b> <span id="DOB">' + getDriverdetails.DOB + '</span> </p><p align="justify"> <b>Company Name :</b> <span id="companyName">' + getcmpdtls.name + '</span> &nbsp;&nbsp;&nbsp; <b>Company Address :</b> <span id="companyAddress">' + getDriverdetails.companyAddress + '</span> </p><p align="justify"> <b>Company City :</b> <span id="city">' + getDriverdetails.companyCity + '</span> &nbsp;&nbsp;&nbsp; <b>Company Province/State :</b> <span id="companyProvince">' + getDriverdetails.companyProvince + '</span> </p><p align="justify"><b>Company Country :</b> <span id="companyCountry">' + getDriverdetails.companyCountry + '</span> <b>Company Postal Code :</b> <span id="companyPostalCode">' + getDriverdetails.companyPostalCode + '</span> &nbsp;&nbsp;&nbsp;</p><p align="justify"><b>Position :</b>&nbsp;&nbsp;&nbsp; <span id="position">' + getDriverdetails.position + '</span> &nbsp;&nbsp;&nbsp; <b>Social Insurance Number :</b> <span id="sin">' + getDriverdetails.sin + '</span> &nbsp;&nbsp;&nbsp; </p></p><p align="justify"><b>Work Phone Canada :</b> <span id="phoneCanada">' + getDriverdetails.phoneCanada + '</span> &nbsp;&nbsp;&nbsp; <b>Work Phone USA :</b> <span id="phoneUSA">' + getDriverdetails.phoneUSA + '</span> &nbsp;&nbsp;&nbsp; </p><p align="justify"><b>Emergency Contact Name :</b> <span id="emegencyName">' + getDriverdetails.emegencyName + '</span> &nbsp;&nbsp;&nbsp; <b>Emergency Contact :</b> <span id="emegencyContact">' + getDriverdetails.emegencyContact + '</span> &nbsp;&nbsp;&nbsp; </p><p align="justify"> <b>Do you have the legal right to work in Canada? :</b> <span id="legalRightyesno">' + getDriverdetails.legalRightyesno + '</span> &nbsp;&nbsp;&nbsp;</p><b>Select Any Option :</b> <span id="legalRight">' + getDriverdetails.legalRight + '</span> &nbsp;&nbsp;&nbsp; <b>Do you have the legal right to enter the United States? :</b> <span id="legalRightUSA">' + getDriverdetails.legalRightUSA + '</span> </p><p align="justify"><b>Have you you registered with the FMCSA Drug &amp; Alcohol Clearinghouse? :</b> <span id="FMCSA">' + getDriverdetails.FMCSA + '</span> &nbsp;&nbsp;&nbsp; </p> <p align="justify"><b>Were you referred :</b> <span id="referred">' + getDriverdetails.referred + '</span> &nbsp;&nbsp;&nbsp; </p><p align="justify"><b>Referred by :</b> <span id="referredBy">' + getDriverdetails.referredBy + '</span> &nbsp;&nbsp;&nbsp; <b>Have you ever been bonded :</b> <span id="bonded">' + getDriverdetails.bonded + '</span> &nbsp;&nbsp;&nbsp; </p><p align="justify"> <b>Have you ever been convicted of a felony? :</b> <span id="convicted">' + getDriverdetails.convicted + '</span> <b>Are you a FAST approved driver? :</b> <span id="fastCardyesno">' + getDriverdetails.fastCardyesno + '</span> &nbsp;&nbsp;&nbsp;</p><p align="justify"> <b>Fast Card :</b> <span id="fastCard">' + getDriverdetails.fastCard + '</span> &nbsp;&nbsp;&nbsp; <b>Fastcard Expiry :</b> <span id="fastCardExpiry">' + getDriverdetails.fastCardExpiry + '</span> </p>&nbsp;&nbsp;&nbsp; </p><span><h3>Three years Address</h3></span> <table id="table" class="table table-striped table-bordered" style="border:1px solid black;border-collapse:collapse;"> <thead> <tr> <th style="border:1px solid #000;">Address</th> <th style="border:1px solid #000;">City</th> <th style="border:1px solid #000;">State</th> <th style="border:1px solid #000;">Country</th> <th style="border:1px solid #000;">Province</th> <th style="border:1px solid #000;">PostalCode</th> <th style="border:1px solid #000;">From</th> <th style="border:1px solid #000;">To</th> </thead> <tbody>' + tableData + '</tbody> </table> </div></div></div></div></div>'+'<style>@page { size: auto;  margin: 0mm; }</style>' });

        }
        else {
            res.json({ status: false });
        }
    } else if (pdfGenerate == 'employmentHistory') {
        let getDtls = await Employementhistroyaddress.findAll({ where: { driverId: driverid }, raw: true });
        if (getDtls != null) {
			let pageBreak = '<div style="break-after:page"></div>';

            console.log(getDtls);
            console.log('----------------------------');
            let header = '<head><title>' + getDriverdetails.firstName + '_' + pdfGenerate + '</title></head><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'EMPLOYMENT HISTORY</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12"><br>';
            let footer = '</div></div></div></div>';

            if (getDtls.length > 0) {
                await getDtls.forEach(function (getDetails, i) {
                    console.log(i);
                    
                    // tableData += '<tr><td>' + getDetails.employerName + '</td><td>' + getDetails.employerAddress + '</td><td>' + getDetails.employerPosition + '</td><td>' + getDetails.employerContactPerson + '</td><td>' + getDetails.employerContactPersonNumber + '</td><td>' + getDetails.employerContactPersonEmail + '</td><td>' + getDetails.jobDesignated + '</td><td>' + getDetails.fmcrs + '</td><td>' + getDetails.fromDate + '</td><td>' + getDetails.toDate + '</td></tr>';
					if(i!=0){
						tableData += pageBreak;
					}
                    tableData += '<div><p align="justify"><b>Employer Name :</b> <span id="firstName">' + getDetails.employerName + '</span></p><p align="justify"><b>Address :</b> <span id="employerAddress">' + getDetails.employerAddress + '</span></p><p align="justify"><b>Position :</b> <span id="employerPosition">' + getDetails.employerPosition + '</span></p><p align="justify"><b>Contact Person :</b> <span id="employerContactPerson">' + getDetails.employerContactPerson + '</span></p><p align="justify"><b>Contact Person Number :</b> <span id="employerContactPersonNumber">' + getDetails.employerContactPersonNumber + '</span></p><p align="justify"><b>Contact Person Email :</b> <span id="employerContactPersonEmail">' + getDetails.employerContactPersonEmail + '</span></p><p align="justify"><b>Were you subject to the FMCSRS** while employed? :</b> <span id="fmcrs">' + getDetails.fmcrs + '</span></p><p align="justify"><b>Was your job designated as a safety-sensitive function in any name dot-regulated mode <br> subject to the drug and alcohol, testing requirements of 49 cfr part 40? :</b> <span id="jobDesignated">' + getDetails.jobDesignated + '</span></p><p align="justify"><b>From Date :</b> <span id="fromDate">' + getDetails.fromDate + '</span></p><p align="justify"><b>To Date :</b> <span id="toDate">' + getDetails.toDate + '</span></p></div> <hr style=" background-color: #000; height: 2px; border: 0;">';
                    // tableData += '';
                });
            } else {

                tableData += 'No Record Found'
            }
            res.json({ status: true, datas: header + tableData + footer+'<style>@page { size: auto;  margin: 0mm; }</style>' });
        } else {
            res.json({ status: false, datas: '' });
        }


    } 
else if (pdfGenerate == 'drivingHistory') {
        // check data exists
        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
        if (getDrivinghistory != null) {
            // -----------Drivinghistoryaddress-----------------
            let Drivinghistoryaddress_tableData = '';
            let ImagesAttachment
            let getDtls = await Drivinghistoryaddress.findAll({ where: { driverId: driverid }, raw: true });
            //Sort array by date
            if (getDtls.length > 0) {
                await getDtls.forEach(function (getDetails, i) {
                    let attachmentpath = "uploads/attachment/drivinghistoryaddressAttachment/" + getDetails.attachment;
                    if (getDetails.attachment) {
                        ImagesAttachment = '<img src="' + attachmentpath + '">';
                    } else {
                        ImagesAttachment = '';
                    }
                    Drivinghistoryaddress_tableData += '<p align="justify"><b>Province :</b> <span id="Province">' + getDetails.province + '</span></p><p align="justify"><b>License :</b> <span id="license">' + getDetails.license + '</span></p></p><p align="justify"><b>Type :</b> <span id="type">' + getDetails.type + '</span></p><p align="justify"><b>Expiry :</b> <span id="expiry">' + getDetails.expiry + '</span></p>';
                });
            }
            else {
                Drivinghistoryaddress_tableData += 'No Record Found';
            }
            let Drivinghistoryaddress_header = '<div id=""> <div style="text-align: center;"> <h3>LICENSE DETAILS IN LAST 3 YEARS </h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
            let Drivinghistoryaddress_footer = '</div></div></div></div>';
            let Drivinghistoryaddres = Drivinghistoryaddress_header + Drivinghistoryaddress_tableData + Drivinghistoryaddress_footer
            // -----------Drivinghistoryaddress-----------------
            // -----------Drivinghistoryaccident-----------------
            let getdrivingHistoryAccident_tableData = '';
            let getdrivingHistoryAccidentDtls = await Drivinghistoryaccident.findAll({ where: { driverId: driverid }, raw: true });
            //Sort array by date
            if (getdrivingHistoryAccidentDtls.length > 0) {
                await getdrivingHistoryAccidentDtls.forEach(function (getDetails, i) {
                    getdrivingHistoryAccident_tableData += '<p align="justify"><b>Accidents Date :</b> <span id="Accidents Date">' + getDetails.accidentsDate + '</span></p><p align="justify"><b>Accidents Nature :</b> <span id="accidentsNature">' + getDetails.accidentsNature + '</span></p><p align="justify"><b>Accidents Fatalities :</b> <span id="accidentsFatalities">' + getDetails.accidentsFatalities + '</span></p><p align="justify"><b>Accidents Injuries :</b> <span id="accidentsInjuries">' + getDetails.accidentsInjuries + '</span></p><p align="justify"><b>Accidents Hazardous :</b> <span id="accidentsHazardous">' + getDetails.accidentsHazardous + '</span></p>';
                });
            }
            else {
                getdrivingHistoryAccident_tableData += 'No Record found';
            }
            let getdrivingHistoryAccident_header = '<div id=""> <div style="text-align: center;"> <h3>DRIVING EXPERIENCE ACCIDENT</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
            let getdrivingHistoryAccident_footer = '</div></div></div></div>';
            let getdrivingHistoryAccident = getdrivingHistoryAccident_header + getdrivingHistoryAccident_tableData + getdrivingHistoryAccident_footer
            // -----------Drivinghistoryaccident-----------------
            // -----------Drivinghistoryviolations-----------------
            let Drivinghistoryviolations_tableData = '';
            let DrivinghistoryviolationsDtls = await Drivinghistoryviolations.findAll({ where: { driverId: driverid }, raw: true });
            //Sort array by date
            if (DrivinghistoryviolationsDtls.length > 0) {
                await DrivinghistoryviolationsDtls.forEach(function (getDetails, i) {
                    Drivinghistoryviolations_tableData += '<p align="justify"><b>Traffic Convintions Date :</b> <span id="traficConvintionsDate">' + getDetails.traficConvintionsDate + '</span></p><p align="justify"><b>Traffic Convintions Charge :</b> <span id="traficConvintionsCharge">' + getDetails.traficConvintionsCharge + '</span></p><p align="justify"><b>Traffic Convintions Location :</b> <span id="traficConvintionsLocation">' + getDetails.traficConvintionsLocation + '</span></p><p align="justify"><b>Traffic Convintions Penalty :</b> <span id="traficConvintionsPenalty">' + getDetails.traficConvintionsPenalty + '</span></p>';
                });
            }
            else {
                Drivinghistoryviolations_tableData += 'No Record found';
            }
            let Drivinghistoryviolations_header = '<div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">DRIVING EXPERIENCE VIOLATIONS</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12"></center><br>';
            let Drivinghistoryviolations_footer = '</div></div></div></div>';
            let DrivinghistoryviolationsData = Drivinghistoryviolations_header + Drivinghistoryviolations_tableData + Drivinghistoryviolations_footer
            // -----------Drivinghistoryviolations-----------------
            // let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });

            let hide = ''
            if (getDrivinghistory) {
                if (getDrivinghistory.drivingExperience == "No") {
                    hide = 'style="display: none;'
                }
                let Formheader = '<head><title>' + getDriverdetails.firstName + '_' + pdfGenerate + '</title></head><div id=""> <div style="text-align: center;"> '+cmpd_img+'<h3>Driver Experience & Qualification </h3> <br> <h3>DRIVING EXPERIENCE</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
                let Formbody = '<p align="justify"><b>Driving Experience:</b> <span id="drivingExperience">' + getDrivinghistory.drivingExperience + '</span></p><div '+hide+' id="drivingExperienceDivEdit"><p align="justify"><b>Class of Equipment :</b> <span id="classofEquipment">' + getDrivinghistory.classofEquipment + '</span></p><p align="justify"><b>Choose Type of Equipment :</b> <span id="equipmentType">' + getDrivinghistory.equipmentType + '</span></p><p align="justify"><b>Start Date:</b> <span id="equipmentStartDate">' + getDrivinghistory.equipmentStartDate + '</span></p><p align="justify"><b>End Date:</b> <span id="equipmentEndDate">' + getDrivinghistory.equipmentEndDate + '</span></p><p align="justify"><b>Approx of Miles / Kms :</b> <span id="aprox">' + getDrivinghistory.aprox + '</span></p><p align="justify"><b>List provinces & states operated in for last five years :</b> <span id="listProvinces">' + getDrivinghistory.listProvinces + '</span></p><p align="justify"><b>List courses and training other then as shown elsewhere in this application:</b> <span id="listCourses">' + getDrivinghistory.listCourses + '</span></p><p align="justify"><b>Education: Last school Attended:</b> <span id="education">' + getDrivinghistory.education + '</span></p><br>  </div>  <img src="uploads/attachment/drivinghistoryaddressSignature/' + getDrivinghistory.signature + '" id="signature" alt="user" width="150"> <hr>  <p align="justify"><b>Have you ever been denied a license, permit or privilege to operate a motor vehicle? :</b> <span id="deniedLicense">' + getDrivinghistory.deniedLicense + '</span></p><p align="justify"><b>Has any license, permit or privilege ever been suspended or revoked? :</b> <span id="licensePermit">' + getDrivinghistory.licensePermit + '</span></p>'
                let Formfooter = '</div></div></div>';
                let Form = Formheader + Formbody + Formfooter
                res.json({ status: true, datas: Form + Drivinghistoryaddres + getdrivingHistoryAccident + DrivinghistoryviolationsData+'<style>@page { size: auto;  margin: 0mm; }</style>' });
            }
            else {
                res.json({ status: false });
            }
        }
        else {
            res.json({ status: false });
        }
    } else if (pdfGenerate == 'motorvehicleCertificate') {
        let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: driverid, certificateID: 1 }, raw: true });
        if (CertificateauthDtls != null) {
            // -----------Motor vehicle certificate-----------------
            let getDriverdetails = await Driverdetails.findOne({ where: { driverId: driverid }, raw: true });
            // console.log(1);
            let getDrivinghistoryData = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
            // console.log(2);
            let getDriver = await Driver.findOne({ where: { id: driverid }, raw: true });

            //    console.log(3);
            let getcmpdtls = await Company.findOne({ where: { id: getDriver.company_id }, raw: true });
            let CertificateauthDtlsf;
            let certificateIDSixFirtstPrams;
            let adminSignature;
            let certificateIDSixSecondPrams;
            let certificateDate;
            CertificateauthDtlsf = CertificateauthDtls ? CertificateauthDtls.approve : ""
            certificateDate = CertificateauthDtls ? CertificateauthDtls.date : ""
            adminSignature = CertificateauthDtls ? CertificateauthDtls.adminSignature : ""
            certificateIDSixFirtstPrams = CertificateauthDtls ? CertificateauthDtls.certificateIDSixFirtstPrams : ""
            certificateIDSixSecondPrams = CertificateauthDtls ? CertificateauthDtls.certificateIDSixSecondPrams : ""
            let signature = getDrivinghistoryData ? getDrivinghistoryData.signature : '';
            let attachmentpath = "uploads/attachment/drivinghistoryaddressSignature/" + signature;
            if (signature) {
                ImagesAttachment = '<img id="signature" alt="user" width="150" src="' + attachmentpath + '">';
            } else {
                ImagesAttachment = '';
            }
            if (driverid) {
                let Formheader = '<head><title>' + getDriverdetails.firstName + '_' + pdfGenerate + '</title></head><div id=""> <div style="text-align: center;"> '+cmpd_img+'<h3 style="margin-bottom:50px;padding-left:50px;">Motor Vehicle Driver’s CERTIFICATION OF COMPLIANCE </h3><h3>WITH DRIVER LICENSE REQUIREMENTS </h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12"><br>';
                let Formbody = '<p align="justify">MOTOR CARRIER INSTRUCTIONS: The requirements in Part383 apply to every driver who operates in intrastate, interstate, or foreign commerce and operates a vehicle weighing 26,001 pounds or more, can transport more than 15 people, or transports hazardous materials that require placarding.<br>The requirements in Part 391 apply to every driver who operates in interstate commerce and operates a vehicle weighing 10,001 pounds or more, can transport more than 15 people, or transports hazardous materials that require placarding.</p><h3>DRIVER REQUIREMENTS:</h3><p align="justify">Parts 383 and 391 of the Federal Motor Carrier Safety Regulations contain some requirements that you, as a driver must comply with. These requirements are in effect as of July 1, 1987. They are as follows:</p><h3>1. POSSESS ONLY ONE LICENSE:</h3><p align="justify">You, as a commercial vehicle driver, may not possess more than one license. If you currently have more than one license, you should keep the license from your state of residence and return the additional licenses to the states that issued them. DESTROYING a license does not close the record in the state that issued it; you must notify the state. If a multiple license has been lost, stolen, or destroyed, you should close your record by notifying the state of issuance that you no longer want to be licensed by that state.</p><h3>2. NOTIFICATION OF LICENSE SUSPENSION, REVOCATION OR CANCELLATION:</h3><p align="justify">Sections 392.42 and 383.33 of the Federal Motor Carrier Safety Regulations require that you notify your employer the next business day of any revocation or suspension of your driver’s license. In addition, section 383.31 requires that any time you violate a state or local traffic law (other than parking), you must report it within 30 days to: 1) your employing motor carrier and 2) the state that issued your license (if the violation occurs in a state other than the one which issued your license).The notification to both the employer and state must be in Writing.</p><h3>The following license is the only one I will possess:</h3><p align="justify"><b>Driver’s Name:</b> <span id="driverName">' + getDriver.driver_name + '</span></p><p align="justify"><b>Driver’s License No:</b> <span id="driver_license">' + getDriver.driver_license + '</span></p><p align="justify"><b>Exp Date :</b> <span id="license_expiry">' + getDriver.license_expiry + '</span></p><p align="justify"><b>Drivers Signature:</b> <span id="equipmentEndDate">' + ImagesAttachment + '</span></p><p align="justify"><b>Date:</b> <span id="getupdatedDate">' + certificateDate + '</span></p>'
                let Formfooter = '</div></div></div></div>';
                let Form = Formheader + Formbody + Formfooter+'<style>@page { size: auto;  margin: 0mm; }</style>'
                res.json({ status: true, datas: Form });
            }
            else {
                res.json({ status: false });
            }
        } else {
            res.json({ status: false });
        }
        // -----------Motor vehicle certificate-----------------
    } else if (pdfGenerate == 'medicalDecleration') {
        let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: driverid, certificateID: 2 }, raw: true });
        if (CertificateauthDtls != null) {
            // -----------medicalDecleration certificate-----------------
            let getDriverdetails = await Driverdetails.findOne({ where: { driverId: driverid }, raw: true });
            // console.log(1);
            let getDrivinghistoryData = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
            // console.log(2);
            let getDriver = await Driver.findOne({ where: { id: driverid }, raw: true });

            //    console.log(3);
            let getcmpdtls = await Company.findOne({ where: { id: getDriver.company_id }, raw: true });
            let CertificateauthDtlsf;
            let certificateIDSixFirtstPrams;
            let adminSignature;
            let certificateIDSixSecondPrams;
            let certificateDate;
            CertificateauthDtlsf = CertificateauthDtls ? CertificateauthDtls.approve : ""
            certificateDate = CertificateauthDtls ? CertificateauthDtls.date : ""
            adminSignature = CertificateauthDtls ? CertificateauthDtls.adminSignature : ""
            certificateIDSixFirtstPrams = CertificateauthDtls ? CertificateauthDtls.certificateIDSixFirtstPrams : ""
            certificateIDSixSecondPrams = CertificateauthDtls ? CertificateauthDtls.certificateIDSixSecondPrams : ""
            let signature = getDrivinghistoryData ? getDrivinghistoryData.signature : '';
            let attachmentpath = "uploads/attachment/drivinghistoryaddressSignature/" + signature;
            if (signature) {
                ImagesAttachment = '<img id="signature" alt="user" width="150" src="' + attachmentpath + '">';
            } else {
                ImagesAttachment = '';
            }
            if (driverid) {
                let Formheader = '<head><title>' + getDriverdetails.firstName + '_' + pdfGenerate + '</title></head><div style=""></div><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'MEDICAL DECLERATION CERTIFICATION</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
                let Formbody = '<p align="justify">On March 3rd, 1999 Transport Canada and the US federal Highway administration (FHWA) entered into a reciprocal agreement regarding the physical requirements for a Canadian drivers of a commercial vehicle in the US, as currently contained in the federal Motor carriers safety regulation, part 391.41 et seq, and vice-versa, the reciprocal agreement will remove the requirements for a Canadian driver to carry a copy of a medical examiners certificate indicating that the driver is physically qualified to drive (In effect, the existence of a valid driver’s license issued by the province of on is deemed to be proof that a driver is physically qualified to drive in US) however, FHWA will not recognize an on license if the driver has certain medical conditions and those conditions would prohibit them from driving in the US.</p><p align="justify">I certify that I am qualified to operate a commercial vehicle in the United States. I further certify that:</p><p align="justify">A) I have no established medical history or clinical diagnosis of epilepsy</p><p align="justify">B) I don’t have impaired hearing (A driver must be able to first perceive a forced whispered voice in the better ear at not less than 5 feet with or without the use of a hearing aid, or does not have an average hearing loss in the better ear greater than 40 decibels at 500 Hz, 100 Hz, or 200 Hz with or without a hearing aid when tested by an audiometric device calibrated to American National Standard Z24.5-1951)</p><p align="justify">C) I have not been issued a waiver by the province of on allowing me to operate a commercial motor vehicle pursuant to section 20 or 22 of the on regulation 340/94.</p><p align="justify">I further agree to inform '+getcmpdtls.name+' should my medical status change, or if I can no longer certify conditions A to C, described above.</p><p align="justify"><b>Driver’s Name:</b> <span id="driverName">' + getDriver.driver_name + '</span></p><p align="justify"><b>Drivers Signature:</b> <span id="equipmentEndDate">' + ImagesAttachment + '</span></p><p align="justify"><b>Date:</b> <span id="getupdatedDate">' + certificateDate + '</span></p>'
                let Formfooter = '</div></div></div></div>';
                let Form = Formheader + Formbody + Formfooter+'<style>@page { size: auto;  margin: 0mm; }</style>'
                res.json({ status: true, datas: Form });
            }
            else {
                res.json({ status: false });
            }
        } else {
            res.json({ status: false });
        }
        // -----------driverAcknowledgement certificate-----------------
    } else if (pdfGenerate == 'driverAcknowledgement') {
        let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: driverid, certificateID: 3 }, raw: true });
        console.log('---------');
        console.log(CertificateauthDtls);
        if (CertificateauthDtls != null) {
            // -----------driverAcknowledgement certificate-----------------
            let getDriverdetails = await Driverdetails.findOne({ where: { driverId: driverid }, raw: true });
            // console.log(1);
            let getDrivinghistoryData = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
            // console.log(2);
            let getDriver = await Driver.findOne({ where: { id: driverid }, raw: true });
            let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: driverid, certificateID: 3 }, raw: true });
            //    console.log(3);
            let getcmpdtls = await Company.findOne({ where: { id: getDriver.company_id }, raw: true });
            let CertificateauthDtlsf;
            let certificateIDSixFirtstPrams;
            let adminSignature;
            let certificateIDSixSecondPrams;
            let certificateDate;
            CertificateauthDtlsf = CertificateauthDtls ? CertificateauthDtls.approve : ""
            certificateDate = CertificateauthDtls ? CertificateauthDtls.date : ""
            adminSignature = CertificateauthDtls ? CertificateauthDtls.adminSignature : ""
            certificateIDSixFirtstPrams = CertificateauthDtls ? CertificateauthDtls.certificateIDSixFirtstPrams : ""
            certificateIDSixSecondPrams = CertificateauthDtls ? CertificateauthDtls.certificateIDSixSecondPrams : ""
            let signature = getDrivinghistoryData ? getDrivinghistoryData.signature : '';
            let attachmentpath = "uploads/attachment/drivinghistoryaddressSignature/" + signature;
            if (signature) {
                ImagesAttachment = '<img id="signature" alt="user" width="150" src="' + attachmentpath + '">';
            } else {
                ImagesAttachment = '';
            }
            if (driverid) {
                let Formheader = '<head><title>' + getDriverdetails.firstName + '_' + pdfGenerate + '</title></head><div style=""></div><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;"> '+cmpd_img+'DRIVER ACKNOWLEDGEMENT</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
                let Formbody = '<p align="justify"> I ' + getDriver.driver_name + ' have been explained and I understand it is illegal to Falsify in logbooks and I have to log all time markers (e.g., Tolls, border crossing, fuel times etc.) Properly and exactly as per ' + getDriverdetails.eventsCalTimezone + ' Time Zone. </p><p align="justify">If any falsification in my logs is found while auditing by company, I agree that I will be subjected to fines and penalties</p><p align="justify">Fines and penalties will be determined by safety and compliance officer looking into number of counts and difference of hours.</p><p align="justify"><b>Driver’s Name:</b> <span id="driverName">' + getDriver.driver_name + '</span></p><p align="justify"><b>Drivers Signature:</b> <span id="equipmentEndDate">' + ImagesAttachment + '</span></p><p align="justify"><b>Date:</b> <span id="getupdatedDate">' + certificateDate + '</span></p>'
                let Formfooter = '</div></div></div></div>';
                let Form = Formheader + Formbody + Formfooter+'<style>@page { size: auto;  margin: 0mm; }</style>'
                res.json({ status: true, datas: Form });
            }
            else {
                res.json({ status: false });
            }
        } else {
            res.json({ status: false });
        }
        // -----------driverAcknowledgement certificate-----------------
    } else if (pdfGenerate == 'PSPDisclosure') {
        let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: driverid, certificateID: 4 }, raw: true });
        if (CertificateauthDtls != null) {
            // -----------PSPDisclosure certificate-----------------
            let getDriverdetails = await Driverdetails.findOne({ where: { driverId: driverid }, raw: true });
            // console.log(1);
            let getDrivinghistoryData = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
            // console.log(2);
            let getDriver = await Driver.findOne({ where: { id: driverid }, raw: true });
            let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: driverid, certificateID: 4 }, raw: true });
            //    console.log(3);
            console.log('-------------------');
            console.log(CertificateauthDtls);
            console.log('-------------------');
            let getcmpdtls = await Company.findOne({ where: { id: getDriver.company_id }, raw: true });
            let CertificateauthDtlsf;
            let certificateIDSixFirtstPrams;
            let adminSignature;
            let certificateIDSixSecondPrams;
            let certificateDate;
            CertificateauthDtlsf = CertificateauthDtls ? CertificateauthDtls.approve : ""
            certificateDate = CertificateauthDtls ? CertificateauthDtls.date : ""
            adminSignature = CertificateauthDtls ? CertificateauthDtls.adminSignature : ""
            certificateIDSixFirtstPrams = CertificateauthDtls ? CertificateauthDtls.certificateIDSixFirtstPrams : ""
            certificateIDSixSecondPrams = CertificateauthDtls ? CertificateauthDtls.certificateIDSixSecondPrams : ""
            let signature = getDrivinghistoryData ? getDrivinghistoryData.signature : '';
            let attachmentpath = "uploads/attachment/drivinghistoryaddressSignature/" + signature;
            if (signature) {
                ImagesAttachment = '<img id="signature" alt="user" width="150" src="' + attachmentpath + '">';
            } else {
                ImagesAttachment = '';
            }
            if (driverid) {
                let Formheader = '<head><title>' + getDriverdetails.firstName + '_' + pdfGenerate + '</title></head><div style=""></div><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'PSP DISCLOSURE</h3> </div><div style=";margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
                let Formbody = '<h3><center>REGARDING BACKGROUND REPORTS FROM THE PSP ONLINE SERVICE</center></h3><p align="justify">In connection with your application for employment with <u> ' + getcmpdtls.name + '  </u>, its employees, agents or contractors may obtain one or more reports regarding your driving, and safety inspection history, from the Federal Motor Carrier Safety Administration (FMCSA).</p><p align="justify">When the application for employment is submitted in person, if the Prospective Employer uses any information it obtains from FMCSA in a decision to not hire you or to make any other adverse employment decision regarding you, the Prospective Employer will provide you with a copy of the report upon which its decision was based and a written summary of your rights under the Fair Credit Reporting Act before taking any final adverse action. If any final adverse action is taken against you based upon your driving history or safety report, the Prospective Employer will notify you that the action has been taken and that the action was based in part or in whole on this report</p><p align="justify">When the application for employment is submitted by mail, telephone, computer, or other similar means, if the Prospective Employer uses any information it obtains from FMCSA in a decision to not hire you or to make any other adverse employment decision regarding you, the Prospective Employer must provide you, within three business days of taking adverse action, oral, written or electronic notification: that adverse action has been taken based in whole or in part on information obtained from FMCSA; the name, address, and the toll free telephone number of FMCSA; that the FMCSA did not make the decision to take the adverse action and is unable to provide you the specific reasons why the adverse action was taken; and that you may, upon providing proper identification, request a free copy of the report and may dispute with the FMCSA the accuracy or completeness of any information or report. If you request a copy of a driver record from the Prospective Employer who procured the report, then, within 3 business days of receiving your request, together with proper identification, the Prospective Employer must send or provide to you a copy of your report and a summary of your rights under the Fair Credit Reporting Act.</p><p align="justify">Neither the Prospective Employer nor the FMCSA contractor supplying the crash and safety information has the capability to correct any safety data that appears to be incorrect. You may challenge the accuracy of the data by submitting a request to https://dataqs.fmcsa.dot.gov. If you challenge crash or inspection information reported by a State, FMCSA cannot change or correct this data. Your request will be forwarded by the DataQs system to the appropriate State for adjudication</span></p><p align="justify">Any crash or inspection in which you were involved will display on your PSP report. Since the PSP report does not report, or assign, or imply fault, it will include all Commercial Motor Vehicle (CMV) crashes where you were a driver or co-driver and where those crashes were reported to FMCSA, regardless of fault. Similarly, all inspections, with or without violations, appear on the PSP report. State citations associated with Federal Motor Carrier Safety Regulations (FMCSR) violations that have been adjudicated by a court of law will also appear, and remain, on a PSP report.</span></p><p align="justify">The Prospective Employer cannot obtain background reports from FMCSA without your authorization</span></p><h3><center>AUTHORIZATION</center></h3><p align="justify">If you agree that the Prospective Employer may obtain such background reports, please read the following and sign below: I authorize ' + getcmpdtls.name + ' to access the FMCSA Pre-Employment Screening Program (PSP) system to seek information regarding my commercial driving safety record and information regarding my safety inspection history. I understand that I am authorizing the release of safety performance information including crash data from the previous five (5) years and inspection history from the previous three (3) years. I understand and acknowledge that this release of information may assist the Prospective Employer to make a determination regarding my suitability as an employee.</p><p align="justify">I further understand that neither the Prospective Employer nor the FMCSA contractor supplying the crash and safety information has the capability to correct any safety data that appears to be incorrect. I understand I may challenge the accuracy of the data by submitting a request to https://dataqs.fmcsa.dot.gov. If I challenge crash or inspection information reported by a State, FMCSA cannot change or correct this data. I understand my request will be forwarded by the DataQs system to the appropriate State for adjudication</p><p align="justify">I understand that any crash or inspection in which I was involved will display on my PSP report. Since the PSP report does not report, or assign, or imply fault, I acknowledge it will include all CMV crashes where I was a driver or co-driver and where those crashes were reported to FMCSA, regardless of fault. Similarly, I understand all inspections, with or without violations, will appear on my PSP report, and State citations associated with FMCSR violations that have been adjudicated by a court of law will also appear, and remain, on my PSP report.</p><p align="justify">I have read the above Disclosure Regarding Background Reports provided to me by Prospective Employer and I understand that if I sign this Disclosure and Authorization, Prospective Employer may obtain a report of my crash and inspection history. I hereby authorize Prospective Employer and its employees, authorized agents, and/or affiliates to obtain the information authorized above.</p><p align="justify"><b>Date:</b> <span id="getupdatedDate">' + certificateDate + '</span></p><p align="justify"><b>Drivers Signature:</b> <span id="">' + ImagesAttachment + '</span></p><p align="justify"><b>Drivers Name:</b> ' + getDriver.driver_name + '</p> <p align="justify">NOTICE: This form is made available to monthly account holders by NIC on behalf of the U.S. Department of Transportation, Federal Motor Carrier Safety Administration (FMCSA). Account holders are required by federal law to obtain an Applicant’s written or electronic consent prior to accessing the Applicant’s PSP report. Further, account holders are required by FMCSA to use the language contained in this Disclosure and Authorization form to obtain an Applicant’s consent. The language must be used in whole, exactly as provided. Further, the language on this form must exist as one stand-alone document. The language may NOT be included with other consent forms or any other language.</p><p align="justify">NOTICE: The prospective employment concept referenced in this form contemplatesthe definition of “employee” contained at 49 C.F.R. 383.5.</p>'
                let Formfooter = '</div></div></div></div>';
                let Form = Formheader + Formbody + Formfooter+'<style>@page { size: auto;  margin: 0mm; }</style>'
                res.json({ status: true, datas: Form });
            }
            else {
                res.json({ status: false });
            }
        } else {
            res.json({ status: false });
        }
        // -----------PSPDisclosure certificate-----------------
    } else if (pdfGenerate == 'clearingHouseConsent') {
        let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: driverid, certificateID: 5 }, raw: true });
        if (CertificateauthDtls != null) {
            // -----------clearingHouseConsent certificate-----------------
            let getDriverdetails = await Driverdetails.findOne({ where: { driverId: driverid }, raw: true });
            // console.log(1);
            let getDrivinghistoryData = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
            // console.log(2);
            let getDriver = await Driver.findOne({ where: { id: driverid }, raw: true });

            //    console.log(3);
            let getcmpdtls = await Company.findOne({ where: { id: getDriver.company_id }, raw: true });
            let CertificateauthDtlsf;
            let certificateIDSixFirtstPrams;
            let adminSignature;
            let certificateIDSixSecondPrams;
            let certificateDate;
            let orgName;
            CertificateauthDtlsf = CertificateauthDtls ? CertificateauthDtls.approve : ""
            orgName = CertificateauthDtls ? CertificateauthDtls.orgName : ""
            certificateDate = CertificateauthDtls ? CertificateauthDtls.date : ""
            adminSignature = CertificateauthDtls ? CertificateauthDtls.adminSignature : ""
            certificateIDSixFirtstPrams = CertificateauthDtls ? CertificateauthDtls.certificateIDSixFirtstPrams : ""
            certificateIDSixSecondPrams = CertificateauthDtls ? CertificateauthDtls.certificateIDSixSecondPrams : ""
            let signature = getDrivinghistoryData ? getDrivinghistoryData.signature : '';
            let attachmentpath = "uploads/attachment/drivinghistoryaddressSignature/" + signature;
            if (signature) {
                ImagesAttachment = '<img id="signature" alt="user" width="150" src="' + attachmentpath + '">';
            } else {
                ImagesAttachment = '';
            }
            let adminattachmentpath = "uploads/attachment/clearHouseSupervisor/" + adminSignature;
            if (adminSignature) {
                adminImagesAttachment = '<img id="signature" alt="user" width="150" src="' + adminattachmentpath + '">';
            } else {
                adminImagesAttachment = '';
            }
            if (driverid) {
                let Formheader = '<head><title>' + getDriverdetails.firstName + '_' + pdfGenerate + '</title></head><div style=""></div><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'CLEARING HOUSE CONSENT</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
                let Formbody = '<h3><center>SCHEDULE “A” “1”THE COMMERCIAL DRIVER’S LICENSE DRUG AND ALCOHOL CLEARINGHOUSE CONSENT FORM</center></h3>(TO BE EXECUTED BY ALL EMPLOYEES AND APPLICANTS WHO ARE OFFERED EMPLOYMENT)<p align="justify">1. I understand that as a condition of employment, or continued employment, with the Company, I must register with the Commercial Driver’s License Drug and Alcohol Clearinghouse at clearinghouse.fmcsa.dot.gov and I must grant electronic consent for the Company to run a full Pre-Employment Query on my record with the Clearinghouse.</p><p align="justify">2. I understand that a full Pre-Employment Query includes assessing the following specific records:</p><p align="justify">a. A verified positive, adulterated, or substituted controlled substances test result;</p><p align="justify">b. An alcohol confirmation test with a concentration of 0.04 or higher;</p><p align="justify">c. An employer’s report of actual knowledge, meaning that the employer directly observed the employee’s use of alcohol or controlled substances while on duty;</p><p align="justify">d. On duty alcohol use, meaning an employer has actual knowledge that an employeehas used alcohol while performing safety sensitive functions; e. Pre-duty alcohol use, meaning that an employer has actual knowledge that anemployee has used alcohol within 4 hours of performing safety sensitive functions;</p><p align="justify">f. Alcohol use following an accident, unless 8 hours have passed following the accident or until a post accident alcohol test is conducted, whichever occurs first;</p><p align="justify">g. Controlled substance use, meaning that no driver shall used a controlled substance while performing a safety sensitive function unless a licensed medical practitioner who is familiar with the driver’s medical history has advised the driver that the substance will not adversely affect the driver’s ability to safely operate a commercial motor vehicle;</p><p align="justify">h. A SAP report of the successful completion of the return-to-duty process;</p><p align="justify">i. A negative return-to-duty test; and</p><p align="justify">j. A SAP report of the successful completion of follow-up testing.</p><p align="justify">3. I understand that I cannot perform a safety sensitive function for the Company if my Clearinghouse record indicates a violation as listed in Part 2 above unless/until I have completed the SAP evaluation, referral and education/treatment process as described in this Policy. Page 29 INITIALS J S JASMEET SINGH My signature below confirms that I have read and understood the above terms and that I agree to abide by them.</p><p align="justify"></p><p align="justify"><b>Date this at:</b> <span id="getupdatedDate">' + certificateDate + '</span></p><p align="justify"><b>Printed Name of Employee as it appears on DL</b> ' + getDriver.driver_name + '</p><p align="justify"><b>Driver’s License No:</b> ' + getDriver.driver_license + ' <b>Province:</b> ' + getDriver.province + '</p><p align="justify"><b>Employee Date of Birth:</b> ' + getDriverdetails.DOB + '</p><p align="justify"><b>Drivers Signature:</b> <span id="">' + ImagesAttachment + '</span></p><p align="justify"><b>Supervisor Signature:</b> <span id="">' + adminImagesAttachment + '</span></p><p align="justify">NOTICE: This form is made available to monthly account holders by NIC on behalf of the U.S. Department of Transportation, Federal Motor Carrier Safety Administration (FMCSA). Account holders are required by federal law to obtain an Applicant’s written or electronic consent prior to accessing the Applicant’s PSP report. Further, account holders are required by FMCSA to use the language contained in this Disclosure and Authorization form to obtain an Applicant’s consent. The language must be used in whole, exactly as provided. Further, the language on this form must exist as one stand-alone document. The language may NOT be included with other consent forms or any other language.</p><p align="justify">NOTICE: The prospective employment concept referenced in this form contemplatesthe definition of “employee” contained at 49 C.F.R. 383.5.</p><h3><center>SCHEDULE “A” “2”THE COMMERCIAL DRIVER’S LICENSE DRUG AND ALCOHOL CLEARINGHOUSE ANNUAL CONSENT FORM FOR LIMITED QUERIE</center></h3><center>(TO BE EXECUTED BY ALL CURRENT EMPLOYEES AND ALL APPLICANTS WHO ARE OFFERED EMPLOYMENT)</center><p align="justify">My signature below confirms that I agree to allow the Company or their representative, '+orgName+', to conduct an Annual Limited Query on my record with the Commercial Driver’s License (CDL) Drug and Alcohol Clearinghouse. I understand that a Limited Query will not reveal any of the details of my record with the Clearinghouse.</p><p align="justify">Furthermore, I understand that, if the Limited Query reveals that the Clearinghouse has information on me indicating that I have been in violation, I must immediately register with the Clearinghouse at clearinghouse.fmcsa.dot.gov and grant permission for the Company or their representative to run a Full Query on my record with the Clearinghouse. I understand that the Company or their representative must run the Full Query within 24 hours of receiving the results of the Limited Query indicating a violation on my part.</p><p align="justify">I agree that, if I fail to register with the Clearinghouse within 24 hours, I will be removed from safety sensitive functions until the Company or their representative is able to conduct the Full Query and the results confirm that my record contains no violations as outlined in this Policy.</p><p align="justify">I agree that, if my record with the Clearinghouse reveals that I have engaged in prohibited conduct (i.e. a violation) as outlined in this Policy or the DOT rules, I will be removed from safety sensitive functions until/unless I have completed the SAP evaluation, referral and education/treatment process as described in this Policy.</p><p align="justify">I understand that, if any information is added to my Clearinghouse record within the 30-day period immediately following the Company’s or their representative’s Query on me, the Company will be notified by the Federal Motor Carrier Safety Administration (FMCSA).</p><p align="justify">My signature below confirms that I have read and understood the above terms and that I grant permission for an Annual Limited Query on my record with the Commercial Driver’s License Drug and Alcohol Clearinghouse for the duration of my employment with the Company.</p><p align="justify"><b>Date this at:</b> <span id="getupdatedDate">' + certificateDate + '</span></p><p align="justify"><b>Printed Name of Employee as it appears on DL</b> ' + getDriver.driver_name + '</p><p align="justify"><b>Driver’s License No:</b> ' + getDriver.driver_license + ' <b>Province:</b> ' + getDriver.province + '</p><p align="justify"><b>Employee Date of Birth:</b> ' + getDriverdetails.DOB + '</p><p align="justify"><b>Drivers Signature:</b> <span id="">' + ImagesAttachment + '</span></p><p align="justify"><b>Supervisor Signature:</b> <span id="">' + adminImagesAttachment + '</span></p> '
                let Formfooter = '</div></div></div></div>';
                let Form = Formheader + Formbody + Formfooter+'<style>@page { size: auto;  margin: 0mm; }</style>'
                res.json({ status: true, datas: Form });
            }
            else {
                res.json({ status: false });
            }
        } else {
            res.json({ status: false });
        }
        // -----------clearingHouseConsent certificate-----------------
    } else if (pdfGenerate == 'compensatedWork') {
        let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: driverid, certificateID: 6 }, raw: true });
        if (CertificateauthDtls != null) {
            // -----------compensatedWork certificate-----------------
            let getDriverdetails = await Driverdetails.findOne({ where: { driverId: driverid }, raw: true });
            // console.log(1);
            let getDrivinghistoryData = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
            // console.log(2);
            let getDriver = await Driver.findOne({ where: { id: driverid }, raw: true });
            let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: driverid, certificateID: 6 }, raw: true });
            //    console.log(3);
            let getcmpdtls = await Company.findOne({ where: { id: getDriver.company_id }, raw: true });
            let CertificateauthDtlsf;
            let certificateIDSixFirtstPrams;
            let adminSignature;
            let certificateIDSixSecondPrams;
            let certificateDate;
            CertificateauthDtlsf = CertificateauthDtls ? CertificateauthDtls.approve : ""
            certificateDate = CertificateauthDtls ? CertificateauthDtls.date : ""
            adminSignature = CertificateauthDtls ? CertificateauthDtls.adminSignature : ""
            certificateIDSixFirtstPrams = CertificateauthDtls ? CertificateauthDtls.certificateIDSixFirtstPrams : ""
            certificateIDSixSecondPrams = CertificateauthDtls ? CertificateauthDtls.certificateIDSixSecondPrams : ""
            let signature = getDrivinghistoryData ? getDrivinghistoryData.signature : '';
            let attachmentpath = "uploads/attachment/drivinghistoryaddressSignature/" + signature;
            if (signature) {
                ImagesAttachment = '<img id="signature" alt="user" width="150" src="' + attachmentpath + '">';
            } else {
                ImagesAttachment = '';
            }
            let adminattachmentpath = "uploads/attachment/drivinghistoryaddressSignature/" + adminSignature;
            if (signature) {
                ImagesAttachment = '<img id="signature" alt="user" width="150" src="' + attachmentpath + '">';
            } else {
                ImagesAttachment = '';
            }
            if (driverid) {
                let Formheader = '<head><title>' + getDriverdetails.firstName + '_' + pdfGenerate + '</title></head><div style=""></div><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'COMPENSATED WORK</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
                let Formbody
                if (CertificateauthDtls) {
                    Formbody = '<h3><center>Driver Certification for Other Compensated Work</center></h3><p align="justify">When employed by a motor carrier, a driver must report to the carrier all on-duty time including time working for other employers. The definition of on-duty time found in Section 395.2 paragraphs (8) and (9) of the Federal Motor Carrier Safety Regulations includes time performing any other work in the capacity of, or in the employer or service of, a common, contract or private motor carrier, also performing any compensated work for any non-motor carrier entity.</p><p align="justify"><b>Are you currently working for another employer</b> <span id="certificateIDSixFirtstPrams">' + certificateIDSixFirtstPrams + '</span></p><p align="justify"><b>Currently do have your intent to work for another employer while still employed by this company?</b> <span id="certificateIDSixSecondPrams">' + certificateIDSixSecondPrams + '</span></p><p align="justify"><b>Date this at:</b> <span id="getupdatedDate">' + certificateDate + ' at ' + getDriverdetails.companyProvince + '</span></p><p align="justify"><b>Drivers Signature:</b> <span id="">' + ImagesAttachment + '</span></p>'

                } else {
                    Formbody = '';
                }

                let Formfooter = '</div></div></div></div>';
                let Form = Formheader + Formbody + Formfooter+'<style>@page { size: auto;  margin: 0mm; }</style>'
                res.json({ status: true, datas: Form });
            }
            else {
                res.json({ status: false });
            }
        } else {
            res.json({ status: false });
        }
        // -----------compensatedWork certificate-----------------
    }
    else if (pdfGenerate == 'drugAndAlcohol') {
        let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: driverid, certificateID: 7 }, raw: true });
        if (CertificateauthDtls != null) {
            // -----------drug And Alcohol certificate-----------------
            let getDriverdetails = await Driverdetails.findOne({ where: { driverId: driverid }, raw: true });
            // console.log(1);
            let getDrivinghistoryData = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
            // console.log(2);
            let getDriver = await Driver.findOne({ where: { id: driverid }, raw: true });

            //    console.log(3);
            let getcmpdtls = await Company.findOne({ where: { id: getDriver.company_id }, raw: true });
            let CertificateauthDtlsf;
            let certificateIDSixFirtstPrams;
            let adminSignature;
            let certificateIDSixSecondPrams;
            let certificateDate;
            let drugAlcoholPointone;
            let drugAlcoholPointtwo
            let drugAlcoholPointthree
            let drugAlcoholPointfour
            let drugAlcoholPointfive
            let drugAlcoholPointsix
            CertificateauthDtlsf = CertificateauthDtls ? CertificateauthDtls.approve : ""
            certificateDate = CertificateauthDtls ? CertificateauthDtls.date : ""
            adminSignature = CertificateauthDtls ? CertificateauthDtls.adminSignature : ""
            certificateIDSixFirtstPrams = CertificateauthDtls ? CertificateauthDtls.certificateIDSixFirtstPrams : ""
            certificateIDSixSecondPrams = CertificateauthDtls ? CertificateauthDtls.certificateIDSixSecondPrams : ""
            drugAlcoholPointone = CertificateauthDtls ? CertificateauthDtls.drugAlcoholPointone : ""
            drugAlcoholPointtwo = CertificateauthDtls ? CertificateauthDtls.drugAlcoholPointtwo : ""
            drugAlcoholPointthree = CertificateauthDtls ? CertificateauthDtls.drugAlcoholPointthree : ""
            drugAlcoholPointfour = CertificateauthDtls ? CertificateauthDtls.drugAlcoholPointfour : ""
            drugAlcoholPointfive = CertificateauthDtls ? CertificateauthDtls.drugAlcoholPointfive : ""
            drugAlcoholPointsix = CertificateauthDtls ? CertificateauthDtls.drugAlcoholPointsix : ""
            let signature = getDrivinghistoryData ? getDrivinghistoryData.signature : '';
            let attachmentpath = "uploads/attachment/drivinghistoryaddressSignature/" + signature;
            if (signature) {
                ImagesAttachment = '<img id="signature" alt="user" width="150" src="' + attachmentpath + '">';
            } else {
                ImagesAttachment = '';
            }
            let adminattachmentpath = "uploads/attachment/drivinghistoryaddressSignature/" + adminSignature;
            if (signature) {
                ImagesAttachment = '<img id="signature" alt="user" width="150" src="' + attachmentpath + '">';
            } else {
                ImagesAttachment = '';
            }
            if (driverid) {
                let Formheader = '<head><title>' + getDriverdetails.firstName + '_DrugAndAlcohol</title></head><div style=""></div><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'DRUG AND ALCOHOL</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
                let Formbody = '<h3><center>Review and Sign Consent - Consent to Previous Employment + Drug & Alcohol History Verification</center></h3><p align="justify">I, ' + getDriver.driver_name + ', am applying for employment at ' + getcmpdtls.name + '.  (my "Potential Employer") and want to provide my consent for only this application l agree that my Potential Employer and its service provider,Compliance Mentroz ("Service Provider”), may contact all my former employers to conduct a reference and driving safety check that includes the collection and assessment of information about my dates of employment, employment status, job duties and driving experience, reason for leaving, job performance and incident/accident record.</p><p align="justify">I agree that my Potential Employer and its Service Provider may contact all organizations who have issued educational awards or credentials that I have identified to confirm my awards and credentials.</p><p align="justify">I understand that Service Provider retains employment history records on behalf of anumber of employers in the trucking industry. I agree that Service Provider, on behalf of my Potential Employer, may check these records to confirm my employment history and conduct a reference and driving safety check that includes an assessment of my dates of employment, employment status, job duties and driving experience, reason for leaving, job performance and incident/accident record.</p><p align="justify">I agree that that my Potential Employer and Service Provider may use and disclose my personal information as required for the above-noted purposes and agree that each of the organizations that are contacted for the above-noted purposes may disclose information to either my Potential Employer or its Service Provider. Iwill not hold my Potential Employer or Service Provider or said organizations liable for this disclosure.</p><p align="justify">I agree that Service Provider may retain all personal information it collects for the above-noted purposes on behalf of my Potential Employer, who shall contro! and have a full right of access to records of my personal information that Service Provider creates and retains. I will not hold Service Provider liable for any losses arising out of its retention or handling of my personal information.</p><p align="justify"><br> I understand that I have the right to (1) to review the information provided by previous employers, (2) have errors corrected and re-submitted by previous employers and (3) have a rebuttal statement attached to information I allege to be erroneous if my previous employer and I cannot agree on the accuracy of information.</p><p align="justify">l understand that I may direct any questions I have about this consent and about how Service Provider handles personal information on behalf of my Potential Employer to Compliance Mentroz. at driverhiring@compliancementorz.com or by phone at +1 (905) 486-1666</p><p align="justify">I certify that this application was completed by me and that all entries on it and information in it are true and complete to the best of my knowledge. I understand that any misstatement or omission of information in this application may result in my dismissal.</p><p align="justify">I hereby authorize release of information from my Department of Transportation regulated drug and alcohol testing records by my previous employer, to the prospective employer named below and /or its service provider Compliance Mentroz. This release is in accordance with DOT Regulation 49 CFR Part 40, Section 40.25. I understand that information to be released by my previous employer, is limited to the following DOT-regulated testing items:</p><p align="justify"> 1.Alcohol tests with a result of 0.04 or higher:  '+drugAlcoholPointone+'</p><p align="justify"> 2.Verified positive drug tests : '+drugAlcoholPointtwo+' </p><p align="justify"> 3.Refusals to be tested : '+drugAlcoholPointthree+'</p><p align="justify"> 4.Other violations of DOT agency drug and alcohol testing regulations : '+drugAlcoholPointfour+' </p><p align="justify"> 5.Information obtained from previous employers of a drug and alcohol rule violation : '+drugAlcoholPointfive+' </p><p align="justify"> 6.Documentation,if any,of completion of the return-to-duty process following a rule violation : '+drugAlcoholPointsix+' </p><p align="justify"><b>Date this at:</b> <span id="certificateDate">' + certificateDate + ' at ' + getDriverdetails.companyProvince + '</span></p><p align="justify"><b>Driver Name</b> ' + getDriver.driver_name + '</p><p align="justify"><b>Drivers Signature:</b> <span id="">' + ImagesAttachment + '</span></p>'
                let Formfooter = '</div></div></div></div>';
                let Form = Formheader + Formbody + Formfooter+'<style>@page { size: auto;  margin: 0mm; }</style>'
                res.json({ status: true, datas: Form });
            }
            else {
                res.json({ status: false });
            }
        }
        else {
            res.json({ status: false });
        }
        // -----------drug And Alcohol certificate-----------------
    }
    else if (pdfGenerate == 'HOS') {
        // -----------HOS -----------------
        let getdriver = await Driver.findOne({ where: { id: driverid }, raw: true });
        // let getDriverdetails = await Driverdetails.findOne({ where: { driverId: driverId }, raw: true });
        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
        let getcmpdtls = await Company.findOne({ where: { id: getdriver.company_id }, raw: true });
        let gethosdtls = await Hos.findOne({ where: { driverId: driverid }, raw: true });
        let getDrivinghistoryaddress = await Drivinghistoryaddress.findOne({ where: { driverId: driverid }, order: [['id', 'DESC']], raw: true });
        let driverName = getdriver ? getdriver.driver_name : '';
        let driver_license = getdriver ? getdriver.driver_license : '';
        let getDrivinghistorySignature = getDrivinghistory ? getDrivinghistory.signature : '';
        let companyName = getcmpdtls ? getcmpdtls.name : '';
        let hosdateData = gethosdtls ? gethosdtls.dateData : '';
        let hosdurationData = gethosdtls ? gethosdtls.durationData : '';
        let hosselectedDate = gethosdtls ? gethosdtls.selectedDate : '';
        let hoscreatedAt = gethosdtls ? gethosdtls.createdAt : '';
        let totalDuration = gethosdtls ? gethosdtls.totalDuration : '';
        let hosAttachment_attachment = gethosdtls ? gethosdtls.hosAttachment_attachment : '';
        let getDrivinghistoryaddressprovince = getDrivinghistoryaddress ? getDrivinghistoryaddress.province : '';
        let getDrivinghistoryaddresslicense = getDrivinghistoryaddress ? getDrivinghistoryaddress.license : '';
        let signaturedata = getDrivinghistorySignature
        if (signaturedata) {
            signature = '<img style="width: 30%" src="uploads/attachment/drivinghistoryaddressSignature/' + getDrivinghistorySignature + '"';
        } else {
            signature = ''
        }
        let getDtls = await Hos.findAll({ where: { driverId: driverid }, raw: true });
        let n = 1
        tableData += '</div> <table border="1" cellspacing="0" cellpadding="0" width="200" align="center" style="width: 100%;border: 1px solid black;" id="table" class="table table-striped table-bordered"><thead><tr><th class="thClass">Sl</th><th class="thClass">Date</th><th class="thClass">Duration</th></tr></thead><tbody></tbody>'
        if (getDtls) {
            await getDtls.forEach(function (getDetails, i) {
                tableData += '<tr align="center" style="font-size: 20px;border: 1px solid black;"><td style="border: 1px solid black;">' + n + '</td><td style="border: 1px solid black;">' + getDetails.actualDate + '</td><td style="border: 1px solid black;">' + getDetails.duration + '</td> </tr>';
                n++;
            });
        }
        else {
            tableData = '';
        }
        if (driverid) {
            let Formheader = '<head><title>' + getDriverdetails.firstName + '_' + pdfGenerate + '</title></head><div style=""></div><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'HOS</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
            let Formbody = '<div class="col-md-12"><center><i style="font-size:50px" class="mdi mdi-clock-fast"></i><br><h3>Statement of Hours of Service</h3></center><p align="justify">New Hires, Contractors, Casual &amp; Temporary Employees</p><hr><b>Name:</b><span id="driverName">' + driverName + '</span><hr><div class="row"><div class="col-md-4"><b>Drivers Licence Number:</b><span id="driver_license">' + driver_license + '</span></div><div class="col-md-4"><b>Class of License:</b><span id="getDrivinghistoryprovince">' + getDrivinghistoryaddressprovince + '</span></div><div class="col-md-4"><b>Issuing Province:</b><span id="getDrivinghistorylicense">' + getDrivinghistoryaddresslicense + '</span></div></div><hr><p align="justify">Section 81. (2)(c) The motor carrier maintains accurate and legible records showing, for each day, the drivers duty status and elected cycle, the hour at which each duty status begins and ends and the total number of hours spent in each status and keeps those records for a minimum period of 6 months after the day on which they were recorded. Section 84. No driver who is required to fill out a daily log shall drive and no motor carrier shall request, require or allow the driver to drive unless the driver has in their possession (a) a copy of the daily logs for the preceding 14 days and, in the case of a driver driving under an oil well service permit, for each of the required 3 periods of 24 consecutive hours of off-duty time in any period of 24 days; (b) the daily log for the current day, completed up to the time at which the last change in the driver’s duty status occurred;<br></p><div class="row"><div class="col-md-7"><b><input class="form-check-input" id="Iagree" name="Iagree" type="checkbox" value="1" checked="checked" disabled="disabled"> I hereby certify that the information given below is correct to the best of my knowledge and belief,and that I was last relieved from work at:</b></div><div class="col-md-3"><span id="hosdurationData">' + hosdurationData + '</span><br>On<br><span id="hosdateData">' + hosdateData + '</span></div></div><hr>INSTRUCTIONS: Day 1 is the day before you first begin work for this motor carrier. The dates have been pre-filled based on todays date. If you need to change the DAY 1 date, Click here<br><br><div class="row"><b>Selected Date :</b><span id="hosselectedDate">' + hosselectedDate + '</span></div><br><div style="width:100%" class="container1"></div><br><div style="text-align:left"><b>Employee Signature:</b> ' + signature + '<br><div><b>Name:</b><span id="driverName">' + driverName + '</span></div><br><div><b>Drivers Licence Number:</b><span id="driver_license">' + driver_license + '</span><br></div><br><div><b>Date:</b><span id="hoscreatedAt">' + hoscreatedAt + '</span><br></div></div></div>'
            let Formfooter = '</div></div></div></div>';
            let Form = Formheader + Formbody + Formfooter+'<style>@page { size: auto;  margin: 0mm; }</style>'
            res.json({ status: true, datas: Form + '<div style="break-after:page"></div>' + tableData + '<div><b>Total Duration:</b><span id="totalDurationData">' + totalDuration + '</span><br></div>' });
        }
        else {
            res.json({ status: false });
        }
        // -----------HOS -----------------
    }
    else if (pdfGenerate == 'QuestionOne') {
        // -----------QuestionOne -----------------
        let getdriver = await Driver.findOne({ where: { id: driverid }, raw: true });
        console.log(driverid);
        let getQuestiongroupone = await Questiongroupone.findOne({ where: { driverId: driverid }, raw: true });
        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
        console.log(getQuestiongroupone);

        let driverName = getdriver ? getdriver.driver_name : '';
        let driver_license = getdriver ? getdriver.driver_license : '';
        let getDrivinghistorySignature = getDrivinghistory ? getDrivinghistory.signature : '';
        let signaturedata = getDrivinghistorySignature
        let signature
        if (signaturedata) {
            signature = '<img style="width: 30%" src="uploads/attachment/drivinghistoryaddressSignature/' + getDrivinghistorySignature + '"/>';
        } else {
            signature = ''
        }
        if (driverid && getQuestiongroupone) {
            let Formheader = '<head><title>' + getDriverdetails.firstName + '_InterviewQuestions</title></head><div id=""> <div> <h3 style="margin-bottom:50px;text-align:center;">'+cmpd_img+'Interview Questions</h3> </div><div style="text-align: center2;margin: 1px;padding: 5px;" class="row"> <div style="padding: 5px;" class="col-md-12">';
            let Formbody = '<div class="card-body" id=""><div style="text-align:center"><span><h4></h4></span></div><br><div class=""><div class=""><b>Name of Driver :</b><span id="driverName">' + driverName + '</span><br><b>License No :</b><span id="driver_license">' + driver_license + '</span><br><br><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px"><label for="question1" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">1. What are your strengths as a driver?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question1 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px;"><label for="question2" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">2. Why are you looking for a job?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question2 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px;"><label for="question3" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">3. Why did you choose to approach our company?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question3 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px;"><label for="question4" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">4. Can you provide references from your current or previous employers or we can verify it? Please provide contact details.</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question4 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px;"><label for="question5" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">5. If you have any preferred area to haul loads and why?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question5 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px;"><label for="question6" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">6. What training do you think you will require doing this job?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question6 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px;"><label for="question7" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">7. What would your current employer have to do to make you stay?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question7 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px;"><label for="question8" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">8. Tell me how you handled a problem with a dispatcher / customer?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question8 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px;"><label for="question9" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">9. Tell me about the last roadside inspection you had and where?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question9 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px;"><label for="question10" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">10. If you ever had problem at the border? If yes explain.</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question10 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px;"><label for="question11" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">11. If you have a previous collision / citation, tell me about it and what you would do different now?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question11 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px;"><label for="question12" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">12. Did you receive remedial training from the collision / citation? If answer to above is yes.</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question12 + '</span></div></div><br><div class="row" style="margin-bottom:1rem;width:100%;float:left;"><div class="col-md-6" style="width:50%;float:left;"><b>Drivers Signature :</b>' + signature + '</div> <div class="col-md-6" style="width:50%;float:left;"><b>Name of the Interviewer :</b><span>' + getQuestiongroupone.interviewer + '</span></div></div></div></div>'
            let Formfooter = '</div></div></div>';
            let Form = Formheader + Formbody + Formfooter+'<style>@page { size: auto;  margin: 0mm; }</style>'
            res.json({ status: true, datas: Form });
        }
        else {
            res.json({ status: false });
        }
        // -----------QuestionOne end -----------------
    }
    else if (pdfGenerate == 'QuestionTwo') {
        // -----------QuestionOne -----------------
        let getdriver = await Driver.findOne({ where: { id: driverid }, raw: true });
        console.log(driverid);
        let getQuestiongrouptwo = await Questiongrouptwo.findOne({ where: { driverId: driverid }, raw: true });
        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
        console.log(getQuestiongrouptwo);

        let driverName = getdriver ? getdriver.driver_name : '';
        let driver_license = getdriver ? getdriver.driver_license : '';
        if (driverid && getQuestiongrouptwo) {
            var right_wrongs = JSON.parse(getQuestiongrouptwo.rightorwrong);
            for (i = 0; i < 32; i++) {
                if (right_wrongs[i] == '1') {
                    right_wrongs[i] = 'Yes';
                }
                else {
                    right_wrongs[i] = 'No';
                }
            }
            var wrong = parseInt(32) - parseInt(getQuestiongrouptwo.result);
            let Formheader = '<head><title>' + getDriverdetails.firstName + '_DriverManual' + '</title></head><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'Driver Manual</h3> </div><div style="text-align: center2;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
            let Formbody = '<div class="card-body" id=""><div style="text-align:center"><span><h4></h4></span></div><br><div class=""><div class=""><div style="width:100%;float:left"><div style="width:75%;float:left"><b>Name of Driver :</b><span id="driverName">' + driverName + '</span></div>';
            if (getQuestiongrouptwo.approveStatus == 0) {
                Formbody += '<div style="width:25%;float:left"><b>Result : No Result</b></div></div><br><br><br>';
            }
            else {
                Formbody += '<div style="width:25%;float:left"><b>Result : </b><b style="margin-left:10px;"> Right : </b> <span id="vans_right">' + getQuestiongrouptwo.result + '</span><b style="margin-left:10px;"> Wrong : </b><span id="vans_wrong">' + wrong + '</span></div></div><br><br><br>';
            }
            Formbody += '<div class="form-group row" style="margin-bottom:2rem;"><label for="question1" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q1. In the event a driver receives a speed infraction what are the disciplinary action will be taken?</label><div class="col-md-12"  style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question1 + '</span></div></div><br><div class="form-group row"  style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[0] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question2" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q2. How many duty cycles are available? What are they?</label><div class="col-md-12"  style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question2 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[1] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question3" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q3. What is preventable Accident?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question3 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[2] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question4" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q4. What are the basic causes of an accidents?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question4 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[3] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question5" class="col-sm-12 control-label col-form-label" style="width:50%;float:left;">Q5. What is securing the scene?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question5 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[4] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question6" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q6. Am I allowed to drive a vehicle above the speed of 105 Km/H?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question6 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[5] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question7" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q7. Am I allowed to disconnect dash cams while on duty or off duty?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question7 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[6] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question8" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q8. Am I allowed take less rest to cover the destination quickly?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question8 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[7] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question9" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q9. What is cargo securement?.</label><div class="col-md-12" style="width:50%;float:left;"><span>' + getQuestiongrouptwo.question9 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[8] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question10" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q10. Am I allowed to drive entire 14 hours during 14 hours on duty time?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question10 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[9] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question11" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q11. How many hours can I drive during 14 hours of on duty time?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question11 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[10] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question12" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q12. How many hours of off duty is required in 16 hours working window?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question12 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[11] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question13" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q13. What is the minimum time for a rest break?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question13 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[12] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question14" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q14. Can I switch cycle?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question14 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[13] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question15" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q15. What is Cycle reset?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question15 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[14] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question16" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q16. What is the limit of personal conveyance?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question16 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[15] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question17" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q17. What if I exceed the limit of personal conveyance?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question17 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[16] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question18" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q18. Am I allowed to split Sleeper Berth times into 2?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question18 + '</span></div></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[17] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question19" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q19. Am I allowed to drive a motor vehicle without doing a PTI?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question19 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[18] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question20" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q20. What are the checks needs to be done in a pre‐trip inspection?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question20 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[19] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question21" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q21. Can a driver drive the vehicle with a passenger?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question21 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[20] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question22" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q22. What is an unsafe act?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question22 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[21] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question23" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q23. What is jackknifing?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question23 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[22] + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question24" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q24. Why accident reporting is necessary?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question24 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[23] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question25" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q25. What are information required post accident?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question25 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[24] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question26" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q26. Is it wise to accept guilt at the accident spot?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question26 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[25] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question27" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q27. What is social media policy?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question27 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:100%;float:left;"><span>' + right_wrongs[26] + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question28" class="col-sm-12 control-label col-form-label" style="width:50%;float:left;">Q28. What is Highway traffic act (HTA)?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question28 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[27] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question29" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q29. What is C‐ TPAT procedure?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question29 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[28] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question30" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q30. What is President’s Safety Award?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question30 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question30 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[29] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question31" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q31. What is Accident Reporting & Investigation Policy?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question31 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[30] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question32" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q32. What are the accident investigation procedure?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question32 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[31] + '</span></div></div></div></div>'
            let Formfooter = '</div></div></div>';
            let Form = Formheader + Formbody + Formfooter+'<style>@page { size: auto;  margin: 0mm; }</style>'
            res.json({ status: true, datas: Form });
        }
        else {
            res.json({ status: false });
        }
        // -----------QuestionOne end -----------------
    }
    else if (pdfGenerate == 'Canadahos') {
        // -----------Canadahos -----------------
        let getdriver = await Driver.findOne({ where: { id: driverid }, raw: true });
        console.log(driverid);
        let getCanadahos = await Canadahos.findOne({ where: { driverId: driverid }, raw: true });
        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
        console.log(getCanadahos);

        let driverName = getdriver ? getdriver.driver_name : '';
        let driver_license = getdriver ? getdriver.driver_license : '';
        if (driverid && getCanadahos) {
            var right_wrongs = JSON.parse(getCanadahos.rightorwrong);
            for(i=0;i<15;i++){
                if(right_wrongs[i] == '1'){
                    right_wrongs[i] = 'Yes';
                }
                else{
                    right_wrongs[i] = 'No';
                }
            }
            var wrong  = parseInt(15) - parseInt(getCanadahos.result);
            var percentage  = (parseFloat(getCanadahos.result) / 15)*100;
            let Formheader = '<head><title>'+ getDriverdetails.firstName+'_canadahos'+'</title></head><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'HOS Questionnaire for Canada South Regulations</h3> </div><div style="text-align: center2;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
            let Formbody = '<div class="card-body" id=""><div style="text-align:center"><span><h4></h4></span></div><br><div class=""><div class=""><div style="width:100%;float:left"><div style="width:50%;float:left"><b>Name of Driver :</b><span id="driverName">' + driverName + '</span></div>';
			if(getCanadahos.approveStatus==0){
				Formbody += '<div style="width:50%;float:left"><b>Result : No Result</b></div></div>';
			}
			else{
				Formbody += '<div style="width:50%;float:left"><b>Result : </b><span id="vans_wrong">'+percentage.toFixed(2)+'%-'+getCanadahos.result+' out of 15</span></div></div>';
			}
            Formbody += '<div style="width:100%;float:left"><b>Licence :</b><span id="driverlicence">' + driver_license + '</span></div><br><br><br>';
			Formbody += '<div class="form-group row" style="margin-bottom:2rem;"><label for="question1" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">1. The Canada South rule states that a driver can be on duty for maximum 14 hours before he/she:</label><div class="col-md-12"  style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question1=='takes a 8-hour break'){
                Formbody += '<span style="color:green">' + getCanadahos.question1 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question1 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">takes a 8-hour break</span>';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question2" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">2. If you are driving a bobtail, you can use personal conveyance to pick up a loaded trailer</label><div class="col-md-12"  style="width:100%;float:left;">Selected Answer: ';
            if(getCanadahos.question2=='False'){
                Formbody += '<span style="color:green">' + getCanadahos.question2 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question2 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">False</span>';
            }
            Formbody +=' </div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question3" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">3. As per Canadian South HOS regulation, A driver can make Yard move</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer: ';
            if(getCanadahos.question3=='only when on duty'){
                Formbody += '<span style="color:green">' + getCanadahos.question3 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question3 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">only when on duty</span>';
            }
            Formbody +=' </div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question4" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">4. As per Canada South HOS regulation, A driver has to take a minimum ___ hours off  in a day.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question4=='10'){
                Formbody += '<span style="color:green">' + getCanadahos.question4 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question4 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">10</span>';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question5" class="col-sm-12 control-label col-form-label" style="width:50%;float:left;">5. The Sum of which two duty status are taken into account, to calculate your 70 hours of total on duty time in 7 days?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question5=='Driving and on duty other than driving'){
                Formbody += '<span style="color:green">' + getCanadahos.question5 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question5 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">Driving and on duty other than driving</span>';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question6" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">6. In Canada, a driver can defer 2 hours off duty to next day</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question6=='True'){
                Formbody += '<span style="color:green">' + getCanadahos.question6 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question6 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">True</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question7" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">7. While driving with a co-driver,</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question7=='All of the above'){
                Formbody += '<span style="color:green">' + getCanadahos.question7 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question7 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">All of the above</span>';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question8" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">8. Your logbook should always be updated till</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question8=='Last change of duty status'){
                Formbody += '<span style="color:green">' + getCanadahos.question8 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question8 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">Last change of duty status</span>';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question9" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">9. The 16th hour of a shift can be calculated by excluding, more than 2 hours off duty taken by , which is at least 10 hours  when added to next of duty period.</label><div class="col-md-12" style="width:50%;float:left;">Selected Answer:  ';
            if(getCanadahos.question9=='False'){
                Formbody += '<span style="color:green">' + getCanadahos.question9 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question9 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">False</span>';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question10" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">10. A driver has take 24 hrs off in any 14 days?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question10=='True'){
                Formbody += '<span style="color:green">' + getCanadahos.question10 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question10 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">True</span>';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question11" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">11. How many hours of reset time  is required to change from 120 hours /14 days cycle to 70 hours/7 days cycle?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question11=='72'){
                Formbody += '<span style="color:green">' + getCanadahos.question11 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question11 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">72</span>';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question12" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">12. Pre trip inspection of a vehicle needs to be done at least once in every 24 hours.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question12=='True'){
                Formbody += '<span style="color:green">' + getCanadahos.question12 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question12 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">True</span>';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question13" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">13. In Canada, A driver can drive maximum 13 hours ,</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question13=='Both b & c'){
                Formbody += '<span style="color:green">' + getCanadahos.question13 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question13 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">Both b & c</span>';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question14" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">14. As per Canadian South HOS regulation,  if a driver can take less than 30 minutes off duty to complete his mandatory 10 hours off duty in a day</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question14=='False'){
                Formbody += '<span style="color:green">' + getCanadahos.question14 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question14 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">False</span>';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question15" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">15. A  driver driving within 160 km radious, is exempted from HOS rules</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question15=='False'){
                Formbody += '<span style="color:green">' + getCanadahos.question15 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question15 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">False</span>';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br></div></div>';
            let Formfooter = '</div></div></div>';
            let Form = Formheader + Formbody + Formfooter+'<style>@page { size: auto;  margin: 0mm; }</style>'
            res.json({ status: true, datas: Form });
        }
        else {
            res.json({ status: false });
        }
        // -----------Canadhos end -----------------
    }
    else if (pdfGenerate == 'ushos') {
        // -----------Ushos -----------------
        let getdriver = await Driver.findOne({ where: { id: driverid }, raw: true });
        console.log(driverid);
        let getushos = await Usquestion.findOne({ where: { driverId: driverid }, raw: true });
        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
       

        let driverName = getdriver ? getdriver.driver_name : '';
        let driver_license = getdriver ? getdriver.driver_license : '';
        if (driverid && getushos) {
            var right_wrongs = JSON.parse(getushos.rightorwrong);
            for(i=0;i<15;i++){
                if(right_wrongs[i] == '1'){
                    right_wrongs[i] = 'Yes';
                }
                else{
                    right_wrongs[i] = 'No';
                }
            }
            var wrong  = parseInt(15) - parseInt(getushos.result);
            var percentage  = (parseFloat(getushos.result) / 15)*100;
            let Formheader = '<head><title>'+ getDriverdetails.firstName+'_ushos'+'</title></head><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'HOS Questionnaire for US</h3> </div><div style="text-align: center2;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
            let Formbody = '<div class="card-body" id=""><div style="text-align:center"><span><h4></h4></span></div><br><div class=""><div class=""><div style="width:100%;float:left"><div style="width:50%;float:left"><b>Name of Driver :</b><span id="driverName">' + driverName + '</span></div>';
			if(getushos.approveStatus==0){
				Formbody += '<div style="width:50%;float:left"><b>Result : No Result</b></div></div>';
			}
            else{
				Formbody += '<div style="width:50%;float:left"><b>Result : </b><span id="vans_wrong">'+percentage.toFixed(2)+'%-'+getushos.result+' out of 15</span></div></div>';
			}
            Formbody += '<div style="width:100%;float:left"><b>Licence :</b><span id="driverlicence">' + driver_license + '</span></div><br><br><br>';
			Formbody += '<div class="form-group row" style="margin-bottom:2rem;"><label for="question1" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">1. Which of the following would be recorded as on duty not driving:</label><div class="col-md-12"  style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question1=='spending 1 hour unloading the trailer'){
                Formbody += '<span style="color:green">' + getushos.question1 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question1 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">spending 1 hour unloading the trailer</span>';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question2" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">2. If a driver is taking split sleeper (2+8) in USA, Duty status must be recorded as:</label><div class="col-md-12"  style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question2=='off duty, Sleeper berth'){
                Formbody += '<span style="color:green">' + getushos.question2 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question2 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">off duty, Sleeper berth</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question3" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">3. A commercial driver can use personal conveyance to drive if his/her driving time is exhausted and he is 45 minutes away from destination.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question3!='' && getushos.question3=='False'){
                Formbody += '<span style="color:green">' + getushos.question3 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question3 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">False</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question4" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">4. A  Canadian driver can do Yard move on a Public road within US</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question4!='' && getushos.question4=='False'){
                Formbody += '<span style="color:green">' + getushos.question4 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question4 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">False</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question5" class="col-sm-12 control-label col-form-label" style="width:50%;float:left;">5. A driver can go for 30 min On-duty not driving, after 8 hours driving in US</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question5=='True'){
                Formbody += '<span style="color:green">' + getushos.question5 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question5 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">True</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question6" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">6. In a snow storm, a driver can extend his shift to 16 hours and drive time to 13 hours in US, if:</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question6=='Storm started while duty status is driving and have to reach safe place'){
                Formbody += '<span style="color:green">' + getushos.question6 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question6 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">Storm started while duty status is driving and have to reach safe place</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question7" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">7. A driver can use personal conveyance while crossing the border.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question7!='' && getushos.question7=='False'){
                Formbody += '<span style="color:green">' + getushos.question7 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question7 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">False</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question8" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">8. While Fuelling Duty status must be changed to</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question8=='On duty'){
                Formbody += '<span style="color:green">' + getushos.question8 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question8 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">On duty</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question9" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">9. A Canadian Driver has driven 12 hours in Canada, when he reached Sarina.</label><div class="col-md-12" style="width:50%;float:left;">Selected Answer:  ';
            if(getushos.question9=='He has to take 10 hours off in Canada before crossing the border'){
                Formbody += '<span style="color:green">' + getushos.question9 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question9 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">He has to take 10 hours off in Canada before crossing the border</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question10" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">10. It is mandatory to certify all the logs at the end of 24 Hours period.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question10=='True'){
                Formbody += '<span style="color:green">' + getushos.question10 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question10 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">True</span>';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question11" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">11. Yard move can be used during</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question11=='Loading'){
                Formbody += '<span style="color:green">' + getushos.question11 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question11 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">Loading</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question12" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">12. How many hours of rest required after 14 hours of on duty in USA.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question12=='10'){
                Formbody += '<span style="color:green">' + getushos.question12 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question12 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">10</span>';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question13" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">13. If the ELD stops working when the driver is on a trip, the driver should</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question13=='both a & c'){
                Formbody += '<span style="color:green">' + getushos.question13 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question13 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">both a & c</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question14" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">14. In the United States, how long are you permitted to use paper logs after an ELD malfunction during the trip?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question14!='' && getushos.question14=='Till the trip has been completed'){
                Formbody += '<span style="color:green">' + getushos.question14 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question14 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">Till the trip has been completed</span>';
            }
            console.log(getushos);
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question15" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">15. If a driver has adopted 14/120 cycle in Canada, he can go to US without resetting his cycle.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question15!='' && getushos.question15=='False'){
                Formbody += '<span style="color:green">False</span>';
            }
            else{
                Formbody += '<span style="color:red">False</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">False</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br></div></div>'
            let Formfooter = '</div></div></div>';
            let Form = Formheader + Formbody + Formfooter+'<style>@page { size: auto;  margin: 0mm; }</style>'
            res.json({ status: true, datas: Form });
        }
        else {
            res.json({ status: false });
        }
        // -----------Ushos end -----------------
    }
    else if (pdfGenerate == 'flatbed_checklist') {
        // -----------flatbed -----------------
        let getdriver = await Driver.findOne({ where: { id: driverid }, raw: true });
        let getDriverdetails = await Driverdetails.findOne({ where: { driverId: driverid }, raw: true });
        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
        let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: driverid }, raw: true });
        let driverName = getdriver ? getdriver.driver_name : '';
        let driver_license = getdriver ? getdriver.driver_license : '';
        let getchecklist = await Flabted_checklist.findOne({ where: { driverId:driverid ,company_id: getdriver.company_id }, raw: true });
		let company_name = '';
        if (driverid && getchecklist) {
            if(getdriver.company_id!=''){
                let cur_company  = await Company.findOne({ where: { id: getdriver.company_id}, raw: true });
                company_name = cur_company.name;
            }
            let Formheader = '<head><title>'+ getDriverdetails.firstName+'_flatbed_checklist'+'</title></head><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'Flatbed Services</h3> <h3 style="text-decoration:underline">ORIENTATION CHECK-LIST</h3></hr></div><div style="text-align: center2;margin: 1px;" class="row"> <div style="padding: 5px;" class="col-md-12">';
            let Formbody = '<div class="card-body" id=""><div class="col-md-12 float_left" style="width:100%;float:left"><label class="col-md-6" style="width:50%;float:left">Name of Driver </label><div class="col-md-6 float_left" style="width:50%;float:left">'+driverName+'</div></div><div class="col-md-12 float_left" style="width:100%;float:left"><label class="col-md-6" style="width:50%;float:left">Company Name</label><div class="col-md-6 float_left" style="width:50%;float:left">'+company_name+'</div></div><div class="col-md-12 float_left" style="width:100%;float:left"><label class="col-md-6" style="width:50%;float:left">Driving License#</label><div class="col-md-6 float_left" style="width:50%;float:left">'+driver_license+'</div></div><div class="col-md-12 float_left" style="width:100%;float:left"><div class="col-md-9 float_left" style="width:57%;float:left"><h3 style=" text-decoration: underline;"><b>Online Trainings</b></h3></div> <div class="col-md-3 float_left" style="width:30.33%;float:left"><h3 style="text-align:center">Initials</h3></div> </div><div class="col-md-12 float_left" style="width:100%;float:left"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">1. Defensive Training.</div><div class="col-md-2 float_left" style="width:16%;float:left">'+getchecklist.online1+'</div></div><div class="col-md-12 float_left" style="width:100%;float:left"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">2. Hours of Service and Log Books.</div><div class="col-md-2 float_left" style="width:16%;float:left">'+getchecklist.online2+'</div> </div><div class="col-md-12 float_left" style="width:100%;float:left"><div class="col-md-10" style="margin-left:10px;;width:70%;float:left">3. Vehicle Inspections.</div><div class="col-md-2 float_left" style="width:16%;float:left">'+getchecklist.online3+'</div> </div><div class="col-md-12 float_left" style="width:100%;float:left"><div class="col-md-10" style="margin-left:10px;;width:70%;float:left">4. Cargo Securement for Drivers – Flatbed/Step-decks.</div><div class="col-md-2 float_left" style="width:16%;float:left">'+getchecklist.online4+'</div> </div><div class="col-md-12 float_left" style="width:100%;float:left"><div class="col-md-10" style="margin-left:10px;;width:70%;float:left">5. Safety Laws.</div><div class="col-md-2 float_left" style="width:16%;float:left">'+getchecklist.online5+'</div> </div>';
            Formbody +='<div class="col-md-12 float_left" style="width:100%;float:left"><div class="col-md-9 float_left" style="float:left;width:75%;"><h3 style=" text-decoration: underline;"><b>Practical Trainings</b></h3></div></div><div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">1. Hours of Service and Log Books.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical1+'</div></div><div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">2. Vehicle Inspections.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical2+'</div></div><div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">3. Backing the Trucks/Trailers.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical3+'</div></div>';
            Formbody +='<div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">4. Practical Cargo Securement for drivers – Flatbed/Step-decks.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical4+'</div></div><div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">5. Weight & Dimension Training.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical5+'</div></div><div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">6. Communicating with Shippers and Receivers.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical6+'</div></div>';
            Formbody +='<div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">7. Border Crossing.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical7+'</div></div><div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">8. Backing the Trucks/Trailers.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical8+'</div></div><div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">9. Preparing Loading/Unloading paper-works.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical9+'</div></div><div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">10. Fuelling.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical10+'</div></div><div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">11. How to use Abord/ELD system.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical11+'</div></div><div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">12. Driver Manual, policies and Procedures.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical12+'</div></div><div class="col-md-12 float_left" style="float:left;width:100%;margin-top:10px;"><div class="col-md-6" style="float:left;width:50%"><label class="col-md-6" style="float:left;width:50%;margin-top:10px;">Start Date</label><div class="col-md-6" style="float:left;width:50%;margin-top:10px;">'+getchecklist.start_date+'</div></div><div class="col-md-6 float_left" style="float:left;width:50%"><label class="col-md-6" style="float:left;width:28%;margin-top:10px;">End Date</label><div class="col-md-6" style="margin-top:10px;">'+getchecklist.end_date+'</div></div></div>';
            Formbody +='<div class="col-md-12 float_left" style="float:left;width:100%;margin-top:10px;"><div class="col-md-6 float_left" style="float:left;width:50%"><label class="col-md-6" style="float:left;width:50%">Signature</label><div class="col-md-6" style="float:left;width:50%"><img src="uploads/attachment/drivinghistoryaddressSignature/'+getDrivinghistory.signature+'" alt="user" width="150"></div></div><div class="col-md-6 float_left" style="float:left;width:50%"><label class="col-md-6" style="float:left;width:50%">Signature</label><div class="col-md-6" style="float:left;width:50%"><img src="uploads/attachment/drivinghistoryaddressSignature/'+getDrivinghistory.signature+'" alt="user" width="150"></div></div></div><div class="col-md-12 float_left" style="float:left;width:100%"><br></div> <div class="col-md-12 float_left" style="float:left;width:100%"><hr></div><div class="col-md-12 float_left" style="float:left;width:100%;font-weight: 700;font-size: 21px;"><span style="margin-left:42px;">As</span> per my agreement, I have completed the above mentioned trainings and have received all the trainings properly</div><div class="col-md-12 float_left" style="float:left;width:100%"><hr><div class="col-md-6 float_left" style="float:left;width:50%"><img src="uploads/attachment/checklist/'+CertificateauthDtls.adminSignature+'" alt="user" width="150"></div> <div class="col-md-6 float_left" style="float:left;width:50%"> <img src="uploads/attachment/drivinghistoryaddressSignature/'+getDrivinghistory.signature+'" alt="user" width="150"></div><br><br><br></div><div class="col-md-6 float_left" style="float:left;width:50%">Signature of the Supervisor</div><div class="col-md-6 float_left" style="float:left;width:50%">Signature of the Driver</div><div class="col-md-12" style="padding:0px 0px 0px 28%"><div style="float:left;width:50%" class="col-md-6" ><img src="uploads/attachment/checklist/'+CertificateauthDtls.signature+'" alt="user" width="150"><br><br><br></div></div><div class="col-md-12" style="padding:0px 0px 0px 28%;width:100%"><div class="col-md-12" style="width:100%;float:left"> Witness Signature </div></div>';
            let Formfooter = '</div></div></div>';
            let Form = Formheader + Formbody + Formfooter+'<style>@page { size: auto;  margin: 0mm; }</style>'
            res.json({ status: true, datas: Form });
        }
        else {
            res.json({ status: false });
        }
        // -----------Flatbed end -----------------
    }
    else if (pdfGenerate == 'orientation_checklist') {
        // -----------orientation -----------------
        let getdriver = await Driver.findOne({ where: { id: driverid }, raw: true });
        let getDriverdetails = await Driverdetails.findOne({ where: { driverId: driverid }, raw: true });
        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
        let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: driverid }, raw: true });
        let driverName = getdriver ? getdriver.driver_name : '';
        let driver_license = getdriver ? getdriver.driver_license : '';
        //let getchecklist = await Flabted_checklist.findOne({ where: { driverId:driverid ,company_id: getdriver.company_id }, raw: true });
        let getchecklist = await Certificateauth.findOne({ where: { driverId: driverid, certificateID: 9 }, raw: true });
		let company_name = '';
        if (driverid && getchecklist) {
            if(getdriver.company_id!=''){
                let cur_company  = await Company.findOne({ where: { id: getdriver.company_id}, raw: true });
                company_name = cur_company.name;
            }
            let Formheader = '<head><title>'+ getDriverdetails.firstName+'dry_van_checklist'+'</title></head><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'DRY VAN CHECKLIST</h3> </div><div style="text-align: center2;margin: 1px;" class="row"> <div style="padding: 5px;" class="col-md-12">';
            let Formbody = ' <div class="col-md-12" style="float:left;width:100%"> <table border="2"><tr> <td>Hours of Service</td></tr><tr><td>Pre-Trip Inspection </td></tr><tr><td>Load Securement </td></tr><tr><td>Company CVOR ,SMS and CVOR and Abstract</td></tr> <tr> <td>Accident Reporting</td></tr><tr><td>Incident Reporting procedure</td></tr><tr><td>Gate Procedure</td></tr> <tr><td>Pet Policy</td> </tr><tr><td>Cell and Text Policy</td></tr><tr><td>Defensive Driving/Topics</td></tr><tr><td>Adverse Driving Conditions</td></tr><tr><td>Approaching intersections</td></tr><tr><td>Backing a Rig Safely</td></tr><tr><td>Changing Lanes</td></tr><tr><td>Following too close</td></tr><tr><td>Speed Management</td></tr><tr><td>Distracted Driving/Cell Phone</td></tr><tr><td>Jackknifing</td></tr><tr><td>CT PAT Procedure</td></tr><tr><td>Drug & Alcohol Policy</td></tr><tr><td>Safety Equipment Policy</td></tr><tr><td>Dispatch Procedures</td></tr><tr><td>Accounting Procedures</td></tr><tr><td>Bonus Program</td></tr><tr><td>First Aid</td></tr><tr><td>Fire Extinguisher</td></tr><tr><td>Maintenance Policy for Owner Operators</td></tr><tr><td>Speed Policy</td></tr><tr><td>Disciplinary Policy</td></tr></table></div><div class="col-md-12" style="margin-top:10px;"><b>Driver’s Name (Printed)</b>: '+driverName+'<br><br><b>Drivers Signature:</b> <div style="width:80%;float:right"><img src="uploads/attachment/drivinghistoryaddressSignature/'+getDrivinghistory.signature+'" alt="user" width="150"></div></a> <br><br><b>Date:</b>'+getDrivinghistory.updatedDate+'</div><br>';
            let Formfooter = '</div></div></div>';
            let Form = Formheader + Formbody + Formfooter+'<style>@page { size: auto;  margin: 0mm; }</style>'
            res.json({ status: true, datas: Form });
        }
        else {
            res.json({ status: false });
        }
        // -----------orientation end -----------------
    }
    else if (pdfGenerate == 'dry_van_checklist') {
        // -----------orientation -----------------
        let getdriver = await Driver.findOne({ where: { id: driverid }, raw: true });
        let getDriverdetails = await Driverdetails.findOne({ where: { driverId: driverid }, raw: true });
        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
        let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: driverid }, raw: true });
        let driverName = getdriver ? getdriver.driver_name : '';
        let driver_license = getdriver ? getdriver.driver_license : '';
       // let getchecklist = await Flabted_checklist.findOne({ where: { driverId:driverid ,company_id: getdriver.company_id }, raw: true });
        let dry_van_check1 = await Certificateauth.findOne({ where: { driverId: driverid, certificateID: 10 }, raw: true });
		let company_name = '';
        console.log('sdfsfrwre');
        if (driverid ) {
            if(getdriver.company_id!=''){
                let cur_company  = await Company.findOne({ where: { id: getdriver.company_id}, raw: true });
                company_name = cur_company.name;
            }
            let Formheader = '<head><title>'+ getDriverdetails.firstName+'dump_truck _checklist'+'</title></head><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'Dump Truck Checklist</h3> </div><div style="text-align: center2;margin: 1px;" class="row"> <div style="padding: 5px;" class="col-md-12">';
            let Formbody = ' <div class="col-md-12" style="float:left;width:100%"> <table border="2"><tr><td>Hours of Service</td></tr><tr><td>Pre-Trip Inspection</td></tr><tr><td>Company CVOR, CVOR and Abstract</td></tr><tr><td>Accident Reporting</td></tr><tr><td>Incident Reporting</td></tr><tr><td>Pet Policy</td></tr><tr><td>Cell and Text Policy</td></tr><tr><td>Defensive Driving/Topics</td></tr><tr><td>Adverse Driving Conditions</td></tr><tr><td>Approaching intersections</td></tr><tr><td>Changing Lanes</td></tr><tr><td>Following too close</td></tr><tr><td>Backing a dump truck</td></tr><tr><td>Speed policy</td></tr><tr><td>Distracted Driving/Cell Phone policy</td></tr><tr><td>Jackknifing</td></tr><tr><td>Safety equipment policy</td></tr><tr><td>Dispatch Procedure</td></tr><tr><td>Accounting Procedure</td></tr><tr><td>First Aid</td></tr><tr><td>Fire Extinguisher</td></tr><tr><td>Operation and daily maintenance of dump Trucks</td></tr><tr><td>Disciplinary Policy</td></tr></table></div><div class="col-md-12" style="float:left;width:100%;margin-top:10px;"> <b>Driver’s Name (Printed)</b>: '+driverName+'<br><br><br> <b>Drivers Signature:</b> <img src="uploads/attachment/drivinghistoryaddressSignature/'+getDrivinghistory.signature+'" alt="user" width="150"></a> <br><br><br><b>Date:</b>'+getDrivinghistory.updatedDate+'<br></div>';
            let Formfooter = '</div></div></div>';
            let Form = Formheader + Formbody + Formfooter+'<style>@page { size: auto;  margin: 0mm; }</style>'
            res.json({ status: true, datas: Form });
        }
        else {
            res.json({ status: false });
        }
        // -----------orientation end -----------------
    }
	else if (pdfGenerate == 'disclaimer') {
        let Disclaimer1 = await Disclaimer.findOne({ where: { driverId: driverid }, raw: true });
		
        if (Disclaimer1 != null) {
            // -----------Disclaimer certificate-----------------
			let dis_type;
            let getDriver = await Driver.findOne({ where: { id: driverid }, raw: true });
			 let getDrivinghistoryData = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
			let signature = getDrivinghistoryData ? getDrivinghistoryData.signature : '';
           
            let attachmentpath = "uploads/attachment/drivinghistoryaddressSignature/" + signature;
            if (signature) {
                ImagesAttachment = '<img id="signature" alt="user" width="150" src="' + attachmentpath + '">';
            } else {
                ImagesAttachment = '';
            }
			console.log(Disclaimer1.Disclaimer_type);
			if(Disclaimer1.Disclaimer_type=='Incorporated_Company'){
				dis_type = 'Incorporated Company';
			}
			else{
				dis_type = 'Company Driver';
			}
            if (driverid) {
                let Formheader = '<head><title>' + getDriverdetails.firstName + '_Disclaimer</title></head><div style=""></div><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'Disclaimer and Signature</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
                let Formbody = '<h3><center>Disclaimer and Signature</center></h3><p align="justify">I certify that my answers are true and complete to the best of my knowledge. If this application leads to employment, I understand that false or misleading information in my application or interview may result in my release. I understand that if I am employed, any misrepresentation or material omission made by me on this application will be sufficient cause for cancellation of this application or immediate discharge from the employer’s service, whenever it is discovered. I give the employer the right to contact and obtain information from all references, employers, educational institutions and to otherwise verify the accuracy of the information contained in this application.</p><p align="justify">I certify that carrier informed me about the benefits of joining company as Company Driver and not joining the company as an incorporated organization, however I preferred joining as:</p><p align="justify">Are you currently working for another employer '+dis_type+'</p><p align="justify">I certify that it is my decision and company has no involvement in taking this decision.</p><p align="justify">I hereby release from liability the employer and its representatives for seeking, gathering and using such information and all other persons, corporations or organizations for furnishing such information. The employer does not unlawfully discriminate in employment and no question on this application is used for the purpose of limiting or excusing any applicant from consideration for employment on a basis prohibited by local, state or federal law.</p><p align="justify"><br> If I am hired, I understand that I am free to resign at any time, with or without cause and without prior notice, and the employer reserves the same right to terminate my employment at any time, with or without cause and without prior notice, except as may be required by law. I understand that no representative of the employer, other than an authorized officer, has the authority to make any assurances to the contrary. I further understand that any such assurances must be in writing and signed by an authorized officer. I understand it is this company’s policy not to refuse to hire a qualified individual with a disability because of that’s person’s need for a reasonable accommodation as required by the ADA. I also understand that if I am hired, I will be required to provide proof of identity and legal work authorization.</p><p align="justify"><b>Driver Name</b> ' + getDriver.driver_name + '</p><p align="justify"><b>Drivers Signature:</b> <span id="">' + ImagesAttachment + '</span></p>'
                let Formfooter = '</div></div></div></div>';
                let Form = Formheader + Formbody + Formfooter+'<style>@page { size: auto;  margin: 0mm; }</style>'
                res.json({ status: true, datas: Form });
            }
            else {
                res.json({ status: false });
            }
        }
        else {
            res.json({ status: false });
        }
        // -----------Disclaimer certificate-----------------
    }
    else if (pdfGenerate == 'weightDimensions') {
        let getdriver = await Driver.findOne({ where: { id: driverid }, raw: true });
        console.log(driverid);
        let getWeightDimensions = await weightDimensions.findOne({ where: { driverId: driverid }, raw: true });
        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
       
        let getquiz = await Companyquiz.findOne({ where: { company_id: getdriver.company_id }, raw: true });
        let driverName = getdriver ? getdriver.driver_name : '';
        let driver_license = getdriver ? getdriver.driver_license : '';
        if (driverid && getWeightDimensions && getquiz && getquiz.weightdimensions==1) {
            var right_wrongs = JSON.parse(getWeightDimensions.rightorwrong);
            for(i=0;i<20;i++){
                if(right_wrongs[i] == '1'){
                    right_wrongs[i] = 'Yes';
                }
                else{
                    right_wrongs[i] = 'No';
                }
            }
            var wrong  = parseInt(20) - parseInt(getWeightDimensions.result);
            var percentage  = (parseFloat(getWeightDimensions.result) / 20)*100;
            let Formheader = '<head><title>'+ getDriverdetails.firstName+'_weightdimensions'+'</title></head><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'Weight & Dimensions</h3> </div><div style="text-align: center2;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
            let Formbody = '<div class="card-body" id=""><div style="text-align:center"><span><h4></h4></span></div><br><div class=""><div class=""><div style="width:100%;float:left"><div style="width:50%;float:left"><b>Name of Driver :</b><span id="driverName">' + driverName + '</span></div>';
			if(getWeightDimensions.approveStatus==0){
				Formbody += '<div style="width:50%;float:left"><b>Result : No Result</b></div></div>';
			}
            else{
				Formbody += '<div style="width:50%;float:left"><b  id="weightDateb">Date  : <span id="weightDate">'+getWeightDimensions.create_date+'</span> </b><br><b>Result : </b><span id="vans_wrong">'+percentage.toFixed(2)+'%-'+getWeightDimensions.result+' out of 20</span></div></div>';
			}
            Formbody += '<div style="width:100%;float:left"><b>Licence :</b><span id="driverlicence">' + driver_license + '</span></div><br><br><br>';
			Formbody += '<div class="form-group row" style="margin-bottom:2rem;"><label for="question1" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">1. Which of the following statements is not true about the Memorandum of Understanding?</label><div class="col-md-12"  style="width:100%;float:left;">Selected Answer:  ';
            if(getWeightDimensions.question1=='New vehicle categories may not be added'){
                Formbody += '<span style="color:green">' + getWeightDimensions.question1 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getWeightDimensions.question1 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">New vehicle categories may not be added</span>';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question2" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">2. The Gross Vehicle Weight Rating (GVWR) is explained by which of the following formulas?</label><div class="col-md-12"  style="width:100%;float:left;">Selected Answer:  ';
            if(getWeightDimensions.question2=='Tare Weight + Payload = GVWR'){
                Formbody += '<span style="color:green">' + getWeightDimensions.question2 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getWeightDimensions.question2 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">Tare Weight + Payload = GVWR</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question3" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">3. The trailer manufacturer’s rating for the rear tandem axle of Lisa’s vehicle is 35 200 lbs (16 000 kgs). Under the MoU, what is the maximum weight can be carried on that axle?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getWeightDimensions.question3!='' && getWeightDimensions.question3=='16000 kgs'){
                Formbody += '<span style="color:green">' + getWeightDimensions.question3 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getWeightDimensions.question3 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">16000 kgs</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question4" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">4. Doug’s carrier has just provided new APUs for every truck in the fleet. How much extra weight can be added to the combined steer and drive axle groups?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getWeightDimensions.question4!='' && getWeightDimensions.question4=='225 kg'){
                Formbody += '<span style="color:green">' + getWeightDimensions.question4 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getWeightDimensions.question4 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">225 kg</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question5" class="col-sm-12 control-label col-form-label" style="width:50%;float:left;">5. Which of the following combination vehicles is connected using a fifth wheel connected to the forward trailer?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getWeightDimensions.question5=='An B-train double'){
                Formbody += '<span style="color:green">' + getWeightDimensions.question5 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getWeightDimensions.question5 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">An B-train double</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question6" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">6. The maximum weight for the axles highlighted in the diagram below are restricted when Dimension A is less than:</label><div class="col-md-12"  style="margin-bottom:15px;"><img src="images/wdqs6.png"></div><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getWeightDimensions.question6=='3 metres'){
                Formbody += '<span style="color:green">' + getWeightDimensions.question6 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getWeightDimensions.question6 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">3 metres</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question7" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">7. Is the vehicle pictured in compliance with weight restrictions outlined in the MoU?</label><div class="col-md-12"  style="margin-bottom:15px;"><img src="images/wdqs7.png"></div><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getWeightDimensions.question7!='' && getWeightDimensions.question7=='No'){
                Formbody += '<span style="color:green">' + getWeightDimensions.question7 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getWeightDimensions.question7 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">No</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question8" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">8. The dual tires on Lisa’s tandem axle trailer are 265 mm wide. What is the total weight the trailer tires can support?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getWeightDimensions.question8=='21200 kg'){
                Formbody += '<span style="color:green">' + getWeightDimensions.question8 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getWeightDimensions.question8 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">21200 kg</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question9" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">9. Lisa weighs her vehicle right after fueling up. She purchased 500 litres and found that 220 kg (52%) of weight were added to her steer axle and 205 kg (48%) were added to her drive axle. If she purchases another 100 litres, roughly how much more weight will be added to her drive axle?</label><div class="col-md-12" style="width:50%;float:left;">Selected Answer:  ';
            if(getWeightDimensions.question9=='41 kg'){
                Formbody += '<span style="color:green">' + getWeightDimensions.question9 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getWeightDimensions.question9 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">41 kg</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question10" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">10. Why are spring thaw road restrictions in place?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getWeightDimensions.question10=='Excessive water weakens the roadway'){
                Formbody += '<span style="color:green">' + getWeightDimensions.question10 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getWeightDimensions.question10 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">Excessive water weakens the roadway</span>';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question11" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">11. Trailer wheelbase is the distance measured between:</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getWeightDimensions.question11=='The kingpin and the center of the rear axle unit'){
                Formbody += '<span style="color:green">' + getWeightDimensions.question11 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getWeightDimensions.question11 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">The kingpin and the center of the rear axle unit</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question12" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">12. Interaxle spacing is calculated by measuring the distance between:</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getWeightDimensions.question12=='The centres of two adjacent axle groups'){
                Formbody += '<span style="color:green">' + getWeightDimensions.question12 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getWeightDimensions.question12 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">The centres of two adjacent axle groups</span>';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question13" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">13. Under the Memorandum of Understanding, what does the maximum box length of a combination vehicle refer to?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getWeightDimensions.question13=='The total length A and B plus the space between them (A + B + C)'){
                Formbody += '<span style="color:green">' + getWeightDimensions.question13 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getWeightDimensions.question13 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">The total length A and B plus the space between them (A + B + C)</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question14" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">14. Janice’s vehicle is a tractor semitrailer. Under the Memorandum of Understanding, what is the overall length limit of her vehicle?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getWeightDimensions.question14!='' && getWeightDimensions.question14=='23 m'){
                Formbody += '<span style="color:green">' + getWeightDimensions.question14 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getWeightDimensions.question14 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">23 m</span>';
            }
            console.log(getWeightDimensions);
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question15" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">15. Which of the following is the best definition of a vehicle’s axle group spread?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getWeightDimensions.question15!='' && getWeightDimensions.question15=='The distance between the axles within an axle group and is measured from the centre of the first axle to the centre of the rear axle in the group'){
                Formbody += '<span style="color:green">The distance between the axles within an axle group and is measured from the centre of the first axle to the centre of the rear axle in the group</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getWeightDimensions.question15 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">The distance between the axles within an axle group and is measured from the centre of the first axle to the centre of the rear axle in the group</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question16" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">16. Lisa is operating a tandem-axle tractor. What is her drive axle’s maximum axle spread?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getWeightDimensions.question16!='' && getWeightDimensions.question16=='1.85 m'){
                Formbody += '<span style="color:green">1.85 m</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getWeightDimensions.question16 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">1.85 m</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question17" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">17. The length of the wheelbase of your semitrailer is 12.45 metres. What is the distance of the trailer`s effective rear overhang?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getWeightDimensions.question17!='' && getWeightDimensions.question17=='4.36 m'){
                Formbody += '<span style="color:green">4.36 m</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getWeightDimensions.question17 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">4.36 m</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question18" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">18. According to the Memorandum of Understanding, what is the gross vehicle weight limit of this vehicle?</label><div class="col-md-12"  style="margin-bottom:15px;"><img src="images/wdqs18.png"></div><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getWeightDimensions.question18!='' && getWeightDimensions.question18=='52300 kg'){
                Formbody += '<span style="color:green">52300 kg</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getWeightDimensions.question18 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">52300 kg</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question19" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">19. What happens when you slide the rear trailer axle to the rear?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getWeightDimensions.question19!='' && getWeightDimensions.question19=='Weight is shifted from the rear axle to the drive axle'){
                Formbody += '<span style="color:green">Weight is shifted from the rear axle to the drive axle</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getWeightDimensions.question19 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">Weight is shifted from the rear axle to the drive axle</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question19" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">20. After shifting the tandem axles, engage the tractor and trailer brakes and check to make sure ____________.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getWeightDimensions.question20!='' && getWeightDimensions.question20=='The landing gear has been lowered to the ground'){
                Formbody += '<span style="color:green">The landing gear has been lowered to the ground</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getWeightDimensions.question20 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">The landing gear has been lowered to the ground</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br></div></div>'
            let Formfooter = '</div></div></div>';
            let Form = Formheader + Formbody + Formfooter+'<style>@page { size: auto;  margin: 0mm; }</style>'
            res.json({ status: true, datas: Form });
            
        }
        else {
            res.json({ status: false });
        }
        // -----------end-----------------
    }
    else if (pdfGenerate == 'safetyLaws') {
        let getdriver = await Driver.findOne({ where: { id: driverid }, raw: true });
        console.log(driverid);
        let getsafetyLaws = await safetyLaws.findOne({ where: { driverId: driverid }, raw: true });
        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
        let getquiz = await Companyquiz.findOne({ where: { company_id: getdriver.company_id }, raw: true });

        let driverName = getdriver ? getdriver.driver_name : '';
        let driver_license = getdriver ? getdriver.driver_license : '';
        if (driverid && getsafetyLaws && getsafetyLaws.approveStatus == 1 && getquiz && getquiz.safetylawsquiz==1) {
            var right_wrongs = JSON.parse(getsafetyLaws.rightorwrong);
            for(i=0;i<25;i++){
                if(right_wrongs[i] == '1'){
                    right_wrongs[i] = 'Yes';
                }
                else{
                    right_wrongs[i] = 'No';
                }
            }
            var wrong  = parseInt(25) - parseInt(getsafetyLaws.result);
            var percentage  = (parseFloat(getsafetyLaws.result) / 25)*100;
            let Formheader = '<head><title>'+ getDriverdetails.firstName+'_safetylaws'+'</title></head><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'Safety Laws Quiz</h3> </div><div style="text-align: center2;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
            let Formbody = '<div class="card-body" id=""><div style="text-align:center"><span><h4></h4></span></div><br><div class=""><div class=""><div style="width:100%;float:left"><div style="width:50%;float:left"><b>Name of Driver :</b><span id="driverName">' + driverName + '</span></div>';
			if(getsafetyLaws.approveStatus==0){
				Formbody += '<div style="width:50%;float:left"><b>Result : No Result</b></div></div>';
			}
            else{
				Formbody += '<div style="width:50%;float:left"><b  id="weightDateb">Date  : <span id="weightDate">'+getsafetyLaws.create_date+'</span> </b><br><b>Result : </b><span id="vans_wrong">'+percentage.toFixed(2)+'%-'+getsafetyLaws.result+' out of 25</span></div></div>';
			}
            Formbody += '<div style="width:100%;float:left"><b>Licence :</b><span id="driverlicence">' + driver_license + '</span></div><br><br><br>';
            Formbody += '<table border="1"><tr><td colspan="2"></td><td style="width:10%;padding-left:10px;">Selected Answer</td><td style="width:10%;padding-left:10px;">Correct Answer</td></tr>';
            Formbody += '<tr><td style="width: 5%;padding-left:10px;">1</td><td style="padding-left:10px;">When you see a service vehicle such as law enforcement, EMS (ambulance tow trucking helping someone you should reduce your speed to 60 km/h or posted speed limit whichever is lower.</td>';
            if(getsafetyLaws.question1=='True'){
                Formbody += '<td style="width:5%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question1 + '</span>';
            }
            else{
                Formbody += '<td style="width:5%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question1 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green" style="color:green">True</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
            Formbody += '<tr><td style="width: 5%;padding-left:10px;">2</td><td style="padding-left:10px;">On a two-way yellow lined hwy, if you have a solid yellow line on your side and the other side has a broken yellow line, it indicates that is passing is not permitted for you. </td>';
            if(getsafetyLaws.question2=='True'){
                Formbody += '<td style="width:5%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question2 + '</span>';
            }
            else{
                Formbody += '<td style="width:5%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question2 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green" style="color:green">True</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
            Formbody += '<tr><td style="width: 5%;padding-left:10px;">3</td><td style="padding-left:10px;">Drivers driving within a 160 km radius are not required to fill out a daily log.</td>';
            if(getsafetyLaws.question3!='' && getsafetyLaws.question3=='True'){
                Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question3 + '</span>';
            }
            else{
                Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question3 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';

            Formbody += '<tr><td style="width: 5%;padding-left:10px;">4</td><td style="padding-left:10px;">Farmers are not exempt from requiring a safety fitness Certificate.</td>';
            if(getsafetyLaws.question4!='' && getsafetyLaws.question4=='False'){
                Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question4 + '</span>';
            }
            else{
                Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question4 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">False</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
            Formbody += '<tr><td style="width: 5%;padding-left:10px;">5</td><td style="padding-left:10px;">An airbrake endorsement is not required if you are driving under a 160 km radius.  </td>  ';
            if(getsafetyLaws.question5=='False'){
                Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question5 + '</span>';
            }
            else{
                Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question5 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">False</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
            Formbody += '<tr><td style="width: 5%;padding-left:10px;">6</td><td style="padding-left:10px;">Small defects discovered during a inspection need not be reported to the company. </td>';
            if(getsafetyLaws.question6=='False'){
                Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question6 + '</span>';
            }
            else{
                Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question6 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">False</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
            Formbody += '<tr><td style="width: 5%;padding-left:10px;">7</td><td style="padding-left:10px;">Legally you cannot be penalized for driving over 5/10 km over the posted speed limit except in playgrounds and construction zones</td>';
            if(getsafetyLaws.question7!='' && getsafetyLaws.question7=='False'){
                Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question7 + '</span>';
            }
            else{
                Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question7 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">False</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
            Formbody += ' <tr><td style="width: 5%;padding-left:10px;">8</td><td style="padding-left:10px;">Failure to remain at the scène of a collision will result in 7 points demerit points against your license </td>';
            if(getsafetyLaws.question8=='False'){
                Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question8 + '</span>';
            }
            else{
                Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question8 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">False</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';

            Formbody += '<tr><td style="width: 5%;padding-left:10px;">9</td><td style="padding-left:10px;">Truckers driver are allowed hand held devices as they always need to communicate with dispatch</td>';
            if(getsafetyLaws.question9=='False'){
                Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question9 + '</span>';
            }
            else{
                Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question9 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">False</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';

            Formbody += ' <tr><td style="width: 5%;padding-left:10px;">10</td><td style="padding-left:10px;">Uncontrolled intersections are ones that have no traffic signs and signal lights. </td>';
            if(getsafetyLaws.question10=='True'){
                Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:green" >' + getsafetyLaws.question10 + '</span>';
            }
            else{
                Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question10 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';

            Formbody +=' <tr><td style="width: 5%;padding-left:10px;">11</td><td style="padding-left:10px;">Drivers do not need bills of lading in their possession as long as the company has it.</td>';
            if(getsafetyLaws.question11=='True'){
                Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question11 + '</span>';
            }
            else{
                Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question11 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
            
            Formbody += '<tr><td style="width: 5%;padding-left:10px;">12</td><td style="padding-left:10px;">If a driver is 45 minutes away from home but he has been on duty for 15 hours he is allowed to keep driving because he is near his home</td>';
            if(getsafetyLaws.question12=='False'){
                Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question12 + '</span>';
            }
            else{
               Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question12 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">False</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';

            Formbody +=' <tr><td style="width: 5%;padding-left:10px;">13</td><td style="padding-left:10px;">To travel outside of Alberta plates and the carrier must declare that they are a federal company.</td>';
            if(getsafetyLaws.question13=='True'){
                Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question13 + '</span>';
            }
            else{
                Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question13 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
            Formbody += ' <tr><td style="width: 5%;padding-left:10px;">14</td><td style="padding-left:10px;">If your pedal sticks and you cannot pull it up with your shoe you should shift into neutral, pull over and stop.</td><td style="width:10%;padding-left:10px;">';
            if(getsafetyLaws.question14!='' && getsafetyLaws.question14=='True'){
                Formbody += '<span style="color:green">' + getsafetyLaws.question14 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getsafetyLaws.question14 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
            Formbody += '<tr><td style="width: 5%;padding-left:10px;">15</td><td style="padding-left:10px;">Drivers must hand in all log books under 20 days to the carrier.</td><td style="width:10%;padding-left:10px;"> ';
            if(getsafetyLaws.question15!='' && getsafetyLaws.question15=='True'){
                Formbody += '<span style="color:green">True</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getsafetyLaws.question15 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
            Formbody += '<tr><td style="width: 5%;padding-left:10px;">16</td><td style="padding-left:10px;">Speed limit for urban or rural playground zones are generally 40 km/h.</td><td style="width:10%;padding-left:10px;"> ';
            if(getsafetyLaws.question16!='' && getsafetyLaws.question16=='True'){
                Formbody += '<span style="color:green">True</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getsafetyLaws.question16 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
            Formbody += '<tr><td style="width: 5%;padding-left:10px;">17</td><td style="padding-left:10px;">When weather conditions are poor it is a good idea to use cruise control.</td><td style="width:10%;padding-left:10px;">  ';
            if(getsafetyLaws.question17!='' && getsafetyLaws.question17=='False'){
                Formbody += '<span style="color:green">False</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getsafetyLaws.question17 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">False</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
            Formbody += '<tr><td style="width: 5%;padding-left:10px;">18</td><td style="padding-left:10px;">Play ground zones are in effect 7:30 am to 9:00 pm.</td><td style="width:10%;padding-left:10px;"> ';
            if(getsafetyLaws.question18!='' && getsafetyLaws.question18=='True'){
                Formbody += '<span style="color:green">True</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getsafetyLaws.question18 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';

            Formbody += ' <tr><td style="width: 5%;padding-left:10px;">19</td><td style="padding-left:10px;">If you are empty you do not need to stop at the scale when open.</td><td style="width:10%;padding-left:10px;"> ';
            if(getsafetyLaws.question19!='' && getsafetyLaws.question19=='False'){
                Formbody += '<span style="color:green">False</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getsafetyLaws.question19 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">False</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';

            Formbody += ' <tr><td style="width: 5%;padding-left:10px;">20</td><td style="padding-left:10px;">Warning triangles must be placed 75 meters from the front of rear if a vehicle is topped on the hwy.</td><td style="width:10%;padding-left:10px;">';
            if(getsafetyLaws.question20!='' && getsafetyLaws.question20=='False'){
                Formbody += '<span style="color:green">False</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getsafetyLaws.question20 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">False</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';

            Formbody += ' <tr><td style="width: 5%;padding-left:10px;">21</td><td style="padding-left:10px;">Seat belts are most effective in preventing injury when the lap belt and should strap are worn correctly.</td><td style="width:10%;padding-left:10px;">';
            if(getsafetyLaws.question21!='' && getsafetyLaws.question21=='True'){
                Formbody += '<span style="color:green">True</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getsafetyLaws.question21 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';

            Formbody += ' <tr><td style="width: 5%;padding-left:10px;">22</td><td style="padding-left:10px;">Be cautious of large vehicles backing because large vehicles have large blind zones.</td><td style="width:10%;padding-left:10px;">';
            if(getsafetyLaws.question22!='' && getsafetyLaws.question22=='True'){
                Formbody += '<span style="color:green">True</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getsafetyLaws.question22 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
            
            Formbody += ' <tr><td style="width: 5%;padding-left:10px;">23</td><td style="padding-left:10px;">You are approaching an intersection. The traffic lights are out of order. You must treat the intersection as four way stop.</td><td style="width:10%;padding-left:10px;">';
            if(getsafetyLaws.question23!='' && getsafetyLaws.question23=='True'){
                Formbody += '<span style="color:green">True</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getsafetyLaws.question23 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';

            Formbody += ' <tr><td style="width: 5%;padding-left:10px;">24</td><td style="padding-left:10px;">If feeling tired while driving, then you should slow down and drive with extra care.</td><td style="width:10%;padding-left:10px;">';
            if(getsafetyLaws.question24!='' && getsafetyLaws.question24=='False'){
                Formbody += '<span style="color:green">False</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getsafetyLaws.question24 + '</span>';
            }
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">False</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';

            
            Formbody += ' <tr><td style="width: 5%;padding-left:10px;">25</td><td style="padding-left:10px;">Under icy road conditions, in general, most collisions are caused by sudden changes in speed or direction.</td><td style="width:10%;padding-left:10px;">';
            if(getsafetyLaws.question25!='' && getsafetyLaws.question25=='True'){
                Formbody += '<span style="color:green">True</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getsafetyLaws.question25 + '</span>';
            }
            let resStatus;
            if(percentage>=80){
                resStatus = '<span id="examResult" style="color:green">Pass</span>';
            }
            else{
                resStatus = '<span id="examResult"  style="color:red">Fail</span>';
            }
            console.log(percentage);
            Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
            Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr><tr><td colspan="2"><table  style="width:100%"><tr style="border-bottom:1px solid black"><td style="padding-top:5px;padding-left:10px;"><b>Date: </b> <span id="driver_date">' + getsafetyLaws.create_date + '</span></td></tr><tr><td style="padding-top:5px;padding-left:10px;"><b>EXAMINEE NAME & SIGNATURE: </b></td></tr></table></td><td colspan="2"><span id="driver_sign"><img src="uploads/attachment/drivinghistoryaddressSignature/'+getDrivinghistory.signature+'" alt="user" width="150"></span></td></tr><tr><td style="padding-left:10px;" colspan="2"><b>EXAMINERS NAME & SIGNATURE:</b></td><td colspan="2" style="padding-left:10px;"><span id="adminSign"><img src="uploads/attachment/safetylaws/'+getsafetyLaws.signature+'" alt="user" width="150"></span></td></tr><tr><td style="padding-left:10px;" colspan="2"><b>Examinee must score over 80% in order to pass: FINAL SCORE</b></td><td colspan="2" style="padding-left:10px;">'+resStatus+'</td></tr></table>';


            Formbody += '</div></div><br><hr style="width:100%"><br></div></div>'
            let Formfooter = '</div></div></div>';
            let Form = Formheader + Formbody + Formfooter+'<style>@page { size: auto;  margin: 0mm; }</style>'
            res.json({ status: true, datas: Form });
            
        }
        else {
            res.json({ status: false });
        }
        // -----------end-----------------
    }
    else if (pdfGenerate == 'annualReview') {
        // -----------flatbed -----------------
        let getdriver = await Driver.findOne({ where: { id: driverid }, raw: true });
        let getDriverdetails = await Driverdetails.findOne({ where: { driverId: driverid }, raw: true });
        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
        let annualreview1 = await annualreview.findOne({ where: { driverid:driverid}, raw: true });
        let driverName = getDriverdetails ? getDriverdetails.lastName+' '+getDriverdetails.firstName+' '+getDriverdetails.middleName:'';
        let driver_license = getdriver ? getdriver.driver_license : '';
        let signaturepath1 = 'uploads/attachment/annualreview/';
        let signature = '';
        if(annualreview1 && annualreview1.signature){
            signature = signaturepath1+annualreview1.signature;
        }
       console.log(annualreview1); 
		let company_name = '';
        let drivermeet = '';
        if(annualreview1 && annualreview1.drivermeet==0){
            drivermeet = 'The driver meets the minimum requirements for safe driving, or';
        }
        else{
            drivermeet = 'The driver is disqualified to drive a motor vehicle pursuant to CFR 391.15';
        }
        if (driverid && annualreview1) {
            if(getdriver.company_id!=''){
                let cur_company  = await Company.findOne({ where: { id: getdriver.company_id}, raw: true });
                company_name = cur_company.name;
            }
            let Formheader = '<head><title>'+ getDriverdetails.firstName+'_annualReview'+'</title></head><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;font-size:15px;">'+cmpd_img1
            +'U. S. DEPARTMENT OF TRANSPORTATION MOTOR CARRIER SAFETY PROGRAM ANNUAL REVIEW OF DRIVING RECORD</h3> </hr></div><div style="text-align: center2;margin: 1px;" class="row"> <div style="padding: 5px;" class="col-md-12" style="width:100%;float:left">';
            let Formbody = '<div class="col-md-12" style="width:100%;float:left"><div class="col-md-12" style="width:100%;float:left"><div class="col-md-6" style="width:50%;float:left">'+driverName+' </div><div class="col-md-6" style="width:50%;float:left"> '+getDriverdetails.sin+'</div></div><div class="col-md-6" style="width:50%;float:left">Name</div><div class="col-md-6" style="width:50%;float:left">Social Security Number</div></div><p align="justify">This day I reviewed the driving record of the above named driver in accordance with CFR 391.25 of the Motor Carrier Safety Regulations. I considered any evidence that the driver has violated applicable provisions of the MCS Regulations and the Hazardous Materials Regulations. I considered the driver’s accident record and any evidence that he/she has violated laws governing the operation of motor vehicles, and gave great weight to violations, such as speeding, reckless driving and operation while under the influence of alcohol or drugs, that indicate that the driver has exhibited a disregard for the safety of the public. Having done the above, I find that</p><p>'+drivermeet+'</p><div class="col-md-12" style="width:100%;float:left"><div class="col-md-6" style="width:50%;float:left">'+annualreview1.date_review+'</div><div class="col-md-6" style="width:50%;float:left">'+company_name+'</div><div class="col-md-6"  style="width:50%;float:left">Date of Review</div><div class="col-md-6" style="width:50%;float:left">Name of Motor Carrier</div><div class="col-md-12" style="width:100%;float:left"></div><div class="col-md-12" style="width:100%;float:left;margin-bottom:10px;"><div class="col-md-6" style="width:50%;float:left"></div><div class="col-md-6" style="width:50%;float:left"><img src="'+signature+'"></div></div><div class="col-md-12" style="width:100%;float:left;margin-bottom:10px;">&nbsp;<div class="col-md-6" style="width:50%;float:left">&nbsp;</div><div class="col-md-6" style="width:50%;float:right">Reviewed by: Signature and Title</div></div></div>';
            let Formfooter = '</div></div></div>';
            let Form = Formheader + Formbody + Formfooter+'<style>@page { size: auto;  margin: 0mm; }</style>'
            res.json({ status: true, datas: Form });
        }
        else {
            res.json({ status: false });
        }
        // -----------Flatbed end -----------------
    }
    else if (pdfGenerate == 'motorvehicledriver') {
        // -----------flatbed -----------------
        let getdriver = await Driver.findOne({ where: { id: driverid }, raw: true });
        let getDriverdetails = await Driverdetails.findOne({ where: { driverId: driverid }, raw: true });
        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
        let motor_vehicle_driver_certificate = await motorVehicleDriverCertificate.findOne({ where: { driverId:driverid}, raw: true });
        let driverName = getDriverdetails ? getDriverdetails.lastName+' '+getDriverdetails.firstName+' '+getDriverdetails.middleName:'';
        let getdriveraddress = await Driveraddress.findOne({ where: { driverId: driverid }, raw: true });
        let driver_license = getdriver ? getdriver.driver_license : '';
        let sign1 = 'uploads/attachment/drivinghistoryaddressSignature/';
        let getDrivinghistorySignature = '';
        if(getDrivinghistory && getDrivinghistory.signature){
            getDrivinghistorySignature = '<img src="'+sign1+getDrivinghistory.signature+'" alt="user" width="150" style="height:45px;"></img>';
        }
        
        let sign2 = 'uploads/attachment/motorVechile/';
        let signature = '';
        if(motor_vehicle_driver_certificate && motor_vehicle_driver_certificate.signature){
            signature = '<img src="'+sign2+motor_vehicle_driver_certificate.signature+'" alt="user" width="150" style="height:45px;"></img>';

        }

        //let signature = signaturepath1+annualreview1.signature;
        
		let company_name = '';
        let drivermeet = '';
        let cur_company ='';
        if (driverid && motor_vehicle_driver_certificate) {
            if(getdriver.company_id!=''){
                 cur_company  = await Company.findOne({ where: { id: getdriver.company_id}, raw: true });
                company_name = cur_company.name;
            }
            let Formheader = '<head><title>'+ getDriverdetails.firstName+'_motor_vehicle_driver_certificate'+'</title></head><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'MOTOR VEHICLE DRIVER’S CERTIFICATION OF VIOLATIONS</h3> </hr></div><div style="text-align: center2;margin: 1px;" class="row"> <div style="padding: 5px;" class="col-md-12" style="width:100%;float:left">';
            let Formbody = '<p align="justify"><input type="checkbox" id="certify" value="1" checked disabled>  I certify that the following is a true and complete list of traffic violations (other than parking violations) for which I have been convicted or forfeited bond or collateral during the past 12 months.</p><table style="width: 100%;border-collapse: separate;border-spacing: 0 1em;"><thead><tr><th style="text-align:left;">Date</th><th style="text-align:left;">Offence</th><th style="text-align:left;">Location</th><th style="text-align:left;">Type of Vehicle Operated</th></tr></thead><tbody><tr><td>'+motor_vehicle_driver_certificate.date1+'</td><td>'+motor_vehicle_driver_certificate.offence1+'</td><td>'+motor_vehicle_driver_certificate.location1+'</td><td>'+motor_vehicle_driver_certificate.vehicle1+'</td></tr>';
            if(motor_vehicle_driver_certificate.date2 && motor_vehicle_driver_certificate.data2!='' && motor_vehicle_driver_certificate.date2!='0000-00-00'){
                Formbody += '<tr><td>'+motor_vehicle_driver_certificate.date2+'</td><td>'+motor_vehicle_driver_certificate.offence2+'</td><td>'+motor_vehicle_driver_certificate.location2+'</td><td>'+motor_vehicle_driver_certificate.vehicle2+'</td></tr>';
            }
            if(motor_vehicle_driver_certificate.date3 && motor_vehicle_driver_certificate.data3!='' && motor_vehicle_driver_certificate.date3!='0000-00-00'){
                Formbody += ' <tr><td>'+motor_vehicle_driver_certificate.date3+'</td><td>'+motor_vehicle_driver_certificate.offence3+'</td><td>'+motor_vehicle_driver_certificate.location3+'</td><td>'+motor_vehicle_driver_certificate.vehicle3+'</td></tr>';
            }
            if(motor_vehicle_driver_certificate.date4 && motor_vehicle_driver_certificate.data4!='' && motor_vehicle_driver_certificate.date4!='0000-00-00'){
                Formbody += '<tr><td>'+motor_vehicle_driver_certificate.date4+'</td><td>'+motor_vehicle_driver_certificate.offence4+'</td><td>'+motor_vehicle_driver_certificate.location4+'</td><td>'+motor_vehicle_driver_certificate.vehicle4+'</td></tr>';
            }
             Formbody += '</tbody></table><p>If no violations are listed above, I certify that I have not been convicted or forfeited bond or collateral on account of any violation (other than those I have provided under Part 383) required to be listed during the past 12 months</p><div class="col-md-12" style="padding-left: 0px;width:100%;float:left"><div class="col-md-3" style="padding-left: 0px;width:33.33%;float:left"><div class="col-md-6"  style="padding-left: 0px;width:50%;float:left;white-space:nowrap">Driver’s License No:</div><div class="col-md-6" style="width:50%;float:left;;white-space:nowrap">'+driver_license+'</div></div><div class="col-md-3" style="width:33.33%;float:left"><div class="col-md-6" style="width:50%;float:left;;white-space:nowrap">State:</div><div class="col-md-6" style="width:50%;float:left">'+getdriveraddress.driverState+'</div></div><div class="col-md-3" style="width:33.33%;float:left"><div class="col-md-6" style="width:50%;float:left;;white-space:nowrap">Expiration Date:</div><div class="col-md-6" style="width:50%;float:left">'+getdriver.license_expiry+'</div></div></div><div class="col-md-12"  style="padding-left: 0px;width:100%;float:left;padding-top:12px;"><div class="col-md-6"  style="padding-left: 0px;width:50%;float:left">'+motor_vehicle_driver_certificate.date_certificate+'</div><div class="col-md-4" style="width:25%;float:left"></div><div class="col-md-4" style="width:25%;float:left"> '+getDrivinghistorySignature+'</div> <div class="col-md-6"  style="padding-left: 0px;width:50%;float:left">Date of Certification</div><div class="col-md-4" style="width:25%;float:left"></div><div class="col-md-4" style="float:right:margin-right:-96px;">Driver’s Signature</div></div><div class="col-md-12" style="padding-left: 0px;width:100%;float:left;padding-top:12px;"><div class="col-md-6" style="padding-left: 0px;width:50%;float:left">Company Name</div><div class="col-md-4" style="width:25%;float:left">&nbsp;</div><div class="col-md-4" style="width:25%;float:left">Company Address</div><div class="col-md-6" style="padding-left: 0px;width:50%;float:left">'+company_name+'</div><div class="col-md-4" style="width:25%;float:left"></div><div class="col-md-4" style="width:25%;float:left">'+cur_company.companyAddress+'</div></div><div class="col-md-12" style="padding-left: 0px;width:100%;float:left;margin-top:20px;"><div class="col-md-6" style="padding-left: 0px;width:50%;float:left">'+signature+'</div><div class="col-md-4" style="width:25%;float:left"></div><div class="col-md-4" style="width:25%;float:left">'+motor_vehicle_driver_certificate.title+'</div><div class="col-md-12" style="width:100%;float:left;padding-left:0px;margin-top:20px;"><div class="col-md-6" style="padding-left: 0px;width:50%;float:left">Reviewed By: (Signature)</div><div class="col-md-4" style="width:25%;float:left"></div><div class="col-md-4" style="width:25%;float:left;margin-top:-18px;">Title</div></div></div>';
            let Formfooter = '</div></div></div>';
            let Form = Formheader + Formbody + Formfooter+'<style>@page { size: auto;  margin: 0mm; }</style>'
            res.json({ status: true, datas: Form });
        }
        else {
            res.json({ status: false });
        }
        // -----------Flatbed end -----------------
    }
    else if (pdfGenerate == 'ReferenceCertificate') {
        // -----------Reference -----------------

        let referencedata = await Certificateauth.findOne({ where: { driverId: driverid, certificateID: 8 }, raw: true });
        let getDrivinghistorynew = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
        let getdriver = await Driver.findOne({ where: { id: driverid }, raw: true });
        let driverNamenew = getdriver ? getdriver.driver_name : '';
        let sign1 = 'uploads/attachment/drivinghistoryaddressSignature/';
        let getDrivinghistorySignature = '';
        if(getDrivinghistorynew && getDrivinghistorynew.signature){
            getDrivinghistorySignature = '<img src="'+sign1+getDrivinghistorynew.signature+'" alt="user" width="150" style="height:45px;"></img>';
        }
        
        //let signature = signaturepath1+annualreview1.signature;
        
		let company_name = '';
        let drivermeet = '';
        let cur_company ='';
        if (driverid && referencedata) {
            if(getdriver.company_id!=''){
                 cur_company  = await Company.findOne({ where: { id: getdriver.company_id}, raw: true });
                company_name = cur_company.name;
            }
            let Formheader = '<head><title>'+ getDriverdetails.firstName+'_motor_vehicle_driver_certificate'+'</title></head><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'MOTOR VEHICLE DRIVER’S CERTIFICATION OF VIOLATIONS</h3> </hr></div><div style="text-align: center2;margin: 1px;" class="row"> <div style="padding: 5px;" class="col-md-12" style="width:100%;float:left">';
            let Formbody = '<div class="row"><div class="col-md-12"><p align="justify"> I <b>'+driverNamenew+'</b>am applying for employment at <b>'+company_name+' </b>(my "Potential Employer") and want to provide my consent for only this application I agree that my Potential Employer and its service provider, Compliance Mentorz Inc. ("Service Provider"), may contact all my former employers to conduct a reference and driving safety check that includes the collection and assessment of information about my dates of employment, employment status, job duties and driving experience, reason for leaving, job performance and incident/accident record. I agree that my Potential Employer and its Service Provider may contact all organizations who have issued educational awards or credentials that I have identified to confirm my awards and credentials. I understand that Service Provider retains employment history records on behalf of a number of employers in the trucking industry. I agree that Service Provider, on behalf of my Potential Employer, may check these records to confirm my employment history and conduct a reference and driving safety check that includes an assessment of my dates of employment, employment status, job duties and driving experience, reason for leaving, job performance and incident/accident record. I agree that that my Potential Employer and Service Provider may use and disclose my personal information as required for the above-noted purposes and agree that each of the organizations that are contacted for the above-noted purposes may disclose information to either my Potential Employer or its Service Provider. I will not hold my Potential Employer or Service Provider or said organizations liable for this disclosure. I agree that Service Provider may retain all personal information it collects for the above-noted purposes on behalf of my Potential Employer, who shall control and have a full right of access to records of my personal information that Service Provider creates and retains. I will not hold Service Provider liable for any losses arising out of its retention or handling of my personal information. I understand that I have the right to (1) to review the information provided by previous employers, (2) have errors corrected and re-submitted by previous employers and (3) have a rebuttal statement attached to information I allege to be erroneous if my previous employer and I cannot agree on the accuracy of information. I understand that I may direct any questions I have about this consent and about how Service Provider handles personal information on behalf of my Potential Employer to Compliance Mentorz Inc. at info@compliancementorz.com or by phone at 1-905-486-1666. I certify that this application was completed by me and that all entries on it and information in it are true and complete to the best of my knowledge. I understand that any misstatement or omission of information in this application may result in my dismissal. This document applies to the following previous employer</p><span style="float:right"><b>Driver'+"’s Name"+' (Printed)</b>: '+driverNamenew+'<br><b>Drivers Signature:</b>'+getDrivinghistorySignature+'</a> </span><br></div></div>';
            let Formfooter = '</div></div></div>';
            let Form = Formheader + Formbody + Formfooter+'<style>@page { size: auto;  margin: 0mm; }</style>'
            res.json({ status: true, datas: Form });
        }
        else {
            res.json({ status: false });
        }
        // -----------Flatbed end -----------------
    }
    else if (pdfGenerate == 'All') {
        console.log(req.query.driverid);
        console.log('---------------');
        //personal details
        let getDrivinghistory1 = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
        let getDriverdetails1 = await Driverdetails.findOne({ where: { driverId: driverid }, raw: true });
        // let getDrivinghistoryDatas = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
        console.log(getDriverdetails1);
        let getDtls = await Driveraddress.findAll({ where: { driverId: driverid }, raw: true });
        if (getDtls) {
            await getDtls.forEach(function (getDetails, i) {
                tableData += '<tr><td style="border:1px solid #000;">' + getDetails.driverAddress + '</td><td style="border:1px solid #000;">' + getDetails.driverCity + '</td><td style="border:1px solid #000;">' + getDetails.driverState + '</td><td style="border:1px solid #000;">' + getDetails.driverCountry + '</td><td style="border:1px solid #000;">' + getDetails.driverProvince + '</td><td style="border:1px solid #000;">' + getDetails.driverPostalCode + '</td><td style="border:1px solid #000;">' + getDetails.driverFromDate + '</td><td style="border:1px solid #000;">' + getDetails.driverToDate + '</tr>';
            });
        }
        let req_sign = '';
        if(getDrivinghistory1 &&getDrivinghistory1.signature){
            req_sign = '<img src="uploads/attachment/drivinghistoryaddressSignature/' + getDrivinghistory1.signature + '" id="signature" alt="user" width="150">';
        }
		let getcmpdtls1 = await Company.findOne({ where: { id: getDriverdetails1.company_id }, raw: true });
        let PersonalDetailsData = '<head><title>' + getDriverdetails1.firstName + 'All' + '</title></head><div id="updateEmployment_details"> <div style=""> <h3 style="text-align: center;margin-bottom:50px;"> '+cmpd_img+'EMPLOYMENT APPLICATION</h3> </div><div style=";margin: 1px;" class="row"> <div> <div style="border: 2px dotted;padding: 5px;" > <h3 style="text-align:center">TO BE READ AND SIGNED BY APPLICANT </h3> <br><p align="justify"> I authorize you to make such investigations and inquiries of my personal, employment, financial or medical history and other related matters as may be necessary in arriving at an employment decision.(Generally, inquiries regarding medical history will be made only if and after a conditional offer of employment has been extended.) I here by release employers, schools, health care providers and other persons from all liability in responding to inquiries and releasing information in connection with my application. In the event of employment, I understand that false or misleading information given in my application or interview(s) may result in discharge. I also understand  that I am required to abide by all rules and regulations of the Company. I understand that information I provide regarding current and/or previous employers may be used, and those employer(s) will be contacted, for the purpose of investigating my safety performance history as required by 49 CFR 391.23(d) and (e). <br> I understand that I have the right to: Review information provided by previous employers; Have errors in the information corrected by previous employers and for those previous employers to re-send the corrected information to the prospective employer; and Have a rebuttal attached to the alleged erroneous information, if the previous employer(s) and I cannot agree on the accuracy of the information. </p><div> <p align="justify"><b>Signature:</b> '+req_sign+' </p> <p align="justify"><b>Driver Name:</b> <span id="">' + getDriverdetails1.firstName + '</span></p> <p align="justify"><b>Date:</b> <span id="">' + getDriverdetails1.updatedDate + '</span></p></div></div><div style="break-after:page"></div><div style="border: 2px dotted;padding: 5px;" class="col-md-12"> <h3 style="text-align: center;padding: 30px;"> PERSONAL INFORMATION </h3> <p align="justify"><b>Applicant Name :</b> <span id="firstName">' + getDriverdetails1.firstName + '</span> &nbsp;&nbsp;&nbsp; <b>Applicant Middle Name :</b> <span id="middleName">' + getDriverdetails1.middleName + '</span> &nbsp;&nbsp;&nbsp; </p><p align="justify"> <b>Applicant Last Name :</b> <span id="lastName">' + getDriverdetails1.lastName + '</span> <b>Date of Application :</b> <span id="DOA">' + getDriverdetails1.DOA + '</span> &nbsp;&nbsp;&nbsp;</p><p align="justify"> <b>Email :</b> <span id="email">' + getDriverdetails1.email + '</span> &nbsp;&nbsp;&nbsp; <b>Date of Birth :</b> <span id="DOB">' + getDriverdetails1.DOB + '</span> </p><p align="justify"> <b>Company Name :</b> <span id="companyName">' + getcmpdtls1.name + '</span> &nbsp;&nbsp;&nbsp; <b>Company Address :</b> <span id="companyAddress">' + getDriverdetails1.companyAddress + '</span> </p><p align="justify"> <b>Company City :</b> <span id="city">' + getDriverdetails1.companyCity + '</span> &nbsp;&nbsp;&nbsp; <b>Company Province/State :</b> <span id="companyProvince">' + getDriverdetails1.companyProvince + '</span> </p><p align="justify"><b>Company Country :</b> <span id="companyCountry">' + getDriverdetails1.companyCountry + '</span> &nbsp;&nbsp;&nbsp; <b>Company Postal Code :</b> <span id="companyPostalCode">' + getDriverdetails1.companyPostalCode + '</span> &nbsp;&nbsp;&nbsp;</p><p align="justify"><b>Position :</b>&nbsp;&nbsp;&nbsp; <span id="position">' + getDriverdetails1.position + '</span> &nbsp;&nbsp;&nbsp; <b>Social Insurance Number :</b> <span id="sin">' + getDriverdetails1.sin + '</span> &nbsp;&nbsp;&nbsp; </p></p><p align="justify"><b>Work Phone Canada :</b> <span id="phoneCanada">' + getDriverdetails1.phoneCanada + '</span> &nbsp;&nbsp;&nbsp; <b>Work Phone USA :</b> <span id="phoneUSA">' + getDriverdetails1.phoneUSA + '</span> &nbsp;&nbsp;&nbsp; </p><p align="justify"><b>Emergency Contact Name :</b> <span id="emegencyName">' + getDriverdetails1.emegencyName + '</span> &nbsp;&nbsp;&nbsp; <b>Emergency Contact :</b> <span id="emegencyContact">' + getDriverdetails1.emegencyContact + '</span> &nbsp;&nbsp;&nbsp; </p><p align="justify"> <b>Do you have the legal right to work in Canada? :</b> <span id="legalRightyesno">' + getDriverdetails1.legalRightyesno + '</span> &nbsp;&nbsp;&nbsp;</p><b>Select Any Option :</b> <span id="legalRight">' + getDriverdetails1.legalRight + '</span> &nbsp;&nbsp;&nbsp; <b>Do you have the legal right to enter the United States? :</b> <span id="legalRightUSA">' + getDriverdetails1.legalRightUSA + '</span> </p><p align="justify"><b>Have you you registered with the FMCSA Drug &amp; Alcohol Clearinghouse? :</b> <span id="FMCSA">' + getDriverdetails1.FMCSA + '</span> &nbsp;&nbsp;&nbsp; </p> <p align="justify"><b>Were you referred :</b> <span id="referred">' + getDriverdetails1.referred + '</span> &nbsp;&nbsp;&nbsp; </p><p align="justify"><b>Referred by :</b> <span id="referredBy">' + getDriverdetails1.referredBy + '</span> &nbsp;&nbsp;&nbsp; <b>Have you ever been bonded :</b> <span id="bonded">' + getDriverdetails1.bonded + '</span> &nbsp;&nbsp;&nbsp; </p><p align="justify"> <b>Have you ever been convicted of a felony? :</b> <span id="convicted">' + getDriverdetails1.convicted + '</span> <b>Are you a FAST approved driver? :</b> <span id="fastCardyesno">' + getDriverdetails1.fastCardyesno + '</span> &nbsp;&nbsp;&nbsp;</p><p align="justify"> <b>Fast Card :</b> <span id="fastCard">' + getDriverdetails1.fastCard + '</span> &nbsp;&nbsp;&nbsp; <b>Fastcard Expiry :</b> <span id="fastCardExpiry">' + getDriverdetails1.fastCardExpiry + '</span> </p>&nbsp;&nbsp;&nbsp; </p><span><h3>Three years Address</h3></span> <table id="table" class="table table-striped table-bordered" style="border:1px solid black;border-collapse:collapse;"> <thead> <tr> <th style="border:1px solid #000;">Address</th> <th style="border:1px solid #000;">City</th> <th style="border:1px solid #000;">State</th> <th style="border:1px solid #000;">Country</th> <th style="border:1px solid #000;">Province</th> <th style="border:1px solid #000;">PostalCode</th> <th style="border:1px solid #000;">From</th> <th style="border:1px solid #000;">To</th> </thead> <tbody>' + tableData + '</tbody> </table> </div></div></div></div></div>'

        //employment histroy
        let getEmployementhistroyaddress = await Employementhistroyaddress.findAll({ where: { driverId: driverid }, raw: true });
        let tableDataemploymentHistory = '';
        // if (getEmployementhistroyaddress) {

        //     await getEmployementhistroyaddress.forEach(function (getEmployementhistroyaddressLoop, i) {
        //         tableDataemploymentHistory = '<div><p align="justify"><b>Employer Name :</b> <span id="firstName">' + getEmployementhistroyaddressLoop.employerName + '</span></p><p align="justify"><b>Address :</b> <span id="employerAddress">' + getEmployementhistroyaddressLoop.employerAddress + '</span></p><p align="justify"><b>Position :</b> <span id="employerPosition">' + getEmployementhistroyaddressLoop.employerPosition + '</span></p><p align="justify"><b>Contact Person :</b> <span id="employerContactPerson">' + getEmployementhistroyaddressLoop.employerContactPerson + '</span></p><p align="justify"><b>Contact Person Number :</b> <span id="employerContactPersonNumber">' + getEmployementhistroyaddressLoop.employerContactPersonNumber + '</span></p><p align="justify"><b>Contact Person Email :</b> <span id="employerContactPersonEmail">' + getEmployementhistroyaddressLoop.employerContactPersonEmail + '</span></p><p align="justify"><b>Were you subject to the FMCSRS** while employed? :</b> <span id="fmcrs">' + getEmployementhistroyaddressLoop.fmcrs + '</span></p><p align="justify"><b>Was your job designated as a safety-sensitive function in any name dot-regulated mode <br> subject to the drug and alcohol, testing requirements of 49 cfr part 40? :</b> <span id="jobDesignated">' + getEmployementhistroyaddressLoop.jobDesignated + '</span></p><p align="justify"><b>From Date :</b> <span id="fromDate">' + getEmployementhistroyaddressLoop.fromDate + '</span></p><p align="justify"><b>To Date :</b> <span id="toDate">' + getEmployementhistroyaddressLoop.toDate + '</span></p></div>';
        //     });
        // }
        // else {
        //     tableDataemploymentHistory = "No Record Found"
        // }




        if (getEmployementhistroyaddress != null) {
            await getEmployementhistroyaddress.forEach(function (getDetails, i) {
                console.log(i);
                console.log(getDetails);
				if(i!=0){
					tableDataemploymentHistory +='<div style="break-after:page"></div>';
				}
                tableDataemploymentHistory += '<div><p align="justify"><b>Employer Name :</b> <span id="firstName">' + getDetails.employerName + '</span></p><p align="justify"><b>Address :</b> <span id="employerAddress">' + getDetails.employerAddress + '</span></p><p align="justify"><b>Position :</b> <span id="employerPosition">' + getDetails.employerPosition + '</span></p><p align="justify"><b>Contact Person :</b> <span id="employerContactPerson">' + getDetails.employerContactPerson + '</span></p><p align="justify"><b>Contact Person Number :</b> <span id="employerContactPersonNumber">' + getDetails.employerContactPersonNumber + '</span></p><p align="justify"><b>Contact Person Email :</b> <span id="employerContactPersonEmail">' + getDetails.employerContactPersonEmail + '</span></p><p align="justify"><b>Were you subject to the FMCSRS** while employed? :</b> <span id="fmcrs">' + getDetails.fmcrs + '</span></p><p align="justify"><b>Was your job designated as a safety-sensitive function in any name dot-regulated mode <br> subject to the drug and alcohol, testing requirements of 49 cfr part 40? :</b> <span id="jobDesignated">' + getDetails.jobDesignated + '</span></p><p align="justify"><b>From Date :</b> <span id="fromDate">' + getDetails.fromDate + '</span></p><p align="justify"><b>To Date :</b> <span id="toDate">' + getDetails.toDate + '</span></p></div> <hr style=" background-color: #000; height: 2px; border: 0;">';

            });
        } else {

            tableDataemploymentHistory += 'No Record Found'
        }


        let header = '<div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'EMPLOYMENT HISTORY</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
        let footer = '</div></div></div></div>';
        let employmentHistoryData = header + tableDataemploymentHistory + footer;
        // driving history
        let Drivinghistoryaddress_tableData = '';
        let ImagesAttachment
        let getDrivinghistoryaddressData = await Drivinghistoryaddress.findAll({ where: { driverId: driverid }, raw: true });
        //Sort array by date
        if (getDrivinghistoryaddressData.length > 0) {
            await getDrivinghistoryaddressData.forEach(function (getDrivinghistoryaddressLoop, i) {
                let attachmentpath = "uploads/attachment/drivinghistoryaddressAttachment/" + getDrivinghistoryaddressLoop.attachment;
                if (getDrivinghistoryaddressLoop.attachment) {
                    ImagesAttachment = '<img src="' + attachmentpath + '">';
                } else {
                    ImagesAttachment = '';
                }
                Drivinghistoryaddress_tableData += '<p align="justify"><b>Province :</b> <span id="Province">' + getDrivinghistoryaddressLoop.province + '</span></p><p align="justify"><b>License :</b> <span id="license">' + getDrivinghistoryaddressLoop.license + '</span></p></p><p align="justify"><b>Type :</b> <span id="type">' + getDrivinghistoryaddressLoop.type + '</span></p><p align="justify"><b>Expiry :</b> <span id="expiry">' + getDrivinghistoryaddressLoop.expiry + '</span></p>';
            });
        }
        else {
            Drivinghistoryaddress_tableData += 'No Record found';
        }
        let Drivinghistoryaddress_header = '<div style="break-after:page"></div><div id=""> <div style="text-align: center;"> <h3 >LICENSE DETAILS IN LAST 3 YEARS </h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
        let Drivinghistoryaddress_footer = '</div></div></div></div>';
        let Drivinghistoryaddres = Drivinghistoryaddress_header + Drivinghistoryaddress_tableData + Drivinghistoryaddress_footer
        // -----------Drivinghistoryaccident-----------------
        let getdrivingHistoryAccident_tableData = '';
        let getdrivingHistoryAccidentDtls = await Drivinghistoryaccident.findAll({ where: { driverId: driverid }, raw: true });
        //Sort array by date
        if (getdrivingHistoryAccidentDtls.length > 0) {
            await getdrivingHistoryAccidentDtls.forEach(function (getDetails, i) {
                getdrivingHistoryAccident_tableData += '<p align="justify"><b>Accidents Date :</b> <span id="Accidents Date">' + getDetails.accidentsDate + '</span></p><p align="justify"><b>Accidents Nature :</b> <span id="accidentsNature">' + getDetails.accidentsNature + '</span></p><p align="justify"><b>Accidents Fatalities :</b> <span id="accidentsFatalities">' + getDetails.accidentsFatalities + '</span></p><p align="justify"><b>Accidents Injuries :</b> <span id="accidentsInjuries">' + getDetails.accidentsInjuries + '</span></p><p align="justify"><b>Accidents Hazardous :</b> <span id="accidentsHazardous">' + getDetails.accidentsHazardous + '</span></p>';
            });
        }
        else {
            getdrivingHistoryAccident_tableData += 'No Record found';
        }
        let getdrivingHistoryAccident_header = '<div style="break-after:page"></div><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;"> DRIVING EXPERIENCE ACCIDENT</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
        let getdrivingHistoryAccident_footer = '</div></div></div></div>';
        let getdrivingHistoryAccident = getdrivingHistoryAccident_header + getdrivingHistoryAccident_tableData + getdrivingHistoryAccident_footer
        // -----------Drivinghistoryaccident-----------------
        // -----------Drivinghistoryviolations-----------------
        let Drivinghistoryviolations_tableData = '';
        let DrivinghistoryviolationsDtls = await Drivinghistoryviolations.findAll({ where: { driverId: driverid }, raw: true });
        //Sort array by date
        if (DrivinghistoryviolationsDtls.length > 0) {
            await DrivinghistoryviolationsDtls.forEach(function (getDetails, i) {
                Drivinghistoryviolations_tableData += '<p align="justify"><b>Traffic Convintions Date :</b> <span id="traficConvintionsDate">' + getDetails.traficConvintionsDate + '</span></p><p align="justify"><b>Traffic Convintions Charge :</b> <span id="traficConvintionsCharge">' + getDetails.traficConvintionsCharge + '</span></p><p align="justify"><b>Traffic Convintions Location :</b> <span id="traficConvintionsLocation">' + getDetails.traficConvintionsLocation + '</span></p><p align="justify"><b>Traffic Convintions Penalty :</b> <span id="traficConvintionsPenalty">' + getDetails.traficConvintionsPenalty + '</span></p>';
            });
        }
        else {
            Drivinghistoryviolations_tableData += 'No Record found';
        }
        let Drivinghistoryviolations_header = '<div style="break-after:page"></div><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">DRIVING EXPERIENCE VIOLATIONS</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
        let Drivinghistoryviolations_footer = '</div></div></div></div>';
        let DrivinghistoryviolationsData = Drivinghistoryviolations_header + Drivinghistoryviolations_tableData + Drivinghistoryviolations_footer
        // -----------Drivinghistoryviolations-----------------
        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
        let getDrivinghistoryData
        let hide = ''
        if (getDrivinghistory) {
            if (getDrivinghistory.drivingExperience == "No") {
                hide = 'style="display: none;'
            }
            let Formheader = '<div ></div><div id=""> <div style="text-align: center;"> '+cmpd_img+'<h3>Driver Experience & Qualification </h3> <br> <h3>DRIVING EXPERIENCE</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
            let Formbody = '<p align="justify"><b>Driving Experience:</b> <span id="drivingExperience">' + getDrivinghistory.drivingExperience + '</span></p><div '+hide+' ><p align="justify"><b>Class of Equipment :</b> <span id="classofEquipment">' + getDrivinghistory.classofEquipment + '</span></p><p align="justify"><b>Choose Type of Equipment :</b> <span id="equipmentType">' + getDrivinghistory.equipmentType + '</span></p><p align="justify"><b>Start Date:</b> <span id="equipmentStartDate">' + getDrivinghistory.equipmentStartDate + '</span></p><p align="justify"><b>End Date:</b> <span id="equipmentEndDate">' + getDrivinghistory.equipmentEndDate + '</span></p><p align="justify"><b>Approx of Miles / Kms :</b> <span id="aprox">' + getDrivinghistory.aprox + '</span></p><p align="justify"><b>List provinces & states operated in for last five years :</b> <span id="listProvinces">' + getDrivinghistory.listProvinces + '</span></p><p align="justify"><b>List courses and training other then as shown elsewhere in this application:</b> <span id="listCourses">' + getDrivinghistory.listCourses + '</span></p><p align="justify"><b>Education: Last school Attended:</b> <span id="education">' + getDrivinghistory.education + '</span></p></div><br><img src="uploads/attachment/drivinghistoryaddressSignature/' + getDrivinghistory.signature + '" id="signature" alt="user" width="150">   <hr>  <p align="justify"><b>Have you ever been denied a license, permit or privilege to operate a motor vehicle? :</b> <span id="deniedLicense">' + getDrivinghistory.deniedLicense + '</span></p><p align="justify"><b>Has any license, permit or privilege ever been suspended or revoked? :</b> <span id="licensePermit">' + getDrivinghistory.licensePermit + '</span></p>'
            let Formfooter = '</div></div></div></div>';
            let Form = Formheader + Formbody + Formfooter
            getDrivinghistoryData = Form + Drivinghistoryaddres + getdrivingHistoryAccident + DrivinghistoryviolationsData;
        } else {
            getDrivinghistoryData = '';
        }
        // motorvehicleCertificate
        let getDriverdetails = await Driverdetails.findOne({ where: { driverId: driverid }, raw: true });
        // console.log(2);
        let getDriver = await Driver.findOne({ where: { id: driverid }, raw: true });
        let driverName = getDriver ? getDriver.driver_name : '';
        let driver_license = getDriver ? getDriver.driver_license : '';
        let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: driverid, certificateID: 6 }, raw: true });
        //    console.log(3);
        let getcmpdtls = await Company.findOne({ where: { id: getDriver.company_id }, raw: true });
        let CertificateauthDtlsf;
        let certificateIDSixFirtstPrams;
        let adminSignature;
        let certificateIDSixSecondPrams;
        let certificateDate;
        let orgName;
        let Formheader;
        let Formfooter;
              let drugAlcoholPointone;
            let drugAlcoholPointtwo
            let drugAlcoholPointthree
            let drugAlcoholPointfour
            let drugAlcoholPointfive
            let drugAlcoholPointsix
            let getsafetyLaws1;
        let adminImagesAttachment
        CertificateauthDtlsf = CertificateauthDtls ? CertificateauthDtls.approve : ""
        let CcertificateauthDtls = await Certificateauth.findOne({ where: { driverId: driverid, certificateID: 5 }, raw: true });
        orgName = CcertificateauthDtls ? CcertificateauthDtls.orgName : ""
        certificateDate = CertificateauthDtls ? CertificateauthDtls.date : ""

        certificateIDSixFirtstPrams = CertificateauthDtls ? CertificateauthDtls.certificateIDSixFirtstPrams : ""
        certificateIDSixSecondPrams = CertificateauthDtls ? CertificateauthDtls.certificateIDSixSecondPrams : ""
                  drugAlcoholPointone = CertificateauthDtls ? CertificateauthDtls.drugAlcoholPointone : ""
            drugAlcoholPointtwo = CertificateauthDtls ? CertificateauthDtls.drugAlcoholPointtwo : ""
            drugAlcoholPointthree = CertificateauthDtls ? CertificateauthDtls.drugAlcoholPointthree : ""
            drugAlcoholPointfour = CertificateauthDtls ? CertificateauthDtls.drugAlcoholPointfour : ""
            drugAlcoholPointfive = CertificateauthDtls ? CertificateauthDtls.drugAlcoholPointfive : ""
            drugAlcoholPointsix = CertificateauthDtls ? CertificateauthDtls.drugAlcoholPointsix : ""
        let signature = getDrivinghistory ? getDrivinghistory.signature : '';
        let attachmentpath = "uploads/attachment/drivinghistoryaddressSignature/" + signature;
        if (signature) {
            ImagesAttachment = '<img id="signature" alt="user" width="150" src="' + attachmentpath + '">';
        } else {
            ImagesAttachment = '';
        }


        //Clearence house to get admin signature
        let CertificateauthDtlsClearenceHouse = await Certificateauth.findOne({ where: { driverId: driverid, certificateID: 5 }, raw: true });
        adminSignature = CertificateauthDtlsClearenceHouse ? CertificateauthDtlsClearenceHouse.adminSignature : ""
        let adminattachmentpath = "uploads/attachment/clearHouseSupervisor/" + adminSignature;
        if (adminSignature) {
            adminImagesAttachment = '<img id="signature" alt="user" width="150" src="' + adminattachmentpath + '">';
        } else {
            adminImagesAttachment = '';
        }

        Formheader = '<div></div><div id=""> <div style="text-align: center;">'+cmpd_img+'<h3 style="margin-bottom:50px;padding-left:50px;">Motor Vehicle Driver’s CERTIFICATION OF COMPLIANCE<h3>WITH DRIVER LICENSE REQUIREMENTS </h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
        let Formbody = '<p align="justify">MOTOR CARRIER INSTRUCTIONS: The requirements in Part383 apply to every driver who operates in intrastate, interstate, or foreign commerce and operates a vehicle weighing 26,001 pounds or more, can transport more than 15 people, or transports hazardous materials that require placarding.<br>The requirements in Part 391 apply to every driver who operates in interstate commerce and operates a vehicle weighing 10,001 pounds or more, can transport more than 15 people, or transports hazardous materials that require placarding.</p><h3>DRIVER REQUIREMENTS:</h3><p align="justify">Parts 383 and 391 of the Federal Motor Carrier Safety Regulations contain some requirements that you, as a driver must comply with. These requirements are in effect as of July 1, 1987. They are as follows:</p><h3>1. POSSESS ONLY ONE LICENSE:</h3><p align="justify">You, as a commercial vehicle driver, may not possess more than one license. If you currently have more than one license, you should keep the license from your state of residence and return the additional licenses to the states that issued them. DESTROYING a license does not close the record in the state that issued it; you must notify the state. If a multiple license has been lost, stolen, or destroyed, you should close your record by notifying the state of issuance that you no longer want to be licensed by that state.</p><h3>2. NOTIFICATION OF LICENSE SUSPENSION, REVOCATION OR CANCELLATION:</h3><p align="justify">Sections 392.42 and 383.33 of the Federal Motor Carrier Safety Regulations require that you notify your employer the next business day of any revocation or suspension of your driver’s license. In addition, section 383.31 requires that any time you violate a state or local traffic law (other than parking), you must report it within 30 days to: 1) your employing motor carrier and 2) the state that issued your license (if the violation occurs in a state other than the one which issued your license).The notification to both the employer and state must be in Writing.</p><h3>The following license is the only one I will possess:</h3><p align="justify"><b>Driver’s Name:</b> <span id="driverName">' + getDriver.driver_name + '</span></p><p align="justify"><b>Driver’s License No:</b> <span id="driver_license">' + getDriver.driver_license + '</span></p><p align="justify"><b>Exp Date :</b> <span id="license_expiry">' + getDriver.license_expiry + '</span></p><p align="justify"><b>Drivers Signature:</b> <span id="equipmentEndDate">' + ImagesAttachment + '</span></p><p align="justify"><b>Date:</b> <span id="getupdatedDate">' + certificateDate + '</span></p>'
        Formfooter = '</div></div></div></div>';
        let motorvehicleCertificateData = Formheader + Formbody + Formfooter
        //Medical decleration
        Formheader = '<div ></div><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'MEDICAL DECLERATION CERTIFICATION</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
        Formbody = '<p align="justify">On March 3rd, 1999 Transport Canada and the US federal Highway administration (FHWA) entered into a reciprocal agreement regarding the physical requirements for a Canadian drivers of a commercial vehicle in the US, as currently contained in the federal Motor carriers safety regulation, part 391.41 et seq, and vice-versa, the reciprocal agreement will remove the requirements for a Canadian driver to carry a copy of a medical examiners certificate indicating that the driver is physically qualified to drive (In effect, the existence of a valid driver’s license issued by the province of on is deemed to be proof that a driver is physically qualified to drive in US) however, FHWA will not recognize an on license if the driver has certain medical conditions and those conditions would prohibit them from driving in the US.</p><p align="justify">I certify that I am qualified to operate a commercial vehicle in the United States. I further certify that:</p><p align="justify">A) I have no established medical history or clinical diagnosis of epilepsy</p><p align="justify">B) I don’t have impaired hearing (A driver must be able to first perceive a forced whispered voice in the better ear at not less than 5 feet with or without the use of a hearing aid, or does not have an average hearing loss in the better ear greater than 40 decibels at 500 Hz, 100 Hz, or 200 Hz with or without a hearing aid when tested by an audiometric device calibrated to American National Standard Z24.5-1951)</p><p align="justify">C) I have not been issued a waiver by the province of on allowing me to operate a commercial motor vehicle pursuant to section 20 or 22 of the on regulation 340/94.</p><p align="justify">I further agree to inform '+getcmpdtls.name+' should my medical status change, or if I can no longer certify conditions A to C, described above.</p><p align="justify"><b>Driver’s Name:</b> <span id="driverName">' + getDriver.driver_name + '</span></p><p align="justify"><b>Drivers Signature:</b> <span id="equipmentEndDate">' + ImagesAttachment + '</span></p><p align="justify"><b>Date:</b> <span id="getupdatedDate">' + certificateDate + '</span></p>'
        Formfooter = '</div></div></div></div>';
        let medicaldeclerationData = Formheader + Formbody + Formfooter
        //driverAcknowledgement
        let FormheaderdriverAcknowledgement = '<div></div><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;"> '+cmpd_img+'DRIVER ACKNOWLEDGEMENT</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
        Formbody = '<p align="justify"> I ' + getDriver.driver_name + ' have been explained and I understand it is illegal to Falsify in logbooks and I have to log all time markers (e.g., Tolls, border crossing, fuel times etc.) Properly and exactly as per ' + getDriverdetails.eventsCalTimezone + ' Time Zone. </p><p align="justify">If any falsification in my logs is found while auditing by company, I agree that I will be subjected to fines and penalties</p><p align="justify">Fines and penalties will be determined by safety and compliance officer looking into number of counts and difference of hours.</p><p align="justify"><b>Driver’s Name:</b> <span id="driverName">' + getDriver.driver_name + '</span></p><p align="justify"><b>Drivers Signature:</b> <span id="equipmentEndDate">' + ImagesAttachment + '</span></p><p align="justify"><b>Date:</b> <span id="getupdatedDate">' + certificateDate + '</span></p>'
        Formfooter = '</div></div></div></div>';
        let driverAcknowledgementData = FormheaderdriverAcknowledgement + Formbody + Formfooter
        //PSPDisclouse
        Formheader = '<div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'PSP DISCLOSURE</h3> </div><div style="margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
        Formbody = '<h3><center>REGARDING BACKGROUND REPORTS FROM THE PSP ONLINE SERVICE </center></h3><p align="justify">In connection with your application for employment with  <u> ' + getcmpdtls.name + '  </u> its employees, agents or contractors may obtain one or more reports regarding your driving, and safety inspection history, from the Federal Motor Carrier Safety Administration (FMCSA).</p><p align="justify">When the application for employment is submitted in person, if the Prospective Employer uses any information it obtains from FMCSA in a decision to not hire you or to make any other adverse employment decision regarding you, the Prospective Employer will provide you with a copy of the report upon which its decision was based and a written summary of your rights under the Fair Credit Reporting Act before taking any final adverse action. If any final adverse action is taken against you based upon your driving history or safety report, the Prospective Employer will notify you that the action has been taken and that the action was based in part or in whole on this report</p><p align="justify">When the application for employment is submitted by mail, telephone, computer, or other similar means, if the Prospective Employer uses any information it obtains from FMCSA in a decision to not hire you or to make any other adverse employment decision regarding you, the Prospective Employer must provide, you within three business days of taking adverse action, oral, written or electronic notification: that adverse action has been taken based in whole or in part on information obtained from FMCSA; the name, address, and the toll free telephone number of FMCSA; that the FMCSA did not make the decision to take the adverse action and is unable to provide you the specific reasons why the adverse action was taken; and that you may, upon providing proper identification, request a free copy of the report and may dispute with the FMCSA the accuracy or completeness of any information or report. If you request a copy of a driver record from the Prospective Employer who procured the report, then, within 3 business days of receiving your request, together with proper identification, the Prospective Employer must send or provide to you a copy of your report and a summary of your rights under the Fair Credit Reporting Act.</p><p align="justify">Neither the Prospective Employer nor the FMCSA contractor supplying the crash and safety information has the capability to correct any safety data that appears to be incorrect. You may challenge the accuracy of the data by submitting a request to https://dataqs.fmcsa.dot.gov. If you challenge crash or inspection information reported by a State, FMCSA cannot change or correct this data. Your request will be forwarded by the DataQs system to the appropriate State for adjudication</span></p><p align="justify">Any crash or inspection in which you were involved will display on your PSP report. Since the PSP report does not report, or assign, or imply fault, it will include all Commercial Motor Vehicle (CMV) crashes where you were a driver or co-driver and where those crashes were reported to FMCSA, regardless of fault. Similarly, all inspections, with or without violations, appear on the PSP report. State citations associated with Federal Motor Carrier Safety Regulations (FMCSR) violations that have been adjudicated by a court of law will also appear, and remain, on a PSP report.</span></p><p align="justify">The Prospective Employer cannot obtain background reports from FMCSA without your authorization</span></p><h3><center>AUTHORIZATION</center></h3><p align="justify">If you agree that the Prospective Employer may obtain such background reports, please read the following and sign below: I authorize ' + getcmpdtls.name + ' to access the FMCSA Pre-Employment Screening Program (PSP) system to seek information regarding my commercial driving safety record and information regarding my safety inspection history. I understand that I am authorizing the release of safety performance information including crash data from the previous five (5) years and inspection history from the previous three (3) years. I understand and acknowledge that this release of information may assist the Prospective Employer to make a determination regarding my suitability as an employee.</p><p align="justify">I further understand that neither the Prospective Employer nor the FMCSA contractor supplying the crash and safety information has the capability to correct any safety data that appears to be incorrect. I understand I may challenge the accuracy of the data by submitting a request to https://dataqs.fmcsa.dot.gov. If I challenge crash or inspection information reported by a State, FMCSA cannot change or correct this data. I understand my request will be forwarded by the DataQs system to the appropriate State for adjudication</p><p align="justify">I understand that any crash or inspection in which I was involved will display on my PSP report. Since the PSP report does not report, or assign, or imply fault, I acknowledge it will include all CMV crashes where I was a driver or co-driver and where those crashes were reported to FMCSA, regardless of fault. Similarly, I understand all inspections, with or without violations, will appear on my PSP report, and State citations associated with FMCSR violations that have been adjudicated by a court of law will also appear, and remain, on my PSP report.</p><p align="justify">I have read the above Disclosure Regarding Background Reports provided to me by Prospective Employer and I understand that if I sign this Disclosure and Authorization, Prospective Employer may obtain a report of my crash and inspection history. I hereby authorize Prospective Employer and its employees, authorized agents, and/or affiliates to obtain the information authorized above.</p><div align="justify" style="width:25%;float:left"><b>Date:</b> <span id="getupdatedDate">' + certificateDate + '</span></div><div align="justify" style="width:75%;float:left;margin-bottom:5%"><b style="position:absolute">Drivers Signature:</b> <span id="" style="position:absolute;margin-left:18%;">' + ImagesAttachment + '</span></div><p align="justify"><b>Drivers Name:</b>  ' + getDriver.driver_name + '</p><p align="justify" style="font-size:12px;">NOTICE: This form is made available to monthly account holders by NIC on behalf of the U.S. Department of Transportation, Federal Motor Carrier Safety Administration (FMCSA). Account holders are required by federal law to obtain an Applicant’s written or electronic consent prior to accessing the Applicant’s PSP report. Further, account holders are required by FMCSA to use the language contained in this Disclosure and Authorization form to obtain an Applicant’s consent. The language must be used in whole, exactly as provided. Further, the language on this form must exist as one stand-alone document. The language may NOT be included with other consent forms or any other language.</p><p align="justify" style="font-size:12px;">NOTICE: The prospective employment concept referenced in this form contemplatesthe definition of “employee” contained at 49 C.F.R. 383.5.</p>'
        Formfooter = '</div></div></div></div>';
        let PSPDisclosure = Formheader + Formbody + Formfooter
        //clearingHouseConsent
        Formheader = '<div ></div><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'CLEARING HOUSE CONSENT</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;break-after:page" class="col-md-12">';
        Formbody = '<h3><center>SCHEDULE “A” “1”THE COMMERCIAL DRIVER’S LICENSE DRUG AND ALCOHOL CLEARINGHOUSE CONSENT FORM</center></h3>(TO BE EXECUTED BY ALL EMPLOYEES AND APPLICANTS WHO ARE OFFERED EMPLOYMENT)<p align="justify">1. I understand that as a condition of employment, or continued employment, with the Company, I must register with the Commercial Driver’s License Drug and Alcohol Clearinghouse at clearinghouse.fmcsa.dot.gov and I must grant electronic consent for the Company to run a full Pre-Employment Query on my record with the Clearinghouse.</p><p align="justify">2. I understand that a full Pre-Employment Query includes assessing the following specific records:</p><p align="justify">a. A verified positive, adulterated, or substituted controlled substances test result;</p><p align="justify">b. An alcohol confirmation test with a concentration of 0.04 or higher;</p><p align="justify">c. An employer’s report of actual knowledge, meaning that the employer directly observed the employee’s use of alcohol or controlled substances while on duty;</p><p align="justify">d. On duty alcohol use, meaning an employer has actual knowledge that an employeehas used alcohol while performing safety sensitive functions; e. Pre-duty alcohol use, meaning that an employer has actual knowledge that anemployee has used alcohol within 4 hours of performing safety sensitive functions;</p><p align="justify">f. Alcohol use following an accident, unless 8 hours have passed following the accident or until a post accident alcohol test is conducted, whichever occurs first;</p><p align="justify">g. Controlled substance use, meaning that no driver shall used a controlled substance while performing a safety sensitive function unless a licensed medical practitioner who is familiar with the driver’s medical history has advised the driver that the substance will not adversely affect the driver’s ability to safely operate a commercial motor vehicle;</p><p align="justify">h. A SAP report of the successful completion of the return-to-duty process;</p><p align="justify">i. A negative return-to-duty test; and</p><p align="justify">j. A SAP report of the successful completion of follow-up testing.</p><p align="justify">3. I understand that I cannot perform a safety sensitive function for the Company if my Clearinghouse record indicates a violation as listed in Part 2 above unless/until I have completed the SAP evaluation, referral and education/treatment process as described in this Policy. Page 29 INITIALS J S JASMEET SINGH My signature below confirms that I have read and understood the above terms and that I agree to abide by them.</p><p align="justify"></p><p align="justify"><b>Date this at:</b> <span id="getupdatedDate">' + certificateDate + '</span></p><p align="justify"><b>Printed Name of Employee as it appears on DL:</b> ' + getDriver.driver_name + '</p><p align="justify"><b>Driver’s License No:</b> ' + getDriver.driver_license + ' <b>Province:</b> ' + getDriver.province + '</p><p align="justify"><b>Employee Date of Birth:</b> ' + getDriverdetails.DOB + '</p><p align="justify"><b>Drivers Signature:</b> <span id="">' + ImagesAttachment + '</span></p><p align="justify"><b>Supervisor Signature:</b> <span id="">' + adminImagesAttachment + '</span></p><p align="justify">NOTICE: This form is made available to monthly account holders by NIC on behalf of the U.S. Department of Transportation, Federal Motor Carrier Safety Administration (FMCSA). Account holders are required by federal law to obtain an Applicant’s written or electronic consent prior to accessing the Applicant’s PSP report. Further, account holders are required by FMCSA to use the language contained in this Disclosure and Authorization form to obtain an Applicant’s consent. The language must be used in whole, exactly as provided. Further, the language on this form must exist as one stand-alone document. The language may NOT be included with other consent forms or any other language.</p><p align="justify">NOTICE: The prospective employment concept referenced in this form contemplatesthe definition of “employee” contained at 49 C.F.R. 383.5.</p></div><div style="border: 2px dotted;padding: 5px;" class="col-md-12"><h3><center>SCHEDULE “A” “2”THE COMMERCIAL DRIVER’S LICENSE DRUG AND ALCOHOL CLEARINGHOUSE ANNUAL CONSENT FORM FOR LIMITED QUERIE</center></h3><center>(TO BE EXECUTED BY ALL CURRENT EMPLOYEES AND ALL APPLICANTS WHO ARE OFFERED EMPLOYMENT)</center><p align="justify">My signature below confirms that I agree to allow the Company or their representative, '+orgName+', to conduct an Annual Limited Query on my record with the Commercial Driver’s License (CDL) Drug and Alcohol Clearinghouse. I understand that a Limited Query will not reveal any of the details of my record with the Clearinghouse.</p><p align="justify">Furthermore, I understand that, if the Limited Query reveals that the Clearinghouse has information on me indicating that I have been in violation, I must immediately register with the Clearinghouse at clearinghouse.fmcsa.dot.gov and grant permission for the Company or their representative to run a Full Query on my record with the Clearinghouse. I understand that the Company or their representative must run the Full Query within 24 hours of receiving the results of the Limited Query indicating a violation on my part.</p><p align="justify">I agree that, if I fail to register with the Clearinghouse within 24 hours, I will be removed from safety sensitive functions until the Company or their representative is able to conduct the Full Query and the results confirm that my record contains no violations as outlined in this Policy.</p><p align="justify">I agree that, if my record with the Clearinghouse reveals that I have engaged in prohibited conduct (i.e. a violation) as outlined in this Policy or the DOT rules, I will be removed from safety sensitive functions until/unless I have completed the SAP evaluation, referral and education/treatment process as described in this Policy.</p><p align="justify">I understand that, if any information is added to my Clearinghouse record within the 30-day period immediately following the Company’s or their representative’s Query on me, the Company will be notified by the Federal Motor Carrier Safety Administration (FMCSA).</p><p align="justify">My signature below confirms that I have read and understood the above terms and that I grant permission for an Annual Limited Query on my record with the Commercial Driver’s License Drug and Alcohol Clearinghouse for the duration of my employment with the Company.</p><p align="justify"><b>Date this at:</b> <span id="getupdatedDate">' + certificateDate + '</span></p><p align="justify"><b>Printed Name of Employee as it appears on DL:</b> ' + getDriver.driver_name + '</p><p align="justify"><b>Driver’s License No:</b> ' + getDriver.driver_license + ' <b>Province:</b> ' + getDriver.province + '</p><p align="justify"><b>Employee Date of Birth:</b> ' + getDriverdetails.DOB + '</p><p align="justify"><b>Drivers Signature:</b> <span id="">' + ImagesAttachment + '</span></p><p align="justify"><b>Supervisor Signature:</b> <span id="">' + adminImagesAttachment + '</span></p>'
        Formfooter = '</div></div></div></div>';
        let clearingHouseConsentData = Formheader + Formbody + Formfooter
        // compensatedWork
        adminattachmentpath = "uploads/attachment/drivinghistoryaddressSignature/" + adminSignature;
        if (signature) {
            ImagesAttachment = '<img id="signature" alt="user" width="150" src="' + attachmentpath + '">';
        } else {
            ImagesAttachment = '';
        }
        Formheader = '<div ></div><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'COMPENSATED WORK</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
        Formbody = '<h3><center>Driver Certification for Other Compensated Work</center></h3><p align="justify">When employed by a motor carrier, a driver must report to the carrier all on-duty time including time working for other employers. The definition of on-duty time found in Section 395.2 paragraphs (8) and (9) of the Federal Motor Carrier Safety Regulations includes time performing any other work in the capacity of, or in the employer or service of, a common, contract or private motor carrier, also performing any compensated work for any non-motor carrier entity.</p><p align="justify"><b>Are you currently working for another employer?</b> <span id="certificateIDSixSecondPrams">' + certificateIDSixSecondPrams + '</span></p><p align="justify"><b>Currently do have your intent to work for another employer while still employed by this company?</b> <span id="certificateIDSixSecondPrams">' + certificateIDSixSecondPrams + '</span></p><p align="justify"><b>Date this at:</b> <span id="getupdatedDate">' + certificateDate + ' at ' + getDriverdetails.companyProvince + ' </span></p><p align="justify"><b>Drivers Signature:</b> <span id="">' + ImagesAttachment + '</span></p>'
        Formfooter = '</div></div></div></div>';
        let compensatedWorkData = Formheader + Formbody + Formfooter
        // drugAndAlcohol
		
		CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: driverid, certificateID: 7 }, raw: true });
        CertificateauthDtlsf = CertificateauthDtls ? CertificateauthDtls.approve : "";
console.log(CertificateauthDtls);
        certificateIDSixFirtstPrams = CertificateauthDtls ? CertificateauthDtls.certificateIDSixFirtstPrams : ""
        certificateIDSixSecondPrams = CertificateauthDtls ? CertificateauthDtls.certificateIDSixSecondPrams : ""
                  drugAlcoholPointone = CertificateauthDtls ? CertificateauthDtls.drugAlcoholPointone : ""
            drugAlcoholPointtwo = CertificateauthDtls ? CertificateauthDtls.drugAlcoholPointtwo : ""
            drugAlcoholPointthree = CertificateauthDtls ? CertificateauthDtls.drugAlcoholPointthree : ""
            drugAlcoholPointfour = CertificateauthDtls ? CertificateauthDtls.drugAlcoholPointfour : ""
            drugAlcoholPointfive = CertificateauthDtls ? CertificateauthDtls.drugAlcoholPointfive : ""
            drugAlcoholPointsix = CertificateauthDtls ? CertificateauthDtls.drugAlcoholPointsix : ""
        Formheader = '<div ></div><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'DRUG AND ALCOHOL</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
        Formbody = '<h3><center>Review and Sign Consent - Consent to Previous Employment + Drug & Alcohol History Verification</center></h3><p align="justify">I, ' + getDriver.driver_name + ', am applying for employment at ' + getcmpdtls.name + '. (my "Potential Employer") and want to provide my consent for only this application l agree that my Potential Employer and its service provider,Compliance Mentroz ("Service Provider”), may contact all my former employers to conduct a reference and driving safety check that includes the collection and assessment of information about my dates of employment, employment status, job duties and driving experience, reason for leaving, job performance and incident/accident record.</p><p align="justify">I agree that my Potential Employer and its Service Provider may contact all organizations who have issued educational awards or credentials that I have identified to confirm my awards and credentials.</p><p align="justify">I understand that Service Provider retains employment history records on behalf of anumber of employers in the trucking industry. I agree that Service Provider, on behalf of my Potential Employer, may check these records to confirm my employment history and conduct a reference and driving safety check that includes an assessment of my dates of employment, employment status, job duties and driving experience, reason for leaving, job performance and incident/accident record.</p><p align="justify">I agree that that my Potential Employer and Service Provider may use and disclose my personal information as required for the above-noted purposes and agree that each of the organizations that are contacted for the above-noted purposes may disclose information to either my Potential Employer or its Service Provider. Iwill not hold my Potential Employer or Service Provider or said organizations liable for this disclosure.</p><p align="justify">I agree that Service Provider may retain all personal information it collects for the above-noted purposes on behalf of my Potential Employer, who shall contro! and have a full right of access to records of my personal information that Service Provider creates and retains. I will not hold Service Provider liable for any losses arising out of its retention or handling of my personal information.</p><p align="justify"><br> I understand that I have the right to (1) to review the information provided by previous employers, (2) have errors corrected and re-submitted by previous employers and (3) have a rebuttal statement attached to information I allege to be erroneous if my previous employer and I cannot agree on the accuracy of information.</p><p align="justify">l understand that I may direct any questions I have about this consent and about how Service Provider handles personal information on behalf of my Potential Employer to Compliance Mentroz. at driverhiring@compliancementorz.com or by phone at +1 (905) 486-1666</p><p align="justify">I certify that this application was completed by me and that all entries on it and information in it are true and complete to the best of my knowledge. I understand that any misstatement or omission of information in this application may result in my dismissal.</p><p align="justify">I hereby authorize release of information from my Department of Transportation regulated drug and alcohol testing records by my previous employer, to the prospective employer named below and /or its service provider Compliance Mentroz. This release is in accordance with DOT Regulation 49 CFR Part 40, Section 40.25. I understand that information to be released by my previous employer, is limited to the following DOT-regulated testing items:</p><p align="justify"> 1.Alcohol tests with a result of 0.04 or higher:  '+drugAlcoholPointone+'</p><p align="justify"> 2.Verified positive drug tests : '+drugAlcoholPointtwo+' </p><p align="justify"> 3.Refusals to be tested : '+drugAlcoholPointthree+'</p><p align="justify"> 4.Other violations of DOT agency drug and alcohol testing regulations : '+drugAlcoholPointfour+' </p><p align="justify"> 5.Information obtained from previous employers of a drug and alcohol rule violation : '+drugAlcoholPointfive+' </p><p align="justify"> 6.Documentation,if any,of completion of the return-to-duty process following a rule violation : '+drugAlcoholPointsix+' </p><p align="justify"><b>Date this at:</b> <span id="certificateDate">' + certificateDate + ' at ' + getDriverdetails.companyProvince + '</span></p><p align="justify"><b>Driver Name</b> ' + getDriver.driver_name + '</p><p align="justify"><b>Drivers Signature:</b> <span id="">' + ImagesAttachment + '</span></p>'
        Formfooter = '</div></div></div></div>';
        let drugAndAlcoholData = Formheader + Formbody + Formfooter
        // HOS
        let gethosdtls = await Hos.findOne({ where: { driverId: driverid }, raw: true });
        let getDrivinghistoryaddress = await Drivinghistoryaddress.findOne({ where: { driverId: driverid }, order: [['id', 'DESC']], raw: true });
        
        let getDrivinghistorySignature = getDrivinghistory ? getDrivinghistory.signature : '';
        let companyName = getcmpdtls ? getcmpdtls.name : '';
        let hosdateData = gethosdtls ? gethosdtls.dateData : '';
        let hosdurationData = gethosdtls ? gethosdtls.durationData : '';
        let hosselectedDate = gethosdtls ? gethosdtls.selectedDate : '';
        let hoscreatedAt = gethosdtls ? gethosdtls.createdAt : '';
        let totalDuration = gethosdtls ? gethosdtls.totalDuration : '';
        let hosAttachment_attachment = gethosdtls ? gethosdtls.hosAttachment_attachment : '';
        let getDrivinghistoryaddressprovince = getDrivinghistoryaddress ? getDrivinghistoryaddress.province : '';
        let getDrivinghistoryaddresslicense = getDrivinghistoryaddress ? getDrivinghistoryaddress.license : '';
        let signaturedata = getDrivinghistorySignature
        if (signaturedata) {
            signature = '<img style="width: 30%" src="uploads/attachment/drivinghistoryaddressSignature/' + getDrivinghistorySignature + '"';
        } else {
            signature = ''
        }
        let getHOSDtls = await Hos.findAll({ where: { driverId: driverid }, raw: true });
        let n = 1
        let tableDataHOS = '';
        tableDataHOS += '<div></div> <table border="1" cellspacing="0" cellpadding="0" width="200" align="center" style="width: 100%;border: 1px solid black;" id="table" class="table table-striped table-bordered"><thead><tr><th class="thClass">Sl</th><th class="thClass">Date</th><th class="thClass">Duration</th></tr></thead><tbody>'
        if (getHOSDtls) {
            await getHOSDtls.forEach(function (getDetails, i) {
                tableDataHOS += '<tr align="center" style="font-size: 20px;border: 1px solid black;"><td style="border: 1px solid black;">' + n + '</td><td style="border: 1px solid black;">' + getDetails.actualDate + '</td><td style="border: 1px solid black;">' + getDetails.duration + '</td> </tr>';
                n++;
            });
        }
        else {
            tableDataHOS = '';
        }
		var hos_date = new Date(hoscreatedAt);
		var hours = hos_date.getHours(); //returns 0-23
		var minutes = hos_date.getMinutes(); //returns 0-59
		var seconds = hos_date.getSeconds(); //returns 0-59
		var hos_time = hours+':'+minutes+':'+seconds;
        tableDataHOS += '</tbody></table>'
        Formheader = '<div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'HOS</h3> </div><div style="margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
        Formbody = '<div class="col-md-12"><center><i style="font-size:50px" class="mdi mdi-clock-fast"></i><br><h3>Statement of Hours of Service</h3></center><p align="justify">New Hires, Contractors, Casual &amp; Temporary Employees</p><hr style="width:100%"><b>Name:</b><span id="driverName">' + driverName + '</span><hr style="width:100%"><div class="row"><div class="col-md-4"><b>Drivers Licence Number:</b><span id="driver_license">' + driver_license + '</span></div><div class="col-md-4"><b>Class of License:</b><span id="getDrivinghistoryprovince">' + getDrivinghistoryaddressprovince + '</span></div><div class="col-md-4"><b>Issuing Province:</b><span id="getDrivinghistorylicense">' + getDrivinghistoryaddresslicense + '</span></div></div><hr style="width:100%"><p align="justify">Section 81. (2)(c) The motor carrier maintains accurate and legible records showing, for each day, the drivers duty status and elected cycle, the hour at which each duty status begins and ends and the total number of hours spent in each status and keeps those records for a minimum period of 6 months after the day on which they were recorded. Section 84. No driver who is required to fill out a daily log shall drive and no motor carrier shall request, require or allow the driver to drive unless the driver has in their possession (a) a copy of the daily logs for the preceding 14 days and, in the case of a driver driving under an oil well service permit, for each of the required 3 periods of 24 consecutive hours of off-duty time in any period of 24 days; (b) the daily log for the current day, completed up to the time at which the last change in the driver’s duty status occurred;<br></p><div class="row"><div class="col-md-7"></div><div class="col-md-3"><span id="hosdurationData">' + hos_time + '</span><br>On<br><span id="hosdateData">' + hosdateData + '</span></div></div><hr style="width:100%">INSTRUCTIONS: Day 1 is the day before you first begin work for this motor carrier. The dates have been pre-filled based on todays date. If you need to change the DAY 1 date, Click here<br><br><div class="row"><b>Selected Date :</b><span id="hosselectedDate">' + hosselectedDate + '</span></div><br><div style="width:100%" class="container1"></div><br><div style="text-align:left"><b>Employee Signature:</b> ' + signature + '<br><div><b>Name:</b><span id="driverName">' + driverName + '</span></div><br><div><b>Drivers Licence Number:</b><span id="driver_license">' + driver_license + '</span><br></div><br><div><b>Date:</b><span id="hoscreatedAt">' + hoscreatedAt + '</span><br></div></div></div>'
        Formfooter = '</div></div></div></div> ';
        Form = Formheader + Formbody + Formfooter
        // Form = '';
        let HOSData = Form + tableDataHOS + '<div><b>Total Duration:</b><span id="totalDurationData">' + totalDuration + '</span><br></div>';

        let pageBreak = '<div style="break-after:page"></div>';
		let getushos1 = '';
		let flabted = '';
		let orientation ='';
		let dry_van = '';
		let req_disclaimer = '';
        let req_annualreview = '';
        let req_motor_vehicle = '';
        let getWeightDimensions1 = '';
        // let finalCertificate = PersonalDetailsData + pageBreak + employmentHistoryData + pageBreak + getDrivinghistoryData + pageBreak + motorvehicleCertificateData + pageBreak + medicaldeclerationData + pageBreak + getDrivinghistoryData + pageBreak + driverAcknowledgementData + pageBreak + PSPDisclosure + pageBreak + clearingHouseConsentData + pageBreak + compensatedWorkData + pageBreak + drugAndAlcoholData + pageBreak + HOSData

        let getdriver = await Driver.findOne({ where: { id: driverid }, raw: true });
        console.log(driverid);
        let getQuestiongroupone = await Questiongroupone.findOne({ where: { driverId: driverid }, raw: true });
        let getDrivinghistoryone = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
        console.log(getQuestiongroupone);

        let getDrivinghistorySignature1 = getDrivinghistoryone ? getDrivinghistoryone.signature : '';
        let signaturedata1 = getDrivinghistorySignature1
        let signature1
        let Formheader1
        let Formbody1
        let Formfooter1
        let questionone1 = '';
        if (signaturedata1) {
            signature1 = '<img style="width: 30%" src="uploads/attachment/drivinghistoryaddressSignature/' + getDrivinghistorySignature1 + '"/>';
        } else {
            signature1 = ''
        }
        console.log(driverid)
        if (getQuestiongroupone) {
            Formheader1 = '<div></div><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'Interview Questions</h3> </div><div style="text-align: center2;margin: 1px;" class="row"> <div style="padding: 5px;" class="col-md-12">';
            Formbody1 = '<div class="card-body" id=""><div style="text-align:center"><span><h4></h4></span></div><br><div class=""><div class=""><b>Name of Driver :</b><span id="driverName">' + driverName + '</span><br><b>License No :</b><span id="driver_license">' + driver_license + '</span><br><br><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question1" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">1. What are your strengths as a driver?</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question1 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question2" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">2. Why are you looking for a job?</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question2 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question3" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">3. Why did you choose to approach our company?</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question3 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question4" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">4. Can you provide references from your current or previous employers or we can verify it? Please provide contact details.</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question4 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question5" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">5. If you have any preferred area to haul loads and why?</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question5 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question6" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">6. What training do you think you will require doing this job?</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question6 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question7" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">7. What would your current employer have to do to make you stay?</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question7 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question8" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">8. Tell me how you handled a problem with a dispatcher / customer?</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question8 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question9" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">9. Tell me about the last roadside inspection you had and where?</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question9 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question10" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">10. If you ever had problem at the border? If yes explain.</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question10 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question11" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">11. If you have a previous collision / citation, tell me about it and what you would do different now?</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question11 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question12" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">12. Did you receive remedial training from the collision / citation? If answer to above is yes.</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question12 + '</span></div></div><br><div class="row" style="margin-bottom:1rem;width:100%;float:left;"><div class="col-md-6" style="width:50%;float:left;"><b>Drivers Signature :</b>' + signature1 + '</div> <div class="col-md-6" style="width:50%;float:left;"><b>Name of the Interviewer :</b><span>' + getQuestiongroupone.interviewer + '</span></div></div></div></div>'
            Formfooter1 = '</div></div></div>';
        }
         questionone1 = Formheader1 + Formbody1 + Formfooter1

        let getQuestiongrouptwo = await Questiongrouptwo.findOne({ where: { driverId: driverid }, raw: true });
        let getCanadahos;
        let questiontwo;
        let questiontwo1 = '';
       
        if (getQuestiongrouptwo != null) {
            
       
        let getDrivinghistory2 = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });

        let Formheader2
        let Formbody2
        let Formfooter2

        if (getQuestiongrouptwo) {
			var right_wrongs = JSON.parse(getQuestiongrouptwo.rightorwrong);
			for (i = 0; i < 32; i++) {
				if (right_wrongs[i] == '1') {
					right_wrongs[i] = 'Yes';
				}
				else {
					right_wrongs[i] = 'No';
				}
			}
			console.info(getQuestiongrouptwo+'sd');
			var wrong = parseInt(32) - parseInt(getQuestiongrouptwo.result);
            let driverName1 = getDriver ? getDriver.driver_name : '';

            Formheader2 = '<div></div><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'Driver Manual</h3> </div><div style="text-align: center2;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
            Formbody2 = '<div class="card-body" id=""><div style="text-align:center"><span><h4></h4></span></div><br><div class=""><div class=""><div style="width:100%;float:left"><div style="width:75%;float:left"><b>Name of Driver :</b><span id="driverName">' + driverName1 + '</span></div>';
            if (getQuestiongrouptwo.approveStatus == 0) {
                Formbody += '<div style="width:25%;float:left"><b>Result : No Result</b></div></div><br><br><br>';
            } else {
                Formbody2 += '<div style="width:25%;float:left"><b>Result : </b><b style="margin-left:10px;"> Right : </b> <span id="vans_right">' + getQuestiongrouptwo.result + '</span><b style="margin-left:10px;"> Wrong : </b><span id="vans_wrong">' + wrong + '</span></div></div><br><br><br>';
            }
            Formbody2 += '<div class="form-group row" style="margin-bottom:2rem;"><label for="question1" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q1. In the event a driver receives a speed infraction what are the disciplinary action will be taken?</label><div class="col-md-12"  style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question1 + '</span></div></div><br><div class="form-group row"  style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[0] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question2" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q2. How many duty cycles are available? What are they?</label><div class="col-md-12"  style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question2 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[1] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question3" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q3. What is preventable Accident?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question3 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[2] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question4" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q4. What are the basic causes of an accidents?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question4 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[3] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question5" class="col-sm-12 control-label col-form-label" style="width:50%;float:left;">Q5. What is securing the scene?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question5 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[4] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question6" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q6. Am I allowed to drive a vehicle above the speed of 105 Km/H?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question6 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[5] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question7" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q7. Am I allowed to disconnect dash cams while on duty or off duty?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question7 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[6] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question8" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q8. Am I allowed take less rest to cover the destination quickly?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question8 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[7] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question9" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q9. What is cargo securement?.</label><div class="col-md-12" style="width:50%;float:left;"><span>' + getQuestiongrouptwo.question9 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[8] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question10" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q10. Am I allowed to drive entire 14 hours during 14 hours on duty time?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question10 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[9] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question11" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q11. How many hours can I drive during 14 hours of on duty time?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question11 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[10] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question12" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q12. How many hours of off duty is required in 16 hours working window?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question12 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[11] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question13" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q13. What is the minimum time for a rest break?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question13 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[12] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question14" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q14. Can I switch cycle?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question14 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[13] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question15" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q15. What is Cycle reset?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question15 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[14] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question16" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q16. What is the limit of personal conveyance?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question16 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[15] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question17" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q17. What if I exceed the limit of personal conveyance?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question17 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[16] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question18" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q18. Am I allowed to split Sleeper Berth times into 2?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question18 + '</span></div></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[17] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question19" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q19. Am I allowed to drive a motor vehicle without doing a PTI?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question19 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[18] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question20" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q20. What are the checks needs to be done in a pre‐trip inspection?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question20 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[19] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question21" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q21. Can a driver drive the vehicle with a passenger?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question21 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[20] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question22" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q22. What is an unsafe act?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question22 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[21] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question23" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q23. What is jackknifing?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question23 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[22] + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question24" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q24. Why accident reporting is necessary?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question24 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[23] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question25" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q25. What are information required post accident?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question25 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[24] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question26" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q26. Is it wise to accept guilt at the accident spot?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question26 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[25] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question27" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q27. What is social media policy?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question27 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:100%;float:left;"><span>' + right_wrongs[26] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question28" class="col-sm-12 control-label col-form-label" style="width:50%;float:left;">Q28. What is Highway traffic act (HTA)?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question28 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[27] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question29" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q29. What is C‐ TPAT procedure?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question29 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[28] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question30" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q30. What is President’s Safety Award?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question30 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question30 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[29] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question31" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q31. What is Accident Reporting & Investigation Policy?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question31 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[30] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question32" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q32. What are the accident investigation procedure?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question32 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[31] + '</span></div></div></div></div>'
            Formfooter2 = '</div></div></div>';
            Form2 = Formheader2 + Formbody2 + Formfooter2

            questiontwo1 = Formheader2 + Formbody2 + Formfooter2
        }
        

        getCanadahos = await Canadahos.findOne({ where: { driverId: driverid }, raw: true });
        console.log(driverid);
        console.log(getCanadahos);

        let Formheader3 = '';
        let Formbody3 = '';
        let Formfooter3 = '';
        if (getCanadahos) {
			var right_wrongs = JSON.parse(getCanadahos.rightorwrong);
			for (i = 0; i < 15; i++) {
				if (right_wrongs[i] == '1') {
					right_wrongs[i] = 'Yes';
				}
				else {
					right_wrongs[i] = 'No';
				}
			}
			var wrong = parseInt(15) - parseInt(getCanadahos.result);
			var percentage = (parseFloat(getCanadahos.result) / 15) * 100;
            let driverName2 = getDriver ? getDriver.driver_name : '';
            let driver_license = getDriver ? getDriver.driver_license : '';

            Formheader3 = '<head><title>'+ getDriverdetails.firstName+'_canadahos'+'</title></head><div ></div><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'HOS Questionnaire for Canada South Regulations</h3> </div><div style="text-align: center2;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
            Formbody3 = '<div class="card-body" id=""><div style="text-align:center"><span><h4></h4></span></div><br><div class=""><div class=""><div style="width:100%;float:left"><div style="width:50%;float:left"><b>Name of Driver :</b><span id="driverName">' + driverName2 + '</span></div>';
            if(getCanadahos.approveStatus==0){
                Formbody3 += '<div style="width:50%;float:left"><b>Result : No Result</b></div></div>';
            }
            else{
                Formbody3 += '<div style="width:50%;float:left"><b>Result : </b><span id="vans_wrong">'+percentage.toFixed(2)+'%-'+getCanadahos.result+' out of 15</span></div></div>';
            }
            Formbody3 += '<div style="width:100%;float:left"><b>Licence :</b><span id="driverlicence">' + driver_license + '</span></div><br><br><br>';
            Formbody3 += '<div class="form-group row" style="margin-bottom:2rem;"><label for="question1" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">1. The Canada South rule states that a driver can be on duty for maximum 14 hours before he/she:</label><div class="col-md-12"  style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question1=='takes a 8-hour break'){
                Formbody3 += '<span style="color:green">' + getCanadahos.question1 + '</span>';
            }
            else{
                Formbody3 += '<span style="color:red">' + getCanadahos.question1 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">takes a 8-hour break</span>';
            }
            Formbody3 +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question2" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">2. If you are driving a bobtail, you can use personal conveyance to pick up a loaded trailer</label><div class="col-md-12"  style="width:100%;float:left;">Selected Answer: ';
            if(getCanadahos.question2=='False'){
                Formbody3 += '<span style="color:green">' + getCanadahos.question2 + '</span>';
            }
            else{
                Formbody3 += '<span style="color:red">' + getCanadahos.question2 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">False</span>';
            }
            Formbody3 +=' </div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question3" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">3. As per Canadian South HOS regulation, A driver can make Yard move</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer: ';
            if(getCanadahos.question3=='only when on duty'){
                Formbody3 += '<span style="color:green">' + getCanadahos.question3 + '</span>';
            }
            else{
                Formbody3 += '<span style="color:red">' + getCanadahos.question3 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">only when on duty</span>';
            }
            Formbody3 +=' </div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question4" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">4. As per Canada South HOS regulation, A driver has to take a minimum ___ hours off  in a day.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question4=='10'){
                Formbody3 += '<span style="color:green">' + getCanadahos.question4 + '</span>';
            }
            else{
                Formbody3 += '<span style="color:red">' + getCanadahos.question4 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">10</span>';
            }
            Formbody3 +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question5" class="col-sm-12 control-label col-form-label" style="width:50%;float:left;">5. The Sum of which two duty status are taken into account, to calculate your 70 hours of total on duty time in 7 days?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question5=='Driving and on duty other than driving'){
                Formbody3 += '<span style="color:green">' + getCanadahos.question5 + '</span>';
            }
            else{
                Formbody3 += '<span style="color:red">' + getCanadahos.question5 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">Driving and on duty other than driving</span>';
            }
            Formbody3 +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question6" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">6. In Canada, a driver can defer 2 hours off duty to next day</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question6=='True'){
                Formbody3 += '<span style="color:green">' + getCanadahos.question6 + '</span>';
            }
            else{
                Formbody3 += '<span style="color:red">' + getCanadahos.question6 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">True</span>';
            }
            Formbody3 += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question7" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">7. While driving with a co-driver,</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question7=='All of the above'){
                Formbody3 += '<span style="color:green">' + getCanadahos.question7 + '</span>';
            }
            else{
                Formbody3 += '<span style="color:red">' + getCanadahos.question7 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">All of the above</span>';
            }
            Formbody3 +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question8" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">8. Your logbook should always be updated till</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question8=='Last change of duty status'){
                Formbody3 += '<span style="color:green">' + getCanadahos.question8 + '</span>';
            }
            else{
                Formbody3 += '<span style="color:red">' + getCanadahos.question8 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">Last change of duty status</span>';
            }
            Formbody3 +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question9" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">9. The 16th hour of a shift can be calculated by excluding, more than 2 hours off duty taken by , which is at least 10 hours  when added to next of duty period.</label><div class="col-md-12" style="width:50%;float:left;">Selected Answer:  ';
            if(getCanadahos.question9=='False'){
                Formbody3 += '<span style="color:green">' + getCanadahos.question9 + '</span>';
            }
            else{
                Formbody3 += '<span style="color:red">' + getCanadahos.question9 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">False</span>';
            }
            Formbody3 +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question10" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">10. A driver has take 24 hrs off in any 14 days?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question10=='True'){
                Formbody3 += '<span style="color:green">' + getCanadahos.question10 + '</span>';
            }
            else{
                Formbody3 += '<span style="color:red">' + getCanadahos.question10 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">True</span>';
            }
            Formbody3 +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question11" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">11. How many hours of reset time  is required to change from 120 hours /14 days cycle to 70 hours/7 days cycle?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question11=='72'){
                Formbody3 += '<span style="color:green">' + getCanadahos.question11 + '</span>';
            }
            else{
                Formbody3 += '<span style="color:red">' + getCanadahos.question11 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">72</span>';
            }
            Formbody3 +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question12" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">12. Pre trip inspection of a vehicle needs to be done at least once in every 24 hours.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question12=='True'){
                Formbody3 += '<span style="color:green">' + getCanadahos.question12 + '</span>';
            }
            else{
                Formbody3 += '<span style="color:red">' + getCanadahos.question12 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">True</span>';
            }
            Formbody3 +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question13" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">13. In Canada, A driver can drive maximum 13 hours ,</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question13=='Both b & c'){
                Formbody3 += '<span style="color:green">' + getCanadahos.question13 + '</span>';
            }
            else{
                Formbody3 += '<span style="color:red">' + getCanadahos.question13 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">Both b & c</span>';
            }
            Formbody3 +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question14" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">14. As per Canadian South HOS regulation,  if a driver can take less than 30 minutes off duty to complete his mandatory 10 hours off duty in a day</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question14=='False'){
                Formbody3 += '<span style="color:green">' + getCanadahos.question14 + '</span>';
            }
            else{
                Formbody3 += '<span style="color:red">' + getCanadahos.question14 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">False</span>';
            }
            Formbody3 +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question15" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">15. A  driver driving within 160 km radious, is exempted from HOS rules</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question15=='False'){
                Formbody3 += '<span style="color:green">' + getCanadahos.question15 + '</span>';
            }
            else{
                Formbody3 += '<span style="color:red">' + getCanadahos.question15 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">False</span>';
            }
                Formbody3 +='</div></div><br><hr style="width:100%"><br></div></div>';
            Formfooter3 = '</div></div></div>';
        }
        getCanadahos = Formheader3 + Formbody3 + Formfooter3
        Formheader = '';
        Formbody = '';
        Formfooter = '';
		
        getushos = await Usquestion.findOne({ where: { driverId: driverid }, raw: true });
		console.log('getushos:'+driverid)
         if (driverid && getushos) {
            var right_wrongs = JSON.parse(getushos.rightorwrong);
            for(i=0;i<15;i++){
                if(right_wrongs[i] == '1'){
                    right_wrongs[i] = 'Yes';
                }
                else{
                    right_wrongs[i] = 'No';
                }
            }
            var wrong  = parseInt(15) - parseInt(getushos.result);
            var percentage  = (parseFloat(getushos.result) / 15)*100;
            let driverName3 = getDriver ? getDriver.driver_name : '';
            let driver_license = getDriver ? getDriver.driver_license : '';
             Formheader = '<head><title>'+ getDriverdetails.firstName+'_canadahos'+'</title></head><div ></div><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'HOS Questionnaire for US</h3> </div><div style="text-align: center2;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
             Formbody = '<div class="card-body" id=""><div style="text-align:center"><span><h4></h4></span></div><br><div class=""><div class=""><div style="width:100%;float:left"><div style="width:50%;float:left"><b>Name of Driver :</b><span id="driverName">' + driverName3 + '</span></div>';
			if(getushos.approveStatus==0){
				Formbody += '<div style="width:50%;float:left"><b>Result : No Result</b></div></div>';
			}
            else{
				Formbody += '<div style="width:50%;float:left"><b>Result : </b><span id="vans_wrong">'+percentage.toFixed(2)+'%-'+getushos.result+' out of 15</span></div></div>';
			}
            Formbody += '<div style="width:100%;float:left"><b>Licence :</b><span id="driverlicence">' + driver_license + '</span></div><br><br><br>';
            Formbody3 += '<div style="width:100%;float:left"><b>Licence :</b><span id="driverlicence">' + driver_license + '</span></div><br><br><br>';
			Formbody += '<div class="form-group row" style="margin-bottom:2rem;"><label for="question1" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">1. Which of the following would be recorded as on duty not driving:</label><div class="col-md-12"  style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question1=='spending 1 hour unloading the trailer'){
                Formbody += '<span style="color:green">' + getushos.question1 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question1 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">spending 1 hour unloading the trailer</span>';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question2" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">2. If a driver is taking split sleeper (2+8) in USA, Duty status must be recorded as:</label><div class="col-md-12"  style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question2=='off duty, Sleeper berth'){
                Formbody += '<span style="color:green">' + getushos.question2 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question2 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">off duty, Sleeper berth</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question3" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">3. A commercial driver can use personal conveyance to drive if his/her driving time is exhausted and he is 45 minutes away from destination.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question3!='' && getushos.question3=='False'){
                Formbody += '<span style="color:green">' + getushos.question3 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question3 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">False</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question4" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">4. A  Canadian driver can do Yard move on a Public road within US</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question4!='' && getushos.question4=='False'){
                Formbody += '<span style="color:green">' + getushos.question4 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question4 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">False</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question5" class="col-sm-12 control-label col-form-label" style="width:50%;float:left;">5. A driver can go for 30 min On-duty not driving, after 8 hours driving in US</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question5=='True'){
                Formbody += '<span style="color:green">' + getushos.question5 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question5 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">True</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question6" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">6. In a snow storm, a driver can extend his shift to 16 hours and drive time to 13 hours in US, if:</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question6=='Storm started while duty status is driving and have to reach safe place'){
                Formbody += '<span style="color:green">' + getushos.question6 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question6 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">Storm started while duty status is driving and have to reach safe place</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question7" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">7. A driver can use personal conveyance while crossing the border.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question7!='' && getushos.question7=='False'){
                Formbody += '<span style="color:green">' + getushos.question7 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question7 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">False</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question8" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">8. While Fuelling Duty status must be changed to</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question8=='On duty'){
                Formbody += '<span style="color:green">' + getushos.question8 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question8 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">On duty</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question9" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">9. A Canadian Driver has driven 12 hours in Canada, when he reached Sarina.</label><div class="col-md-12" style="width:50%;float:left;">Selected Answer:  ';
            if(getushos.question9=='He has to take 10 hours off in Canada before crossing the border'){
                Formbody += '<span style="color:green">' + getushos.question9 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question9 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">He has to take 10 hours off in Canada before crossing the border</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question10" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">10. It is mandatory to certify all the logs at the end of 24 Hours period.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question10=='True'){
                Formbody += '<span style="color:green">' + getushos.question10 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question10 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">True</span>';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question11" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">11. Yard move can be used during</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question11=='Loading'){
                Formbody += '<span style="color:green">' + getushos.question11 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question11 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">Loading</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question12" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">12. How many hours of rest required after 14 hours of on duty in USA.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question12=='10'){
                Formbody += '<span style="color:green">' + getushos.question12 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question12 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">10</span>';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question13" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">13. If the ELD stops working when the driver is on a trip, the driver should</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question13=='both a & c'){
                Formbody += '<span style="color:green">' + getushos.question13 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question13 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">both a & c</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question14" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">14. In the United States, how long are you permitted to use paper logs after an ELD malfunction during the trip?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question14!='' && getushos.question14=='Till the trip has been completed'){
                Formbody += '<span style="color:green">Till the trip has been completed</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getushos.question14 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">Till the trip has been completed</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question15" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">15. If a driver has adopted 14/120 cycle in Canada, he can go to US without resetting his cycle.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getushos.question15!='' && getushos.question15=='False'){
                Formbody += '<span style="color:green">False</span>';
            }
            else{
                Formbody += '<span style="color:red">False</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">False</span>';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br></div></div>'
             Formfooter = '</div></div></div>';
			 getushos1 = Formheader + Formbody+ Formfooter
        }
		
		 getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
		 CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: driverid }, raw: true });
		let getchecklist = await Flabted_checklist.findOne({ where: { driverId:driverid ,company_id: getDriver.company_id }, raw: true });
		let company_name = '';
		

             if (driverid && getchecklist) {
                 if(getDriver.company_id!=''){
                      cur_company  = await Company.findOne({ where: { id: getDriver.company_id}, raw: true });
                     company_name = cur_company.name;
                 }
                 let driverName4 = getDriver ? getDriver.driver_name : '';
                 let driver_license = getDriver ? getDriver.driver_license : '';
                  Formheader = '<head><title>'+ getDriverdetails.firstName+'_flatbed_checklist'+'</title><div></div></head><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'Flatbed Services</h3> <h3 style="text-decoration:underline">ORIENTATION CHECK-LIST</h3></div><div style="text-align: center2;margin: 1px;" class="row"> <div style="padding: 5px;" class="col-md-12">';
                  Formbody = '<div class="card-body" id=""><div class="col-md-12 float_left" style="width:100%;float:left"><label class="col-md-6" style="width:50%;float:left">Name of Driver </label><div class="col-md-6 float_left" style="width:50%;float:left">'+driverName4+'</div></div><div class="col-md-12 float_left" style="width:100%;float:left"><label class="col-md-6" style="width:50%;float:left">Company Name</label><div class="col-md-6 float_left" style="width:50%;float:left">'+company_name+'</div></div><div class="col-md-12 float_left" style="width:100%;float:left"><label class="col-md-6" style="width:50%;float:left">Driving License#</label><div class="col-md-6 float_left" style="width:50%;float:left">'+driver_license+'</div></div><div class="col-md-12 float_left" style="width:100%;float:left"><div class="col-md-9 float_left" style="width:57%;float:left"><h3 style=" text-decoration: underline;"><b>Online Trainings</b></h3></div> <div class="col-md-3 float_left" style="width:33.33%;float:left"><h3 style="text-align:center">Initials</h3></div> </div><div class="col-md-12 float_left" style="width:100%;float:left"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">1. Defensive Training.</div><div class="col-md-2 float_left" style="width:16%;float:left">'+getchecklist.online1+'</div></div><div class="col-md-12 float_left" style="width:100%;float:left"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">2. Hours of Service and Log Books.</div><div class="col-md-2 float_left" style="width:16%;float:left">'+getchecklist.online2+'</div> </div><div class="col-md-12 float_left" style="width:100%;float:left"><div class="col-md-10" style="margin-left:10px;;width:70%;float:left">3. Vehicle Inspections.</div><div class="col-md-2 float_left" style="width:16%;float:left">'+getchecklist.online3+'</div> </div><div class="col-md-12 float_left" style="width:100%;float:left"><div class="col-md-10" style="margin-left:10px;;width:70%;float:left">4. Cargo Securement for Drivers – Flatbed/Step-decks.</div><div class="col-md-2 float_left" style="width:16%;float:left">'+getchecklist.online4+'</div> </div><div class="col-md-12 float_left" style="width:100%;float:left"><div class="col-md-10" style="margin-left:10px;;width:70%;float:left">5. Safety Laws.</div><div class="col-md-2 float_left" style="width:16%;float:left">'+getchecklist.online5+'</div> </div>';
                 Formbody +='<div class="col-md-12 float_left" style="width:100%;float:left;margin-top:10px;"><div class="col-md-9 float_left" style="float:left;width:75%;"><h3 style=" text-decoration: underline;"><b>Practical Trainings</b></h3></div></div><div class="col-md-12 float_left" style="float:left;width:100%;margin-top:10px;"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">1. Hours of Service and Log Books.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical1+'</div></div><div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">2. Vehicle Inspections.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical2+'</div></div><div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">3. Backing the Trucks/Trailers.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical3+'</div></div>';
                 Formbody +='<div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">4. Practical Cargo Securement for drivers – Flatbed/Step-decks.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical4+'</div></div><div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">5. Weight & Dimension Training.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical5+'</div></div><div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">6. Communicating with Shippers and Receivers.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical6+'</div></div>';
                 Formbody +='<div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">7. Border Crossing.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical7+'</div></div><div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">8. Backing the Trucks/Trailers.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical8+'</div></div><div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">9. Preparing Loading/Unloading paper-works.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical9+'</div></div><div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">10. Fuelling.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical10+'</div></div><div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">11. How to use Abord/ELD system.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical11+'</div></div><div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-10" style="margin-left:10px;width:70%;float:left">12. Driver Manual, policies and Procedures.</div><div class="col-md-2 float_left" style="float:left;width:16%">'+getchecklist.practical12+'</div></div><div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-6" style="float:left;width:50%"><label class="col-md-6" style="float:left;width:50%;;margin-top:10px;">Start Date</label><div class="col-md-6" style="float:left;width:50%;margin-top:10px;">'+getchecklist.start_date+'</div></div><div class="col-md-6 float_left" style="float:left;width:50%"><label class="col-md-6" style="float:left;width:32%;margin-top:10px;">End Date</label><div class="col-md-6" style="width:50%;float:left;margin-top:10px;">'+getchecklist.end_date+'</div></div></div>';
                 Formbody +='<div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-6 float_left" style="float:left;width:50%"><label class="col-md-6" style="float:left;width:50%">Signature</label><div class="col-md-6" style="float:left;width:50%"><img src="uploads/attachment/drivinghistoryaddressSignature/'+getDrivinghistory.signature+'" alt="user" width="150"></div></div><div class="col-md-6 float_left" style="float:left;width:50%"><label class="col-md-6" style="float:left;width:50%">Signature</label><div class="col-md-6" style="float:left;width:50%"><img src="uploads/attachment/drivinghistoryaddressSignature/'+getDrivinghistory.signature+'" alt="user" width="150"></div></div></div><div class="col-md-12 float_left" style="float:left;width:100%"><br></div><div class="col-md-12 float_left" style="float:left;width:100%"><hr></div><div class="col-md-12 float_left" style="float:left;width:100%;font-weight: 700;font-size: 21px;"><span style="margin-left:42px;">As</span> per my agreement, I have completed the above mentioned trainings and have received all the trainings properly</div> <div class="col-md-12 float_left" style="float:left;width:100%"><div class="col-md-6 float_left" style="float:left;width:50%"><img src="uploads/attachment/checklist/'+CertificateauthDtls.adminSignature+'" alt="user" width="150"></div> <div class="col-md-6 float_left" style="float:left;width:50%"> <img src="uploads/attachment/drivinghistoryaddressSignature/'+getDrivinghistory.signature+'" alt="user" width="150"></div><br><br></div><div class="col-md-6 float_left" style="float:left;width:50%">Signature of the Supervisor</div><div class="col-md-6 float_left" style="float:left;width:50%">Signature of the Driver</div><div class="col-md-12" style="padding:0px 0px 0px 28%"><div style="float:left;width:50%" class="col-md-6" ><img src="uploads/attachment/checklist/'+CertificateauthDtls.signature+'" alt="user" width="150"><br><br></div></div><div class="col-md-12" style="padding:0px 0px 0px 28%;width:100%"><div class="col-md-12" style="width:100%;float:left"> Witness Signature </div></div>';
                  Formfooter = '</div></div></div><br><br>';
                  Form = Formheader + Formbody + Formfooter
                  flabted = Formheader + Formbody+ Formfooter
    
            }

           
        
		let orientation_check1 = await Certificateauth.findOne({ where: { driverId: driverid, certificateID: 9 }, raw: true });
        if (driverid && orientation_check1) {
            if(getDriver.company_id!=''){
                let cur_company  = await Company.findOne({ where: { id: getDriver.company_id}, raw: true });
                company_name = cur_company.name;
            }
            let driverName = getDriver ? getDriver.driver_name : '';
            let driver_license = getDriver ? getDriver.driver_license : '';
             Formheader = '<head><title>'+ getDriverdetails.firstName+'dry_van_checklist'+'</title></head><div ></div><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'DRY VAN CHECKLIST</h3> </div><div style="text-align: center2;margin: 1px;" class="row"> <div style="padding: 5px;" class="col-md-12">';
            let Formbody = ' <div class="col-md-12" style="float:left;width:100%"> <table border="2"><tr> <td>Hours of Service</td></tr><tr><td>Pre-Trip Inspection </td></tr><tr><td>Load Securement </td></tr><tr><td>Company CVOR ,SMS and CVOR and Abstract</td></tr> <tr> <td>Accident Reporting</td></tr><tr><td>Incident Reporting procedure</td></tr><tr><td>Gate Procedure</td></tr> <tr><td>Pet Policy</td> </tr><tr><td>Cell and Text Policy</td></tr><tr><td>Defensive Driving/Topics</td></tr><tr><td>Adverse Driving Conditions</td></tr><tr><td>Approaching intersections</td></tr><tr><td>Backing a Rig Safely</td></tr><tr><td>Changing Lanes</td></tr><tr><td>Following too close</td></tr><tr><td>Speed Management</td></tr><tr><td>Distracted Driving/Cell Phone</td></tr><tr><td>Jackknifing</td></tr><tr><td>CT PAT Procedure</td></tr><tr><td>Drug & Alcohol Policy</td></tr><tr><td>Safety Equipment Policy</td></tr><tr><td>Dispatch Procedures</td></tr><tr><td>Accounting Procedures</td></tr><tr><td>Bonus Program</td></tr><tr><td>First Aid</td></tr><tr><td>Fire Extinguisher</td></tr><tr><td>Maintenance Policy for Owner Operators</td></tr><tr><td>Speed Policy</td></tr><tr><td>Disciplinary Policy</td></tr></table></div><div class="col-md-12" style="margin-top:10px;"><b>Driver’s Name (Printed)</b>: '+driverName+'<br><br><b>Drivers Signature:</b> <img src="uploads/attachment/drivinghistoryaddressSignature/'+getDrivinghistory.signature+'" alt="user" width="150"></a> <br><br><b>Date:</b>'+getDrivinghistory.updatedDate+'</div>';
             Formfooter = '</div></div></div><br><br>';
            Form = Formheader + Formbody + Formfooter
            orientation = Formheader + Formbody+ Formfooter
        }
        let cur_company1;
		let dry_van_check1 = await Certificateauth.findOne({ where: { driverId: driverid, certificateID: 10 }, raw: true });
        if (driverid && dry_van_check1 ) {
            if(getDriver && getDriver.company_id!=''){
                 cur_company1  = await Company.findOne({ where: { id: getDriver.company_id}, raw: true });
                company_name = cur_company1.name;
            }
            let driverName = getDriver ? getDriver.driver_name : '';
            let driver_license = getDriver ? getDriver.driver_license : '';
             Formheader = '<head><title>'+ getDriverdetails.firstName+'dump_truck _checklist'+'</title></head><div></div><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'Dump Truck Checklist</h3> </div><div style="text-align: center2;margin: 1px;" class="row"> <div style="padding: 5px;" class="col-md-12">';
             Formbody = ' <div class="col-md-12" style="float:left;width:100%"> <table border="2"><tr><td>Hours of Service</td></tr><tr><td>Pre-Trip Inspection</td></tr><tr><td>Company CVOR, CVOR and Abstract</td></tr><tr><td>Accident Reporting</td></tr><tr><td>Incident Reporting</td></tr><tr><td>Pet Policy</td></tr><tr><td>Cell and Text Policy</td></tr><tr><td>Defensive Driving/Topics</td></tr><tr><td>Adverse Driving Conditions</td></tr><tr><td>Approaching intersections</td></tr><tr><td>Changing Lanes</td></tr><tr><td>Following too close</td></tr><tr><td>Backing a dump truck</td></tr><tr><td>Speed policy</td></tr><tr><td>Distracted Driving/Cell Phone policy</td></tr><tr><td>Jackknifing</td></tr><tr><td>Safety equipment policy</td></tr><tr><td>Dispatch Procedure</td></tr><tr><td>Accounting Procedure</td></tr><tr><td>First Aid</td></tr><tr><td>Fire Extinguisher</td></tr><tr><td>Operation and daily maintenance of dump Trucks</td></tr><tr><td>Disciplinary Policy</td></tr></table></div><div class="col-md-12" style="float:left;width:100%;margin-top:10px;"> <b>Driver’s Name (Printed)</b>: '+driverName+'<br><br><b>Drivers Signature:</b> <img src="uploads/attachment/drivinghistoryaddressSignature/'+getDrivinghistory.signature+'" alt="user" width="150"></a> <br><br><b>Date:</b>'+getDrivinghistory.updatedDate+'</div>';
             Formfooter = '</div></div></div><br><br>';
             dry_van = Formheader + Formbody + Formfooter
        }
		
		
		
        console.log(driverid);
       
        
        // -----------end-----------------
		
            
    }





    let Disclaimer1 = await Disclaimer.findOne({ where: { driverId: driverid }, raw: true });
        Formheader = '';
    Formbody = '';
    Formfooter = '';
    
    if (Disclaimer1 && Disclaimer1 != null) {
        // -----------Disclaimer certificate-----------------
        let dis_type;
            let getDrivinghistoryData1 = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
        let signature2 = getDrivinghistoryData1 ? getDrivinghistoryData1.signature : '';
        
        let attachmentpath = "uploads/attachment/drivinghistoryaddressSignature/" + signature2;
        if (signature2) {
            ImagesAttachment = '<img id="signature" alt="user" width="150" src="' + attachmentpath + '">';
        } else {
            ImagesAttachment = '';
        }
        console.log(Disclaimer1.Disclaimer_type);
        if(Disclaimer1.Disclaimer_type=='Incorporated_Company'){
            dis_type = 'Incorporated Company';
        }
        else{
            dis_type = 'Company Driver';
        }
        let driverName = getDriver ? getDriver.driver_name : '';
        let driver_license = getDriver ? getDriver.driver_license : '';
        if (driverid) {
            let Formheader = '<head><title>' + getDriverdetails.firstName + '_Disclaimer</title></head><div ></div><div style=""></div><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'Disclaimer and Signature</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
            let Formbody = '<h3><center>Disclaimer and Signature</center></h3><p align="justify">I certify that my answers are true and complete to the best of my knowledge. If this application leads to employment, I understand that false or misleading information in my application or interview may result in my release. I understand that if I am employed, any misrepresentation or material omission made by me on this application will be sufficient cause for cancellation of this application or immediate discharge from the employer’s service, whenever it is discovered. I give the employer the right to contact and obtain information from all references, employers, educational institutions and to otherwise verify the accuracy of the information contained in this application.</p><p align="justify">I certify that carrier informed me about the benefits of joining company as Company Driver and not joining the company as an incorporated organization, however I preferred joining as:</p><p align="justify">Are you currently working for another employer '+dis_type+'</p><p align="justify">I certify that it is my decision and company has no involvement in taking this decision.</p><p align="justify">I hereby release from liability the employer and its representatives for seeking, gathering and using such information and all other persons, corporations or organizations for furnishing such information. The employer does not unlawfully discriminate in employment and no question on this application is used for the purpose of limiting or excusing any applicant from consideration for employment on a basis prohibited by local, state or federal law.</p><p align="justify"><br> If I am hired, I understand that I am free to resign at any time, with or without cause and without prior notice, and the employer reserves the same right to terminate my employment at any time, with or without cause and without prior notice, except as may be required by law. I understand that no representative of the employer, other than an authorized officer, has the authority to make any assurances to the contrary. I further understand that any such assurances must be in writing and signed by an authorized officer. I understand it is this company’s policy not to refuse to hire a qualified individual with a disability because of that’s person’s need for a reasonable accommodation as required by the ADA. I also understand that if I am hired, I will be required to provide proof of identity and legal work authorization.</p><p align="justify"><b>Driver Name</b> ' + getDriver.driver_name + '</p><p align="justify"><b>Drivers Signature:</b> <span id="">' + ImagesAttachment + '</span></p>'
            req_disclaimer = Formheader + Formbody + Formfooter
        }
    }
    getdriver = await Driver.findOne({ where: { id: driverid }, raw: true });
    console.log(driverid);
    
    let getWeightDimensions = await weightDimensions.findOne({ where: { driverId: driverid }, raw: true });
    getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
    let getquiz = await Companyquiz.findOne({ where: { company_id: getdriver.company_id }, raw: true });

     driverName = getdriver ? getdriver.driver_name : '';
     driver_license = getdriver ? getdriver.driver_license : '';
    if (driverid && getWeightDimensions) {
        var right_wrongs = JSON.parse(getWeightDimensions.rightorwrong);
        for(i=0;i<20;i++){
            if(right_wrongs[i] == '1'){
                right_wrongs[i] = 'Yes';
            }
            else{
                right_wrongs[i] = 'No';
            }
        }
        var wrong  = parseInt(20) - parseInt(getWeightDimensions.result);
        var percentage  = (parseFloat(getWeightDimensions.result) / 20)*100;
        let Formheader = '<head><title>'+ getDriverdetails.firstName+'_weightdimensions'+'</title></head><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'Weight & Dimensions</h3> </div><div style="text-align: left;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
        let Formbody = '<div class="card-body" id=""><div style="text-align:center"><span><h4></h4></span></div><br><div class=""><div class=""><div style="width:100%;float:left"><div style="width:50%;float:left"><b>Name of Driver :</b><span id="driverName">' + driverName + '</span></div>';
        if(getWeightDimensions.approveStatus==0){
            Formbody += '<div style="width:50%;float:left"><b>Result : No Result</b></div></div>';
        }
        else{
            Formbody += '<div style="width:50%;float:left"><b  id="weightDateb">Date  : <span id="weightDate">'+getWeightDimensions.create_date+'</span> </b><br><b>Result : </b><span id="vans_wrong">'+percentage.toFixed(2)+'%-'+getWeightDimensions.result+' out of 20</span></div></div>';
        }
        Formbody += '<div style="width:100%;float:left"><b>Licence :</b><span id="driverlicence">' + driver_license + '</span></div><br><br><br>';
        Formbody += '<div class="form-group row" style="margin-bottom:2rem;"><label for="question1" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">1. Which of the following statements is not true about the Memorandum of Understanding?</label><div class="col-md-12"  style="width:100%;float:left;">Selected Answer:  ';
        if(getWeightDimensions.question1=='New vehicle categories may not be added'){
            Formbody += '<span style="color:green">' + getWeightDimensions.question1 + '</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getWeightDimensions.question1 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">New vehicle categories may not be added</span>';
        }
        Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question2" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">2. The Gross Vehicle Weight Rating (GVWR) is explained by which of the following formulas?</label><div class="col-md-12"  style="width:100%;float:left;">Selected Answer:  ';
        if(getWeightDimensions.question2=='Tare Weight + Payload = GVWR'){
            Formbody += '<span style="color:green">' + getWeightDimensions.question2 + '</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getWeightDimensions.question2 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">Tare Weight + Payload = GVWR</span>';
        }
        Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question3" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">3. The trailer manufacturer’s rating for the rear tandem axle of Lisa’s vehicle is 35 200 lbs (16 000 kgs). Under the MoU, what is the maximum weight can be carried on that axle?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
        if(getWeightDimensions.question3!='' && getWeightDimensions.question3=='16000 kgs'){
            Formbody += '<span style="color:green">' + getWeightDimensions.question3 + '</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getWeightDimensions.question3 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">16000 kgs</span>';
        }
        Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question4" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">4. Doug’s carrier has just provided new APUs for every truck in the fleet. How much extra weight can be added to the combined steer and drive axle groups?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
        if(getWeightDimensions.question4!='' && getWeightDimensions.question4=='225 kg'){
            Formbody += '<span style="color:green">' + getWeightDimensions.question4 + '</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getWeightDimensions.question4 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">225 kg</span>';
        }
        Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question5" class="col-sm-12 control-label col-form-label" style="width:50%;float:left;">5. Which of the following combination vehicles is connected using a fifth wheel connected to the forward trailer?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
        if(getWeightDimensions.question5=='An B-train double'){
            Formbody += '<span style="color:green">' + getWeightDimensions.question5 + '</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getWeightDimensions.question5 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">An B-train double</span>';
        }
        Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question6" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">6. The maximum weight for the axles highlighted in the diagram below are restricted when Dimension A is less than:</label><div class="col-md-12"  style="margin-bottom:15px;"><img src="images/wdqs6.png"></div><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
        if(getWeightDimensions.question6=='3 metres'){
            Formbody += '<span style="color:green">' + getWeightDimensions.question6 + '</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getWeightDimensions.question6 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">3 metres</span>';
        }
        Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question7" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">7. Is the vehicle pictured in compliance with weight restrictions outlined in the MoU?</label><div class="col-md-12"  style="margin-bottom:15px;"><img src="images/wdqs7.png"></div><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
        if(getWeightDimensions.question7!='' && getWeightDimensions.question7=='No'){
            Formbody += '<span style="color:green">' + getWeightDimensions.question7 + '</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getWeightDimensions.question7 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">No</span>';
        }
        Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question8" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">8. The dual tires on Lisa’s tandem axle trailer are 265 mm wide. What is the total weight the trailer tires can support?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
        if(getWeightDimensions.question8=='21200 kg'){
            Formbody += '<span style="color:green">' + getWeightDimensions.question8 + '</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getWeightDimensions.question8 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">21200 kg</span>';
        }
        Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question9" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">9. Lisa weighs her vehicle right after fueling up. She purchased 500 litres and found that 220 kg (52%) of weight were added to her steer axle and 205 kg (48%) were added to her drive axle. If she purchases another 100 litres, roughly how much more weight will be added to her drive axle?</label><div class="col-md-12" style="width:50%;float:left;">Selected Answer:  ';
        if(getWeightDimensions.question9=='41 kg'){
            Formbody += '<span style="color:green">' + getWeightDimensions.question9 + '</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getWeightDimensions.question9 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">41 kg</span>';
        }
        Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question10" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">10. Why are spring thaw road restrictions in place?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
        if(getWeightDimensions.question10=='Excessive water weakens the roadway'){
            Formbody += '<span style="color:green">' + getWeightDimensions.question10 + '</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getWeightDimensions.question10 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">Excessive water weakens the roadway</span>';
        }
        Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question11" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">11. Trailer wheelbase is the distance measured between:</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
        if(getWeightDimensions.question11=='The kingpin and the center of the rear axle unit'){
            Formbody += '<span style="color:green">' + getWeightDimensions.question11 + '</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getWeightDimensions.question11 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">The kingpin and the center of the rear axle unit</span>';
        }
        Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question12" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">12. Interaxle spacing is calculated by measuring the distance between:</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
        if(getWeightDimensions.question12=='The centres of two adjacent axle groups'){
            Formbody += '<span style="color:green">' + getWeightDimensions.question12 + '</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getWeightDimensions.question12 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">The centres of two adjacent axle groups</span>';
        }
        Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question13" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">13. Under the Memorandum of Understanding, what does the maximum box length of a combination vehicle refer to?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
        if(getWeightDimensions.question13=='The total length A and B plus the space between them (A + B + C)'){
            Formbody += '<span style="color:green">' + getWeightDimensions.question13 + '</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getWeightDimensions.question13 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">The total length A and B plus the space between them (A + B + C)</span>';
        }
        Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question14" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">14. Janice’s vehicle is a tractor semitrailer. Under the Memorandum of Understanding, what is the overall length limit of her vehicle?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
        if(getWeightDimensions.question14!='' && getWeightDimensions.question14=='23 m'){
            Formbody += '<span style="color:green">' + getWeightDimensions.question14 + '</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getWeightDimensions.question14 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">23 m</span>';
        }
        console.log(getWeightDimensions);
        Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question15" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">15. Which of the following is the best definition of a vehicle’s axle group spread?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
        if(getWeightDimensions.question15!='' && getWeightDimensions.question15=='The distance between the axles within an axle group and is measured from the centre of the first axle to the centre of the rear axle in the group'){
            Formbody += '<span style="color:green">The distance between the axles within an axle group and is measured from the centre of the first axle to the centre of the rear axle in the group</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getWeightDimensions.question15 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">The distance between the axles within an axle group and is measured from the centre of the first axle to the centre of the rear axle in the group</span>';
        }
        Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question16" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">16. Lisa is operating a tandem-axle tractor. What is her drive axle’s maximum axle spread?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
        if(getWeightDimensions.question16!='' && getWeightDimensions.question16=='1.85 m'){
            Formbody += '<span style="color:green">1.85 m</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getWeightDimensions.question16 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">1.85 m</span>';
        }
        Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question17" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">17. The length of the wheelbase of your semitrailer is 12.45 metres. What is the distance of the trailer`s effective rear overhang?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
        if(getWeightDimensions.question17!='' && getWeightDimensions.question17=='4.36 m'){
            Formbody += '<span style="color:green">4.36 m</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getWeightDimensions.question17 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">4.36 m</span>';
        }
        Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question18" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">18. According to the Memorandum of Understanding, what is the gross vehicle weight limit of this vehicle?</label><div class="col-md-12"  style="margin-bottom:15px;"><img src="images/wdqs18.png"></div><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
        if(getWeightDimensions.question18!='' && getWeightDimensions.question18=='52300 kg'){
            Formbody += '<span style="color:green">52300 kg</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getWeightDimensions.question18 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">52300 kg</span>';
        }
        Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question19" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">19. What happens when you slide the rear trailer axle to the rear?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
        if(getWeightDimensions.question19!='' && getWeightDimensions.question19=='Weight is shifted from the rear axle to the drive axle'){
            Formbody += '<span style="color:green">Weight is shifted from the rear axle to the drive axle</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getWeightDimensions.question19 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">Weight is shifted from the rear axle to the drive axle</span>';
        }
        Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question19" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">20. After shifting the tandem axles, engage the tractor and trailer brakes and check to make sure ____________.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
        if(getWeightDimensions.question20!='' && getWeightDimensions.question20=='The landing gear has been lowered to the ground'){
            Formbody += '<span style="color:green">The landing gear has been lowered to the ground</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getWeightDimensions.question20 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br><span style="color:green">The landing gear has been lowered to the ground</span>';
        }
        Formbody += '</div></div><br><hr style="width:100%"><br></div></div>'
        let Formfooter = '</div></div></div>';
        getWeightDimensions1 = Formheader + Formbody+ Formfooter
        
    }


    
    let getsafetyLaws = await safetyLaws.findOne({ where: { driverId: driverid }, raw: true });
        
    if (driverid && getsafetyLaws && getsafetyLaws.approveStatus == 1) {
        var right_wrongs = JSON.parse(getsafetyLaws.rightorwrong);
        for(i=0;i<25;i++){
            if(right_wrongs[i] == '1'){
                right_wrongs[i] = 'Yes';
            }
            else{
                right_wrongs[i] = 'No';
            }
        }
        var wrong  = parseInt(25) - parseInt(getsafetyLaws.result);
        var percentage  = (parseFloat(getsafetyLaws.result) / 25)*100;
        let Formheader = '<head><title>'+ getDriverdetails.firstName+'_safetylaws'+'</title></head><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'Safety Laws Quiz</h3> </div><div style="text-align: center2;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
        let Formbody = '<div class="card-body" id=""><div style="text-align:center"><span><h4></h4></span></div><br><div class=""><div class=""><div style="width:100%;float:left"><div style="width:50%;float:left"><b>Name of Driver :</b><span id="driverName">' + driverName + '</span></div>';
        if(getsafetyLaws.approveStatus==0){
            Formbody += '<div style="width:50%;float:left"><b>Result : No Result</b></div></div>';
        }
        else{
            Formbody += '<div style="width:50%;float:left"><b  id="weightDateb">Date  : <span id="weightDate">'+getsafetyLaws.create_date+'</span> </b><br><b>Result : </b><span id="vans_wrong">'+percentage.toFixed(2)+'%-'+getsafetyLaws.result+' out of 25</span></div></div>';
        }
        Formbody += '<div style="width:100%;float:left"><b>Licence :</b><span id="driverlicence">' + driver_license + '</span></div><br><br><br>';
        Formbody += '<table border="1"><tr><td colspan="2"></td><td style="width:10%;padding-left:10px;">Selected Answer</td><td style="width:10%;padding-left:10px;">Correct Answer</td></tr>';
        Formbody += '<tr><td style="width: 5%;padding-left:10px;">1</td><td style="padding-left:10px;">When you see a service vehicle such as law enforcement, EMS (ambulance tow trucking helping someone you should reduce your speed to 60 km/h or posted speed limit whichever is lower.</td>';
        if(getsafetyLaws.question1=='True'){
            Formbody += '<td style="width:5%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question1 + '</span>';
        }
        else{
            Formbody += '<td style="width:5%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question1 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
        Formbody += '<tr><td style="width: 5%;padding-left:10px;">2</td><td style="padding-left:10px;">On a two-way yellow lined hwy, if you have a solid yellow line on your side and the other side has a broken yellow line, it indicates that is passing is not permitted for you. </td>';
        if(getsafetyLaws.question2=='True'){
            Formbody += '<td style="width:5%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question2 + '</span>';
        }
        else{
            Formbody += '<td style="width:5%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question2 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
        Formbody += '<tr><td style="width: 5%;padding-left:10px;">3</td><td style="padding-left:10px;">Drivers driving within a 160 km radius are not required to fill out a daily log.</td>';
        if(getsafetyLaws.question3!='' && getsafetyLaws.question3=='True'){
            Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question3 + '</span>';
        }
        else{
            Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question3 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';

        Formbody += '<tr><td style="width: 5%;padding-left:10px;">4</td><td style="padding-left:10px;">Farmers are not exempt from requiring a safety fitness Certificate.</td>';
        if(getsafetyLaws.question4!='' && getsafetyLaws.question4=='False'){
            Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question4 + '</span>';
        }
        else{
            Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question4 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">False</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
        Formbody += '<tr><td style="width: 5%;padding-left:10px;">5</td><td style="padding-left:10px;">An airbrake endorsement is not required if you are driving under a 160 km radius.  </td>  ';
        if(getsafetyLaws.question5=='False'){
            Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question5 + '</span>';
        }
        else{
            Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question5 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">False</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
        Formbody += '<tr><td style="width: 5%;padding-left:10px;">6</td><td style="padding-left:10px;">Small defects discovered during a inspection need not be reported to the company. </td>';
        if(getsafetyLaws.question6=='False'){
            Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question6 + '</span>';
        }
        else{
            Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question6 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">False</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
        Formbody += '<tr><td style="width: 5%;padding-left:10px;">7</td><td style="padding-left:10px;">Legally you cannot be penalized for driving over 5/10 km over the posted speed limit except in playgrounds and construction zones</td>';
        if(getsafetyLaws.question7!='' && getsafetyLaws.question7=='False'){
            Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question7 + '</span>';
        }
        else{
            Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question7 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">False</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
        Formbody += ' <tr><td style="width: 5%;padding-left:10px;">8</td><td style="padding-left:10px;">Failure to remain at the scène of a collision will result in 7 points demerit points against your license </td>';
        if(getsafetyLaws.question8=='False'){
            Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question8 + '</span>';
        }
        else{
            Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question8 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">False</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';

        Formbody += '<tr><td style="width: 5%;padding-left:10px;">9</td><td style="padding-left:10px;">Truckers driver are allowed hand held devices as they always need to communicate with dispatch</td>';
        if(getsafetyLaws.question9=='False'){
            Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question9 + '</span>';
        }
        else{
            Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question9 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">False</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';

        Formbody += ' <tr><td style="width: 5%;padding-left:10px;">10</td><td style="padding-left:10px;">Uncontrolled intersections are ones that have no traffic signs and signal lights. </td>';
        if(getsafetyLaws.question10=='True'){
            Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question10 + '</span>';
        }
        else{
            Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question10 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';

        Formbody +=' <tr><td style="width: 5%;padding-left:10px;">11</td><td style="padding-left:10px;">Drivers do not need bills of lading in their possession as long as the company has it.</td>';
        if(getsafetyLaws.question11=='True'){
            Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question11 + '</span>';
        }
        else{
            Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question11 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
        
        Formbody += '<tr><td style="width: 5%;padding-left:10px;">12</td><td style="padding-left:10px;">If a driver is 45 minutes away from home but he has been on duty for 15 hours he is allowed to keep driving because he is near his home</td>';
        if(getsafetyLaws.question12=='False'){
            Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question12 + '</span>';
        }
        else{
           Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question12 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">False</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';

        Formbody +=' <tr><td style="width: 5%;padding-left:10px;">13</td><td style="padding-left:10px;">To travel outside of Alberta plates and the carrier must declare that they are a federal company.</td>';
        if(getsafetyLaws.question13=='True'){
            Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:green">' + getsafetyLaws.question13 + '</span>';
        }
        else{
            Formbody += '<td style="width:10%;padding-left:10px;"><span style="color:red">' + getsafetyLaws.question13 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
        Formbody += ' <tr><td style="width: 5%;padding-left:10px;">14</td><td style="padding-left:10px;">If your pedal sticks and you cannot pull it up with your shoe you should shift into neutral, pull over and stop.</td><td style="width:10%;padding-left:10px;">';
        if(getsafetyLaws.question14!='' && getsafetyLaws.question14=='True'){
            Formbody += '<span style="color:green">' + getsafetyLaws.question14 + '</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getsafetyLaws.question14 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
        Formbody += '<tr><td style="width: 5%;padding-left:10px;">15</td><td style="padding-left:10px;">Drivers must hand in all log books under 20 days to the carrier.</td><td style="width:10%;padding-left:10px;"> ';
        if(getsafetyLaws.question15!='' && getsafetyLaws.question15=='True'){
            Formbody += '<span style="color:green">True</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getsafetyLaws.question15 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
        Formbody += '<tr><td style="width: 5%;padding-left:10px;">16</td><td style="padding-left:10px;">Speed limit for urban or rural playground zones are generally 40 km/h.</td><td style="width:10%;padding-left:10px;"> ';
        if(getsafetyLaws.question16!='' && getsafetyLaws.question16=='True'){
            Formbody += '<span style="color:green">True</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getsafetyLaws.question16 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
        Formbody += '<tr><td style="width: 5%;padding-left:10px;">17</td><td style="padding-left:10px;">When weather conditions are poor it is a good idea to use cruise control.</td><td style="width:10%;padding-left:10px;">  ';
        if(getsafetyLaws.question17!='' && getsafetyLaws.question17=='False'){
            Formbody += '<span style="color:green">False</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getsafetyLaws.question17 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">False</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
        Formbody += '<tr><td style="width: 5%;padding-left:10px;">18</td><td style="padding-left:10px;">Play ground zones are in effect 7:30 am to 9:00 pm.</td><td style="width:10%;padding-left:10px;"> ';
        if(getsafetyLaws.question18!='' && getsafetyLaws.question18=='True'){
            Formbody += '<span style="color:green">True</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getsafetyLaws.question18 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';

        Formbody += ' <tr><td style="width: 5%;padding-left:10px;">19</td><td style="padding-left:10px;">If you are empty you do not need to stop at the scale when open.</td><td style="width:10%;padding-left:10px;"> ';
        if(getsafetyLaws.question19!='' && getsafetyLaws.question19=='False'){
            Formbody += '<span style="color:green">False</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getsafetyLaws.question19 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">False</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';

        Formbody += ' <tr><td style="width: 5%;padding-left:10px;">20</td><td style="padding-left:10px;">Warning triangles must be placed 75 meters from the front of rear if a vehicle is topped on the hwy.</td><td style="width:10%;padding-left:10px;">';
        if(getsafetyLaws.question20!='' && getsafetyLaws.question20=='False'){
            Formbody += '<span style="color:green">False</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getsafetyLaws.question20 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">False</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';

        Formbody += ' <tr><td style="width: 5%;padding-left:10px;">21</td><td style="padding-left:10px;">Seat belts are most effective in preventing injury when the lap belt and should strap are worn correctly.</td><td style="width:10%;padding-left:10px;">';
        if(getsafetyLaws.question21!='' && getsafetyLaws.question21=='True'){
            Formbody += '<span style="color:green">True</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getsafetyLaws.question21 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';

        Formbody += ' <tr><td style="width: 5%;padding-left:10px;">22</td><td style="padding-left:10px;">Be cautious of large vehicles backing because large vehicles have large blind zones.</td><td style="width:10%;padding-left:10px;">';
        if(getsafetyLaws.question22!='' && getsafetyLaws.question22=='True'){
            Formbody += '<span style="color:green">True</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getsafetyLaws.question22 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';
        
        Formbody += ' <tr><td style="width: 5%;padding-left:10px;">23</td><td style="padding-left:10px;">You are approaching an intersection. The traffic lights are out of order. You must treat the intersection as four way stop.</td><td style="width:10%;padding-left:10px;">';
        if(getsafetyLaws.question23!='' && getsafetyLaws.question23=='True'){
            Formbody += '<span style="color:green">True</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getsafetyLaws.question23 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';

        Formbody += ' <tr><td style="width: 5%;padding-left:10px;">24</td><td style="padding-left:10px;">If feeling tired while driving, then you should slow down and drive with extra care.</td><td style="width:10%;padding-left:10px;">';
        if(getsafetyLaws.question24!='' && getsafetyLaws.question24=='False'){
            Formbody += '<span style="color:green">False</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getsafetyLaws.question24 + '</span>';
        }
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">False</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr>';

        
        Formbody += ' <tr><td style="width: 5%;padding-left:10px;">25</td><td style="padding-left:10px;">Under icy road conditions, in general, most collisions are caused by sudden changes in speed or direction.</td><td style="width:10%;padding-left:10px;">';
        if(getsafetyLaws.question25!='' && getsafetyLaws.question25=='True'){
            Formbody += '<span style="color:green">True</span>';
        }
        else{
            Formbody += '<span style="color:red">' + getsafetyLaws.question25 + '</span>';
        }
        let resStatus;
        if(percentage>=80){
            resStatus = '<span id="examResult" style="color:green">Pass</span>';
        }
        else{
            resStatus = '<span id="examResult" style="color:red">Fail</span>';
        }
        console.log(percentage);
        Formbody +='</td><td style="width:5%;padding-left:10px;"><span class="green"  style="color:green">True</span></td></tr>';
        Formbody +='<tr style="height:25px;"><td style="width: 5%;padding-left:10px;"></td><td style="padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td><td style="width:10%;padding-left:10px;"></td></tr><tr><td colspan="2"><table  style="width:100%"><tr style="border-bottom:1px solid black"><td style="padding-top:5px;padding-left:10px;"><b>Date: </b><span id="driver_date">' + getsafetyLaws.create_date + '</span></td></tr><tr><td style="padding-top:5px;padding-left:10px;"><b>EXAMINEE NAME & SIGNATURE: </b></td></tr></table></td><td colspan="2"><span id="driver_sign"><img src="uploads/attachment/drivinghistoryaddressSignature/'+getDrivinghistory.signature+'" alt="user" width="150"></span></td></tr><tr><td style="padding-left:10px;" colspan="2"><b>EXAMINERS NAME & SIGNATURE:</b></td><td colspan="2" style="padding-left:10px;"><span id="adminSign"><img src="uploads/attachment/safetylaws/'+getsafetyLaws.signature+'" alt="user" width="150"></span></td></tr><tr><td style="padding-left:10px;" colspan="2"><b>Examinee must score over 80% in order to pass: FINAL SCORE</b></td><td colspan="2" style="padding-left:10px;">'+resStatus+'</td></tr></table>';


        Formbody += '</div></div><br><hr style="width:100%"><br></div></div>'
        let Formfooter = '</div></div></div>';
        getsafetyLaws1 = Formheader + Formbody+ Formfooter
        
    }



    let annualreview1 = await annualreview.findOne({ where: { driverid:driverid}, raw: true });
    let signaturepath1 = 'uploads/attachment/annualreview/';
console.log('sfdfsd'+annualreview1);
    if(annualreview1 && annualreview1.signature){
     signature = signaturepath1+annualreview1.signature;
    }
    else{
        signature = '';
    }
    let drivermeet = '';
    if(annualreview1 && annualreview1.drivermeet==0){
        drivermeet = 'The driver meets the minimum requirements for safe driving, or';
    }
    else{
        drivermeet = 'The driver is disqualified to drive a motor vehicle pursuant to CFR 391.15';
    }
    
    if (driverid && annualreview1) {
        if(getdriver.company_id!=''){
            let cur_company  = await Company.findOne({ where: { id: getdriver.company_id}, raw: true });
            company_name = cur_company.name;
        }
        let Formheader = '<head><title>'+ getDriverdetails.firstName+'_annualReview'+'</title></head><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;font-size:14px;">'+cmpd_img+'U. S. DEPARTMENT OF TRANSPORTATION MOTOR CARRIER SAFETY PROGRAM ANNUAL REVIEW OF DRIVING RECORD</h3> </hr></div><div style="text-align: center2;margin: 1px;" class="row"> <div style="padding: 5px;" class="col-md-12" style="width:100%;float:left">';
        let Formbody = '<div class="col-md-12" style="width:100%;float:left"><div class="col-md-12" style="width:100%;float:left;text-align:left"><div class="col-md-6" style="width:50%;float:left">'+driverName+' </div><div class="col-md-6" style="width:50%;float:left"> '+getDriverdetails.sin+'</div></div><div class="col-md-6" style="width:50%;float:left;text-align:left">Name</div><div class="col-md-6" style="width:50%;float:left;text-align:left">Social Security Number</div></div><p align="justify">This day I reviewed the driving record of the above named driver in accordance with CFR 391.25 of the Motor Carrier Safety Regulations. I considered any evidence that the driver has violated applicable provisions of the MCS Regulations and the Hazardous Materials Regulations. I considered the driver’s accident record and any evidence that he/she has violated laws governing the operation of motor vehicles, and gave great weight to violations, such as speeding, reckless driving and operation while under the influence of alcohol or drugs, that indicate that the driver has exhibited a disregard for the safety of the public. Having done the above, I find that</p><p style="float:left">'+drivermeet+'</p><div class="col-md-12" style="width:100%;float:left;margin-bottom:20px;;text-align:left"><div class="col-md-6" style="width:50%;float:left">'+annualreview1.date_review+'</div><div class="col-md-6" style="width:50%;float:left">'+company_name+'</div><div class="col-md-6"  style="width:50%;float:left">Date of Review</div><div class="col-md-6" style="width:50%;float:left">Name of Motor Carrier</div><div class="col-md-12" style="width:100%;float:left"></div><div class="col-md-12" style="width:100%;float:left"><div class="col-md-6" style="width:50%;float:left"></div><div class="col-md-6" style="width:50%;float:left"><img src="'+signature+'"></div></div><div class="col-md-12" style="width:100%;float:left">&nbsp;<div class="col-md-6" style="width:50%;float:left">&nbsp;</div><div class="col-md-6" style="width:50%;float:right;">Reviewed by: Signature and Title</div></div></div>';
        let Formfooter = '</div></div></div>';
        req_annualreview = Formheader + Formbody + Formfooter;
        console.log('fsdgw3233263'+req.query.driverid);
    }

     getDriverdetails = await Driverdetails.findOne({ where: { driverId: driverid }, raw: true });
    let motor_vehicle_driver_certificate = await motorVehicleDriverCertificate.findOne({ where: { driverId:driverid}, raw: true });
    let getdriveraddress = await Driveraddress.findOne({ where: { driverId: driverid }, raw: true });
    let sign1 = 'uploads/attachment/drivinghistoryaddressSignature/';
     getDrivinghistorySignature = '';
    if(getDrivinghistory && getDrivinghistory.signature){
        getDrivinghistorySignature = '<img src="'+sign1+getDrivinghistory.signature+'" alt="user" width="150" style="height:45px;"></img>';
    }
    
    let sign2 = 'uploads/attachment/motorVechile/';
     signature = '';
    if(motor_vehicle_driver_certificate && motor_vehicle_driver_certificate.signature){
        signature = '<img src="'+sign2+motor_vehicle_driver_certificate.signature+'" alt="user" width="150" style="height:45px;"></img>';

    }
    let cur_company ='';
    
    if (driverid && motor_vehicle_driver_certificate) {
        if(getdriver.company_id!=''){
            let cur_company  = await Company.findOne({ where: { id: getdriver.company_id}, raw: true });
            company_name = cur_company.name;
        }
        let Formheader = '<head><title>'+ getDriverdetails.firstName+'_motor_vehicle_driver_certificate'+'</title></head><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'MOTOR VEHICLE DRIVER’S CERTIFICATION OF VIOLATIONS</h3> </hr></div><div style="text-align: center2;margin: 1px;" class="row"> <div style="padding: 5px;" class="col-md-12" style="width:100%;float:left">';
        let Formbody = '<p align="justify"><input type="checkbox" id="certify" value="1" checked disabled>  I certify that the following is a true and complete list of traffic violations (other than parking violations) for which I have been convicted or forfeited bond or collateral during the past 12 months.</p><table style="width: 100%;border-collapse: separate;border-spacing: 0 1em;;text-align:left"><thead><tr><th style="text-align:left;">Date</th><th style="text-align:left;">Offence</th><th style="text-align:left;">Location</th><th style="text-align:left;">Type of Vehicle Operated</th></tr></thead><tbody><tr><td>'+motor_vehicle_driver_certificate.date1+'</td><td>'+motor_vehicle_driver_certificate.offence1+'</td><td>'+motor_vehicle_driver_certificate.location1+'</td><td>'+motor_vehicle_driver_certificate.vehicle1+'</td></tr>';
        if(motor_vehicle_driver_certificate.date2 && motor_vehicle_driver_certificate.data2!='' && motor_vehicle_driver_certificate.date2!='0000-00-00'){
            Formbody += '<tr><td>'+motor_vehicle_driver_certificate.date2+'</td><td>'+motor_vehicle_driver_certificate.offence2+'</td><td>'+motor_vehicle_driver_certificate.location2+'</td><td>'+motor_vehicle_driver_certificate.vehicle2+'</td></tr>';
        }
        if(motor_vehicle_driver_certificate.date3 && motor_vehicle_driver_certificate.data3!='' && motor_vehicle_driver_certificate.date3!='0000-00-00'){
            Formbody += ' <tr><td>'+motor_vehicle_driver_certificate.date3+'</td><td>'+motor_vehicle_driver_certificate.offence3+'</td><td>'+motor_vehicle_driver_certificate.location3+'</td><td>'+motor_vehicle_driver_certificate.vehicle3+'</td></tr>';
        }
        if(motor_vehicle_driver_certificate.date4 && motor_vehicle_driver_certificate.data4!='' && motor_vehicle_driver_certificate.date4!='0000-00-00'){
            Formbody += '<tr><td>'+motor_vehicle_driver_certificate.date4+'</td><td>'+motor_vehicle_driver_certificate.offence4+'</td><td>'+motor_vehicle_driver_certificate.location4+'</td><td>'+motor_vehicle_driver_certificate.vehicle4+'</td></tr>';
        }
         Formbody += '</tbody></table><p>If no violations are listed above, I certify that I have not been convicted or forfeited bond or collateral on account of any violation (other than those I have provided under Part 383) required to be listed during the past 12 months</p><div class="col-md-12" style="padding-left: 0px;width:100%;float:left"><div class="col-md-3" style="padding-left: 0px;width:33.33%;float:left"><div class="col-md-6"  style="padding-left: 0px;width:50%;float:left">Driver’s License No:</div><div class="col-md-6" style="width:50%;float:left">'+driver_license+'</div></div><div class="col-md-3" style="width:33.33%;float:left"><div class="col-md-6" style="width:50%;float:left">State:</div><div class="col-md-6" style="width:50%;float:left">'+getdriveraddress.driverState+'</div></div><div class="col-md-3" style="width:33.33%;float:left"><div class="col-md-6" style="width:50%;float:left">Expiration Date:</div><div class="col-md-6" style="width:50%;float:left">'+getdriver.license_expiry+'</div></div></div><div class="col-md-12"  style="padding-left: 0px;width:100%;float:left;padding-top:12px;text-align:left"><div class="col-md-6"  style="padding-left: 0px;width:50%;float:left">'+motor_vehicle_driver_certificate.date_certificate+'</div><div class="col-md-4" style="width:25%;float:left"></div><div class="col-md-4" style="width:25%;float:left"> '+getDrivinghistorySignature+'</div> <div class="col-md-6"  style="padding-left: 0px;width:50%;float:left">Date of Certification</div><div class="col-md-4" style="width:25%;float:left"></div><div class="col-md-4" style="float:right;margin-right:-96px;">Driver’s Signature</div></div><div class="col-md-12" style="padding-left: 0px;width:100%;float:left;padding-top:12px;;text-align:left"><div class="col-md-6" style="padding-left: 0px;width:50%;float:left">Company Name</div><div class="col-md-4" style="width:25%;float:left">&nbsp;</div><div class="col-md-4" style="width:25%;float:left">Company Address</div><div class="col-md-6" style="padding-left: 0px;width:50%;float:left">'+company_name+'</div><div class="col-md-4" style="width:25%;float:left"></div><div class="col-md-4" style="width:25%;float:left">'+cur_company.companyAddress+'</div></div><div class="col-md-12" style="padding-left: 0px;width:100%;float:left;margin-top:20px;;text-align:left"><div class="col-md-6" style="padding-left: 0px;width:50%;float:left">'+signature+'</div><div class="col-md-4" style="width:25%;float:left"></div><div class="col-md-4" style="width:25%;float:left">'+motor_vehicle_driver_certificate.title+'</div><div class="col-md-12" style="width:100%;float:left;padding-left:0px;margin-top:20px;;text-align:left"><div class="col-md-6" style="padding-left: 0px;width:50%;float:left">Reviewed By: (Signature)</div><div class="col-md-4" style="width:25%;float:left"></div><div class="col-md-4" style="width:25%;float:left;margin-top:-18px;">Title</div></div></div>';
        let Formfooter = '</div></div></div>';
        req_motor_vehicle = Formheader + Formbody + Formfooter
    }

    let referencedata = await Certificateauth.findOne({ where: { driverId: driverid, certificateID: 8 }, raw: true });
        let req_refernce = '';
        let getDrivinghistorynew = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });

        if (driverid && referencedata && getDrivinghistory) {
            if(getdriver.company_id!=''){
                let cur_company  = await Company.findOne({ where: { id: getdriver.company_id}, raw: true });
                company_name = cur_company.name;
            }
            driverName = getdriver ? getdriver.driver_name : '';
            let getDrivinghistorySignature = '';
            let sign12 = 'uploads/attachment/drivinghistoryaddressSignature/';
            if(getDrivinghistorynew && getDrivinghistorynew.signature){
                getDrivinghistorySignature = '<img src="'+sign12+getDrivinghistorynew.signature+'" alt="user" width="150" style="height:45px;"></img>';
            }
            let Formheader1 = '<head><title>'+ getDriverdetails.firstName+'_motor_vehicle_driver_certificate'+'</title></head><div id=""> <div style="text-align: center;"> <h3 style="margin-bottom:50px;">'+cmpd_img+'Reference Certificate</h3> </hr></div><div style="text-align: center2;margin: 1px;" class="row"> <div style="padding: 5px;" class="col-md-12" style="width:100%;float:left">';
            let  Formbody1 = '<div class="row"><div class="col-md-12"><p align="justify"> I <b>'+driverName+'</b>am applying for employment at <b>'+company_name+' </b>(my "Potential Employer") and want to provide my consent for only this application I agree that my Potential Employer and its service provider, Compliance Mentorz Inc. ("Service Provider"), may contact all my former employers to conduct a reference and driving safety check that includes the collection and assessment of information about my dates of employment, employment status, job duties and driving experience, reason for leaving, job performance and incident/accident record. I agree that my Potential Employer and its Service Provider may contact all organizations who have issued educational awards or credentials that I have identified to confirm my awards and credentials. I understand that Service Provider retains employment history records on behalf of a number of employers in the trucking industry. I agree that Service Provider, on behalf of my Potential Employer, may check these records to confirm my employment history and conduct a reference and driving safety check that includes an assessment of my dates of employment, employment status, job duties and driving experience, reason for leaving, job performance and incident/accident record. I agree that that my Potential Employer and Service Provider may use and disclose my personal information as required for the above-noted purposes and agree that each of the organizations that are contacted for the above-noted purposes may disclose information to either my Potential Employer or its Service Provider. I will not hold my Potential Employer or Service Provider or said organizations liable for this disclosure. I agree that Service Provider may retain all personal information it collects for the above-noted purposes on behalf of my Potential Employer, who shall control and have a full right of access to records of my personal information that Service Provider creates and retains. I will not hold Service Provider liable for any losses arising out of its retention or handling of my personal information. I understand that I have the right to (1) to review the information provided by previous employers, (2) have errors corrected and re-submitted by previous employers and (3) have a rebuttal statement attached to information I allege to be erroneous if my previous employer and I cannot agree on the accuracy of information. I understand that I may direct any questions I have about this consent and about how Service Provider handles personal information on behalf of my Potential Employer to Compliance Mentorz Inc. at info@compliancementorz.com or by phone at 1-905-486-1666. I certify that this application was completed by me and that all entries on it and information in it are true and complete to the best of my knowledge. I understand that any misstatement or omission of information in this application may result in my dismissal. This document applies to the following previous employer</p><span style="float:right"><b>Driver'+"’s Name"+' (Printed)</b>: '+driverName+'<br><b>Drivers Signature:</b>'+getDrivinghistorySignature+'</a> </span><br></div></div>';
            let Formfooter1 = '</div></div></div>';
            req_refernce = Formheader1 + Formbody1 + Formfooter1
        }

       

		// let finalCertificate = PersonalDetailsData + pageBreak + employmentHistoryData + pageBreak + getDrivinghistoryData + pageBreak + motorvehicleCertificateData + pageBreak + medicaldeclerationData + pageBreak + driverAcknowledgementData + pageBreak + PSPDisclosure + pageBreak + clearingHouseConsentData + pageBreak + compensatedWorkData + pageBreak + drugAndAlcoholData + pageBreak + HOSData + pageBreak + questionone1 + pageBreak + questiontwo + pageBreak + getCanadahos + pageBreak + getushos + pageBreak + flabted +pageBreak + orientation + pageBreak + dry_van + pageBreak + req_disclaimer+'<style>@page { size: auto;  margin: 0mm; }</style>';
        let finalCertificate = PersonalDetailsData + pageBreak + employmentHistoryData + pageBreak + getDrivinghistoryData + pageBreak + motorvehicleCertificateData + pageBreak + medicaldeclerationData + pageBreak + driverAcknowledgementData + pageBreak + PSPDisclosure + pageBreak + clearingHouseConsentData + pageBreak + compensatedWorkData + pageBreak + drugAndAlcoholData + pageBreak + HOSData;
		if(questionone1 && questionone1!= null && questionone1!= '' && questionone1!='undefined' && questionone1!='NaN' && questionone1!=NaN){
		  finalCertificate += pageBreak + questionone1;
		}
		if(questiontwo1 && questiontwo1!= null && questiontwo1!= '' && questiontwo1!='undefined' && questiontwo1!='NaN' && questiontwo1!=NaN){
		  finalCertificate += pageBreak+ questiontwo1;
		}
        console.log('fsdfsdrewr');
		if(getCanadahos && getCanadahos!= null && getCanadahos != '' && getCanadahos!='undefined' && getCanadahos!='NaN' && getCanadahos!=NaN){
		  finalCertificate += pageBreak+ getCanadahos;
		}
        console.log('ushos');
		if( getushos1 && getushos1!='undefined' && getushos1!= null && getushos1 != '' && getushos1!=NaN){
		  finalCertificate += pageBreak+ getushos1;
		}
        let getchecklistnew = await Companychecklist.findOne({ where: { company_id: getDriverdetails.company_id }, raw: true });
        console.log('checklist1'+getchecklistnew.flatbed_checklists);
        console.log('checklist2'+getchecklistnew.orientation_Checklists);
        console.log('checklist3'+getchecklistnew.dry_van_checklists);
		if(flabted && flabted!= null && flabted != '' && flabted!='undefined' && flabted!='NaN' && flabted!=NaN && getchecklistnew && getchecklistnew.flatbed_checklists){
		  finalCertificate += pageBreak+ flabted;
		}
		if(orientation && orientation!= null && orientation != '' && orientation!='undefined' && orientation!='NaN' && orientation!=NaN  && getchecklistnew && getchecklistnew.orientation_Checklists){
		  finalCertificate += pageBreak+ orientation;
		}
		
		if(dry_van && dry_van!= null && dry_van != '' && dry_van!='undefined' && dry_van!='NaN' && dry_van!=NaN && getchecklistnew && getchecklistnew.dry_van_checklists){
		  finalCertificate += pageBreak+ dry_van;
		}
		if(req_disclaimer && req_disclaimer!= null && req_disclaimer != '' && req_disclaimer!='undefined' && req_disclaimer!='NaN' && req_disclaimer!=NaN){
		  finalCertificate += pageBreak+ req_disclaimer;
		}
        if(getWeightDimensions1 && getWeightDimensions1!= null && getWeightDimensions1 != '' && getWeightDimensions1!='undefined' && getWeightDimensions1!='NaN' && getWeightDimensions1!=NaN){
            finalCertificate += pageBreak+ getWeightDimensions1;
          }
		finalCertificate +='<style>@page { size: auto;  margin: 0mm; }</style>';
        if(getsafetyLaws1 && getsafetyLaws1!= null && getsafetyLaws1 != '' && getsafetyLaws1!='undefined' && getsafetyLaws1!='NaN' && getsafetyLaws1!=NaN){
            finalCertificate += pageBreak+ getsafetyLaws1;
          }
          console.log(req.query);
        if(req_annualreview && req_annualreview!= null && req_annualreview != '' && req_annualreview!='undefined' && req_annualreview!='NaN' && req_annualreview!=NaN){
            finalCertificate += pageBreak+ req_annualreview;
        }
        if(req_motor_vehicle && req_motor_vehicle!= null && req_motor_vehicle != '' && req_motor_vehicle!='undefined' && req_motor_vehicle!='NaN' && req_motor_vehicle!=NaN){
            finalCertificate += pageBreak+ req_motor_vehicle;
        }
        if(req_refernce && req_refernce!= null && req_refernce != '' && req_refernce!='undefined' && req_refernce!='NaN' && req_refernce!=NaN){
            finalCertificate += pageBreak+ req_refernce;
        }
		finalCertificate +='<style>@page { size: auto;  margin: 0mm; }</style>';
        if (finalCertificate) {
            res.json({ status: true, datas: finalCertificate });
        }
		
        else {
            res.json({ status: false });
        }
    }
});


router.superadminfileuploadForm = async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
    res.render('superadmin/fileuploadFormSuperadmin', {
        title: 'File upload Form',
        getCompanydata: getCompanydata
    });
};
router.SuperadminQuestions = async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
    res.render('superadmin/superadminQuestions', {
        title: 'Manage Interview Questions',
        getCompanydata: getCompanydata
    });
};


//Rajesh code
router.Superadmindrivermanual = async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
    res.render('superadmin/superadmindrivermanual', {
        title: 'Manage Driver Manual',
        getCompanydata: getCompanydata
    });
};



// Reference start

router.ReferenceManagement = ('/ReferenceManagement/', async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
    // let getCompanydata  = await Driver.findAll({limit: 5,order: [
    //     ['id', 'DESC']
    // ],raw : true});
    // console.log(getCompanydata);
    res.render('superadmin/ReferenceManagement_superadmin', {
        title: 'Manage Reference',
        getCompanydata: getCompanydata
    });
});


router.getReferenceManagement = async (req, res) => {
    // console.log('get driver');
    let cmpid = req.query.cmpid;
    // console.log(req.query.columns);
    // console.log(req.query.draw);
    // console.log(req.query.search.value);
    let col = req.query.columns[[0]].column || 'driver.id';
    let direction = req.query.columns[[0]].dir || 'DESC';
    let columns = ['driver.id', 'driver_id', 'driver_name', 'r.status', 'r.previousEmployerName', 'r.previousEmployerEmail', 'r.formID'];
    let searchKey = '';
    let where = [];
    // Search Conditions
    if (req.query.search.value) {
        if (req.query.search.value != "") {
            where.push({
                [Op.or]: [
                    { 'driver_name': { [Op.like]: `%` + req.query.search.value + `%` } }
                ]
            });
        } else {
            where.push({ ['driver_name']: { [Op.like]: `%` + req.query.search.value + `%` } });
        }
    } else {
        where.push({
            id: {
                [Op.ne]: ""
            }
        });
    }
    where.push({
        active: 0
    });
    where.push({
        company_id: cmpid
    });
    const options = {
        page: ((req.query.start / req.query.length) + 1) || 1,
        paginate: parseInt(req.query.length) || 25,
        order: [[columns, col, direction]],
        attributes: columns,
        raw: true,
        where: where,
        include: [{
            model: db.reference,
            as: "r",
            required: false,
            // attributes : ['categories_name'],
            raw: true
        }
        ]
    }
    await Driver.paginate(options).then(function (dt) {
        let data = dt.docs.map(formData);
        // function formData(key) {
        function formData(key, index) {
            index = parseInt(index) + 1 + parseInt(req.query.start)
            let statusBtn;
            let btnClass = '';
            if (key.status == null) {
                btnClass = 'btn btn-danger';
                statusBtn = 'No Form Genrerated'
            } else if (key.status == 0) {
                btnClass = 'btn btn-warning'
                statusBtn = 'Pending from Previous Employer'
            } else {
                btnClass = 'btn btn-success'
                statusBtn = 'Completed'
            }
            Object.assign(key, {
                slno: index
            });
            key.id = key.id,
                // console.log(key);
                key.formID = key.formID,
                key.driver_name = key.driver_name,
                key.previousEmployerName = key.previousEmployerName,
                Object.assign(key, {
                    action: "<a href='javascript:void(0)' data-id='" + key.id + "' id='' class='btn btn-primary viewmodalclass'><span class='fab fa-wpforms'>  Create Form</span></a>&nbsp; " +
                        "<a href='javascript:void(0)' data-id='" + key.id + "' data-formID='" + key.formID + "' id='' class='btn btn-success viewmodalprevempStatus'><span class='fas fa-search'> View Form Status</span></a>&nbsp; " +
                        "<a href='javascript:void(0)' data-id='" + key.id + "' id='' class='" + btnClass + " viewmodalRemainder1'><span class='fas fa-info-circle ' >" + statusBtn + "</span></a>&nbsp; "
                });
            return key;
        }
        res.json({
            "recordsTotal": data.length,
            "recordsFiltered": dt.total,
            data
        });
    });
};
router.editReferenceManagement = ('/editReferenceManagement/', async (req, res) => {
    //    console.log(req.query);
    let id = req.query.id;
    // let cmpid = req.query.cmpid;
    let DriverDtls = await Driver.findOne({ where: { id: id }, raw: true });
    let companyDtls = await Company.findOne({ where: { id: DriverDtls.company_id }, raw: true });
    let getDriverdetails = await Certificateauth.findOne({ where: { driverId: id, certificateID: 5 }, raw: true });
    let refDriverApproval = await Certificateauth.findOne({ where: { driverId: id, certificateID: 8 }, raw: true });
    if (refDriverApproval == null) {
        res.json({ status: false, data: 'Driver Approval Pending' });
    }
    let getDriverdetailsData = getDriverdetails ? getDriverdetails.adminSignature : ""
    if (DriverDtls) {
        res.json({ status: true, DriverData: DriverDtls, CompanyData: companyDtls, getDriverdetails: getDriverdetailsData });
    }
    else {
        res.json({ status: false, data: "Something went wrong" });
    }
});
router.updateReferenceManagement = ('/updateReferenceManagement/', async (req, res) => {

    if (req.body.companySign != "") {
        let signaturepath = 'public/uploads/attachment/companySign/';
        let companySignData = await fileUpload('companySign', signaturepath, req.body.companySign, req, res)
        Object.assign(req.body, {
            companySign: '/uploads/attachment/companySign/' + companySignData // add json element
        });
    }

    let date = new Date();
    var created_date =
        ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
        ("00" + date.getDate()).slice(-2) + "-" +
        date.getFullYear() + " " +
        ("00" + date.getHours()).slice(-2) + ":" +
        ("00" + date.getMinutes()).slice(-2) + ":" +
        ("00" + date.getSeconds()).slice(-2);
    console.log(req.session);
    Object.assign(req.body, {
        created_date: created_date // add json element
    });

    const fData = JSON.parse(JSON.stringify(req.body))
    let update_reference = await Reference.update(fData, {
        where: {
            formID: req.body.formID
        }
    });
    if (update_reference) {
        res.json({ status: true, message: 'Thanks for the Information' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
router.CreateReference = ('/CreateReference/', async (req, res) => {
    // Form id
    let formID = ""
    let length = 8
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        formID += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    Object.assign(req.body, {
        formID: formID // add json element
    });
    let date = new Date();
    var created_date =
        ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
        ("00" + date.getDate()).slice(-2) + "-" +
        date.getFullYear() + " " +
        ("00" + date.getHours()).slice(-2) + ":" +
        ("00" + date.getMinutes()).slice(-2) + ":" +
        ("00" + date.getSeconds()).slice(-2);
    console.log(req.session);
    Object.assign(req.body, {
        created_date: created_date // add json element
    });
    const fData = JSON.parse(JSON.stringify(req.body));
    console.log(req.body);
    console.log(fData);
    //Remove double quotes and braces
    let fDataEmail = fData.RefPreviousEmployerEmailArr.replace(/["'[\]']+/g, '');
	console.log(fDataEmail);
    //Split using comma
    var fDataEmailArray = fDataEmail.split(',');
    delete req.body['RefPreviousEmployerEmailArr'];
    if (fDataEmailArray) {
        await fDataEmailArray.forEach(function (getDetails, i) {
            console.log(getDetails);
            Object.assign(fData, {
                RefPreviousEmployerEmail: getDetails // add json element 
            });
            update_driver = Reference.create(fData);
            //Email
            let to = getDetails
            let userName = req.body.employeeName
            let previousEmployerName = req.body.previousEmployerName
            let cc = 'compliancementorzportal@gmail.com'
            let subject = 'Employer Verification request'
            let URL = 'https://compliancementorz.ca/previousEmployer/' + formID
            let message = '<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title></title><style>div,h1,p,table,td{font-family:Arial,sans-serif}@media screen and (max-width:530px){.unsub{display:block;padding:8px;margin-top:14px;border-radius:6px;background-color:#555;text-decoration:none!important;font-weight:700}.col-lge{max-width:100%!important}}@media screen and (min-width:531px){.col-sml{max-width:27%!important}.col-lge{max-width:73%!important}}</style></head><body style="margin:0;padding:0;word-spacing:normal;background-color:#939297"><div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297"><table role="presentation" style="width:100%;border:none;border-spacing:0"><tr><td align="center" style="padding:0"><table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636"><tr><td style="padding:40px 30px 30px 30px;text-align:center;font-size:24px;font-weight:700"><a href="https://compliancementorz.com" style="text-decoration:none"><img src="https://compliancementorz.com/img/logo.png" width="165" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#fff"></a></td></tr><tr><td style="padding:30px;background-color:#fff"><p style="margin:0">Hello Employer </p><br><p style="margin:0">You are receiving this email because a former employee ' + userName + ', has filled out an application for employment at Compliancementorz and it was indicated that ' + previousEmployerName + ' was a previous employer. <br> ' + userName + ' has signed a release which is available for viewing on our verification web form. If this is correct, please go to the  <a target="_blank" href="' + URL + '">secure link</a>  and answer the employment verification questions on ' + userName + '.<br>Please call Compliancementorz at 9054861666 or email Driverhiring@compliancementorz.com 9am - 5pm EST. M-FOn behalf of Compliancementorz, thank you in advance for your prompt attention and taking the time to provide employment verification on ' + userName + '.<br>Regards,<br><br>Compliancementorz<br><a href="https://compliancementorz.com" style="text-decoration:none"><img src="https://compliancementorz.com/img/logo.png" width="90" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#fff"></a> <br>Tel: 9054861666<br>E-mail: Driverhiring@compliancementorz.com<br>Web: https://compliancementorz.com/</td></tr><tr><td style="padding:30px;text-align:center;font-size:12px;background-color:#404040;color:#ccc"><p style="margin:0;font-size:14px;line-height:20px">&reg; compliancementorz 2022</p></td></tr></table></td></tr></table></div></body></html>'
            //sendMailRef(to, cc, subject, message, req, res)
			let newDriverEmail = sendMailGrid(to, cc, subject, message, req, res,'verification@compliancementorz.com')
            //Email
            delete fData['RefPreviousEmployerEmail'];
        })


        res.json({ status: true, message: 'Email sent' });

    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
router.CreateReferenceExisting = ('/CreateReferenceExisting/', async (req, res) => {
    // Form id
    // let formID = ""
    // let length = 8
    // var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    // var charactersLength = characters.length;
    // for (var i = 0; i < length; i++) {
    //     formID += characters.charAt(Math.floor(Math.random() * charactersLength));
    // }
    // Object.assign(req.body, {
    //     formID: formID // add json element
    // });
    const fData = JSON.parse(JSON.stringify(req.body))
    let formID = ""
    let length = 8
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        formID += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    Object.assign(req.body, {
        formID: formID // add json element
    });
    let date = new Date();
    var created_date =
        ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
        ("00" + date.getDate()).slice(-2) + "-" +
        date.getFullYear() + " " +
        ("00" + date.getHours()).slice(-2) + ":" +
        ("00" + date.getMinutes()).slice(-2) + ":" +
        ("00" + date.getSeconds()).slice(-2);
    console.log(req.session);
    Object.assign(req.body, {
        created_date: created_date // add json element
    });
    
    //Remove double quotes and braces
    // let fDataEmail = fData.RefPreviousEmployerEmailArr.replace(/["'[\]']+/g, '');
    // //Split using comma
    // var fDataEmailArray = fDataEmail.split(',');
    // delete req.body['RefPreviousEmployerEmailArr'];
    // if (fDataEmailArray) {
    //     await fDataEmailArray.forEach(function (getDetails, i) {
    // console.log(getDetails);
    // Object.assign(fData, {
    //     RefPreviousEmployerEmail: getDetails // add json element
    // });
    update_driver = Reference.create(fData);
    let to = req.body.RefPreviousEmployerEmail
    let userName = req.body.employeeName
    let previousEmployerName = req.body.previousEmployerName
    let cc = 'compliancementorzportal@gmail.com'
    let subject = 'Employer Verification request'
    let URL = 'https://compliancementorz.ca/previousEmployer/' + formID
    let message = '<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title></title><style>div,h1,p,table,td{font-family:Arial,sans-serif}@media screen and (max-width:530px){.unsub{display:block;padding:8px;margin-top:14px;border-radius:6px;background-color:#555;text-decoration:none!important;font-weight:700}.col-lge{max-width:100%!important}}@media screen and (min-width:531px){.col-sml{max-width:27%!important}.col-lge{max-width:73%!important}}</style></head><body style="margin:0;padding:0;word-spacing:normal;background-color:#939297"><div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297"><table role="presentation" style="width:100%;border:none;border-spacing:0"><tr><td align="center" style="padding:0"><table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636"><tr><td style="padding:40px 30px 30px 30px;text-align:center;font-size:24px;font-weight:700"><a href="https://compliancementorz.com" style="text-decoration:none"><img src="https://compliancementorz.com/img/logo.png" width="165" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#fff"></a></td></tr><tr><td style="padding:30px;background-color:#fff"><p style="margin:0">Hello Employer </p><br><p style="margin:0">You are receiving this email because a former employee ' + userName + ', has filled out an application for employment at Compliancementorz and it was indicated that ' + previousEmployerName + ' was a previous employer. <br> ' + userName + ' has signed a release which is available for viewing on our verification web form. If this is correct, please go to the  <a target="_blank" href="' + URL + '">secure link</a>  and answer the employment verification questions on ' + userName + '.<br>Please call Compliancementorz at 9054861666 or email Driverhiring@compliancementorz.com 9am - 5pm EST. M-FOn behalf of Compliancementorz, thank you in advance for your prompt attention and taking the time to provide employment verification on ' + userName + '.<br>Regards,<br><br>Compliancementorz<br><a href="https://compliancementorz.com" style="text-decoration:none"><img src="https://compliancementorz.com/img/logo.png" width="90" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#fff"></a> <br>Tel: 9054861666<br>E-mail: Driverhiring@compliancementorz.com<br>Web: https://compliancementorz.com/</td></tr><tr><td style="padding:30px;text-align:center;font-size:12px;background-color:#404040;color:#ccc"><p style="margin:0;font-size:14px;line-height:20px">&reg; compliancementorz 2022</p></td></tr></table></td></tr></table></div></body></html>'
    //sendMailRef(to, cc, subject, message, req, res)
    let newDriverEmail = sendMailGrid(to, cc, subject, message, req, res,'verification@compliancementorz.com')
    // delete fData['RefPreviousEmployerEmail'];
    if (update_driver) {

        res.json({ status: true, message: 'Email sent' });

    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});
//Complete form from controller
router.superadminGetPrevEmpdetails = ('/superadminGetPrevEmpdetails/', async (req, res, next) => {
    let id = req.query.id;
    let tableData = "";
    let getDtls = await Employementhistroyaddress.findAll({ where: { driverId: id }, raw: true });
    let DriverDtls = await Driver.findOne({ where: { id: id }, raw: true });
    let getDriverMoredetails = await Driverdetails.findOne({ where: { driverId: id }, raw: true });
    let CompanyDtls = await Company.findOne({ where: { id: DriverDtls.company_id }, raw: true });
    let getReferenceDtls = await Reference.findAll({ where: { driverId: id }, raw: true });
    let getDrivinghistoryData = await Drivinghistory.findOne({ where: { driverId: id }, raw: true });
    let signature = getDrivinghistoryData ? getDrivinghistoryData.signature : '';
    let attachmentpath = "/uploads/attachment/drivinghistoryaddressSignature/" + signature;
    if (signature) {
        ImagesAttachment = '<img id="signature" alt="user" width="150" src="' + attachmentpath + '">';
    } else {
        ImagesAttachment = '';
    }
    if (getDtls == null || DriverDtls == null || getDriverMoredetails == null || CompanyDtls == null || getDrivinghistoryData == null) {
        res.json({ status: false, data: "Before creating reference all other driver forms to be filled (Manage Company, Driver Portal - Personal Details, Employment History and Driving History)" });
    }
    //Sort array by date
    getDtls.sort(function (a, b) {
        return new Date(a.toDate) - new Date(b.toDate)
    })
    if (getDtls) {
        await getDtls.forEach(function (getDetails, i) { 
            // hide = 'style="display: none;'
            // tableData += '<tr><td>' + getDetails.employerName + '</td><td>' + getDetails.employerAddress + '</td><td>' + getDetails.employerPosition + '</td><td>' + getDetails.employerContactPerson + '</td><td>' + getDetails.employerContactPersonNumber + '</td><td>' + getDetails.employerContactPersonEmail + '</td><td>' + getDetails.jobDesignated + '</td><td>' + getDetails.fmcrs + '</td><td>' + getDetails.fromDate + '</td><td>' + getDetails.toDate + '</td></tr>';
            tableData += '<form style="background-color: #00ff991f;" class="form-horizontal" id="sendMailToPrevForm' + i + '">';
            tableData += '<div class="card-body"><h3 align="center" class="card-title"></h3><br><input type="hidden" id="form_id" name="form_id"> <input type="hidden" id="company_id" value="' + CompanyDtls.id + '" name="company_id"> <input type="hidden" id="driverId" value="' + DriverDtls.id + '" name="driverId"><div class="row"><label for="employeeName" class="col-md-1 control-label col-form-label">I,</label><div class="col-md-3"><input type="text" required placeholder="Employee Name" class="form-control" value="' + DriverDtls.driver_name + '" name="employeeName" id="employeeName"></div><div class="col-md-4">am applying for employment at</div><div class="col-md-4"><input type="text" required class="form-control" placeholder="prospective Employer Name" value="' + CompanyDtls.name + '" name="prospectiveEmployerName" id="prospectiveEmployerName"></div></div><p align="justify">(my "Potential Employer") and want to provide my consent for only this application I agree that my Potential Employer and its service provider, Compliance Mentorz Inc. ("Service Provider"), may contact all my former employers to conduct a reference and driving safety check that includes the collection and assessment of information about my dates of employment, employment status, job duties and driving experience, reason for leaving, job performance and incident/accident record. I agree that my Potential Employer and its Service Provider may contact all organizations who have issued educational awards or credentials that I have identified to confirm my awards and credentials. I understand that Service Provider retains employment history records on behalf of a number of employers in the trucking industry. I agree that Service Provider, on behalf of my Potential Employer, may check these records to confirm my employment history and conduct a reference and driving safety check that includes an assessment of my dates of employment, employment status, job duties and driving experience, reason for leaving, job performance and incident/accident record. I agree that that my Potential Employer and Service Provider may use and disclose my personal information as required for the above-noted purposes and agree that each of the organizations that are contacted for the above-noted purposes may disclose information to either my Potential Employer or its Service Provider. I will not hold my Potential Employer or Service Provider or said organizations liable for this disclosure. I agree that Service Provider may retain all personal information it collects for the above-noted purposes on behalf of my Potential Employer, who shall control and have a full right of access to records of my personal information that Service Provider creates and retains. I will not hold Service Provider liable for any losses arising out of its retention or handling of my personal information.<br> I understand that I have the right to (1) to review the information provided by previous employers, (2) have errors corrected and re-submitted by previous employers and (3) have a rebuttal statement attached to information I allege to be erroneous if my previous employer and I cannot agree on the accuracy of information. I understand that I may direct any questions I have about this consent and about how Service Provider handles personal information on behalf of my Potential Employer to Compliance Mentorz Inc. at info@compliancementorz.com or by phone at 1-905-486-1666. I certify that this application was completed by me and that all entries on it and information in it are true and complete to the best of my knowledge. I understand that any misstatement or omission of information in this application may result in my dismissal. This document applies to the following previous employer</p><input type="text" required class="form-control" name="previousEmployerName" value="' + getDetails.employerName + '" placeholder="Employer Name" id="prospectiveEmployerName" required=""><label for="name" class="col-md-4 control-label col-form-label">Employee Signature</label><br>' + ImagesAttachment + '<br><input type="text" required class="form-control" id="employeeName" placeholder="Employee Name" value="' + DriverDtls.driver_name + '"><br><span></span><hr><h4 style="text-align:center">SAFETY PERFORMANCE HISTORY RECORDS REQUEST</h4><h5 style="text-align:center">PART 1: TO BE COMPLETED BY PROSPECTIVE EMPLOYER</h5><div class="form-group row"><label for="prospectiveEmployerName" class="col-md-2 control-label col-form-label">I</label><div class="col-md-4"><input type="text" required class="form-control" placeholder="Prospective employee name" name="prospectiveEmployerName" value="' + DriverDtls.driver_name + '" id="prospectiveEmployerName"></div><label for="employeeSin" class="col-md-3 control-label col-form-label">Social Security Number:</label><div class="col-md-3"><input type="text" required class="form-control" placeholder="Social Security Number" name="employeeSin" value="' + getDriverMoredetails.sin + '" id="employeeSin"></div></div><div class="form-group row"><label for="employeeDOB" class="col-md-2 control-label col-form-label">DOB</label><div class="col-md-4"><input type="text" required class="form-control" placeholder="employeeDOB" name="employeeDOB" value="' + getDriverMoredetails.DOB + '" id="employeeDOB"></div></div><div class="form-group row"><label for="previousEmployerName" class="col-md-2 control-label col-form-label">Previous Employer:</label><div class="col-md-4"><input type="text" required class="form-control" placeholder="Previous Employer" name="previousEmployerName" value="' + getDetails.employerName + '" id="previousEmployerName"></div><label for="previousEmployer" class="col-md-3 control-label col-form-label">Previous Empoyer Email:</label><div class="col-md-3"><input type="text" id="previousEmployerEmail" name="previousEmployerEmail" class="form-control"></div></div><div class="form-group row"><label for="previousEmployerCSZ" class="col-md-2 control-label col-form-label">City, State, Zip:</label><div class="col-md-4"><input type="text" required class="form-control" placeholder="City, State, Zip" readonly name="" value="" id="previousEmployerCSZ"></div><label for="previousEmployerPhone" class="col-md-3 control-label col-form-label">Telephone:</label><div class="col-md-3"><input type="text" required class="form-control" placeholder="Telephone" readonly name="" value="" id="previousEmployerPhone"></div></div><div class="form-group row"><label for="previousEmployerStreet" class="col-md-2 control-label col-form-label">Street:</label><div class="col-md-4"><input type="text" required class="form-control" placeholder="Previous Employer Street" name="previousEmployerStreet" value="" id="previousEmployerStreet"></div><label for="previousEmployerFax" class="col-md-3 control-label col-form-label">Fax NO:</label><div class="col-md-3"><input type="text" class="form-control" placeholder="Fax" name="previousEmployerFax" value="" id="previousEmployerFax"></div></div><h4>TO:</h4><div class="form-group row"><label for="prospectiveEmployerName" class="col-md-2 control-label col-form-label">Prospective Employer:</label><div class="col-md-2"><input type="text" required readonly="" class="form-control" placeholder="Prospective Employer" name="prospectiveEmployerName" value="' + CompanyDtls.name + '" id="prospectiveEmployerName"></div><label for="prospectiveEmployerAttention" class="col-md-2 control-label col-form-label">Attention:</label><div class="col-md-2"><input type="text" required readonly="" class="form-control" placeholder="Attention" name="prospectiveEmployerAttention" value="' + CompanyDtls.attention + '" id="prospectiveEmployerAttention"></div><label for="prospectiveEmployerPhone" class="col-md-2 control-label col-form-label">Telephone:</label><div class="col-md-2"><input type="text" required readonly="" class="form-control" placeholder="Telephone" name="prospectiveEmployerPhone" value="' + CompanyDtls.phone + '" id="prospectiveEmployerPhone"></div></div><div class="form-group row"><label for="prospectiveEmployerStreet" class="col-md-2 control-label col-form-label">Street:</label><div class="col-md-4"><input type="text" required readonly="" class="form-control" placeholder="Street" name="prospectiveEmployerStreet" value="' + CompanyDtls.street + '" id="prospectiveEmployerStreet"></div><label for="prospectiveEmployerCSZ" class="col-md-3 control-label col-form-label">City, State, Zip:</label><div class="col-md-3"><input type="text" required readonly="" class="form-control" placeholder="City, State, Zip" name="prospectiveEmployerCSZ" value="' + CompanyDtls.cityStateZip + '" id="prospectiveEmployerCSZ"></div></div><div class="form-group row">In compliance with §40.25(g) and 391.23(h), release of this information must be made in a written form that ensures confidentiality, such as fax, email, or letter</div><div class="row"><label for="prospectiveEmployerFax" class="col-md-2 control-label col-form-label">Prospective employer’s fax number:</label><div class="col-md-4"><input type="text" class="form-control" placeholder="prospectiveEmployerFax" name="prospectiveEmployerFax" value="' + CompanyDtls.fax + '" id="prospectiveEmployerFax"></div><label for="prospectiveEmployerEmail" class="col-md-3 control-label col-form-label">Prospective employer’s email address:</label><div class="col-md-3"><input type="text" required class="form-control" placeholder="prospectiveEmployerEmail" name="prospectiveEmployerEmail" value="' + CompanyDtls.email + '" id="prospectiveEmployerEmail"></div></div><div class="form-group row"><label for="name" class="col-md-2 control-label col-form-label">Applicant’s Signature:</label><div class="col-md-4">' + ImagesAttachment + '<br></div><label for="name" class="col-md-3 control-label col-form-label">Date:</label><div class="col-md-3"><input type="date" class="form-control" placeholder="applicantDate" name="applicantDate" value="" id="applicantDate"></div></div><br><hr><h4 style="text-align:center">PART 2: TO BE COMPLETED BY PREVIOUS EMPLOYER</h4><h5 style="text-align:center">EMPLOYMENT VERIFICATION</h5><div class="form-group row"><label for="employedBy" class="col-md-9 control-label col-form-label">The applicant named above was employed by us:</label><div class="col-md-3"><select class="select2 form-control custom-select" name="employedBy" style="width:100%;height:36px"><option value="">Select Here</option><option value="YES">YES</option><option value="NO">NO</option></select></div></div><div class="form-group row"><label for="jobDesignation" class="col-md-2 control-label col-form-label">Employed as:</label><div class="col-md-2"><input type="text" required class="form-control" placeholder="Employed as" name="jobDesignation" value="' + getDetails.employerPosition + '" id="jobDesignation"></div><label for="previousfrom" class="col-md-2 control-label col-form-label">From:</label><div class="col-md-2"><input type="text" required class="form-control" placeholder="From" readonly="readonly" name="previousfrom" value="' + getDetails.fromDate + '" id="previousfrom"></div><label for="previousto" class="col-md-2 control-label col-form-label">To:</label><div class="col-md-2"><input type="text" required class="form-control" placeholder="To" readonly="readonly" name="previousto" value="' + getDetails.toDate + '" id="previousto"></div></div><div class="form-group row"><label for="motorVehicleForYou" class="col-md-9 control-label col-form-label">1. Did he/she drive motor vehicle for you? :</label><div class="col-md-3"><select class="select2 form-control custom-select" name="motorVehicleForYou" style="width:100%;height:36px"><option value="">Select Here</option><option value="YES">YES</option><option value="NO">NO</option></select></div></div><div class="form-group row"><label for="whatType" class="col-md-9 control-label col-form-label">If yes, what type?</label><div class="col-md-3"><select class="select2 form-control custom-select" name="whatType" style="width:100%;height:36px"><option value="">Select Here</option><option value="Straight Truck">Straight Truck</option><option value="Tractor-Semi trailer">Tractor-Semi trailer</option><option value="Bus">Bus</option><option value="Cargo Tank">Cargo Tank</option><option value="Doubles/Triples">Doubles/Triples</option><option value="Other">Other</option></select><input type="text" required class="form-control" placeholder="Other" name="whatTypeOther" value="" id="whatTypeOther"> <input type="text" required class="form-control" placeholder="Comment" name="whatTypeComment" value="" id="whatTypeComment"></div></div><div class="form-group row"><label for="reasonForLeaving" class="col-md-9 control-label col-form-label">2. Reason for leaving your employment:</label><div class="col-md-3"><select class="select2 form-control custom-select" name="reasonForLeaving" style="width:100%;height:36px"><option value="">Select Here</option><option value="Discharged">Discharged</option><option value="Resignation">Resignation</option><option value="LayOff">LayOff</option><option value="MilitaryDuty">MilitaryDuty</option></select></div></div><div class="form-group row"><label for="completeByCompany" class="col-md-2 control-label col-form-label">Complete by company</label><div class="col-md-4"><input type="text" required class="form-control" placeholder="Complete by company" name="completeByCompany" id="completeByCompany"></div><label for="previousEmployerAddress" class="col-md-1 control-label col-form-label">Address:</label><div class="col-md-5"><input type="text" required class="form-control" placeholder="Address" name="previousEmployerAddress" value="' + getDetails.address + '" id="previousEmployerAddress"></div></div><div class="form-group row"><label for="previousEmployerCSZ" class="col-md-2 control-label col-form-label">City, State, Postal Code</label><div class="col-md-4"><input type="text" required class="form-control" placeholder="City, State, Postal Code" name="previousEmployerCSZ" value="" id="previousEmployerCSZ"></div><label for="previousEmployerPhone" class="col-md-1 control-label col-form-label">Telephone:</label><div class="col-md-5"><input type="text" required class="form-control" placeholder="Telephone" name="previousEmployerPhone" value="" id="previousEmployerPhone"></div></div><div class="form-group row"><label for="name" class="col-md-2 control-label col-form-label">Signature</label><div class="col-md-4"><br></div><label for="name" class="col-md-3 control-label col-form-label">Date:</label><div class="col-md-3"></div></div><br><hr><h4 style="text-align:center">PART 3: TO BE COMPLETED BY PREVIOUS EMPLOYER</h4><h5 style="text-align:center">ACCIDENT HISTORY</h5>ACCIDENTS: Complete the following for any accidents included on your accident register (§390.15 (b)) that involved the “applicant in the 2 years prior to the application date shown above, or check 0 here if there is no accident register data for this driver<div class="form-group row"><label for="previousEmployerAnyInuries" class="col-md-9 control-label col-form-label">Please select YES if you have any injuries</label><div class="col-md-3"><select class="select2 form-control custom-select table_selectbox" name="previousEmployerAnyInuries" style="width:100%;height:36px"><option value="">Select Here</option><option value="YES">YES</option><option value="NO">NO</option></select></div></div><table class="table table-bordered part3table"><thead><tr><th scope="col">#</th><th scope="col">Date</th><th scope="col">Location</th><th scope="col">Injuries</th><th scope="col">Fatalities</th><th scope="col">Hazmat Spill</th></tr></thead><tbody><tr><th scope="row">1</th><td><input type="date" class="form-control" placeholder="Date" name="previousEmployertableoneDate" value="" id="previousEmployertableoneDate"></td><td><input type="text" class="form-control" placeholder="Location" name="previousEmployertableoneLocation" value="" id="previousEmployertableoneLocation"></td><td><input type="text" class="form-control" placeholder="Injuries" name="previousEmployertableoneInjuries" value="" id="previousEmployertableoneInjuries"></td><td><input type="text" class="form-control" placeholder="Fatalities" name="previousEmployertableoneFatalities" value="" id="previousEmployertableoneFatalities"></td><td><input type="text" class="form-control" placeholder="Hazmatspill" name="previousEmployertableoneHazmatSpill" value="" id="previousEmployertableoneHazmatSpill"></td></tr><tr><th scope="row">2</th><td><input type="date" class="form-control" placeholder="Date" name="previousEmployertableTwoDate" value="" id="previousEmployertableTwoDate"></td><td><input type="text" class="form-control" placeholder="Location" name="previousEmployertableTwoLocation" value="" id="previousEmployertableTwoLocation"></td><td><input type="text" class="form-control" placeholder="Injuries" name="previousEmployertableTwoInjuries" value="" id="previousEmployertableTwoInjuries"></td><td><input type="text" class="form-control" placeholder="Fatalities" name="previousEmployertableTwoFatalities" value="" id="previousEmployertableTwoFatalities"></td><td><input type="text" class="form-control" placeholder="Hazmatspill" name="previousEmployertableTwoHazmatSpill" value="" id="previousEmployertableTwoHazmatSpill"></td></tr><tr><th scope="row">3</th><td><input type="date" class="form-control" placeholder="Date" name="previousEmployertableThreeDate" value="" id="previousEmployertableThreeDate"></td><td><input type="text" class="form-control" placeholder="Location" name="previousEmployertableThreeLocation" value="" id="previousEmployertableThreeLocation"></td><td><input type="text" class="form-control" placeholder="Injuries" name="previousEmployertableThreeInjuries" value="" id="previousEmployertableThreeInjuries"></td><td><input type="text" class="form-control" placeholder="Fatalities" name="previousEmployertableThreeFatalities" value="" id="previousEmployertableThreeFatalities"></td><td><input type="text" class="form-control" placeholder="Hazmatspill" name="previousEmployertableThreeHazmatSpill" value="" id="previousEmployertableThreeHazmatSpill"></td></tr></tbody></table><div class="form-group row"><label for="companyPolicies" class="col-md-6 control-label col-form-label">Please provide information concerning any other accidents involving the applicant that were reported to government agencies or insurers or retained under internal company policies:</label><div class="col-md-6"><input type="text" class="form-control" placeholder="Policy" name="companyPolicies" id="companyPolicies"></div></div><div class="form-group row"><label for="name" class="col-md-6 control-label col-form-label">Any other remarks:</label><div class="col-md-6"><input type="text" class="form-control" placeholder="Remarks" name="remarks" value="" id="remarks"></div></div></div>'
            tableData += '<input type="hidden" name="driverSign" value=' + attachmentpath + '><div style="text-align: center;" class="card-body"> <h4 style="">Please Enter Multiple email by using comma (,)</h4>   <input type="text" class="form-control" placeholder="Reference Email this will be multiple" name="RefPreviousEmployerEmailArr" id="RefPreviousEmployerEmailArr">   <button id="sendMailToPrev1"  class="btn btn-primary sendMailToPrev" data-id="'+i+'">Send form thorugh E-mail</button></div> <hr> </form>';
        });
        tableData += '<center> <button  class="btn btn-success sendMailToPrev12"><span class="glyphicon glyphicon-refresh"></span>Click here to proceed </button> </center>'
        res.json({ status: true, data: tableData, getReferenceDtls: getReferenceDtls });
    }
    else {
        res.json({ status: false, data: "Something went wrong" });
    }
});



router.getFormStatus = ('/getFormStatus/', async (req, res) => {
    let getReferenceDtls = await Reference.findOne({ where: { formID: req.query.formID }, raw: true });
    let getReferenceDtlsAll = await Reference.findAll({ where: { formID: req.query.formID }, raw: true });

    groupEmail = '';
    await getReferenceDtlsAll.forEach(function (getDetails, i) {
        groupEmail += getDetails.RefPreviousEmployerEmail + ' ' + getDetails.created_date + '<br>'
    })
    if (getReferenceDtls) {

        res.json({ status: true, data: getReferenceDtls, groupEmail: groupEmail });
    } else {
        res.json({ status: false });
    }

})

router.PreviousEmployer = ('/PreviousEmployer/', async (req, res) => {
    if (req.params.id != "") {
        let getReferenceDtls = await Reference.findOne({ where: { formID: req.params.id }, raw: true });
        if (getReferenceDtls != null) {
            res.render('PreviousEmployer.ejs', {
                title: 'PreviousEmployer',
                FormID: req.params.id
            });
        } else {
            res.json({ Message: 'Invalid URL' });
        }

    } else {
        res.json({ Message: 'Wrong URL' });
    }

});
router.PreviousEmployerDatas = ('/PreviousEmployerDatas/', async (req, res) => {
    // console.log(req.body.id);
    console.log('------------------');
    let getReferenceDtls = await Reference.findOne({ where: { formID: req.body.id }, raw: true });
    // console.log(getReferenceDtls);
    // console.log(Object.keys(getReferenceDtls).length);
    if (getReferenceDtls) {

        res.json({ status: true, data: getReferenceDtls });
    } else {
        res.json({ status: false });
    }
});


router.referenceCron = ('/referenceCron', async (req, res, parms) => {
    //Check actual data matching exprange and columname
    // SELECT CURDATE(),STR_TO_DATE(created_date, "%m-%d-%Y") AS date FROM reference WHERE STR_TO_DATE(created_date, "%m-%d-%Y") <= CURDATE();
    let getPendingRef = await sequelize.query('SELECT RefPreviousEmployerEmail,employeeName,previousEmployerName,formID FROM reference WHERE status = 0 AND STR_TO_DATE(created_date, "%m-%d-%Y") <= CURDATE()', {
        raw: false, // pass true here if you have any mapped fields
    });

    for (let index = 0; index < getPendingRef[0].length; index++) {
        console.log(getPendingRef[0]);
        // console.log(getcronOrigin[0][index].companyname);
        if (getPendingRef[0][index].RefPreviousEmployerEmail != "" && getPendingRef[0][index].employeeName != "") {

            let to = getPendingRef[0][index].RefPreviousEmployerEmail
            let userName = getPendingRef[0][index].employeeName
            let previousEmployerName = getPendingRef[0][index].previousEmployerName
            let cc = 'compliancementorzportal@gmail.com'
            let subject = 'Remainder! Employer Verification request'
            let URL = 'https://compliancementorz.ca/previousEmployer/' + getPendingRef[0][index].formID
            let message = '<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title></title><style>div,h1,p,table,td{font-family:Arial,sans-serif}@media screen and (max-width:530px){.unsub{display:block;padding:8px;margin-top:14px;border-radius:6px;background-color:#555;text-decoration:none!important;font-weight:700}.col-lge{max-width:100%!important}}@media screen and (min-width:531px){.col-sml{max-width:27%!important}.col-lge{max-width:73%!important}}</style></head><body style="margin:0;padding:0;word-spacing:normal;background-color:#939297"><div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297"><table role="presentation" style="width:100%;border:none;border-spacing:0"><tr><td align="center" style="padding:0"><table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636"><tr><td style="padding:40px 30px 30px 30px;text-align:center;font-size:24px;font-weight:700"><a href="https://compliancementorz.com" style="text-decoration:none"><img src="https://compliancementorz.com/img/logo.png" width="165" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#fff"></a></td></tr><tr><td style="padding:30px;background-color:#fff"><p style="margin:0">Hello Employer </p><br><p style="margin:0">You are receiving this email because a former employee ' + userName + ', has filled out an application for employment at Compliancementorz and it was indicated that ' + previousEmployerName + ' was a previous employer. <br> ' + userName + ' has signed a release which is available for viewing on our verification web form. If this is correct, please go to the  <a target="_blank" href="' + URL + '">secure link</a>  and answer the employment verification questions on ' + userName + '.<br>Please call Compliancementorz at 9054861666 or email Driverhiring@compliancementorz.com 9am - 5pm EST. M-FOn behalf of Compliancementorz, thank you in advance for your prompt attention and taking the time to provide employment verification on ' + userName + '.<br>Regards,<br><br>Compliancementorz<br><a href="https://compliancementorz.com" style="text-decoration:none"><img src="https://compliancementorz.com/img/logo.png" width="90" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#fff"></a> <br>Tel: 9054861666<br>E-mail: Driverhiring@compliancementorz.com<br>Web: https://compliancementorz.com/</td></tr><tr><td style="padding:30px;text-align:center;font-size:12px;background-color:#404040;color:#ccc"><p style="margin:0;font-size:14px;line-height:20px">&reg; compliancementorz 2022</p></td></tr></table></td></tr></table></div></body></html>'
           // sendMailRef(to, cc, subject, message, req, res)
            let newDriverEmail = sendMailGrid(to, cc, subject, message, req, res,'verification@compliancementorz.ca')

        }
    }
})



// Reference end

// router.generateReportPageSuperadmin = async (req, res) => {
//     let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
//     res.render('superadmin/generateReportPageSuperadmin', {
//         title: 'Manage generate Report',
//         getCompanydata: getCompanydata
//     });
// };


// router.generateReportPageSuperadmin = async (req, res) => {
//     let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
//     res.render('superadmin/generateReportPageSuperadmin', {
//         title: 'Manage generate Report',
//         getCompanydata: getCompanydata
//     });
// };

//Canada hos code
router.Superadmincanadahosmanual = async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
    res.render('superadmin/Superadmincanadahosmanual', {
        title: 'HOS Questionnaire for Canada SOUTH Regulations',
        getCompanydata: getCompanydata
    });
};
router.Superadmincanadahosmanual = ('/Superadmincanadahosmanual/', async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
	 res.render('superadmin/Superadmincanadahosmanual', {
        title: 'HOS Questionnaire for Canada SOUTH Regulations',
        getCompanydata: getCompanydata
    });
});
router.Superadminusquestionmanual = ('/Superadminusquestionmanual/', async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
	 res.render('superadmin/Superadminusquestionmanual', {
        title: 'Hours of Service Questionnaire: US rule set',
        getCompanydata: getCompanydata
    });
});
router.Superadminorientation_Checklists = ('/Superadminorientation_Checklists/', async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
	 res.render('superadmin/Superadminorientation_Checklists', {
        title: 'Dry Van Checklist',
        getCompanydata: getCompanydata
    });
});
router.Superadmindry_van_Checklists = ('/Superadmindry_van_Checklists/', async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
	 res.render('superadmin/Superadmindry_van_Checklists', {
        title: 'Dump Truck Checklist',
        getCompanydata: getCompanydata
    });
});
router.Superadminflatbed_Checklists = ('/Superadminflatbed_Checklists/', async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
	 res.render('superadmin/Superadminflatbed_Checklists', {
        title: 'Flatbed Checklist',
        getCompanydata: getCompanydata
    });
});
router.Superadminchecklists = ('/Superadminchecklists/', async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
     res.render('superadmin/Superadminchecklists', {
        title: 'Checklists',
        getCompanydata: getCompanydata
    }); 
});
router.Superadmingetchecklists = ('/Superadmingetchecklists/', async (req, res) => {
	console.log(req.body.cmpid);
	let cmp_id = req.body.cmpid;
	let getchecklist = await Companychecklist.findOne({ where: { company_id: cmp_id }, raw: true });
    if (getchecklist) {
        res.json({ status: true, data: getchecklist });
    } else {
        res.json({ status: false });
    }  
});
router.Superadminaddchecklists = ('/Superadminaddchecklists/', async (req, res) => {
    const fData = JSON.parse(JSON.stringify(req.body))
    if (req.body.actionData == 'Update') {
        const fData = JSON.parse(JSON.stringify(req.body));
        console.log(fData);
		
        let Updatechecklist = await Companychecklist.update(fData, {
            where: {
                company_id: fData.company_id
            }
        });
        if (Updatechecklist) {
            res.json({ status: true, message: 'Check Lists Updated' });
        } else {
            res.json({ status: false, message: 'Something went wrong' });
        }
    } else if (req.body.actionData == 'Create') {
        
        const fData = JSON.parse(JSON.stringify(req.body));
         
        let create_checklist = await Companychecklist.create(fData);
        if (create_checklist) {
            res.json({ status: true, message: 'Check Lists Created' });
        } else {
            res.json({ status: false, message: 'Something went wrong' });
        }
    }
});
router.Superadminquiz = ('/Superadminquiz/', async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
     res.render('superadmin/Superadminquiz', {
        title: 'Quiz',
        getCompanydata: getCompanydata
    }); 
});
router.Superadmingetquiz = ('/Superadmingetquiz/', async (req, res) => {
	let cmp_id = req.body.cmpid;
	let getquiz = await Companyquiz.findOne({ where: { company_id: cmp_id }, raw: true });
    if (getquiz) {
        res.json({ status: true, data: getquiz });
    } else {
        res.json({ status: false });
    }  
});
router.Superadminaddquiz = ('/Superadminaddquiz/', async (req, res) => {
    const fData = JSON.parse(JSON.stringify(req.body))
    console.log(fData);
    if (req.body.actionData == 'Update') {
        const fData = JSON.parse(JSON.stringify(req.body));
        console.log(fData);
		
        let Updatequiz = await Companyquiz.update(fData, {
            where: {
                company_id: fData.company_id
            }
        });
        if (Updatequiz) {
            res.json({ status: true, message: 'Quiz Lists Updated' });
        } else {
            res.json({ status: false, message: 'Something went wrong' });
        }
    } else if (req.body.actionData == 'Create') {
        
        const fData = JSON.parse(JSON.stringify(req.body));
         
        let create_quiz = await Companyquiz.create(fData);
        if (create_quiz) {
            res.json({ status: true, message: 'Quiz Created' });
        } else {
            res.json({ status: false, message: 'Something went wrong' });
        }
    }
});
router.deleteReference = ('/deleteReference/', async (req, res) => {
    let driverId = req.body.driverId;
    let deleteData = await Reference.destroy({
        where: { driverId: driverId }
    });
    if (deleteData) {
        res.json({ status: true, message: 'Reference Deleted successfully' });
    } else {
        res.json({ status: false, message: 'Something went wrong' });
    }
});

router.SuperadminweightDimensions = ('/SuperadminweightDimensions/', async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
	 res.render('superadmin/SuperadminweightDimensions', {
        title: 'Weight & Dimensions',
        getCompanydata: getCompanydata
    });
});
router.Superadminsafetylaws = ('/Superadminsafetylaws/', async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
	 res.render('superadmin/Superadminsafetylaws', {
        title: 'Safety Laws Quiz',
        getCompanydata: getCompanydata
    });
});
router.SuperadminMotorVehicleDriverCertificate = ('/SuperadminMotorVehicleDriverCertificate/', async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
	 res.render('superadmin/SuperadminMotorVehicleDriverCertificate', {
        title: 'MOTOR VEHICLE DRIVER’S CERTIFICATION OF VIOLATIONS',
        getCompanydata: getCompanydata
    });
});

router.Superadminanualreview = ('/Superadminanualreview/', async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
	 res.render('superadmin/SuperadminAnnualReview', {
        title: 'ANNUAL REVIEW OF DRIVING RECORD',
        getCompanydata: getCompanydata
    });
});
router.superadminexportcsvdriver =('/superadminexportcsvdriver/',async(req,res)=>{
    const startDate = new Date(req.body.from_date);
const endDate = new Date(req.body.to_date);

let where1 = [];

let getDtls1 = await sequelize.query("SELECT d.id,d.driver_name,d.application_date,c.position,c.phoneCanada,c.phoneUSA,d.email,d.driver_license,d.province,d.license_expiry,c.DOB,d.medical_due_date,d.sin,d.cvor,d.abstract_date,d.psp_date,d.police_clearance_date,d.roadtest_date FROM driver AS d JOIN driverdetails AS c ON c.driverId = d.id  WHERE  STR_TO_DATE(d.application_date, '%d/%m/%Y') >= '"+req.body.from_date+"' and STR_TO_DATE(d.application_date, '%d/%m/%Y') >= '"+req.body.to_date+"'", {

    raw: false, // pass true here if you have any mapped fields

});
let getDtls2 = getDtls1[0];
let getDtls = [];
let emphistories;
let histories = [];
    var headerdata = [];
    await getDtls2.forEach(function (getDetails, i,e1) {

        const isDateBetween = moment(getDtls2[i].application_date, 'DD/MM/YYYY').isBetween(moment(req.body.from_date, 'DD/MM/YYYY'), moment(req.body.to_date, 'DD/MM/YYYY'), 'day', '[]');
        if(isDateBetween){
            console.log('fsdfsd');
            emphistories =  Employementhistroyaddress.findAll({ where: { driverId: getDtls2[i].id }, raw: true });
            console.log('sfddfd'+emphistories);
           
            getDtls.push(getDtls2[i]);
        }
    });
    console.log(getDtls);
    if(req.body.application_date && req.body.application_date!=''){
          headerdata.push({
            id:'application_date',title:'Application Date (dd/mm/yyyy)'
        });
    }
    if(req.body.driver_id && req.body.driver_id!=''){
          headerdata.push({
            id:'id',title:'Driver Id on ELD'
        });
    }
    if(req.body.driver_name && req.body.driver_name!=''){
       headerdata.push({
        id:'driver_name',title:'Driver Name'
        });
    }
    if(req.body.position && req.body.position!=''){
        headerdata.push({
         id:'position',title:'Driver  position'
         });
     }
    if(req.body.phoneCanada && req.body.phoneCanada!=''){
        headerdata.push({
         id:'phoneCanada',title:'Canada Phone'
         });
     }
     if(req.body.phoneUSA && req.body.phoneUSA!=''){
        headerdata.push({
         id:'phoneUSA',title:'US Phone'
         });
     }
     if(req.body.email && req.body.email!=''){
        headerdata.push({
         id:'email',title:'Email'
         });
     }
     if(req.body.driver_license && req.body.driver_license!=''){
        headerdata.push({
         id:'driver_license',title:'Licence No'
         });
     }
     if(req.body.province && req.body.province!=''){
        headerdata.push({
         id:'province',title:'Province'
         });
     }
     if(req.body.license_expiry && req.body.license_expiry!=''){
        headerdata.push({
         id:'license_expiry',title:'Licence Expiry (dd/mm/yyyy)'
         });
     }
     if(req.body.DOB && req.body.DOB!=''){
        headerdata.push({
         id:'DOB',title:'DOB (dd/mm/yyyy)'
         });
     }
     if(req.body.medical_due_date && req.body.medical_due_date!=''){
        headerdata.push({
            id:'medical_due_date',title:'Medical Due Date (dd/mm/yyyy)'
         });
     }
     if(req.body.sin && req.body.sin!=''){
        headerdata.push({
            id:'sin',title:'SIN#'
         });
     }
     if(req.body.cvor && req.body.cvor!=''){
        headerdata.push({
            id:'cvor',title:'CVOR (dd/mm/yyyy)'
         });
     }
     if(req.body.abstract_date && req.body.abstract_date!=''){
        headerdata.push({
            id:'abstract_date',title:'Abstract (dd/mm/yyyy)'
         });
     }
     if(req.body.psp_date && req.body.psp_date!=''){
        headerdata.push({
            id:'psp_date',title:'PSP (dd/mm/yyyy)'
         });
     }
     if(req.body.police_clearance_date && req.body.police_clearance_date!=''){
        headerdata.push({
            id:'police_clearance_date',title:'Police Clearance (dd/mm/yyyy)'
         });
     }
     if(req.body.roadtest_date && req.body.roadtest_date!=''){
        headerdata.push({
            id:'roadtest_date',title:'Roadtest (dd/mm/yyyy)'
         });
     }
   // headerdata = headerdata+"}";
   var myJsonString = JSON.stringify(headerdata);
    const csvWriter = createCsvWriter({
        path: 'output.csv',
        header: headerdata


      });
      console.log(headerdata);
      console.log(myJsonString);
      console.log(startDate);
      
      const filename = 'output.csv';
      csvWriter.writeRecords(getDtls)
        .then(() => {
          // Set the response headers
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

          // Stream the CSV file to the response
          const readStream = fs.createReadStream(filename);
          readStream.pipe(res);
        })
        .catch(error => {
          console.error(error);
          res.status(500).send('Internal Server Error');
        });
});
router.superadmindriverexport = ('/superadmindriverexport/', async (req, res) => {
    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
    // let getCompanydata  = await Driver.findAll({limit: 5,order: [
    //     ['id', 'DESC']
    // ],raw : true});
    
    console.log(getCompanydata);
    res.render('superadmin/driver_export', {
        title: 'Driver Report',
        getCompanydata: getCompanydata
    });
});



module.exports = router;