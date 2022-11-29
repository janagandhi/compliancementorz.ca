const path = require('path');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
// const mysql = require('mysql');
const app = express();
const router = express.Router();
let loginContoller = require('../controllers/login');
let mainContoller = require('../controllers/main');
let superadminController = require('../controllers/superadminController');
const auth = require('../middleware/logincheck');
const session = require('express-session');
app.use(session({
    secret: 'gtest',
    resave: false,
    saveUninitialized: true
}))
router.get('/', async (req, res) => {
    loginContoller.login(req, res);
});
router.post('/gtestFile',async (req, res) => {
    mainContoller.gtestFile(req, res);
});
router.get('/adminLogin', async (req, res) => {
    loginContoller.adminLogin(req, res);
});
router.get('/driverLogin', async (req, res) => {
    loginContoller.driverLogin(req, res);
});
router.get('/login', async (req, res) => {
    loginContoller.login(req, res);
});
router.post('/passwordCheck', async (req, res) => {
    loginContoller.passwordCheck(req, res);
});
router.post('/passwordCheckDriver', async (req, res) => {
    loginContoller.passwordCheckDriver(req, res);
});
router.post('/passwordCheckAdmin', async (req, res) => {
    loginContoller.passwordCheckAdmin(req, res);
});
router.get('/gtest', async (req, res) => {
    mainContoller.gtest(req, res);
});
router.get('/gtest1', async (req, res) => {
    superadminController.gtest1(req, res);
});
router.get('/checkEmail', async (req, res) => {
    mainContoller.checkEmail(req, res);
});
router.get('/alertCron', async (req, res) => {
    superadminController.alertCron(req, res);
});
router.get('/profile',auth.companycheck,async(req,res) => {
    mainContoller.Profile(req,res);
});
router.post('/UpdateProfile',auth.companycheck,async(req,res) => {
    mainContoller.UpdateProfile(req,res);
});
router.get('/GetDriveralert', auth.companycheck, async (req, res) => {
    mainContoller.GetDriveralert(req, res);
});
router.get('/GetDriveralertSuperadmin', auth.superadminCheck, async (req, res) => {
    superadminController.GetDriveralertSuperadmin(req, res);
});
router.get('/GetTruckalert', auth.companycheck, async (req, res) => {
    mainContoller.GetTruckalert(req, res);
});
router.get('/GetTruckalertSuperadmin', auth.superadminCheck, async (req, res) => {
    superadminController.GetTruckalertSuperadmin(req, res);
});
router.get('/GetTraileralertSuperadmin', auth.superadminCheck, async (req, res) => {
    superadminController.GetTraileralertSuperadmin(req, res);
});
router.get('/GetTraileralert', auth.companycheck, async (req, res) => {
    mainContoller.GetTraileralert(req, res);
});
router.get('/GettruckalertModule', auth.companycheck, async (req, res) => {
    mainContoller.GettruckalertModule(req, res);
});
router.get('/GettraileralertModule', auth.companycheck, async (req, res) => {
    mainContoller.GettraileralertModule(req, res);
});
router.get('/GetDriveralerthistory', auth.companycheck, async (req, res) => {
    mainContoller.GetDriveralerthistory(req, res);
});
router.get('/GetDriveralerthistorybyID', auth.companycheck, async (req, res) => {
    mainContoller.GetDriveralerthistorybyID(req, res);
});
router.get('/GetDriveralerthistorybyIDdata', auth.companycheck, async (req, res) => {
    mainContoller.GetDriveralerthistorybyIDdata(req, res);
});
router.get('/GetTruckalerthistory', auth.companycheck, async (req, res) => {
    mainContoller.GetTruckalerthistory(req, res);
});
router.get('/GetTruckalerthistorybyID', auth.companycheck, async (req, res) => {
    mainContoller.GetTruckalerthistorybyID(req, res);
});
router.get('/GetTruckalerthistorybyIDdata', auth.companycheck, async (req, res) => {
    mainContoller.GetTruckalerthistorybyIDdata(req, res);
});
router.get('/GetTraileralerthistory', auth.companycheck, async (req, res) => {
    mainContoller.GetTraileralerthistory(req, res);
});
router.get('/GetTraileralerthistorybyID', auth.companycheck, async (req, res) => {
    mainContoller.GetTraileralerthistorybyID(req, res);
});
router.get('/GetTraileralerthistorybyIDdata', auth.companycheck, async (req, res) => {
    mainContoller.GetTraileralerthistorybyIDdata(req, res);
});
router.get('/GetDriveralertModule',  auth.companycheck,async (req, res) => {
    mainContoller.GetDriveralertModule(req, res);
});
router.post('/alertfreq', async (req, res) => {
    mainContoller.alertfreq(req, res);
});
// router.get('/dashboard', auth,async(req, res) => {
router.get('/dashboard',auth.Common,async (req, res) => {
    mainContoller.dashboard(req, res);
});
// companydashboard
router.get('/companydashboard', auth.companycheck, auth.companycheck,async (req, res) => {
    mainContoller.companydashboard(req, res);
});
// driverDashboard
router.get('/driverDashboard', auth.drivercheck,async (req, res) => {
    mainContoller.driverDashboard(req, res);
});
// driver CURL
router.get('/driver', auth.companycheck, async (req, res) => {
    mainContoller.driver(req, res);
});
// LIST Driver for table
router.get('/getDriver', auth.companycheck,async (req, res) => {
    mainContoller.getDriver(req, res);
});
// Edit Driver
router.get('/editDriver', auth.companycheck,async (req, res) => {
    mainContoller.editDriver(req, res);
});
// Update Company
router.post('/updateDriver', auth.companycheck,async (req, res) => {
    mainContoller.updateDriver(req, res);
});
// Delete Driver
router.post('/deleteDriver', auth.companycheck,async (req, res) => {
    mainContoller.deleteDriver(req, res);
});
router.post('/createDriver', auth.companycheck,async (req, res) => {
    mainContoller.createDriver(req, res);
});
// router.post('/uploadImage', auth.companycheck,async (req, res) => {
//     mainContoller.uploadImage(req, res);
// });
// Driver CURL
// Truck CURL
router.get('/Truck', auth.companycheck,async (req, res) => {
    mainContoller.Truck(req, res);
});
// LIST Truck for table
router.get('/getTruck', auth.companycheck,async (req, res) => {
    mainContoller.getTruck(req, res);
});
// Edit Truck
router.get('/editTruck', auth.companycheck,async (req, res) => {
    mainContoller.editTruck(req, res);
});
// Update Company
router.post('/updateTruck', auth.companycheck,async (req, res) => {
    mainContoller.updateTruck(req, res);
});
// Delete Truck
router.post('/deleteTruck', auth.companycheck,async (req, res) => {
    mainContoller.deleteTruck(req, res);
});
router.post('/createTruck', auth.companycheck,async (req, res) => {
    mainContoller.createTruck(req, res);
});
router.post('/uploadImage', auth.companycheck,async (req, res) => {
    mainContoller.uploadImage(req, res);
});
// Truck CURL
// Trailer CURL
router.get('/Trailer', auth.companycheck,async (req, res) => {
    mainContoller.Trailer(req, res);
});
// LIST Trailer for table
router.get('/getTrailer', auth.companycheck,async (req, res) => {
    mainContoller.getTrailer(req, res);
});
// Edit Trailer
router.get('/editTrailer', auth.companycheck,async (req, res) => {
    mainContoller.editTrailer(req, res);
});
// Update Company
router.post('/updateTrailer', auth.companycheck,async (req, res) => {
    mainContoller.updateTrailer(req, res);
});
// Delete Trailer
router.post('/deleteTrailer', auth.companycheck,async (req, res) => {
    mainContoller.deleteTrailer(req, res);
});
router.post('/createTrailer', auth.companycheck,async (req, res) => {
    mainContoller.createTrailer(req, res);
});
router.post('/uploadImage', auth.companycheck,async (req, res) => {
    mainContoller.uploadImage(req, res);
});
// Trailer CURL
// updateDriverDetailsForm CURL
router.get('/companyupdateDriverDetailsForm', auth.companycheck,async (req, res) => {
    mainContoller.companyupdateDriverDetailsForm(req, res);
});
router.post('/companyupdateDriverDetails', auth.Common,async (req, res) => {
    mainContoller.companyupdateDriverDetails(req, res);
});
router.get('/companyeditupdateDriverDetailsForm', auth.Common,async (req, res) => {
    mainContoller.companyeditupdateDriverDetailsForm(req, res);
});
// LIST driver details for table
router.get('/company_get_updateDriverDetailsForm', auth.companycheck,async (req, res) => {
    mainContoller.company_get_updateDriverDetailsForm(req, res);
});
//Approve
router.post('/companyapproveDriver', auth.companycheck,async (req, res) => {
    mainContoller.companyapproveDriver(req, res);
}); 
router.get('/companygetupdateDriverAddress',async (req, res) => {
    mainContoller.companygetupdateDriverAddress(req, res);
});
router.post('/companyUpdateDriverAddressID',async (req, res) => {
    mainContoller.companyUpdateDriverAddressID(req, res);
});
router.post('/companyAddDriverAddressID',async (req, res) => {
    mainContoller.companyAddDriverAddressID(req, res);
});
router.post('/companydeleteDriverAddress',async (req, res) => {
    mainContoller.companydeleteDriverAddress(req, res);
});
// Delete driver details
router.post('/companydeleteDriverDetails', auth.companycheck,async (req, res) => {
    mainContoller.deleteDriverDetails(req, res);
});
router.get('/companygetDriverDetails', auth.companycheck,async (req, res) => {
    mainContoller.companygetDriverDetails(req, res);
});
// updateDriverDetailsForm CURL
router.get('/companyemploymenthistoryForm', auth.companycheck,async (req, res) => {
    mainContoller.companyemploymenthistoryForm(req, res);
});
// LIST Trailer for table
router.get('/company_get_employmenthistoryForm', auth.companycheck,async (req, res) => {
    mainContoller.company_get_employmenthistoryForm(req, res);
});
//Approve
router.post('/companyapproveemploymenthistory', auth.companycheck,async (req, res) => {
    mainContoller.companyapproveemploymenthistory(req, res);
});
router.post('/companydeleteemploymenthistoryAddress',async (req, res) => {
    mainContoller.companydeleteemploymenthistoryAddress(req, res);
});
router.get('/companyemploymenthistory', auth.superadminCheck,async (req, res) => {
    mainContoller.companyemploymenthistory(req, res);
});
// ------Driving history-------- 
// updateDriverDetailsForm CURL
router.get('/companydrivingHistoryForm', auth.companycheck,async (req, res) => {
    mainContoller.companydrivingHistoryForm(req, res);
});
// LIST Trailer for table
router.get('/company_get_drivingHistoryForm', auth.companycheck,async (req, res) => {
    mainContoller.company_get_drivingHistoryForm(req, res);
});
//Approve
router.post('/companyapprovedrivingHistory', auth.companycheck,async (req, res) => {
    mainContoller.companyapprovedrivingHistory(req, res);
});
router.post('/companydeletedrivingHistoryAddress',async (req, res) => {
    mainContoller.companydeletedrivingHistoryAddress(req, res);
});
router.get('/companydrivingHistory', auth.superadminCheck,async (req, res) => {
    mainContoller.companydrivingHistory(req, res);
});

