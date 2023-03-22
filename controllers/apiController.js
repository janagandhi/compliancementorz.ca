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


const visitor = db.visitor;
const purpose = db.purpose;
const admin = db.admin;

const getMonthDifferenceFunction = microServices.getMonthDifference;
const fileUpload = microServices.filedataUpload;
const sendMail = microServices.sendMail;
const sendMailRef = microServices.sendMailRef;
app.use(session({
    secret: 'gtest',
    resave: false,
    saveUninitialized: true
}))
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var formidable = require('formidable');

//app.use(multer().array())
router.adminlogin = ('/adminlogin/', async (req, res,next) => {

    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        // `file` is the name of the <input> field of type `file`
      if(fields.admin_username == undefined || fields.admin_username==''){
            res.json({ error: true, message: 'Please Enter Username' });
        }
        else if(fields.admin_pass == undefined || fields.admin_pass==''){
            res.json({ error: true, message: 'Please Enter Username' });
        }
        else{
            
            const start = async function(admin_username, admin_pass) {
                let getadmin =  await admin.findAll({ where: { username: admin_username,password:admin_pass }, raw: true });
                if(getadmin!=''){
                    res.json({ error: false, msg: 'Login Successfull','admin_id':'1' });
                }
                else{
                    res.json({ error: true, msg: 'Invalid Credential' });
                }
              }
            start(fields.admin_username,fields.admin_pass);
            
           
        }
    });
    form.on('end', function(fields, files) {
    });
});

