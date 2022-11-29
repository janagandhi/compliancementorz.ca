const path = require('path');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const router = express.Router();
const session = require('express-session');


/**
 * After Login
 */
// router.afterLogin = (req, res, next) => {
let drivercheck = (req, res, next) => {
    res.locals.sessEmail = (req.session.email == "undefined") ? '' : req.session.email
    res.locals.sessName = (req.session.name == "undefined") ? 'Driver' : req.session.name
    res.locals.sessid = (req.session.id == "undefined") ? '' : req.session.id
    try {
        console.log(req.session.adminRole);
        if (typeof req.session.adminRole != "undefined" && typeof req.session.adminRole != "" && req.session.adminRole != 0 && req.session.adminRole != 1) {
        // if (typeof req.session.adminRole != "undefined") {
            console.log("session granted");
            throw 'Admin Session Exist';
        } else {
            res.redirect('/logout');
            console.log("session expired");
        }
    } catch (error) {
        next();
    }
}
let companycheck = (req, res, next) => {
    console.log(req.session.adminRole);
    console.log("company Session");
    res.locals.sessEmail = (req.session.email == "undefined") ? 'Info@compliancementorz.com' : req.session.email
    res.locals.sessName = (req.session.name == "undefined") ? 'Superadmin' : req.session.name
    try {
        if (typeof req.session.adminRole == "undefined" || typeof req.session.adminRole == "" || req.session.adminRole == 1) {

            res.redirect('/logout');
            console.log("session expired");
        } else {
            console.log("session granted");
            throw 'Admin Session Exist';
        }
    } catch (error) {
        next();
    }
}

let superadminCheck = (req, res, next) => {
    console.log(req.session.adminRole);
    console.log("Superadmin Session");
    res.locals.sessEmail = 'Info@compliancementorz.com';
    res.locals.sessName = 'Superadmin';
    try {
        if (typeof req.session.adminRole == "undefined" || typeof req.session.adminRole == "" || req.session.adminRole == 0) {

            res.redirect('/logout');
            console.log("session expired");
        } else {
            console.log("session granted");
            throw 'Superadmin Session Exist';
        }
    } catch (error) {
        next();
    }
}

let Common = (req, res, next) => {
    console.log(req.session.adminRole);
    console.log("company Session");
    res.locals.sessEmail = (req.session.email == "undefined") ? 'Info@compliancementorz.com' : req.session.email
    res.locals.sessName = (req.session.name == "undefined") ? 'Superadmin' : req.session.name
    try {
        if (typeof req.session.adminRole == "undefined" || typeof req.session.adminRole == "") {

            res.redirect('/logout');
            console.log("session expired");
        } else {
            console.log("session granted");
            throw 'Superadmin Session Exist';
        }
    } catch (error) {
        next();
    }

}

module.exports = { companycheck: companycheck,superadminCheck:superadminCheck,drivercheck:drivercheck,Common:Common }