//----company file upload---
router.get('/companyfileuploadForm', auth.companycheck,async (req, res) => {
    mainContoller.companyfileuploadForm(req, res);
});
router.get('/company_get_fileuploadForm', auth.Common,async (req, res) => {
    mainContoller.company_get_fileuploadForm(req, res);
});
router.get('/getfileupload',async (req, res) => {
    mainContoller.getfileupload(req, res);
});
router.get('/getfileuploadDriver',async (req, res) => {
    mainContoller.getfileuploadDriver(req, res);
});
router.post('/deletefileupload',async (req, res) => {
    mainContoller.deletefileupload(req, res);
});

router.get('/companygetfileupload',async (req, res) => {
    mainContoller.companygetfileupload(req, res);
});
router.post('/getupdatefileupload',async (req, res) => {
    mainContoller.getupdatefileupload(req, res);
});
router.get('/superadminfileuploadForm', auth.superadminCheck,async (req, res) => {
    superadminController.superadminfileuploadForm(req, res);
});

// -----------------------------------------SUPERADMIN---------------------------------
// -----------superadmin driver  history-------------
router.get('/GetDriveralerthistorySuperadmin', auth.superadminCheck,async (req, res) => {
    superadminController.GetDriveralerthistorySuperadmin(req, res);
});
router.get('/GetDriveralerthistorySuperadminbyID', auth.superadminCheck,async (req, res) => {
    superadminController.GetDriveralerthistorySuperadminbyID(req, res);
});
router.get('/GetDriveralerthistorySuperadminbyIDdata', auth.superadminCheck,async (req, res) => {
    superadminController.GetDriveralerthistorySuperadminbyIDdata(req, res);
});
// -----------superadmin driver  history-------------
router.get('/GetTruckalerthistorySuperadmin', auth.superadminCheck,async (req, res) => {
    superadminController.GetTruckalerthistorySuperadmin(req, res);
});
router.get('/GetTruckalerthistorySuperadminbyID', auth.superadminCheck,async (req, res) => {
    superadminController.GetTruckalerthistorySuperadminbyID(req, res);
});
router.get('/GetTruckalerthistorySuperadminbyIDdata', auth.superadminCheck,async (req, res) => {
    superadminController.GetTruckalerthistorySuperadminbyIDdata(req, res);
});
// -----------superadmin driver  history-------------
router.get('/GetTraileralerthistorySuperadmin', auth.superadminCheck,async (req, res) => {
    superadminController.GetTraileralerthistorySuperadmin(req, res);
});
router.get('/GetTraileralerthistorySuperadminbyID', auth.superadminCheck,async (req, res) => {
    superadminController.GetTraileralerthistorySuperadminbyID(req, res);
});
router.get('/GetTraileralerthistorySuperadminbyIDdata', auth.superadminCheck,async (req, res) => {
    superadminController.GetTraileralerthistorySuperadminbyIDdata(req, res);
});
// -----------superadmin driver  history-------------
router.get('/superadminGetDriveralertModule', auth.superadminCheck,async (req, res) => {
    superadminController.superadminGetDriveralertModule(req, res);
});
router.get('/superadminGettruckalertModule', auth.superadminCheck,async (req, res) => {
    superadminController.superadminGettruckalertModule(req, res);
});
router.get('/superadminGettraileralertModule', auth.superadminCheck,async (req, res) => {
    superadminController.superadminGettraileralertModule(req, res);
});
// company CURL
router.get('/superadmincompany', auth.superadminCheck,async (req, res) => {
    superadminController.company(req, res);
});
router.post('/superadmincreateCompany', auth.superadminCheck,async (req, res) => {
    superadminController.createCompany(req, res);
});
router.get('/superadmingetCompanyCSV', auth.superadminCheck,async (req, res) => {
    superadminController.getCompanyCSV(req, res);
});
// LIST Company for table
router.get('/superadmingetCompany', auth.superadminCheck,async (req, res) => {
    superadminController.getCompany(req, res);
});
// Edit Company
router.get('/superadmineditCompany', auth.superadminCheck,async (req, res) => {
    superadminController.editCompany(req, res);
});
// Update Company
router.post('/superadminupdateCompany', auth.superadminCheck,async (req, res) => {
    superadminController.updateCompany(req, res);
});
// Delete Company
router.post('/superadmindeleteCompany', auth.superadminCheck,async (req, res) => {
    superadminController.deleteCompany(req, res);
});
// update alert settings
router.post('/superadminupdateAlert', auth.superadminCheck,async (req, res) => {
    superadminController.updatealertCompany(req, res);
});  
router.post('/superadmindriveractive', auth.Common,async (req, res) => {
    superadminController.superadmindriveractive(req, res);
});
router.post('/superadmintrukactive', auth.Common,async (req, res) => {
    superadminController.superadmintrukactive(req, res);
});
router.post('/superadmintraileractive', auth.Common,async (req, res) => {
    superadminController.superadmintraileractive(req, res);
});
// company CURL
// driver CURL
router.get('/superadmindriver', auth.superadminCheck,async (req, res) => {
    superadminController.driver(req, res);
});
// LIST Driver for table
router.get('/superadmingetDriver', auth.superadminCheck,async (req, res) => {
    superadminController.getDriver(req, res);
});
// Edit Driver
router.get('/superadmineditDriver', auth.superadminCheck,async (req, res) => {
    superadminController.editDriver(req, res);
});
// Update Company
router.post('/superadminupdateDriver', auth.superadminCheck,async (req, res) => {
    superadminController.updateDriver(req, res);
});
// Delete Driver
router.post('/superadmindeleteDriver', auth.superadminCheck,async (req, res) => {
    superadminController.deleteDriver(req, res);
});
router.post('/superadmincreateDriver', auth.superadminCheck,async (req, res) => {
    superadminController.createDriver(req, res);
});
router.post('/superadminuploadImage', auth.superadminCheck,async (req, res) => {
    superadminController.uploadImage(req, res);
});
// Driver CURL
// Truck CURL
router.get('/superadminTruck', auth.superadminCheck,async (req, res) => {
    superadminController.Truck(req, res);
});
// LIST Truck for table
router.get('/superadmingetTruck', auth.superadminCheck,async (req, res) => {
    superadminController.getTruck(req, res);
});
// Edit Truck
router.get('/superadmineditTruck', auth.superadminCheck,async (req, res) => {
    superadminController.editTruck(req, res);
});
// Update Company
router.post('/superadminupdateTruck', auth.superadminCheck,async (req, res) => {
    superadminController.updateTruck(req, res);
});
// Delete Truck
router.post('/superadmindeleteTruck', auth.superadminCheck,async (req, res) => {
    superadminController.deleteTruck(req, res);
});
router.post('/superadmincreateTruck', auth.superadminCheck,async (req, res) => {
    superadminController.createTruck(req, res);
});
router.post('/superadminuploadImage', auth.superadminCheck,async (req, res) => {
    superadminController.uploadImage(req, res);
});
// Truck CURL
// Trailer CURL
router.get('/superadminTrailer', auth.superadminCheck,async (req, res) => {
    superadminController.Trailer(req, res);
});
// LIST Trailer for table
router.get('/superadmingetTrailer', auth.superadminCheck,async (req, res) => {
    superadminController.getTrailer(req, res);
});
// Edit Trailer
router.get('/superadmineditTrailer', auth.superadminCheck,async (req, res) => {
    superadminController.editTrailer(req, res);
});
// Update Company
router.post('/superadminupdateTrailer', auth.superadminCheck,async (req, res) => {
    superadminController.updateTrailer(req, res);
});
// Delete Trailer
router.post('/superadmindeleteTrailer', auth.superadminCheck,async (req, res) => {
    superadminController.deleteTrailer(req, res);
});
router.post('/superadmincreateTrailer', auth.superadminCheck,async (req, res) => {
    superadminController.createTrailer(req, res);
});
router.post('/superadminuploadImage', auth.superadminCheck,async (req, res) => {
    superadminController.uploadImage(req, res);
});
// Trailer CURL
// updateDriverDetailsForm CURL
router.get('/superadminupdateDriverDetailsForm', auth.superadminCheck,async (req, res) => {
    superadminController.updateDriverDetailsForm(req, res);
});
// LIST Trailer for table
router.get('/superadmin_get_updateDriverDetailsForm', auth.superadminCheck,async (req, res) => {
    superadminController.getupdateDriverDetailsForm(req, res);
});
//Approve
router.post('/superadminapproveDriver', auth.superadminCheck,async (req, res) => {
    superadminController.superadminapproveDriver(req, res);
});
// Update Company
// router.post('/superadminupdateDriverDetails', auth.superadminCheck,async (req, res) => {
//     superadminController.updateDriverDetails(req, res);
// });
// Delete Trailer
router.post('/superadmindeleteDriverDetails', auth.superadminCheck,async (req, res) => {
    superadminController.deleteDriverDetails(req, res);
});
router.get('/superadmingetDriverDetails', auth.superadminCheck,async (req, res) => {
    superadminController.superadmingetDriverDetails(req, res);
});
// updateDriverDetailsForm CURL
router.get('/superadminuemploymenthistoryForm', auth.superadminCheck,async (req, res) => {
    superadminController.uemploymenthistoryForm(req, res);
});
// LIST Trailer for table
router.get('/superadmin_get_uemploymenthistoryForm', auth.superadminCheck,async (req, res) => {
    superadminController.getuemploymenthistoryForm(req, res);
});
//Approve
router.post('/superadminapproveemploymenthistory', auth.superadminCheck,async (req, res) => {
    superadminController.superadminapproveemploymenthistory(req, res);
});
router.get('/updateemploymenthistoryFormSuperadmin', auth.superadminCheck,async (req, res) => {
    superadminController.updateemploymenthistoryFormSuperadmin(req, res);
});
router.get('/getupdateemploymenthistoryFormSuperadmin', auth.superadminCheck,async (req, res) => {
    superadminController.getupdateemploymenthistoryFormSuperadmin(req, res);
});
router.get('/superadmingetemploymenthistory', auth.superadminCheck,async (req, res) => {
    superadminController.superadmingetemploymenthistory(req, res);
});
router.get('/superadminemploymenthistory', auth.superadminCheck,async (req, res) => {
    superadminController.superadminemploymenthistory(req, res);
});
//updateDriverDetailsForm
// -----------------------------------------SUPERADMIN---------------------------------
// -----------------------------------------DRIVER---------------------------------
router.get('/updateDriverDetailsForm', auth.drivercheck,async (req, res) => {
    mainContoller.updateDriverDetailsForm(req, res);
});
router.post('/updateDriverDetails', auth.Common,async (req, res) => {
    mainContoller.updateDriverDetails(req, res);
});
router.get('/editupdateDriverDetailsForm', auth.Common,async (req, res) => {
    mainContoller.editupdateDriverDetailsForm(req, res);
});
router.get('/getDriverDetails',async (req, res) => {
    mainContoller.getDriverDetails(req, res);
});
router.get('/getupdateDriverAddress',async (req, res) => {
    mainContoller.getupdateDriverAddress(req, res);
});
router.post('/UpdateDriverAddressID',async (req, res) => {
    mainContoller.UpdateDriverAddressID(req, res);
});
router.post('/AddDriverAddressID',async (req, res) => {
    mainContoller.AddDriverAddressID(req, res);
});
router.post('/deleteDriverAddress',async (req, res) => {
    mainContoller.deleteDriverAddress(req, res);
});
router.get('/updateemploymenthistoryForm', auth.drivercheck,async (req, res) => {
    mainContoller.updateemploymenthistoryForm(req, res);
});
router.post('/updateemploymenthistory', auth.Common,async (req, res) => {
    mainContoller.updateemploymenthistory(req, res);
});
router.get('/editupdateemploymenthistoryForm', auth.Common,async (req, res) => {
    mainContoller.editupdateemploymenthistoryForm(req, res);
});
router.get('/getemploymenthistory',async (req, res) => {
    mainContoller.getemploymenthistory(req, res);
});
router.get('/companygetemploymenthistory',async (req, res) => {
    mainContoller.companygetemploymenthistory(req, res);
});
router.get('/getupdateemploymenthistoryAddress',async (req, res) => {
    mainContoller.getupdateemploymenthistoryAddress(req, res);
});
router.post('/UpdateemploymenthistoryAddressID',async (req, res) => {
    mainContoller.UpdateemploymenthistoryAddressID(req, res);
});
router.post('/AddemploymenthistoryAddressID',async (req, res) => {
    mainContoller.AddemploymenthistoryAddressID(req, res);
});
router.post('/deleteemploymenthistoryAddress',async (req, res) => {
    mainContoller.deleteemploymenthistoryAddress(req, res);
});
router.get('/documentUpload',auth.Common,async (req, res) => {
    mainContoller.documentUpload(req, res);
});
router.post('/insertFileUpload', auth.Common,async (req, res) => {
    mainContoller.insertFileUpload(req, res);
});
router.get('/feedback',auth.Common,async (req, res) => {
    mainContoller.feedback(req, res);
});
router.post('/insertfeedback', auth.Common,async (req, res) => {
    mainContoller.insertfeedback(req, res);
});