router.purposelist = ('/purposelist/', async (req, res) => {

    let getremarks = await purpose.findAll({ raw: true });
    res.json({ error: false, data: getremarks });

});
router.vistorRegisteration = ('/vistorRegisteration/', async (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        // `file` is the name of the <input> field of type `file`
        if(fields.date == undefined || fields.date==''){
            res.json({ error: true, msg: 'Please Enter Date' });
        }
        else if (!Date.parse(fields.date)) {
            res.json({ error: true, msg: 'Invalid Date' });
        }
        else if(fields.visitor_name == undefined || fields.visitor_name==''){
            res.json({ error: true, msg: 'Please Enter Visitor Name' });
        }
        else if(fields.visitor_company == undefined || fields.visitor_company==''){
            res.json({ error: true, msg: 'Please Enter Visitor Company' });
        }
        else if(fields.time_in == undefined || fields.time_in==''){
            res.json({ error: true, msg: 'Please Enter Time In' });
        }
        else if(fields.purpose_id == undefined || fields.purpose_id==''){
            res.json({ error: true, msg: 'Please Enter Purpose Id' });
        }
        else if(fields.phone == undefined || fields.phone==''){
            res.json({ error: true, msg: 'Please Enter Phone Number' });
        }
        else if(fields.signature == undefined || fields.signature==''){
            res.json({ error: true, msg: 'Please Enter Signature' });
        }
        /*else if(files.signature.originalFilename == undefined || files.signature.originalFilename==''){
            res.json({ error: true, msg: 'Please Enter signature' });
        }*/
        else if(fields.email_id == undefined || fields.email_id==''){
            res.json({ error: true, msg: 'Please Enter Email' });
        }
        else if(fields.device_id == undefined || fields.device_id==''){
            res.json({ error: true, msg: 'Please Enter Device Id' });
        }
        else{
           /* let signaturepath = 'public/uploads/attachment/visitorsignature/';
            var oldPath = files.signature.filepath;
            var timeInMss = new Date().getTime() // current time
            let random = (Math.random() + 1).toString(36).substring(7);
            var newPath =  'public/uploads/attachment/visitor/'+timeInMss+random+files.signature.originalFilename
            var rawData = fs.readFileSync(oldPath)
        
            fs.writeFile(newPath, rawData, function(err){
                if(err) console.log(err)
            })
            fields.signature = timeInMss+random+files.signature.originalFilename;*/
            let date = new Date(fields.date);
            fields.date = date.getFullYear() + '-'+("00" + (date.getMonth() + 1)).slice(-2) + "-" +("00" + date.getDate()).slice(-2);
        
            let createVisitor =  visitor.create(fields);
            res.json({ error: false, msg: 'Added Successfully' });
        }
    });
    form.on('end', function(fields, files) {
    });
   
});
router.visitorlist = ('/visitorlist/', async (req, res) => {

    let cmpid = req.query.cmpid;

    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        // `file` is the name of the <input> field of type `file`
        if(fields.admin_id == undefined || fields.admin_id==''){
            res.json({ error: true, msg: 'Please Enter admin id' });
        }
        else{
            const start = async function(admin_id) {
                let getadmin =  await admin.findAll({ where: { id: admin_id}, raw: true });
                if(getadmin!=''){
                    let visitors = await visitor.findAll({
                        attributes: {
                            exclude: ['visitor.date','visitor.visitor_name','visitor.visitor_company','visitor.time_in','visitor.time_out','visitor.purpose_id','visitor.phone','visitor.email_id','visitor.remarks','visitor.device_id','visitor.signature','visitor.created_date_time','purpose.name']
                        },
                        include: {
                            model: purpose,
                            as: "purpose"
                        }
                    });
                    res.json({ error: false, msg: 'Link created','data':visitors});
                }
                else{
                    
                    
                    res.json({ error: true, msg: 'No Data Available' });
                }
              }
            start(fields.admin_id);
        }
    });
    form.on('end', function(fields, files) {
    });

});
router.excellink = ('/excellink/', async (req, res,next) => {

    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        // `file` is the name of the <input> field of type `file`
      if(fields.admin_id == undefined || fields.admin_id==''){
            res.json({ error: true, message: 'Please Enter Username' });
        }
        else{
            
            const start = async function(admin_id) {
                let getadmin =  await admin.findAll({ where: { id: admin_id }, raw: true });
                if(getadmin!=''){
                    var fs = require('fs');
                    var timeInMss = new Date().getTime() 
                    let random = (Math.random() + 1).toString(36).substring(7);
                    var writeStream = fs.createWriteStream("public/excel/"+timeInMss+random+"file.xls");

                    var header="Sl No"+"\t"+" Visitor Id"+"\t"+"Date"+"\t"+"Visitor Name"+"\t"+"Visitor Company"+"\t"+"Time In"+"\t"+"Time Out"+"\t"+"Purpose Id"+"\t"+"Phone"+"\t"+"Remarks"+"\t"+"Email"+"\t"+"Purpose Name"+"\t"+"Device Id"+"\n";

                    let visitors = await visitor.findAll({
                        attributes: {
                            exclude: ['visitor.date','visitor.visitor_name','visitor.visitor_company','visitor.time_in','visitor.time_out','visitor.purpose_id','visitor.phone','visitor.email_id','visitor.remarks','visitor.device_id','visitor.signature','visitor.created_date_time','purpose.name']
                        },
                        include: {
                            model: purpose,
                            as: "purpose"
                        }
                    });
                    writeStream.write(header);
                    if(visitors){
                        let row;
                        let j;
                        await visitors.forEach(function (visitors, i) {
                            j = i+1;
                            row = j+"\t"+visitors.id+"\t"+visitors.date+"\t"+visitors.visitor_name+"\t"+visitors.visitor_company+"\t"+visitors.time_in+"\t"+visitors.time_out+"\t"+visitors.purpose_id+"\t"+visitors.phone+"\t"+visitors.remarks+"\t"+visitors.email_id+"\t"+visitors.purpose.name+"\t"+visitors.device_id+"\n";
                            writeStream.write(row);
                            row = '';
                        })
                        
                    }
                    writeStream.close();
                    res.json({ error: false, msg: 'Link created',"link": "https://www.compliancementorz.ca/excel/"+timeInMss+random+"file.xls" });
                }
                else{
                    res.json({ error: true, msg: 'unable to create' });
                }
              }
            start(fields.admin_id);
            
           
        }
    });
    form.on('end', function(fields, files) {
    });
});
module.exports = router; 
