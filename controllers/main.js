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
const { driverCompany } = require('../models');

const Users = db.users;

const Loginaudit = db.loginaudit;

const Company = db.company;

const Driver = db.driver;

const Truck = db.truck;

const Trailer = db.trailer;

const driverexp_history = db.driverexp_history;

const Driverdetails = db.driverdetails;

const Driveraddress = db.driveraddress;

const Employmenthistory = db.employmenthistory;

const Employementhistroyaddress = db.employementhistroyaddress;

const Drivinghistory = db.drivinghistory;

const Drivinghistoryaddress = db.drivinghistoryaddress;

const Drivinghistoryaccident = db.drivinghistoryaccident;

const Drivinghistoryviolations = db.drivinghistoryviolations;

const Certificateauth = db.certificateauth;

const Hos = db.hos;

const FileuploadDB = db.fileupload;

const Feedback = db.feedback;

const Questiongroupone = db.questiongroupone;

const Questiongrouptwo = db.questiongrouptwo;

const Canadahos = db.canadahos;

const Usquestion = db.usquestion;

const weightDimensions = db.weightDimensions;

const Flabted_checklist = db.flabted_checklist;

const Companychecklist = db.companychecklist;
const Companyquiz = db.companyquiz;

const Disclaimer = db.disclaimer;

const safetyLaws = db.safetyLaws;
const motorVehicleDriverCertificate = db.motorVehicleDriverCertificate;
const DriverCompany = db.driverCompany;
const annualreview = db.annualreview;

const Op = db.Sequelize.Op;

const sequelize = db.sequelize;

const getMonthDifferenceFunction = microServices.getMonthDifference;

const fileUpload = microServices.filedataUpload;

const sendMail = microServices.sendMail;
const sendMailGrid = microServices.sendMailGrid;

const sendMailTest = microServices.sendMailTest;

app.use(session({

    secret: 'gtest',

    resave: false,

    saveUninitialized: true

}))

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

router.GetDriveralertModule = ('/GetDriveralertModule', async (req, res) => {

    // let getdriverdtls  = await Driver.findOne({where : {id : req.session.userId},raw : true});

    let getcmpdtls = await Company.findOne({ raw: true });

    console.log(getcmpdtls);

    res.render('GetDriveralertModule', {

        title: 'Manage Alert',

        getcmpdtls: getcmpdtls

    });

});

router.GettruckalertModule = ('/GettruckalertModule', async (req, res) => {

    // let getdriverdtls  = await truck.findOne({where : {id : req.session.userId},raw : true});

    let getcmpdtls = await Company.findOne({ where: { id: req.session.userId }, raw: true });

    console.log(getcmpdtls);

    res.render('GettruckalertModule', {

        title: 'Manage Alert',

        getcmpdtls: getcmpdtls

    });

});

router.GettraileralertModule = ('/GettraileralertModule', async (req, res) => {

    // let getdriverdtls  = await trailer.findOne({where : {id : req.session.userId},raw : true});

    let getcmpdtls = await Company.findOne({ where: { id: req.session.userId }, raw: true });

    console.log(getcmpdtls);

    res.render('GettraileralertModule', {

        title: 'Manage Alert',

        getcmpdtls: getcmpdtls

    });

});