// -----------------------------------------DRIVER---------------------------------
// -----------------------------------------Driving History---------------------------------
router.get('/updatedrivingHistoryForm', auth.drivercheck,async (req, res) => {
    mainContoller.updatedrivingHistoryForm(req, res);
});
router.post('/updatedrivingHistory', auth.Common,async (req, res) => {
    mainContoller.updatedrivingHistory(req, res);
});
router.get('/editupdatedrivingHistoryForm', auth.Common,async (req, res) => {
    mainContoller.editupdatedrivingHistoryForm(req, res);
});
router.get('/getdrivingHistory',async (req, res) => {
    mainContoller.getdrivingHistory(req, res);
});
router.get('/getdrivingHistoryAccident',async (req, res) => {
    mainContoller.getdrivingHistoryAccident(req, res);
});
router.get('/getdrivingHistoryViolations',async (req, res) => {
    mainContoller.getdrivingHistoryViolations(req, res);
});
//Approve
router.post('/superadminapproveDrivinghistory', auth.superadminCheck,async (req, res) => {
    superadminController.superadminapproveDrivinghistory(req, res);
});
router.get('/getupdatedrivingHistoryAccident',async (req, res) => {
    mainContoller.getupdatedrivingHistoryAccident(req, res);
});
router.post('/UpdatedrivingHistoryAccidentID',async (req, res) => {
    mainContoller.UpdatedrivingHistoryAccidentID(req, res);
});
router.get('/getupdatedrivingHistoryViolations',async (req, res) => {
    mainContoller.getupdatedrivingHistoryViolations(req, res);
});
router.post('/UpdatedrivingHistoryViolationsID',async (req, res) => {
    mainContoller.UpdatedrivingHistoryViolationsID(req, res);
});
router.get('/getupdatedrivingHistoryAddress',async (req, res) => {
    mainContoller.getupdatedrivingHistoryAddress(req, res);
});
router.post('/UpdatedrivingHistoryAddressID',async (req, res) => {
    mainContoller.UpdatedrivingHistoryAddressID(req, res);
});
router.post('/AdddrivingHistoryAddressID',async (req, res) => {
    mainContoller.AdddrivingHistoryAddressID(req, res);
});
router.post('/deletedrivingHistoryAddress',async (req, res) => {
    mainContoller.deletedrivingHistoryAddress(req, res);
});
router.post('/deletedrivingHistory',async (req, res) => {
    mainContoller.deletedrivingHistory(req, res);
});
router.get('/updatedrivingHistoryFormSuperadmin', auth.superadminCheck,async (req, res) => {
    superadminController.updatedrivingHistoryFormSuperadmin(req, res);
});
router.get('/hosSuperadmin', auth.superadminCheck,async (req, res) => {
    superadminController.hosSuperadmin(req, res);
});
router.get('/generateReportPageSuperadmin', auth.superadminCheck,async (req, res) => {
    superadminController.generateReportPageSuperadmin(req, res);
});
router.get('/generateReport', auth.Common,async (req, res) => {
    superadminController.generateReport(req, res);
});
router.get('/hosCompany', auth.Common,async (req, res) => {
    superadminController.hosCompany(req, res);
});
router.get('/gethosSuperadmin', auth.Common,async (req, res) => {
    superadminController.gethosSuperadmin(req, res);
});
//genreate report company
router.get('/generateReportCompany', auth.Common,async (req, res) => {
    superadminController.generateReportCompany(req, res);
});
router.get('/getgenerateReportCompany', auth.Common,async (req, res) => {
    superadminController.getgenerateReportCompany(req, res);
});
router.get('/getupdatedrivingHistoryFormSuperadmin', auth.superadminCheck,async (req, res) => {
    superadminController.getupdatedrivingHistoryFormSuperadmin(req, res);
});
router.get('/superadmingetDrivinghistory',auth.superadminCheck,async (req, res) => {
    superadminController.superadmingetDrivinghistory(req, res);
});
router.get('/motorVehicleCertificate',auth.Common,async (req, res) => {
    mainContoller.motorVehicleCertificate(req, res);
});
router.get('/medicalDecleration',auth.Common,async (req, res) => {
    mainContoller.medicalDecleration(req, res);
});
router.get('/driverAck',auth.Common,async (req, res) => {
    mainContoller.driverAck(req, res);
});
router.get('/pspDisclosure',auth.Common,async (req, res) => {
    mainContoller.pspDisclosure(req, res);
});
router.get('/clearingHouseConsent',auth.Common,async (req, res) => {
    mainContoller.clearingHouseConsent(req, res);
});
router.get('/compensatedWork',auth.Common,async (req, res) => {
    mainContoller.compensatedWork(req, res);
});
router.get('/drugAndAlcohol',auth.Common,async (req, res) => {
    mainContoller.drugAndAlcohol(req, res);
});
router.get('/Reference',auth.Common,async (req, res) => {
    mainContoller.Reference(req, res);
});
router.get('/hoursOfService',auth.Common,async (req, res) => {
    mainContoller.hoursOfService(req, res);
});
router.get('/updatemotorVehicleCertificateCompany',auth.Common,async (req, res) => {
    superadminController.updatemotorVehicleCertificateCompany(req, res);
});
router.get('/updatemotorVehicleCertificateSuperadminSuperadmin',auth.Common,async (req, res) => {
    superadminController.updatemotorVehicleCertificateSuperadminSuperadmin(req, res);
});
router.get('/getupdatemotorVehicleCertificateSuperadminSuperadmin',auth.Common,async (req, res) => {
    superadminController.getupdatemotorVehicleCertificateSuperadminSuperadmin(req, res);
});
router.get('/editupdatemotorVehicleCertificateSuperadminSuperadmin',auth.Common,async (req, res) => {
    superadminController.editupdatemotorVehicleCertificateSuperadminSuperadmin(req, res);
});
router.get('/updatecompanymotorVehicleCertificate',auth.Common,async (req, res) => {
    superadminController.updatecompanymotorVehicleCertificate(req, res);
});
// -----------------------------------------Driving History---------------------------------


