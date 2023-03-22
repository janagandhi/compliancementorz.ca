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

const Reference = db.reference;
const Hos = db.hos;
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;
const getMonthDifferenceFunction = microServices.getMonthDifference;
const fileUpload = microServices.filedataUpload;
const sendMail = microServices.sendMail;
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
                    // let to = 'mike@ashaviglobal.com';
                    // let cc = 'mike@ashaviglobal.com';
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
                    // let to = 'mike@ashaviglobal.com';
                    let to = getcronOrigin[0][index].companyEmail;
                    let cc = 'mike@ashaviglobal.com';
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
                    // let to = 'mike@ashaviglobal.com';
                    let to = getcronOrigin[0][index].companyEmail;
                    let cc = 'mike@ashaviglobal.com';
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
    let columns = ['id', 'name', 'alert'];
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
            index = index + 1
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
    let columns = ['id', 'driver_id', 'driver_name', 'active'];
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
            index = index + 1
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
       let password = req.body.driver_license + '-' + req.body.driver_name 
        let to = req.body.email
        let userName = req.body.driver_license
        let cc = 'mike@ashaviglobal.com'
        let subject = 'Welcome to new portal'
        let message = '<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width,initial-scale=1"> <meta name="x-apple-disable-message-reformatting"> <title></title> <style>table, td, div, h1, p{font-family: Arial, sans-serif;}@media screen and (max-width: 530px){.unsub{display: block; padding: 8px; margin-top: 14px; border-radius: 6px; background-color: #555555; text-decoration: none !important; font-weight: bold;}.col-lge{max-width: 100% !important;}}@media screen and (min-width: 531px){.col-sml{max-width: 27% !important;}.col-lge{max-width: 73% !important;}}</style></head><body style="margin:0;padding:0;word-spacing:normal;background-color:#939297;"> <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297;"> <table role="presentation" style="width:100%;border:none;border-spacing:0;"> <tr> <td align="center" style="padding:0;"> <table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;"> <tr> <td style="padding:40px 30px 30px 30px;text-align:center;font-size:24px;font-weight:bold;"> <a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="165" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> </td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Hi ' + req.body.driver_name + ',</p> <br><p style="margin:0;">Welcome to new portal <a target="_blank" href="https://compliancementorz.ca/driverLogin"> Click here to Login new portal </a>  <br> Your  User Name: ' + userName + ' <br>  Password :' + password + '</td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Thank you,</p><p style="margin:0;">Safety Department  </p><br><a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="90" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> <p style="margin:0;">Tel: 905-486-1666</p><p style="margin:0;">Web: www.compliancementorz.com</p></td></tr><tr> <td style="padding:30px;text-align:center;font-size:12px;background-color:#404040;color:#cccccc;"> <p style="margin:0;font-size:14px;line-height:20px;">&reg; compliancementorz 2022</p></td></tr></table> </td></tr></table> </div></body></html>'
        let newDriverEmail = sendMail(to, cc, subject, message, req, res)
        // console.log(newDriverEmail);

    }
    

    const fData = JSON.parse(JSON.stringify(req.body))
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
	var req_license		= req.body.driver_license;
	var req_driver_name	= req.body.driver_name;
	var req_password	= req_license.slice(req_license.length - 4) + '-' + req_driver_name.slice(0,3);
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
    let cc = 'mike@ashaviglobal.com'
    let subject = 'Welcome to new portal'
    let message = '<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width,initial-scale=1"> <meta name="x-apple-disable-message-reformatting"> <title></title> <style>table, td, div, h1, p{font-family: Arial, sans-serif;}@media screen and (max-width: 530px){.unsub{display: block; padding: 8px; margin-top: 14px; border-radius: 6px; background-color: #555555; text-decoration: none !important; font-weight: bold;}.col-lge{max-width: 100% !important;}}@media screen and (min-width: 531px){.col-sml{max-width: 27% !important;}.col-lge{max-width: 73% !important;}}</style></head><body style="margin:0;padding:0;word-spacing:normal;background-color:#939297;"> <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297;"> <table role="presentation" style="width:100%;border:none;border-spacing:0;"> <tr> <td align="center" style="padding:0;"> <table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;"> <tr> <td style="padding:40px 30px 30px 30px;text-align:center;font-size:24px;font-weight:bold;"> <a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="165" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> </td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Hi ' + req.body.driver_name + ',</p> <br><p style="margin:0;">Welcome to new portal <a target="_blank" href="https://compliancementorz.ca/driverLogin"> Click here to Login new portal </a>  <br> Your  User Name: ' + userName + ' <br>  Password :' + req.body.password + '</td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Thank you,</p><p style="margin:0;">Safety Department  </p><br><a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="90" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> <p style="margin:0;">Tel: 905-486-1666</p><p style="margin:0;">Web: www.compliancementorz.com</p></td></tr><tr> <td style="padding:30px;text-align:center;font-size:12px;background-color:#404040;color:#cccccc;"> <p style="margin:0;font-size:14px;line-height:20px;">&reg; compliancementorz 2022</p></td></tr></table> </td></tr></table> </div></body></html>'
    let newDriverEmail = sendMail(to, cc, subject, message, req, res)
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
            index = index + 1
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
            index = index + 1
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
        if (req.query.search.value == "") {
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
        where: { company_id: cmpid }
    }
    await Driverdetails.paginate(options).then(function (dt) {
        let data = dt.docs.map(formData);
        // function formData(key) {
        function formData(key, index) {
            index = index + 1
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
    // Search Conditions
    if (req.query.search.value) {
        if (req.query.search.value == "") {
            where.push({
                [Op.or]: [
                    { 'employerName': { [Op.like]: `%` + req.query.search.value + `%` } }
                ]
            });
        } else {
            where.push({ ['employerName']: { [Op.like]: `%` + req.query.search.value + `%` } });
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
        where: { company_id: cmpid },
        include: [{
            model: db.driver,
            as: "d",
            required: false,
            // attributes : ['categories_name'],
            raw: true
        }
        ]
    }
    await Employmenthistory.paginate(options).then(function (dt) {
        let data = dt.docs.map(formData);
        // function formData(key) {
        function formData(key, index) {
            index = index + 1
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
    //Sort array by date
    getDtls.sort(function (a, b) {
        return new Date(a.toDate) - new Date(b.toDate)
    })
    if (getDtls) {
        await getDtls.forEach(function (getDetails, i) {
            // console.log(getDtls);
            driverId = getDetails.driverId;
            company_id = getDetails.company_id;
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
                console.log('prev' + prvTo);
                console.log(getDetails.fromDate);
                gap = getMonthDifferenceFunction(new Date(prvTo), new Date(getDetails.fromDate), req, res)
                gapdata = (gap >= 0) ? 0 : gap
            }
            console.log(getDtls);
            // gap =  getMonthDifferenceFunction(new Date(getDetails.fromDate),new Date(getDetails.toDate), req, res)
            if (gap >= 1 && gap != "undefined") {
                tableData += '<tr style="background-color: #e7000021;"><td>' + getDetails.employerName + '</td><td>' + getDetails.employerAddress + '</td><td>' + getDetails.employerPosition + '</td><td>' + getDetails.employerContactPerson + '</td><td>' + getDetails.employerContactPersonNumber + '</td><td>' + getDetails.employerContactPersonEmail + '</td><td>' + getDetails.jobDesignated + '</td><td>' + getDetails.fmcrs + '</td><td>' + getDetails.fromDate + '</td><td>' + getDetails.toDate + '</td><td>' + gap + '</td><td><a href="javascript:void(0)" data-prvTo=' + prvTo + ' data-currFrom=' + currFrom + ' data-id=' + getDetails.id + ' data-company_id=' + getDetails.company_id + ' data-driverId=' + getDetails.driverId + ' id="addmodalidaddress" class="btn btn-success addmodalclassaddress"<span class="fas fa-edit">Add</span></a></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="editmodalidaddress" class="btn btn-warning editmodalclassaddress"<span class="fas fa-edit"> Edit</span></a></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="deletemodalidaddress" class="btn btn-danger deletemodalclassaddress"<span class="fas fa-edit">Delete</span></a></td></tr>';
                // tableData += '<tr class="gap"><td colspan="9">'+gap+'Gap</td></tr>';
            } else {
                tableData += '<tr><td>' + getDetails.employerName + '</td><td>' + getDetails.employerAddress + '</td><td>' + getDetails.employerPosition + '</td><td>' + getDetails.employerContactPerson + '</td><td>' + getDetails.employerContactPersonNumber + '</td><td>' + getDetails.employerContactPersonEmail + '</td><td>' + getDetails.jobDesignated + '</td><td>' + getDetails.fmcrs + '</td><td>' + getDetails.fromDate + '</td><td>' + getDetails.toDate + '</td><td></td><td></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="editmodalidaddress" class="btn btn-warning editmodalclassaddress"<span class="fas fa-edit"> Edit</span></a></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="deletemodalidaddress" class="btn btn-danger deletemodalclass"<span class="fas fa-edit">Delete</span></a></td></tr>';
            }
        });
        // console.log(driverId);
        console.log(tableData);
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
    // var html = '<div class="card-body" id="updateEmployment_details"> <div style="text-align: center;"> <span> <h3> Motor 11111 Vehicle Drivers Certification of Compliance </h3> </span> </div><br><div class="row"> <div class="col-md-12"> <input type="hidden" name="company_id" id="company_id" value="1"> <input type="hidden" name="driverId" id="driverId" value="840"> <p align="justify">MOTOR CARRIER INSTRUCTIONS: The requirements in Part383 apply to every driver who operates in intrastate, interstate, or foreign commerce and operates a vehicle weighing 26,001 pounds or more, can transport more than 15 people, or transports hazardous materials that require placarding.</p><p align="justify"> The requirements in Part 391 apply to every driver who operates in interstate commerce and operates a vehicle weighing 10,001 pounds or more, can transport more than 15 people, or transports hazardous materials that require placarding. </p><h4> DRIVER REQUIREMENTS:</h4> <p align="justify">Parts 383 and 391 of the Federal Motor Carrier Safety Regulations contain some requirements that you as a driver must comply with. These requirements are in effect as of July 1, 1987. They are as follows: </p><h4>1. POSSESS ONLY ONE LICENSE:</h4> <p align="justify"> You, as a commercial vehicle driver, may not possess more than one license. If you currently have more than one license, you should keep the license from your state of residence and return the additional licenses to the states that issued them. DESTROYING a license does not close the record in the state that issued it; you must notify the state. If a multiple license has been lost, stolen, or destroyed, you should close your record by notifying the state of issuance that you no longer want to be licensed by that state. </p><h4> 2. NOTIFICATION OF LICENSE SUSPENSION, REVOCATION OR CANCELLATION: </h4> <p align="justify"> Sections 392.42 and 383.33 of the Federal Motor Carrier Safety Regulations require that you notify your employer the NEXT BUSINESS DAY of any revocation or suspension of your drivers license. In addition, section 383.31 requires that any time you violate a state or local traffic law (other than parking), you mustreportitwithin30daysto: 1) your employing motor carrier and 2) the state that issued your license (if the violation occurs in a state other than the one which issued your license).The notification to both the employer and state must be in Writing. </p><h4> The following license is the only one I will possess:</h4> <b>Drivers Name (Printed)</b>: mtest1601<br><b>Drivers License No:</b> mtest1601 <br><b>Exp Date:</b> <br><h4></h4>DRIVER CERTIFICATION:<br><b>Drivers Name:</b> mtest1601<br><b>Drivers Signature:</b> <img src="https://www.w3schools.com/images/lamp.jpg" alt="Lamp" width="32" height="32"> <br><b>Date:</b> 07-01-2022 15:42:13<br><input class="form-check-input" id="Iagree" name="Iagree" type="checkbox" value="1"> I certify that I have read and understood the above requirements. </div></div></div>';
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
        if (req.query.search.value == "") {
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
        where: { company_id: cmpid }
    }
    await Driverdetails.paginate(options).then(function (dt) {
        let data = dt.docs.map(formData);
        // function formData(key) {
        function formData(key, index) {
            index = index + 1
            Object.assign(key, {
                slno: index
            });
            console.log(key);
            key.driverId = key.driverId,
                key.company_id = key.company_id,
                key.firstName = key.firstName,
                Object.assign(key, {
                    action: "<a href='javascript:void(0)' data-driverId='" + key.driverId + "'  data-company_id='" + key.company_id + "' id='editmodalid' class='btn  btn-primary editmodalclass'><span class='mdi mdi-account-search'> View HOS Report</span></a>&nbsp;"
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
    // Search Conditions
    if (req.query.search.value) {
        if (req.query.search.value == "") {
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
        where: { company_id: cmpid }
    }
    await Driverdetails.paginate(options).then(function (dt) {
        let data = dt.docs.map(formData);
        // function formData(key) {
        function formData(key, index) {
            index = index + 1
            Object.assign(key, {
                slno: index
            });
            //console.log(key);
            key.driverId = key.driverId,
                key.company_id = key.company_id,
                key.firstName = key.firstName,
                Object.assign(key, {
                    // action: "<a href='javascript:void(0)' data-driverId='" + key.driverId + "'  data-company_id='" + key.company_id + "' id='editmodalid' class='btn  btn-primary editmodalclass'><span class='mdi mdi-account-search'> View Certificates</span></a>&nbsp;"
                    action: "<select class='form-select selectboxcss1' data-driverId='" + key.driverId + "'  data-company_id='" + key.company_id + "' id='pdfGenerate'><option value=''>Select form to export</option><option value='PersonalDetails'>Personal Information</option><option value='employmentHistory'>Employment History</option><option value='drivingHistory'>Driving History</option><option value='motorvehicleCertificate'>Motor Vehicle Certificate</option><option value='medicalDecleration'>Medical Decleration Certificate</option><option value='driverAcknowledgement'>Driver Acknowledgement</option><option value='PSPDisclosure'>PSP Disclosure</option><option value='clearingHouseConsent'>Clearing House Consent</option><option value='compensatedWork'>Compensated Work</option><option value='drugAndAlcohol'>DrugAndAlcohol</option><option value='HOS'>Hos</option><option value='QuestionOne'>Interview Questions</option><option value='QuestionTwo'>Driver Manual</option><option value='Canadahos'>HOS Questionnaire for Canada SOUTH Regulations</option><option value='ushos'>Hours of Service Questionnaire: US rule set</option><option value='All'>All</option></select>"
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
    // Search Conditions
    if (req.query.search.value) {
        if (req.query.search.value == "") {
            where.push({
                [Op.or]: [
                    { 'accidents': { [Op.like]: `%` + req.query.search.value + `%` } }
                ]
            });
        } else {
            where.push({ ['accidents']: { [Op.like]: `%` + req.query.search.value + `%` } });
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
        where: { company_id: cmpid },
        include: [{
            model: db.driver,
            as: "d",
            required: false,
            // attributes : ['categories_name'],
            raw: true
        }
        ]
    }
    await Drivinghistory.paginate(options).then(function (dt) {
        let data = dt.docs.map(formData);
        // function formData(key) {
        function formData(key, index) {
            index = index + 1
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
    // Search Conditions
    if (req.query.search.value) {
        if (req.query.search.value == "") {
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
        where: { company_id: cmpid }
    }
    await Driverdetails.paginate(options).then(function (dt) {
        let data = dt.docs.map(formData);
        // function formData(key) {
        function formData(key, index) {
            index = index + 1
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
                        "<button data-id='" + key.driverId + "' data-company_id='" + key.company_id + "' data-certificateID= 7 id='viewmodaldrugAndAlcohol' class='btn  btn-light'><span class='fas fa-search'> Drug And Alcohol</span></button>"
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
    if (CertificateauthDtls != null) {
        CertificateauthDtlsf = CertificateauthDtls.approve
        certificateDate = CertificateauthDtls.date
        adminSignature = CertificateauthDtls.adminSignature
        certificateIDSixFirtstPrams = CertificateauthDtls.certificateIDSixFirtstPrams
        certificateIDSixSecondPrams = CertificateauthDtls.certificateIDSixSecondPrams
    } else {
        CertificateauthDtlsf = false
        certificateDate = '';
        adminSignature = '';
        certificateIDSixFirtstPrams = '';
        certificateIDSixSecondPrams = '';
    }
    let signature = getDrivinghistory ? getDrivinghistory.signature : '';
    if (getDriverdetails) {
        res.json({ status: true, province: getDriver.province, driverName: getDriver.driver_name, driver_license: getDriver.driver_license, license_expiry: getDriver.license_expiry, getupdatedDate: getDriverdetails.getupdatedDate, signature: signature, companyProvince: getDriverdetails.companyProvince, getupdatedDate: getDrivinghistory ? getDrivinghistory.updatedDate : '', CertificateauthDtls: CertificateauthDtlsf, eventsCalTimezone: getDriverdetails.eventsCalTimezone, dob: getDriverdetails.DOB, companyName: getcmpdtls.name, adminSignature: adminSignature, certificateIDSixFirtstPrams: certificateIDSixFirtstPrams, certificateIDSixSecondPrams: certificateIDSixSecondPrams, certificateDate: certificateDate });
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
    // let getcmpdtls = await Company.findOne({ where: { id: getDriver.company_id }, raw: true });
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
            res.json({ status: true, datas: '<head><title>'+ getDriverdetails.firstName+'_' +pdfGenerate+'</title></head><div id="updateEmployment_details"> <div style=""> <h3 style="text-align: center"> EMPLOYMENT APPLICATION</h3> </div><div style=";margin: 1px;" class="row"> <div> <div style="border: 2px dotted;padding: 5px;" > <h3 style="text-align:center">TO BE READ AND SIGNED BY APPLICANT </h3> <br><p align="justify"> I authorize you to make such investigations and inquiries of my personal, employment, financial or medical history and other related matters as may be necessary in arriving at an employment’ decision.(Generally, inquiries regarding medical history will be made only if and after a conditional offer of employment has been extended.) I here by release employers, schools, health care providers and other persons from all liability in responding to inquiries and releasing information in connection with my application. In the event of employment, I understand that false or misleading information given in my application or interview(s) may result in discharge. I understand also that I am required to abide by all rules and regulations of the Company. I understand that information I provide regarding current and/or previous employers may be used, and those employer(s) will be contacted, for the purpose of investigating my safety performance history as required by 49 CFR 391.23(d) and (e). I understand that I have the right to: Review information provided by previous employers; Have errors in the information corrected by previous employers and for those previous employers to re-send the corrected information to the prospective employer; and Have a rebuttal attached to the alleged erroneous information, if the previous employer(s) and I cannot agree on the accuracy of the information. </p><div> <p align="justify"><b>Signature:</b> <img src="uploads/attachment/drivinghistoryaddressSignature/' + getDrivinghistory.signature + '" id="signature" alt="user" width="150"> </p>  <p align="justify"><b>Driver Name:</b> <span id="">' + getDriverdetails.firstName + '</span></p>   <p align="justify"><b>Date:</b> <span id="">' + getDriverdetails.updatedDate + '</span></p></div></div><div style="break-after:page"></div><div style="border: 2px dotted;padding: 5px;" class="col-md-12"> <h3 style="text-align: center;padding: 30px;"> PERSONAL INFORMATION </h3> <p align="justify"><b>Applicant Name :</b> <span id="firstName">' + getDriverdetails.firstName + '</span> &nbsp;&nbsp;&nbsp; <b>Applicant Middle Name :</b> <span id="middleName">' + getDriverdetails.middleName + '</span> &nbsp;&nbsp;&nbsp; </p><p align="justify"> <b>Applicant Last Name :</b> <span id="lastName">' + getDriverdetails.lastName + '</span> <b>Date of Application :</b> <span id="DOA">' + getDriverdetails.DOA + '</span> &nbsp;&nbsp;&nbsp;</p><p align="justify"> <b>Company Address :</b> <span id="companyAddress">' + getDriverdetails.companyAddress + '</span> &nbsp;&nbsp;&nbsp; <b>Company City :</b> <span id="city">' + getDriverdetails.companyCity + '</span> </p><p align="justify"><b>Company State :</b> <span id="companyState">' + getDriverdetails.companyState + '</span> &nbsp;&nbsp;&nbsp; <b>Company Country :</b> <span id="companyCountry">' + getDriverdetails.companyCountry + '</span> &nbsp;&nbsp;&nbsp; </p><p align="justify"><b>Company Province :</b> <span id="companyProvince">' + getDriverdetails.companyProvince + '</span> <b>Company Postal Code :</b> <span id="companyPostalCode">' + getDriverdetails.companyPostalCode + '</span> &nbsp;&nbsp;&nbsp;</p><p align="justify"><b>Position :</b>&nbsp;&nbsp;&nbsp; <span id="position">' + getDriverdetails.position + '</span> &nbsp;&nbsp;&nbsp; <b>Sin :</b> <span id="sin">' + getDriverdetails.sin + '</span> &nbsp;&nbsp;&nbsp; </p></p><p align="justify"><b>Work Phone Canada :</b> <span id="phoneCanada">' + getDriverdetails.phoneCanada + '</span> &nbsp;&nbsp;&nbsp; <b>Work Phone USA :</b> <span id="phoneUSA">' + getDriverdetails.phoneUSA + '</span> &nbsp;&nbsp;&nbsp; </p><p align="justify"><b>Emergency Contact Name :</b> <span id="emegencyName">' + getDriverdetails.emegencyName + '</span> &nbsp;&nbsp;&nbsp; <b>Emergency Contact :</b> <span id="emegencyContact">' + getDriverdetails.emegencyContact + '</span> &nbsp;&nbsp;&nbsp; </p><p align="justify"> <b>Email :</b> <span id="email">' + getDriverdetails.email + '</span> &nbsp;&nbsp;&nbsp; <b>Date of Birth :</b> <span id="DOB">' + getDriverdetails.DOB + '</span> </p><p align="justify"> <b>Do you have the legal right to work in Canada? :</b> <span id="legalRightyesno">' + getDriverdetails.legalRightyesno + '</span> &nbsp;&nbsp;&nbsp;</p><b>Select Any Option :</b> <span id="legalRight">' + getDriverdetails.legalRight + '</span> &nbsp;&nbsp;&nbsp; <b>Do you have the legal right to enter the United States? :</b> <span id="legalRightUSA">' + getDriverdetails.legalRightUSA + '</span> </p><p align="justify"><b>Have you you registered with the FMCSA Drug &amp; Alcohol Clearinghouse? :</b> <span id="FMCSA">' + getDriverdetails.FMCSA + '</span> &nbsp;&nbsp;&nbsp; <b>Where you referred :</b> <span id="referred">' + getDriverdetails.referred + '</span> &nbsp;&nbsp;&nbsp; </p><p align="justify"><b>Referred by :</b> <span id="referredBy">' + getDriverdetails.referredBy + '</span> &nbsp;&nbsp;&nbsp; <b>Have you ever been bonded :</b> <span id="bonded">' + getDriverdetails.bonded + '</span> &nbsp;&nbsp;&nbsp; </p><p align="justify"> <b>Have you ever been convicted of a felony? :</b> <span id="convicted">' + getDriverdetails.convicted + '</span> <b>Are you a FAST approved driver? :</b> <span id="fastCardyesno">' + getDriverdetails.fastCardyesno + '</span> &nbsp;&nbsp;&nbsp;</p><p align="justify"> <b>Fast Card :</b> <span id="fastCard">' + getDriverdetails.fastCard + '</span> &nbsp;&nbsp;&nbsp; <b>Fastcard Expiry :</b> <span id="fastCardExpiry">' + getDriverdetails.fastCardExpiry + '</span> </p>&nbsp;&nbsp;&nbsp; </p><span><h3></h3></span> <table id="table" class="table table-striped table-bordered" style="border:1px solid black;border-collapse:collapse;"> <thead> <tr> <th style="border:1px solid #000;">Address</th> <th style="border:1px solid #000;">City</th> <th style="border:1px solid #000;">State</th> <th style="border:1px solid #000;">Country</th> <th style="border:1px solid #000;">Province</th> <th style="border:1px solid #000;">PostalCode</th> <th style="border:1px solid #000;">From</th> <th style="border:1px solid #000;">To</th> </thead> <tbody>' + tableData + '</tbody> </table> </div></div></div></div></div>' });

        }
        else {
            res.json({ status: false });
        }
    } else if (pdfGenerate == 'employmentHistory') {
        let getDtls = await Employementhistroyaddress.findAll({ where: { driverId: driverid }, raw: true });
        if (getDtls != null) {

            console.log(getDtls);
            console.log('----------------------------');
            let header = '<head><title>'+ getDriverdetails.firstName+'_' +pdfGenerate+'</title></head><div id=""> <div style="text-align: center;"> <h3>EMPLOYMENT HISTORY</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
            let footer = '</div></div></div></div>';

            if (getDtls.length > 0) {
                await getDtls.forEach(function (getDetails, i) {
                    console.log(i);
                    console.log(getDetails);
                    // tableData += '<tr><td>' + getDetails.employerName + '</td><td>' + getDetails.employerAddress + '</td><td>' + getDetails.employerPosition + '</td><td>' + getDetails.employerContactPerson + '</td><td>' + getDetails.employerContactPersonNumber + '</td><td>' + getDetails.employerContactPersonEmail + '</td><td>' + getDetails.jobDesignated + '</td><td>' + getDetails.fmcrs + '</td><td>' + getDetails.fromDate + '</td><td>' + getDetails.toDate + '</td></tr>';
                    tableData += '<div><p align="justify"><b>Employer Name :</b> <span id="firstName">' + getDetails.employerName + '</span></p><p align="justify"><b>Employer Address :</b> <span id="employerAddress">' + getDetails.employerAddress + '</span></p><p align="justify"><b>Employer Position :</b> <span id="employerPosition">' + getDetails.employerPosition + '</span></p><p align="justify"><b>Employer Contact Person :</b> <span id="employerContactPerson">' + getDetails.employerContactPerson + '</span></p><p align="justify"><b>Employer Contact Person Number :</b> <span id="employerContactPersonNumber">' + getDetails.employerContactPersonNumber + '</span></p><p align="justify"><b>Employer Contact Person Email :</b> <span id="employerContactPersonEmail">' + getDetails.employerContactPersonEmail + '</span></p><p align="justify"><b>Were you subject to the FMCSRS** while employed? :</b> <span id="fmcrs">' + getDetails.fmcrs + '</span></p><p align="justify"><b>Was your job designated as a safety-sensitive function in any name dot-regulated mode <br> subject to the drug and alcohol, testing requirements of 49 cfr part 40? :</b> <span id="jobDesignated">' + getDetails.jobDesignated + '</span></p><p align="justify"><b>From Date :</b> <span id="fromDate">' + getDetails.fromDate + '</span></p><p align="justify"><b>To Date :</b> <span id="toDate">' + getDetails.toDate + '</span></p></div> <hr style=" background-color: #000; height: 2px; border: 0;">';
                    // tableData += '';
                });
            } else {

                tableData += 'No Record Found'
            }
            res.json({ status: true, datas: header + tableData + footer });
        } else {
            res.json({ status: false, datas: '' });
        }


    } else if (pdfGenerate == 'drivingHistory') {
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
            let Drivinghistoryaddress_header = '<div id=""> <div style="text-align: center;"> <h3>DRIVING HISTORY ADDRESS</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
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
            let getdrivingHistoryAccident_header = '<div id=""> <div style="text-align: center;"> <h3>DRIVING HISTORY ACCIDENT</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
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
            let Drivinghistoryviolations_header = '<div id=""> <div style="text-align: center;"> <h3>DRIVING HISTORY VIOLATIONS</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
            let Drivinghistoryviolations_footer = '</div></div></div></div>';
            let DrivinghistoryviolationsData = Drivinghistoryviolations_header + Drivinghistoryviolations_tableData + Drivinghistoryviolations_footer
            // -----------Drivinghistoryviolations-----------------
            // let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
            if (getDrivinghistory) {
                let Formheader = '<head><title>'+ getDriverdetails.firstName+'_' +pdfGenerate+'</title></head><div id=""> <div style="text-align: center;"> <h3>DRIVING HISTORY</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
                let Formbody = '<p align="justify"><b>Have you ever been denied a license, permit or privilege to operate a motor vehicle? :</b> <span id="deniedLicense">' + getDrivinghistory.deniedLicense + '</span></p><p align="justify"><b>Has any license, permit or privilege ever been suspended or revoked? :</b> <span id="licensePermit">' + getDrivinghistory.licensePermit + '</span></p><p align="justify"><b>Driving Experience:</b> <span id="drivingExperience">' + getDrivinghistory.drivingExperience + '</span></p><p align="justify"><b>Class of Equipment :</b> <span id="classofEquipment">' + getDrivinghistory.classofEquipment + '</span></p><p align="justify"><b>Choose Type of Equipment :</b> <span id="equipmentType">' + getDrivinghistory.equipmentType + '</span></p><p align="justify"><b>Start Date:</b> <span id="equipmentStartDate">' + getDrivinghistory.equipmentStartDate + '</span></p><p align="justify"><b>End Date:</b> <span id="equipmentEndDate">' + getDrivinghistory.equipmentEndDate + '</span></p><p align="justify"><b>Approx of Miles / Kms :</b> <span id="aprox">' + getDrivinghistory.aprox + '</span></p><p align="justify"><b>List provinces & states operated in for last five years :</b> <span id="listProvinces">' + getDrivinghistory.listProvinces + '</span></p><p align="justify"><b>List courses and training other then as shown elsewhere in this application:</b> <span id="listCourses">' + getDrivinghistory.listCourses + '</span></p><p align="justify"><b>Education: Last school Attended:</b> <span id="education">' + getDrivinghistory.education + '</span></p><br><img src="uploads/attachment/drivinghistoryaddressSignature/' + getDrivinghistory.signature + '" id="signature" alt="user" width="150">'
                let Formfooter = '</div></div></div></div>';
                let Form = Formheader + Formbody + Formfooter
                res.json({ status: true, datas: Form + Drivinghistoryaddres + getdrivingHistoryAccident + DrivinghistoryviolationsData });
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
                let Formheader = '<head><title>'+ getDriverdetails.firstName+'_' +pdfGenerate+'</title></head><div id=""> <div style="text-align: center;"> <h3>MOTOR VEHICLE DRIVER’s CERTIFICATION</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
                let Formbody = '<p align="justify">MOTOR CARRIER INSTRUCTIONS: The requirements in Part383 apply to every driver who operates in intrastate, interstate, or foreign commerce and operates a vehicle weighing 26,001 pounds or more, can transport more than 15 people, or transports hazardous materials that require placarding.<br>The requirements in Part 391 apply to every driver who operates in interstate commerce and operates a vehicle weighing 10,001 pounds or more, can transport more than 15 people, or transports hazardous materials that require placarding.</p><h3>DRIVER REQUIREMENTS:</h3><p align="justify">Parts 383 and 391 of the Federal Motor Carrier Safety Regulations contain some requirements that you as a driver must comply with. These requirements are in effect as of July 1, 1987. They are as follows:</p><h3>1. POSSESS ONLY ONE LICENSE:</h3><p align="justify">You, as a commercial vehicle driver, may not possess more than one license. If you currently have more than one license, you should keep the license from your state of residence and return the additional licenses to the states that issued them. DESTROYING a license does not close the record in the state that issued it; you must notify the state. If a multiple license has been lost, stolen, or destroyed, you should close your record by notifying the state of issuance that you no longer want to be licensed by that state.</p><h3>2. NOTIFICATION OF LICENSE SUSPENSION, REVOCATION OR CANCELLATION:</h3><p align="justify">Sections 392.42 and 383.33 of the Federal Motor Carrier Safety Regulations require that you notify your employer the NEXT BUSINESS DAY of any revocation or suspension of your driver’s license. In addition, section 383.31 requires that any time you violate a state or local traffic law (other than parking), you mustreportitwithin30daysto: 1) your employing motor carrier and 2) the state that issued your license (if the violation occurs in a state other than the one which issued your license).The notification to both the employer and state must be in Writing.</p><h3>The following license is the only one I will possess:</h3><p align="justify"><b>Driver’s Name:</b> <span id="driverName">' + getDriver.driver_name + '</span></p><p align="justify"><b>Driver’s License No:</b> <span id="driver_license">' + getDriver.driver_license + '</span></p><p align="justify"><b>Exp Date :</b> <span id="license_expiry">' + getDriver.license_expiry + '</span></p><p align="justify"><b>DRIVER CERTIFICATION: I certify that I have read and understood the above requirements.</p><p align="justify"><b>Drivers Signature:</b> <span id="equipmentEndDate">' + ImagesAttachment + '</span></p><p align="justify"><b>Date:</b> <span id="getupdatedDate">' + certificateDate + '</span></p>'
                let Formfooter = '</div></div></div></div>';
                let Form = Formheader + Formbody + Formfooter
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
                let Formheader = '<head><title>'+ getDriverdetails.firstName+'_' +pdfGenerate+'</title></head><div style=""></div><div id=""> <div style="text-align: center;"> <h3>MEDICAL DECLERATION CERTIFICATION</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
                let Formbody = '<p align="justify">On March 3rd, 1999 Transport Canada and the US federal Highway administration (FHWA) entered into a reciprocal agreement regarding the physical requirements for a Canadian drivers of a commercial vehicle in the US, as currently contained in the federal Motor carriers safety regulation, part 391.41 et seq, and vice-versa, the reciprocal agreement will remove the requirements for a Canadian driver to carry a copy of a medical examiners certificate indicating that the driver is physically qualified to drive (In effect, the existence of a valid driver’s license issued by the province of on is deemed to be proof that a driver is physically qualified to drive in US) however, FHWA will not recognize an on license if the driver has certain medical conditions and those conditions would prohibit them from driving in the US.</p><p align="justify">I certify that I am qualified to operate a commercial vehicle in the United States. I further certify that:</p><p align="justify">A) I have no clinical diagnosis of diabetes currently requiring insulin for control</p><p align="justify">B) I have no established medical history or clinical diagnosis of epilepsy</p><p align="justify">C) I don’t have impaired hearing (A driver must be able to first perceive a forced whispered voice in the better ear at not less than 5 feet with or without the use of a hearing aid, or does not have an average hearing loss in the better ear greater than 40 decibels at 500 Hz, 100 Hz, or 200 Hz with or without a hearing aid when tested by an audiometric device calibrated to American National Standard Z24.5-1951)</p><p align="justify">D) I have not been issued a waiver by the province of on allowing me to operate a commercial motor vehicle pursuant to section 20 or 22 of the on regulation 340/94.</p><p align="justify">I further agree to inform Auto Fill Company Name from 1st Page should my medical status change, or if I can no longer certify conditions A to D, described above.</p><p align="justify"><b>Driver’s Name:</b> <span id="driverName">' + getDriver.driver_name + '</span></p><p align="justify"><b>Drivers Signature:</b> <span id="equipmentEndDate">' + ImagesAttachment + '</span></p><p align="justify"><b>Date:</b> <span id="getupdatedDate">' + certificateDate + '</span></p>'
                let Formfooter = '</div></div></div></div>';
                let Form = Formheader + Formbody + Formfooter
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
                let Formheader = '<head><title>'+ getDriverdetails.firstName+'_' +pdfGenerate+'</title></head><div style=""></div><div id=""> <div style="text-align: center;"> <h3> DRIVER ACKNOWLEDGEMENT</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
                let Formbody = '<p align="justify"> I ' + getDriver.driver_name + ' have been explained and I understand it is illegal to Falsify in logbooks and I have to log all time markers (e.g., Tolls, border crossing, fuel times etc.) Properly and exactly as per ' + getDriverdetails.eventsCalTimezone + '</p><p align="justify">If any falsification in my logs is found while auditing by company, I agree that I will be subjected to fines and penalties</p><p align="justify">Fines and penalties will be determined by safety and compliance officer looking into number of counts and difference of hours.</p><p align="justify"><b>Driver’s Name:</b> <span id="driverName">' + getDriver.driver_name + '</span></p><p align="justify"><b>Drivers Signature:</b> <span id="equipmentEndDate">' + ImagesAttachment + '</span></p><p align="justify"><b>Date:</b> <span id="getupdatedDate">' + certificateDate + '</span></p>'
                let Formfooter = '</div></div></div></div>';
                let Form = Formheader + Formbody + Formfooter
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
                let Formheader = '<head><title>'+ getDriverdetails.firstName+'_' +pdfGenerate+'</title></head><div style=""></div><div id=""> <div style="text-align: center;"> <h3>PSP DISCLOSURE</h3> </div><div style=";margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
                let Formbody = '<h3><center>REGARDING BACKGROUND REPORTS FROM THE PSP ONLINE SERVICE</center></h3><p align="justify">In connection with your application for employment with ' + getcmpdtls.name + ' its employees, agents or contractors may obtain one or more reports regarding your driving, and safety inspection history from the Federal Motor Carrier Safety Administration (FMCSA).</p><p align="justify">When the application for employment is submitted in person, if the Prospective Employer uses any information it obtains from FMCSA in a decision to not hire you or to make any other adverse employment decision regarding you, the Prospective Employer will provide you with a copy of the report upon which its decision was based and a written summary of your rights under the Fair Credit Reporting Act before taking any final adverse action. If any final adverse action is taken against you based upon your driving history or safety report, the Prospective Employer will notify you that the action has been taken and that the action was based in part or in whole on this report</p><p align="justify">When the application for employment is submitted by mail, telephone, computer, or other similar means, if the Prospective Employer uses any information it obtains from FMCSA in a decision to not hire you or to make any other adverse employment decision regarding you, the Prospective Employer must provide you within three business days of taking adverse action oral, written or electronic notification: that adverse action has been taken based in whole or in part on information obtained from FMCSA; the name, address, and the toll free telephone number of FMCSA; that the FMCSA did not make the decision to take the adverse action and is unable to provide you the specific reasons why the adverse action was taken; and that you may, upon providing proper identification, request a free copy of the report and may dispute with the FMCSA the accuracy or completeness of any information or report. If you request a copy of a driver record from the Prospective Employer who procured the report, then, within 3 business days of receiving your request, together with proper identification, the Prospective Employer must send or provide to you a copy of your report and a summary of your rights under the Fair Credit Reporting Act.</p><p align="justify">Neither the Prospective Employer nor the FMCSA contractor supplying the crash and safety information has the capability to correct any safety data that appears to be incorrect. You may challenge the accuracy of the data by submitting a request to https://dataqs.fmcsa.dot.gov. If you challenge crash or inspection information reported by a State, FMCSA cannot change or correct this data. Your request will be forwarded by the DataQs system to the appropriate State for adjudication</span></p><p align="justify">Any crash or inspection in which you were involved will display on your PSP report. Since the PSP report does not report, or assign, or imply fault, it will include all Commercial Motor Vehicle (CMV) crashes where you were a driver or co-driver and where those crashes were reported to FMCSA, regardless of fault. Similarly, all inspections, with or without violations, appear on the PSP report. State citations associated with Federal Motor Carrier Safety Regulations (FMCSR) violations that have been adjudicated by a court of law will also appear, and remain, on a PSP report.</span></p><p align="justify">The Prospective Employer cannot obtain background reports from FMCSA without your authorization</span></p><h3><center>AUTHORIZATION</center></h3><p align="justify">If you agree that the Prospective Employer may obtain such background reports, please read the following and sign below: I authorize ' + getcmpdtls.name + ' to access the FMCSA Pre-Employment Screening Program (PSP) system to seek information regarding my commercial driving safety record and information regarding my safety inspection history. I understand that I am authorizing the release of safety performance information including crash data from the previous five (5) years and inspection history from the previous three (3) years. I understand and acknowledge that this release of information may assist the Prospective Employer to make a determination regarding my suitability as an employee.</p><p align="justify">I further understand that neither the Prospective Employer nor the FMCSA contractor supplying the crash and safety information has the capability to correct any safety data that appears to be incorrect. I understand I may challenge the accuracy of the data by submitting a request to https://dataqs.fmcsa.dot.gov. If I challenge crash or inspection information reported by a State, FMCSA cannot change or correct this data. I understand my request will be forwarded by the DataQs system to the appropriate State for adjudication</p><p align="justify">I understand that any crash or inspection in which I was involved will display on my PSP report. Since the PSP report does not report, or assign, or imply fault, I acknowledge it will include all CMV crashes where I was a driver or co-driver and where those crashes were reported to FMCSA, regardless of fault. Similarly, I understand all inspections, with or without violations, will appear on my PSP report, and State citations associated with FMCSR violations that have been adjudicated by a court of law will also appear, and remain, on my PSP report.</p><p align="justify">I have read the above Disclosure Regarding Background Reports provided to me by Prospective Employer and I understand that if I sign this Disclosure and Authorization, Prospective Employer may obtain a report of my crash and inspection history. I hereby authorize Prospective Employer and its employees, authorized agents, and/or affiliates to obtain the information authorized above.</p><p align="justify"><b>Date:</b> <span id="getupdatedDate">' + certificateDate + '</span></p><p align="justify"><b>Drivers Signature:</b> <span id="">' + ImagesAttachment + '</span></p><p align="justify"><b>Drivers Name:</b> ' + getDriver.driver_name + '</p> <p style="padding: 20px;" align="justify"> <input class="form-check-input" id="Iagree" name="Iagree" type="checkbox" value="1" checked="checked" disabled="disabled">I certify that I have read and understood the above requirements.</p><p align="justify">NOTICE: This form is made available to monthly account holders by NIC on behalf of the U.S. Department of Transportation, Federal Motor Carrier Safety Administration (FMCSA). Account holders are required by federal law to obtain an Applicant’s written or electronic consent prior to accessing the Applicant’s PSP report. Further, account holders are required by FMCSA to use the language contained in this Disclosure and Authorization form to obtain an Applicant’s consent. The language must be used in whole, exactly as provided. Further, the language on this form must exist as one stand-alone document. The language may NOT be included with other consent forms or any other language.</p><p align="justify">NOTICE: The prospective employment concept referenced in this form contemplatesthe definition of “employee” contained at 49 C.F.R. 383.5.</p>'
                let Formfooter = '</div></div></div></div>';
                let Form = Formheader + Formbody + Formfooter
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
            let adminattachmentpath = "uploads/attachment/clearHouseSupervisor/" + adminSignature;
            if (adminSignature) {
                adminImagesAttachment = '<img id="signature" alt="user" width="150" src="' + adminattachmentpath + '">';
            } else {
                adminImagesAttachment = '';
            }
            if (driverid) {
                let Formheader = '<head><title>'+ getDriverdetails.firstName+'_' +pdfGenerate+'</title></head><div style=""></div><div id=""> <div style="text-align: center;"> <h3>CLEARING HOUSE CONSENT</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
                let Formbody = '<h3><center>SCHEDULE “A” “1”THE COMMERCIAL DRIVER’S LICENSE DRUG AND ALCOHOL CLEARINGHOUSE CONSENT FORM</center></h3>(TO BE EXECUTED BY ALL EMPLOYEES AND APPLICANTS WHO ARE OFFERED EMPLOYMENT)<p align="justify">1. I understand that as a condition of employment, or continued employment, with the Company, I must register with the Commercial Driver’s License Drug and Alcohol Clearinghouse at clearinghouse.fmcsa.dot.gov and I must grant electronic consent for the Company to run a full Pre-Employment Query on my record with the Clearinghouse.</p><p align="justify">2. I understand that a full Pre-Employment Query includes assessing the following specific records:</p><p align="justify">a. A verified positive, adulterated, or substituted controlled substances test result;</p><p align="justify">b. An alcohol confirmation test with a concentration of 0.04 or higher;</p><p align="justify">c. An employer’s report of actual knowledge, meaning that the employer directly observed the employee’s use of alcohol or controlled substances while on duty;</p><p align="justify">d. On duty alcohol use, meaning an employer has actual knowledge that an employeehas used alcohol while performing safety sensitive functions; e. Pre-duty alcohol use, meaning that an employer has actual knowledge that anemployee has used alcohol within 4 hours of performing safety sensitive functions;</p><p align="justify">f. Alcohol use following an accident, unless 8 hours have passed following the accident or until a post accident alcohol test is conducted, whichever occurs first;</p><p align="justify">g. Controlled substance use, meaning that no driver shall used a controlled substance while performing a safety sensitive function unless a licensed medical practitioner who is familiar with the driver’s medical history has advised the driver that the substance will not adversely affect the driver’s ability to safely operate a commercial motor vehicle;</p><p align="justify">h. A SAP report of the successful completion of the return-to-duty process;</p><p align="justify">i. A negative return-to-duty test; and</p><p align="justify">j. A SAP report of the successful completion of follow-up testing.</p><p align="justify">3. I understand that I cannot perform a safety sensitive function for the Company if my Clearinghouse record indicates a violation as listed in Part 2 above unless/until I have completed the SAP evaluation, referral and education/treatment process as described in this Policy. Page 29 INITIALS J S JASMEET SINGH My signature below confirms that I have read and understood the above terms and that I agree to abide by them.</p><p align="justify"></p><p align="justify"><b>Date this at:</b> <span id="getupdatedDate">' + certificateDate + '</span></p><p align="justify"><b>Printed Name of Employee as it appears on DL</b> ' + getDriver.driver_name + '</p><p align="justify"><b>Driver’s License No:</b> ' + getDriver.driver_license + ' <b>Province:</b> ' + getDriver.province + '</p><p align="justify"><b>Employee Date of Birth:</b> ' + getDriverdetails.DOB + '</p><p align="justify"><b>Drivers Signature:</b> <span id="">' + ImagesAttachment + '</span></p><p align="justify"><b>Supervisor Signature:</b> <span id="">' + adminImagesAttachment + '</span></p> <p style="padding: 20px;" align="justify">      <input class="form-check-input" id="Iagree" name="Iagree" type="checkbox" value="1" checked="checked" disabled="disabled">I certify that I have read and understood the above requirements.   </p>   <p align="justify">NOTICE: This form is made available to monthly account holders by NIC on behalf of the U.S. Department of Transportation, Federal Motor Carrier Safety Administration (FMCSA). Account holders are required by federal law to obtain an Applicant’s written or electronic consent prior to accessing the Applicant’s PSP report. Further, account holders are required by FMCSA to use the language contained in this Disclosure and Authorization form to obtain an Applicant’s consent. The language must be used in whole, exactly as provided. Further, the language on this form must exist as one stand-alone document. The language may NOT be included with other consent forms or any other language.</p><p align="justify">NOTICE: The prospective employment concept referenced in this form contemplatesthe definition of “employee” contained at 49 C.F.R. 383.5.</p><h3><center>SCHEDULE “A” “2”THE COMMERCIAL DRIVER’S LICENSE DRUG AND ALCOHOL CLEARINGHOUSE ANNUAL CONSENT FORM FOR LIMITED QUERIE</center></h3><center>(TO BE EXECUTED BY ALL CURRENT EMPLOYEES AND ALL APPLICANTS WHO ARE OFFERED EMPLOYMENT)</center><p align="justify">My signature below confirms that I agree to allow the Company or their representative, Denning Health Group, to conduct an Annual Limited Query on my record with the Commercial Driver’s License (CDL) Drug and Alcohol Clearinghouse. I understand that a Limited Query will not reveal any of the details of my record with the Clearinghouse.</p><p align="justify">Furthermore, I understand that, if the Limited Query reveals that the Clearinghouse has information on me indicating that I have been in violation, I must immediately register with the Clearinghouse at clearinghouse.fmcsa.dot.gov and grant permission for the Company or their representative to run a Full Query on my record with the Clearinghouse. I understand that the Company or their representative must run the Full Query within 24 hours of receiving the results of the Limited Query indicating a violation on my part.</p><p align="justify">I agree that, if I fail to register with the Clearinghouse within 24 hours, I will be removed from safety sensitive functions until the Company or their representative is able to conduct the Full Query and the results confirm that my record contains no violations as outlined in this Policy.</p><p align="justify">I agree that, if my record with the Clearinghouse reveals that I have engaged in prohibited conduct (i.e. a violation) as outlined in this Policy or the DOT rules, I will be removed from safety sensitive functions until/unless I have completed the SAP evaluation, referral and education/treatment process as described in this Policy.</p><p align="justify">I understand that, if any information is added to my Clearinghouse record within the 30-day period immediately following the Company’s or their representative’s Query on me, the Company will be notified by the Federal Motor Carrier Safety Administration (FMCSA).</p><p align="justify">My signature below confirms that I have read and understood the above terms and that I grant permission for an Annual Limited Query on my record with the Commercial Driver’s License Drug and Alcohol Clearinghouse for the duration of my employment with the Company.</p><p align="justify"><b>Date this at:</b> <span id="getupdatedDate">' + certificateDate + '</span></p><p align="justify"><b>Printed Name of Employee as it appears on DL</b> ' + getDriver.driver_name + '</p><p align="justify"><b>Driver’s License No:</b> ' + getDriver.driver_license + ' <b>Province:</b> ' + getDriver.province + '</p><p align="justify"><b>Employee Date of Birth:</b> ' + getDriverdetails.DOB + '</p><p align="justify"><b>Drivers Signature:</b> <span id="">' + ImagesAttachment + '</span></p><p align="justify"><b>Supervisor Signature:</b> <span id="">' + adminImagesAttachment + '</span></p> <p style="padding: 20px;" align="justify">  <input class="form-check-input" id="Iagree" name="Iagree" type="checkbox" value="1" checked="checked" disabled="disabled">I certify that I have read and understood the above requirements.</p>'
                let Formfooter = '</div></div></div></div>';
                let Form = Formheader + Formbody + Formfooter
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
                let Formheader = '<head><title>'+ getDriverdetails.firstName+'_' +pdfGenerate+'</title></head><div style=""></div><div id=""> <div style="text-align: center;"> <h3>COMPENSATED WORK</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
                let Formbody
                if (CertificateauthDtls) {
                    Formbody = '<h3><center>Driver Certification for Other Compensated Work</center></h3><p align="justify">When employed by a motor carrier, a driver must report to the carrier all on-duty time including time working for other employers. The definition of on-duty time found in Section 395.2 paragraphs (8) and (9) of the Federal Motor Carrier Safety Regulations includes time performing any other work in the capacity of, or in the employer or service of, acommon, contract or private motor carrier, also performing any compensated work for any non-motor carrier entity.</p><p align="justify"><b>Are you currently working for another employer</b> <span id="certificateIDSixFirtstPrams">' + certificateIDSixFirtstPrams + '</span></p><p align="justify"><b>Currently do have your intent to work for another employer while still employed by this company?</b> <span id="certificateIDSixSecondPrams">' + certificateIDSixSecondPrams + '</span></p><p align="justify"><b>Date this at:</b> <span id="getupdatedDate">' + certificateDate + ' at ' + getDriverdetails.companyProvince + '</span></p><p align="justify"><b>Drivers Signature:</b> <span id="">' + ImagesAttachment + '</span></p>'

                } else {
                    Formbody = '';
                }

                let Formfooter = '</div></div></div></div>';
                let Form = Formheader + Formbody + Formfooter
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
                let Formheader = '<head><title>'+ getDriverdetails.firstName+'_DrugAndAlcohol</title></head><div style=""></div><div id=""> <div style="text-align: center;"> <h3>DRUG AND ALCOHOL</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
                let Formbody = '<h3><center>Review and Sign Consent - Consent to Previous Employment + Drug & Alcohol History Verification</center></h3><p align="justify">I, ' + getDriver.driver_name + ', am applying for employment at ' + getcmpdtls.name + '.  (my "Potential Employer") and want to provide my consent for only this application l agree that my Potential Employer and its service provider,Compliance Mentroz ("Service Provider”), may contact all my former employers to conduct a reference and driving safety check that includes the collection and assessment of information about my dates of employment, employment status, job duties and driving experience, reason for leaving, job performance and incident/accident record.</p><p align="justify">I agree that my Potential Employer and its Service Provider may contact all organizations who have issued educational awards or credentials that I have identified to confirm my awards and credentials.</p><p align="justify">I understand that Service Provider retains employment history records on behalf of anumber of employers in the trucking industry. I agree that Service Provider, on behalf of my Potential Employer, may check these records to confirm my employment history and conduct a reference and driving safety check that includes an assessment of my dates of employment, employment status, job duties and driving experience, reason for leaving, job performance and incident/accident record.</p><p align="justify">I agree that that my Potential Employer and Service Provider may use and disclose my personal information as required for the above-noted purposes and agree that each of the organizations that are contacted for the above-noted purposes may disclose information to either my Potential Employer or its Service Provider. Iwill not hold my Potential Employer or Service Provider or said organizations liable for this disclosure.</p><p align="justify">I agree that Service Provider may retain all personal information it collects for the above-noted purposes on behalf of my Potential Employer, who shall contro! and have a full right of access to records of my personal information that Service Provider creates and retains. I will not hold Service Provider liable for any losses arising out of its retention or handling of my personal information.</p><p align="justify">I understand that I have the right to (1) to review the information provided by previous employers, (2) have errors corrected and re-submitted by previous employers and (3) have a rebuttal statement attached to information I allege to be erroneous if my previous employer and I cannot agree on the accuracy of information.</p><p align="justify">l understand that I may direct any questions I have about this consent and about how Service Provider handles personal information on behalf of my Potential Employer to Compliance Mentroz. at driverhiring@compliancementorz.com or by phone at +1 (905) 486-1666</p><p align="justify">I certify that this application was completed by me and that all entries on it and information in it are true and complete to the best of my knowledge. I understand that any misstatement or omission of information in this application may result in my dismissal.</p><p align="justify">I hereby authorize release of information from my Department of Transportation regulated drug and alcohol testing records by my previous employer, to the prospective employer named below and /or its service provider Compliance Mentroz. This release is in accordance with DOT Regulation 49 CFR Part 40, Section 40.25. I understand that information to be released by my previous employer, is limited to the following DOT-regulated testing items:</p><p align="justify"> 1.Alcohol tests with a result of 0.04 or higher: </p><p align="justify"> 2.Verified positive drug tsts; </p><p align="justify"> 3.Refusals to be tested; </p><p align="justify"> 4.Other violations of DOT agency drug and alcohol testing regulations; </p><p align="justify"> Information obtained from previous employers of a drug and alcohol rule violation; </p><p align="justify"> Documentation,if any,of completion of the return-to-duty process following a rule violation. </p><p align="justify"><b>Date this at:</b> <span id="certificateDate">' + certificateDate + ' at ' + getDriverdetails.companyProvince + '</span></p><p align="justify"><b>Driver Name</b> ' + getDriver.driver_name + '</p><p align="justify"><b>Drivers Signature:</b> <span id="">' + ImagesAttachment + '</span></p>'
                let Formfooter = '</div></div></div></div>';
                let Form = Formheader + Formbody + Formfooter
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
            let Formheader = '<head><title>'+ getDriverdetails.firstName+'_' +pdfGenerate+'</title></head><div style=""></div><div id=""> <div style="text-align: center;"> <h3>HOS</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
            let Formbody = '<div class="col-md-12"><center><i style="font-size:50px" class="mdi mdi-clock-fast"></i><br><h3>Statement of Hours of Service</h3></center><p align="justify">New Hires, Contractors, Casual &amp; Temporary Employees</p><hr><b>Name:</b><span id="driverName">' + driverName + '</span><hr><div class="row"><div class="col-md-4"><b>Drivers Licence Number:</b><span id="driver_license">' + driver_license + '</span></div><div class="col-md-4"><b>Class of License:</b><span id="getDrivinghistoryprovince">' + getDrivinghistoryaddressprovince + '</span></div><div class="col-md-4"><b>Issuing Province:</b><span id="getDrivinghistorylicense">' + getDrivinghistoryaddresslicense + '</span></div></div><hr><p align="justify">Section 81. (2)(c) The motor carrier maintains accurate and legible records showing, for each day, the drivers duty status and elected cycle, the hour at which each duty status begins and ends and the total number of hours spent in each status and keeps those records for a minimum period of 6 months after the day on which they were recorded. Section 84. No driver who is required to fill out a daily log shall drive and no motor carrier shall request, require or allow the driver to drive unless the driver has in their possession (a) a copy of the daily logs for the preceding 14 days and, in the case of a driver driving under an oil well service permit, for each of the required 3 periods of 24 consecutive hours of off-duty time in any period of 24 days; (b) the daily log for the current day, completed up to the time at which the last change in the driver’s duty status occurred;<br></p><div class="row"><div class="col-md-7"><b><input class="form-check-input" id="Iagree" name="Iagree" type="checkbox" value="1" checked="checked" disabled="disabled"> I hereby certify that the information given below is correct to the best of my knowledge and belief,and that I was last relieved from work at:</b></div><div class="col-md-3"><span id="hosdurationData">' + hosdurationData + '</span><br>On<br><span id="hosdateData">' + hosdateData + '</span></div></div><hr>INSTRUCTIONS: Day 1 is the day before you first begin work for this motor carrier. The dates have been pre-filled based on todays date. If you need to change the DAY 1 date, Click here<br><br><div class="row"><b>Selected Date :</b><span id="hosselectedDate">' + hosselectedDate + '</span></div><br><div style="width:100%" class="container1"></div><br><div style="text-align:left"><b>Employee Signature:</b> ' + signature + '<br><div><b>Name:</b><span id="driverName">' + driverName + '</span></div><br><div><b>Drivers Licence Number:</b><span id="driver_license">' + driver_license + '</span><br></div><br><div><b>Date:</b><span id="hoscreatedAt">' + hoscreatedAt + '</span><br></div></div></div>'
            let Formfooter = '</div></div></div></div>';
            let Form = Formheader + Formbody + Formfooter
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
            let Formheader = '<head><title>'+ getDriverdetails.firstName+'_InterviewQuestions</title></head><div id=""> <div> <h3 style="text-align:center">Interview Questions</h3> </div><div style="text-align: center2;margin: 1px;padding: 5px;" class="row"> <div style="padding: 5px;" class="col-md-12">';
            let Formbody = '<div class="card-body" id=""><div style="text-align:center"><span><h4></h4></span></div><br><div class=""><div class=""><b>Name of Driver :</b><span id="driverName">' + driverName + '</span><br><b>License No :</b><span id="driver_license">' + driver_license + '</span><br><br><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px"><label for="question1" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">1. What are your strengths as a driver?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question1 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px;"><label for="question2" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">2. Why are you looking for a job?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question2 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px;"><label for="question3" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">3. Why did you choose to approach our company?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question3 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px;"><label for="question4" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">4. Can you provide references from your current or previous employers or we can verify it? Please provide contact details.</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question4 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px;"><label for="question5" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">5. If you have any preferred area to haul loads and why?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question5 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px;"><label for="question6" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">6. What training do you think you will require doing this job?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question6 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px;"><label for="question7" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">7. What would your current employer have to do to make you stay?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question7 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px;"><label for="question8" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">8. Tell me how you handled a problem with a dispatcher / customer?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question8 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px;"><label for="question9" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">9. Tell me about the last roadside inspection you had and where?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question9 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px;"><label for="question10" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">10. If you ever had problem at the border? If yes explain.</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question10 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px;"><label for="question11" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">11. If you have a previous collision / citation, tell me about it and what you would do different now?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question11 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;padding-top:10px;padding-bottom:10px;"><label for="question12" class="col-sm-6 control-label col-form-label" style="width:100%;float:left;">12. Did you receive remedial training from the collision / citation? If answer to above is yes.</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongroupone.question12 + '</span></div></div><br><div class="row" style="margin-bottom:1rem;width:100%;float:left;"><div class="col-md-6" style="width:50%;float:left;"><b>Drivers Signature :</b>' + signature + '</div> <div class="col-md-6" style="width:50%;float:left;"><b>Name of the Interviewer :</b><span>' + getQuestiongroupone.interviewer + '</span></div></div></div></div>'
            let Formfooter = '</div></div></div>';
            let Form = Formheader + Formbody + Formfooter
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
            for(i=0;i<32;i++){
                if(right_wrongs[i] == '1'){
                    right_wrongs[i] = 'Yes';
                }
                else{
                    right_wrongs[i] = 'No';
                }
            }
            var wrong  = parseInt(32) - parseInt(getQuestiongrouptwo.result);
            let Formheader = '<head><title>'+ getDriverdetails.firstName+'_DriverManual'+'</title></head><div id=""> <div style="text-align: center;"> <h3>Driver Manual</h3> </div><div style="text-align: center2;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
            let Formbody = '<div class="card-body" id=""><div style="text-align:center"><span><h4></h4></span></div><br><div class=""><div class=""><div style="width:100%;float:left"><div style="width:75%;float:left"><b>Name of Driver :</b><span id="driverName">' + driverName + '</span></div>';
			if(getQuestiongrouptwo.approveStatus==0){
				Formbody += '<div style="width:25%;float:left"><b>Result : No Result</b></div></div><br><br><br>';
			}
			else{
				Formbody += '<div style="width:25%;float:left"><b>Result : </b><b style="margin-left:10px;"> Right : </b> <span id="vans_right">'+getQuestiongrouptwo.result+'</span><b style="margin-left:10px;"> Wrong : </b><span id="vans_wrong">'+wrong+'</span></div></div><br><br><br>';
			}
			Formbody += '<div class="form-group row" style="margin-bottom:2rem;"><label for="question1" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q1. In the event a driver receives a speed infraction what are the disciplinary action will be taken?</label><div class="col-md-12"  style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question1 + '</span></div></div><br><div class="form-group row"  style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[0] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question2" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q2. How many duty cycles are available? What are they?</label><div class="col-md-12"  style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question2 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[1] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question3" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q3. What is preventable Accident?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question3 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[2] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question4" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q4. What are the basic causes of an accidents?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question4 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[3] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question5" class="col-sm-12 control-label col-form-label" style="width:50%;float:left;">Q5. What is securing the scene?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question5 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[4] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question6" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q6. Am I allowed to drive a vehicle above the speed of 105 Km/H?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question6 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[5] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question7" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q7. Am I allowed to disconnect dash cams while on duty or off duty?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question7 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[6] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question8" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q8. Am I allowed take less rest to cover the destination quickly?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question8 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[7] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question9" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q9. What is cargo securement?.</label><div class="col-md-12" style="width:50%;float:left;"><span>' + getQuestiongrouptwo.question9 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[8] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question10" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q10. Am I allowed to drive entire 14 hours during 14 hours on duty time?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question10 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[9] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question11" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q11. How many hours can I drive during 14 hours of on duty time?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question11 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[10] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question12" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q12. How many hours of off duty is required in 16 hours working window?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question12 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[11] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question13" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q13. What is the minimum time for a rest break?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question13 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[12] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question14" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q14. Can I switch cycle?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question14 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[13] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question15" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q15. What is Cycle reset?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question15 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[14] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question16" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q16. What is the limit of personal conveyance?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question16 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[15] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question17" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q17. What if I exceed the limit of personal conveyance?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question17 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[16] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question18" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q18. Am I allowed to split Sleeper Berth times into 2?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question18 + '</span></div></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[17] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question19" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q19. Am I allowed to drive a motor vehicle without doing a PTI?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question19 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[18] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question20" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q20. What are the checks needs to be done in a pre‐trip inspection?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question20 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[19] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question21" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q21. Can a driver drive the vehicle with a passenger?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question21 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[20] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question22" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q22. What is an unsafe act?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question22 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[21] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question23" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q23. What is jackknifing?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question23 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[22] + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question24" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q24. Why accident reporting is necessary?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question24 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[23] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question25" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q25. What are information required post accident?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question25 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[24] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question26" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q26. Is it wise to accept guilt at the accident spot?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question26 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[25] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question27" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q27. What is social media policy?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question27 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:100%;float:left;"><span>' + right_wrongs[26] + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question28" class="col-sm-12 control-label col-form-label" style="width:50%;float:left;">Q28. What is Highway traffic act (HTA)?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question28 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[27] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question29" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q29. What is C‐ TPAT procedure?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question29 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[28] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question30" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q30. What is President’s Safety Award?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question30 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question30 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[29] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question31" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q31. What is Accident Reporting & Investigation Policy?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question31 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[30] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question32" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q32. What are the accident investigation procedure?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question32 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[31] + '</span></div></div></div></div>'
            let Formfooter = '</div></div></div>';
            let Form = Formheader + Formbody + Formfooter
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
            let Formheader = '<head><title>'+ getDriverdetails.firstName+'_canadahos'+'</title></head><div id=""> <div style="text-align: center;"> <h3>HOS Questionnaire for Canada South Regulations</h3> </div><div style="text-align: center2;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
            let Formbody = '<div class="card-body" id=""><div style="text-align:center"><span><h4></h4></span></div><br><div class=""><div class=""><div style="width:100%;float:left"><div style="width:50%;float:left"><b>Name of Driver :</b><span id="driverName">' + driverName + '</span></div>';
			if(getCanadahos.approveStatus==0){
				Formbody += '<div style="width:50%;float:left"><b>Result : No Result</b></div></div><br><br><br>';
			}
			else{
				Formbody += '<div style="width:50%;float:left"><b>Result : </b><span id="vans_wrong">'+percentage.toFixed(2)+'%-'+getCanadahos.result+' out of 15</span></div></div><br><br><br>';
			}
            Formbody += '<div style="width:100%;float:left"><b>Licence :</b><span id="driverlicence">' + driver_license + '</span></div>';
			Formbody += '<div class="form-group row" style="margin-bottom:2rem;"><label for="question1" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">1. The Canada South rule states that a driver may be on duty for maximum14 hours before he/she:</label><div class="col-md-12"  style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question1=='takes a 8-hour break'){
                Formbody += '<span style="color:green">' + getCanadahos.question1 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question1 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>takes a 8-hour break';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question2" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">2. If you are driving a bobtail, you can use personal conveyance to pick up a loaded trailer</label><div class="col-md-12"  style="width:100%;float:left;">Selected Answer: ';
            if(getCanadahos.question2=='False'){
                Formbody += '<span style="color:green">' + getCanadahos.question2 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question2 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>False';
            }
            Formbody +=' </div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question3" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">3. As per Canadian South HOS regulation, A driver can make Yard move</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer: ';
            if(getCanadahos.question3=='only when on duty'){
                Formbody += '<span style="color:green">' + getCanadahos.question3 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question3 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>only when on duty';
            }
            Formbody +=' </div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question4" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">4. As per Canada South HOS regulation, A driver has to take a minimum ___ hours off  in a day.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question4=='10'){
                Formbody += '<span style="color:green">' + getCanadahos.question4 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question4 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>10';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question5" class="col-sm-12 control-label col-form-label" style="width:50%;float:left;">5. The Sum of which two duty status are taken into account, to calculate your 70 hours of total on duty time in 7 days?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question5=='Driving and on duty other than driving'){
                Formbody += '<span style="color:green">' + getCanadahos.question6 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question6 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>Driving and on duty other than driving';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question6" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">6. In Canada, a driver can defer 2 hours off duty to next day</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question6=='Driving and on duty other than driving'){
                Formbody += '<span style="color:green">' + getCanadahos.question6 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question6 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>True';
            }
            Formbody += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question7" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">7. While driving with a co-driver,</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question7=='All of the above'){
                Formbody += '<span style="color:green">' + getCanadahos.question7 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question7 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>All of the above';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question8" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">8. Your logbook should always be updated till</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question8=='Last change of duty status'){
                Formbody += '<span style="color:green">' + getCanadahos.question8 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question8 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>Last change of duty status';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question9" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">9. The 16th hour of a shift can be calculated by excluding, more than 2 hours off duty taken by , which is at least 10 hours  when added to next of duty period.</label><div class="col-md-12" style="width:50%;float:left;">Selected Answer:  ';
            if(getCanadahos.question9=='False'){
                Formbody += '<span style="color:green">' + getCanadahos.question9 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question9 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>False';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question10" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">10. A driver has take 24 hrs off in any 14 days?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question10=='True'){
                Formbody += '<span style="color:green">' + getCanadahos.question10 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question10 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>True';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question11" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">11. How many hours of reset time  is required to change from 120 hours /14 days cycle to 70 hours/7 days cycle?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question11=='72'){
                Formbody += '<span style="color:green">' + getCanadahos.question11 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question11 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>72';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question12" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">12. Pre trip inspection of a vehicle needs to be done at least once in every 24 hours.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question12=='True'){
                Formbody += '<span style="color:green">' + getCanadahos.question12 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question12 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>True';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question13" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">13. In Canada, A driver can drive maximum 13 hours ,</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question13=='Both b& c'){
                Formbody += '<span style="color:green">' + getCanadahos.question13 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question13 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>Both b& c';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question14" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">14. As per Canadian South HOS regulation,  if a driver can take less than 30 minutes off duty to complete his mandatory 10 hours off duty in a day</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question14=='False'){
                Formbody += '<span style="color:green">' + getCanadahos.question14 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question14 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>False';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question15" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">15. A  driver driving within 160 km radious, is exempted from HOS rules</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
            if(getCanadahos.question15=='False'){
                Formbody += '<span style="color:green">' + getCanadahos.question15 + '</span>';
            }
            else{
                Formbody += '<span style="color:red">' + getCanadahos.question15 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>False';
            }
            Formbody +='</div></div><br><hr style="width:100%"><br></div></div>';
            let Formfooter = '</div></div></div>';
            let Form = Formheader + Formbody + Formfooter
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
            let Formheader = '<head><title>'+ getDriverdetails.firstName+'_canadahos'+'</title></head><div id=""> <div style="text-align: center;"> <h3>Hours of Service Questionnaire: US rule set</h3> </div><div style="text-align: center2;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
            let Formbody = '<div class="card-body" id=""><div style="text-align:center"><span><h4></h4></span></div><br><div class=""><div class=""><div style="width:100%;float:left"><div style="width:50%;float:left"><b>Name of Driver :</b><span id="driverName">' + driverName + '</span></div>';
			if(getushos.approveStatus==0){
				Formbody += '<div style="width:50%;float:left"><b>Result : No Result</b></div></div><br><br><br>';
			}
			else{
				Formbody += '<div style="width:50%;float:left"><b>Result : </b><b style="margin-left:10px;"> Right : </b> <span id="vans_right">'+getushos.result+'</span><b style="margin-left:10px;"> Wrong : </b><span id="vans_wrong">'+wrong+'</span><b style="margin-left:10px;"> Percentage : </b><span id="vans_wrong">'+percentage.toFixed(2)+'%</span></div></div><br><br><br>';
			}
			Formbody += '<div class="form-group row" style="margin-bottom:2rem;"><label for="question1" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">1. Which of the following would be recorded as on duty not driving:</label><div class="col-md-12"  style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos.question1 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question2" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">2. If a driver is taking split sleeper (2+8) in USA, it must be recorded on:</label><div class="col-md-12"  style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos.question2 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question3" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">3. A commercial driver can use personal conveyance to drive if his/her driving time is exhausted and he is 10 minutes away from destination.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos.question3 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question4" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">4. A  Canadian driver can do Yard move on a road with red lights in US</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos.question4 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question5" class="col-sm-12 control-label col-form-label" style="width:50%;float:left;">5. A driver can go for 30 min On-duty not driving, after 8 hours driving in US</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos.question5 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question6" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">6. In a snow storm, a driver can extend his shift to 16 hours and drive time to 13 hours in US, if:</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos.question6 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question7" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">7. A driver can use personal conveyance while crossing the border.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos.question7 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question8" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">8. Fuelling can be done in</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos.question8 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question9" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">9. A Canadian Driver has driven 12 hours in Canada, when he reached Sarina.</label><div class="col-md-12" style="width:50%;float:left;">Selected Answer:  <span style="color:green">' + getushos.question9 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question10" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">10. It is mandatory to certify all the logs.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos.question10 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question11" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">11. Yard move can be used during</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos.question11 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question12" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">12. How many hours of rest required after 14 hours of on duty in USA.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos.question12 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question13" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">13. If the ELD stops working when the driver is on a trip, the driver should</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos.question13 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question14" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">14. In the United States, how long are you permitted to use paper logs after an ELD malfunction?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos.question14 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question15" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">15. If a driver has adopted 14/120 cycle in Canada, he can go to US without resetting his cycle.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos.question15 + '</span></div></div><br><hr style="width:100%"><br></div></div>'
            let Formfooter = '</div></div></div>';
            let Form = Formheader + Formbody + Formfooter
            res.json({ status: true, datas: Form });
        }
        else {
            res.json({ status: false });
        }
        // -----------Ushos end -----------------
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
        let PersonalDetailsData = '<head><title>'+ getDriverdetails1.firstName+'All'+'</title></head><div id="updateEmployment_details"> <div style=""> <h3 style="text-align: center"> EMPLOYMENT APPLICATION</h3> </div><div style=";margin: 1px;" class="row"> <div> <div style="border: 2px dotted;padding: 5px;" > <h3 style="text-align:center">TO BE READ AND SIGNED BY APPLICANT </h3> <br><p align="justify"> I authorize you to make such investigations and inquiries of my personal, employment, financial or medical history and other related matters as may be necessary in arriving at an employment’ decision.(Generally, inquiries regarding medical history will be made only if and after a conditional offer of employment has been extended.) I here by release employers, schools, health care providers and other persons from all liability in responding to inquiries and releasing information in connection with my application. In the event of employment, I understand that false or misleading information given in my application or interview(s) may result in discharge. I understand also that I am required to abide by all rules and regulations of the Company. I understand that information I provide regarding current and/or previous employers may be used, and those employer(s) will be contacted, for the purpose of investigating my safety performance history as required by 49 CFR 391.23(d) and (e). I understand that I have the right to: Review information provided by previous employers; Have errors in the information corrected by previous employers and for those previous employers to re-send the corrected information to the prospective employer; and Have a rebuttal attached to the alleged erroneous information, if the previous employer(s) and I cannot agree on the accuracy of the information. </p><div> <p align="justify"><b>Signature:</b> <img src="uploads/attachment/drivinghistoryaddressSignature/' + getDrivinghistory1.signature + '" id="signature" alt="user" width="150"> </p> <p align="justify"><b>Driver Name:</b> <span id="">' + getDriverdetails1.firstName + '</span></p> <p align="justify"><b>Date:</b> <span id="">' + getDriverdetails1.updatedDate + '</span></p></div></div><div style="break-after:page"></div><div style="border: 2px dotted;padding: 5px;" class="col-md-12"> <h3 style="text-align: center;padding: 30px;"> PERSONAL INFORMATION </h3> <p align="justify"><b>Applicant Name :</b> <span id="firstName">' + getDriverdetails1.firstName + '</span> &nbsp;&nbsp;&nbsp; <b>Applicant Middle Name :</b> <span id="middleName">' + getDriverdetails1.middleName + '</span> &nbsp;&nbsp;&nbsp; </p><p align="justify"> <b>Applicant Last Name :</b> <span id="lastName">' + getDriverdetails1.lastName + '</span> <b>Date of Application :</b> <span id="DOA">' + getDriverdetails1.DOA + '</span> &nbsp;&nbsp;&nbsp;</p><p align="justify"> <b>Company Address :</b> <span id="companyAddress">' + getDriverdetails1.companyAddress + '</span> &nbsp;&nbsp;&nbsp; <b>Company City :</b> <span id="city">' + getDriverdetails1.companyCity + '</span> </p><p align="justify"><b>Company State :</b> <span id="companyState">' + getDriverdetails1.companyState + '</span> &nbsp;&nbsp;&nbsp; <b>Company Country :</b> <span id="companyCountry">' + getDriverdetails1.companyCountry + '</span> &nbsp;&nbsp;&nbsp; </p><p align="justify"><b>Company Province :</b> <span id="companyProvince">' + getDriverdetails1.companyProvince + '</span> <b>Company Postal Code :</b> <span id="companyPostalCode">' + getDriverdetails1.companyPostalCode + '</span> &nbsp;&nbsp;&nbsp;</p><p align="justify"><b>Position :</b>&nbsp;&nbsp;&nbsp; <span id="position">' + getDriverdetails1.position + '</span> &nbsp;&nbsp;&nbsp; <b>Sin :</b> <span id="sin">' + getDriverdetails1.sin + '</span> &nbsp;&nbsp;&nbsp; </p></p><p align="justify"><b>Work Phone Canada :</b> <span id="phoneCanada">' + getDriverdetails1.phoneCanada + '</span> &nbsp;&nbsp;&nbsp; <b>Work Phone USA :</b> <span id="phoneUSA">' + getDriverdetails1.phoneUSA + '</span> &nbsp;&nbsp;&nbsp; </p><p align="justify"><b>Emergency Contact Name :</b> <span id="emegencyName">' + getDriverdetails1.emegencyName + '</span> &nbsp;&nbsp;&nbsp; <b>Emergency Contact :</b> <span id="emegencyContact">' + getDriverdetails1.emegencyContact + '</span> &nbsp;&nbsp;&nbsp; </p><p align="justify"> <b>Email :</b> <span id="email">' + getDriverdetails1.email + '</span> &nbsp;&nbsp;&nbsp; <b>Date of Birth :</b> <span id="DOB">' + getDriverdetails1.DOB + '</span> </p><p align="justify"> <b>Do you have the legal right to work in Canada? :</b> <span id="legalRightyesno">' + getDriverdetails1.legalRightyesno + '</span> &nbsp;&nbsp;&nbsp;</p><b>Select Any Option :</b> <span id="legalRight">' + getDriverdetails1.legalRight + '</span> &nbsp;&nbsp;&nbsp; <b>Do you have the legal right to enter the United States? :</b> <span id="legalRightUSA">' + getDriverdetails1.legalRightUSA + '</span> </p><p align="justify"><b>Have you you registered with the FMCSA Drug &amp; Alcohol Clearinghouse? :</b> <span id="FMCSA">' + getDriverdetails1.FMCSA + '</span> &nbsp;&nbsp;&nbsp; <b>Where you referred :</b> <span id="referred">' + getDriverdetails1.referred + '</span> &nbsp;&nbsp;&nbsp; </p><p align="justify"><b>Referred by :</b> <span id="referredBy">' + getDriverdetails1.referredBy + '</span> &nbsp;&nbsp;&nbsp; <b>Have you ever been bonded :</b> <span id="bonded">' + getDriverdetails1.bonded + '</span> &nbsp;&nbsp;&nbsp; </p><p align="justify"> <b>Have you ever been convicted of a felony? :</b> <span id="convicted">' + getDriverdetails1.convicted + '</span> <b>Are you a FAST approved driver? :</b> <span id="fastCardyesno">' + getDriverdetails1.fastCardyesno + '</span> &nbsp;&nbsp;&nbsp;</p><p align="justify"> <b>Fast Card :</b> <span id="fastCard">' + getDriverdetails1.fastCard + '</span> &nbsp;&nbsp;&nbsp; <b>Fastcard Expiry :</b> <span id="fastCardExpiry">' + getDriverdetails1.fastCardExpiry + '</span> </p>&nbsp;&nbsp;&nbsp; </p><span><h3></h3></span> <table id="table" class="table table-striped table-bordered" style="border:1px solid black;border-collapse:collapse;"> <thead> <tr> <th style="border:1px solid #000;">Address</th> <th style="border:1px solid #000;">City</th> <th style="border:1px solid #000;">State</th> <th style="border:1px solid #000;">Country</th> <th style="border:1px solid #000;">Province</th> <th style="border:1px solid #000;">PostalCode</th> <th style="border:1px solid #000;">From</th> <th style="border:1px solid #000;">To</th> </thead> <tbody>' + tableData + '</tbody> </table> </div></div></div></div></div>'

        //employment histroy
        let getEmployementhistroyaddress = await Employementhistroyaddress.findAll({ where: { driverId: driverid }, raw: true });
        let tableDataemploymentHistory = '';
        // if (getEmployementhistroyaddress) {

        //     await getEmployementhistroyaddress.forEach(function (getEmployementhistroyaddressLoop, i) {
        //         tableDataemploymentHistory = '<div><p align="justify"><b>Employer Name :</b> <span id="firstName">' + getEmployementhistroyaddressLoop.employerName + '</span></p><p align="justify"><b>Employer Address :</b> <span id="employerAddress">' + getEmployementhistroyaddressLoop.employerAddress + '</span></p><p align="justify"><b>Employer Position :</b> <span id="employerPosition">' + getEmployementhistroyaddressLoop.employerPosition + '</span></p><p align="justify"><b>Employer Contact Person :</b> <span id="employerContactPerson">' + getEmployementhistroyaddressLoop.employerContactPerson + '</span></p><p align="justify"><b>Employer Contact Person Number :</b> <span id="employerContactPersonNumber">' + getEmployementhistroyaddressLoop.employerContactPersonNumber + '</span></p><p align="justify"><b>Employer Contact Person Email :</b> <span id="employerContactPersonEmail">' + getEmployementhistroyaddressLoop.employerContactPersonEmail + '</span></p><p align="justify"><b>Were you subject to the FMCSRS** while employed? :</b> <span id="fmcrs">' + getEmployementhistroyaddressLoop.fmcrs + '</span></p><p align="justify"><b>Was your job designated as a safety-sensitive function in any name dot-regulated mode <br> subject to the drug and alcohol, testing requirements of 49 cfr part 40? :</b> <span id="jobDesignated">' + getEmployementhistroyaddressLoop.jobDesignated + '</span></p><p align="justify"><b>From Date :</b> <span id="fromDate">' + getEmployementhistroyaddressLoop.fromDate + '</span></p><p align="justify"><b>To Date :</b> <span id="toDate">' + getEmployementhistroyaddressLoop.toDate + '</span></p></div>';
        //     });
        // }
        // else {
        //     tableDataemploymentHistory = "No Record Found"
        // }




        if (getEmployementhistroyaddress != null ) {
            await getEmployementhistroyaddress.forEach(function (getDetails, i) {
                console.log(i);
                console.log(getDetails);
                tableDataemploymentHistory += '<div><p align="justify"><b>Employer Name :</b> <span id="firstName">' + getDetails.employerName + '</span></p><p align="justify"><b>Employer Address :</b> <span id="employerAddress">' + getDetails.employerAddress + '</span></p><p align="justify"><b>Employer Position :</b> <span id="employerPosition">' + getDetails.employerPosition + '</span></p><p align="justify"><b>Employer Contact Person :</b> <span id="employerContactPerson">' + getDetails.employerContactPerson + '</span></p><p align="justify"><b>Employer Contact Person Number :</b> <span id="employerContactPersonNumber">' + getDetails.employerContactPersonNumber + '</span></p><p align="justify"><b>Employer Contact Person Email :</b> <span id="employerContactPersonEmail">' + getDetails.employerContactPersonEmail + '</span></p><p align="justify"><b>Were you subject to the FMCSRS** while employed? :</b> <span id="fmcrs">' + getDetails.fmcrs + '</span></p><p align="justify"><b>Was your job designated as a safety-sensitive function in any name dot-regulated mode <br> subject to the drug and alcohol, testing requirements of 49 cfr part 40? :</b> <span id="jobDesignated">' + getDetails.jobDesignated + '</span></p><p align="justify"><b>From Date :</b> <span id="fromDate">' + getDetails.fromDate + '</span></p><p align="justify"><b>To Date :</b> <span id="toDate">' + getDetails.toDate + '</span></p></div> <hr style=" background-color: #000; height: 2px; border: 0;">';
                
            });
        } else {

            tableDataemploymentHistory += 'No Record Found'
        }


        let header = '<div id=""> <div style="text-align: center;"> <h3>EMPLOYMENT HISTORY</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
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
        let Drivinghistoryaddress_header = '<div style="break-after:page"></div><div id=""> <div style="text-align: center;"> <h3>DRIVING HISTORY ADDRESS</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
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
        let getdrivingHistoryAccident_header = '<div style="break-after:page"></div><div id=""> <div style="text-align: center;"> <h3> DRIVING HISTORY ACCIDENT</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
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
        let Drivinghistoryviolations_header = '<div style="break-after:page"></div><div id=""> <div style="text-align: center;"> <h3>DRIVING HISTORY VIOLATIONS</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
        let Drivinghistoryviolations_footer = '</div></div></div></div>';
        let DrivinghistoryviolationsData = Drivinghistoryviolations_header + Drivinghistoryviolations_tableData + Drivinghistoryviolations_footer
        // -----------Drivinghistoryviolations-----------------
        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
        let getDrivinghistoryData
        if (getDrivinghistory) {
            let Formheader = '<div style="break-after:page"></div><div id=""> <div style="text-align: center;"> <h3>DRIVING HISTORY</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
            let Formbody = '<p align="justify"><b>Have you ever been denied a license, permit or privilege to operate a motor vehicle? :</b> <span id="deniedLicense">' + getDrivinghistory.deniedLicense + '</span></p><p align="justify"><b>Has any license, permit or privilege ever been suspended or revoked? :</b> <span id="licensePermit">' + getDrivinghistory.licensePermit + '</span></p><p align="justify"><b>Driving Experience:</b> <span id="drivingExperience">' + getDrivinghistory.drivingExperience + '</span></p><p align="justify"><b>Class of Equipment :</b> <span id="classofEquipment">' + getDrivinghistory.classofEquipment + '</span></p><p align="justify"><b>Choose Type of Equipment :</b> <span id="equipmentType">' + getDrivinghistory.equipmentType + '</span></p><p align="justify"><b>Start Date:</b> <span id="equipmentStartDate">' + getDrivinghistory.equipmentStartDate + '</span></p><p align="justify"><b>End Date:</b> <span id="equipmentEndDate">' + getDrivinghistory.equipmentEndDate + '</span></p><p align="justify"><b>Approx of Miles / Kms :</b> <span id="aprox">' + getDrivinghistory.aprox + '</span></p><p align="justify"><b>List provinces & states operated in for last five years :</b> <span id="listProvinces">' + getDrivinghistory.listProvinces + '</span></p><p align="justify"><b>List courses and training other then as shown elsewhere in this application:</b> <span id="listCourses">' + getDrivinghistory.listCourses + '</span></p><p align="justify"><b>Education: Last school Attended:</b> <span id="education">' + getDrivinghistory.education + '</span></p><br><img src="uploads/attachment/drivinghistoryaddressSignature/' + getDrivinghistory.signature + '" id="signature" alt="user" width="150">'
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
        let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: driverid, certificateID: 6 }, raw: true });
        //    console.log(3);
        let getcmpdtls = await Company.findOne({ where: { id: getDriver.company_id }, raw: true });
        let CertificateauthDtlsf;
        let certificateIDSixFirtstPrams;
        let adminSignature;
        let certificateIDSixSecondPrams;
        let certificateDate;
        let adminImagesAttachment
        CertificateauthDtlsf = CertificateauthDtls ? CertificateauthDtls.approve : ""
        certificateDate = CertificateauthDtls ? CertificateauthDtls.date : ""
        
        certificateIDSixFirtstPrams = CertificateauthDtls ? CertificateauthDtls.certificateIDSixFirtstPrams : ""
        certificateIDSixSecondPrams = CertificateauthDtls ? CertificateauthDtls.certificateIDSixSecondPrams : ""
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

        Formheader = '<div style="break-after:page"></div><div id=""> <div style="text-align: center;"> <h3>MOTOR VEHICLE DRIVER’s CERTIFICATION</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
        let Formbody = '<p align="justify">MOTOR CARRIER INSTRUCTIONS: The requirements in Part383 apply to every driver who operates in intrastate, interstate, or foreign commerce and operates a vehicle weighing 26,001 pounds or more, can transport more than 15 people, or transports hazardous materials that require placarding.<br>The requirements in Part 391 apply to every driver who operates in interstate commerce and operates a vehicle weighing 10,001 pounds or more, can transport more than 15 people, or transports hazardous materials that require placarding.</p><h3>DRIVER REQUIREMENTS:</h3><p align="justify">Parts 383 and 391 of the Federal Motor Carrier Safety Regulations contain some requirements that you as a driver must comply with. These requirements are in effect as of July 1, 1987. They are as follows:</p><h3>1. POSSESS ONLY ONE LICENSE:</h3><p align="justify">You, as a commercial vehicle driver, may not possess more than one license. If you currently have more than one license, you should keep the license from your state of residence and return the additional licenses to the states that issued them. DESTROYING a license does not close the record in the state that issued it; you must notify the state. If a multiple license has been lost, stolen, or destroyed, you should close your record by notifying the state of issuance that you no longer want to be licensed by that state.</p><h3>2. NOTIFICATION OF LICENSE SUSPENSION, REVOCATION OR CANCELLATION:</h3><p align="justify">Sections 392.42 and 383.33 of the Federal Motor Carrier Safety Regulations require that you notify your employer the NEXT BUSINESS DAY of any revocation or suspension of your driver’s license. In addition, section 383.31 requires that any time you violate a state or local traffic law (other than parking), you mustreportitwithin30daysto: 1) your employing motor carrier and 2) the state that issued your license (if the violation occurs in a state other than the one which issued your license).The notification to both the employer and state must be in Writing.</p><h3>The following license is the only one I will possess:</h3><p align="justify"><b>Driver’s Name:</b> <span id="driverName">' + getDriver.driver_name + '</span></p><p align="justify"><b>Driver’s License No:</b> <span id="driver_license">' + getDriver.driver_license + '</span></p><p align="justify"><b>Exp Date :</b> <span id="license_expiry">' + getDriver.license_expiry + '</span></p><p style="padding: 20px;" align="justify"><b>DRIVER CERTIFICATION: I certify that I have read and understood the above requirements.</p><p align="justify"><b>Drivers Signature:</b> <span id="equipmentEndDate">' + ImagesAttachment + '</span></p><p align="justify"><b>Date:</b> <span id="getupdatedDate">' + certificateDate + '</span></p>'
        Formfooter = '</div></div></div></div>';
        let motorvehicleCertificateData = Formheader + Formbody + Formfooter
        //Medical decleration
        Formheader = '<div style="break-after:page"></div><div id=""> <div style="text-align: center;"> <h3>MEDICAL DECLERATION CERTIFICATION</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
        Formbody = '<p align="justify">On March 3rd, 1999 Transport Canada and the US federal Highway administration (FHWA) entered into a reciprocal agreement regarding the physical requirements for a Canadian drivers of a commercial vehicle in the US, as currently contained in the federal Motor carriers safety regulation, part 391.41 et seq, and vice-versa, the reciprocal agreement will remove the requirements for a Canadian driver to carry a copy of a medical examiners certificate indicating that the driver is physically qualified to drive (In effect, the existence of a valid driver’s license issued by the province of on is deemed to be proof that a driver is physically qualified to drive in US) however, FHWA will not recognize an on license if the driver has certain medical conditions and those conditions would prohibit them from driving in the US.</p><p align="justify">I certify that I am qualified to operate a commercial vehicle in the United States. I further certify that:</p><p align="justify">A) I have no clinical diagnosis of diabetes currently requiring insulin for control</p><p align="justify">B) I have no established medical history or clinical diagnosis of epilepsy</p><p align="justify">C) I don’t have impaired hearing (A driver must be able to first perceive a forced whispered voice in the better ear at not less than 5 feet with or without the use of a hearing aid, or does not have an average hearing loss in the better ear greater than 40 decibels at 500 Hz, 100 Hz, or 200 Hz with or without a hearing aid when tested by an audiometric device calibrated to American National Standard Z24.5-1951)</p><p align="justify">D) I have not been issued a waiver by the province of on allowing me to operate a commercial motor vehicle pursuant to section 20 or 22 of the on regulation 340/94.</p><p align="justify">I further agree to inform Auto Fill Company Name from 1st Page should my medical status change, or if I can no longer certify conditions A to D, described above.</p><p align="justify"><b>Driver’s Name:</b> <span id="driverName">' + getDriver.driver_name + '</span></p><p align="justify"><b>Drivers Signature:</b> <span id="equipmentEndDate">' + ImagesAttachment + '</span></p><p align="justify"><b>Date:</b> <span id="getupdatedDate">' + certificateDate + '</span></p>'
        Formfooter = '</div></div></div></div>';
        let medicaldeclerationData = Formheader + Formbody + Formfooter
        //driverAcknowledgement
        let FormheaderdriverAcknowledgement = '<div style="break-after:page"></div><div id=""> <div style="text-align: center;"> <h3> DRIVER ACKNOWLEDGEMENT</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
        Formbody = '<p align="justify"> I ' + getDriver.driver_name + ' have been explained and I understand it is illegal to Falsify in logbooks and I have to log all time markers (e.g., Tolls, border crossing, fuel times etc.) Properly and exactly as per ' + getDriverdetails.eventsCalTimezone + '</p><p align="justify">If any falsification in my logs is found while auditing by company, I agree that I will be subjected to fines and penalties</p><p align="justify">Fines and penalties will be determined by safety and compliance officer looking into number of counts and difference of hours.</p><p align="justify"><b>Driver’s Name:</b> <span id="driverName">' + getDriver.driver_name + '</span></p><p align="justify"><b>Drivers Signature:</b> <span id="equipmentEndDate">' + ImagesAttachment + '</span></p><p align="justify"><b>Date:</b> <span id="getupdatedDate">' + certificateDate + '</span></p>'
        Formfooter = '</div></div></div></div>';
        let driverAcknowledgementData = FormheaderdriverAcknowledgement + Formbody + Formfooter
        //PSPDisclouse
        Formheader = '<div id=""> <div style="text-align: center;"> <h3>PSP DISCLOSURE</h3> </div><div style="margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
        Formbody = '<h3><center>REGARDING BACKGROUND REPORTS FROM THE PSP ONLINE SERVICE </center></h3><p align="justify">In connection with your application for employment with ' + getcmpdtls.name + ' its employees, agents or contractors may obtain one or more reports regarding your driving, and safety inspection history from the Federal Motor Carrier Safety Administration (FMCSA).</p><p align="justify">When the application for employment is submitted in person, if the Prospective Employer uses any information it obtains from FMCSA in a decision to not hire you or to make any other adverse employment decision regarding you, the Prospective Employer will provide you with a copy of the report upon which its decision was based and a written summary of your rights under the Fair Credit Reporting Act before taking any final adverse action. If any final adverse action is taken against you based upon your driving history or safety report, the Prospective Employer will notify you that the action has been taken and that the action was based in part or in whole on this report</p><p align="justify">When the application for employment is submitted by mail, telephone, computer, or other similar means, if the Prospective Employer uses any information it obtains from FMCSA in a decision to not hire you or to make any other adverse employment decision regarding you, the Prospective Employer must provide you within three business days of taking adverse action oral, written or electronic notification: that adverse action has been taken based in whole or in part on information obtained from FMCSA; the name, address, and the toll free telephone number of FMCSA; that the FMCSA did not make the decision to take the adverse action and is unable to provide you the specific reasons why the adverse action was taken; and that you may, upon providing proper identification, request a free copy of the report and may dispute with the FMCSA the accuracy or completeness of any information or report. If you request a copy of a driver record from the Prospective Employer who procured the report, then, within 3 business days of receiving your request, together with proper identification, the Prospective Employer must send or provide to you a copy of your report and a summary of your rights under the Fair Credit Reporting Act.</p><p align="justify">Neither the Prospective Employer nor the FMCSA contractor supplying the crash and safety information has the capability to correct any safety data that appears to be incorrect. You may challenge the accuracy of the data by submitting a request to https://dataqs.fmcsa.dot.gov. If you challenge crash or inspection information reported by a State, FMCSA cannot change or correct this data. Your request will be forwarded by the DataQs system to the appropriate State for adjudication</span></p><p align="justify">Any crash or inspection in which you were involved will display on your PSP report. Since the PSP report does not report, or assign, or imply fault, it will include all Commercial Motor Vehicle (CMV) crashes where you were a driver or co-driver and where those crashes were reported to FMCSA, regardless of fault. Similarly, all inspections, with or without violations, appear on the PSP report. State citations associated with Federal Motor Carrier Safety Regulations (FMCSR) violations that have been adjudicated by a court of law will also appear, and remain, on a PSP report.</span></p><p align="justify">The Prospective Employer cannot obtain background reports from FMCSA without your authorization</span></p><h3><center>AUTHORIZATION</center></h3><p align="justify">If you agree that the Prospective Employer may obtain such background reports, please read the following and sign below: I authorize ' + getcmpdtls.name + ' to access the FMCSA Pre-Employment Screening Program (PSP) system to seek information regarding my commercial driving safety record and information regarding my safety inspection history. I understand that I am authorizing the release of safety performance information including crash data from the previous five (5) years and inspection history from the previous three (3) years. I understand and acknowledge that this release of information may assist the Prospective Employer to make a determination regarding my suitability as an employee.</p><p align="justify">I further understand that neither the Prospective Employer nor the FMCSA contractor supplying the crash and safety information has the capability to correct any safety data that appears to be incorrect. I understand I may challenge the accuracy of the data by submitting a request to https://dataqs.fmcsa.dot.gov. If I challenge crash or inspection information reported by a State, FMCSA cannot change or correct this data. I understand my request will be forwarded by the DataQs system to the appropriate State for adjudication</p><p align="justify">I understand that any crash or inspection in which I was involved will display on my PSP report. Since the PSP report does not report, or assign, or imply fault, I acknowledge it will include all CMV crashes where I was a driver or co-driver and where those crashes were reported to FMCSA, regardless of fault. Similarly, I understand all inspections, with or without violations, will appear on my PSP report, and State citations associated with FMCSR violations that have been adjudicated by a court of law will also appear, and remain, on my PSP report.</p><p align="justify">I have read the above Disclosure Regarding Background Reports provided to me by Prospective Employer and I understand that if I sign this Disclosure and Authorization, Prospective Employer may obtain a report of my crash and inspection history. I hereby authorize Prospective Employer and its employees, authorized agents, and/or affiliates to obtain the information authorized above.</p><p align="justify"><b>Date:</b> <span id="getupdatedDate">' + certificateDate + '</span></p><p align="justify"><b>Drivers Signature:</b> <span id="">' + ImagesAttachment + '</span></p><p align="justify"><b>Drivers Name:</b>  ' + getDriver.driver_name + '</p><p style="padding: 20px;" align="justify"><input class="form-check-input" id="Iagree" name="Iagree" type="checkbox" value="1" checked="checked" disabled="disabled">I certify that I have read and understood the above requirements.</p><p align="justify">NOTICE: This form is made available to monthly account holders by NIC on behalf of the U.S. Department of Transportation, Federal Motor Carrier Safety Administration (FMCSA). Account holders are required by federal law to obtain an Applicant’s written or electronic consent prior to accessing the Applicant’s PSP report. Further, account holders are required by FMCSA to use the language contained in this Disclosure and Authorization form to obtain an Applicant’s consent. The language must be used in whole, exactly as provided. Further, the language on this form must exist as one stand-alone document. The language may NOT be included with other consent forms or any other language.</p><p align="justify">NOTICE: The prospective employment concept referenced in this form contemplatesthe definition of “employee” contained at 49 C.F.R. 383.5.</p>'
        Formfooter = '</div></div></div></div>';
        let PSPDisclosure = Formheader + Formbody + Formfooter
        //clearingHouseConsent
        Formheader = '<div style="break-after:page"></div><div id=""> <div style="text-align: center;"> <h3>CLEARING HOUSE CONSENT</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
        Formbody = '<h3><center>SCHEDULE “A” “1”THE COMMERCIAL DRIVER’S LICENSE DRUG AND ALCOHOL CLEARINGHOUSE CONSENT FORM</center></h3>(TO BE EXECUTED BY ALL EMPLOYEES AND APPLICANTS WHO ARE OFFERED EMPLOYMENT)<p align="justify">1. I understand that as a condition of employment, or continued employment, with the Company, I must register with the Commercial Driver’s License Drug and Alcohol Clearinghouse at clearinghouse.fmcsa.dot.gov and I must grant electronic consent for the Company to run a full Pre-Employment Query on my record with the Clearinghouse.</p><p align="justify">2. I understand that a full Pre-Employment Query includes assessing the following specific records:</p><p align="justify">a. A verified positive, adulterated, or substituted controlled substances test result;</p><p align="justify">b. An alcohol confirmation test with a concentration of 0.04 or higher;</p><p align="justify">c. An employer’s report of actual knowledge, meaning that the employer directly observed the employee’s use of alcohol or controlled substances while on duty;</p><p align="justify">d. On duty alcohol use, meaning an employer has actual knowledge that an employeehas used alcohol while performing safety sensitive functions; e. Pre-duty alcohol use, meaning that an employer has actual knowledge that anemployee has used alcohol within 4 hours of performing safety sensitive functions;</p><p align="justify">f. Alcohol use following an accident, unless 8 hours have passed following the accident or until a post accident alcohol test is conducted, whichever occurs first;</p><p align="justify">g. Controlled substance use, meaning that no driver shall used a controlled substance while performing a safety sensitive function unless a licensed medical practitioner who is familiar with the driver’s medical history has advised the driver that the substance will not adversely affect the driver’s ability to safely operate a commercial motor vehicle;</p><p align="justify">h. A SAP report of the successful completion of the return-to-duty process;</p><p align="justify">i. A negative return-to-duty test; and</p><p align="justify">j. A SAP report of the successful completion of follow-up testing.</p><p align="justify">3. I understand that I cannot perform a safety sensitive function for the Company if my Clearinghouse record indicates a violation as listed in Part 2 above unless/until I have completed the SAP evaluation, referral and education/treatment process as described in this Policy. Page 29 INITIALS J S JASMEET SINGH My signature below confirms that I have read and understood the above terms and that I agree to abide by them.</p><p align="justify"></p><p align="justify"><b>Date this at:</b> <span id="getupdatedDate">' + certificateDate + '</span></p><p align="justify"><b>Printed Name of Employee as it appears on DL</b> ' + getDriver.driver_name + '</p><p align="justify"><b>Driver’s License No:</b> ' + getDriver.driver_license + ' <b>Province:</b> ' + getDriver.province + '</p><p align="justify"><b>Employee Date of Birth:</b> ' + getDriverdetails.DOB + '</p><p align="justify"><b>Drivers Signature:</b> <span id="">' + ImagesAttachment + '</span></p><p align="justify"><b>Supervisor Signature:</b> <span id="">' + adminImagesAttachment + '</span></p> <p style="padding: 20px;" align="justify"> <input class="form-check-input" id="Iagree" name="Iagree" type="checkbox" value="1" checked="checked" disabled="disabled">I certify that I have read and understood the above requirements.</p><p align="justify">NOTICE: This form is made available to monthly account holders by NIC on behalf of the U.S. Department of Transportation, Federal Motor Carrier Safety Administration (FMCSA). Account holders are required by federal law to obtain an Applicant’s written or electronic consent prior to accessing the Applicant’s PSP report. Further, account holders are required by FMCSA to use the language contained in this Disclosure and Authorization form to obtain an Applicant’s consent. The language must be used in whole, exactly as provided. Further, the language on this form must exist as one stand-alone document. The language may NOT be included with other consent forms or any other language.</p><p align="justify">NOTICE: The prospective employment concept referenced in this form contemplatesthe definition of “employee” contained at 49 C.F.R. 383.5.</p><h3><center>SCHEDULE “A” “2”THE COMMERCIAL DRIVER’S LICENSE DRUG AND ALCOHOL CLEARINGHOUSE ANNUAL CONSENT FORM FOR LIMITED QUERIE</center></h3><center>(TO BE EXECUTED BY ALL CURRENT EMPLOYEES AND ALL APPLICANTS WHO ARE OFFERED EMPLOYMENT)</center><p align="justify">My signature below confirms that I agree to allow the Company or their representative, Denning Health Group, to conduct an Annual Limited Query on my record with the Commercial Driver’s License (CDL) Drug and Alcohol Clearinghouse. I understand that a Limited Query will not reveal any of the details of my record with the Clearinghouse.</p><p align="justify">Furthermore, I understand that, if the Limited Query reveals that the Clearinghouse has information on me indicating that I have been in violation, I must immediately register with the Clearinghouse at clearinghouse.fmcsa.dot.gov and grant permission for the Company or their representative to run a Full Query on my record with the Clearinghouse. I understand that the Company or their representative must run the Full Query within 24 hours of receiving the results of the Limited Query indicating a violation on my part.</p><p align="justify">I agree that, if I fail to register with the Clearinghouse within 24 hours, I will be removed from safety sensitive functions until the Company or their representative is able to conduct the Full Query and the results confirm that my record contains no violations as outlined in this Policy.</p><p align="justify">I agree that, if my record with the Clearinghouse reveals that I have engaged in prohibited conduct (i.e. a violation) as outlined in this Policy or the DOT rules, I will be removed from safety sensitive functions until/unless I have completed the SAP evaluation, referral and education/treatment process as described in this Policy.</p><p align="justify">I understand that, if any information is added to my Clearinghouse record within the 30-day period immediately following the Company’s or their representative’s Query on me, the Company will be notified by the Federal Motor Carrier Safety Administration (FMCSA).</p><p align="justify">My signature below confirms that I have read and understood the above terms and that I grant permission for an Annual Limited Query on my record with the Commercial Driver’s License Drug and Alcohol Clearinghouse for the duration of my employment with the Company.</p><p align="justify"><b>Date this at:</b> <span id="getupdatedDate">' + certificateDate + '</span></p><p align="justify"><b>Printed Name of Employee as it appears on DL</b> ' + getDriver.driver_name + '</p><p align="justify"><b>Driver’s License No:</b> ' + getDriver.driver_license + ' <b>Province:</b> ' + getDriver.province + '</p><p align="justify"><b>Employee Date of Birth:</b> ' + getDriverdetails.DOB + '</p><p align="justify"><b>Drivers Signature:</b> <span id="">' + ImagesAttachment + '</span></p><p align="justify"><b>Supervisor Signature:</b> <span id="">' + adminImagesAttachment +  '</span></p> <p style="padding: 20px;" align="justify"> <input class="form-check-input" id="Iagree" name="Iagree" type="checkbox" value="1" checked="checked" disabled="disabled">I certify that I have read and understood the above requirements.</p>'
        Formfooter = '</div></div></div></div>';
        let clearingHouseConsentData = Formheader + Formbody + Formfooter
        // compensatedWork
        adminattachmentpath = "uploads/attachment/drivinghistoryaddressSignature/" + adminSignature;
        if (signature) {
            ImagesAttachment = '<img id="signature" alt="user" width="150" src="' + attachmentpath + '">';
        } else {
            ImagesAttachment = '';
        }
        Formheader = '<div style="break-after:page"></div><div id=""> <div style="text-align: center;"> <h3>COMPENSATED WORK</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
        Formbody = '<h3><center>Driver Certification for Other Compensated Work</center></h3><p align="justify">When employed by a motor carrier, a driver must report to the carrier all on-duty time including time working for other employers. The definition of on-duty time found in Section 395.2 paragraphs (8) and (9) of the Federal Motor Carrier Safety Regulations includes time performing any other work in the capacity of, or in the employer or service of, acommon, contract or private motor carrier, also performing any compensated work for any non-motor carrier entity.</p><p align="justify"><b>Are you currently working for another employer</b> <span id="certificateIDSixSecondPrams">' + certificateIDSixSecondPrams + '</span></p><p align="justify"><b>Currently do have your intent to work for another employer while still employed by this company?</b> <span id="certificateIDSixSecondPrams">' + certificateIDSixSecondPrams + '</span></p><p align="justify"><b>Date this at:</b> <span id="getupdatedDate">' + certificateDate + ' at ' + getDriverdetails.companyProvince + ' </span></p><p align="justify"><b>Drivers Signature:</b> <span id="">' + ImagesAttachment + '</span></p>'
        Formfooter = '</div></div></div></div>';
        let compensatedWorkData = Formheader + Formbody + Formfooter
        // drugAndAlcohol
        Formheader = '<div style="break-after:page"></div><div id=""> <div style="text-align: center;"> <h3>DRUG AND ALCOHOL</h3> </div><div style="text-align: center;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
        Formbody = '<h3><center>Review and Sign Consent - Consent to Previous Employment + Drug & Alcohol History Verification</center></h3><p align="justify">I, ' + getDriver.driver_name + ', am applying for employment at ' + getcmpdtls.name + '. (my "Potential Employer") and want to provide my consent for only this application l agree that my Potential Employer and its service provider,Compliance Mentroz ("Service Provider”), may contact all my former employers to conduct a reference and driving safety check that includes the collection and assessment of information about my dates of employment, employment status, job duties and driving experience, reason for leaving, job performance and incident/accident record.</p><p align="justify">I agree that my Potential Employer and its Service Provider may contact all organizations who have issued educational awards or credentials that I have identified to confirm my awards and credentials.</p><p align="justify">I understand that Service Provider retains employment history records on behalf of anumber of employers in the trucking industry. I agree that Service Provider, on behalf of my Potential Employer, may check these records to confirm my employment history and conduct a reference and driving safety check that includes an assessment of my dates of employment, employment status, job duties and driving experience, reason for leaving, job performance and incident/accident record.</p><p align="justify">I agree that that my Potential Employer and Service Provider may use and disclose my personal information as required for the above-noted purposes and agree that each of the organizations that are contacted for the above-noted purposes may disclose information to either my Potential Employer or its Service Provider. Iwill not hold my Potential Employer or Service Provider or said organizations liable for this disclosure.</p><p align="justify">I agree that Service Provider may retain all personal information it collects for the above-noted purposes on behalf of my Potential Employer, who shall contro! and have a full right of access to records of my personal information that Service Provider creates and retains. I will not hold Service Provider liable for any losses arising out of its retention or handling of my personal information.</p><p align="justify">I understand that I have the right to (1) to review the information provided by previous employers, (2) have errors corrected and re-submitted by previous employers and (3) have a rebuttal statement attached to information I allege to be erroneous if my previous employer and I cannot agree on the accuracy of information.</p><p align="justify">l understand that I may direct any questions I have about this consent and about how Service Provider handles personal information on behalf of my Potential Employer to Compliance Mentroz. at driverhiring@compliancementorz.com or by phone at +1 (905) 486-1666</p><p align="justify">I certify that this application was completed by me and that all entries on it and information in it are true and complete to the best of my knowledge. I understand that any misstatement or omission of information in this application may result in my dismissal.</p><p align="justify">I hereby authorize release of information from my Department of Transportation regulated drug and alcohol testing records by my previous employer, to the prospective employer named below and /or its service provider Compliance Mentroz. This release is in accordance with DOT Regulation 49 CFR Part 40, Section 40.25. I understand that information to be released by my previous employer, is limited to the following DOT-regulated testing items:</p><p align="justify"> 1.Alcohol tests with a result of 0.04 or higher: </p><p align="justify"> 2.Verified positive drug tsts; </p><p align="justify"> 3.Refusals to be tested; </p><p align="justify"> 4.Other violations of DOT agency drug and alcohol testing regulations; </p><p align="justify"> Information obtained from previous employers of a drug and alcohol rule violation; </p><p align="justify"> Documentation,if any,of completion of the return-to-duty process following a rule violation. </p><p align="justify"><b>Date this at:</b> <span id="certificateDate">' + certificateDate + ' at ' + getDriverdetails.companyProvince + '</span></p><p align="justify"><b>Driver Name</b> ' + getDriver.driver_name + '</p><p align="justify"><b>Drivers Signature:</b> <span id="">' + ImagesAttachment + '</span></p>'
        Formfooter = '</div></div></div></div>';
        let drugAndAlcoholData = Formheader + Formbody + Formfooter
        // HOS
        let gethosdtls = await Hos.findOne({ where: { driverId: driverid }, raw: true });
        let getDrivinghistoryaddress = await Drivinghistoryaddress.findOne({ where: { driverId: driverid }, order: [['id', 'DESC']], raw: true });
        let driverName = getDriver ? getDriver.driver_name : '';
        let driver_license = getDriver ? getDriver.driver_license : '';
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
        tableDataHOS += '<div style="break-after:page"></div> <table border="1" cellspacing="0" cellpadding="0" width="200" align="center" style="width: 100%;border: 1px solid black;" id="table" class="table table-striped table-bordered"><thead><tr><th class="thClass">Sl</th><th class="thClass">Date</th><th class="thClass">Duration</th></tr></thead><tbody>'
        if (getHOSDtls) {
            await getHOSDtls.forEach(function (getDetails, i) {
                tableDataHOS += '<tr align="center" style="font-size: 20px;border: 1px solid black;"><td style="border: 1px solid black;">' + n + '</td><td style="border: 1px solid black;">' + getDetails.actualDate + '</td><td style="border: 1px solid black;">' + getDetails.duration + '</td> </tr>';
                n++;
            });
        }
        else {
            tableDataHOS = '';
        }
        tableDataHOS += '</tbody></table>'
        Formheader = '<div id=""> <div style="text-align: center;"> <h3>HOS</h3> </div><div style="margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
        Formbody = '<div class="col-md-12"><center><i style="font-size:50px" class="mdi mdi-clock-fast"></i><br><h3>Statement of Hours of Service</h3></center><p align="justify">New Hires, Contractors, Casual &amp; Temporary Employees</p><hr style="width:100%"><b>Name:</b><span id="driverName">' + driverName + '</span><hr style="width:100%"><div class="row"><div class="col-md-4"><b>Drivers Licence Number:</b><span id="driver_license">' + driver_license + '</span></div><div class="col-md-4"><b>Class of License:</b><span id="getDrivinghistoryprovince">' + getDrivinghistoryaddressprovince + '</span></div><div class="col-md-4"><b>Issuing Province:</b><span id="getDrivinghistorylicense">' + getDrivinghistoryaddresslicense + '</span></div></div><hr style="width:100%"><p align="justify">Section 81. (2)(c) The motor carrier maintains accurate and legible records showing, for each day, the drivers duty status and elected cycle, the hour at which each duty status begins and ends and the total number of hours spent in each status and keeps those records for a minimum period of 6 months after the day on which they were recorded. Section 84. No driver who is required to fill out a daily log shall drive and no motor carrier shall request, require or allow the driver to drive unless the driver has in their possession (a) a copy of the daily logs for the preceding 14 days and, in the case of a driver driving under an oil well service permit, for each of the required 3 periods of 24 consecutive hours of off-duty time in any period of 24 days; (b) the daily log for the current day, completed up to the time at which the last change in the driver’s duty status occurred;<br></p><div class="row"><div class="col-md-7"><b><input class="form-check-input" id="Iagree" name="Iagree" type="checkbox" value="1" checked="checked" disabled="disabled"> I hereby certify that the information given below is correct to the best of my knowledge and belief,and that I was last relieved from work at:</b></div><div class="col-md-3"><span id="hosdurationData">' + hosdurationData + '</span><br>On<br><span id="hosdateData">' + hosdateData + '</span></div></div><hr style="width:100%">INSTRUCTIONS: Day 1 is the day before you first begin work for this motor carrier. The dates have been pre-filled based on todays date. If you need to change the DAY 1 date, Click here<br><br><div class="row"><b>Selected Date :</b><span id="hosselectedDate">' + hosselectedDate + '</span></div><br><div style="width:100%" class="container1"></div><br><div style="text-align:left"><b>Employee Signature:</b> ' + signature + '<br><div><b>Name:</b><span id="driverName">' + driverName + '</span></div><br><div><b>Drivers Licence Number:</b><span id="driver_license">' + driver_license + '</span><br></div><br><div><b>Date:</b><span id="hoscreatedAt">' + hoscreatedAt + '</span><br></div></div></div>'
        Formfooter = '</div></div></div></div> ';
        Form = Formheader + Formbody + Formfooter
        // Form = '';
        let HOSData = Form + tableDataHOS + '<div><b>Total Duration:</b><span id="totalDurationData">' + totalDuration + '</span><br></div>';

        let pageBreak = '<div style="break-after:page"></div>';
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
        if (signaturedata1) {
            signature1 = '<img style="width: 30%" src="uploads/attachment/drivinghistoryaddressSignature/' + getDrivinghistorySignature1 + '"/>';
        } else {
            signature1 = ''
        }
        console.log(driverid)
        if(getQuestiongroupone){
             Formheader1 = '<div style="break-after:page"></div><div id=""> <div style="text-align: center;"> <h3>Interview Questions</h3> </div><div style="text-align: center2;margin: 1px;" class="row"> <div style="padding: 5px;" class="col-md-12">';
            Formbody1 = '<div class="card-body" id=""><div style="text-align:center"><span><h4></h4></span></div><br><div class=""><div class=""><b>Name of Driver :</b><span id="driverName">' + driverName + '</span><br><b>License No :</b><span id="driver_license">' + driver_license + '</span><br><br><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question1" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">1. What are your strengths as a driver?</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question1 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question2" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">2. Why are you looking for a job?</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question2 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question3" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">3. Why did you choose to approach our company?</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question3 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question4" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">4. Can you provide references from your current or previous employers or we can verify it? Please provide contact details.</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question4 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question5" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">5. If you have any preferred area to haul loads and why?</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question5 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question6" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">6. What training do you think you will require doing this job?</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question6 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question7" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">7. What would your current employer have to do to make you stay?</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question7 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question8" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">8. Tell me how you handled a problem with a dispatcher / customer?</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question8 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question9" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">9. Tell me about the last roadside inspection you had and where?</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question9 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question10" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">10. If you ever had problem at the border? If yes explain.</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question10 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question11" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">11. If you have a previous collision / citation, tell me about it and what you would do different now?</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question11 + '</span></div></div><br><div class="form-group row" style="margin-bottom:1rem;width:100%;float:left;"><label for="question12" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">12. Did you receive remedial training from the collision / citation? If answer to above is yes.</label><div class="col-md-6" style="width:100%;float:left;"><span>' + getQuestiongroupone.question12 + '</span></div></div><br><div class="row" style="margin-bottom:1rem;width:100%;float:left;"><div class="col-md-6" style="width:50%;float:left;"><b>Drivers Signature :</b>' + signature1 + '</div> <div class="col-md-6" style="width:50%;float:left;"><b>Name of the Interviewer :</b><span>' + getQuestiongroupone.interviewer + '</span></div></div></div></div>'
            Formfooter1 = '</div></div></div>';
        }
            let questionone1 = Formheader1 + Formbody1 + Formfooter1
        
        let getQuestiongrouptwo = await Questiongrouptwo.findOne({ where: { driverId: driverid }, raw: true });
        let getDrivinghistory2 = await Drivinghistory.findOne({ where: { driverId: driverid }, raw: true });
        console.log(getQuestiongrouptwo);
         let Formheader2
        let Formbody2
        let Formfooter2
   

            var right_wrongs = JSON.parse(getQuestiongrouptwo.rightorwrong);
            for(i=0;i<32;i++){
                if(right_wrongs[i] == '1'){
                    right_wrongs[i] = 'Yes';
                }
                else{
                    right_wrongs[i] = 'No';
                }
            }
            var wrong  = parseInt(32) - parseInt(getQuestiongrouptwo.result);
            if(getQuestiongrouptwo){
				
             Formheader2 = '<div style="break-after:page"></div><div id=""> <div style="text-align: center;"> <h3>Driver Manual</h3> </div><div style="text-align: center2;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
            Formbody2 = '<div class="card-body" id=""><div style="text-align:center"><span><h4></h4></span></div><br><div class=""><div class=""><div style="width:100%;float:left"><div style="width:75%;float:left"><b>Name of Driver :</b><span id="driverName">' + driverName + '</span></div>';
			if(getQuestiongrouptwo.approveStatus==0){
				Formbody += '<div style="width:25%;float:left"><b>Result : No Result</b></div></div><br><br><br>';
			}else{
				Formbody2 +='<div style="width:25%;float:left"><b>Result : </b><b style="margin-left:10px;"> Right : </b> <span id="vans_right">'+getQuestiongrouptwo.result+'</span><b style="margin-left:10px;"> Wrong : </b><span id="vans_wrong">'+wrong+'</span></div></div><br><br><br>';
			}
			Formbody2 +='<div class="form-group row" style="margin-bottom:2rem;"><label for="question1" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q1. In the event a driver receives a speed infraction what are the disciplinary action will be taken?</label><div class="col-md-12"  style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question1 + '</span></div></div><br><div class="form-group row"  style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[0] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question2" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q2. How many duty cycles are available? What are they?</label><div class="col-md-12"  style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question2 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[1] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question3" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q3. What is preventable Accident?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question3 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[2] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question4" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q4. What are the basic causes of an accidents?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question4 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[3] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question5" class="col-sm-12 control-label col-form-label" style="width:50%;float:left;">Q5. What is securing the scene?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question5 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[4] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question6" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q6. Am I allowed to drive a vehicle above the speed of 105 Km/H?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question6 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[5] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question7" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q7. Am I allowed to disconnect dash cams while on duty or off duty?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question7 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[6] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question8" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q8. Am I allowed take less rest to cover the destination quickly?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question8 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[7] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question9" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q9. What is cargo securement?.</label><div class="col-md-12" style="width:50%;float:left;"><span>' + getQuestiongrouptwo.question9 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[8] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question10" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q10. Am I allowed to drive entire 14 hours during 14 hours on duty time?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question10 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[9] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question11" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q11. How many hours can I drive during 14 hours of on duty time?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question11 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[10] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question12" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q12. How many hours of off duty is required in 16 hours working window?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question12 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[11] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question13" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q13. What is the minimum time for a rest break?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question13 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[12] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question14" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q14. Can I switch cycle?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question14 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[13] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question15" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q15. What is Cycle reset?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question15 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[14] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question16" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q16. What is the limit of personal conveyance?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question16 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[15] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question17" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q17. What if I exceed the limit of personal conveyance?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question17 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[16] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question18" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q18. Am I allowed to split Sleeper Berth times into 2?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question18 + '</span></div></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[17] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question19" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q19. Am I allowed to drive a motor vehicle without doing a PTI?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question19 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[18] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question20" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q20. What are the checks needs to be done in a pre‐trip inspection?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question20 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[19] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question21" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q21. Can a driver drive the vehicle with a passenger?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question21 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[20] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question22" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q22. What is an unsafe act?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question22 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[21] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question23" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q23. What is jackknifing?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question23 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[22] + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question24" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q24. Why accident reporting is necessary?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question24 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[23] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question25" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q25. What are information required post accident?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question25 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[24] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question26" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q26. Is it wise to accept guilt at the accident spot?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question26 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[25] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question27" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q27. What is social media policy?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question27 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:100%;float:left;"><span>' + right_wrongs[26] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question28" class="col-sm-12 control-label col-form-label" style="width:50%;float:left;">Q28. What is Highway traffic act (HTA)?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question28 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[27] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question29" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q29. What is C‐ TPAT procedure?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question29 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[28] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question30" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q30. What is President’s Safety Award?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question30 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question30 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[29] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question31" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q31. What is Accident Reporting & Investigation Policy?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question31 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[30] + '</span></div></div><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question32" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">Q32. What are the accident investigation procedure?</label><div class="col-md-12" style="width:100%;float:left;"><span>' + getQuestiongrouptwo.question32 + '</span></div></div><br><div class="form-group row" style="margin-bottom:2rem;"><label for="questionr1" class="col-sm-6 control-label col-form-label" style="width:50%;float:left;clear: both;">Is This Correct?</label><div class="col-md-6" style="width:50%;float:left;"><span>' + right_wrongs[31] + '</span></div></div></div></div>'
            Formfooter2 = '</div></div></div>';
            Form2 = Formheader2 + Formbody2 + Formfooter2
            }
            let questiontwo = Formheader2 + Formbody2 + Formfooter2
			
			 let getCanadahos = await Canadahos.findOne({ where: { driverId: driverid }, raw: true });
			 console.log(driverid);
			 console.log('hos:'+getCanadahos);
			
			 let Formheader3
        let Formbody3
        let Formfooter3
   

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
            var percentage  = (parseFloat(getCanadahos.result) /15)*100;
            if(getCanadahos){
				
                let Formheader3 = '<head><title>'+ getDriverdetails.firstName+'_canadahos'+'</title></head><div id=""> <div style="text-align: center;"> <h3>HOS Questionnaire for Canada South Regulations</h3> </div><div style="text-align: center2;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
                let Formbody3 = '<div class="card-body" id=""><div style="text-align:center"><span><h4></h4></span></div><br><div class=""><div class=""><div style="width:100%;float:left"><div style="width:50%;float:left"><b>Name of Driver :</b><span id="driverName">' + driverName + '</span></div>';
                if(getCanadahos.approveStatus==0){
                    Formbody3 += '<div style="width:100%;float:left"><b>Result : No Result</b></div></div><br><br><br>';
                }
                else{
                    Formbody3 += '<div style="width:100%;float:left"><b>Result : </b><span id="vans_wrong">'+percentage.toFixed(2)+'%-'+getCanadahos.result+' out of 15</span></div></div><br><br><br>';
                }
                Formbody3 += '<div style="width:50%;float:left"><b>Licence :</b><span id="driverlicence">' + driver_license + '</span></div>';
                Formbody3 += '<div class="form-group row" style="margin-bottom:2rem;"><label for="question1" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">1. The Canada South rule states that a driver may be on duty for maximum14 hours before he/she:</label><div class="col-md-12"  style="width:100%;float:left;">Selected Answer:  ';
                if(getCanadahos.question1=='takes a 8-hour break'){
                    FormboFormbody3dy += '<span style="color:green">' + getCanadahos.question1 + '</span>';
                }
                else{
                    Formbody3 += '<span style="color:red">' + getCanadahos.question1 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>takes a 8-hour break';
                }
                Formbody3 +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question2" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">2. If you are driving a bobtail, you can use personal conveyance to pick up a loaded trailer</label><div class="col-md-12"  style="width:100%;float:left;">Selected Answer: ';
                if(getCanadahos.question2=='False'){
                    Formbody3 += '<span style="color:green">' + getCanadahos.question2 + '</span>';
                }
                else{
                    Formbody3 += '<span style="color:red">' + getCanadahos.question2 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>False';
                }
                Formbody3 +=' </div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question3" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">3. As per Canadian South HOS regulation, A driver can make Yard move</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer: ';
                if(getCanadahos.question3=='only when on duty'){
                    Formbody3 += '<span style="color:green">' + getCanadahos.question3 + '</span>';
                }
                else{
                    Formbody3 += '<span style="color:red">' + getCanadahos.question3 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>only when on duty';
                }
                Formbody3 +=' </div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question4" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">4. As per Canada South HOS regulation, A driver has to take a minimum ___ hours off  in a day.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
                if(getCanadahos.question4=='10'){
                    Formbody3 += '<span style="color:green">' + getCanadahos.question4 + '</span>';
                }
                else{
                    Formbody3 += '<span style="color:red">' + getCanadahos.question4 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>10';
                }
                Formbody3 +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question5" class="col-sm-12 control-label col-form-label" style="width:50%;float:left;">5. The Sum of which two duty status are taken into account, to calculate your 70 hours of total on duty time in 7 days?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
                if(getCanadahos.question5=='Driving and on duty other than driving'){
                    Formbody3 += '<span style="color:green">' + getCanadahos.question6 + '</span>';
                }
                else{
                    Formbody3 += '<span style="color:red">' + getCanadahos.question6 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>Driving and on duty other than driving';
                }
                Formbody3 +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question6" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">6. In Canada, a driver can defer 2 hours off duty to next day</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
                if(getCanadahos.question6=='Driving and on duty other than driving'){
                    Formbody3 += '<span style="color:green">' + getCanadahos.question6 + '</span>';
                }
                else{
                    Formbody3 += '<span style="color:red">' + getCanadahos.question6 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>True';
                }
                Formbody3 += '</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question7" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">7. While driving with a co-driver,</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
                if(getCanadahos.question7=='All of the above'){
                    Formbody3 += '<span style="color:green">' + getCanadahos.question7 + '</span>';
                }
                else{
                    Formbody3 += '<span style="color:red">' + getCanadahos.question7 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>All of the above';
                }
                Formbody3 +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question8" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">8. Your logbook should always be updated till</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
                if(getCanadahos.question8=='Last change of duty status'){
                    Formbody3 += '<span style="color:green">' + getCanadahos.question8 + '</span>';
                }
                else{
                    Formbody3 += '<span style="color:red">' + getCanadahos.question8 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>Last change of duty status';
                }
                Formbody3 +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question9" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">9. The 16th hour of a shift can be calculated by excluding, more than 2 hours off duty taken by , which is at least 10 hours  when added to next of duty period.</label><div class="col-md-12" style="width:50%;float:left;">Selected Answer:  ';
                if(getCanadahos.question9=='False'){
                    Formbody3 += '<span style="color:green">' + getCanadahos.question9 + '</span>';
                }
                else{
                    Formbody3 += '<span style="color:red">' + getCanadahos.question9 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>False';
                }
                Formbody3 +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question10" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">10. A driver has take 24 hrs off in any 14 days?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
                if(getCanadahos.question10=='True'){
                    Formbody3 += '<span style="color:green">' + getCanadahos.question10 + '</span>';
                }
                else{
                    Formbody3 += '<span style="color:red">' + getCanadahos.question10 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>True';
                }
                Formbody3 +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question11" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">11. How many hours of reset time  is required to change from 120 hours /14 days cycle to 70 hours/7 days cycle?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
                if(getCanadahos.question11=='72'){
                    Formbody3 += '<span style="color:green">' + getCanadahos.question11 + '</span>';
                }
                else{
                    Formbody3 += '<span style="color:red">' + getCanadahos.question11 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>72';
                }
                Formbody3 +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question12" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">12. Pre trip inspection of a vehicle needs to be done at least once in every 24 hours.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
                if(getCanadahos.question12=='True'){
                    Formbody3 += '<span style="color:green">' + getCanadahos.question12 + '</span>';
                }
                else{
                    Formbody3 += '<span style="color:red">' + getCanadahos.question12 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>True';
                }
                Formbody3 +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question13" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">13. In Canada, A driver can drive maximum 13 hours ,</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
                if(getCanadahos.question13=='Both b& c'){
                    Formbody3 += '<span style="color:green">' + getCanadahos.question13 + '</span>';
                }
                else{
                    Formbody3 += '<span style="color:red">' + getCanadahos.question13 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>Both b& c';
                }
                Formbody3 +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question14" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">14. As per Canadian South HOS regulation,  if a driver can take less than 30 minutes off duty to complete his mandatory 10 hours off duty in a day</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
                if(getCanadahos.question14=='False'){
                    Formbody3 += '<span style="color:green">' + getCanadahos.question14 + '</span>';
                }
                else{
                    Formbody3 += '<span style="color:red">' + getCanadahos.question14 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>False';
                }
                Formbody3 +='</div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question15" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">15. A  driver driving within 160 km radious, is exempted from HOS rules</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  ';
                if(getCanadahos.question15=='False'){
                    Formbody3 += '<span style="color:green">' + getCanadahos.question15 + '</span>';
                }
                else{
                    Formbody3 += '<span style="color:red">' + getCanadahos.question15 + '</span></div><div class="col-md-12"  style="width:100%;float:left;"><label>Correct Answer</label><br>False';
                }
                Formbody3 +='</div></div><br><hr style="width:100%"><br></div></div>';
                Formfooter3 = '</div></div></div>';
            }
            getCanadahos = Formheader3 + Formbody3 + Formfooter3;
			
			let getushos2 = await Usquestion.findOne({ where: { driverId: driverid }, raw: true });
            getushos2 = '';
       // console.log('driver:'+driverid);
       /*  console.log('ushos:'+getushos2);
			let Formheader4
        let Formbody4
        let Formfooter4
		var right_wrongs = JSON.parse(getushos2.rightorwrong);
            for(i=0;i<15;i++){
                if(right_wrongs[i] == '1'){
                    right_wrongs[i] = 'Yes';
                }
                else{
                    right_wrongs[i] = 'No';
                }
            }
            var wrong  = parseInt(15) - parseInt(getushos2.result);
            var percentage  = (parseFloat(getushos2.result) / 15)*100;
        if (getushos2) {
            
            let Formheader4 = '<head><title>'+ getDriverdetails.firstName+'_ushos'+'</title></head><div id=""> <div style="text-align: center1;"> <h3>Hours of Service Questionnaire: US rule set</h3> </div><div style="text-align: center2;margin: 1px;" class="row"> <div style="border: 2px dotted;padding: 5px;" class="col-md-12">';
            let Formbody4 = '<div class="card-body" id=""><div style="text-align:center"><span><h4></h4></span></div><br><div class=""><div class=""><div style="width:100%;float:left"><div style="width:50%;float:left"><b>Name of Driver :</b><span id="driverName">' + driverName + '</span></div>';
			if(getushos2.approveStatus==0){
				Formbody4 += '<div style="width:50%;float:left"><b>Result : No Result</b></div></div><br><br><br>';
			}
			else{
				Formbody4 += '<div style="width:50%;float:left"><b>Result : </b><b style="margin-left:10px;"> Right : </b> <span id="vans_right">'+getushos2.result+'</span><b style="margin-left:10px;"> Wrong : </b><span id="vans_wrong">'+wrong+'</span><b style="margin-left:10px;"> Percentage : </b><span id="vans_wrong">'+percentage.toFixed(2)+'%</span></div></div><br><br><br>';
			}
			Formbody4 += '<div class="form-group row" style="margin-bottom:2rem;"><label for="question1" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">1. Which of the following would be recorded as on duty not driving:</label><div class="col-md-12"  style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos2.question1 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question2" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">2. If a driver is taking split sleeper (2+8) in USA, it must be recorded on:</label><div class="col-md-12"  style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos2.question2 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question3" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">3. A commercial driver can use personal conveyance to drive if his/her driving time is exhausted and he is 10 minutes away from destination.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos2.question3 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question4" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">4. A  Canadian driver can do Yard move on a road with red lights in US</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos2.question4 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question5" class="col-sm-12 control-label col-form-label" style="width:50%;float:left;">5. A driver can go for 30 min On-duty not driving, after 8 hours driving in US</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span>' + getushos2.question5 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question6" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">6. In a snow storm, a driver can extend his shift to 16 hours and drive time to 13 hours in US, if:</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos2.question6 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question7" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">7. A driver can use personal conveyance while crossing the border.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos2.question7 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question8" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">8. Fuelling can be done in</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos2.question8 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question9" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">9. A Canadian Driver has driven 12 hours in Canada, when he reached Sarina.</label><div class="col-md-12" style="width:50%;float:left;">Selected Answer:  <span style="color:green">' + getushos2.question9 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question10" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">10. It is mandatory to certify all the logs.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos2.question10 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question11" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">11. Yard move can be used during</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos2.question11 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question12" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">12. How many hours of rest required after 14 hours of on duty in USA.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos2.question12 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question13" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">13. If the ELD stops working when the driver is on a trip, the driver should</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos2.question13 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question14" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">14. In the United States, how long are you permitted to use paper logs after an ELD malfunction?</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos2.question14 + '</span></div></div><br><hr style="width:100%"><br><div class="form-group row" style="margin-bottom:2rem;"><label for="question15" class="col-sm-12 control-label col-form-label" style="width:100%;float:left;">15. If a driver has adopted 14/120 cycle in Canada, he can go to US without resetting his cycle.</label><div class="col-md-12" style="width:100%;float:left;">Selected Answer:  <span style="color:green">' + getushos2.question15 + '</span></div></div><br><hr style="width:100%"><br></div></div>'
            let Formfooter4 = '</div></div></div>';
			
		}  
		getushos2 = Formheader4 + Formbody4 + Formfooter4*/
        
        let finalCertificate = PersonalDetailsData + pageBreak + employmentHistoryData + pageBreak + getDrivinghistoryData + pageBreak + motorvehicleCertificateData + pageBreak + medicaldeclerationData + pageBreak + driverAcknowledgementData + pageBreak + PSPDisclosure + pageBreak + clearingHouseConsentData + pageBreak + compensatedWorkData + pageBreak + drugAndAlcoholData + pageBreak + HOSData + questionone1 + questiontwo + getCanadahos + getushos2
        
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
    let getCompanydata = await Company.findAll({ where: { active: 0, id: 79 }, raw: true });
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
    let columns = ['driver.id', 'driver_id', 'driver_name', 'r.status'];
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
            index = index + 1
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
                key.name = key.name,
                Object.assign(key, {
                    action: "<a href='javascript:void(0)' data-id='" + key.id + "' id='' class='btn btn-primary viewmodalclass'><span class='fab fa-wpforms'>  Create Form</span></a>&nbsp; " +
                        "<a href='javascript:void(0)' data-id='" + key.id + "' id='' class='btn btn-success viewmodalprevempStatus'><span class='fas fa-search'> View Form Status</span></a>&nbsp; " +
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
            companySign: '/public/uploads/attachment/companySign/' + companySignData // add json element
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
    const fData = JSON.parse(JSON.stringify(req.body))
    //Remove double quotes and braces
    let fDataEmail = fData.RefPreviousEmployerEmailArr.replace(/["'[\]']+/g, '');
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
            let cc = 'mike@ashaviglobal.com'
            let subject = 'Welcome to new portal'
            let URL = 'https://compliancementorz.ca/previousEmployer/' + formID
            let message = '<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width,initial-scale=1"> <meta name="x-apple-disable-message-reformatting"> <title></title> <style>table, td, div, h1, p{font-family: Arial, sans-serif;}@media screen and (max-width: 530px){.unsub{display: block; padding: 8px; margin-top: 14px; border-radius: 6px; background-color: #555555; text-decoration: none !important; font-weight: bold;}.col-lge{max-width: 100% !important;}}@media screen and (min-width: 531px){.col-sml{max-width: 27% !important;}.col-lge{max-width: 73% !important;}}</style></head><body style="margin:0;padding:0;word-spacing:normal;background-color:#939297;"> <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297;"> <table role="presentation" style="width:100%;border:none;border-spacing:0;"> <tr> <td align="center" style="padding:0;"> <table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;"> <tr> <td style="padding:40px 30px 30px 30px;text-align:center;font-size:24px;font-weight:bold;"> <a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="165" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> </td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Hi ' + req.body.driver_name + ',</p> <br><p style="margin:0;">This Email is regarding Previous employer verification for ' + userName + ' <a target="_blank" href=' + URL + '> please click here to approve </a>  <br> </td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Thank you,</p><p style="margin:0;">Safety Department  </p><br><a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="90" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> <p style="margin:0;">Tel: 905-486-1666</p><p style="margin:0;">Web: www.compliancementorz.com</p></td></tr><tr> <td style="padding:30px;text-align:center;font-size:12px;background-color:#404040;color:#cccccc;"> <p style="margin:0;font-size:14px;line-height:20px;">&reg; compliancementorz 2022</p></td></tr></table> </td></tr></table> </div></body></html>'
            sendMail(to, cc, subject, message, req, res)

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
    //Remove double quotes and braces
    // let fDataEmail = fData.RefPreviousEmployerEmailArr.replace(/["'[\]']+/g, '');
    // //Split using comma
    // var fDataEmailArray = fDataEmail.split(',');
    // delete req.body['RefPreviousEmployerEmailArr'];
    // if (fDataEmailArray) {
    //     await fDataEmailArray.forEach(function (getDetails, i) {
    console.log(getDetails);
    Object.assign(fData, {
        RefPreviousEmployerEmail: getDetails // add json element
    });
    update_driver = Reference.create(fData);
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

    //Sort array by date
    getDtls.sort(function (a, b) {
        return new Date(a.toDate) - new Date(b.toDate)
    })
    if (getDtls) {
        await getDtls.forEach(function (getDetails, i) {
            // tableData += '<tr><td>' + getDetails.employerName + '</td><td>' + getDetails.employerAddress + '</td><td>' + getDetails.employerPosition + '</td><td>' + getDetails.employerContactPerson + '</td><td>' + getDetails.employerContactPersonNumber + '</td><td>' + getDetails.employerContactPersonEmail + '</td><td>' + getDetails.jobDesignated + '</td><td>' + getDetails.fmcrs + '</td><td>' + getDetails.fromDate + '</td><td>' + getDetails.toDate + '</td></tr>';
            tableData += '<form style="background-color: #00ff991f;" class="form-horizontal" id="sendMailToPrevForm' + i + '">';
            tableData += ' <div class="card-body"> <h3 align="center" class="card-title">   </h3> <br><input type="hidden" id="form_id" name="form_id"> <input type="hidden" id="company_id" value="' + CompanyDtls.id + '" name="company_id"> <input type="hidden" id="driverId" value="' + DriverDtls.id + '"  name="driverId"> <div class="row"> <label for="employeeName" class="col-md-1 control-label col-form-label">I,</label> <div class="col-md-3"> <input type="text" placeholder="Employee Name" class="form-control" value="' + DriverDtls.driver_name + '" name="employeeName" id="employeeName"> </div><div class="col-md-4"> am applying for employment at </div><div class="col-md-4"><input type="text" class="form-control" placeholder="prospective Employer Name" value="' + CompanyDtls.name + '" name="prospectiveEmployerName" id="prospectiveEmployerName"> </div></div><p align="justify"> (my "Potential Employer") and want to provide my consent for only this application I agree that my Potential Employer and its service provider, Compliance Mentorz Inc. ("Service Provider"), may contact all my former employers to conduct a reference and driving safety check that includes the collection and assessment of information about my dates of employment, employment status, job duties and driving experience, reason for leaving, job performance and incident/accident record. I agree that my Potential Employer and its Service Provider may contact all organizations who have issued educational awards or credentials that I have identified to confirm my awards and credentials. I understand that Service Provider retains employment history records on behalf of a number of employers in the trucking industry. I agree that Service Provider, on behalf of my Potential Employer, may check these records to confirm my employment history and conduct a reference and driving safety check that includes an assessment of my dates of employment, employment status, job duties and driving experience, reason for leaving, job performance and incident/accident record. I agree that that my Potential Employer and Service Provider may use and disclose my personal information as required for the above-noted purposes and agree that each of the organizations that are contacted for the above-noted purposes may disclose information to either my Potential Employer or its Service Provider. I will not hold my Potential Employer or Service Provider or said organizations liable for this disclosure. I agree that Service Provider may retain all personal information it collects for the above-noted purposes on behalf of my Potential Employer, who shall control and have a full right of access to records of my personal information that Service Provider creates and retains. I will not hold Service Provider liable for any losses arising out of its retention or handling of my personal information. I understand that I have the right to (1) to review the information provided by previous employers, (2) have errors corrected and re-submitted by previous employers and (3) have a rebuttal statement attached to information I allege to be erroneous if my previous employer and I cannot agree on the accuracy of information. I understand that I may direct any questions I have about this consent and about how Service Provider handles personal information on behalf of my Potential Employer to Compliance Mentorz Inc. at info@compliancementorz.com or by phone at 1-905-486-1666. I certify that this application was completed by me and that all entries on it and information in it are true and complete to the best of my knowledge. I understand that any misstatement or omission of information in this application may result in my dismissal. This document applies to the following previous employer </p> <input type="text" class="form-control" name="prospectiveEmployerName" value="' + CompanyDtls.name + '" placeholder="Employer Name" id="prospectiveEmployerName" required=""> <label for="name" class="col-md-4 control-label col-form-label">Employee Signature</label> <br>' + ImagesAttachment + ' <br><input type="text" class="form-control" id="employeeName" placeholder="Employee Name" value="' + DriverDtls.driver_name + '"> <br><span></span> <hr> <h4 style="text-align:center;">SAFETY PERFORMANCE HISTORY RECORDS REQUEST</h4> <h5 style="text-align:center;">PART 1: TO BE COMPLETED BY PROSPECTIVE EMPLOYE</h5> <div class="form-group row"> <label for="prospectiveEmployerName" class="col-md-2 control-label col-form-label">I</label> <div class="col-md-4"> <input type="text" class="form-control" placeholder="Prospective employee name" name="prospectiveEmployerName" value="' + CompanyDtls.name + '" id="prospectiveEmployerName"> </div><label for="employeeSin" class="col-md-3 control-label col-form-label">Social Security Number:</label> <div class="col-md-3"> <input type="text" class="form-control" placeholder="Social Security Number" name="employeeSin" value="' + DriverDtls.sin + '" id="employeeSin"> </div></div><div class="form-group row"> <label for="employeeDOB" class="col-md-2 control-label col-form-label">DOB</label> <div class="col-md-4"> <input type="date" class="form-control" placeholder="employeeDOB" name="employeeDOB" value="' + getDriverMoredetails.DOB + '" id="employeeDOB"> </div></div><div class="form-group row"> <label for="previousEmployerName" class="col-md-2 control-label col-form-label">Previous Employer:</label> <div class="col-md-4"> <input type="text" class="form-control" placeholder="Previous Employer" name="previousEmployerName" value="' + getDetails.employerName + '" id="previousEmployerName"> </div><label for="previousEmployer" class="col-md-3 control-label col-form-label">Previous Empoyer Email:</label> <div class="col-md-3"> <input type="text" required id="previousEmployer" name="previousEmployer" class="form-control"> </div></div><div class="form-group row"> <label for="previousEmployerCSZ" class="col-md-2 control-label col-form-label">City, State, Zip:</label> <div class="col-md-4"> <input type="text" class="form-control" placeholder="City, State, Zip" name="previousEmployerCSZ" value="" id="previousEmployerCSZ"> </div><label for="previousEmployerPhone" class="col-md-3 control-label col-form-label">Telephone:</label> <div class="col-md-3"> <input type="text" class="form-control" placeholder="Telephone" name="previousEmployerPhone" value="" id="previousEmployerPhone"> </div></div><div class="form-group row"> <label for="previousEmployerStreet" class="col-md-2 control-label col-form-label">Street:</label> <div class="col-md-4"> <input type="text" class="form-control" placeholder="Previous Employer Street" name="previousEmployerStreet" value="" id="previousEmployerStreet"> </div><label for="previousEmployerFax" class="col-md-3 control-label col-form-label">Fax NO:</label> <div class="col-md-3"> <input type="text" class="form-control" placeholder="Fax" name="previousEmployerFax" value="" id="previousEmployerFax"> </div></div><h4>TO:</h4> <div class="form-group row"> <label for="prospectiveEmployerName" class="col-md-2 control-label col-form-label">Prospective Employer:</label> <div class="col-md-2"> <input type="text" readonly="" class="form-control" placeholder="Prospective Employer" name="prospectiveEmployerName" value="' + CompanyDtls.name + '" id="prospectiveEmployerName"> </div><label for="prospectiveEmployerAttention" class="col-md-2 control-label col-form-label">Attention:</label> <div class="col-md-2"> <input type="text" readonly="" class="form-control" placeholder="Attention" name="prospectiveEmployerAttention" value="' + CompanyDtls.attention + '" id="prospectiveEmployerAttention"> </div><label for="prospectiveEmployerPhone" class="col-md-2 control-label col-form-label">Telephone:</label> <div class="col-md-2"> <input type="text" readonly="" class="form-control" placeholder="Telephone" name="prospectiveEmployerPhone" value="' + CompanyDtls.phone + '" id="prospectiveEmployerPhone"> </div></div><div class="form-group row"> <label for="prospectiveEmployerStreet" class="col-md-2 control-label col-form-label">Street:</label> <div class="col-md-4"> <input type="text" readonly="" class="form-control" placeholder="Street" name="prospectiveEmployerStreet" value="' + CompanyDtls.street + '" id="prospectiveEmployerStreet"> </div><label for="prospectiveEmployerCSZ" class="col-md-3 control-label col-form-label">City, State, Zip:</label> <div class="col-md-3"> <input type="text" readonly="" class="form-control" placeholder="City, State, Zip" name="prospectiveEmployerCSZ" value="' + CompanyDtls.cityStateZip + '" id="prospectiveEmployerCSZ"> </div></div><div class="form-group row"> In compliance with §40.25(g) and 391.23(h), release of this information must be made in a written form that ensures confidentiality, such as fax, email, or letter <label for="prospectiveEmployerFax" class="col-md-2 control-label col-form-label">Prospective employer’s fax number::</label> <div class="col-md-4"> <input type="text" class="form-control" placeholder="prospectiveEmployerFax" name="prospectiveEmployerFax" value="' + CompanyDtls.fax + '" id="prospectiveEmployerFax"> </div><label for="prospectiveEmployerEmail" class="col-md-3 control-label col-form-label">Prospective employer’s email address:</label> <div class="col-md-3"> <input type="text" class="form-control" placeholder="prospectiveEmployerEmail" name="prospectiveEmployerEmail" value="' + CompanyDtls.email + '" id="prospectiveEmployerEmail"> </div></div><div class="form-group row"> <label for="name" class="col-md-2 control-label col-form-label">Applicant’s Signature:</label> <div class="col-md-4"> ' + ImagesAttachment + ' <br></div><label for="name" class="col-md-3 control-label col-form-label"> Date:</label> <div class="col-md-3"> <input type="date" class="form-control" placeholder="Applicant’s Signature" name="" value="" id=""> </div></div><br><hr> <h4 style="text-align:center;">PART 2: TO BE COMPLETED BY PREVIOUS EMPLOYER</h4> <h5 style="text-align:center;">EMPLOYMENT VERIFICATION</h5> <div class="form-group row"> <label for="employedBy" class="col-md-9 control-label col-form-label">The applicant named above was employed by us:</label> <div class="col-md-3"> <select class="select2 form-control custom-select" name="employedBy" style="width: 100%; height:36px;"> <option value="">Select Here</option> <option value="YES">YES</option> <option value="NO">NO</option> </select> </div></div><div class="form-group row"> <label for="jobDesignation" class="col-md-2 control-label col-form-label">Employed as:</label> <div class="col-md-2"> <input type="text" class="form-control" placeholder="Employed as" name="jobDesignation" value="" id="jobDesignation"> </div><label for="previousfrom" class="col-md-2 control-label col-form-label">From:</label> <div class="col-md-2"> <input type="text" class="form-control" placeholder="From" readonly name="previousfrom" value="' + getDetails.fromDate + '" id="previousfrom"> </div><label for="previousto" class="col-md-2 control-label col-form-label">To:</label> <div class="col-md-2"> <input type="text" class="form-control" placeholder="To" readonly name="previousto" value="' + getDetails.toDate + '" id="previousto"> </div></div><div class="form-group row"> <label for="motorVehicleForYou" class="col-md-9 control-label col-form-label">1. Did he/she drive motor vehicle for you? :</label> <div class="col-md-3"> <select class="select2 form-control custom-select" name="motorVehicleForYou" style="width: 100%; height:36px;"> <option value="">Select Here</option> <option value="YES">YES</option> <option value="NO">NO</option> </select> </div></div><div class="form-group row"> <label for="whatType" class="col-md-9 control-label col-form-label">If yes, what type?</label> <div class="col-md-3"> <select class="select2 form-control custom-select" name="whatType" style="width: 100%; height:36px;"> <option value="">Select Here</option> <option value="Straight Truck">Straight Truck </option> <option value="Tractor-Semi trailer"> Tractor-Semi trailer</option> <option value="Bus">Bus</option> <option value="Cargo Tank">Cargo Tank</option> <option value="Doubles/Triples">Doubles/Triples </option> <option value="Other">Other</option> </select> <input type="text" class="form-control" placeholder="Other" name="whatTypeOther" value="" id="whatTypeOther"> <input type="text" class="form-control" placeholder="Comment" name="whatTypeComment" value="" id="whatTypeComment"> </div></div><div class="form-group row"> <label for="reasonForLeaving" class="col-md-9 control-label col-form-label">2. Reason for leaving your employment: </label> <div class="col-md-3"> <select class="select2 form-control custom-select" name="reasonForLeaving" style="width: 100%; height:36px;"> <option value="">Select Here</option> <option value="Discharged">Discharged</option> <option value="Resignation">Resignation</option> <option value="LayOff">LayOff</option> <option value="MilitaryDuty">MilitaryDuty </option> </select> </div></div><div class="form-group row"> <label for="completeByCompany" class="col-md-2 control-label col-form-label">Complete by company</label> <div class="col-md-4"> <input type="text" class="form-control" placeholder="Complete by company" name="completeByCompany" id="completeByCompany"> </div><label for="previousEmployerAddress" class="col-md-1 control-label col-form-label">Address:</label> <div class="col-md-5"> <input type="text" class="form-control" placeholder="Address" name="previousEmployerAddress" value="' + getDetails.address + '" id="previousEmployerAddress"> </div></div><div class="form-group row"> <label for="previousEmployerCSZ" class="col-md-2 control-label col-form-label">City, State, Postal Code</label> <div class="col-md-4"> <input type="text" class="form-control" placeholder="City, State, Postal Code" name="previousEmployerCSZ" value="" id="previousEmployerCSZ"> </div><label for="previousEmployerPhone" class="col-md-1 control-label col-form-label">Telephone:</label> <div class="col-md-5"> <input type="text" class="form-control" placeholder="Telephone" name="previousEmployerPhone" value="" id="previousEmployerPhone"> </div></div><div class="form-group row"> <label for="name" class="col-md-2 control-label col-form-label">Signature</label> <div class="col-md-4"> <br></div><label for="name" class="col-md-3 control-label col-form-label">Date:</label> <div class="col-md-3"><!-- <input type="date" class="form-control" placeholder="Date" name="previousEmployerDate" value="" id="previousEmployerDate"> --> </div></div><br><hr> <h4 style="text-align:center;">PART 3: TO BE COMPLETED BY PREVIOUS EMPLOYER</h4> <h5 style="text-align:center;">ACCIDENT HISTORY</h5> ACCIDENTS: Complete the following for any accidents included on your accident register (§390.15 (b)) that involved the “applicant in the 2 years prior to the application date shown above, or check 0 here if there is no accident register data for this driver <div class="form-group row"> <label for="previousEmployerAnyInuries" class="col-md-9 control-label col-form-label">Please select YES if you have any injuries</label> <div class="col-md-3"> <select class="select2 form-control custom-select table_selectbox" name="previousEmployerAnyInuries" style="width: 100%; height:36px;"> <option value="">Select Here</option> <option value="YES">YES</option> <option value="NO">NO</option> </select> </div></div><table class="table table-bordered part3table"> <thead> <tr> <th scope="col">#</th> <th scope="col">Date</th> <th scope="col">Location</th> <th scope="col">Injuries</th> <th scope="col">Fatalities</th> <th scope="col">Hazmat Spill</th> </tr></thead> <tbody> <tr> <th scope="row">1</th> <td><input type="date" class="form-control" placeholder="Date" name="previousEmployertableoneDate" value="" id="previousEmployertableoneDate"> </td><td><input type="text" class="form-control" placeholder="Location" name="previousEmployertableoneLocation" value="" id="previousEmployertableoneLocation"> </td><td><input type="text" class="form-control" placeholder="Injuries" name="previousEmployertableoneInjuries" value="" id="previousEmployertableoneInjuries"> </td><td><input type="text" class="form-control" placeholder="Fatalities" name="previousEmployertableoneFatalities" value="" id="previousEmployertableoneFatalities"> </td><td><input type="text" class="form-control" placeholder="Hazmatspill" name="previousEmployertableoneHazmatSpill" value="" id="previousEmployertableoneHazmatSpill"> </td></tr><tr> <th scope="row">2</th> <td><input type="date" class="form-control" placeholder="Date" name="previousEmployertableTwoDate" value="" id="previousEmployertableTwoDate"> </td><td><input type="text" class="form-control" placeholder="Location" name="previousEmployertableTwoLocation" value="" id="previousEmployertableTwoLocation"> </td><td><input type="text" class="form-control" placeholder="Injuries" name="previousEmployertableTwoInjuries" value="" id="previousEmployertableTwoInjuries"> </td><td><input type="text" class="form-control" placeholder="Fatalities" name="previousEmployertableTwoFatalities" value="" id="previousEmployertableTwoFatalities"> </td><td><input type="text" class="form-control" placeholder="Hazmatspill" name="previousEmployertableTwoHazmatSpill" value="" id="previousEmployertableTwoHazmatSpill"> </td></tr><tr> <th scope="row">3</th> <td><input type="date" class="form-control" placeholder="Date" name="previousEmployertableThreeDate" value="" id="previousEmployertableThreeDate"> </td><td><input type="text" class="form-control" placeholder="Location" name="previousEmployertableThreeLocation" value="" id="previousEmployertableThreeLocation"> </td><td><input type="text" class="form-control" placeholder="Injuries" name="previousEmployertableThreeInjuries" value="" id="previousEmployertableThreeInjuries"> </td><td><input type="text" class="form-control" placeholder="Fatalities" name="previousEmployertableThreeFatalities" value="" id="previousEmployertableThreeFatalities"> </td><td><input type="text" class="form-control" placeholder="Hazmatspill" name="previousEmployertableThreeHazmatSpill" value="" id="previousEmployertableThreeHazmatSpill"> </td></tr></tbody> </table> <div class="form-group row"> <label for="companyPolicies" class="col-md-6 control-label col-form-label">Please provide information concerning any other accidents involving the applicant that were reported to government agencies or insurers or retained under internal company policies:</label> <div class="col-md-6"> <input type="text" class="form-control" placeholder="Policy" name="companyPolicies" id="companyPolicies"> </div></div><div class="form-group row"> <label for="name" class="col-md-6 control-label col-form-label">Any other remarks:</label> <div class="col-md-6"> <input type="text" class="form-control" placeholder="Remarks" name="remarks" value="" id="remarks"> </div></div></div>'
            tableData += '<input type="hidden" name="driverSign" value=' + attachmentpath + '><div style="text-align: center;" class="card-body"> <h4 style="">Please Enter Multiple email by using comma (,)</h4>   <input type="text" class="form-control" placeholder="Reference Email this will be multiple" name="RefPreviousEmployerEmailArr" id="RefPreviousEmployerEmailArr">   <button id="sendMailToPrev1"  class="btn btn-primary sendMailToPrev">Send form thorugh E-mail</button></div> <hr> </form>';
        });
        res.json({ status: true, data: tableData, getReferenceDtls: getReferenceDtls });
    }
    else {
        res.json({ status: false });
    }
});





router.getFormStatus = ('/getFormStatus/', async (req, res) => {
    let getReferenceDtls = await Reference.findOne({ where: { driverId: req.query.id }, raw: true });
    let getReferenceDtlsAll = await Reference.findAll({ where: { driverId: req.query.id }, raw: true });

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





//Rajesh code
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

module.exports = router;