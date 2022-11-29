const express = require('express');
const ejs = require('ejs');
const fs = require('fs');

const nodemailer = require('nodemailer');

// exports.getcompanyinfoByid
exports.sendMail = async function (to, cc, subject, message, req, res) {
    // console.log(base64File);
    try {
        console.log('email start');
        let transporter = nodemailer.createTransport({
            // rejectUnauthorized:false,
            host: 'mail.compliancementorz.ca', // <= your smtp server here
            port: 465, // <= connection port
            //   secure: true, // use SSL or not,
            secureConnection: true,
            tls: {
                rejectUnauthorized: false 
                // ciphers: 'SSLv3'
                // rejectUnauthorized: false,
                // servername: "compliancementorz.ca"
                // servername: "compliancementorz.ca"
            },
            auth: {
                user: 'helpdesk@compliancementorz.ca', // <= smtp login user
                pass: 'kOShNv,WCJsV' // <= smtp login pass
            }
        });

        let mailOptions = {
            from: "helpdesk@compliancementorz.ca", // <= should be verified and accepted by service provider. ex. 'youremail@gmail.com'
            to: to, // <= recepient email address. ex. 'friendemail@gmail.com'
            cc: cc,
            // bcc:'mike@ashaviglobal.com',
            subject: subject, // <= email subject ex. 'Test email'
            //text: emailData.text, // <= for plain text emails. ex. 'Hello world'
            html: message // <= for html templated emails
        };
        //  console.log('mail send start');
        // send mail with defined transport object
        console.log('before email');
        let fdata = await transporter.sendMail(mailOptions);
        console.log('fdata');
        console.log(fdata);
        if (fdata){
            console.log(fdata);
            return fdata
        }
        // transporter.sendMail(mailOptions, async (error, info) => {
        //     if (error) {
        //         return console.log(error.message);
        //     }
        //     console.log('Message sent: %s', info.messageId);
        //     console.log('retrun email');
        //     return 'Message sent: %s', info.messageId;
        // });
    } catch (e) {
        // Log Errors
        console.log(e);
        throw Error(e)

    }
}

exports.sendMailTest = async function (to, cc, subject, message, req, res) {
    // console.log(base64File);
    try {
        console.log('email start');
        let transporter = nodemailer.createTransport({
            // rejectUnauthorized:false,
            host: 'email-smtp.us-east-2.amazonaws.com', // <= your smtp server here
            port: 465, // <= connection port
            //   secure: true, // use SSL or not,
            // secureConnection: true,
            tls: {
                // rejectUnauthorized: false 
                ciphers: 'SSLv3'
                // rejectUnauthorized: false,
                // servername: "compliancementorz.ca"
                // servername: "compliancementorz.ca"
            },
            auth: {
                user: 'AKIAXXKR7IE5PAQT67GR', // <= smtp login user
                pass: 'BJqLdAsyh/nWL2iaZ/BNlBchDvceggxnTa7XNHMwZV2A' // <= smtp login pass
            }
        });

        let mailOptions = {
            from: "helpdesk@compliancementorz.ca", // <= should be verified and accepted by service provider. ex. 'youremail@gmail.com'
            to: to, // <= recepient email address. ex. 'friendemail@gmail.com'
            cc: cc,
            // bcc:'mike@ashaviglobal.com',
            subject: subject, // <= email subject ex. 'Test email'
            //text: emailData.text, // <= for plain text emails. ex. 'Hello world'
            html: message // <= for html templated emails
        };
        //  console.log('mail send start');
        // send mail with defined transport object
        console.log('before email');
        let fdata = await transporter.sendMail(mailOptions);
        console.log('fdata');
        console.log(fdata);
        if (fdata){
            console.log(fdata);
            return fdata
        }
        // transporter.sendMail(mailOptions, async (error, info) => {
        //     if (error) {
        //         return console.log(error.message);
        //     }
        //     console.log('Message sent: %s', info.messageId);
        //     console.log('retrun email');
        //     return 'Message sent: %s', info.messageId;
        // });
    } catch (e) {
        // Log Errors
        console.log(e);
        throw Error(e)

    }
}

exports.getMonthDifference = function (startDate, endDate, req, res) {
    // console.log('t1');
    // console.log(startDate);
    // console.log(endDate);
    // console.log(endDate.getMonth());
    // console.log('t2');
    return (
        endDate.getMonth() -
        startDate.getMonth() +
        12 * (endDate.getFullYear() - startDate.getFullYear())
    );
}

exports.filedataUpload = async function (filename, filepath, base64File, req, res) {
    // console.log('services');
    // console.log(filename);
    // console.log(filepath);
    try {
        const [, type] = base64File.split(';')[0].split('/');
        let extension = type;
        // console.log(req.session);
        var timeInMss = new Date().getTime() // current time
        let random = (Math.random() + 1).toString(36).substring(7);
        // console.log(filename+timeInMss+random+"."+extension); // random text generte
        let fileName = filename + timeInMss + random + "." + extension;
        let finalfileName = filepath + fileName;
        // console.log(filename);
        // console.log(base64File);
        if (extension == 'pdf' || extension == 'PDF') {
            var data = base64File.replace(/^data:.+;base64,/, "")
        } else {
            var data = base64File.replace(/^data:image\/\w+;base64,/, '');
        }


        let fileuploadprocess = await fs.writeFile(finalfileName, data, { encoding: 'base64' }, function (err) {
            if (err) return console.error(err);
        });
        console.log(fileuploadprocess);
        console.log('fileName2');
        return fileName
    } catch (e) {
        // Log Errors
        throw Error(e)

    }
}