router.get('/generatePdf',auth.Common,async (req, res) => {
    superadminController.generatePdf(req, res);
});

router.post('/certificateapproval',auth.Common,async (req, res) => {
    mainContoller.certificateapproval(req, res);
});
router.post('/certificateapprovalUpdate',auth.Common,async (req, res) => {
    mainContoller.certificateapprovalUpdate(req, res);
});
router.get('/getcertificateDtls',auth.Common,async (req, res) => {
    mainContoller.getcertificateDtls(req, res);
});
router.get('/getHosDtls',auth.Common,async (req, res) => {
    mainContoller.getHosDtls(req, res);
});
router.get('/getHosDtlsSuperadmin',auth.Common,async (req, res) => {
    superadminController.getHosDtlsSuperadmin(req, res);
});
router.get('/getHosDtlsSuperadmin',auth.Common,async (req, res) => {
    superadminController.getHosDtlsSuperadmin(req, res);
});
router.get('/getHosByID',auth.Common,async (req, res) => {
    superadminController.getHosByID(req, res);
});
router.post('/insertHos',auth.Common,async (req, res) => {
    mainContoller.insertHos(req, res);
});
router.post('/updatehosByID',auth.Common,async (req, res) => {
    superadminController.updatehosByID(req, res);
});

router.get('/getdriverDetailsByID',auth.Common,async (req, res) => {
    superadminController.getdriverDetailsByID(req, res);
});



