const path = require('path');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
// const mysql = require('mysql');
const app = express();
const router = express.Router();
const session = require('express-session');
const db = require("../models");
// const Admin_login = db.admin_login;
const Driver = db.driver;
const Admin = db.admin;
const Company = db.company;
const Loginaudit = db.loginaudit;
const Op = db.Sequelize.Op;
app.use(session({
    secret: 'gtest',
    resave: false,
    saveUninitialized: true
}))
router.login = (req, res) => {
    res.render('login', {
        title: 'Login'
    });
}
router.adminLogin = (req, res) => {
    res.render('adminLogin', {
        title: 'adminLogin'
    });
}
router.driverLogin = (req, res) => {
    res.render('driverLogin', {
        title: 'driverLogin'
    });
}
// router.passwordCheck = ('/passwordCheck/',(req, res) => {
//     let email = req.body.email;
//     let password = req.body.password;
//     let sql = "SELECT * FROM users WHERE email = '"+email+"' AND password = '"+password+"'";
//     let query = connection.query(sql, (err, results) => {
//     //   if(err) throw err;
//     if(results.length > 0){
//         // console.log('success');
//         req.session.email = email;
//         // console.log(req.session.email);
//         console.log('passwordCheck');
//         res.json({status:true,message:'Login success'});
//         // res.redirect('/dashboard');
//     }
//     else{
//     console.log('please check password');
//         // res.redirect('/');
//         res.json({status:false,message:'please check password'});
//     }
//     });
// });
//Password check Driver
router.passwordCheckDriver = ('/passwordCheckDriver/', async (req, res) => {
    try {
        let license = req.body.license;
        let password = req.body.password;
        let loginCheck = await Driver.findOne({ where: { driver_license: license, password: password,active:0 }, raw: true });
        console.log(loginCheck);
        if (loginCheck) {
            let sess = req.session;
            req.session.license = loginCheck.license;
            // res.session.name = loginCheck.driver_name;
            sess.name = loginCheck.driver_name;
            sess.email  = loginCheck.email;
            sess.id = loginCheck.id;
            sess.driver_id = loginCheck.id;
            sess.company_id = loginCheck.company_id;
            sess.adminRole = 2;
            // console.log(req.session.email);
            // console.log('passwordCheck');
            res.json({ status: true, message: 'Login success' });
            // res.redirect('/dashboard');
        }
        else {
            console.log('please check password');
            // console.log(loginCheck.email);
            // res.redirect('/');
            res.json({ status: false, message: 'please check password' });
        }
    }
    catch (e) {
        res.json({ status: false, message: 'Something went wrong', detail: e });
        return false;
    }
});
//Password check admin
router.passwordCheckAdmin = ('/passwordCheckAdmin/', async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let loginCheck = await Admin.findOne({ where: { username: email, password: password }, raw: true });
    console.log(loginCheck);
    if (loginCheck) {
        console.log(loginCheck.username);
        console.log(email);
        req.session.email = loginCheck.username;
        // res.locals.data = loginCheck.username;
        req.session.adminRole = 1;
        // console.log(req.session.email);
        // console.log('passwordCheck');
        res.json({ status: true, message: 'Login success' });
        // res.redirect('/dashboard');
    }
    else {
        console.log('please check password');
        // console.log(loginCheck.email);
        // res.redirect('/');
        res.json({ status: false, message: 'please check password' });
    }
});
router.passwordCheck = ('/passwordCheck/', async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let loginCheck = await Company.findOne({ where: { username: email, password: password, active: 0 }, raw: true });
    console.log(loginCheck);
    if (loginCheck) {
        // console.log(loginCheck.username);
        // console.log(email);
        req.session.name = loginCheck.name;
        req.session.email = loginCheck.username;
        req.session.userId = loginCheck.id;
        // res.locals.data = loginCheck.username;
        req.session.adminRole = 0;
        // console.log(req.session.email);
        // console.log('passwordCheck');
        let date = new Date();
        var logindatetimeData =
            ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
            ("00" + date.getDate()).slice(-2) + "-" +
            date.getFullYear() + " " +
            ("00" + date.getHours()).slice(-2) + ":" +
            ("00" + date.getMinutes()).slice(-2) + ":" +
            ("00" + date.getSeconds()).slice(-2);
        var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
        let create_Company = await Loginaudit.create({ userid: loginCheck.id, name: loginCheck.name, logindatetime: logindatetimeData, ipaddress: ip });
        res.json({ status: true, message: 'Login success' });
        // res.redirect('/dashboard');
    }
    else {
        console.log('please check password');
        // console.log(loginCheck.email);
        // res.redirect('/');
        res.json({ status: false, message: 'please check password' });
    }
});
module.exports = router;