router.alertfreq = ('/alertfreq/', async (req, res) => {

    console.log(req.body.st);

    let freq;

    if (req.body.st == "true") {

        freq = 0 //week

    } else {

        freq = 1 // month

    }

    // console.log(freq);

    // return false;

    let id = req.body.id;

    let update_alertFreq = await Company.update({ alert_frequency: freq }, {

        where: {

            id: id

        }

    });

    if (update_alertFreq) {

        res.json({ status: true, message: 'alert frequency Updated' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});

router.GetDriveralert = ('/GetDriveralert', async (req, res) => {

    let company1;

    if (req.query.exprange == 'expired_list') {

        company1 = await sequelize.query('SELECT d.id,c.name AS companyname,d.driver_name,STR_TO_DATE(d.' + req.query.exptype + ', "%d/%m/%Y") AS ' + req.query.exptype + ' FROM driver AS d JOIN company AS c ON d.company_id = c.id WHERE company_id = ' + req.session.userId + ' AND STR_TO_DATE(d.' + req.query.exptype + ', "%d/%m/%Y") <= DATE(NOW())', {

            raw: true, // pass true here if you have any mapped fields

        });

    } else {

        company1 = await sequelize.query('SELECT d.id,c.name AS companyname,d.driver_name,STR_TO_DATE(d.' + req.query.exptype + ', "%d/%m/%Y") AS ' + req.query.exptype + ' FROM driver AS d JOIN company AS c ON d.company_id = c.id WHERE company_id = ' + req.session.userId + ' AND  STR_TO_DATE(d.' + req.query.exptype + ', "%d/%m/%Y") >= DATE(NOW()) AND STR_TO_DATE(d.' + req.query.exptype + ', "%d/%m/%Y") <= DATE(NOW()) + INTERVAL ' + req.query.exprange + ' DAY;', {

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

    // }else if(req.query.exptype == 'passport_expiry'){

    //  }

})

router.GetDriveralerthistory = ('/GetDriveralerthistory', async (req, res) => {

    // This query will pull 7 days license_expiry

    let company1 = await sequelize.query('SELECT driver_id,driver_name,companyname,to_mail,created_date,COUNT(driver_id) AS mailcount FROM `driverexp_history` WHERE company_id = ' + req.session.userId + ' GROUP BY driver_id ORDER BY COUNT(driver_id) DESC;', {

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

    res.render('GetDriveralertModuleHistory', {

        title: 'Manage Alert History',

        data: data

    });

})

router.GetDriveralerthistorybyID = ('/GetDriveralerthistorybyID', async (req, res) => {

    let driverid = req.query.id;

    // let driverid = 279

    res.render('GetDriveralerthistorybyID', {

        title: 'Get Alert History',

        driverid: driverid

    });

});

router.GetDriveralerthistorybyIDdata = ('/GetDriveralerthistorybyIDdata', async (req, res) => {

    // console.log('GetDriveralerthistorybyIDdata');

    //  console.log(req);

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

        //  driver_id:279

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

        //  console.log(data);

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

        console.log(data);

        res.json({

            "recordsTotal": data.length,

            "recordsFiltered": dt.total,

            data

        });

        // console.log(data.length);

        // console.log(dt.total);

        console.log(data);

    });

});

router.GetTruckalert = ('/GetTruckalert', async (req, res) => {

    let company1;

    if (req.query.exprange == 'expired_list') {

        company1 = await sequelize.query('SELECT t.id,t.truck_unit,STR_TO_DATE(t.' + req.query.exptypeTruck + ', "%d/%m/%Y") AS ' + req.query.exptypeTruck + ',t.company_id,c.id AS driver,(SELECT driver_name FROM driver WHERE company_id = ' + req.session.userId + '  AND id =  t.company_id LIMIT 1) AS driver_name FROM truck AS t JOIN company AS c ON c.id = t.company_id WHERE t.company_id =' + req.session.userId + ' AND c.active = 0 AND  t.active = 0 AND STR_TO_DATE(t.' + req.query.exptypeTruck + ', "%d/%m/%Y") <= DATE(NOW())', {

            raw: true, // pass true here if you have any mapped fields

        });

    } else {

        company1 = await sequelize.query('SELECT t.id,t.truck_unit,STR_TO_DATE(t.' + req.query.exptypeTruck + ', "%d/%m/%Y") AS ' + req.query.exptypeTruck + ',t.company_id,c.id AS driver,(SELECT driver_name FROM driver WHERE company_id = ' + req.session.userId + '  AND id =  t.company_id LIMIT 1) AS driver_name FROM truck AS t JOIN company AS c ON c.id = t.company_id WHERE company_id = ' + req.session.userId + ' AND c.active = 0 AND  t.active = 0 AND STR_TO_DATE(t.' + req.query.exptypeTruck + ', "%d/%m/%Y") >= DATE(NOW()) AND STR_TO_DATE(t.' + req.query.exptypeTruck + ', "%d/%m/%Y") <= DATE(NOW()) + INTERVAL ' + req.query.exprange + ' DAY;', {

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

router.GetTruckalerthistory = ('/GetTruckalerthistory', async (req, res) => {

    // This query will pull 7 days license_expiry

    let company1 = await sequelize.query('SELECT driver_id,driver_name,truckname,to_mail,companyname,created_date,COUNT(driver_id) AS mailcount FROM `truckexp_history` WHERE company_id = ' + req.session.userId + ' GROUP BY driver_id ORDER BY COUNT(driver_id) DESC;', {

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

    res.render('GetTruckalertModuleHistory', {

        title: 'Manage Alert History',

        data: data

    });

})

router.GetTruckalerthistorybyID = ('/GetTruckalerthistorybyID', async (req, res) => {

    let driverid = req.query.id;

    // let driverid = 279

    res.render('GetTruckalerthistorybyID', {

        title: 'Get Alert History',

        driverid: driverid

    });

});

router.GetTruckalerthistorybyIDdata = ('/GetTruckalerthistorybyIDdata', async (req, res) => {

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

    const options = {

        page: ((req.query.start / req.query.length) + 1) || 1,

        paginate: parseInt(req.query.length) || 25,

        order: [[columns, col, direction]],

        attributes: columns,

        raw: true,

        where: { driver_id: req.query.driverid }

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

});

router.GetTraileralert = ('/GetTraileralert', async (req, res) => {

    let company1;

    if (req.query.exprange == 'expired_list') {

        company1 = await sequelize.query('SELECT t.id,t.trailer_unit,STR_TO_DATE(t.' + req.query.exptype + ', "%d/%m/%Y") AS ' + req.query.exptype + ',t.company_id,c.id AS driver,c.name AS companyname,(SELECT driver_name FROM driver WHERE company_id = ' + req.session.userId + ' AND id =  t.company_id LIMIT 1) AS driver_name FROM trailer AS t JOIN company AS c ON c.id = t.company_id WHERE c.active = 0 AND  t.active = 0 AND STR_TO_DATE(t.' + req.query.exptype + ', "%d/%m/%Y") <= DATE(NOW());', {

            raw: true, // pass true here if you have any mapped fields

        });

    } else {

        company1 = await sequelize.query('SELECT t.id,t.trailer_unit,STR_TO_DATE(t.' + req.query.exptype + ', "%d/%m/%Y") AS ' + req.query.exptype + ',t.company_id,c.id AS driver,c.name AS companyname,(SELECT driver_name FROM driver WHERE company_id = ' + req.session.userId + ' AND id =  t.company_id LIMIT 1) AS driver_name FROM trailer AS t JOIN company AS c ON c.id = t.company_id WHERE c.active = 0 AND  t.active = 0 AND company_id = ' + req.session.userId + '  AND STR_TO_DATE(t.' + req.query.exptype + ', "%d/%m/%Y") >= DATE(NOW()) AND STR_TO_DATE(t.' + req.query.exptype + ', "%d/%m/%Y") <= DATE(NOW()) + INTERVAL ' + req.query.exprange + ' DAY;', {

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

router.GetTraileralerthistory = ('/GetTraileralerthistory', async (req, res) => {

    // This query will pull 7 days license_expiry

    let company1 = await sequelize.query('SELECT driver_id,driver_name,to_mail,trailername,companyname,created_date,COUNT(driver_id) AS mailcount FROM `trailerexp_history` WHERE company_id = ' + req.session.userId + ' GROUP BY driver_id ORDER BY COUNT(driver_id) DESC;', {

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

    res.render('GetTraileralertModuleHistory', {

        title: 'Manage Alert History',

        data: data

    });

})

router.GetTraileralerthistorybyID = ('/GetTraileralerthistorybyID', async (req, res) => {

    let driverid = req.query.id;

    // let driverid = 279

    res.render('GetTraileralerthistorybyID', {

        title: 'Get Alert History',

        driverid: driverid

    });

});

router.GetTraileralerthistorybyIDdata = ('/GetTraileralerthistorybyIDdata', async (req, res) => {

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

});

router.dashboard = ('/dashboard/', async (req, res) => {

    console.log('dashboard');

    console.log(req.session);

    if (req.session.adminRole == 1) {

        let getLogs = await Loginaudit.findAll({

            limit: 5, order: [

                ['id', 'DESC']

            ], raw: true

        });

        let getCmpCount = await Company.count({ distinct: 'id', where: { active: 0 } });

        let getTruckCount = await Truck.count({ distinct: 'id', where: { active: 0 } });

        let getTrailerCount = await Trailer.count({ distinct: 'id', where: { active: 0 } });

        var d = new Date();

        var strDate = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate();

        res.render('dashboard', {

            title: 'Dashboard',

            getLogs: getLogs,

            getCmpCount: getCmpCount,

            getTruckCount: getTruckCount,

            getTrailerCount: getTrailerCount,

            todaysday: strDate,

            // email : req.session.email

            email: 'test'

        });

    } else if (req.session.adminRole == 0) {

        // res.render('companydashboard', {

        //     title : 'companydashboard',

        //     // email : req.session.email

        //     email : 'test'

        // });

        res.redirect('/companydashboard');

    } else {

        res.redirect('/logout');

    }

});

router.driverDashboard = ('/driverDashboard/', async (req, res) => {

    // console.log('driverDashboard');

    res.render('driverDashboard', {

        title: 'driverDashboard',

        name: req.session.name

    });

})

router.companydashboard = ('/companydashboard/', async (req, res) => {

    console.log(req.session.userId);

    // This query will pull 7 days license_expiry

    //    let company1 = await sequelize.query('SELECT d.id,c.name AS companyname,d.driver_name,STR_TO_DATE(d.license_expiry, "%d/%m/%Y") AS license_expiry FROM driver AS d JOIN company AS c ON d.company_id = c.id WHERE STR_TO_DATE(d.license_expiry, "%d/%m/%Y") >= DATE(NOW()) AND STR_TO_DATE(d.license_expiry, "%d/%m/%Y") <= DATE(NOW()) + INTERVAL 7 DAY AND c.alert_frequency = 1;', {

    //     raw: true, // pass true here if you have any mapped fields

    //   });

    let company1 = await sequelize.query('SELECT d.id,c.name AS companyname,d.driver_name,STR_TO_DATE(d.license_expiry, "%d/%m/%Y") AS license_expiry FROM driver AS d JOIN company AS c ON d.company_id = c.id WHERE company_id = ' + req.session.userId + ' AND  STR_TO_DATE(d.license_expiry, "%d/%m/%Y") >= DATE(NOW()) AND STR_TO_DATE(d.license_expiry, "%d/%m/%Y") <= DATE(NOW()) + INTERVAL 7 DAY;', {

        raw: true, // pass true here if you have any mapped fields

    });

    let company1data = company1[0];

    //   res.json({

    //          "recordsTotal": data.length,

    //          "recordsFiltered": data.length,

    //          data

    //      });

    let getcompany = await Company.findOne({ where: { id: req.session.userId }, raw: true });

    let getDriverCount = await Driver.count({ distinct: 'company_id', where: { company_id: req.session.userId } });

    let getTruckCount = await Truck.count({ distinct: 'company_id', where: { company_id: req.session.userId } });

    let getTrailerCount = await Trailer.count({ distinct: 'company_id', where: { company_id: req.session.userId } });

    // var d = new Date();

    // var strDate = d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate();

    res.render('companydashboard', {

        title: 'companydashboard',

        name: getcompany.name,

        email: getcompany.email,

        getDriverCount: getDriverCount,

        getTruckCount: getTruckCount,

        getTrailerCount: getTrailerCount,

        company1data: company1data,

        getcompany: getcompany

    });

});

router.company = (req, res) => {

    res.render('company', {

        title: 'Manage company'

    });

};

router.getCompanyCSV = async (req, res) => {

    // let getcompany  = await Company.findOne({where : {id : req.session.userId},raw : true});

    let getcompany = await Company.findAll({ raw: true });

    const csv = new ObjectsToCsv(getcompany)

    let csvforming = await csv.toDisk('./public/temp/list.csv', { append: true })

    if (csvforming) {

        res.json({ status: true, filename: 'list.csv' });

    }

    console.log(getcompany);

    // const csvString =  json2csv(getcompany);

    // res.setHeader('Content-disposition', 'attachment; filename=list.csv');

    // res.set('Content-Type', 'text/csv');

    // res.status(200).send(csvString);

}

router.getCompany = async (req, res) => {

    console.log('get company');

    // console.log(req.query.columns);

    console.log(req.query.draw);

    console.log(req.query.search.value);

    let col = req.query.columns[[0]].column || 'id';

    let direction = req.query.columns[[0]].dir || 'DESC';

    let columns = ['id', 'name'];

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

    const options = {

        page: ((req.query.start / req.query.length) + 1) || 1,

        paginate: parseInt(req.query.length) || 25,

        order: [[columns, col, direction]],

        attributes: columns,

        raw: true,

        where: { active: 0 }

    }

    await Company.paginate(options).then(function (dt) {

        let data = dt.docs.map(formData);

        function formData(key) {

            key.id = key.id,

                key.name = key.name,

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

router.driver = (req, res) => {

    res.render('driver', {

        title: 'Manage Drivers'

    });

};

router.getDriver = async (req, res) => {

    console.log('get driver');

    // console.log(req.query.search.value);

    console.log(req.query.draw);

    console.log(req.query.search.value);

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

    where.push({ company_id: req.session.userId });

    const options = {

        page: ((req.query.start / req.query.length) + 1) || 1,

        paginate: parseInt(req.query.length) || 25,

        order: [[columns, col, direction]],

        attributes: columns,

        raw: true,

        where: where

        // where : {active:0}

    }

    await Driver.paginate(options).then(function (dt) {

        let data = dt.docs.map(formData);

        function formData(key, index) {

            index = index + 1

            // console.log(key);

            // let i = 1;

            key.id = key.id,

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

            key.name = key.name,

                Object.assign(key, {

                    action: "<a href='javascript:void(0)' data-id='" + key.id + "' id='editmodalid' class='btn  btn-warning editmodalclass'><span class='fas fa-edit'> Edit</span></a>&nbsp;" +

                        "<a href='javascript:void(0)' data-id='" + key.id + "' id='' class='btn btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a> " +

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
	if(getdriver.email!=req.body.email){
		var req_license = req.body.driver_license;
        var req_driver_name = req.body.driver_name;
        var password = req_license.slice(req_license.length - 4) + '-' + req_driver_name.slice(0, 3);

        let to = req.body.email
        let userName = req.body.driver_license
        let cc = 'compliancementorzportal@gmail.com'
        let subject = 'Welcome to new portal'
        let message = '<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width,initial-scale=1"> <meta name="x-apple-disable-message-reformatting"> <title></title> <style>table, td, div, h1, p{font-family: Arial, sans-serif;}@media screen and (max-width: 530px){.unsub{display: block; padding: 8px; margin-top: 14px; border-radius: 6px; background-color: #555555; text-decoration: none !important; font-weight: bold;}.col-lge{max-width: 100% !important;}}@media screen and (min-width: 531px){.col-sml{max-width: 27% !important;}.col-lge{max-width: 73% !important;}}</style></head><body style="margin:0;padding:0;word-spacing:normal;background-color:#939297;"> <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297;"> <table role="presentation" style="width:100%;border:none;border-spacing:0;"> <tr> <td align="center" style="padding:0;"> <table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;"> <tr> <td style="padding:40px 30px 30px 30px;text-align:center;font-size:24px;font-weight:bold;"> <a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="165" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> </td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Hi ' + req.body.driver_name + ',</p> <br><p style="margin:0;">Welcome to new portal <a target="_blank" href="https://compliancementorz.ca/driverLogin"> Click here to Login new portal </a>  <br> Your  User Name: ' + userName + ' <br>  Password :' + password + '</td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Thank you,</p><p style="margin:0;">Safety Department  </p><br><a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="90" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> <p style="margin:0;">Tel: 905-486-1666</p><p style="margin:0;">Web: www.compliancementorz.com</p></td></tr><tr> <td style="padding:30px;text-align:center;font-size:12px;background-color:#404040;color:#cccccc;"> <p style="margin:0;font-size:14px;line-height:20px;">&reg; compliancementorz 2022</p></td></tr></table> </td></tr></table> </div></body></html>'
        let newDriverEmail = sendMailGrid(to, cc, subject, message, req, res,'helpdesk@compliancementorz.ca')
	}

    const fData = JSON.parse(JSON.stringify(req.body))

    // console.log(fData);

    let update_Drivers = await Driver.update(fData, {

        where: {

            id: req.body.id

        }

    });

    if (update_Drivers) {

        res.json({ status: true, message: 'Driver Updated' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});

router.createDriver = ('/createDriver/', async (req, res) => {

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

    var req_license     = req.body.driver_license;

    var req_driver_name = req.body.driver_name;

    var req_password    = req_license.slice(req_license.length - 4) + '-' + req_driver_name.slice(0,3);

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

    Object.assign(req.body, {

        //password: req.body.driver_license + '-' + req.body.driver_name // add json element

        password: req_password // add json element

    });

    const fData = JSON.parse(JSON.stringify(req.body))

    let to = req.body.email

    let userName = req.body.driver_license

    let cc = 'compliancementorzportal@gmail.com'

    let subject = 'Welcome to new portal'

     let message = '<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width,initial-scale=1"> <meta name="x-apple-disable-message-reformatting"> <title></title> <style>table, td, div, h1, p{font-family: Arial, sans-serif;}@media screen and (max-width: 530px){.unsub{display: block; padding: 8px; margin-top: 14px; border-radius: 6px; background-color: #555555; text-decoration: none !important; font-weight: bold;}.col-lge{max-width: 100% !important;}}@media screen and (min-width: 531px){.col-sml{max-width: 27% !important;}.col-lge{max-width: 73% !important;}}</style></head><body style="margin:0;padding:0;word-spacing:normal;background-color:#939297;"> <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297;"> <table role="presentation" style="width:100%;border:none;border-spacing:0;"> <tr> <td align="center" style="padding:0;"> <table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;"> <tr> <td style="padding:40px 30px 30px 30px;text-align:center;font-size:24px;font-weight:bold;"> <a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="165" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> </td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Hi ' + userName + ',</p> <br><p style="margin:0;">Welcome to the new portal <a href="compliancementorz.ca/driverLogin"> Click here to Login new portal </a> <br>  Your  Username: ' + userName + 'And  password :' + req.body.password + '</td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Thank you,</p><p style="margin:0;">Safety Department  </p><br><a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="90" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> <p style="margin:0;">Tel: 905-486-1666</p><p style="margin:0;">Web: www.compliancementorz.com</p></td></tr><tr> <td style="padding:30px;text-align:center;font-size:12px;background-color:#404040;color:#cccccc;"> <p style="margin:0;font-size:14px;line-height:20px;">&reg; compliancementorz 2022</p></td></tr></table> </td></tr></table> </div></body></html>' 

    //let newDriverEmail = sendMail(to, cc, subject, message, req, res)
	console.log('to:'+to);
	let newDriverEmail = sendMailGrid(to, cc, subject, message, req, res,'helpdesk@compliancementorz.ca')
    //// console.log(newDriverEmail);

    if (newDriverEmail) {

        let create_driver = await Driver.create(fData);

        if (create_driver) {

            res.json({ status: true, message: 'Driver Created' });

             return;

        } else {

            res.json({ status: false, message: 'Something went wrong' });

        } 

        res.json({ status: true, message: 'Mail sent' });

    }  else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});

// Truck crud

router.Truck = (req, res) => {

    res.render('truck', {

        title: 'Manage Trucks'

    });

};

router.getTruck = async (req, res) => {

    // console.log('get truck');

    // console.log(req.query.columns);

    // console.log(req.query.draw);

    // console.log(req.query.search.value);

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



    where.push({ company_id: req.session.userId });

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

            // console.log(key);

            // let i = 1;

            key.id = key.id,

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

    // console.log(req);

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

    if (req.body.annual_safety_current_attachment_file != "") {

        let truck_annual_safety_current = 'public/uploads/attachment/truck_annual_safety_current/';

        let annual_safety_current_attachmentdata = await fileUpload('truck_annual_safety_current', truck_annual_safety_current, req.body.annual_safety_current_attachment_file, req, res)

        Object.assign(req.body, {

            annual_safety_current_attachment: annual_safety_current_attachmentdata // add json element

        });

    }

    // else{

    //     delete req.body['annual_safety_current_attachment']; // delete json element

    // }

    if (req.body.annual_safety_last_attachment_file != "") {

        let truck_annual_safety_last = 'public/uploads/attachment/truck_annual_safety_last/';

        let annual_safety_last_attachmentdata = await fileUpload('truck_annual_safety_last', truck_annual_safety_last, req.body.annual_safety_last_attachment_file, req, res)

        Object.assign(req.body, {

            annual_safety_last_attachment: annual_safety_last_attachmentdata // add json element

        });

    }

    // else{

    //     delete req.body['annual_safety_last_attachment']; // delete json element

    // }

    let date = new Date();

    var updated_on =

        ("00" + (date.getMonth() + 1)).slice(-2) + "-" +

        ("00" + date.getDate()).slice(-2) + "-" +

        date.getFullYear() + " " +

        ("00" + date.getHours()).slice(-2) + ":" +

        ("00" + date.getMinutes()).slice(-2) + ":" +

        ("00" + date.getSeconds()).slice(-2);

    // console.log(req.session);

    Object.assign(req.body, {

        updated_on: updated_on // add json element

    });

    Object.assign(req.body, {

        company_id: req.session.userId // add json element

    });

    const fData = JSON.parse(JSON.stringify(req.body))

    // console.log(req.session.userId);

    let update_truck = await Truck.create(fData);

    if (update_truck) {

        res.json({ status: true, message: 'truck created' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});

// Trailer crud

router.Trailer = (req, res) => {

    res.render('trailer', {

        title: 'Manage Trailers'

    });

};

router.getTrailer = async (req, res) => {

    console.log('get trailer');

    // console.log(req.query.columns);

    // console.log(req.query.draw);

    // console.log(req.query.search.value);

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

    where.push({ company_id: req.session.userId });

    const options = {

        page: ((req.query.start / req.query.length) + 1) || 1,

        paginate: parseInt(req.query.length) || 25,

        order: [[columns, col, direction]],

        attributes: columns,

        raw: true,

        where: where

    }

    await Trailer.paginate(options).then(function (dt) {

        let data = dt.docs.map(formData);

        // function formData(key) {

        function formData(key, index) {

            index = index + 1

            // console.log(key);

            // let i = 1;

            key.id = key.id,

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

            // key.id = key.id,

            // key.name = key.name,

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

    let getTrailer = await Trailer.findOne({ where: { id: id }, raw: true });

    if (getTrailer) {

        res.json({ status: true, data: getTrailer });

    }

    else {

        res.json({ status: false });

    }

});

router.deleteTrailer = ('/deleteTrailer/', async (req, res) => {

    // console.log(req);

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

    if (req.body.preventive_maintenance_attachment_file != "") {

        let trailer_preventive_maintenance_attachment = 'public/uploads/attachment/trailer_preventive_maintenance_attachment/';

        let preventive_maintenance_attachmentdata = await fileUpload('trailer_preventive_maintenance_attachment', trailer_preventive_maintenance_attachment, req.body.preventive_maintenance_attachment_file, req, res)

        Object.assign(req.body, {

            preventive_maintenance_attachment: preventive_maintenance_attachmentdata // add json element

        });

    } else {

        delete req.body['preventive_maintenance_attachment']; // delete json element

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

    if (req.body.annual_safety_current_attachment_insert_file != "") {

        // console.log(1);

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

        // console.log(2);

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

        // console.log(3);

        let trailer_preventive_maintenance_attachment = 'public/uploads/attachment/trailer_preventive_maintenance_attachment/';

        let preventive_maintenance_attachmentdata = await fileUpload('trailer_preventive_maintenance_attachment', trailer_preventive_maintenance_attachment, req.body.preventive_maintenance_attachment_file, req, res)

        Object.assign(req.body, {

            preventive_maintenance_attachment: preventive_maintenance_attachmentdata // add json element

        });

    }

    //  else {

    //     delete req.body['preventive_maintenance_attachment']; // delete json element

    // }

    let date = new Date();

    var updated_on =

        ("00" + (date.getMonth() + 1)).slice(-2) + "-" +

        ("00" + date.getDate()).slice(-2) + "-" +

        date.getFullYear() + " " +

        ("00" + date.getHours()).slice(-2) + ":" +

        ("00" + date.getMinutes()).slice(-2) + ":" +

        ("00" + date.getSeconds()).slice(-2);

    // console.log(req.session);

    Object.assign(req.body, {

        updated_on: updated_on // add json element

    });

    Object.assign(req.body, {

        company_id: req.session.userId // add json element

    });

    const fData = JSON.parse(JSON.stringify(req.body))

    let update_trailer = await Trailer.create(fData);

    if (update_trailer) {

        res.json({ status: true, message: 'trailer created' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});

router.Profile = ('/Profile/', async (req, res, next) => {

    let getUsers = await Company.findOne({ where: { id: req.session.userId }, raw: true });

    try {

        res.render('profile', {

            title: 'profile',

            getUsers: getUsers

        });

    }

    catch (e) {

        // throw e;

        res.json({ status: false, message: 'Something went wrong', detail: e });

        return false;

    }

});

/*router.uploadImage = async (req, res, next) => {

	

    var matches = req.body.base64image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),

        response = {};

    if (matches.length !== 3) {

        return new Error('Invalid input string');

    }

    response.type = matches[1];

    // response.data = new Buffer(matches[2], 'base64');

    response.data = Buffer.from(matches[2], 'base64');

    let decodedImg = response;

    let imageBuffer = decodedImg.data;

    let type = decodedImg.type;

    let extension = mime.getExtension(type);

    var d = new Date();

    var time = d.getTime()

    let rand = Math.floor(Math.random() * 100);

    let generated_filename = time + rand;

    let fileName = generated_filename + '.' + extension;

    try {

		//let logo = 'public/uploads/company_logo/';

        // fs.writeFileSync("./uploads/" + fileName, imageBuffer, 'utf8');

        let imageprogress = await fs.writeFileSync("./public/uploads/company_logo" + fileName, imageBuffer, 'utf8');

        // if (imageprogress){

        // console.log(fileName);

        let update_profPic = await Company.update({ logo: fileName }, {

            where: {

                id: req.session.userId

            }

        });

        res.json({ status: true, message: 'Profile Picture Updated!' });

        res.json({ status: true, message: 'Profile Picture Updated!' });

    } catch (e) {

       // next(e);

        res.json({ status: false, message: 'Something went wrong', detail: e });

        return false;

    }

}*/

router.UpdateProfile = async (req, res) => {

    const fData = JSON.parse(JSON.stringify(req.body))

     console.log(req.body);

    fData.logo = '';

     if (req.body.fileupload_file != "") {

        let logo = 'public/uploads/company_logo/';

        let logodata = await fileUpload('logo', logo, req.body.fileupload_file, req, res)

        Object.assign(req.body, {

           logo: logodata // add json element

        });

        fData.logo = req.body.logo;

    }

    let UpdateProfile = await Company.update(fData, {

        where: {

            id: req.session.userId

        }

    });

    if (UpdateProfile) {

        res.json({ status: true, message: 'Profile Updated successfully' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

};

router.updateDriverDetailsForm = ('/updateDriverDetailsForm/', async (req, res) => {

    if (req.session.name != "" && req.session.name != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        let getcmpdtls = await Company.findOne({ where: { id: getdriver.company_id }, raw: true });

        let getDtls = await Driveraddress.findAll({ where: { driverId: req.session.driver_id }, raw: true });

        let getaddress = 0;
        if(getDtls){
            getaddress = 1;
        }
         console.log(getcmpdtls);

         console.log(getdriver.company_id);

        res.render('updateDriverDetailsForm', {

            title: 'Part A Personal Details ',

            driverID: getdriver.id,

            CompanyName: getcmpdtls.name,

            company_id: getdriver.company_id,
            getaddress:getaddress

        });

    }

});

router.editupdateDriverDetailsForm = ('/editupdateDriverDetailsForm/', async (req, res) => {

    // console.log(req.query);

    let id = req.query.id;

    let getDtls = await Driverdetails.findOne({ where: { driverId: id }, raw: true });
    let getDtls1 = await Driver.findOne({ where: { id: id }, raw: true });
    console.log(getDtls1.company_id+'dss');
    let getcmpdtls = await Company.findOne({ where: { id: getDtls1.company_id }, raw: true });
     

    if (getDtls1) {
        if(getDtls){
            res.json({ status: true, data: getDtls,company:  getcmpdtls});
        }
        else{
            res.json({ status: false, company:  getcmpdtls});
        }

    }

    else {

        res.json({ status: false });

    }

});

// Get Single driver address id

router.getupdateDriverAddress = ('/getupdateDriverAddress/', async (req, res) => {

    // console.log(req.query);

    let id = req.query.id;

    // console.log(id);

    let getDtls = await Driveraddress.findOne({ where: { id: id }, raw: true });

    // console.log(getDtls);

    if (getDtls) {

        res.json({ status: true, data: getDtls });

    }

    else {

        res.json({ status: false });

    }

});

// Update single driver address id

router.UpdateDriverAddressID = ('/UpdateDriverAddressID/', async (req, res) => {

    // console.log(req.query);

    // let id = req.query.id;

    const fData = JSON.parse(JSON.stringify(req.body))

    let UpdateDriverDtls = await Driveraddress.update(fData, {

        where: {

            id: req.body.id

        }

    });

    if (UpdateDriverDtls) {

        res.json({ status: true, message: "Address Updated" });

    }

    else {

        res.json({ status: false });

    }

});

// Add Address

router.AddDriverAddressID = ('/AddDriverAddressID/', async (req, res) => {

    const fData = JSON.parse(JSON.stringify(req.body))

    let AddDriverDtls = await Driveraddress.create(fData);

    if (AddDriverDtls) {

        res.json({ status: true, message: "Address Inserted" });

    }

    else {

        res.json({ status: false });

    }

});

//Delete Address

router.deleteDriverAddress = ('/deleteDriverAddress/', async (req, res) => {

    // console.log(req);

    let id = req.body.id;

    let deleteDriver = await Driveraddress.destroy({ where: { id: id } });

    if (deleteDriver) {

        res.json({ status: true, message: 'Address Deleted successfully' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});

router.updateDriverDetails = ('/updateDriverDetails/', async (req, res) => {

    // console.log(req.body);

    // return false

    if (req.body.fastCardAttachment_file != "") {

        let driverDtls_last = 'public/uploads/attachment/driverDtls_fastCardAttachment/';

        let driverDtls_fastCardAttachmentData = await fileUpload('driverDtls_fastCardAttachment', driverDtls_last, req.body.fastCardAttachment_file, req, res)

        Object.assign(req.body, {

            fastCardAttachment: driverDtls_fastCardAttachmentData // add json element

        });

    }

    if (req.body.legalRightAtachment_file != "") {

        let driverDtls_last = 'public/uploads/attachment/driverDtls_legalRightAtachment/';

        let driverDtls_fastCardAttachmentData = await fileUpload('driverDtls_fastCardAttachment', driverDtls_last, req.body.fastCardAttachment_file, req, res)

        Object.assign(req.body, {

            legalRightAtachment: driverDtls_fastCardAttachmentData // add json element

        });

    }

    if (req.body.legalRightUSAAtachment_file != "") {

        let driverDtls_last = 'public/uploads/attachment/driverDtls_legalRightUSAAtachment/';

        let legalRightUSAAtachment_fileData = await fileUpload('legalRightUSAAtachment_file', driverDtls_last, req.body.fastCardAttachment_file, req, res)

        Object.assign(req.body, {

            legalRightUSAAtachment: legalRightUSAAtachment_fileData // add json element

        });

    }

    if (req.body.fastCardneed == 'Yes') {

        let to = 'compliancementorzportal@gmail.com'

        let cc = ''

        let subject = 'FAST approved driver'

        let message = 'Hi Admin New requst for FAST approved driver from Name: ' + req.body.firstName + ' Email: ' + req.body.email;

        // let message = '<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width,initial-scale=1"> <meta name="x-apple-disable-message-reformatting"> <title></title> <style>table, td, div, h1, p{font-family: Arial, sans-serif;}@media screen and (max-width: 530px){.unsub{display: block; padding: 8px; margin-top: 14px; border-radius: 6px; background-color: #555555; text-decoration: none !important; font-weight: bold;}.col-lge{max-width: 100% !important;}}@media screen and (min-width: 531px){.col-sml{max-width: 27% !important;}.col-lge{max-width: 73% !important;}}</style></head><body style="margin:0;padding:0;word-spacing:normal;background-color:#939297;"> <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297;"> <table role="presentation" style="width:100%;border:none;border-spacing:0;"> <tr> <td align="center" style="padding:0;"> <table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;"> <tr> <td style="padding:40px 30px 30px 30px;text-align:center;font-size:24px;font-weight:bold;"> <a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="165" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> </td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Hi</p> <br><p style="margin:0;">Welcome to new portal Click here to Login new portal Your  </td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Thank you,</p><p style="margin:0;">Safety Department  </p><br><a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="90" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> <p style="margin:0;">Tel: 905-486-1666</p><p style="margin:0;">Web: www.compliancementorz.com</p></td></tr><tr> <td style="padding:30px;text-align:center;font-size:12px;background-color:#404040;color:#cccccc;"> <p style="margin:0;font-size:14px;line-height:20px;">&reg; compliancementorz 2022</p></td></tr></table> </td></tr></table> </div></body></html>';

       // let newDriverEmail = await sendMail(to, cc, subject, message, req, res)
		let newDriverEmail = sendMailGrid(to, cc, subject, message, req, res,'helpdesk@compliancementorz.ca')

    }

    let date = new Date();

    var updated_on =

        ("00" + (date.getMonth() + 1)).slice(-2) + "-" +

        ("00" + date.getDate()).slice(-2) + "-" +

        date.getFullYear() + " " +

        ("00" + date.getHours()).slice(-2) + ":" +

        ("00" + date.getMinutes()).slice(-2) + ":" +

        ("00" + date.getSeconds()).slice(-2);

    Object.assign(req.body, {

        updatedDate: updated_on // add json element

    });

    const fData = JSON.parse(JSON.stringify(req.body))

    // console.log(fData);

    if (req.body.actionData == 'Update') {

        delete req.body['actionData'];

        const fData = JSON.parse(JSON.stringify(req.body))

        let UpdateDriverDtls = await Driverdetails.update(fData, {

            where: {

                driverId: req.body.driverId

            }

        });

        if (UpdateDriverDtls) {

            res.json({ status: true, message: 'Driver Details Updated' });

        } else {

            res.json({ status: false, message: 'Something went wrong' });

        }

    } else if (req.body.actionData == 'Create') {

        //Inserting Driver multiple address

        let DriverAddress;

        let DriverState;

        let DriverCity;

        let DriverCountry;

        let DriverProvince;

        let DriverPostalCode;

        let fromDate;

        let toDate;

        for (let index = 0; index < req.body.DriverAddressarr.length; index++) {

            DriverAddress = req.body.DriverAddressarr[index];

            DriverState = req.body.DriverStatearr[index];

            DriverCity = req.body.DriverCityarr[index];

            DriverCountry = req.body.DriverCountryarr[index];

            DriverProvince = req.body.DriverProvincearr[index];

            DriverPostalCode = req.body.DriverPostalCodearr[index];

            fromDate = req.body.fromDatearr[index];

            toDate = req.body.toDatearr[index];

            console.log(req.body);
            

            await sequelize.query('INSERT INTO driveraddress (company_id,driverId,driverAddress,DriverState,driverCity,driverCountry,driverProvince,driverPostalCode,driverFromDate,driverToDate) values ("' + req.body.company_id + '","' + req.body.driverId + '","' + DriverAddress + '","' + DriverState + '","' + DriverCity + '","' + DriverCountry + '","' + DriverProvince + '","' + DriverPostalCode + '","' + fromDate + '","' + toDate + '")');

        }

        delete req.body['actionData'];

        delete req.body.DriverAddressarr;

        delete req.body.DriverStatearr;

        delete req.body.DriverCityarr;

        delete req.body.DriverCountryarr;

        delete req.body.DriverProvincearr;

        delete req.body.DriverPostalCodearr;

        delete req.body.fromDatearr;

        delete req.body.toDatearr;

        delete req.body.DriverAddress;

        delete req.body.DriverState;

        delete req.body.DriverCity;

        delete req.body.DriverCountry;

        delete req.body.DriverProvince;

        delete req.body.DriverPostalCode;

        delete req.body.fromDate;

        delete req.body.toDate;

        delete req.body.singleDurationInput;

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });
        req.body.company_id = getdriver.company_id;

        // console.log(req.body);

        const fData = JSON.parse(JSON.stringify(req.body))

        let create_DriverDtls = await Driverdetails.create(fData);

        if (create_DriverDtls) {

            res.json({ status: true, message: 'Driver Details Created' });

        } else {

            res.json({ status: false, message: 'Something went wrong' });

        }

    }

});

router.getDriverDetails = ('/getDriverDetails/', async (req, res, next) => {

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

                // console.log('prev' + prvTo);

                // console.log(getDetails.driverFromDate);

                gap = getMonthDifferenceFunction(new Date(prvTo), new Date(getDetails.driverFromDate), req, res)

                gapdata = (gap >= 0) ? 0 : gap

            }

            // console.log(gap);

            // gap =  getMonthDifferenceFunction(new Date(getDetails.driverFromDate),new Date(getDetails.driverToDate), req, res)

            if (gap >= 1 && gap != "undefined") {

                tableData += '<tr style="background-color: #e7000021;"><td>' + getDetails.driverAddress + '</td><td>' + getDetails.driverCity + '</td><td>' + getDetails.driverState + '</td><td>' + getDetails.driverCountry + '</td><td>' + getDetails.driverProvince + '</td><td>' + getDetails.driverPostalCode + '</td><td>' + getDetails.driverFromDate + '</td><td>' + getDetails.driverToDate + '</td><td>' + gap + '</td><td><a href="javascript:void(0)" data-prvTo=' + prvTo + ' data-currFrom=' + currFrom + ' data-id=' + getDetails.id + ' data-company_id=' + req.session.company_id + ' data-driverId=' + req.session.driver_id + ' id="addmodalid" class="btn btn-success addmodalclass"<span class="fas fa-edit">Add</span></a></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="editmodalid" class="btn btn-warning editmodalclass"<span class="fas fa-edit"> Edit</span></a></td></tr>';

                // tableData += '<tr class="gap"><td colspan="9">'+gap+'Gap</td></tr>';

            } else {

                tableData += '<tr><td>' + getDetails.driverAddress + '</td><td>' + getDetails.driverCity + '</td><td>' + getDetails.driverState + '</td><td>' + getDetails.driverCountry + '</td><td>' + getDetails.driverProvince + '</td><td>' + getDetails.driverPostalCode + '</td><td>' + getDetails.driverFromDate + '</td><td>' + getDetails.driverToDate + '</td><td></td><td></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="editmodalid" class="btn btn-warning editmodalclass"<span class="fas fa-edit"> Edit</span></a></td></tr>';

            }

        });

        // console.log(fData);

        // console.log(tableData);

        res.json({ status: true, data: tableData });

    }

    else {

        res.json({ status: false });

    }

});

//employmenthistory -----------------------------------------------------------

router.updateemploymenthistoryForm = ('/updateemploymenthistoryForm/', async (req, res) => {

    if (req.session.name != "" && req.session.name != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        let getcmpdtls = await Company.findOne({ where: { id: getdriver.company_id }, raw: true });

        // console.log(getcmpdtls);

        // console.log(getdriver);

        res.render('updateemploymenthistoryForm', {

            title: 'Part B: Employment History ',

            driverID: getdriver.id,

            CompanyName: getcmpdtls.name,

            company_id: getdriver.company_id

        });

    }

});

router.editupdateemploymenthistoryForm = ('/editupdateemploymenthistoryForm/', async (req, res) => {

    // console.log(req.query);

    let id = req.query.id;

    let getDtls = await Employmenthistory.findOne({ where: { driverId: id }, raw: true });

    // console.log(getDtls);

    if (getDtls) {

        res.json({ status: true, data: getDtls });

    }

    else {

        res.json({ status: false });

    }

});

// Get Single driver address id

router.getupdateemploymenthistoryAddress = ('/getupdateemploymenthistoryAddress/', async (req, res) => {

    // console.log(req.query);

    let id = req.query.id;

    // console.log(id);

    let getDtls = await Employementhistroyaddress.findOne({ where: { id: id }, raw: true });

    // console.log(getDtls);

    if (getDtls) {

        res.json({ status: true, data: getDtls });

    }

    else {

        res.json({ status: false });

    }

});

// Update single driver address id

router.UpdateemploymenthistoryAddressID = ('/UpdateemploymenthistoryAddressID/', async (req, res) => {

    // console.log(req.query);

    // let id = req.query.id;

    const fData = JSON.parse(JSON.stringify(req.body))

    let UpdateDriverDtls = await Employementhistroyaddress.update(fData, {

        where: {

            id: req.body.id

        }

    });

    if (UpdateDriverDtls) {

        res.json({ status: true, message: "Address Updated" });

    }

    else {

        res.json({ status: false });

    }

});

// Add Address

router.AddemploymenthistoryAddressID = ('/AddemploymenthistoryAddressID/', async (req, res) => {

    const fData = JSON.parse(JSON.stringify(req.body))

    let AddDriverDtls = await Employementhistroyaddress.create(fData);

    if (AddDriverDtls) {

        res.json({ status: true, message: "Address Inserted" });

    }

    else {

        res.json({ status: false });

    }

});

//Delete Address

router.deleteemploymenthistoryAddress = ('/deleteemploymenthistoryAddress/', async (req, res) => {

    // console.log(req);

    let id = req.body.id;

    let deleteDriver = await Employementhistroyaddress.destroy({ where: { id: id } });

    if (deleteDriver) {

        res.json({ status: true, message: 'Address Deleted successfully' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});

router.companyeditupdateDriverDetailsForm = ('/companyeditupdateDriverDetailsForm/', async (req, res) => {

    // console.log(req.query);

    let id = req.query.id;

    let getDtls = await Driverdetails.findOne({ where: { driverId: id }, raw: true });

    // console.log(getDtls);

    if (getDtls) {

        res.json({ status: true, data: getDtls });

    }

    else {

        res.json({ status: false });

    }

});

// Get Single driver address id

router.companygetupdateDriverAddress = ('/companygetupdateDriverAddress/', async (req, res) => {

    // console.log(req.query);

    let id = req.query.id;

    console.log(id);

    let getDtls = await Driveraddress.findOne({ where: { id: id }, raw: true });

    // console.log(getDtls);

    if (getDtls) {

        res.json({ status: true, data: getDtls });

    }

    else {

        res.json({ status: false });

    }

});

// Update single driver address id

router.companyUpdateDriverAddressID = ('/companyUpdateDriverAddressID/', async (req, res) => {

    // console.log(req.query);

    // let id = req.query.id;

    const fData = JSON.parse(JSON.stringify(req.body))

    let UpdateDriverDtls = await Driveraddress.update(fData, {

        where: {

            id: req.body.id

        }

    });

    if (UpdateDriverDtls) {

        res.json({ status: true, message: "Address Updated" });

    }

    else {

        res.json({ status: false });

    }

});

// Add Address

router.companyAddDriverAddressID = ('/companyAddDriverAddressID/', async (req, res) => {

    const fData = JSON.parse(JSON.stringify(req.body))

    let AddDriverDtls = await Driveraddress.create(fData);

    if (AddDriverDtls) {

        res.json({ status: true, message: "Address Inserted" });

    }

    else {

        res.json({ status: false });

    }

});

//Delete Address

router.companydeleteDriverAddress = ('/companydeleteDriverAddress/', async (req, res) => {

    // console.log(req);

    let id = req.body.id;

    let deleteDriver = await Driveraddress.destroy({ where: { id: id } });

    if (deleteDriver) {

        res.json({ status: true, message: 'Address Deleted successfully' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});

router.companyupdateDriverDetails = ('/companyupdateDriverDetails/', async (req, res) => {

    // console.log(req.body);

    // return false

    if (req.body.fastCardAttachment_file != "") {

        let driverDtls_last = 'public/uploads/attachment/driverDtls_fastCardAttachment/';

        let driverDtls_fastCardAttachmentData = await fileUpload('driverDtls_fastCardAttachment', driverDtls_last, req.body.fastCardAttachment_file, req, res)

        Object.assign(req.body, {

            fastCardAttachment: driverDtls_fastCardAttachmentData // add json element

        });

    }

    if (req.body.legalRightAtachment_file != "") {

        let driverDtls_last = 'public/uploads/attachment/driverDtls_legalRightAtachment/';

        let driverDtls_fastCardAttachmentData = await fileUpload('driverDtls_fastCardAttachment', driverDtls_last, req.body.fastCardAttachment_file, req, res)

        Object.assign(req.body, {

            legalRightAtachment: driverDtls_fastCardAttachmentData // add json element

        });

    }

    if (req.body.legalRightUSAAtachment_file != "") {

        let driverDtls_last = 'public/uploads/attachment/driverDtls_legalRightUSAAtachment/';

        let legalRightUSAAtachment_fileData = await fileUpload('legalRightUSAAtachment_file', driverDtls_last, req.body.fastCardAttachment_file, req, res)

        Object.assign(req.body, {

            legalRightUSAAtachment: legalRightUSAAtachment_fileData // add json element

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

    Object.assign(req.body, {

        updatedDate: updated_on // add json element

    });

    const fData = JSON.parse(JSON.stringify(req.body))

    // console.log(fData);

    if (req.body.actionData == 'Update') {

        delete req.body['actionData'];

        const fData = JSON.parse(JSON.stringify(req.body))

        let UpdateDriverDtls = await Driverdetails.update(fData, {

            where: {

                driverId: req.body.driverId

            }

        });

        if (UpdateDriverDtls) {

            res.json({ status: true, message: 'Driver Details Updated' });

        } else {

            res.json({ status: false, message: 'Something went wrong' });

        }

    } else if (req.body.actionData == 'Create') {

        //Inserting Driver multiple address

        let DriverAddress;

        let DriverState;

        let DriverCity;

        let DriverCountry;

        let DriverProvince;

        let DriverPostalCode;

        let fromDate;

        let toDate;

        for (let index = 0; index < req.body.DriverAddressarr.length; index++) {

            DriverAddress = req.body.DriverAddressarr[index];

            DriverState = req.body.DriverStatearr[index];

            DriverCity = req.body.DriverCityarr[index];

            DriverCountry = req.body.DriverCountryarr[index];

            DriverProvince = req.body.DriverProvincearr[index];

            DriverPostalCode = req.body.DriverPostalCodearr[index];

            fromDate = req.body.fromDatearr[index];

            toDate = req.body.toDatearr[index];

            await sequelize.query('INSERT INTO driveraddress (company_id,driverId,driverAddress,DriverState,driverCity,driverCountry,driverProvince,driverPostalCode,driverFromDate,driverToDate) values ("' + req.body.company_id + '","' + req.body.driverId + '","' + DriverAddress + '","' + DriverState + '","' + DriverCity + '","' + DriverCountry + '","' + DriverProvince + '","' + DriverPostalCode + '","' + fromDate + '","' + toDate + '")');

        }

        delete req.body['actionData'];

        delete req.body.DriverAddressarr;

        delete req.body.DriverStatearr;

        delete req.body.DriverCityarr;

        delete req.body.DriverCountryarr;

        delete req.body.DriverProvincearr;

        delete req.body.DriverPostalCodearr;

        delete req.body.fromDatearr;

        delete req.body.toDatearr;

        delete req.body.DriverAddress;

        delete req.body.DriverState;

        delete req.body.DriverCity;

        delete req.body.DriverCountry;

        delete req.body.DriverProvince;

        delete req.body.DriverPostalCode;

        delete req.body.fromDate;

        delete req.body.toDate;

        delete req.body.singleDurationInput;

        // console.log(req.body);

        const fData = JSON.parse(JSON.stringify(req.body))

        let create_DriverDtls = await Driverdetails.create(fData);

        if (create_DriverDtls) {

            res.json({ status: true, message: 'Driver Details Created' });

        } else {

            res.json({ status: false, message: 'Something went wrong' });

        }

    }

});

router.updateemploymenthistory = ('/updateemploymenthistory/', async (req, res) => {

    // console.log(req.body);

    let date = new Date();

    var updated_on =

        ("00" + (date.getMonth() + 1)).slice(-2) + "-" +

        ("00" + date.getDate()).slice(-2) + "-" +

        date.getFullYear() + " " +

        ("00" + date.getHours()).slice(-2) + ":" +

        ("00" + date.getMinutes()).slice(-2) + ":" +

        ("00" + date.getSeconds()).slice(-2);

    Object.assign(req.body, {

        updatedDate: updated_on // add json element

    });

    const fData = JSON.parse(JSON.stringify(req.body))

    // console.log(fData);

    if (req.body.actionData == 'Update') {

        delete req.body['actionData'];

        const fData = JSON.parse(JSON.stringify(req.body))

        let UpdateDriverDtls = await Employmenthistory.update(fData, {

            where: {

                driverId: req.body.driverId

            }

        });

        if (UpdateDriverDtls) {

            res.json({ status: true, message: 'Driver Details Updated' });

        } else {

            res.json({ status: false, message: 'Something went wrong' });

        }

    } else if (req.body.actionData == 'Create') {

        // Inserting Driver multiple address

        let fromDate;

        let toDate;

        let employerName;

        // let employerDate;

        let employerAddress;

        let employerPosition;

        let employerContactPerson;

        let employerContactPersonNumber;

        let employerContactPersonEmail;

        let fmcrs;

        let jobDesignated;



        for (let index = 0; index < req.body.employerNameArr.length; index++) {

            // Address = req.body.addressArr[index];

            // State = req.body.stateArr[index];

            // City = req.body.cityArr[index];

            // Country = req.body.countryArr[index];

            // Province = req.body.provinceArr[index];

            // PostalCode = req.body.postalCodeArr[index];

            fromDate = req.body.fromDateArr[index];

            toDate = req.body.toDateArr[index];

            employerName = req.body.employerNameArr[index];

            // employerDate = req.body.employerDateArr[index];

            employerAddress = req.body.employerAddressArr[index];

            employerPosition = req.body.employerPositionArr[index];

            employerContactPerson = req.body.employerContactPersonArr[index];

            employerContactPersonNumber = req.body.employerContactPersonNumberArr[index];

            employerContactPersonEmail = req.body.employerContactPersonEmailArr[index];

            fmcrs = req.body.fmcrsArr[index];

            jobDesignated = req.body.jobDesignatedArr[index];

            // await sequelize.query('INSERT INTO employementhistroyaddress (company_id,driverId,address,state,city,country,province,postalCode,fromDate,toDate,employerName,employerDate,employerAddress,employerPosition,employerContactPerson,employerContactPersonNumber,employerContactPersonEmail,fmcrs,jobDesignated) values ("' + req.body.company_id + '","' + req.body.driverId + '","' + Address + '","' + State + '","' + City + '","' + Country + '","' + Province + '","' + PostalCode + '","' + fromDate + '","' + toDate + '","' + employerName + '","' + employerDate + '","' + employerAddress + '","' + employerPosition + '","' + employerContactPerson + '","' + employerContactPersonNumber + '","' + employerContactPersonEmail + '","' + fmcrs + '","' + jobDesignated + '")');

            await sequelize.query('INSERT INTO employementhistroyaddress (company_id,driverId,fromDate,toDate,employerName,employerAddress,employerPosition,employerContactPerson,employerContactPersonNumber,employerContactPersonEmail,fmcrs,jobDesignated) values ("' + req.body.company_id + '","' + req.body.driverId + '","' + fromDate + '","' + toDate + '","' + employerName + '","' + employerAddress + '","' + employerPosition + '","' + employerContactPerson + '","' + employerContactPersonNumber + '","' + employerContactPersonEmail + '","' + fmcrs + '","' + jobDesignated + '")');

        }

        delete req.body['actionData'];

        delete req.body['employerAddress'];

        delete req.body['employerPosition'];

        delete req.body['employerContactPerson'];

        delete req.body['employerContactPersonNumber'];

        delete req.body['employerName'];

        // delete req.body['employerDate'];

        delete req.body['employerContactPersonEmail'];

        delete req.body['fmcrs'];

        delete req.body['jobDesignated'];

        const fData = JSON.parse(JSON.stringify(req.body))

        // console.log(fData);

        let create_DriverDtls = await Employmenthistory.create(fData);

        if (create_DriverDtls) {

            res.json({ status: true, message: 'Driver Details Created' });

        } else {

            res.json({ status: false, message: 'Something went wrong' });

        }

    }

});

router.getemploymenthistory = ('/getemploymenthistory/', async (req, res, next) => {

    let id = req.query.id;

    let tableData;

    // console.log(id);

    // let id = 788

    let getDtls = await Employementhistroyaddress.findAll({ where: { driverId: id }, raw: true });
    let doa;
    let driverdetails =  await Driverdetails.findOne({where:{driverId:id},limit: 1, order: [['id', 'DESC']], raw: true});
    if(driverdetails && driverdetails.DOA && driverdetails.DOA != null && driverdetails.DOA!=''){
         let ddate  = new Date(driverdetails.DOA);
        doa    = ddate.getFullYear() + "-" + ("0"+(ddate.getMonth()+1)).slice(-2) + "-" + ("0"+ddate.getDate()).slice(-2);
    }
    else{
        let d = new Date();
        doa   = d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0"+d.getDate()).slice(-2);
    }

    //Sort array by date

    getDtls.sort(function (a, b) {

        return new Date(a.fromDate) - new Date(b.fromDate)

    })

    if (getDtls) {
        let historyLength = getDtls.length-1;
        await getDtls.forEach(function (getDetails, i) {

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

                // tableData += '<tr style="background-color: #e7000021;"><td>'+getDetails.address+'</td><td>'+getDetails.state+'</td><td>'+getDetails.city+'</td><td>'+getDetails.country+'</td><td>'+getDetails.province+'</td><td>'+getDetails.postalCode+'</td><td>'+getDetails.fromDate+'</td><td>'+getDetails.toDate+'</td><td>'+gap+'</td><td><a href="javascript:void(0)" data-prvTo='+prvTo+' data-currFrom='+currFrom+' data-id='+getDetails.id+' data-company_id='+req.session.company_id+' data-driverId='+req.session.driver_id+' id="addmodalid" class="btn btn-success addmodalclass"<span class="fas fa-edit">Add</span></a></td><td><a href="javascript:void(0)" data-id='+getDetails.id+' id="editmodalid" class="btn btn-warning editmodalclass"<span class="fas fa-edit"> Edit</span></a></td><td><a href="javascript:void(0)" data-id='+getDetails.id+' id="deletemodalid" class="btn btn-danger deletemodalclass"<span class="fas fa-edit">Delete</span></a></td></tr>';

                // tableData += '<tr style="background-color: #e7000021;"><td>' + getDetails.employerName + '</td><td>' + getDetails.employerDate + '</td><td>' + getDetails.employerAddress + '</td><td>' + getDetails.employerPosition + '</td><td>' + getDetails.employerContactPerson + '</td><td>' + getDetails.employerContactPersonNumber + '</td><td>' + getDetails.employerContactPersonEmail + '</td><td>' + getDetails.jobDesignated + '</td><td>' + getDetails.fmcrs + '</td><td>' + getDetails.address + '</td><td>' + getDetails.state + '</td><td>' + getDetails.city + '</td><td>' + getDetails.country + '</td><td>' + getDetails.province + '</td><td>' + getDetails.postalCode + '</td><td>' + getDetails.fromDate + '</td><td>' + getDetails.toDate + '</td><td>' + gap + '</td><td><a href="javascript:void(0)" data-prvTo=' + prvTo + ' data-currFrom=' + currFrom + ' data-id=' + getDetails.id + ' data-company_id=' + req.session.company_id + ' data-driverId=' + req.session.driver_id + ' id="addmodalid" class="btn btn-success addmodalclass"<span class="fas fa-edit">Add</span></a></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="editmodalid" class="btn btn-warning editmodalclass"<span class="fas fa-edit"> Edit</span></a></td></tr>';

                tableData += '<tr style="background-color: #e7000021;"><td>' + getDetails.employerName + '</td><td>' + getDetails.employerAddress + '</td><td>' + getDetails.employerPosition + '</td><td>' + getDetails.employerContactPerson + '</td><td>' + getDetails.employerContactPersonNumber + '</td><td>' + getDetails.employerContactPersonEmail + '</td><td>' + getDetails.jobDesignated + '</td><td>' + getDetails.fmcrs + '</td><td>' + getDetails.fromDate + '</td><td>' + getDetails.toDate + '</td><td>' + gap + '</td><td><a href="javascript:void(0)" data-prvTo=' + prvTo + ' data-currFrom=' + currFrom + ' data-id=' + getDetails.id + ' data-company_id=' + req.session.company_id + ' data-driverId=' + req.session.driver_id + ' id="addmodalid" class="btn btn-success addmodalclass"<span class="fas fa-edit">Add</span></a></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="editmodalid" class="btn btn-warning editmodalclass"<span class="fas fa-edit"> Edit</span></a></td></tr>';

                // tableData += '<tr class="gap"><td colspan="9">'+gap+'Gap</td></tr>';

            } else {

                tableData += '<tr><td>' + getDetails.employerName + '</td><td>' + getDetails.employerAddress + '</td><td>' + getDetails.employerPosition + '</td><td>' + getDetails.employerContactPerson + '</td><td>' + getDetails.employerContactPersonNumber + '</td><td>' + getDetails.employerContactPersonEmail + '</td><td>' + getDetails.jobDesignated + '</td><td>' + getDetails.fmcrs + '</td><td>' + getDetails.fromDate + '</td><td>' + getDetails.toDate + '</td><td></td><td></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="editmodalid" class="btn btn-warning editmodalclass"<span class="fas fa-edit"> Edit</span></a></td></tr>';

            }

        });

        res.json({ status: true, data: tableData });

    }

    else {

        res.json({ status: false });

    }

});

// ---------------------------Driver details form part A-----------------------------

router.companyupdateDriverDetailsForm = async (req, res) => {

    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });

    res.render('companyupdateDriverDetailsForm', {

        title: 'Manage Personal Information',

        getCompanydata: getCompanydata,

        company_id: req.session.userId

    });

};

router.company_get_updateDriverDetailsForm = async (req, res) => {

    console.log('get updateDriverDetailsForm');

    let cmpid = req.query.cmpid;

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

            key.driverId = key.driverId,

                key.firstName = key.firstName,

                Object.assign(key, {

                    action: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='editmodalid' class='btn  btn-warning editmodalclass1'><span class='fas fa-edit'> Edit</span></a>&nbsp;" +

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

router.companyapproveDriver = ('.companyapproveDriver/', async (req, res, next) => {

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

                gap = getMonthDifferenceFunction(new Date(prvTo), new Date(getDetails.driverFromDate), req, res)

                gapdata = (gap >= 0) ? 0 : gap

            }

            // gap =  getMonthDifferenceFunction(new Date(getDetails.driverFromDate),new Date(getDetails.driverToDate), req, res)

            if (gap >= 1 && gap != "undefined") {

                tableData += '<tr style="background-color: #e7000021;"><td>' + getDetails.driverAddress + '</td><td>' + getDetails.driverCity + '</td><td>' + getDetails.driverState + '</td><td>' + getDetails.driverCountry + '</td><td>' + getDetails.driverProvince + '</td><td>' + getDetails.driverPostalCode + '</td><td>' + getDetails.driverFromDate + '</td><td>' + getDetails.driverToDate + '</td><td>' + gap + '</td><td><a href="javascript:void(0)" data-prvTo=' + prvTo + ' data-currFrom=' + currFrom + ' data-id=' + getDetails.id + ' data-company_id=' + getDetails.company_id + ' data-driverId=' + getDetails.driverId + ' id="addmodalidaddress" class="btn btn-success addmodalclassaddress"<span class="fas fa-edit">Add</span></a></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="editmodalidaddress" class="btn btn-warning editmodalclassaddress"<span class="fas fa-edit"> Edit</span></a></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="deletemodalidaddress" class="btn btn-danger deletemodalclassaddress"<span class="fas fa-edit">Delete</span></a></td></tr>';

                // tableData += '<tr class="gap"><td colspan="9">'+gap+'Gap</td></tr>';

            } else {

                tableData += '<tr><td>' + getDetails.driverAddress + '</td><td>' + getDetails.driverCity + '</td><td>' + getDetails.driverState + '</td><td>' + getDetails.driverCountry + '</td><td>' + getDetails.driverProvince + '</td><td>' + getDetails.driverPostalCode + '</td><td></td><td>' + getDetails.driverFromDate + '</td><td>' + getDetails.driverToDate + '</td><td></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="editmodalidaddress" class="btn btn-warning editmodalclassaddress"<span class="fas fa-edit"> Edit</span></a></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="deletemodalidaddress" class="btn btn-danger deletemodalclass"<span class="fas fa-edit">Delete</span></a></td></tr>';

            }

        });

        // console.log(fData);

        res.json({ status: true, data: tableData });

    }

    else {

        res.json({ status: false });

    }

});

router.companydeleteDriverDetails = ('/companydeleteDriverDetails/', async (req, res) => {

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

router.companygetDriverDetails = ('/companygetDriverDetails/', async (req, res, next) => {

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

                gap = getMonthDifferenceFunction(new Date(prvTo), new Date(getDetails.driverFromDate), req, res)

                gapdata = (gap >= 0) ? 0 : gap

            }



            // gap =  getMonthDifferenceFunction(new Date(getDetails.driverFromDate),new Date(getDetails.driverToDate), req, res)

            if (gap >= 1 && gap != "undefined") {

                tableData += '<tr style="background-color: #e7000021;"><td>' + getDetails.driverAddress + '</td><td>' + getDetails.driverCity + '</td><td>' + getDetails.driverState + '</td><td>' + getDetails.driverCountry + '</td><td>' + getDetails.driverProvince + '</td><td>' + getDetails.driverPostalCode + '</td><td>' + getDetails.driverFromDate + '</td><td>' + getDetails.driverToDate + '</td><td>' + gap + '</td><td><a href="javascript:void(0)" data-prvTo=' + prvTo + ' data-currFrom=' + currFrom + ' data-id=' + getDetails.id + ' data-company_id=' + getDetails.company_id + ' data-driverId=' + getDetails.driverId + ' id="addmodalidaddress" class="btn btn-success addmodalclassaddress"<span class="fas fa-edit">Add</span></a></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="editmodalidaddress" class="btn btn-warning editmodalclassaddress"<span class="fas fa-edit"> Edit</span></a></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="deletemodalidaddress" class="btn btn-danger deletemodalclassaddress"<span class="fas fa-edit">Delete</span></a></td></tr>';

                // tableData += '<tr class="gap"><td colspan="9">'+gap+'Gap</td></tr>';

            } else {

                tableData += '<tr><td>' + getDetails.driverAddress + '</td><td>' + getDetails.driverCity + '</td><td>' + getDetails.driverState + '</td><td>' + getDetails.driverCountry + '</td><td>' + getDetails.driverProvince + '</td><td>' + getDetails.driverPostalCode + '</td><td>' + getDetails.driverFromDate + '</td><td>' + getDetails.driverToDate + '</td><td></td><td></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="editmodalidaddress" class="btn btn-warning editmodalclassaddress"<span class="fas fa-edit"> Edit</span></a></td><td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="deletemodalidaddress" class="btn btn-danger deletemodalclass"<span class="fas fa-edit">Delete</span></a></td></tr>';

            }

        });

        res.json({ status: true, data: tableData });

    }

    else {

        res.json({ status: false });

    }

});

// ---------------------------Driver details form part A----------------------------- end

// ---------------------------Employee histroy part B-----------------------------

router.companyemploymenthistoryForm = async (req, res) => {

    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });

    res.render('companyemploymenthistoryForm', {

        title: 'Manage Company Employment History',

        getCompanydata: getCompanydata,

        company_id: req.session.userId

    });

};

router.company_get_employmenthistoryForm = async (req, res) => {

    console.log('get updateemploymenthistoryFormSuperadmin');

    let cmpid = req.query.cmpid;



    let col = req.query.columns[[0]].column || 'd.id';

    let direction = req.query.columns[[0]].dir || 'DESC';

    // let columns = ['id', 'employerName', 'employerDate', 'comment', 'driverId'];

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

            // Object.assign(key, {

            //     employerName: 'index'

            // });

            key.driverId = key.driverId,

                key.employerName = key.employerName,

                Object.assign(key, {

                    // action: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='editmodalid' class='btn  btn-warning editmodalclass'><span class='fas fa-edit'> Edit</span></a>&nbsp;" +

                    //     "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='viewmodalid' class='btn  btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a> " +

                    //     "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='deletedriverDtls' class='btn  btn-danger deletemodalclass'><span class='fas fa-trash'> Delete</span></a>" +

                    //     "<a href='javascript:void(0)' data-id='" + key.driverId + "' class='btn  btn-primary viewmodalclassaddress'><span class='fas fa-search'> View /Edit Employment History</span></a> "

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

router.companygetemploymenthistory = ('.companygetemploymenthistory/', async (req, res, next) => {

    let id = req.query.id;

    let tableData;

    // console.log(id); 

    // let id = 788

    let getDtls = await Employementhistroyaddress.findAll({ where: { driverId: id }, raw: true });

    //Sort array by date
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

    getDtls.sort(function (a, b) {

        return new Date(a.toDate) - new Date(b.toDate)

    })

    if (getDtls) {
        let historyLength = getDtls.length-1;
        await getDtls.forEach(function (getDetails, i) {

            // console.log(getDtls);

            // console.log(getDtls.driverId);

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

        res.json({ status: true, data: tableData });

    }

    else {

        res.json({ status: false });

    }

});

router.companydeleteemploymenthistoryAddress = ('/companydeleteemploymenthistoryAddress/', async (req, res) => {

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

router.companyemploymenthistory = ('/companyemploymenthistory/', async (req, res) => {

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

//Drivingthistory  part C----------------------------------------------------------- start

router.updatedrivingHistoryForm = ('/updatedrivingHistoryForm/', async (req, res) => {

    if (req.session.name != "" && req.session.name != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        let getcmpdtls = await Company.findOne({ where: { id: getdriver.company_id }, raw: true });

        // console.log(getdriver);

        res.render('updatedrivingHistoryForm', {

            title: 'Part C: Driving History ',

            driverID: getdriver ? getdriver.id : '',

            CompanyName: getcmpdtls ? getcmpdtls.name : '',

            company_id: getdriver ? getdriver.company_id : ''

        });

    }

});

// router.editupdateemploymenthistoryForm = ('/editdrivingHistoryForm/', async (req, res) => {

//     console.log(req.query);

//     let id = req.query.id;

//     let getDtls = await Drivinghistory.findOne({ where: { driverId: id }, raw: true });

//     // console.log(getDtls);

//     if (getDtls) {

//         res.json({ status: true, data: getDtls });

//     }

//     else {

//         res.json({ status: false });

//     }

// });

// // Get Single driver address id

router.getupdatedrivingHistoryAddress = ('/getupdatedrivingHistoryAddress/', async (req, res) => {

    // console.log(req.query);

    let id = req.query.id;

    let getDtls = await Drivinghistoryaddress.findOne({ where: { id: id }, raw: true });

    if (getDtls) {

        res.json({ status: true, data: getDtls });

    }

    else {

        res.json({ status: false });

    }

});

//Get single accident

router.getupdatedrivingHistoryAccident = ('/getupdatedrivingHistoryAccident/', async (req, res) => {

    // console.log(req.query);

    let id = req.query.id;

    let getDtls = await Drivinghistoryaccident.findOne({ where: { id: id }, raw: true });

    if (getDtls) {

        res.json({ status: true, data: getDtls });

    }

    else {

        res.json({ status: false });

    }

});

//Get single Violations

router.getupdatedrivingHistoryViolations = ('/getupdatedrivingHistoryViolations/', async (req, res) => {

    // console.log(req.query);

    let id = req.query.id;

    let getDtls = await Drivinghistoryviolations.findOne({ where: { id: id }, raw: true });

    if (getDtls) {

        res.json({ status: true, data: getDtls });

    }

    else {

        res.json({ status: false });

    }

});

router.editupdatedrivingHistoryForm = ('/editupdatedrivingHistoryForm/', async (req, res) => {

    let id = req.query.id;

    let getDtls = await Drivinghistory.findOne({ where: { driverId: id }, raw: true });

    // console.log(getDtls);

    if (getDtls) {

        res.json({ status: true, data: getDtls });

    }

    else {

        res.json({ status: false });

    }

});

// Update single driver address id

router.UpdatedrivingHistoryAddressID = ('/UpdatedrivingHistoryAddressID/', async (req, res) => {

    // console.log(req.query);

    // let id = req.query.id;

    if (req.body.atachment_fileEdit != "") {

        let Attachmentpath = 'public/uploads/attachment/drivinghistoryaddressAttachment/';

        let drivinghistoryaddressAttachmentData = await fileUpload('drivinghistoryaddressAttachment', Attachmentpath, req.body.atachment_fileEdit, req, res)

        Object.assign(req.body, {

            attachment: drivinghistoryaddressAttachmentData // add json element

        });

    }

    // console.log(req.body);

    delete req.body.atachment_fileEdit;

    const fData = JSON.parse(JSON.stringify(req.body))

    let UpdateDriverDtls = await Drivinghistoryaddress.update(fData, {

        where: {

            id: req.body.id

        }

    });

    if (UpdateDriverDtls) {

        res.json({ status: true, message: "Address Updated" });

    }

    else {

        res.json({ status: false });

    }

});







// Update single driver accident id

router.UpdatedrivingHistoryAccidentID = ('/UpdatedrivingHistoryAccidentID/', async (req, res) => {



    const fData = JSON.parse(JSON.stringify(req.body))

    let UpdateDriverDtls = await Drivinghistoryaccident.update(fData, {

        where: {

            id: req.body.id

        }

    });

    if (UpdateDriverDtls) {

        res.json({ status: true, message: "Address Updated" });

    }

    else {

        res.json({ status: false });

    }

});
//
// Add single driver accident id

router.adddrivingHistoryAccidentID = ('/adddrivingHistoryAccidentID/', async (req, res) => {

    const fData = JSON.parse(JSON.stringify(req.body));
    console.info(fData);
    if (req.body.accidentsDate.length > 0) {

        for (let indexAccident = 0; indexAccident < req.body.accidentsDate.length; indexAccident++) {

            accidentsDate = req.body.accidentsDate[indexAccident];

            accidentsNature = req.body.accidentsNature[indexAccident];

            accidentsFatalities = req.body.accidentsFatalities[indexAccident];

            accidentsInjuries = req.body.accidentsInjuries[indexAccident];

            accidentsHazardous = req.body.accidentsHazardous[indexAccident];

            await sequelize.query('INSERT INTO drivinghistoryaccident (company_id,driverId,accidentsDate,accidentsNature,accidentsFatalities,accidentsInjuries,accidentsHazardous) values ("' + req.body.company_id + '","' + req.body.driverId + '","' + accidentsDate + '","' + accidentsNature + '","' + accidentsFatalities + '","' + accidentsInjuries + '","' + accidentsHazardous + '")');

            console.log('INSERT INTO drivinghistoryaccident (company_id,driverId,accidentsDate,accidentsNature,accidentsFatalities,accidentsInjuries,accidentsHazardous) values ("' + req.body.company_id + '","' + req.body.driverId + '","' + accidentsDate + '","' + accidentsNature + '","' + accidentsFatalities + '","' + accidentsInjuries + '","' + accidentsHazardous + '")');

        }
        res.json({ status: true, message: "Accident Added" });
    }
    else {

        res.json({ status: false });

    }

});
// Update single driver Violations id

router.UpdatedrivingHistoryViolationsID = ('/UpdatedrivingHistoryViolationsID/', async (req, res) => {



    const fData = JSON.parse(JSON.stringify(req.body))

    let UpdateDriverDtls = await Drivinghistoryviolations.update(fData, {

        where: {

            id: req.body.id

        }

    });

    if (UpdateDriverDtls) {

        res.json({ status: true, message: "Address Updated" });

    }

    else {

        res.json({ status: false });

    }

});
router.adddrivingHistoryViolationsID = ('/adddrivingHistoryViolationsID/', async (req, res) => {

    if (req.body.traficConvintionsDate.length > 0) {

        for (let indexViolation = 0; indexViolation < req.body.traficConvintionsDate.length; indexViolation++) {

            traficConvintionsDate = req.body.traficConvintionsDate[indexViolation];

            traficConvintionsCharge = req.body.traficConvintionsCharge[indexViolation];

            traficConvintionsLocation = req.body.traficConvintionsLocation[indexViolation];

            traficConvintionsPenalty = req.body.traficConvintionsPenalty[indexViolation];

            await sequelize.query('INSERT INTO drivinghistoryviolations (company_id,driverId,traficConvintionsDate,traficConvintionsCharge,traficConvintionsLocation,traficConvintionsPenalty) values ("' + req.body.company_id + '","' + req.body.driverId + '","' + traficConvintionsDate + '","' + traficConvintionsCharge + '","' + traficConvintionsLocation + '","' + traficConvintionsPenalty + '")');

        }
        res.json({ status: true, message: "Violation Added" });
    }
    else {

        res.json({ status: false });

    }

});

// Add Address

router.AdddrivingHistoryAddressID = ('/AdddrivingHistoryAddressID/', async (req, res) => {

    const fData = JSON.parse(JSON.stringify(req.body))

    let AddDriverDtls = await Drivinghistoryaddress.create(fData);

    if (AddDriverDtls) {

        res.json({ status: true, message: "Address Inserted" });

    }

    else {

        res.json({ status: false });

    }

});

//Delete Address

router.deletedrivingHistoryAddress = ('/deletedrivingHistoryAddress/', async (req, res) => {

    // console.log(req);

    let id = req.body.id;

    let deleteDriver = await Drivinghistoryaddress.destroy({ where: { id: id } });

    if (deleteDriver) {

        res.json({ status: true, message: 'Address Deleted successfully' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});

router.companydrivingHistoryForm = async (req, res) => {

    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });

    res.render('companydrivingHistoryForm', {

        title: 'Manage Company Driving History',

        getCompanydata: getCompanydata,

        company_id: req.session.userId

    });

};

router.company_get_drivingHistoryForm = async (req, res) => {

    let cmpid = req.query.cmpid;

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

router.companyeditupdateDriverDetailsForm = ('/companyeditupdateDriverDetailsForm/', async (req, res) => {

    console.log(req.query);

    let id = req.query.id;

    let getDtls = await Driverdetails.findOne({ where: { driverId: id }, raw: true });

    // console.log(getDtls);

    if (getDtls) {

        res.json({ status: true, data: getDtls });

    }

    else {

        res.json({ status: false });

    }

});

// Get Single driver address id

router.companygetupdateDriverAddress = ('/companygetupdateDriverAddress/', async (req, res) => {

    // console.log(req.query);

    let id = req.query.id;

    let getDtls = await Driveraddress.findOne({ where: { id: id }, raw: true });

    if (getDtls) {

        res.json({ status: true, data: getDtls });

    }

    else {

        res.json({ status: false });

    }

});

// Update single driver address id

router.companyUpdateDriverAddressID = ('/companyUpdateDriverAddressID/', async (req, res) => {

    // console.log(req.query);

    // let id = req.query.id;

    const fData = JSON.parse(JSON.stringify(req.body))

    let UpdateDriverDtls = await Driveraddress.update(fData, {

        where: {

            id: req.body.id

        }

    });

    if (UpdateDriverDtls) {

        res.json({ status: true, message: "Address Updated" });

    }

    else {

        res.json({ status: false });

    }

});

// Add Address

router.companyAddDriverAddressID = ('/companyAddDriverAddressID/', async (req, res) => {

    const fData = JSON.parse(JSON.stringify(req.body))

    let AddDriverDtls = await Driveraddress.create(fData);

    if (AddDriverDtls) {

        res.json({ status: true, message: "Address Inserted" });

    }

    else {

        res.json({ status: false });

    }

});

//Delete Address

router.companydeleteDriverAddress = ('/companydeleteDriverAddress/', async (req, res) => {

    // console.log(req);

    let id = req.body.id;

    let deleteDriver = await Driveraddress.destroy({ where: { id: id } });

    if (deleteDriver) {

        res.json({ status: true, message: 'Address Deleted successfully' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});

// router.companyupdateDriverDetails = ('/companyupdateDriverDetails/', async (req, res) => {

//     console.log(req.body);

// // return false

//     if (req.body.fastCardAttachment_file != "") {

//         let driverDtls_last = 'public/uploads/attachment/driverDtls_fastCardAttachment/';

//         let driverDtls_fastCardAttachmentData = await fileUpload('driverDtls_fastCardAttachment', driverDtls_last, req.body.fastCardAttachment_file, req, res)

//         Object.assign(req.body, {

//             fastCardAttachment: driverDtls_fastCardAttachmentData // add json element

//         });

//     }

//     if (req.body.legalRightAtachment_file != "") {

//         let driverDtls_last = 'public/uploads/attachment/driverDtls_legalRightAtachment/';

//         let driverDtls_fastCardAttachmentData = await fileUpload('driverDtls_fastCardAttachment', driverDtls_last, req.body.fastCardAttachment_file, req, res)

//         Object.assign(req.body, {

//             legalRightAtachment: driverDtls_fastCardAttachmentData // add json element

//         });

//     }

//     if (req.body.legalRightUSAAtachment_file != "") {

//         let driverDtls_last = 'public/uploads/attachment/driverDtls_legalRightUSAAtachment/';

//         let legalRightUSAAtachment_fileData = await fileUpload('legalRightUSAAtachment_file', driverDtls_last, req.body.fastCardAttachment_file, req, res)

//         Object.assign(req.body, {

//             legalRightUSAAtachment: legalRightUSAAtachment_fileData // add json element

//         });

//     }

//     let date = new Date();

//     var updated_on =

//         ("00" + (date.getMonth() + 1)).slice(-2) + "-" +

//         ("00" + date.getDate()).slice(-2) + "-" +

//         date.getFullYear() + " " +

//         ("00" + date.getHours()).slice(-2) + ":" +

//         ("00" + date.getMinutes()).slice(-2) + ":" +

//         ("00" + date.getSeconds()).slice(-2);

//     Object.assign(req.body, {

//         updatedDate: updated_on // add json element

//     });

//     const fData = JSON.parse(JSON.stringify(req.body))

//     console.log(fData);

//     if (req.body.actionData == 'Update') {

//         delete req.body['actionData'];

//         const fData = JSON.parse(JSON.stringify(req.body))

//         let UpdateDriverDtls = await Driverdetails.update(fData, {

//             where: {

//                 driverId: req.body.driverId

//             }

//         });

//         if (UpdateDriverDtls) {

//             res.json({ status: true, message: 'Driver Details Updated' });

//         } else {

//             res.json({ status: false, message: 'Something went wrong' });

//         }

//     } else if (req.body.actionData == 'Create') {

//         //Inserting Driver multiple address

//         let DriverAddress;

//         let DriverState;

//         let DriverCity;

//         let DriverCountry;

//         let DriverProvince;

//         let DriverPostalCode;

//         let fromDate;

//         let toDate;

//         for (let index = 0; index < req.body.DriverAddressarr.length; index++) {

//                 DriverAddress =  req.body.DriverAddressarr[index];

//                 DriverState =  req.body.DriverStatearr[index];

//                 DriverCity =  req.body.DriverCityarr[index];

//                 DriverCountry =  req.body.DriverCountryarr[index];

//                 DriverProvince =  req.body.DriverProvincearr[index];

//                 DriverPostalCode =  req.body.DriverPostalCodearr[index];

//                 fromDate =  req.body.fromDatearr[index];

//                 toDate =  req.body.toDatearr[index];

//                  await sequelize.query('INSERT INTO driveraddress (company_id,driverId,driverAddress,DriverState,driverCity,driverCountry,driverProvince,driverPostalCode,driverFromDate,driverToDate) values ("'+req.body.company_id+'","'+req.body.driverId+'","'+DriverAddress+'","'+DriverState+'","'+DriverCity+'","'+DriverCountry+'","'+DriverProvince+'","'+DriverPostalCode+'","'+fromDate+'","'+toDate+'")');

//             }

//         delete req.body['actionData'];

//         delete req.body.DriverAddressarr;

//         delete req.body.DriverStatearr;

//         delete req.body.DriverCityarr;

//         delete req.body.DriverCountryarr;

//         delete req.body.DriverProvincearr;

//         delete req.body.DriverPostalCodearr;

//         delete req.body.fromDatearr;

//         delete req.body.toDatearr;

//         delete req.body.DriverAddress;

//         delete req.body.DriverState;

//         delete req.body.DriverCity;

//         delete req.body.DriverCountry;

//         delete req.body.DriverProvince;

//         delete req.body.DriverPostalCode;

//         delete req.body.fromDate;

//         delete req.body.toDate;

//         delete req.body.singleDurationInput;

//         console.log(req.body);

//         const fData = JSON.parse(JSON.stringify(req.body))

//         let create_DriverDtls = await Driverdetails.create(fData);

//         if (create_DriverDtls) {

//             res.json({ status: true, message: 'Driver Details Created' });

//         } else {

//             res.json({ status: false, message: 'Something went wrong' });

//         }

//     }

// });

router.updatedrivingHistory = ('/updatedrivingHistory/', async (req, res) => {

    let date = new Date();

    var updated_on =

        ("00" + (date.getMonth() + 1)).slice(-2) + "-" +

        ("00" + date.getDate()).slice(-2) + "-" +

        date.getFullYear() + " " +

        ("00" + date.getHours()).slice(-2) + ":" +

        ("00" + date.getMinutes()).slice(-2) + ":" +

        ("00" + date.getSeconds()).slice(-2);

    Object.assign(req.body, {

        updatedDate: updated_on // add json element

    });

    const fData = JSON.parse(JSON.stringify(req.body))

    // console.log(fData);

    if (req.body.actionData == 'Update') {

        delete req.body['actionData'];

        const fData = JSON.parse(JSON.stringify(req.body))

        let UpdateDriverDtls = await Drivinghistory.update(fData, {

            where: {

                driverId: req.body.driverId

            }

        });

        if (UpdateDriverDtls) {

            res.json({ status: true, message: 'Driver Details Updated' });

        } else {

            res.json({ status: false, message: 'Something went wrong' });

        }

    } else if (req.body.actionData == 'Create') {

        // Inserting Driver multiple address

        let Province;

        let License;

        let Attachment;

        let Type;

        let Expiry;

        let accidentsDate;

        let accidentsNature;

        let accidentsFatalities;

        let accidentsInjuries;

        let accidentsHazardous;

        let traficConvintionsDate;

        let traficConvintionsCharge;

        let traficConvintionsLocation;

        let traficConvintionsPenalty;



        if (req.body.signature != "") {

            let signaturepath = 'public/uploads/attachment/drivinghistoryaddressSignature/';

            let drivinghistoryaddressSignatureData = await fileUpload('drivinghistoryaddressSignature', signaturepath, req.body.signature, req, res)

            Object.assign(req.body, {

                signature: drivinghistoryaddressSignatureData // add json element

            });

        }

        //------Accident------

        // console.log('-----accident--------');

        if (req.body.accidents == 'Yes') {

            // if (typeof req.body.accidentsDateArr != 'undefined' && typeof req.body.accidentsDateArr != '') {

            if (req.body.accidentsDateArr.length > 0) {

                for (let indexAccident = 0; indexAccident < req.body.accidentsDateArr.length; indexAccident++) {

                    accidentsDate = req.body.accidentsDateArr[indexAccident];

                    accidentsNature = req.body.accidentsNatureArr[indexAccident];

                    accidentsFatalities = req.body.accidentsFatalitiesArr[indexAccident];

                    accidentsInjuries = req.body.accidentsInjuriesArr[indexAccident];

                    accidentsHazardous = req.body.accidentsHazardousArr[indexAccident];

                    await sequelize.query('INSERT INTO drivinghistoryaccident (company_id,driverId,accidentsDate,accidentsNature,accidentsFatalities,accidentsInjuries,accidentsHazardous) values ("' + req.body.company_id + '","' + req.body.driverId + '","' + accidentsDate + '","' + accidentsNature + '","' + accidentsFatalities + '","' + accidentsInjuries + '","' + accidentsHazardous + '")');

                    console.log('INSERT INTO drivinghistoryaccident (company_id,driverId,accidentsDate,accidentsNature,accidentsFatalities,accidentsInjuries,accidentsHazardous) values ("' + req.body.company_id + '","' + req.body.driverId + '","' + accidentsDate + '","' + accidentsNature + '","' + accidentsFatalities + '","' + accidentsInjuries + '","' + accidentsHazardous + '")');

                }

            }

            // }

        }

        // -----------Violation-------------

        // console.log('-----------Violation-------------');

        if (req.body.traficConvintions == 'Yes') {

            if (req.body.traficConvintionsDateArr.length > 0) {

                for (let indexViolation = 0; indexViolation < req.body.traficConvintionsDateArr.length; indexViolation++) {

                    traficConvintionsDate = req.body.traficConvintionsDateArr[indexViolation];

                    traficConvintionsCharge = req.body.traficConvintionsChargeArr[indexViolation];

                    traficConvintionsLocation = req.body.traficConvintionsLocationArr[indexViolation];

                    traficConvintionsPenalty = req.body.traficConvintionsPenaltyArr[indexViolation];

                    await sequelize.query('INSERT INTO drivinghistoryviolations (company_id,driverId,traficConvintionsDate,traficConvintionsCharge,traficConvintionsLocation,traficConvintionsPenalty) values ("' + req.body.company_id + '","' + req.body.driverId + '","' + traficConvintionsDate + '","' + traficConvintionsCharge + '","' + traficConvintionsLocation + '","' + traficConvintionsPenalty + '")');

                }

            }

        }

        if (req.body.provinceArr.length > 0) {

            for (let index = 0; index < req.body.provinceArr.length; index++) {

                Province = req.body.provinceArr[index];

                License = req.body.licenseArr[index];

                if (req.body.atachment_fileArr[index] != "") {

                    let Attachmentpath = 'public/uploads/attachment/drivinghistoryaddressAttachment/';

                    let drivinghistoryaddressAttachmentData = await fileUpload('drivinghistoryaddressAttachment', Attachmentpath, req.body.atachment_fileArr[index], req, res)

                    Object.assign(req.body, {

                        Attachment: drivinghistoryaddressAttachmentData // add json element

                    });

                }

                Type = req.body.typeArr[index];

                Expiry = req.body.expiryArr[index];

                await sequelize.query('INSERT INTO drivinghistoryaddress (company_id,driverId,province,license,attachment,type,expiry) values ("' + req.body.company_id + '","' + req.body.driverId + '","' + Province + '","' + License + '","' + req.body.Attachment + '","' + Type + '","' + Expiry + '")');

            }

        }

        delete req.body['accidentsDate'];

        delete req.body['accidentsNature'];

        delete req.body['accidentsFatalities'];

        delete req.body['accidentsInjuries'];

        delete req.body['accidentsHazardous'];

        delete req.body['traficConvintionsDate'];

        delete req.body['traficConvintionsCharge'];

        delete req.body['traficConvintionsLocation'];

        delete req.body['traficConvintionsPenalty'];



        const fData = JSON.parse(JSON.stringify(req.body))

        let create_DriverDtls = await Drivinghistory.create(fData);

        if (create_DriverDtls) {

            res.json({ status: true, message: 'Driver Details Created' });

        } else {

            res.json({ status: false, message: 'Something went wrong' });

        }

    }

});

router.getdrivingHistory = ('/getdrivingHistory/', async (req, res, next) => {

    let id = req.query.id;

    let tableData = '';

    let getDtls = await Drivinghistoryaddress.findAll({ where: { driverId: id }, raw: true });

    //Sort array by date

    getDtls.sort(function (a, b) {

        return new Date(a.fromDate) - new Date(b.fromDate)

    })

    if (getDtls !== undefined && getDtls.length > 0) {

        await getDtls.forEach(function (getDetails, i) {

            let attachmentpath = "uploads/attachment/drivinghistoryaddressAttachment/" + getDetails.attachment;

            tableData += '<tr><td>' + getDetails.province + '</td><td>' + getDetails.license + '</td><td>' + '<a class="btn btn-primary" target="_blank" id="attachment_file_link" href="' + attachmentpath + '">View <span class="glyphicon glyphicon-edit"></span><i style="font-size: 15px;" class="fas fa-search"></i></a>' + '</td><td>' + getDetails.type + '</td><td>' + getDetails.expiry + '</td>' + '<td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="editmodalidTest" class="btn btn-warning editmodalclassaddress"<span class="fas fa-edit"> Edit</span></a></td></tr>';

        });

        res.json({ status: true, data: tableData });

    }

    else {

        res.json({ status: false });

    }

});

router.getdrivingHistoryAccident = ('/getdrivingHistoryAccident/', async (req, res, next) => {

    let id = req.query.id;

    let tableData;

    let getDtls = await Drivinghistoryaccident.findAll({ where: { driverId: id }, raw: true });

    //Sort array by date

    getDtls.sort(function (a, b) {

        return new Date(a.fromDate) - new Date(b.fromDate)

    })

    if (getDtls !== undefined && getDtls.length > 0) {

        await getDtls.forEach(function (getDetails, i) {

            // let attachmentpath = "uploads/attachment/drivinghistoryaddressAttachment/" + getDetails.attachment;

            tableData += '<tr><td>' + getDetails.accidentsDate + '</td><td>' + getDetails.accidentsNature + '</td><td>' + getDetails.accidentsFatalities + '</td><td>' + getDetails.accidentsInjuries + '</td><td>' + getDetails.accidentsHazardous + '</td>' + '<td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="editmodalidTest" class="btn btn-warning editmodalclassaccident"<span class="fas fa-edit"> Edit</span></a></td></tr>';

        });

        res.json({ status: true, data: tableData,add:false });

    }

    else {
       tableData +='Add<tr><td colspan="6" style="text-align:center">No Record Found</td</tr>';
        res.json({ status: true, data: tableData,add:true });
       // res.json({ status: false });

    }

});

router.getdrivingHistoryViolations = ('/getdrivingHistoryViolations/', async (req, res, next) => {

    let id = req.query.id;

    let tableData;

    let getDtls = await Drivinghistoryviolations.findAll({ where: { driverId: id }, raw: true });

    //Sort array by date

    getDtls.sort(function (a, b) {

        return new Date(a.fromDate) - new Date(b.fromDate)

    })



    if (getDtls !== undefined && getDtls.length > 0) {

        await getDtls.forEach(function (getDetails, i) {

            // let attachmentpath = "uploads/attachment/drivinghistoryaddressAttachment/" + getDetails.attachment;

            tableData += '<tr><td>' + getDetails.traficConvintionsDate + '</td><td>' + getDetails.traficConvintionsCharge + '</td><td>' + getDetails.traficConvintionsLocation + '</td><td>' + getDetails.traficConvintionsPenalty + '</td>' + '<td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="editmodalidTest" class="btn btn-warning editmodalclassViolations"<span class="fas fa-edit"> Edit</span></a></td></tr>';

        });

        res.json({ status: true, data: tableData });

    }

    else {
        tableData +='<tr><td colspan="6" style="text-align:center">No Record Found</td</tr>';
        res.json({ status: true, data: tableData,add:true });
        //res.json({ status: false, data: 'no data' });

    }

});





router.deletedrivingHistory = ('/deletedrivingHistory/', async (req, res) => {

    // console.log(req);

    let id = req.body.id;

    let deleteDriver = await Drivinghistory.destroy({ where: { driverId: id } });

    if (deleteDriver) {

        res.json({ status: true, message: 'Deleted successfully' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});

// Get Motor vehicle certificate

router.motorVehicleCertificate = ('/motorVehicleCertificate/', async (req, res) => {

    // console.log(req.query);

    if (req.session.name != "" && req.session.name != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });
       

        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        // console.log(getDrivinghistory);

        // console.log(getdriver);

        res.render('motorVehicleCertificate', {

            title: 'Motor Vehicle Driver’s Certification of Compliance ',

            company_id: getdriver ? getdriver.company_id : '',

            driverId: getdriver ? getdriver.id : '',

            driverName: getdriver ? getdriver.driver_name : '',

            driver_license: getdriver ? getdriver.driver_license : '',

            license_expiry: getdriver ? getdriver.license_expiry : '',

            getDrivinghistorySignature: getDrivinghistory ? getDrivinghistory.signature : '',

            getupdatedDate: getDrivinghistory ? getDrivinghistory.updatedDate : '',



        });

    }

});

// Get Motor vehicle certificate 

router.medicalDecleration = ('/medicalDecleration/', async (req, res) => {

    // console.log(req.query);

    if (req.session.name != "" && req.session.name != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        let getDriverdetails = await Driverdetails.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: req.session.driver_id }, raw: true }); 

        let getcmpdtls = await Company.findOne({ where: { id: getdriver.company_id }, raw: true });

        // console.log(getDrivinghistory);

        // console.log(getdriver);

        res.render('medicalDecleration', {

            title: 'Medical Decleration',

            company_id: getdriver ? getdriver.company_id : '',

            driverId: getdriver ? getdriver.id : '',

            driverName: getdriver ? getdriver.driver_name : '',

            companyProvince: getDriverdetails ? getDriverdetails.companyProvince : '',

            getDrivinghistorySignature: getDrivinghistory ? getDrivinghistory.signature : '',

            getupdatedDate: getDrivinghistory ? getDrivinghistory.updatedDate : '',

            companyName: getcmpdtls ? getcmpdtls.name : ''

        });



    }

});

// Get Motor vehicle certificate

router.driverAck = ('/driverAck/', async (req, res) => {

    // console.log(req.query);

    if (req.session.name != "" && req.session.name != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        let getDriverdetails = await Driverdetails.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: req.session.driver_id }, raw: true });



        // if(typeof getDrivinghistory !== null && typeof getDrivinghistory.signature !== 'undefined' && typeof getDrivinghistory.signature != null && getDrivinghistory.signature !=''){

        if (typeof getDrivinghistory !== null) {

            res.render('driverAck.ejs', {

                title: 'Driver Acknowledgement ',

                company_id: getdriver ? getdriver.company_id : '',

                driverId: getdriver ? getdriver.id : '',

                driverName: getdriver ? getdriver.driver_name : '',

                companyProvince: getDriverdetails ? getDriverdetails.companyProvince : '',

                getDrivinghistorySignature: getDrivinghistory ? getDrivinghistory.signature : '',

                getupdatedDate: getDrivinghistory ? getDrivinghistory.updatedDate : '',

                eventsCalTimezone: getDriverdetails ? getDriverdetails.eventsCalTimezone : ''



            });

        }

    }

});



// Get pspDisclosure certificate

router.pspDisclosure = ('/pspDisclosure/', async (req, res) => {

    // console.log(req.query); 

    if (req.session.name != "" && req.session.name != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        let getDriverdetails = await Driverdetails.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getcmpdtls = await Company.findOne({ where: { id: getdriver.company_id }, raw: true });



        let date = new Date();

        var created_on =

            ("00" + (date.getMonth() + 1)).slice(-2) + "-" +

            ("00" + date.getDate()).slice(-2) + "-" +

            date.getFullYear() + " " +

            ("00" + date.getHours()).slice(-2) + ":" +

            ("00" + date.getMinutes()).slice(-2) + ":" +

            ("00" + date.getSeconds()).slice(-2);

        let date1;

        date1 = CertificateauthDtls ? CertificateauthDtls.date : created_on

        // if(CertificateauthDtls){

        //     let datecheck =  CertificateauthDtls ? CertificateauthDtls.date : created_on

        //     var event = new Date(datecheck);



        //     date1 = JSON.stringify(event)

        //     date1 = date1.slice(1,11)

        //  }else{

        //      date1 = '';

        //  }



        res.render('pspDisclosure.ejs', {

            title: 'PSP Disclosure ',

            company_id: getdriver ? getdriver.company_id : '',

            driverId: getdriver ? getdriver.id : '',

            driverName: getdriver ? getdriver.driver_name : '',

            companyProvince: getDriverdetails ? getDriverdetails.companyProvince : '',

            getDrivinghistorySignature: getDrivinghistory ? getDrivinghistory.signature : '',

            getupdatedDate: getDrivinghistory ? getDrivinghistory.updatedDate : '',

            eventsCalTimezone: getDriverdetails ? getDriverdetails.eventsCalTimezone : '',

            companyName: getcmpdtls ? getcmpdtls.name : '',

            certificateDate: date1



        });



    }

});



// function convert(str) {

//     var date = new Date(str),

//       mnth = ("0" + (date.getMonth() + 1)).slice(-2),

//       day = ("0" + date.getDate()).slice(-2);

//     return [date.getFullYear(), mnth, day].join("-");

//   }

//   console.log(convert("Thu Jun 09 2011 00:00:00 GMT+0530 (India Standard Time)"))

//   //-> "2011-06-08"  



// Get clearingHouseConsent certificate

router.clearingHouseConsent = ('/clearingHouseConsent/', async (req, res) => {

    // console.log(req.query);

    if (req.session.name != "" && req.session.name != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        let getDriverdetails = await Driverdetails.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getcmpdtls = await Company.findOne({ where: { id: getdriver.company_id }, raw: true });



        let date = new Date();

        let date1;

        var created_on =

            ("00" + (date.getMonth() + 1)).slice(-2) + "-" +

            ("00" + date.getDate()).slice(-2) + "-" +

            date.getFullYear() + " " +

            ("00" + date.getHours()).slice(-2) + ":" +

            ("00" + date.getMinutes()).slice(-2) + ":" +

            ("00" + date.getSeconds()).slice(-2);

        date1 = CertificateauthDtls ? CertificateauthDtls.date : created_on

        // if(CertificateauthDtls){

        //    let datecheck =  CertificateauthDtls ? CertificateauthDtls.date : created_on

        //    var event = new Date(datecheck);



        //    date1 = JSON.stringify(event)

        //    date1 = date1.slice(1,11)

        // }else{

        //     date1 = '';

        // }



        res.render('clearingHouseConsent.ejs', {

            title: 'Clearing House Consent ',

            company_id: getdriver ? getdriver.company_id : '',

            driverId: getdriver ? getdriver.id : '',

            driverName: getdriver ? getdriver.driver_name : '',

            driver_license: getdriver ? getdriver.driver_license : '',

            DOA: getDriverdetails ? getDriverdetails.DOA : '',

            DOB: getDriverdetails ? getDriverdetails.DOB : '',

            DriverProvince: getDriverdetails ? getDriverdetails.DriverProvince : '',

            companyProvince: getDriverdetails ? getDriverdetails.companyProvince : '',

            getDrivinghistorySignature: getDrivinghistory ? getDrivinghistory.signature : '',

            getupdatedDate: getDrivinghistory ? getDrivinghistory.updatedDate : '',

            eventsCalTimezone: getDriverdetails ? getDriverdetails.eventsCalTimezone : '',

            companyName: getcmpdtls ? getcmpdtls.name : '',



            adminSignature: CertificateauthDtls ? CertificateauthDtls.adminSignature : '',

            certificateDate: date1

        });

    }

});





// Get compensatedWork certificate

router.compensatedWork = ('/compensatedWork/', async (req, res) => {

    // console.log(req.query);

    if (req.session.name != "" && req.session.name != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        let getDriverdetails = await Driverdetails.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getcmpdtls = await Company.findOne({ where: { id: getdriver.company_id }, raw: true });



        let date = new Date();

        var created_on =

            ("00" + (date.getMonth() + 1)).slice(-2) + "-" +

            ("00" + date.getDate()).slice(-2) + "-" +

            date.getFullYear() + " " +

            ("00" + date.getHours()).slice(-2) + ":" +

            ("00" + date.getMinutes()).slice(-2) + ":" +

            ("00" + date.getSeconds()).slice(-2);



        let date1;

        date1 = CertificateauthDtls ? CertificateauthDtls.date : created_on

        // if(CertificateauthDtls){

        //     let datecheck =  CertificateauthDtls ? CertificateauthDtls.date : created_on

        //     var event = new Date(datecheck);



        //     date1 = JSON.stringify(event)

        //     date1 = date1.slice(1,11)

        //  }else{

        //      date1 = '';

        //  }





        res.render('compensatedWork.ejs', {

            title: 'Compensated Work',

            company_id: getdriver ? getdriver.company_id : '',

            driverId: getdriver ? getdriver.id : '',

            driverName: getdriver ? getdriver.driver_name : '',

            driver_license: getdriver ? getdriver.driver_license : '',

            DOA: getDriverdetails ? getDriverdetails.DOA : '',

            DriverProvince: getDriverdetails ? getDriverdetails.DriverProvince : '',

            companyProvince: getDriverdetails ? getDriverdetails.companyProvince : '',

            getDrivinghistorySignature: getDrivinghistory ? getDrivinghistory.signature : '',

            getupdatedDate: getDrivinghistory ? getDrivinghistory.updatedDate : '',

            eventsCalTimezone: getDriverdetails ? getDriverdetails.eventsCalTimezone : '',

            companyName: getcmpdtls ? getcmpdtls.name : '',

            certificateDate: date1



        });

    }

});



// Get drugAndAlcohol certificate

router.drugAndAlcohol = ('/drugAndAlcohol/', async (req, res) => {

    // console.log(req.query);

    if (req.session.name != "" && req.session.name != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        let getDriverdetails = await Driverdetails.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getcmpdtls = await Company.findOne({ where: { id: getdriver.company_id }, raw: true });



        let date = new Date();

        var created_on =

            ("00" + (date.getMonth() + 1)).slice(-2) + "-" +

            ("00" + date.getDate()).slice(-2) + "-" +

            date.getFullYear() + " " +

            ("00" + date.getHours()).slice(-2) + ":" +

            ("00" + date.getMinutes()).slice(-2) + ":" +

            ("00" + date.getSeconds()).slice(-2);



        let date1;

        date1 = CertificateauthDtls ? CertificateauthDtls.date : created_on

        // if(CertificateauthDtls){

        //     let datecheck =  CertificateauthDtls ? CertificateauthDtls.date : created_on

        //     var event = new Date(datecheck);



        //     date1 = JSON.stringify(event)

        //     date1 = date1.slice(1,11)

        //  }else{

        //      date1 = '';

        //  }





        res.render('drugAndAlcohol.ejs', {

            title: 'Drug and Alcohol Work',

            company_id: getdriver ? getdriver.company_id : '',

            driverId: getdriver ? getdriver.id : '',

            driverName: getdriver ? getdriver.driver_name : '',

            driver_license: getdriver ? getdriver.driver_license : '',

            DOA: getDriverdetails ? getDriverdetails.DOA : '',

            DriverProvince: getDriverdetails ? getDriverdetails.DriverProvince : '',

            companyProvince: getDriverdetails ? getDriverdetails.companyProvince : '',

            getDrivinghistorySignature: getDrivinghistory ? getDrivinghistory.signature : '',

            getupdatedDate: getDrivinghistory ? getDrivinghistory.updatedDate : '',

            eventsCalTimezone: getDriverdetails ? getDriverdetails.eventsCalTimezone : '',

            companyName: getcmpdtls ? getcmpdtls.name : '',

            certificateDate: date1



        });

    }

});

// Get Reference certificate

router.Reference = ('/Reference/', async (req, res) => {

    // console.log(req.query);

    if (req.session.name != "" && req.session.name != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        let getDriverdetails = await Driverdetails.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getcmpdtls = await Company.findOne({ where: { id: getdriver.company_id }, raw: true });



        let date = new Date();

        var created_on =

            ("00" + (date.getMonth() + 1)).slice(-2) + "-" +

            ("00" + date.getDate()).slice(-2) + "-" +

            date.getFullYear() + " " +

            ("00" + date.getHours()).slice(-2) + ":" +

            ("00" + date.getMinutes()).slice(-2) + ":" +

            ("00" + date.getSeconds()).slice(-2);



        let date1;

        date1 = CertificateauthDtls ? CertificateauthDtls.date : created_on



        res.render('Reference.ejs', {

            title: 'Reference Certificate',

            company_id: getdriver ? getdriver.company_id : '',

            driverId: getdriver ? getdriver.id : '',

            driverName: getdriver ? getdriver.driver_name : '',

            driver_license: getdriver ? getdriver.driver_license : '',

            DOA: getDriverdetails ? getDriverdetails.DOA : '',

            DriverProvince: getDriverdetails ? getDriverdetails.DriverProvince : '',

            companyProvince: getDriverdetails ? getDriverdetails.companyProvince : '',

            getDrivinghistorySignature: getDrivinghistory ? getDrivinghistory.signature : '',

            getupdatedDate: getDrivinghistory ? getDrivinghistory.updatedDate : '',

            eventsCalTimezone: getDriverdetails ? getDriverdetails.eventsCalTimezone : '',

            companyName: getcmpdtls ? getcmpdtls.name : '',

            certificateDate: date1



        });

    }

});



// Get hoursOfService certificate

router.hoursOfService = ('/hoursOfService/', async (req, res) => {

    // console.log(req.query);

    if (req.session.name != "" && req.session.name != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        let getDriverdetails = await Driverdetails.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getcmpdtls = await Company.findOne({ where: { id: getdriver.company_id }, raw: true });

        let gethosdtls = await Hos.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getDrivinghistoryaddress = await Drivinghistoryaddress.findOne({ where: { driverId: req.session.driver_id }, order: [['id', 'DESC']], raw: true });

        // console.log(getDrivinghistoryaddress.province);

        let date = new Date();

        var created_on =

            ("00" + (date.getMonth() + 1)).slice(-2) + "-" +

            ("00" + date.getDate()).slice(-2) + "-" +

            date.getFullYear() + " " +

            ("00" + date.getHours()).slice(-2) + ":" +

            ("00" + date.getMinutes()).slice(-2) + ":" +

            ("00" + date.getSeconds()).slice(-2);



        res.render('hoursOfService.ejs', {

            title: 'Hours of Service Work',

            company_id: getdriver ? getdriver.company_id : '',

            driverId: getdriver ? getdriver.id : '',

            driverName: getdriver ? getdriver.driver_name : '',

            driver_license: getdriver ? getdriver.driver_license : '',

            DOA: getDriverdetails ? getDriverdetails.DOA : '',

            DriverProvince: getDriverdetails ? getDriverdetails.DriverProvince : '',

            companyProvince: getDriverdetails ? getDriverdetails.companyProvince : '',

            getDrivinghistorySignature: getDrivinghistory ? getDrivinghistory.signature : '',

            getupdatedDate: getDrivinghistory ? getDrivinghistory.updatedDate : '',

            eventsCalTimezone: getDriverdetails ? getDriverdetails.eventsCalTimezone : '',

            companyName: getcmpdtls ? getcmpdtls.name : '',

            hosdateData: gethosdtls ? gethosdtls.dateData : '',

            hosdurationData: gethosdtls ? gethosdtls.durationData : '',

            hosselectedDate: gethosdtls ? gethosdtls.selectedDate : '',

            hoscreatedAt: gethosdtls ? gethosdtls.createdAt : '',

            classOfLicense: gethosdtls ? gethosdtls.createdAt : '',

            hosAttachment_attachment: gethosdtls ? gethosdtls.hosAttachment_attachment : '',

            getDrivinghistoryaddressProvince: getDrivinghistoryaddress ? getDrivinghistoryaddress.province : '',

            getDrivinghistoryaddressLicense: getDrivinghistoryaddress ? getDrivinghistoryaddress.license : '',

            totalDuration: gethosdtls ? gethosdtls.totalDuration : '',

        });

    }

});



router.getcertificateDtls = ('/getcertificateDtls/', async (req, res) => {
    let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: req.query.driverId, certificateID: req.query.certificateID }, raw: true });

    if (CertificateauthDtls) {

        res.json({ status: true, message: CertificateauthDtls });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});

// router.getHosDtls = ('/getHosDtls/', async (req, res) => {



//     let getHosDtls = await Hos.findAll({ where: { driverId: req.query.driverId}, raw: true });

//     // console.log(getHosDtls);

//     if (getHosDtls) {

//         res.json({ status: true, message: getHosDtls });

//     } else {

//         res.json({ status: false, message: 'Something went wrong' });

//     }

// });







router.getHosDtls = ('/getHosDtls/', async (req, res, next) => {

    let driverId = req.query.driverId;

    let tableData;

    let getDtls = await Hos.findAll({ where: { driverId: driverId }, raw: true });

    let n = 1

    if (typeof getDtls !== 'undefined' && getDtls.length > 0) {

        await getDtls.forEach(function (getDetails, i) {



            tableData += '<tr><td>' + n + '</td><td>' + getDetails.actualDate + '</td><td>' + getDetails.duration + '</td></tr>';

            n++;

        });

        res.json({ status: true, data: tableData });

    }

    else {

        res.json({ status: false });

    }

});









router.insertHos = ('/insertHos/', async (req, res) => {

    let Duration;

    let actualDate;

    let create_hos;

    let totalDuration;

    // console.log(req.body);

    let date = new Date();

    var updated_on =

        ("00" + (date.getMonth() + 1)).slice(-2) + "-" +

        ("00" + date.getDate()).slice(-2) + "-" +

        date.getFullYear() + " " +

        ("00" + date.getHours()).slice(-2) + ":" +

        ("00" + date.getMinutes()).slice(-2) + ":" +

        ("00" + date.getSeconds()).slice(-2);



    let hosAttachment_attachment;

    if (req.body.hosAttachment_file != "") {

        let hosAttachment = 'public/uploads/attachment/hosAttachment/';

        let hosAttachmentData = await fileUpload('hosAttachment', hosAttachment, req.body.hosAttachment_file, req, res)

        // Object.assign(req.body, {

        hosAttachment_attachment = hosAttachmentData // add json element

        // });

    }

    totalDuration = req.body.totalDuration;



    for (let index = 0; index < req.body.durationArr.length; index++) {

        Duration = req.body.durationArr[index];

        actualDate = req.body.actualDateArr[index];



        create_hos = await sequelize.query('INSERT INTO hos (company_id,driverId,dateData,durationData,selectedDate,duration,actualDate,createdAt,hosAttachment_attachment,totalDuration) values ("' + req.body.company_id + '","' + req.body.driverId + '","' + req.body.dateData + '","' + req.body.durationData + '","' + req.body.selectedDate + '","' + Duration + '","' + actualDate + '","' + updated_on + '","' + hosAttachment_attachment + '","' + totalDuration + '")');

    }



    if (req.body.durationArr) {

        res.json({ status: true, message: 'Hos logs Created' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }



});





router.certificateapprovalUpdate = ('/certificateapprovalUpdate/', async (req, res) => {



    if (req.body.adminSignature != "") {

        let signaturepath =

            'public/uploads/attachment/clearHouseSupervisor/';

        let drivinghistoryaddressSignatureData = await

            fileUpload('clearHouseSupervisor', signaturepath,

                req.body.adminSignature, req, res)

        Object.assign(req.body, {

            adminSignature: drivinghistoryaddressSignatureData // add json element

        });

    }

    // let approveDtls = await Certificateauth.create(req.body); 

    let approveDtls = await Certificateauth.update({ adminSignature: req.body.adminSignature }, {

        where: {

            certificateID: req.body.certificateID,

            driverId: req.body.driverId

        }

    });
    if(req.body.orgName){
        await Certificateauth.update({ orgName: req.body.orgName }, {

            where: {
    
                certificateID: req.body.certificateID,
    
                driverId: req.body.driverId
    
            }
    
        });
    }

    if (approveDtls) {

        res.json({ status: true, message: 'Certificate Approved successfully' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});



router.certificateapproval = ('/certificateapproval/', async (req, res) => {

    // console.log(req.body);

    // console.log(req.body.adminSignature);

    // let id = req.body.id;



    let date = new Date();

    var updated_on =

        ("00" + (date.getMonth() + 1)).slice(-2) + "-" +

        ("00" + date.getDate()).slice(-2) + "-" +

        date.getFullYear() + " " +

        ("00" + date.getHours()).slice(-2) + ":" +

        ("00" + date.getMinutes()).slice(-2) + ":" +

        ("00" + date.getSeconds()).slice(-2);

     console.log(req.body);
    

    if (req.body.adminSignature) {

        let signaturepath =

            'public/uploads/attachment/drivinghistoryaddressSignature/';

        let drivinghistoryaddressSignatureData = await

            fileUpload('drivinghistoryaddressSignature', signaturepath,

                req.body.adminSignature, req, res)

        Object.assign(req.body, {

            adminSignature: drivinghistoryaddressSignatureData // add json element

        });

    }

    Object.assign(req.body, {

        date: updated_on // add json element

    });

    // console.log(req.body);

    let approveDtls = await Certificateauth.create(req.body);

    // let approveDtls = await Certificateauth.update({ adminSignature: req.body.adminSignature }, {

    //     where: {

    //         certificateID: req.body.certificateID,

    //         driverId: req.body.driverId

    //     }

    // });

    if (approveDtls) {

        res.json({ status: true, message: 'Certificate Approved successfully' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});





// documentUpload 

router.documentUpload = ('/documentUpload/', async (req, res) => {

    // console.log(req.query);  

    if (req.session.name != "" && req.session.name != "undefined") {



        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        let getcmpdtls = await Company.findOne({ where: { id: getdriver.company_id }, raw: true });



        // get count to handle button

        let getlicencefrontcount = await FileuploadDB.count({ distinct: 'id', where: { fileType: 'LICENCE FRONT', driverId: req.session.driver_id } });

        let getlicencebackcount = await FileuploadDB.count({ distinct: 'id', where: { fileType: 'LICENCE BACK', driverId: req.session.driver_id } });

        let getcvorCount = await FileuploadDB.count({ distinct: 'id', where: { fileType: 'CVOR', driverId: req.session.driver_id } });

        let getabstractCount = await FileuploadDB.count({ distinct: 'id', where: { fileType: 'Abstract', driverId: req.session.driver_id } });

        let getpspCount = await FileuploadDB.count({ distinct: 'id', where: { fileType: 'PSP', driverId: req.session.driver_id } });

        let getpolice_clearanceCount = await FileuploadDB.count({ distinct: 'id', where: { fileType: 'Police_Clearance', driverId: req.session.driver_id } });

        let getsecondary_idCount = await FileuploadDB.count({ distinct: 'id', where: { fileType: 'Secondary_Id', driverId: req.session.driver_id } });



        res.render('documentUpload.ejs', {

            title: 'Document Upload',

            driverID: getdriver ? getdriver.id : '',

            CompanyName: getcmpdtls ? getcmpdtls.name : '',

            company_id: getdriver ? getdriver.company_id : '',

            getcvorCount: getcvorCount ? getcvorCount : '',

            getabstractCount: getabstractCount ? getabstractCount : '',

            getlicencefrontcount:getlicencefrontcount?getlicencefrontcount:'',

            getlicencebackcount:getlicencebackcount?getlicencebackcount:'',

            getpspCount: getpspCount ? getpspCount : '',

            getpolice_clearanceCount: getpolice_clearanceCount ? getpolice_clearanceCount : '',

            getsecondary_idCount: getsecondary_idCount ? getsecondary_idCount : ""

        });

    }

});





router.insertFileUpload = ('/insertFileUpload/', async (req, res) => {

    // console.log(req.body);

    let date = new Date();

    var updated_on =

        ("00" + (date.getMonth() + 1)).slice(-2) + "-" +

        ("00" + date.getDate()).slice(-2) + "-" +

        date.getFullYear() + " " +

        ("00" + date.getHours()).slice(-2) + ":" +

        ("00" + date.getMinutes()).slice(-2) + ":" +

        ("00" + date.getSeconds()).slice(-2);

    Object.assign(req.body, {

        updatedDate: updated_on // add json element

    });



    let finaldata;
console.log(req.body);
    if (typeof req.body.fileType_licence_front != 'undefined') {

        if (req.body.fileType_licence_front.length > 0) {

            for (let index = 0; index < req.body.fileType_licence_front.length; index++) {

                fileType_LicenceFront = req.body.fileType_licence_front[index];

                fs.writeFileSync('test64.txt', req.body.attachment_file_licece_front[index]);

                if (req.body.attachment_file_licece_front[index] != "") {

                    let Attachmentpath = 'public/uploads/attachment/fileupload/';

                    let AttachmentData = await fileUpload('Attachment', Attachmentpath, req.body.attachment_file_licece_front[index], req, res)

                    Object.assign(req.body, {

                        Attachment: AttachmentData // add json element

                    });

                }

                finaldata = await sequelize.query('INSERT INTO fileupload (company_id,driverId,fileName,fileType,updated_on) values ("' + req.body.company_id + '","' + req.body.driverId + '","' + req.body.Attachment + '","' + fileType_LicenceFront + '","' + updated_on + '")');

            }

        }

    }

    if (typeof req.body.fileType_licence_back != 'undefined') {

        if (req.body.fileType_licence_back.length > 0) {

            for (let index = 0; index < req.body.fileType_licence_back.length; index++) {

                fileType_LicenceBack = req.body.fileType_licence_back[index];

                fs.writeFileSync('test64.txt', req.body.attachment_file_licece_back[index]);

                if (req.body.attachment_file_licece_back[index] != "") {

                    let Attachmentpath = 'public/uploads/attachment/fileupload/';

                    let AttachmentData = await fileUpload('Attachment', Attachmentpath, req.body.attachment_file_licece_back[index], req, res)

                    Object.assign(req.body, {

                        Attachment: AttachmentData // add json element

                    });

                }

                finaldata = await sequelize.query('INSERT INTO fileupload (company_id,driverId,fileName,fileType,updated_on) values ("' + req.body.company_id + '","' + req.body.driverId + '","' + req.body.Attachment + '","' + fileType_LicenceBack + '","' + updated_on + '")');

            }

        }

    }

    if (typeof req.body.fileTypearr_cvor != 'undefined') {

        if (req.body.fileTypearr_cvor.length > 0) {

            for (let index = 0; index < req.body.fileTypearr_cvor.length; index++) {

                fileType_cvor = req.body.fileTypearr_cvor[index];

                fs.writeFileSync('test64.txt', req.body.atachment_fileArr_cvor[index]);

                if (req.body.atachment_fileArr_cvor[index] != "") {

                    let Attachmentpath = 'public/uploads/attachment/fileupload/';

                    let AttachmentData = await fileUpload('Attachment', Attachmentpath, req.body.atachment_fileArr_cvor[index], req, res)

                    Object.assign(req.body, {

                        Attachment: AttachmentData // add json element

                    });

                }

                finaldata = await sequelize.query('INSERT INTO fileupload (company_id,driverId,fileName,fileType,updated_on) values ("' + req.body.company_id + '","' + req.body.driverId + '","' + req.body.Attachment + '","' + fileType_cvor + '","' + updated_on + '")');

            }

        }

    }

    if (typeof req.body.fileTypearr_abstract != 'undefined') {

        if (req.body.fileTypearr_abstract.length > 0) {

            for (let index = 0; index < req.body.fileTypearr_abstract.length; index++) {

                fileType_abstract = req.body.fileTypearr_abstract[index];

                if (req.body.atachment_fileArr_abstract[index] != "") {

                    let Attachmentpath = 'public/uploads/attachment/fileupload/';

                    let AttachmentData = await fileUpload('Attachment', Attachmentpath, req.body.atachment_fileArr_abstract[index], req, res)

                    Object.assign(req.body, {

                        Attachment: AttachmentData // add json element

                    });

                }

                finaldata = await sequelize.query('INSERT INTO fileupload (company_id,driverId,fileName,fileType,updated_on) values ("' + req.body.company_id + '","' + req.body.driverId + '","' + req.body.Attachment + '","' + fileType_abstract + '","' + updated_on + '")');

            }

        }

    }

    if (typeof req.body.fileTypearr_psp != 'undefined') {

        if (req.body.fileTypearr_psp.length > 0) {

            for (let index = 0; index < req.body.fileTypearr_psp.length; index++) {

                fileType_psp = req.body.fileTypearr_psp[index];

                if (req.body.atachment_fileArr_psp[index] != "") {

                    let Attachmentpath = 'public/uploads/attachment/fileupload/';

                    let AttachmentData = await fileUpload('Attachment', Attachmentpath, req.body.atachment_fileArr_psp[index], req, res)

                    Object.assign(req.body, {

                        Attachment: AttachmentData // add json element

                    });

                }

                finaldata = await sequelize.query('INSERT INTO fileupload (company_id,driverId,fileName,fileType,updated_on) values ("' + req.body.company_id + '","' + req.body.driverId + '","' + req.body.Attachment + '","' + fileType_psp + '","' + updated_on + '")');

            }

        }

    }

    if (typeof req.body.fileTypearr_police_clearance != 'undefined') {

        if (req.body.fileTypearr_police_clearance.length > 0) {

            for (let index = 0; index < req.body.fileTypearr_police_clearance.length; index++) {

                fileType_police_clearance = req.body.fileTypearr_police_clearance[index];

                if (req.body.atachment_fileArr_police_clearance[index] != "") {

                    let Attachmentpath = 'public/uploads/attachment/fileupload/';

                    let AttachmentData = await fileUpload('Attachment', Attachmentpath, req.body.atachment_fileArr_police_clearance[index], req, res)

                    Object.assign(req.body, {

                        Attachment: AttachmentData // add json element

                    });

                }

                finaldata = await sequelize.query('INSERT INTO fileupload (company_id,driverId,fileName,fileType,updated_on) values ("' + req.body.company_id + '","' + req.body.driverId + '","' + req.body.Attachment + '","' + fileType_police_clearance + '","' + updated_on + '")');

            }

        }

    }

    if (typeof req.body.fileTypearr_secondary_id != 'undefined') {

        if (req.body.fileTypearr_secondary_id.length > 0) {

            for (let index = 0; index < req.body.fileTypearr_secondary_id.length; index++) {

                fileType_secondary_id = req.body.fileTypearr_secondary_id[index];

                if (req.body.atachment_fileArr_secondary_id[index] != "") {

                    let Attachmentpath = 'public/uploads/attachment/fileupload/';

                    let AttachmentData = await fileUpload('Attachment', Attachmentpath, req.body.atachment_fileArr_secondary_id[index], req, res)

                    Object.assign(req.body, {

                        Attachment: AttachmentData // add json element

                    });

                }

                finaldata = await sequelize.query('INSERT INTO fileupload (company_id,driverId,fileName,fileType,updated_on) values ("' + req.body.company_id + '","' + req.body.driverId + '","' + req.body.Attachment + '","' + fileType_secondary_id + '","' + updated_on + '")');

            }

        }

    }



    // delete req.body['accidentsHazardous'];



    if (finaldata) {

        res.json({ status: true, message: 'Files Uploaded' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }



});



// feedback 

router.feedback = ('/feedback/', async (req, res) => {

    // console.log(req.query);  

    if (req.session.name != "" && req.session.name != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        let getcmpdtls = await Company.findOne({ where: { id: getdriver.company_id }, raw: true });

        let getDtls = await Driverdetails.findOne({ where: { driverId: getdriver.id }, raw: true });



        res.render('feedback.ejs', {

            title: 'Feedback Form',

            driverID: getdriver ? getdriver.id : '',

            CompanyName: getcmpdtls ? getcmpdtls.name : '',

            company_id: getdriver ? getdriver.company_id : '',

            driverEmail: getDtls ? getDtls.email : ''

        });

    }

});





router.insertfeedback = ('/insertfeedback/', async (req, res) => {

    // console.log(req.body);

    let date = new Date();

    var updated_on =

        ("00" + (date.getMonth() + 1)).slice(-2) + "-" +

        ("00" + date.getDate()).slice(-2) + "-" +

        date.getFullYear() + " " +

        ("00" + date.getHours()).slice(-2) + ":" +

        ("00" + date.getMinutes()).slice(-2) + ":" +

        ("00" + date.getSeconds()).slice(-2);

    Object.assign(req.body, {

        updated_on: updated_on // add json element

    });



    const fData = JSON.parse(JSON.stringify(req.body))

    let create_feedback = await Feedback.create(fData);





    let to = 'compliancementorzportal@gmail.com'

    let cc = ''

    let subject = 'New Feedback From compliancementorz portal'

    // let message = 'test mail';

    let message = '<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width,initial-scale=1"> <meta name="x-apple-disable-message-reformatting"> <title></title> <style>table, td, div, h1, p{font-family: Arial, sans-serif;}@media screen and (max-width: 530px){.unsub{display: block; padding: 8px; margin-top: 14px; border-radius: 6px; background-color: #555555; text-decoration: none !important; font-weight: bold;}.col-lge{max-width: 100% !important;}}@media screen and (min-width: 531px){.col-sml{max-width: 27% !important;}.col-lge{max-width: 73% !important;}}</style></head><body style="margin:0;padding:0;word-spacing:normal;background-color:#939297;"> <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297;"> <table role="presentation" style="width:100%;border:none;border-spacing:0;"> <tr> <td align="center" style="padding:0;"> <table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;"> <tr> <td style="padding:40px 30px 30px 30px;text-align:center;font-size:24px;font-weight:bold;"> <a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="165" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> </td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Hi Admin</p> <br><p style="margin:0;">New Feedback From compliancementorz portal  <br> From : ' + req.body.email + ' <br> Message: ' + req.body.message + ' <br>  </td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Thank you,</p><p style="margin:0;">Safety Department  </p><br><a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="90" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> <p style="margin:0;">Tel: 905-486-1666</p><p style="margin:0;">Web: www.compliancementorz.com</p></td></tr><tr> <td style="padding:30px;text-align:center;font-size:12px;background-color:#404040;color:#cccccc;"> <p style="margin:0;font-size:14px;line-height:20px;">&reg; compliancementorz 2022</p></td></tr></table> </td></tr></table> </div></body></html>';

    let newDriverEmail = await sendMail(to, cc, subject, message, req, res)



    // delete req.body['accidentsHazardous'];



    if (create_feedback) {

        res.json({ status: true, message: 'Thanks for your feedback we will get back to you' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }



});



















































router.gtestFile = ('/gtestFile/', async (req, res) => {

    try {

        console.log('API initiated     ');

        let getLog = '';

        getLog += 'API initiated       ';

        // console.log(req.body.atachment_fileAr);

        // return false

        var d = new Date(); d.getMinutes() + d.getSeconds();

        console.log(d);

        getLog += d;

        let finaldata;

        if (typeof req.body.atachment_fileAr != 'undefined') {

            // if (req.body.atachment_fileAr.length > 0) {

            // for (let index = 0; index < req.body.atachment_fileAr.length; index++) {



            if (req.body.atachment_fileAr != "") {

                let Attachmentpath = 'public/uploads/attachment/fileupload/';

                console.log('before file upload');

                var d1 = new Date(); d1.getMinutes() + d1.getSeconds();

                console.log(d1);

                getLog += 'before file upload    '

                getLog += d1

                let AttachmentData = await fileUpload('Attachment', Attachmentpath, req.body.atachment_fileAr, req, res)

                Object.assign(req.body, {

                    Attachment: AttachmentData // add json element

                });



                console.log('After file upload');

                var d2 = new Date(); d2.getMinutes() + d2.getSeconds();

                console.log(d2);

                getLog += 'After file upload   '

                getLog += d2



            }

            // finaldata = await sequelize.query('INSERT INTO fileupload (company_id,driverId,fileName,fileType,updated_on) values ("' + req.body.company_id + '","' + req.body.driverId + '","' + req.body.Attachment + '","' + fileType_cvor + '","' + updated_on + '")');

            console.log('All done');

            var d3 = new Date(); d3.getMinutes() + d3.getSeconds();

            console.log(d3);

            getLog += 'All done  '

            getLog += d3

            fs.writeFileSync('test.txt', getLog);

            // }

            // }

        }

        res.json({ status: true, message: 'Files Uploaded', log: getLog });

    }

    catch (err) {

        res.json({ status: false, message: 'Something went wrong' });

        throw Error(err)



    }

});





























router.companyfileuploadForm = async (req, res) => {

    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });

    res.render('companyfileuploadForm', {

        title: 'File Upload Form',

        getCompanydata: getCompanydata,

        company_id: req.session.userId

    });

};

router.company_get_fileuploadForm = async (req, res) => {

    console.log('get updatefileuploadFormSuperadmin');

    let cmpid = req.query.cmpid;

    let col = req.query.columns[[0]].column || 'fileupload.id';

    let direction = req.query.columns[[0]].dir || 'DESC';

    let columns = ['id', 'fileName', 'fileType', 'driverId', 'd.driver_name'];

    let searchKey = '';

    let where = [];
    let where1 = [];

    // Search Conditions

    if (req.query.search.value) {

        if (req.query.search.value != "") {

            where1.push({

                [Op.or]: [

                    { 'driver_name': { [Op.like]: `%` + req.query.search.value + `%` } }

                ]

            });

        } else {

            where1.push({ ['fileName']: { [Op.like]: `%` + req.query.search.value + `%` } });

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

        group: ['driverId'],

        attributes: columns,

        raw: true,
        where: where,
       // where: { company_id: cmpid },

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

    await FileuploadDB.paginate(options).then(function (dt) {

        let data = dt.docs.map(formData);

        // function formData(key) {

        function formData(key, index) {

            index = parseInt(index) + 1 +parseInt(req.query.start)

            Object.assign(key, {

                slno: index

            });

            key.driverId = key.driverId,

                // key.fileName = key.fileName,

                Object.assign(key, {

                    action: "<a href='javascript:void(0)' data-id='" + key.driverId + "' data-fileType='LICENCE FRONT' class='btn btn-info viewmodalclass'><span class='fas fa-search' style='margin-bottom:10px;'> View | Delete Licence Frontside</span></a> " +
                    
                    " <a href='javascript:void(0)' data-id='" + key.driverId + "' data-fileType='LICENCE BACK' class='btn btn-dark viewmodalclass' style='margin-bottom:10px;'><span class='fas fa-search'> View | Delete Licence Backside</span></a> " +
                    
                    
                    " <a href='javascript:void(0)' data-id='" + key.driverId + "' data-fileType='cvor' class='btn btn-info viewmodalclass'><span class='fas fa-search'> View | Delete CVOR</span></a> " +

                        " <a href='javascript:void(0)' data-id='" + key.driverId + "'  data-fileType='abstract' class='btn btn-dark viewmodalclass'><span class='fas fa-search'> View | Delete Abstract</span></a> " +

                        "<a href='javascript:void(0)' data-id='" + key.driverId + "'  data-fileType='psp' class='btn btn-warning viewmodalclass'><span class='fas fa-search'> View | Delete PSP</span></a> " +

                        "<a href='javascript:void(0)' data-id='" + key.driverId + "'  data-fileType='police_clearance' class='btn btn-primary viewmodalclass'><span class='fas fa-search'> View | Delete Police clearance</span></a> " +

                        "<a href='javascript:void(0)' data-id='" + key.driverId + "'  data-fileType='secondary_id' class='btn btn-danger viewmodalclass'><span class='fas fa-search'> View | Delete Secondary Id</span></a> "

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

// router.companyeditupdateDriverDetailsForm = ('/companyeditupdateDriverDetailsForm/', async (req, res) => {

//     console.log(req.query);

//     let id = req.query.id;

//     let getDtls = await Driverdetails.findOne({ where: { driverId: id }, raw: true });

//     // console.log(getDtls);

//     if (getDtls) {

//         res.json({ status: true, data: getDtls });

//     }

//     else {

//         res.json({ status: false });

//     }

// });

// // Get Single file upload id

router.companygetfileupload = ('/companygetfileupload/', async (req, res) => {

    // console.log(req.query);

    let id = req.query.id;



    let getDtls = await FileuploadDB.findOne({ where: { id: id }, raw: true });

    if (getDtls) {

        res.json({ status: true, data: getDtls });

    }

    else {

        res.json({ status: false });

    }

});

// // Update single driver fileupload id

router.getupdatefileupload = ('/getupdatefileupload/', async (req, res) => {

    // console.log(req.query);

    // let id = req.query.id;





    if (req.body.fileupload_file != "") {

        let fileupload = 'public/uploads/attachment/fileupload/';

        let fileuploadData = await fileUpload('fileupload', fileupload, req.body.fileupload_file, req, res)

        Object.assign(req.body, {

            fileName: fileuploadData // add json element

        });

    }



    const fData = JSON.parse(JSON.stringify(req.body))

    let UpdateDriverDtls = await FileuploadDB.update(fData, {

        where: {

            id: req.body.id

        }

    });

    if (UpdateDriverDtls) {

        res.json({ status: true, message: "File Updated" });

    }

    else {

        res.json({ status: false });

    }

});













router.getfileupload = ('/getfileupload/', async (req, res, next) => {

    let id = req.query.id;

    let fileType = req.query.fileType

    // let fileType = 'cvor'

    let tableData = '';

    let getDtls = await FileuploadDB.findAll({ where: { driverId: id, fileType: fileType }, raw: true });

    //Sort array by date

    getDtls.sort(function (a, b) {

        return new Date(a.fromDate) - new Date(b.fromDate)

    })

    if (getDtls !== undefined && getDtls.length > 0) {

        await getDtls.forEach(function (getDetails, i) {

            let attachmentpath = "uploads/attachment/fileupload/" + getDetails.fileName;

            tableData += '<tr><td>' + '<a download class="btn btn-primary" target="_blank" id="attachment_file_link" href="' + attachmentpath + '">Download <span class="glyphicon glyphicon-edit"></span><i style="font-size: 15px;" class="fas fa-download"></i></a>' + '</td><td>' + '<a class="btn btn-warning" target="_blank" id="attachment_file_link" href="' + attachmentpath + '">View <span class="glyphicon glyphicon-edit"></span><i style="font-size: 15px;" class="fas fa-search"></i></a>' + '</td><td>' + getDetails.fileType + '</td><td>' + getDetails.updated_on + '</td>' + '<td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="editmodalid" class="btn btn-warning editmodalclass"<span class="fas fa-edit"> Edit</span></a></td> <td><a href="javascript:void(0)" data-id=' + getDetails.id + ' id="deletemodalid" class="btn btn-danger deletemodalclass"<span class="fas fa-edit"> Delete</span></a></td></tr>';

        });

        res.json({ status: true, data: tableData });

    }

    else {

        res.json({ status: false });

    }

});



router.getfileuploadDriver = ('/getfileuploadDriver/', async (req, res, next) => {

    let id = req.query.id;

    let fileType = req.query.fileType

    // let fileType = 'cvor'

    let tableData = '';

    let getDtls = await FileuploadDB.findAll({ where: { driverId: id, fileType: fileType }, raw: true });

    //Sort array by date

    getDtls.sort(function (a, b) {

        return new Date(a.fromDate) - new Date(b.fromDate)

    })

    if (getDtls !== undefined && getDtls.length > 0) {

        await getDtls.forEach(function (getDetails, i) {

            let attachmentpath = "uploads/attachment/fileupload/" + getDetails.fileName;

            tableData += '<tr><td>' + '<a download class="btn btn-primary" target="_blank" id="attachment_file_link" href="' + attachmentpath + '">Download <span class="glyphicon glyphicon-edit"></span><i style="font-size: 15px;" class="fas fa-download"></i></a>' + '</td><td>' + '<a class="btn btn-warning" target="_blank" id="attachment_file_link" href="' + attachmentpath + '">View <span class="glyphicon glyphicon-edit"></span><i style="font-size: 15px;" class="fas fa-search"></i></a>' + '</td><td>' + getDetails.fileType + '</td><td>' + getDetails.updated_on + '</td>' + '</td></tr>';

        });

        res.json({ status: true, data: tableData });

    }

    else {

        res.json({ status: false });

    }

});





router.deletefileupload = ('/deletefileupload/', async (req, res) => {

    // console.log(req);

    let id = req.body.id;

    let deleteFileupload = await FileuploadDB.destroy({ where: { id: id } });

    if (deleteFileupload) {

        res.json({ status: true, message: 'File Deleted successfully' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});











//Questions

router.drivermanual  = ('/drivermanual/', async (req, res) => {

    if (req.session.name != "" && req.session.name != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        // let getDtls = await Driverdetails.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getcmpdtls = await Company.findOne({ where: { id: getdriver.company_id }, raw: true });

        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: req.session.driver_id }, raw: true });





            res.render('drivermanual', {

                title: 'Driver Manual',

                driverID: getdriver.id,

                CompanyName: getcmpdtls.name,

                driverName: getdriver.driver_name,

                company_id: getdriver.company_id,

            });

    }

});



router.questions = ('/questions/', async (req, res) => {

    if (req.session.name != "" && req.session.name != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        // let getDtls = await Driverdetails.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getcmpdtls = await Company.findOne({ where: { id: getdriver.company_id }, raw: true });

        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: req.session.driver_id }, raw: true });



        let getDrivinghistorySignature = getDrivinghistory ? getDrivinghistory.signature : ''



            res.render('questions', {

                title: 'INTERVIEW QUESTIONS',

                driverID: getdriver.id,

                CompanyName: getcmpdtls.name,

                driverName: getdriver.driver_name,

                driver_license: getdriver.driver_license,

                company_id: getdriver.company_id,

                getDrivinghistorySignature: getDrivinghistorySignature

            });

    }

});



router.editquestions = ('/editquestions/', async (req, res) => {

    // console.log(req.query);

    let id = req.query.id;

    let getDtls = await Questiongroupone.findOne({ where: { driverId: id }, raw: true });

    // console.log(getDtls);

    if (getDtls) {

        res.json({ status: true, data: getDtls });

    }

    else {

        res.json({ status: false });

    }

});



router.updateQuestions = ('/updateQuestions/', async (req, res) => {

    let date = new Date();

    var updated_on =

        ("00" + (date.getMonth() + 1)).slice(-2) + "-" +

        ("00" + date.getDate()).slice(-2) + "-" +

        date.getFullYear() + " " +

        ("00" + date.getHours()).slice(-2) + ":" +

        ("00" + date.getMinutes()).slice(-2) + ":" +

        ("00" + date.getSeconds()).slice(-2);

    Object.assign(req.body, {

        updated_on: updated_on // add json element

    });

    const fData = JSON.parse(JSON.stringify(req.body))

    // console.log(fData);

    if (req.body.actionData == 'Update') {



        delete req.body['actionData'];

        const fData = JSON.parse(JSON.stringify(req.body))

        let UpdateDriverDtls = await Questiongroupone.update(fData, {

            where: {

                driverId: req.body.driverId

            }

        });

        if (UpdateDriverDtls) {

            res.json({ status: true, message: 'Your Answers are Recorded' });

        } else {

            res.json({ status: false, message: 'Something went wrong' });

        }

    } else if (req.body.actionData == 'Create') {



        const fData = JSON.parse(JSON.stringify(req.body))

        let create_DriverDtls = await Questiongroupone.create(fData);

        if (create_DriverDtls) {

            res.json({ status: true, message: 'Questions Created' });

        } else {

            res.json({ status: false, message: 'Something went wrong' });

        }

    }

});



 





router.companyQuestions = async (req, res) => {

    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });

    res.render('companyQuestions', {

        title: 'Manage Interview Questions',

        getCompanydata: getCompanydata,

        company_id: req.session.userId

    });

};

router.companyGetQuestions = async (req, res) => {

    console.log('get companyGetQuestions');

    let cmpid = req.query.cmpid;

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

            key.driverId = key.driverId,

                key.firstName = key.firstName,

                Object.assign(key, {

                    action: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='editmodalid' class='btn  btn-warning editmodalclass1'><span class='fas fa-edit'> Edit</span></a>&nbsp;" +

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

























































router.company_get_Questions= async (req, res) => {

    console.log('get updateDriverDetailsForm');

    let cmpid = req.query.cmpid;

    let col = req.query.columns[[0]].column || 'd.id';

    let direction = req.query.columns[[0]].dir || 'DESC';

    let columns = ['d.id', 'd.driver_name','driverId','questiongroupone.approveStatus'];

    let searchKey = '';

    let where = [];
    let where1 = [];

    // Search Conditions

    if (req.query.search.value) {

        if (req.query.search.value != "") {

            where1.push({

                [Op.or]: [

                    { 'driver_name': { [Op.like]: `%` + req.query.search.value + `%` } }

                ]

            });

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

        //where: { company_id: cmpid },
        where:where,

        include: [{

            model: db.driver,

            as: "d",

            required: false,
            where:where1,

            raw: true

        }

        ]

    }

    await Questiongroupone.paginate(options).then(function (dt) {

        let data = dt.docs.map(formData);

        // function formData(key) {

        function formData(key, index) {

            index = parseInt(index) + 1 + parseInt(req.query.start)

            Object.assign(key, {

                slno: index

            });

            // console.log('-------------');

            // console.log(key);

            let ClassName 

            let ButtonName

            if(key.approveStatus == 0){

                ClassName = 'btn btn-danger'

                ButtonName = "Waiting for Admin Approval" 

            }else{

                ClassName = 'btn btn-success'

                ButtonName = "Approved" 

            }

            key.driverId = key.driverId,

                key.driver_name = key.driver_name,

                

                Object.assign(key, {

                    approve: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='' class='"+ ClassName +"' ><span> "+ButtonName+"</span></a>&nbsp;"

                });

                Object.assign(key, {

                    action: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='editmodalid' class='btn  btn-warning editmodalclass1'><span class='fas fa-edit'> Edit</span></a>&nbsp;" +

                        "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='viewmodalid' class='btn  btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a> " +

                        "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='deletedriverDtls' class='btn  btn-danger deletemodalclass'><span class='fas fa-trash'> Delete</span></a>"

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

 



router.companyeditQuestions = ('/companyeditQuestions/', async (req, res) => {

    // console.log(req.query);

    let id = req.query.id;

    let getdriver = await Driver.findOne({ where: { id: id }, raw: true });

    let getDtls = await Questiongroupone.findOne({ where: { driverId: id }, raw: true }); 

    let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: id }, raw: true });

    // console.log(getDtls);

    if (getDtls) {

        res.json({ status: true, data: getDtls,driverData:getdriver,getDrivinghistory:getDrivinghistory });

    }

    else {

        res.json({ status: false });

    }

});









router.companyupdateQuestions = ('/companyupdateQuestions/', async (req, res) => {



    const fData = JSON.parse(JSON.stringify(req.body))

    if (req.body.actionData == 'Update') {

        delete req.body['actionData'];

        Object.assign(req.body, {

            approveStatus: 1 // add json element

        });

        const fData = JSON.parse(JSON.stringify(req.body))

        let UpdateDriverDtls = await Questiongroupone.update(fData, {

            where: {

                driverId: req.body.driverId

            }

        });

        if (UpdateDriverDtls) {

            res.json({ status: true, message: 'Interview Questions Updated' });

        } else {

            res.json({ status: false, message: 'Something went wrong' });

        }

    } else if (req.body.actionData == 'Create') {

        

        const fData = JSON.parse(JSON.stringify(req.body))

        let create_DriverDtls = await Questiongroupone.create(fData);

        if (create_DriverDtls) {

            res.json({ status: true, message: 'Interview Questions Created' });

        } else {

            res.json({ status: false, message: 'Something went wrong' });

        }

    }

});







router.companyapproveQuestions = ('.companyapproveQuestions/', async (req, res, next) => {

        let id = req.body.id;

        let approve = await Questiongroupone.update({ approveStatus: 1 }, {

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

router.companydeleteQuestions = ('/companydeleteQuestions/', async (req, res) => {

    let id = req.body.id;

    let deleteDriverDtls = await Questiongroupone.destroy({

        where: { driverId: id }

    });

    if (deleteDriverDtls) {

        res.json({ status: true, message: 'Questions Deleted successfully' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});











//Question 2

router.companydeletedrivermanual = ('/companydeletedrivermanual/', async (req, res) => {

    let id = req.body.id;

    let deleteDriverDtls = await Questiongrouptwo.destroy({

        where: { driverId: id }

    });

    if (deleteDriverDtls) {

        res.json({ status: true, message: 'Driver Manual Deleted successfully' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});

router.companydrivermanual = async (req, res) => {

    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });

    res.render('companydrivermanual', {

        title: 'Manage Driver Manual',

        getCompanydata: getCompanydata,

        company_id: req.session.userId

    });

};



router.company_get_drivermanual= async (req, res) => {

    console.log('get updateDriverDetailsForm');

    let cmpid = req.query.cmpid;

    let col = req.query.columns[[0]].column || 'd.id';

    let direction = req.query.columns[[0]].dir || 'DESC';

    let columns = ['d.id', 'd.driver_name','driverId','questiongrouptwo.approveStatus','questiongrouptwo.result'];

    let searchKey = '';

    let where = [];
    let where1 = [];

    // Search Conditions

    if (req.query.search.value) {

        if (req.query.search.value != "") {

            where1.push({

                [Op.or]: [

                    { 'driver_name': { [Op.like]: `%` + req.query.search.value + `%` } }

                ]

            });

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

            required: false,
            where:where1,

            raw: true

        }

        ]

    }

    await Questiongrouptwo.paginate(options).then(function (dt) {

        let data = dt.docs.map(formData);

        // function formData(key) {

        function formData(key, index) {

            index = parseInt(index) + 1 +parseInt(req.query.start);

            Object.assign(key, {

                slno: index

            });

            // console.log('-------------');

             console.log(key);

            let ClassName 

            let ButtonName

            if(key.approveStatus == 0){

                ClassName = 'btn btn-danger'

                ButtonName = "Waiting for Admin Approval" 

            }else{

                ClassName = 'btn btn-success'

                ButtonName = "Approved" 

            }

            key.driverId = key.driverId,

                key.driver_name = key.driver_name,

                

                Object.assign(key, {

                    approve: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='' class='"+ ClassName +"' ><span> "+ButtonName+"</span></a>&nbsp;"

                });

                wrong = (32-parseInt(key.result))

                if(key.approveStatus == 0){

                    Object.assign(key, {

                        result: "No Result"

                    });

                    

                }

                else{

                    Object.assign(key, {

                        result: "Result: "+" Right: "+key.result+" Wrong: "+ wrong

                    });

                }

                Object.assign(key, {

                    action: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='editmodalid' class='btn  btn-warning editmodalclass1'><span class='fas fa-edit'> Edit</span></a>&nbsp;" +

                        "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='viewmodalid' class='btn  btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a> " +

                        "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='deletedriverDtls' class='btn  btn-danger deletemodalclass'><span class='fas fa-trash'> Delete</span></a>"

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

router.editdrivermanual = ('/editdrivermanual/', async (req, res) => {

    // console.log(req.query);

    let id = req.query.id;

    let getdriver = await Driver.findOne({ where: { id: id }, raw: true });

    let getDtls = await Questiongrouptwo.findOne({ where: { driverId: id }, raw: true }); 

    let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: id }, raw: true });

    // console.log(getDtls);

    if (getDtls) {

        res.json({ status: true, data: getDtls,driverData:getdriver,getDrivinghistory:getDrivinghistory });

    }

    else {

        res.json({ status: false });

    }

});

router.updatedrivermanual = ('/updatedrivermanual/', async (req, res) => {

    const fData = JSON.parse(JSON.stringify(req.body))

    if (req.body.actionData == 'Update') {

        delete req.body['actionData'];

        Object.assign(req.body, {

            approveStatus: 1 // add json element

        });

        const fData = JSON.parse(JSON.stringify(req.body));

        //console.log(JSON.stringify(fData.rightorwrong))

        console.log(fData);

        let result = 0;

        fData.rightorwrong.forEach(element => {

           result = parseInt(element) + parseInt(result);

        });

        fData.result = result;

        fData.rightorwrong = JSON.stringify(fData.rightorwrong);

        let UpdateDriverDtls = await Questiongrouptwo.update(fData, {

            where: {

                driverId: req.body.driverId

            }

        });

        if (UpdateDriverDtls) {

            res.json({ status: true, message: 'Driver Manual Updated' });

        } else {

            res.json({ status: false, message: 'Something went wrong' });

        }

    } else if (req.body.actionData == 'Create') {

        

        const fData = JSON.parse(JSON.stringify(req.body));

         if(!fData.rightorwrong){

            let myArray = [];

            for(let i=0;i<32;i++){

                myArray[i] = '0';

            }

            fData.rightorwrong = myArray;

            fData.rightorwrong = JSON.stringify(fData.rightorwrong);

        } 

        let create_DriverDtls = await Questiongrouptwo.create(fData);

        if (create_DriverDtls) {

            res.json({ status: true, message: 'Driver Manual Created' });

        } else {

            res.json({ status: false, message: 'Something went wrong' });

        }

    }

});





























//Canada HOS code

router.canadahosmanual  = ('/canadahosmanual/', async (req, res) => {

    if (req.session.name != "" && req.session.name != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        // let getDtls = await Driverdetails.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getcmpdtls = await Company.findOne({ where: { id: getdriver.company_id }, raw: true });

        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: req.session.driver_id }, raw: true });





            res.render('canadahosmanual', {

                title: 'HOS Questionnaire for Canada SOUTH Regulations',

                driverID: getdriver.id,

                CompanyName: getcmpdtls.name,

                driverName: getdriver.driver_name,

                company_id: getdriver.company_id,

            });

    }

});

router.companycanadahosmanual = async (req, res) => {

    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });

    res.render('companycanadahosmanual', {

        title: 'HOS Questionnaire for Canada SOUTH Regulations',

        getCompanydata: getCompanydata,

        company_id: req.session.userId

    });

};

router.companyapprovecanadahos = ('.companyapprovecanadahos/', async (req, res, next) => {

	let id = req.body.id;

	let approve = await Canadahos.update({ approveStatus: 1 }, {

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

router.company_get_canadahosmanual= async (req, res) => {

    console.log('get updateDriverDetailsForm');

    let cmpid = req.query.cmpid;

    let col = req.query.columns[[0]].column || 'd.id';

    let direction = req.query.columns[[0]].dir || 'DESC';

    let columns = ['d.id', 'd.driver_name','driverId','canadahos.approveStatus','canadahos.result'];

    let searchKey = '';

    let where = [];
    let where1 = [];

    // Search Conditions

    if (req.query.search.value) {

        if (req.query.search.value != "") {

            where1.push({

                [Op.or]: [

                    { 'driver_name': { [Op.like]: `%` + req.query.search.value + `%` } }

                ]

            });

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

        //where: { company_id: cmpid },
        where:where,

        include: [{

            model: db.driver,

            as: "d",

            required: false,
            where:where1,

            raw: true

        }

        ]

    }

    await Canadahos.paginate(options).then(function (dt) {

        let data = dt.docs.map(formData);

        // function formData(key) {

        function formData(key, index) {

            index = parseInt(index) + 1 + parseInt(req.query.start)

            Object.assign(key, {

                slno: index

            });

            // console.log('-------------');

             console.log(key);

            let ClassName 

            let ButtonName

            if(key.approveStatus == 0){

                ClassName = 'btn btn-danger'

                ButtonName = "Waiting for Admin Approval" 

            }else{

                ClassName = 'btn btn-success'

                ButtonName = "Approved" 

            }

            key.driverId = key.driverId,

                key.driver_name = key.driver_name,

                

                Object.assign(key, {

                    approve: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='' class='"+ ClassName +"' ><span> "+ButtonName+"</span></a>&nbsp;"

                });

                wrong = (15-parseInt(key.result));

				percentage = (parseFloat(key.result)/15)*100;

                if(key.approveStatus == 0){

                    Object.assign(key, {

                        result: "No Result"

                    });

                    

                }

                else{

                    Object.assign(key, {

                        result: "Result: "+percentage.toFixed(2)+'%'+"-"+key.result+" out of 15 "

                    });

                }

                Object.assign(key, {

                    action: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='viewmodalid' class='btn  btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a> " +

                        "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='deletedriverDtls' class='btn  btn-danger deletemodalclass'><span class='fas fa-trash'> Delete</span></a>"

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

router.editcanadahosmanual = ('/editcanadahosmanual/', async (req, res) => {

    // console.log(req.query);

    let id = req.query.id;

    let getdriver = await Driver.findOne({ where: { id: id }, raw: true });

    let getDtls = await Canadahos.findOne({ where: { driverId: id }, raw: true }); 

    let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: id }, raw: true });

    // console.log(getDtls);

    if (getDtls) {

        res.json({ status: true, data: getDtls,driverData:getdriver,getDrivinghistory:getDrivinghistory });

    }

    else {

        res.json({ status: false });

    }

	return true;

});

router.updatecanadahosmanual = ('/updatecanadahosmanual/', async (req, res) => {

    const fData = JSON.parse(JSON.stringify(req.body))

    Object.assign(req.body, {

        approveStatus: 1 // add json element

    });

    if (req.body.actionData == 'Update') {

        delete req.body['actionData'];

        

        const fData = JSON.parse(JSON.stringify(req.body));

        //console.log(JSON.stringify(fData.rightorwrong))

        console.log(fData);

        let myArray = [];

		let result	= 0;

		for(let i=0;i<15;i++){

			myArray[i] = '0';

		}

		if(fData.question1 == 'takes a 8-hour break'){

			myArray[0] = '1';

			result++;

		}

		if(fData.question2 == 'False'){

			myArray[1] = '1';

			result++;

		}

		if(fData.question3 == 'only when on duty'){

			myArray[2] = '1';

			result++;

		}

		if(fData.question4 == '10'){

			myArray[3] = '1';

			result++;

		}

		if(fData.question5 == 'Driving and on duty other than driving'){

			myArray[4] = '1';

			result++;

		}

		if(fData.question6 == 'Maximum drive time in a day'){

			myArray[5] = '1';

			result++;

		}

		if(fData.question7 == 'All of the above'){

			myArray[6] = '1';

			result++;

		}

		if(fData.question8 == 'Last change of duty status'){

			myArray[7] = '1';

			result++;

		}

		if(fData.question9 == 'False'){

			myArray[8] = '1';

			result++;

		}

		if(fData.question10 == 'True'){

			myArray[9] = '1';

			result++;

		}

		if(fData.question11 == '72'){

			myArray[10] = '1';

			result++;

		}

		if(fData.question12 == 'True'){

			myArray[11] = '1';

			result++;

		}

		if(fData.question13 == 'Both b& c'){

			myArray[12] = '1';

			result++;

		}

		if(fData.question14 == 'False'){

			myArray[13] = '1';

			result++;

		}

		if(fData.question15 == 'False'){

			myArray[14] = '1';

			result++;

		}

		 fData.rightorwrong = myArray;

        /* fData.rightorwrong.forEach(element => {

           result = parseInt(element) + parseInt(result);

        }); */

        fData.result = result;

        fData.rightorwrong = JSON.stringify(fData.rightorwrong);

        let UpdateDriverDtls = await Canadahos.update(fData, {

            where: {

                driverId: req.body.driverId

            }

        });

        if (UpdateDriverDtls) {

            res.json({ status: true, message: 'HOS Questionnaire for Canada SOUTH Regulations Updated' });

        } else {

            res.json({ status: false, message: 'Something went wrong' });

        }

    } else if (req.body.actionData == 'Create') {

        

        const fData = JSON.parse(JSON.stringify(req.body));

         if(!fData.rightorwrong){

            let myArray = [];

			let result	= 0;

			for(let i=0;i<15;i++){

                myArray[i] = '0';

            }

			if(fData.question1 == 'takes a 8-hour break'){

				myArray[0] = '1';

				result++;

			}

			if(fData.question2 == 'False'){

				myArray[1] = '1';

				result++;

			}

			if(fData.question3 == 'only when on duty'){

				myArray[2] = '1';

				result++;

			}

			if(fData.question4 == '10'){

				myArray[3] = '1';

				result++;

			}

			if(fData.question5 == 'Driving and on duty other than driving'){

				myArray[4] = '1';

				result++;

			}

			if(fData.question6 == 'Maximum drive time in a day'){

				myArray[5] = '1';

				result++;

			}

			if(fData.question7 == 'All of the above'){

				myArray[6] = '1';

				result++;

			}

			if(fData.question8 == 'Last change of duty status'){

				myArray[7] = '1';

				result++;

			}

			if(fData.question9 == 'False'){

				myArray[8] = '1';

				result++;

			}

			if(fData.question10 == 'True'){

				myArray[9] = '1';

				result++;

			}

			if(fData.question11 == '72'){

				myArray[10] = '1';

				result++;

			}

			if(fData.question12 == 'True'){

				myArray[11] = '1';

				result++;

			}

			if(fData.question13 == 'Both b& c'){

				myArray[12] = '1';

				result++;

			}

			if(fData.question14 == 'False'){

				myArray[13] = '1';

				result++;

			}

			if(fData.question15 == 'False'){

				myArray[14] = '1';

				result++;

			}

            fData.result = result;

            fData.rightorwrong = myArray;

            fData.rightorwrong = JSON.stringify(fData.rightorwrong);

        } 

        let create_DriverDtls = await Canadahos.create(fData);

        if (create_DriverDtls) {

            res.json({ status: true, message: 'HOS Questionnaire for Canada SOUTH Regulations Created' });

        } else {

            res.json({ status: false, message: 'Something went wrong' });

        }

    }

});























router.gtest = async (req, res) => {

    console.log('gtest start');

    let to = 'compliancementorzportal@gmail.com'

    let cc = ''

    let subject = 'Welcome to new portal'

    let message = 'test mail';

    // let message = '<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width,initial-scale=1"> <meta name="x-apple-disable-message-reformatting"> <title></title> <style>table, td, div, h1, p{font-family: Arial, sans-serif;}@media screen and (max-width: 530px){.unsub{display: block; padding: 8px; margin-top: 14px; border-radius: 6px; background-color: #555555; text-decoration: none !important; font-weight: bold;}.col-lge{max-width: 100% !important;}}@media screen and (min-width: 531px){.col-sml{max-width: 27% !important;}.col-lge{max-width: 73% !important;}}</style></head><body style="margin:0;padding:0;word-spacing:normal;background-color:#939297;"> <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297;"> <table role="presentation" style="width:100%;border:none;border-spacing:0;"> <tr> <td align="center" style="padding:0;"> <table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;"> <tr> <td style="padding:40px 30px 30px 30px;text-align:center;font-size:24px;font-weight:bold;"> <a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="165" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> </td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Hi</p> <br><p style="margin:0;">Welcome to new portal Click here to Login new portal Your  </td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Thank you,</p><p style="margin:0;">Safety Department  </p><br><a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="90" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> <p style="margin:0;">Tel: 905-486-1666</p><p style="margin:0;">Web: www.compliancementorz.com</p></td></tr><tr> <td style="padding:30px;text-align:center;font-size:12px;background-color:#404040;color:#cccccc;"> <p style="margin:0;font-size:14px;line-height:20px;">&reg; compliancementorz 2022</p></td></tr></table> </td></tr></table> </div></body></html>';

    let newDriverEmail = await sendMail(to, cc, subject, message, req, res)

    console.log('sendmail complete');

    // console.log(newDriverEmail);

    if (newDriverEmail) {

        return res.send({ "status": newDriverEmail });

    } else {

        return res.send({ "status1": newDriverEmail });

    }

};

router.checkEmail = async (req, res) => {

    console.log('checkEmail start');

    let to = 'compliancementorzportal@gmail.com'

    let cc = ''

    let subject = 'Welcome to new portal'

    let message = 'test mail';

    // let message = '<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width,initial-scale=1"> <meta name="x-apple-disable-message-reformatting"> <title></title> <style>table, td, div, h1, p{font-family: Arial, sans-serif;}@media screen and (max-width: 530px){.unsub{display: block; padding: 8px; margin-top: 14px; border-radius: 6px; background-color: #555555; text-decoration: none !important; font-weight: bold;}.col-lge{max-width: 100% !important;}}@media screen and (min-width: 531px){.col-sml{max-width: 27% !important;}.col-lge{max-width: 73% !important;}}</style></head><body style="margin:0;padding:0;word-spacing:normal;background-color:#939297;"> <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297;"> <table role="presentation" style="width:100%;border:none;border-spacing:0;"> <tr> <td align="center" style="padding:0;"> <table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;"> <tr> <td style="padding:40px 30px 30px 30px;text-align:center;font-size:24px;font-weight:bold;"> <a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="165" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> </td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Hi</p> <br><p style="margin:0;">Welcome to new portal Click here to Login new portal Your  </td></tr><tr> <td style="padding:30px;background-color:#ffffff;"> <p style="margin:0;">Thank you,</p><p style="margin:0;">Safety Department  </p><br><a href="https://compliancementorz.com" style="text-decoration:none;"><img src="https://compliancementorz.com/img/logo.png" width="90" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> <p style="margin:0;">Tel: 905-486-1666</p><p style="margin:0;">Web: www.compliancementorz.com</p></td></tr><tr> <td style="padding:30px;text-align:center;font-size:12px;background-color:#404040;color:#cccccc;"> <p style="margin:0;font-size:14px;line-height:20px;">&reg; compliancementorz 2022</p></td></tr></table> </td></tr></table> </div></body></html>';

    let newDriverEmail = await sendMailTest(to, cc, subject, message, req, res)

    console.log('sendmail complete');

    // console.log(newDriverEmail);

    if (newDriverEmail) {

        return res.send({ "status": newDriverEmail });

    } else {

        return res.send({ "status1": newDriverEmail });

    }

};

router.getcompanychecklists = ('/getcompanychecklists/', async (req, res) => {

    // console.log(req.query);

    if (req.session.userId != "" && req.session.userId != "undefined") {

        let company_id = req.session.userId;	

		let getchecklist = await Companychecklist.findOne({ where: { company_id: company_id }, raw: true });

        if (getchecklist) {

			res.json({ status: true, data: getchecklist });

		} else {

			res.json({ status: false });

		}  



    }

});

router.getchecklists = ('/getchecklists/', async (req, res) => {

    if (req.session.name != "" && req.session.name != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        let company_id = getdriver.company_id;

		let getchecklist = await Companychecklist.findOne({ where: { company_id: company_id }, raw: true });
        if (getchecklist) {

			res.json({ status: true, data: getchecklist });

		} else {

			res.json({ status: false });

		}  



    }

});
router.getcompanyquiz = ('/getcompanyquiz/', async (req, res) => {

    if (req.session.userId != "" && req.session.userId != "undefined") {

        let company_id = req.session.userId;	

        let getquiz = await Companyquiz.findOne({ where: { company_id: company_id }, raw: true });

        if (getquiz) {

			res.json({ status: true, data:getquiz });

		} else {

			res.json({ status: false });

		}  



    }

});

router.getquiz = ('/getquiz/', async (req, res) => {

    if (req.session.name != "" && req.session.name != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        let company_id = getdriver.company_id;

        let getquiz = await Companyquiz.findOne({ where: { company_id: company_id }, raw: true });
        if (getquiz) {

			res.json({ status: true, data: getquiz });

		} else {

			res.json({ status: false });

		}  



    }

});

router.orientation_Checklists = ('/orientation_Checklists/', async (req, res) => {

     if (req.session.name != "" && req.session.name != "undefined") {

       

		let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        let getDriverdetails = await Driverdetails.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: req.session.driver_id }, raw: true });

		if (typeof getDrivinghistory !== null) {

			res.render('orientation_Checklists', {

				title: 'Dry Van Checklists',

				company_id: getdriver ? getdriver.company_id : '',

				driverId: getdriver ? getdriver.id : '',

				driverName: getdriver ? getdriver.driver_name : '',

				companyProvince: getDriverdetails ? getDriverdetails.companyProvince : '',

				getDrivinghistorySignature: getDrivinghistory ? getDrivinghistory.signature : '',

				getupdatedDate: getDrivinghistory ? getDrivinghistory.updatedDate : '',

				eventsCalTimezone: getDriverdetails ? getDriverdetails.eventsCalTimezone : ''

			});

		}

    }

});

router.dry_van_Checklists = ('/dry_van_Checklists/', async (req, res) => {

     if (req.session.name != "" && req.session.name != "undefined") {

       

		let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        let getDriverdetails = await Driverdetails.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: req.session.driver_id }, raw: true });

		if (typeof getDrivinghistory !== null) {

			res.render('dry_van_Checklists', {

				title: 'Dump Truck Checklists',

				company_id: getdriver ? getdriver.company_id : '',

				driverId: getdriver ? getdriver.id : '',

				driverName: getdriver ? getdriver.driver_name : '',

				companyProvince: getDriverdetails ? getDriverdetails.companyProvince : '',

				getDrivinghistorySignature: getDrivinghistory ? getDrivinghistory.signature : '',

				getupdatedDate: getDrivinghistory ? getDrivinghistory.updatedDate : '',

				eventsCalTimezone: getDriverdetails ? getDriverdetails.eventsCalTimezone : ''

			});

		}

    }

});

router.flatbed_Checklists = ('/flatbed_Checklists/', async (req, res) => {

     if (req.session.name != "" && req.session.name != "undefined") {

       

		let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        let getDriverdetails = await Driverdetails.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let CertificateauthDtls = await Certificateauth.findOne({ where: { driverId: req.session.driver_id }, raw: true });

		let company_name = '';

		if(getdriver.company_id!=''){

			let cur_company  = await Company.findOne({ where: { id: getdriver.company_id}, raw: true });

			company_name = cur_company.name;

		}

		if (typeof getDrivinghistory !== null) {

			res.render('flatbed_Checklists', {

				title: 'Flatbed Checklists',

				company_name:company_name,

				company_id: getdriver ? getdriver.company_id : '',

				driverId: getdriver ? getdriver.id : '',

				driverName: getdriver ? getdriver.driver_name : '',

				driverlicense: getdriver ? getdriver.driver_license : '',

				companyProvince: getDriverdetails ? getDriverdetails.companyProvince : '',

				getDrivinghistorySignature: getDrivinghistory ? getDrivinghistory.signature : '',

				getupdatedDate: getDrivinghistory ? getDrivinghistory.updatedDate : '',

				eventsCalTimezone: getDriverdetails ? getDriverdetails.eventsCalTimezone : ''

			});

		}

    }

});

router.create_flatbed_checklists = ('/create_flatbed_checklists/', async (req, res) => {

	const fData = JSON.parse(JSON.stringify(req.body));

	if(fData.start_date!=''){

		var d1 = new Date(fData.start_date);

		var strDate = d1.getFullYear() + "/" + (d1.getMonth() + 1) + "/" + d1.getDate();

		fData.start_date = strDate;

	}

	if(fData.end_date!=''){

		var d2 = new Date(fData.end_date);

		var end_date = d2.getFullYear() + "/" + (d2.getMonth() + 1) + "/" + d2.getDate();

		fData.end_date	 = end_date;

	}

	let create_DriverDtls = await Flabted_checklist.create(fData);

	if (create_DriverDtls) {

		res.json({ status: true, message: 'Flatbed Services ' });

	} else {

		res.json({ status: false, message: 'Something went wrong' });

	}

});

router.updatecompanyflatedchecklist = ('/updatecompanyflatedchecklist/', async (req, res) => {

	const fData = JSON.parse(JSON.stringify(req.body));

    

	if(fData.start_date!=''){

		var d1 = new Date(fData.start_date);

		var strDate = d1.getFullYear() + "/" + (d1.getMonth() + 1) + "/" + d1.getDate();

		fData.start_date = strDate;

	}

	if(fData.end_date!=''){

		var d2 = new Date(fData.end_date);

		var end_date = d2.getFullYear() + "/" + (d2.getMonth() + 1) + "/" + d2.getDate();

		fData.end_date	 = end_date;

	}

    let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: req.body.driverId }, raw: true });

    if (req.body.signature_image1 != "") {

        let signaturepath =

            'public/uploads/attachment/checklist/';

       /* let drivinghistoryaddressSignatureData = await

            fileUpload('checklist', signaturepath,

                req.body.signature_image1, req, res)

        Object.assign(req.body, {

            adminSignature: drivinghistoryaddressSignatureData // add json element

        });*/

        approveDtls = await Certificateauth.update({ adminSignature: req.body.adminSignature }, {

            where: {

                certificateID: 8,

                driverId: req.body.driverId

            }

        });

    }

    if (req.body.signature_image) {

        let signaturepath1 =

            'public/uploads/attachment/checklist/';

        let drivinghistoryaddressSignatureData = await

            fileUpload('checklist', signaturepath1,

                req.body.signature_image, req, res)

        Object.assign(req.body, {

            signature: drivinghistoryaddressSignatureData // add json element

        });

        console.log(req.body);

        approveDtls = await Certificateauth.update({ signature: req.body.signature }, {

            where: {

                certificateID: 8,

                driverId: req.body.driverId

            }

        });

    }

    update_DriverDtls = await Flabted_checklist.update({ company_id: fData.company_id,driverId: fData.driverId,online1: fData.online1,online2: fData.online2,online3: fData.online3,online4: fData.online4,online5: fData.online5,practical1: fData.practical1,practical2: fData.practical2,practical3: fData.practical3,practical4: fData.practical4,practical5: fData.practical5,practical6: fData.practical6,practical7: fData.practical7,practical8: fData.practical8,practical9: fData.practical9,practical10: fData.practical10,practical11: fData.practical11,practical12: fData.practical12,start_date: fData.start_date,end_date: fData.end_date }, {

        where: {

            driverId: req.body.driverId

        }

    });

    console.log(';sf:'+update_DriverDtls);

	if (update_DriverDtls) {

		res.json({ status: true, message: 'Updated Successfully ' });

	} else {

		res.json({ status: false, message: 'Something went wrong' });

	}

});

router.get_flatbed_checklist = ('/get_flatbed_checklist/', async (req, res) => {

	let driverId = req.query.driverId;

	let company_id = req.query.company_id;

    // console.log(req.query);

	let getchecklist = await Flabted_checklist.findOne({ where: { driverId:driverId,company_id: company_id }, raw: true });

	let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: driverId }, raw: true });

	let getDtls = await Certificateauth.findOne({ where: { driverId: driverId,certificateID:8 }, raw: true }); 

	if (getchecklist) {

		res.json({ status: true, data: getchecklist ,drivinghistory:getDrivinghistory,getDtls:getDtls});

	} else {

		res.json({ status: false });

	}  



});

router.getquiz = ('/getquiz/', async (req, res) => {

    if (req.session.name != "" && req.session.name != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        let company_id = getdriver.company_id;

		let getquiz = await Companyquiz.findOne({ where: { company_id: company_id }, raw: true });
        if (getquiz) {

			res.json({ status: true, data: getquiz });

		} else {

			res.json({ status: false });

		}  



    }

});

//us question code

router.usquestionmanual  = ('/usquestionmanual/', async (req, res) => {

    if (req.session.name != "" && req.session.name != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        // let getDtls = await Driverdetails.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getcmpdtls = await Company.findOne({ where: { id: getdriver.company_id }, raw: true });

        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: req.session.driver_id }, raw: true });

		res.render('usquestion', {

			title: 'Hours of Service Questionnaire: US rule set',

			driverID: getdriver.id,

			CompanyName: getcmpdtls.name,

			driverName: getdriver.driver_name,

			company_id: getdriver.company_id,

		});

    }

});

router.companyusquestionmanual = async (req, res) => {

    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });

    res.render('companyusquestion', {

        title: 'Hours of Service Questionnaire: US rule set',

        getCompanydata: getCompanydata,

        company_id: req.session.userId

    });

};

router.companyapproveusquestion = ('.companyapproveusquestion/', async (req, res, next) => {

	let id = req.body.id;

	let approve = await Usquestion.update({ approveStatus: 1 }, {

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

router.company_get_usquestionmanual= async (req, res) => {

    console.log('get updateDriverDetailsForm');

    let cmpid = req.query.cmpid;

    let col = req.query.columns[[0]].column || 'd.id';

    let direction = req.query.columns[[0]].dir || 'DESC';

    let columns = ['d.id', 'd.driver_name','driverId','usquestion.approveStatus','usquestion.result'];

    let searchKey = '';

    let where = [];
    let where1 = [];

    // Search Conditions

    if (req.query.search.value) {

        if (req.query.search.value != "") {

            where1.push({

                [Op.or]: [

                    { 'driver_name': { [Op.like]: `%` + req.query.search.value + `%` } }

                ]

            });

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

            required: false,
            where:where1,

            raw: true

        }

        ]

    }

    await Usquestion.paginate(options).then(function (dt) {

        let data = dt.docs.map(formData);

        // function formData(key) {

        function formData(key, index) {

            index = parseInt(index) + 1 +parseInt(req.query.start)

            Object.assign(key, {

                slno: index

            });

            // console.log('-------------');

             console.log(key);

            let ClassName 

            let ButtonName

            if(key.approveStatus == 0){

                ClassName = 'btn btn-danger'

                ButtonName = "Waiting for Admin Approval" 

            }else{

                ClassName = 'btn btn-success'

                ButtonName = "Approved" 

            }

            key.driverId = key.driverId,

                key.driver_name = key.driver_name,

                

                Object.assign(key, {

                    approve: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='' class='"+ ClassName +"' ><span> "+ButtonName+"</span></a>&nbsp;"

                });

                wrong = (15-parseInt(key.result));

				percentage = (parseFloat(key.result)/15)*100;

                if(key.approveStatus == 0){

                    Object.assign(key, {

                        result: "No Result"

                    });

                    

                }

                else{

                    Object.assign(key, {

                        result: "Result: "+percentage.toFixed(2)+'%'+"-"+key.result+" out of 15 "

                    });

                }

                Object.assign(key, {

                    action: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='viewmodalid' class='btn  btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a> " +

                        "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='deletedriverDtls' class='btn  btn-danger deletemodalclass'><span class='fas fa-trash'> Delete</span></a>"

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

router.editusquestionmanual = ('/editusquestionmanual/', async (req, res) => {

    // console.log(req.query);

    let id = req.query.id;

    let getdriver = await Driver.findOne({ where: { id: id }, raw: true });

    let getDtls = await Usquestion.findOne({ where: { driverId: id }, raw: true }); 

    let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: id }, raw: true });

    // console.log(getDtls);

    if (getDtls) {

        res.json({ status: true, data: getDtls,driverData:getdriver,getDrivinghistory:getDrivinghistory });

    }

    else {

        res.json({ status: false });

    }

	return true;

});

router.updateusquestionmanual = ('/updateusquestionmanual/', async (req, res) => {

    const fData = JSON.parse(JSON.stringify(req.body))

    Object.assign(req.body, {

        approveStatus: 1 // add json element

    });

    if (req.body.actionData == 'Update') {

        delete req.body['actionData'];

       

        const fData = JSON.parse(JSON.stringify(req.body));

        //console.log(JSON.stringify(fData.rightorwrong))

        console.log(fData);

        let myArray = [];

		let result	= 0;

		for(let i=0;i<15;i++){

			myArray[i] = '0';

		}

		if(fData.question1 == 'spending 1 hour unloading the trailer'){

			myArray[0] = '1';

			result++;

		}

		if(fData.question2 == 'off duty, Sleeper berth'){

			myArray[1] = '1';

			result++;

		}

		if(fData.question3 == 'False'){

			myArray[2] = '1';

			result++;

		}

		if(fData.question4 == 'False'){

			myArray[3] = '1';

			result++;

		}

		if(fData.question5 == 'True'){

			myArray[4] = '1';

			result++;

		}

		if(fData.question6 == 'He is already driving when the storm started'){

			myArray[5] = '1';

			result++;

		}

		if(fData.question7 == 'False'){

			myArray[6] = '1';

			result++;

		}

		if(fData.question8 == 'On duty'){

			myArray[7] = '1';

			result++;

		}

		if(fData.question9 == 'He has to take 10 hours off in Canada before crossing the border'){

			myArray[8] = '1';

			result++;

		}

		if(fData.question10 == 'True'){

			myArray[9] = '1';

			result++;

		}

		if(fData.question11 == 'Loading'){

			myArray[10] = '1';

			result++;

		}

		if(fData.question12 == '10'){

			myArray[11] = '1';

			result++;

		}

		if(fData.question13 == 'both a & c'){

			myArray[12] = '1';

			result++;

		}

		if(fData.question14 == 'Till he completes the trip'){

			myArray[13] = '1';

			result++;

		}

		if(fData.question15 == 'False'){

			myArray[14] = '1';

			result++;

		}

		 fData.rightorwrong = myArray;

        fData.result = result;

        fData.rightorwrong = JSON.stringify(fData.rightorwrong);

        let UpdateDriverDtls = await Usquestion.update(fData, {

            where: {

                driverId: req.body.driverId

            }

        });

        if (UpdateDriverDtls) {

            res.json({ status: true, message: 'Hours of Service Questionnaire: US rule set Updated' });

        } else {

            res.json({ status: false, message: 'Something went wrong' });

        }

    } else if (req.body.actionData == 'Create') {

        

        const fData = JSON.parse(JSON.stringify(req.body));

            let myArray = [];

			let result	= 0;

			for(let i=0;i<15;i++){

                myArray[i] = '0';

            }

			if(fData.question1 == 'spending 1 hour unloading the trailer'){

				myArray[0] = '1';

				result++;

			}

			if(fData.question2 == 'off duty, Sleeper berth'){

				myArray[1] = '1';

				result++;

			}

			if(fData.question3 == 'False'){

				myArray[2] = '1';

				result++;

			}

			if(fData.question4 == 'False'){

				myArray[3] = '1';

				result++;

			}

			if(fData.question5 == 'True'){

				myArray[4] = '1';

				result++;

			}

			if(fData.question6 == 'He is already driving when the storm started'){

				myArray[5] = '1';

				result++;

			}

			if(fData.question7 == 'False'){

				myArray[6] = '1';

				result++;

			}

			if(fData.question8 == 'On duty'){

				myArray[7] = '1';

				result++;

			}

			if(fData.question9 == 'He has to take 10 hours off in Canada before crossing the border'){

				myArray[8] = '1';

				result++;

			}

			if(fData.question10 == 'True'){

				myArray[9] = '1';

				result++;

			}

			if(fData.question11 == 'Loading'){

				myArray[10] = '1';

				result++;

			}

			if(fData.question12 == '10'){

				myArray[11] = '1';

				result++;

			}

			if(fData.question13 == 'both a & c'){

				myArray[12] = '1';

				result++;

			}

			if(fData.question14 == 'Till he completes the trip'){

				myArray[13] = '1';

				result++;

			}

			if(fData.question15 == 'False'){

				myArray[14] = '1';

				result++;

			}

			console.log(myArray);

		fData.result = result;

		fData.rightorwrong = myArray;

		fData.rightorwrong = JSON.stringify(fData.rightorwrong);

        let create_DriverDtls = await Usquestion.create(fData);

        if (create_DriverDtls) {

            res.json({ status: true, message: 'Hours of Service Questionnaire: US rule set Created' });

        } else {

            res.json({ status: false, message: 'Something went wrong' });

        }

    }

});

router.companydeleteusquestionmanual = ('/companydeleteusquestionmanual/', async (req, res) => {

    let id = req.body.id;

    let certificateID = req.query.certificateID;

    let Usquestion = await Usquestion.destroy({

        where: { id: id  }

    });

    if (deleteDriverDtls) {

        res.json({ status: true, message: 'Deleted successfully' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});




//Weight & Dimensions

router.weightDimensions  = ('/weightDimensions/', async (req, res) => {

    if (req.session.name != "" && req.session.name != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        // let getDtls = await Driverdetails.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getcmpdtls = await Company.findOne({ where: { id: getdriver.company_id }, raw: true });

        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: req.session.driver_id }, raw: true });

		res.render('weightDimensions', {

			title: 'Weight & Dimensions',

			driverID: getdriver.id,

			CompanyName: getcmpdtls.name,

			driverName: getdriver.driver_name,

			company_id: getdriver.company_id,

		});

    }

});
router.companydeleteweightdimensionsmanual = ('/companydeleteweightdimensionsmanual/', async (req, res) => {

    let id = req.body.id;

    console.log(id);
    let weightDimensions = weightDimensions.destroy({where: { driverId: id  }});

    if (weightDimensions) {

        res.json({ status: true, message: 'Deleted successfully' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});
router.companyweightDimensions = async (req, res) => {

    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });

    res.render('companyweightDimensions', {

        title: 'Weight & Dimensions',

        getCompanydata: getCompanydata,

        company_id: req.session.userId

    });

};
router.editweightdimensions = ('/editweightdimensions/', async (req, res) => {

    // console.log(req.query);

    let id = req.query.id;

    let getdriver = await Driver.findOne({ where: { id: id }, raw: true });

    let getDtls = await weightDimensions.findOne({ where: { driverId: id }, raw: true }); 

    let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: id }, raw: true });

    // console.log(getDtls);

    if (getDtls) {

        res.json({ status: true, data: getDtls,driverData:getdriver,getDrivinghistory:getDrivinghistory });

    }

    else {

        res.json({ status: false });

    }

	return true;

});
router.company_get_weightDimensions= async (req, res) => {

    console.log('get updateDriverDetailsForm');

    let cmpid = req.query.cmpid;

    let col = req.query.columns[[0]].column || 'd.id';

    let direction = req.query.columns[[0]].dir || 'DESC';

    let columns = ['d.id', 'd.driver_name','driverId','weightDimensions.approveStatus','weightDimensions.result'];

    let searchKey = '';

    let where = [];
    let where1 = [];

    // Search Conditions

    if (req.query.search.value) {

        if (req.query.search.value != "") {

            where1.push({

                [Op.or]: [

                    { 'driver_name': { [Op.like]: `%` + req.query.search.value + `%` } }

                ]

            });

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

            required: false,
            where:where1,

            raw: true

        }

        ]

    }

    await weightDimensions.paginate(options).then(function (dt) {

        let data = dt.docs.map(formData);

        // function formData(key) {

        function formData(key, index) {

            index = parseInt(index) + 1 + parseInt(req.query.start)

            Object.assign(key, {

                slno: index

            });

            // console.log('-------------');

             console.log(key);

            let ClassName 

            let ButtonName

            if(key.approveStatus == 0){

                ClassName = 'btn btn-danger'

                ButtonName = "Waiting for Admin Approval" 

            }else{

                ClassName = 'btn btn-success'

                ButtonName = "Approved" 

            }

            key.driverId = key.driverId,

                key.driver_name = key.driver_name,

                

                Object.assign(key, {

                    approve: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='' class='"+ ClassName +"' ><span> "+ButtonName+"</span></a>&nbsp;"

                });

                wrong = (20-parseInt(key.result));

				percentage = (parseFloat(key.result)/20)*100;

                if(key.approveStatus == 0){

                    Object.assign(key, {

                        result: "No Result"

                    });

                    

                }

                else{

                    Object.assign(key, {

                        result: "Result: "+percentage.toFixed(2)+'%'+"-"+key.result+" out of 20 "

                    });

                }

                Object.assign(key, {

                    action: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='viewmodalid' class='btn  btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a> " 

                   /* action: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='viewmodalid' class='btn  btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a> " +

                        "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='deletedriverDtls' class='btn  btn-danger deletemodalclass'><span class='fas fa-trash'> Delete</span></a>"*/

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
router.updateweightdimensions = ('/updateweightdimensions/', async (req, res) => {

    const fData = JSON.parse(JSON.stringify(req.body))

    Object.assign(req.body, {

        approveStatus: 1 // add json element

    });

    if (req.body.actionData == 'Update') {

        delete req.body['actionData'];

       

        const fData = JSON.parse(JSON.stringify(req.body));

        //console.log(JSON.stringify(fData.rightorwrong))

        console.log(fData);

        let myArray = [];

		let result	= 0;

		for(let i=0;i<20;i++){

			myArray[i] = '0';

		}

		if(fData.question1 == 'New vehicle categories may not be added'){

			myArray[0] = '1';

			result++;

		}

		if(fData.question2 == 'Tare Weight + Payload = GVWR'){

			myArray[1] = '1';

			result++;

		}

		if(fData.question3 == '16000 kgs'){

			myArray[2] = '1';

			result++;

		}

		if(fData.question4 == '225 kg'){

			myArray[3] = '1';

			result++;

		}

		if(fData.question5 == 'An B-train double'){

			myArray[4] = '1';

			result++;

		}

		if(fData.question6 == '3 metres'){

			myArray[5] = '1';

			result++;

		}

		if(fData.question7 == 'No'){

			myArray[6] = '1';

			result++;

		}

		if(fData.question8 == '21200 kg'){

			myArray[7] = '1';

			result++;

		}

		if(fData.question9 == '41 kg'){

			myArray[8] = '1';

			result++;

		}

		if(fData.question10 == 'Excessive water weakens the roadway'){

			myArray[9] = '1';

			result++;

		}

		if(fData.question11 == 'The kingpin and the center of the rear axle unit'){

			myArray[10] = '1';

			result++;

		}

		if(fData.question12 == 'The centres of two adjacent axle groups'){

			myArray[11] = '1';

			result++;

		}

		if(fData.question13 == 'The total length A and B plus the space between them (A + B + C)'){

			myArray[12] = '1';

			result++;

		}

		if(fData.question14 == '23 m'){

			myArray[13] = '1';

			result++;

		}

		if(fData.question15 == 'The distance between the axles within an axle group and is measured from the centre of the first axle to the centre of the rear axle in the group'){

			myArray[14] = '1';

			result++;

		}
        if(fData.question16 == '1.85 m'){

			myArray[15] = '1';

			result++;

		}
        if(fData.question17 == '4.36 m'){

			myArray[16] = '1';

			result++;

		}
        if(fData.question18 == '52300 kg'){

			myArray[17] = '1';

			result++;

		}
        if(fData.question19 == 'Weight is shifted from the rear axle to the drive axle'){

			myArray[18] = '1';

			result++;

		}
        if(fData.question20 == 'The landing gear has been lowered to the ground'){

			myArray[19] = '1';

			result++;

		}

		 fData.rightorwrong = myArray;

        fData.result = result;

        fData.rightorwrong = JSON.stringify(fData.rightorwrong);

        let UpdateDriverDtls = await weightDimensions.update(fData, {

            where: {

                driverId: req.body.driverId

            }

        });

        if (UpdateDriverDtls) {

            res.json({ status: true, message: 'Weight & Dimensions' });

        } else {

            res.json({ status: false, message: 'Something went wrong' });

        }

    } else if (req.body.actionData == 'Create') {

        

        const fData = JSON.parse(JSON.stringify(req.body));

            let myArray = [];

			let result	= 0;

			for(let i=0;i<20;i++){

                myArray[i] = '0';

            }
            if(fData.question1 == 'New vehicle categories may not be added'){

                myArray[0] = '1';
    
                result++;
    
            }
    
            if(fData.question2 == 'Tare Weight + Payload = GVWR'){
    
                myArray[1] = '1';
    
                result++;
    
            }
    
            if(fData.question3 == '16000 kgs'){
    
                myArray[2] = '1';
    
                result++;
    
            }
    
            if(fData.question4 == '225 kg'){
    
                myArray[3] = '1';
    
                result++;
    
            }
    
            if(fData.question5 == 'An B-train double'){
    
                myArray[4] = '1';
    
                result++;
    
            }
    
            if(fData.question6 == '3 metres'){
    
                myArray[5] = '1';
    
                result++;
    
            }
    
            if(fData.question7 == 'No'){
    
                myArray[6] = '1';
    
                result++;
    
            }
    
            if(fData.question8 == '21200 kg'){
    
                myArray[7] = '1';
    
                result++;
    
            }
    
            if(fData.question9 == '41 kg'){
    
                myArray[8] = '1';
    
                result++;
    
            }
    
            if(fData.question10 == 'Excessive water weakens the roadway'){
    
                myArray[9] = '1';
    
                result++;
    
            }
    
            if(fData.question11 == 'The kingpin and the center of the rear axle unit'){
    
                myArray[10] = '1';
    
                result++;
    
            }
    
            if(fData.question12 == 'The centres of two adjacent axle groups'){
    
                myArray[11] = '1';
    
                result++;
    
            }
    
            if(fData.question13 == 'The total length A and B plus the space between them (A + B + C)'){
    
                myArray[12] = '1';
    
                result++;
    
            }
    
            if(fData.question14 == '23 m'){
    
                myArray[13] = '1';
    
                result++;
    
            }
    
            if(fData.question15 == 'The distance between the axles within an axle group and is measured from the centre of the first axle to the centre of the rear axle in the group'){
    
                myArray[14] = '1';
    
                result++;
    
            }
            if(fData.question16 == '1.85 m'){
    
                myArray[15] = '1';
    
                result++;
    
            }
            if(fData.question17 == '4.36 m'){
    
                myArray[16] = '1';
    
                result++;
    
            }
            if(fData.question18 == '52300 kg'){
    
                myArray[17] = '1';
    
                result++;
    
            }
            if(fData.question19 == 'Weight is shifted from the rear axle to the drive axle'){
    
                myArray[18] = '1';
    
                result++;
    
            }
            if(fData.question20 == 'The landing gear has been lowered to the ground'){
    
                myArray[19] = '1';
    
                result++;
    
            }
			
			console.log(myArray);

		fData.result = result;

		fData.rightorwrong = myArray;

		fData.rightorwrong = JSON.stringify(fData.rightorwrong);

        let create_DriverDtls = await weightDimensions.create(fData);

        if (create_DriverDtls) {

            res.json({ status: true, message: 'Weight & Dimensions' });

        } else {

            res.json({ status: false, message: 'Something went wrong' });

        }

    }

});







//Safety Laws

router.safetyLaws  = ('/safetyLaws/', async (req, res) => {

    if (req.session.name != "" && req.session.name != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        // let getDtls = await Driverdetails.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getcmpdtls = await Company.findOne({ where: { id: getdriver.company_id }, raw: true });

        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: req.session.driver_id }, raw: true });

		res.render('safetyLaws', {

			title: 'Safety Laws Quiz',

			driverID: getdriver.id,

			CompanyName: getcmpdtls.name,

			driverName: getdriver.driver_name,
            getDrivinghistorySignature: getDrivinghistory ? getDrivinghistory.signature : '',

			company_id: getdriver.company_id,

		});

    }

});
router.editsafetylaws = ('/editsafetylaws/', async (req, res) => {
    let id = req.query.id;

    let getdriver = await Driver.findOne({ where: { id: id }, raw: true });

    let getDtls = await safetyLaws.findOne({ where: { driverId: id }, raw: true }); 

    let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: id }, raw: true });

    if (getDtls) {

        res.json({ status: true, data: getDtls,driverData:getdriver,getDrivinghistory:getDrivinghistory });

    }

    else {

        res.json({ status: false });

    }

	return true;

});
router.companydeletesafetylaws = ('/companydeletesafetylaws/', async (req, res) => {

    let id = req.body.id;

    console.log(id);
    let safetyLaws = safetyLaws.destroy({where: { driverId: id  }});

    if (safetyLaws) {

        res.json({ status: true, message: 'Deleted successfully' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});
router.updatecompanysafetylaws = ('/updatecompanysafetylaws/', async (req, res) => {

    if (req.body.signature) {

        let signaturepath1 = 'public/uploads/attachment/safetylaws/';
       
        let signaturedata = await

            fileUpload('safetylaws_', signaturepath1,

                req.body.signature, req, res)

        Object.assign(req.body, {

            signature: signaturedata // add json element

        });


    }

    let update_Safety = await safetyLaws.update({ signature: req.body.signature, approveStatus:1}, {

        where: {

            driverId: req.body.driverId

        }

    });


	if (update_Safety) {

		res.json({ status: true, message: 'Updated Successfully ' });

	} else {

		res.json({ status: false, message: 'Something went wrong' });

	}

});
router.companysafetylaws = async (req, res) => {

    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });

    res.render('companysafetyLaws', {

        title: 'Safety Laws Quiz',

        getCompanydata: getCompanydata,

        company_id: req.session.userId

    });

};
router.company_get_safetylaws= async (req, res) => {

    console.log('get updateDriverDetailsForm');

    let cmpid = req.query.cmpid;

    let col = req.query.columns[[0]].column || 'd.id';

    let direction = req.query.columns[[0]].dir || 'DESC';

    let columns = ['d.id', 'd.driver_name','driverId','safetyLaws.approveStatus','safetyLaws.result'];

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

            raw: true

        }

        ]

    }

    await safetyLaws.paginate(options).then(function (dt) {

        let data = dt.docs.map(formData);

        // function formData(key) {

        function formData(key, index) {

            index = index + 1

            Object.assign(key, {

                slno: index

            });

            // console.log('-------------');

             console.log(key);

            let ClassName 

            let ButtonName

            if(key.approveStatus == 0){

                ClassName = 'btn btn-danger'

                ButtonName = "Waiting for Admin Approval" 

            }else{

                ClassName = 'btn btn-success'

                ButtonName = "Approved" 

            }

            key.driverId = key.driverId,

                key.driver_name = key.driver_name,

                

                Object.assign(key, {

                    approve: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='' class='"+ ClassName +"' ><span> "+ButtonName+"</span></a>&nbsp;"

                });

                wrong = (25-parseInt(key.result));

				percentage = (parseFloat(key.result)/25)*100;

                /*if(key.approveStatus == 0){

                    Object.assign(key, {

                        result: "No Result"

                    });

                    

                    
                }

                else{
*/
                    Object.assign(key, {

                        result: "Result: "+percentage.toFixed(2)+'%'+"-"+key.result+" out of 25 "

                    });

                //}

                Object.assign(key, {

                    action: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='editmodal' class='btn  btn-warning editmodalclass'><span class='fas fa-edit'> Edit</span></a>&nbsp;"+
                    "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='viewmodalid' class='btn  btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a> "


                   /* action: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='viewmodalid' class='btn  btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a> " +

                        "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='deletedriverDtls' class='btn  btn-danger deletemodalclass'><span class='fas fa-trash'> Delete</span></a>"*/

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
router.updatesafetylaws = ('/updatesafetylaws/', async (req, res) => {

    const fData = JSON.parse(JSON.stringify(req.body))

    Object.assign(req.body, {

        approveStatus: 0 // add json element

    });

    if (req.body.actionData == 'Update') {

        delete req.body['actionData'];

       
        const fData = JSON.parse(JSON.stringify(req.body));

        //console.log(JSON.stringify(fData.rightorwrong))

        console.log(fData);

        let myArray = [];

		let result	= 0;

		for(let i=0;i<25;i++){

			myArray[i] = '0';

		}

		if(fData.question1 == 'True'){

			myArray[0] = '1';

			result++;

		}

		if(fData.question2 == 'True'){

			myArray[1] = '1';

			result++;

		}

		if(fData.question3 == 'True'){

			myArray[2] = '1';

			result++;

		}

		if(fData.question4 == 'False'){

			myArray[3] = '1';

			result++;

		}

		if(fData.question5 == 'False'){

			myArray[4] = '1';

			result++;

		}

		if(fData.question6 == 'False'){

			myArray[5] = '1';

			result++;

		}

		if(fData.question7 == 'False'){

			myArray[6] = '1';

			result++;

		}

		if(fData.question8 == 'False'){

			myArray[7] = '1';

			result++;

		}

		if(fData.question9 == 'False'){

			myArray[8] = '1';

			result++;

		}

		if(fData.question10 == 'True'){

			myArray[9] = '1';

			result++;

		}

		if(fData.question11 == 'True'){

			myArray[10] = '1';

			result++;

		}

		if(fData.question12 == 'False'){

			myArray[11] = '1';

			result++;

		}

		if(fData.question13 == 'True'){

			myArray[12] = '1';

			result++;

		}

		if(fData.question14 == 'True'){

			myArray[13] = '1';

			result++;

		}

		if(fData.question15 == 'True'){

			myArray[14] = '1';

			result++;

		}
        if(fData.question16 == 'True'){

			myArray[15] = '1';

			result++;

		}
        if(fData.question17 == 'False'){

			myArray[16] = '1';

			result++;

		}
        if(fData.question18 == 'True'){

			myArray[17] = '1';

			result++;

		}
        if(fData.question19 == 'False'){

			myArray[18] = '1';

			result++;

		}
        if(fData.question20 == 'False'){

			myArray[19] = '1';

			result++;

		}
        if(fData.question21 == 'True'){

			myArray[20] = '1';

			result++;

		}
        if(fData.question22 == 'True'){

			myArray[21] = '1';

			result++;

		}
        if(fData.question23 == 'True'){

			myArray[22] = '1';

			result++;

		}
        if(fData.question24 == 'False'){

			myArray[23] = '1';

			result++;

		}
        if(fData.question25 == 'True'){

			myArray[24] = '1';

			result++;

		}

		 fData.rightorwrong = myArray;

        fData.result = result;

        fData.rightorwrong = JSON.stringify(fData.rightorwrong);

        let UpdateDriverDtls = await safetyLaws.update(fData, {

            where: {

                driverId: req.body.driverId

            }

        });

        if (UpdateDriverDtls) {

            res.json({ status: true, message: 'Safety Laws Quiz' });

        } else {

            res.json({ status: false, message: 'Something went wrong' });

        }

    } else if (req.body.actionData == 'Create') {

        

        const fData = JSON.parse(JSON.stringify(req.body));

        let myArray = [];

        let result	= 0;

        for(let i=0;i<25;i++){

            myArray[i] = '0';

        }
        if(fData.question1 == 'True'){

            myArray[0] = '1';

            result++;

        }

        if(fData.question2 == 'True'){

            myArray[1] = '1';

            result++;

        }

        if(fData.question3 == 'True'){

            myArray[2] = '1';

            result++;

        }

        if(fData.question4 == 'False'){

            myArray[3] = '1';

            result++;

        }

        if(fData.question5 == 'False'){

            myArray[4] = '1';

            result++;

        }

        if(fData.question6 == 'False'){

            myArray[5] = '1';

            result++;

        }

        if(fData.question7 == 'False'){

            myArray[6] = '1';

            result++;

        }

        if(fData.question8 == 'False'){

            myArray[7] = '1';

            result++;

        }

        if(fData.question9 == 'False'){

            myArray[8] = '1';

            result++;

        }

        if(fData.question10 == 'True'){

            myArray[9] = '1';

            result++;

        }

        if(fData.question11 == 'True'){

            myArray[10] = '1';

            result++;

        }

        if(fData.question12 == 'False'){

            myArray[11] = '1';

            result++;

        }

        if(fData.question13 == 'True'){

            myArray[12] = '1';

            result++;

        }

        if(fData.question14 == 'True'){

            myArray[13] = '1';

            result++;

        }

        if(fData.question15 == 'True'){

            myArray[14] = '1';

            result++;

        }
        if(fData.question16 == 'True'){

            myArray[15] = '1';

            result++;

        }
        if(fData.question17 == 'False'){

            myArray[16] = '1';

            result++;

        }
        if(fData.question18 == 'True'){

            myArray[17] = '1';

            result++;

        }
        if(fData.question19 == 'False'){

            myArray[18] = '1';

            result++;

        }
        if(fData.question20 == 'False'){

            myArray[19] = '1';

            result++;

        }
        if(fData.question21 == 'True'){

            myArray[20] = '1';

            result++;

        }
        if(fData.question22 == 'True'){

            myArray[21] = '1';

            result++;

        }
        if(fData.question23 == 'True'){

            myArray[22] = '1';

            result++;

        }
        if(fData.question24 == 'False'){

            myArray[23] = '1';

            result++;

        }
        if(fData.question25 == 'True'){

            myArray[24] = '1';

            result++;

        }
        
		fData.result = result;

		fData.rightorwrong = myArray;

		fData.rightorwrong = JSON.stringify(fData.rightorwrong);

        let create_DriverDtls = await safetyLaws.create(fData);

        if (create_DriverDtls) {

            res.json({ status: true, message: 'Safety Laws Quiz' });

        } else {

            res.json({ status: false, message: 'Something went wrong' });

        }

    }

});







//Logo code

router.getcompanylogo= ('/getcompanylogo/',async(req,res)=>{

    if (req.session.name != "" && req.session.name != "undefined" && req.session.userId != "" && req.session.userId != "undefined") {

        let getcmpdtls = await Company.findOne({ where: { id: req.session.userId }, raw: true });

        if (getcmpdtls && getcmpdtls.logo!=null && getcmpdtls.logo!='') {

            res.json({ status: true, data:  'uploads/company_logo/'+getcmpdtls.logo});

        }

        else {

            res.json({ status: true, data:  'images/logo-icon.png'});

        }

    }

    else{

            res.json({ status: true, data:  'images/logo-icon.png'});

    }

    return true;



});

router.getlogo  = ('/getlogo/', async (req, res) => {

    if (req.session.name != "" && req.session.name != "undefined" && req.session.driver_id != "" && req.session.driver_id != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        let getcmpdtls = await Company.findOne({ where: { id: getdriver.company_id }, raw: true });

        if (getcmpdtls && getcmpdtls.logo!=null && getcmpdtls.logo!='') {

            res.json({ status: true, data:  'uploads/company_logo/'+getcmpdtls.logo});

        }

        else {

            res.json({ status: true,data:  'images/logo-icon.png' });

        }

    }

    return true;

});

router.companyorientation_Checklists = async (req, res) => {

    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });

    res.render('companyorientation_Checklists', {

        title: 'DRY VAN CHECKLIST',

        getCompanydata: getCompanydata,

        company_id: req.session.userId

    });

};

router.companyflatbeddeletechecklist = ('/companyflatbeddeletechecklist/', async (req, res) => {

    let id = req.body.id;



    let deleteDriverDtls1 = await Certificateauth.destroy({

        where: { driverId: id,certificateID:8  }

    });

    let deleteDriverDtls = await Flabted_checklist.destroy({

        where: { driverId: id }

    });

    if (deleteDriverDtls) {

        res.json({ status: true, message: 'Deleted successfully' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});

router.companydeletechecklist = ('/companydeletechecklist/', async (req, res) => {

    let id = req.body.id;

    let certificateID = req.query.certificateID;

    let deleteDriverDtls = await Certificateauth.destroy({

        where: { driverId: id,certificateID:certificateID  }

    });

    if (deleteDriverDtls) {

        res.json({ status: true, message: 'Deleted successfully' });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});

router.companydryvan_Checklists = async (req, res) => {

    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });

    res.render('companydryvan_Checklists', {

        title: 'Dump Truck Checklist',

        getCompanydata: getCompanydata,

        company_id: req.session.userId

    });

};

router.companyflatbed_Checklists = async (req, res) => {

    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });

    res.render('companyflatbed_Checklists', {

        title: 'FLATBED CHECKLIST',

        getCompanydata: getCompanydata,

        company_id: req.session.userId

    });

};

router.companyorientation_Checklists = async (req, res) => {

    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });

    res.render('companyorientation_Checklists', {

        title: 'Dry Van CHECKLIST',

        getCompanydata: getCompanydata,

        company_id: req.session.userId

    });

};

router.company_get_flatbed_checklist= async (req, res) => {

    console.log('get updateDriverDetailsForm');

    let cmpid = req.query.cmpid;

    let col = req.query.columns[[0]].column || 'd.id';

    let direction = req.query.columns[[0]].dir || 'DESC';

    let columns = ['d.id', 'd.driver_name','driverId'];

    let searchKey = '';

    let where = [];
    let where1 = [];

    // Search Conditions

    if (req.query.search.value) {

        if (req.query.search.value != "") {

            where1.push({

                [Op.or]: [

                    { 'driver_name': { [Op.like]: `%` + req.query.search.value + `%` } }

                ]

            });

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

            required: false,
            where:where1,

            raw: true

        }

        ]

    }

    await Flabted_checklist.paginate(options).then(function (dt) {

        let data = dt.docs.map(formData);

        // function formData(key) {

        function formData(key, index) {

            index = parseInt(index) + 1 + parseInt(req.query.start)

            Object.assign(key, {

                slno: index

            });

            // console.log('-------------');

             console.log(key);

            let ClassName 

            let ButtonName

           

            key.driverId = key.driverId,

            key.driver_name = key.driver_name,

            

            

            Object.assign(key, {

                action: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='editmodalid' class='btn  btn-warning editmodalclass1'><span class='fas fa-edit'> Edit</span></a>&nbsp;" +"<a href='javascript:void(0)' data-id='" + key.driverId + "' id='viewmodalid' class='btn  btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a> " +

                    "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='deletedriverDtls' class='btn  btn-danger deletemodalclass'><span class='fas fa-trash'> Delete</span></a>"

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



router.company_get_Checklist= async (req, res) => {

    console.log('get updateDriverDetailsForm');

    let cmpid = req.query.cmpid;

    let certificateID = req.query.certificateID;

    let col = req.query.columns[[0]].column || 'd.id';

    let direction = req.query.columns[[0]].dir || 'DESC';

    let columns = ['d.id', 'd.driver_name','driverId'];

    let searchKey = '';

    let where = [];
    let where1 = [];

    // Search Conditions

    if (req.query.search.value) {

        if (req.query.search.value != "") {

            where1.push({

                [Op.or]: [

                    { 'driver_name': { [Op.like]: `%` + req.query.search.value + `%` } }

                ]

            });

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
    where.push({

        certificateID: certificateID

    });

    

    const options = {

        page: ((req.query.start / req.query.length) + 1) || 1,

        paginate: parseInt(req.query.length) || 25,

        order: [[columns, col, direction]],

        attributes: columns,

        raw: true,
        where:where,
        //where: { company_id: cmpid,certificateID:certificateID },

        include: [{

            model: db.driver,

            as: "d",

            required: true,
            where:where1,
            raw: true

        }

        ]

    }

    await Certificateauth.paginate(options).then(function (dt) {

        let data = dt.docs.map(formData);

        // function formData(key) {

        function formData(key, index) {

           index = parseInt(index) + 1 +parseInt(req.query.start)
            
            Object.assign(key, {

                slno: index

            });

            // console.log('-------------');

             console.log(key);

            let ClassName 

            let ButtonName

           

            key.driverId = key.driverId,

            key.driver_name = key.driver_name,

            

            

            Object.assign(key, {

                action: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='viewmodalid' class='btn  btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a> " +

                    "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='deletedriverDtls' class='btn  btn-danger deletemodalclass'><span class='fas fa-trash'> Delete</span></a>"

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

router.edit_Checklists = ('/edit_Checklists/', async (req, res) => {

    // console.log(req.query);Certificateauth

    let id = req.query.id;

    let certificateID = req.query.certificateID;

    let getdriver = await Driver.findOne({ where: { id: id }, raw: true });

    let getDtls = await Certificateauth.findOne({ where: { driverId: id,certificateID:certificateID }, raw: true }); 

    let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: id }, raw: true });

    // console.log(getDtls);

    if (getDtls) {

        res.json({ status: true, data: getDtls,driverData:getdriver,getDrivinghistory:getDrivinghistory });

    }

    else {

        res.json({ status: false });

    }

	return true;

});

router.edit_flatbed_Checklists = ('/edit_flatbed_Checklists/', async (req, res) => {

    // console.log(req.query);Certificateauth company_id

    let id = req.query.id;

    let certificateID = req.query.certificateID;

    let cmpid = req.query.cmpid;

    let getdriver = await Driver.findOne({ where: { id: id }, raw: true });

    let getDtls = await Certificateauth.findOne({ where: { driverId: id,certificateID:certificateID }, raw: true }); 

    let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: id }, raw: true });

    let flabted_checklist = await Flabted_checklist.findOne({ where: { driverId: id}, raw: true });

    let company = await Company.findOne({ where: { id: cmpid }, raw: true });

    // console.log(getDtls);

    if (getDtls) {

        res.json({ status: true, data: getDtls,driverData:getdriver,getDrivinghistory:getDrivinghistory,flabted_checklist:flabted_checklist,company:company });

    }

    else {

        res.json({ status: false });

    }

	return true;

});







// Get Disclaimer certificate

router.Disclaimer = ('/Disclaimer/', async (req, res) => {

    // console.log(req.query);

    if (req.session.name != "" && req.session.name != "undefined") {

        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });

        let getDriverdetails = await Driverdetails.findOne({ where: { driverId: req.session.driver_id }, raw: true });

        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: req.session.driver_id }, raw: true });

		let Disclaimer1 = await Disclaimer.findOne({ where: { driverId: req.session.driver_id }, raw: true });
		let signature	= (Disclaimer1 && Disclaimer1.signature)?Disclaimer1.signature:'';
		if(signature!=''){
			signature = (getDrivinghistory && getDrivinghistory.signature)?getDrivinghistory.signature:'';
			if(signature!=''){
				signature = 'uploads/attachment/drivinghistoryaddressSignature/'+signature;
			}
		}
		else{
			signature = 'uploads/attachment/disclaimerSignature/' + signature;
		}

        res.render('Disclaimer.ejs', {

            title: 'Disclaimer and Signature',

            disclaimer: getdriver.Disclaimer_type?getdriver.Disclaimer_type:'',

            signature: signature,

            company_id: getdriver ? getdriver.company_id : '',

            driverId: getdriver ? getdriver.id : '',

            driverName: getdriver ? getdriver.driver_name : '',

            getDrivinghistorySignature: getDrivinghistory ? getDrivinghistory.signature : '',

            getupdatedDate: getDrivinghistory ? getDrivinghistory.updatedDate : ''



        });

    }

});





router.addDisclaimer = ('/addDisclaimer/', async (req, res) => {

    // console.log(req.body);

    // console.log(req.body.adminSignature);

    // let id = req.body.id;



    let date = new Date();

    var updated_on =

        ("00" + (date.getMonth() + 1)).slice(-2) + "-" +

        ("00" + date.getDate()).slice(-2) + "-" +

        date.getFullYear() + " " +

        ("00" + date.getHours()).slice(-2) + ":" +

        ("00" + date.getMinutes()).slice(-2) + ":" +

        ("00" + date.getSeconds()).slice(-2);

    // console.log(updated_on);

    // if (req.body.adminSignature) {

    //     let signaturepath =

    //         'public/uploads/attachment/drivinghistoryaddressSignature/';

    //     let drivinghistoryaddressSignatureData = await

    //         fileUpload('drivinghistoryaddressSignature', signaturepath,

    //             req.body.adminSignature, req, res)

    //     Object.assign(req.body, {

    //         adminSignature: drivinghistoryaddressSignatureData // add json element

    //     });

    // }
    let reqSign = req.body.signature;
// console.log(req.body.signature);
    if (req.body.signature) {
       
        let signaturepath = 'public/uploads/attachment/disclaimerSignature/';

        let drivinghistoryaddressSignatureData = await fileUpload('disclaimerSignature', signaturepath, req.body.signature, req, res)

        Object.assign(req.body, {

            signature: drivinghistoryaddressSignatureData // add json element

        });

    }

    Object.assign(req.body, {

        created_date: updated_on // add json element

    });

    // console.log(req.body);

    let approveDtls = await Disclaimer.create(req.body);

	let driverId = req.session.driver_id;

	// let Disclaimer_type = 'No';

    let getDriver = await Driver.findOne({ where: { id: driverId }, raw: true });

	

	let rpassword = getDriver.password+'CM';

    if (approveDtls) {
		let logout = '';

		if(getDriver.Disclaimer_type=='Yes'){

			// await Driver.update({ password: rpassword,Disclaimer_type:Disclaimer_type }, {
			await Driver.update({ password: rpassword }, {

				where: {

					id: driverId

				}

			});
            if (req.body.signature) {

                let Attachmentpath = 'public/uploads/attachment/drivinghistoryaddressSignature/';
        
                let drivinghistoryaddressAttachmentData = await fileUpload('drivinghistoryaddressAttachment', Attachmentpath, reqSign, req, res)
        
                Object.assign(req.body, {
        
                    signature: drivinghistoryaddressAttachmentData // add json element
        
                });
                await Drivinghistory.create({ driverId: driverId, company_id: getDriver.company_id, signature: req.body.signature});
                console.log(driverId);
                console.log(req.body.signature);
            }
			logout = '1';

		}

        res.json({ status: true, message: 'Disclaimer created successfully',logout:logout });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});

router.checkDisclaimer = ('/checkDisclaimer/', async (req, res) => {

	 let driverId = req.session.driver_id;

	 console.log(driverId);

    let getDriver = await Driver.findOne({ where: { id: driverId }, raw: true });
	let Disclaimer1 = await Disclaimer.findOne({ where: { driverId: req.session.driver_id }, raw: true });

    let motor_vehicle_driver_certificate = await motorVehicleDriverCertificate.findOne({ where: { driverId: req.session.driver_id}, raw: true });

	if (getDriver.Disclaimer_type) {

        res.json({ status: true, Disclaimer_type:getDriver.Disclaimer_type, annualreview:getDriver.annualreview,disclaimer: Disclaimer1,motor:motor_vehicle_driver_certificate});

    }

    else {

        res.json({ status: false });

    }

    return true;



});

router.getDisclaimer = ('/getDisclaimer/', async (req, res) => {

    // console.log(req.query);Certificateauth

    let driverId = req.query.driverId;

    let company_id = req.query.company_id;

    let getDriver = await Driver.findOne({ where: { id: driverId }, raw: true });



    let getDriverdetails = await Driverdetails.findOne({ where: { driverId: driverId }, raw: true });

    let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: driverId }, raw: true });



    let getDisclaimer = await Disclaimer.findOne({ where: { driverId:driverId,company_id: company_id }, raw: true });



        let signature

	if(getDrivinghistory && getDrivinghistory.signature!='' && getDrivinghistory.signature!=null){

		if (getDriver.Disclaimer_type == "No") {

			signature = "uploads/attachment/drivinghistoryaddressSignature/"+getDrivinghistory.signature

		}else{
            // console.log('-------------------------');
            // console.log(getDisclaimer);
            // console.log('-------------------------');
            if (getDisclaimer != null) {
                signature = "uploads/attachment/disclaimerSignature/"+getDisclaimer.signature
            }else{
                signature = ''
            }

			

		}

	}

    // console.log(getDtls);

    if (getDisclaimer) {

        res.json({ status: true, data: getDisclaimer,getDriverdetails:getDriverdetails,getDrivinghistory:getDrivinghistory,signature:signature,Disclaimer_type:getDriver.Disclaimer_type });

    }

    else {

        res.json({ status: false,signature:signature,Disclaimer_type:getDriver.Disclaimer_type });

    }

    return true;

});
router.checkDriverdtails = ('/checkDriverdtails/', async (req, res) => {

    let driverId = req.session.driver_id;
    let driverdetails =  await Driverdetails.findOne({where:{driverId:driverId},limit: 1, order: [['id', 'DESC']], raw: true});
    let emphistory = await Employmenthistory.findOne({ where: { driverId: driverId }, raw: true });
    let drivinghistory = await Drivinghistory.findAll({ where: { driverId: driverId }, raw: true });
    let motordata = await Certificateauth.findOne({ where: { driverId: driverId, certificateID: 1 }, raw: true });
    let medicaldata = await Certificateauth.findOne({ where: { driverId: driverId, certificateID: 2 }, raw: true });
    let driveractdata = await Certificateauth.findOne({ where: { driverId: driverId, certificateID: 3 }, raw: true });
    let pspdata = await Certificateauth.findOne({ where: { driverId: driverId, certificateID: 4 }, raw: true });
    let clearhouse = await Certificateauth.findOne({ where: { driverId: driverId, certificateID: 5 }, raw: true });
    let compensated = await Certificateauth.findOne({ where: { driverId: driverId, certificateID: 6 }, raw: true });
    let drug = await Certificateauth.findOne({ where: { driverId: driverId, certificateID: 7 }, raw: true });
    let referencedata = await Certificateauth.findOne({ where: { driverId: driverId, certificateID: 8 }, raw: true });
    let hosdata = await Hos.findOne({ where: { driverId: driverId }, raw: true });
    let driverdata  = '';
    let empdata     = '';
    let driverhis   = '';
    let motor       = '';
    let medical     = '';
    let driverAck   = '';
    let psp         = '';
    let house       = '';
    let compensatedw= '';
    let drugalcohol = '';
    let reference   = '';
    let hos         = '';
    if(driverdetails){
        driverdata = driverdetails;
        //res.json({ status: true});
    }
    if(emphistory){
        empdata = emphistory;
    }
    if(drivinghistory){
        driverhis = drivinghistory;
    }
    if(motordata){
        motor = motordata;
    }
    if(medicaldata){
        medical = medicaldata;
    }
    if(driveractdata){
        driverAck = driveractdata;
    }
    if(pspdata){
        psp = pspdata;
    }
    if(clearhouse){
        house = clearhouse;
    }
    if(compensated){
        compensatedw = compensated;
    }
    if(drug){
        drugalcohol = drug;
    }
    if(referencedata){
        reference = referencedata;
    }
    if(hosdata){
        hos = hosdata;
    }
    res.json({ status: true,driverdata:driverdata,empdata:empdata,driverhis:driverhis,motor:motor,medical:medical,driverAck:driverAck,psp:psp,house:house,compensatedw:compensatedw,drugalcohol:drugalcohol,reference:reference,hos:hos});
    return true;
});


router.annualReview = ('/annualReview/', async (req, res) => {

    // console.log(req.query);

    if (req.session.name != "" && req.session.name != "undefined") {
//
        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });
        console.log('annual: '+getdriver);
        let getcmpdtls = await Company.findOne({ where: { id: getdriver.company_id }, raw: true });
        let driverdetails =  await Driverdetails.findOne({where:{driverId:req.session.driver_id},limit: 1, order: [['id', 'DESC']], raw: true});

        let annualreview1 = await annualreview.findOne({ where: { driverid:req.session.driver_id}, raw: true });
        //console.log('annual review: '+getcmpdtls);
        res.render('annual_review', {

            title: 'ANNUAL REVIEW OF DRIVING RECORD ',
            company_id: getdriver ? getdriver.company_id : '',
            company_name:getcmpdtls?getcmpdtls.name:'',
            driverId: req.session.driver_id ? req.session.driver_id : '',
            driverName: driverdetails ? driverdetails.lastName+' '+driverdetails.firstName+' '+driverdetails.middleName : '',
            driver_license: getdriver ? getdriver.driver_license : '',
            license_expiry: getdriver ? getdriver.license_expiry : '',
            sin: driverdetails ? driverdetails.sin : '',
            date_review:annualreview1?annualreview1.date_review:'',
            annualreview1:annualreview1?annualreview1:''
        });

    }

});
router.motorvehicledrivercerificate = ('/motorvehicledrivercerificate/', async (req, res) => {

    // console.log(req.query);

    if (req.session.name != "" && req.session.name != "undefined") {
//
        let getdriver = await Driver.findOne({ where: { id: req.session.driver_id }, raw: true });
        let getcmpdtls = await Company.findOne({ where: { id: getdriver.company_id }, raw: true });
        let getdriveraddress = await Driveraddress.findOne({ where: { driverId: req.session.driver_id }, raw: true });
        let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: req.session.driver_id }, raw: true });
        //console.log('annual review: '+getcmpdtls);
        res.render('motor_vehicle_driver_certificate', {

            title: 'MOTOR VEHICLE DRIVER’S CERTIFICATION OF VIOLATIONS',
            company_id: getdriver ? getdriver.company_id : '',
            company_name:getcmpdtls?getcmpdtls.name:'',
            companyAddress:getcmpdtls?getcmpdtls.companyAddress:'',
            driverId: req.session.driver_id ? req.session.driver_id : '',
            driverdata:getdriver,
            driverName: getdriver ? getdriver.driver_name : '',
            driverstate: getdriveraddress ? getdriveraddress.driverState : '',
            driver_license: getdriver ? getdriver.driver_license : '',
            license_expiry: getdriver ? getdriver.license_expiry : '',
            getDrivinghistorySignature: getDrivinghistory ? getDrivinghistory.signature : '',
            annualreview: getdriver.annualreview?getdriver.annualreview:'',
        });

    }

});

router.company_get_motorVehicleDriverCertificate= async (req, res) => {


    let cmpid = req.query.cmpid;

    let col = req.query.columns[[0]].column || 'd.id';

    let direction = req.query.columns[[0]].dir || 'DESC';

    let columns = ['d.id', 'd.driver_name','driverId'];

    let searchKey = '';

    let where = [];
    let where1 = [];
    // Search Conditions

    if (req.query.search.value) {

        if (req.query.search.value != "") {

           /* where.push({

                [Op.or]: [

                    { 'driver_name': { [Op.like]: `%` + req.query.search.value + `%` } }

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
            where:where1,

            raw: true

        }

        ]

    }

    await motorVehicleDriverCertificate.paginate(options).then(function (dt) {

        let data = dt.docs.map(formData);

        // function formData(key) {

        function formData(key, index) {

            index = parseInt(index) + 1 + parseInt(req.query.start)

            Object.assign(key, {

                slno: index

            });

            // console.log('-------------');

             console.log(key);

            let ClassName 

            let ButtonName

           

            key.driverId = key.driverId,

            key.driver_name = key.driver_name,

            

            

            Object.assign(key, {

                action: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='editmodalid' class='btn  btn-warning editmodalclass1'><span class='fas fa-edit'> Edit</span></a>&nbsp;" +"<a href='javascript:void(0)' data-id='" + key.driverId + "' id='viewmodalid' class='btn  btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a> " 

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

router.edit_motorVehicleDriverCertificate = ('/edit_motorVehicleDriverCertificate/', async (req, res) => {

    let id = req.query.id;
console.log(id);
    let cmpid = req.query.cmpid;

    let getdriver = await Driver.findOne({ where: { id: id }, raw: true });
    let getdriveraddress = await Driveraddress.findOne({ where: { driverId: id }, raw: true });


    let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: id }, raw: true });

    let motor_vehicle_driver_certificate = await motorVehicleDriverCertificate.findOne({ where: { driverId:id}, raw: true });
console.log(motor_vehicle_driver_certificate);
    let company = await Company.findOne({ where: { id: cmpid }, raw: true });


    if (motor_vehicle_driver_certificate) {

        res.json({
             status: true, driverData:getdriver,
             getDrivinghistory:getDrivinghistory,motor_vehicle_driver_certificate:motor_vehicle_driver_certificate,
             company:company,
             company_name:company?company.name:'',
             companyAddress:company?company.companyAddress:'',
            driverId: motor_vehicle_driver_certificate.driverId,
            driverName: getdriver ? getdriver.driver_name : '',
            driverstate: getdriveraddress ? getdriveraddress.driverState : '',
            driver_license: getdriver ? getdriver.driver_license : '',
            license_expiry: getdriver ? getdriver.license_expiry : '',
            getDrivinghistorySignature: getDrivinghistory ? getDrivinghistory.signature : '', 
    });

    }

    else {

        res.json({ status: false });

    }

	return true;

});

router.company_get_annualReview = async (req, res) => {


    let cmpid = req.query.cmpid;

    let col = req.query.columns[[0]].column || 'driver.id';

    let direction = req.query.columns[[0]].dir || 'DESC';

    let columns = ['id', 'driver_name','driver_id'];

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
        where:where,
        //where: { company_id: cmpid },

        include: [{

            model: db.company,

            as: "c",

            required: false,

            raw: true

        }

        ]

    }

    await driverCompany.paginate(options).then(function (dt) {

        let data = dt.docs.map(formData);

        // function formData(key) {

        function formData(key, index) {

            index = parseInt(req.query.start)+parseInt(index) + 1

            Object.assign(key, {

                slno: index

            });

            // console.log('-------------');

             console.log(key);

            let ClassName 

            let ButtonName

           

            key.driverId = key.id,

            key.driver_name = key.driver_name,

            

            

            Object.assign(key, {

                action: "<a href='javascript:void(0)' data-id='" + key.driverId + "' id='editmodalid' class='btn  btn-warning editmodalclass1'><span class='fas fa-edit'> Edit</span></a>&nbsp;" +"<a href='#' data-id='" + key.driverId + "' id='viewmodalid' class='btn  btn-primary viewmodalclass'><span class='fas fa-search'> View</span></a> " 

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

router.updatemotorVehicleDriverCertificate = ('/updatemotorVehicleDriverCertificate/', async (req, res) => {

	const fData = JSON.parse(JSON.stringify(req.body));
console.log(fData);
    if(fData.date1!=''){

		var d1 = new Date(fData.date1);

		var date1 = d1.getFullYear() + "-" + (d1.getMonth() + 1) + "-" + d1.getDate();

		fData.date1 = date1;

	}

	if(fData.date2!=''){

		var d2 = new Date(fData.date2);

		var date2 = d2.getFullYear() + "-" + (d2.getMonth() + 1) + "-" + d2.getDate();

		fData.date2	 = date2;

	}
    if(fData.date3!=''){

		var d3 = new Date(fData.date3);

		var date3 = d3.getFullYear() + "-" + (d3.getMonth() + 1) + "-" + d3.getDate();

		fData.date3	 = date3;

	}
    if(fData.date4!=''){

		var d4 = new Date(fData.date4);

		var date4 = d4.getFullYear() + "-" + (d4.getMonth() + 1) + "-" + d4.getDate();

		fData.date4	 = date4;

	}
    if(fData.date_certificate!=''){

		var date_certificate = new Date(fData.date_certificate);

		var date_certificate = date_certificate.getFullYear() + "-" + (date_certificate.getMonth() + 1) + "-" + date_certificate.getDate();

		fData.date_certificate	 = date_certificate;

	}

    //console.log('check: '+req.body);
    if (req.body.signature_image) {

        let signaturepath1 =

            'public/uploads/attachment/motorVechile/';

        let signatureData = await

            fileUpload('motorVehicle', signaturepath1,

                req.body.signature_image, req, res)

        Object.assign(req.body, {

            signature: signatureData // add json element

        });

        //console.log(req.body);

      

    }

    update_Dtls = await motorVehicleDriverCertificate.update({ title: fData.title,signature:req.body.signature,date1:fData.date1,date2:fData.date2,date3:fData.date3,date4:fData.date4,offence1:fData.offence1,offence2:fData.offence2,offence3:fData.offence3,offence4:fData.offence4,location1:fData.location1,location2:fData.location2,location3:fData.location3,location4:fData.location4,vehicle1:fData.vehicle1,vehicle2:fData.vehicle2,vehicle3:fData.vehicle3,vehicle4:fData.vehicle4,date_certificate:fData.date_certificate }, {

        where: {

            driverId: req.body.driverId

        }

    });

    //console.log(';sf:'+update_Dtls);

	if (update_Dtls) {

		res.json({ status: true, message: 'Updated Successfully ' });

	} else {

		res.json({ status: false, message: 'Something went wrong' });

	}

});

router.edit_annualreview = ('/edit_annualreview/', async (req, res) => {

    let id = req.query.id;
console.log(id);
    let cmpid = req.query.cmpid;

    let getdriver = await Driver.findOne({ where: { id: id }, raw: true });
    let getdriveraddress = await Driveraddress.findOne({ where: { driverId: id }, raw: true });


    let getDrivinghistory = await Drivinghistory.findOne({ where: { driverId: id }, raw: true });

    let annualreview1 = await annualreview.findOne({ where: { driverid:id}, raw: true });
    let company = await Company.findOne({ where: { id: cmpid }, raw: true });
    let driverdetails =  await Driverdetails.findOne({where:{driverId:id},limit: 1, order: [['id', 'DESC']], raw: true});

        res.json({
             status: true, driverData:getdriver,
             getDrivinghistory:getDrivinghistory,
             annualreview:annualreview1?annualreview1:'',
             company:company,
             company_name:company?company.name:'',
             companyAddress:company?company.companyAddress:'',
            driverId: id,
            sin:driverdetails ? driverdetails.sin: '',
            driverName: driverdetails ? driverdetails.lastName+' '+driverdetails.firstName+' '+driverdetails.middleName : '',
            driverstate: getdriveraddress ? getdriveraddress.driverState : '',
            driver_license: getdriver ? getdriver.driver_license : '',
            license_expiry: getdriver ? getdriver.license_expiry : '',
            getDrivinghistorySignature: getDrivinghistory ? getDrivinghistory.signature : '', 
    });

   

	return true;

});

router.updateannualReview = ('/updateannualReview/', async (req, res) => {

	const fData = JSON.parse(JSON.stringify(req.body));
    if (req.body.signature_image) {

        let signaturepath1 = 'public/uploads/attachment/annualreview/';

        let signatureData = await fileUpload('annualreview', signaturepath1,req.body.signature_image, req, res)
        Object.assign(req.body, {

            signature: signatureData // add json element

        });      
    }

    var d1 = new Date(fData.date_review);

    var date_review = d1.getFullYear() + "-" + (d1.getMonth() + 1) + "-" + d1.getDate();

	let annualreview1 = await annualreview.create({companyid:fData.companyid,driverid:fData.driverid,signature:req.body.signature,date_review:date_review,drivermeet:fData.drivermeet});

	if (annualreview1) {

		res.json({ status: true, message: 'Updated Successfully ' });

	} else {

		res.json({ status: false, message: 'Something went wrong' });

	}

});

router.create_motor_vehicle_driver = ('/create_motor_vehicle_driver/', async (req, res) => {

	const fData = JSON.parse(JSON.stringify(req.body));


	if(fData.date1!=''){

		var d1 = new Date(fData.date1);

		var date1 = d1.getFullYear() + "-" + (d1.getMonth() + 1) + "-" + d1.getDate();

		fData.date1 = date1;

	}

	if(fData.date2!=''){

		var d2 = new Date(fData.date2);

		var date2 = d2.getFullYear() + "-" + (d2.getMonth() + 1) + "-" + d2.getDate();

		fData.date2	 = date2;

	}
    if(fData.date3!=''){

		var d3 = new Date(fData.date3);

		var date3 = d3.getFullYear() + "-" + (d3.getMonth() + 1) + "-" + d3.getDate();

		fData.date3	 = date3;

	}
    if(fData.date4!=''){

		var d4 = new Date(fData.date4);

		var date4 = d4.getFullYear() + "-" + (d4.getMonth() + 1) + "-" + d4.getDate();

		fData.date4	 = date4;

	}
    if(fData.date_certificate!=''){

		var date_certificate = new Date(fData.date_certificate);

		var date_certificate = date_certificate.getFullYear() + "-" + (date_certificate.getMonth() + 1) + "-" + date_certificate.getDate();

		fData.date_certificate	 = date_certificate;

	}

	let motor_vehicle_driver_certificate = await motorVehicleDriverCertificate.create(fData);

    let driverId = req.session.driver_id;

    let getDriver = await Driver.findOne({ where: { id: driverId }, raw: true });

    let rpassword = getDriver.password+'CM';
	if (motor_vehicle_driver_certificate) {
        let logout = '';
        if(getDriver.annualreview=='Yes'){

			// await Driver.update({ password: rpassword,Disclaimer_type:Disclaimer_type }, {
			await Driver.update({ password: rpassword }, {

				where: {

					id: driverId

				}

			});
            let reqSign = req.body.signature;
            if (req.body.signature) {

                let Attachmentpath = 'public/uploads/attachment/drivinghistoryaddressSignature/';
        
                let drivinghistoryaddressAttachmentData = await fileUpload('drivinghistoryaddressAttachment', Attachmentpath, reqSign, req, res)
        
                Object.assign(req.body, {
        
                    signature: drivinghistoryaddressAttachmentData // add json element
        
                });
                await Drivinghistory.create({ driverId: driverId, company_id: getDriver.company_id, signature: req.body.signature});
                console.log(driverId);
                console.log(req.body.signature);
            }
            logout = 1;
        }

		res.json({ status: true,logout:logout, message: "MOTOR VEHICLE DRIVER’S CERTIFICATION OF Violations " });

	} else {

		res.json({ status: false, message: 'Something went wrong' });

	}

});
router.getmotorvehicledrivercertificate = ('/getmotorvehicledrivercertificate/', async (req, res) => {
    let motor_vehicle_driver_certificate = await motorVehicleDriverCertificate.findOne({ where: { driverId: req.query.driverId}, raw: true });

    if (motor_vehicle_driver_certificate) {
        console.log(motor_vehicle_driver_certificate);
        res.json({ status: true, message: motor_vehicle_driver_certificate });

    } else {

        res.json({ status: false, message: 'Something went wrong' });

    }

});

router.companyAnnualReview = async (req, res) => {

    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });

    res.render('companyannual_review', {

        title: 'ANNUAL REVIEW OF DRIVING RECORD',

        getCompanydata: getCompanydata,

        company_id: req.session.userId

    });

};

router.companymotordriver = async (req, res) => {

    let getCompanydata = await Company.findAll({ where: { active: 0 }, raw: true });
	 res.render('companyMotorVehicleDriverCertificate', {
        title: 'MOTOR VEHICLE DRIVER’S CERTIFICATION OF VIOLATIONS',
        getCompanydata: getCompanydata,
        company_id: req.session.userId
    });

};




router.profile = (req, res) => {

    res.render('profile', {

        title: 'Manage profile'

    });

};



module.exports = router;