// -----------------------------------------Driving History---------------------------------
router.get('/questions', auth.drivercheck,async (req, res) => {
    mainContoller.questions(req, res);
});
router.get('/editquestions', auth.Common,async (req, res) => {
    mainContoller.editquestions(req, res);
});
router.post('/updateQuestions', auth.Common,async (req, res) => {
    mainContoller.updateQuestions(req, res);
});

router.get('/companyQuestions', auth.Common,async (req, res) => {
    mainContoller.companyQuestions(req, res);
});
router.get('/SuperadminQuestions', auth.Common,async (req, res) => {
    superadminController.SuperadminQuestions(req, res);
});

router.get('/Superadmindrivermanual', auth.Common,async (req, res) => {
    superadminController.Superadmindrivermanual(req, res);
});


router.get('/company_get_Questions', auth.Common,async (req, res) => {
    mainContoller.company_get_Questions(req, res);
});
router.get('/companyeditQuestions', auth.Common,async (req, res) => {
    mainContoller.companyeditQuestions(req, res);
});
//Approve
router.post('/companyapproveQuestions', auth.Common,async (req, res) => {
    mainContoller.companyapproveQuestions(req, res);
}); 
router.post('/companydeleteQuestions', auth.Common,async (req, res) => {
    mainContoller.companydeleteQuestions(req, res);
}); 
router.post('/companyupdateQuestions', auth.Common,async (req, res) => {
    mainContoller.companyupdateQuestions(req, res);
}); 



