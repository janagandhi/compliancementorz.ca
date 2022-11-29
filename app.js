const path = require('path');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const session = require('express-session');
const swal = require('sweetalert2');
const db1 = require("./models");

const fs = require('fs');
const mime = require('mime');


// const loginMiddleware = require('./middleware/logincheck');
// application level middleware

// db1.sequelize.sync();
// // drop the table if it already exists
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });


// import swal from 'sweetalert';
app.use(session({
  secret: 'gtest',
  resave: false,
  saveUninitialized: true,
}))

// console.log("test123ssss");

// Server Listening
app.listen(3000, () => {
    console.log('Server is running at port 3000');
});

//set views file
app.set('views',path.join(__dirname,'views'));
			
//set view engine
app.set('view engine', 'ejs');
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 


app.use(express.json({limit: '5000mb'}));
app.use(express.urlencoded({limit: '5000mb'}));


 //define route

app.use('/', require('./routes/admin'));

app.use(express.static(__dirname + '/public'));
app.use(
    '/sweetAlert',
    express.static(__dirname + '/node_modules/sweetalert2/dist/')
    // express.static(__dirname + '/node_modules/sweetalert-master/src/')
  );

app.get('/list',(req, res) => {
    // req.session.email = '11';
    // req.session.save();
    // console.log(req.session.email);
    // res.send('CRUD Operation using NodeJS / ExpressJS / MySQL');
    let sql = "SELECT * FROM users";
    let query = connection.query(sql, (err, rows) => {
        if(err) throw err;
        res.render('user_index', {
            title : 'CRUD Operation using NodeJS / ExpressJS / MySQL',
            users : rows
        });
    });
});



app.post('/save',(req, res) => { 
    let data = {name: req.body.name, email: req.body.email, phone_no: req.body.phone_no};
    let sql = "INSERT INTO users SET ?";
    let query = connection.query(sql, data,(err, results) => {
      if(err) throw err;
      res.redirect('/');
    });
});

app.get('/edit/:userId',(req, res) => {
    const userId = req.params.userId;
    let sql = `Select * from users where id = ${userId}`;
    let query = connection.query(sql,(err, result) => {
        if(err) throw err;
        res.render('user_edit', {
            title : 'CRUD Operation using NodeJS / ExpressJS / MySQL',
            user : result[0]
        });
    });
});

app.post('/update',(req, res) => {
    const userId = req.body.id;
    let sql = "update users SET name='"+req.body.name+"',  email='"+req.body.email+"',  phone_no='"+req.body.phone_no+"' where id ="+userId;
    let query = connection.query(sql,(err, results) => {
      if(err) throw err;
      res.redirect('/');
    });
});
app.get('/delete/:userId',(req, res) => {
    const userId = req.params.userId;
    let sql = `DELETE from users where id = ${userId}`;
    let query = connection.query(sql,(err, result) => {
        if(err) throw err;
        res.redirect('/');
    });
});