// Reference Management CURL
router.get('/superadminReferenceManagement', auth.superadminCheck,async (req, res) => {
    superadminController.ReferenceManagement(req, res);
});
// LIST ReferenceManagement for table
router.get('/superadmingetReferenceManagement', auth.superadminCheck,async (req, res) => {
    superadminController.getReferenceManagement(req, res);
});
// Edit ReferenceManagement
router.get('/superadmineditReferenceManagement', auth.superadminCheck,async (req, res) => {
    superadminController.editReferenceManagement(req, res);
});
// Update Company
router.post('/superadminupdateReferenceManagement',async (req, res) => {
    superadminController.updateReferenceManagement(req, res);
});
//Insert into reference table
router.post('/superadminCreateReference', auth.superadminCheck,async (req, res) => {
    superadminController.CreateReference(req, res);
});
//Insert into reference table existing
router.post('/superadminCreateReferenceExisting', auth.superadminCheck,async (req, res) => {
    superadminController.CreateReferenceExisting(req, res);
});

router.get('/superadminGetPrevEmpdetails', auth.superadminCheck,async (req, res) => {
    superadminController.superadminGetPrevEmpdetails(req, res);
});
router.get('/getFormStatus', auth.superadminCheck,async (req, res) => {
    superadminController.getFormStatus(req, res);
});


//Question group 2
router.post('/companydeletedrivermanual', auth.Common,async (req, res) => {
    mainContoller.companydeletedrivermanual(req, res);
}); 
router.get('/drivermanual', auth.drivercheck,async (req, res) => {
    mainContoller.drivermanual(req, res);
});
router.get('/company_get_drivermanual', auth.Common,async (req, res) => {
    mainContoller.company_get_drivermanual(req, res);
});
router.get('/editdrivermanual', auth.Common,async (req, res) => {
    mainContoller.editdrivermanual(req, res);
});
router.post('/updatedrivermanual', auth.Common,async (req, res) => {
    mainContoller.updatedrivermanual(req, res);
});

router.get('/companydrivermanual', auth.Common,async (req, res) => {
    mainContoller.companydrivermanual(req, res);
});
//end



// LOGOUT SESSION
router.get('/logout', async (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});
module.exports = router;
