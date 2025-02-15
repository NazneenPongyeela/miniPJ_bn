const http = require('http');
const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors')
const bodyParser = require('body-parser');
const hostname = '127.0.0.1';
const fs = require('fs');
const port = 3000;

const { readFileSync } = require("fs");
var path = require("path");
let cer_part = path.join(process.cwd(), 'isrgrootx1.pem');

const connection = mysql.createConnection({
    host: 'gateway01.us-west-2.prod.aws.tidbcloud.com',
    user: '3TCaLStuc9W9dcn.root',
    password:"fWR05PBXlRg4HrOE",
    database: 'HCSS_app_db',
    port:4000,
    ssl:{
      ca:fs.readFileSync(cer_part)
    }
  });

  

app.use(cors())
app.use(express.json())
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/', (req, res) => {
    res.json({
        "Name":"miniproject",
        "Author":"sumaiyahandnazneen",
        "APIs":[
            {"api_name":"/getDoctors/","method":"get"},
            {"api_name":"/getDoctor/:id","method":"get"},
            {"api_name":"/addDoctor/","method":"post"},
            {"api_name":"/editDoctor/","method":"put"},
            {"api_name":"/editDoctor/","method":"delete"},
        ]
    });
});

app.get('/getDoctors/', (req, res) => {
    let sql = 'SELECT * FROM Doctors';
    connection.query(sql, function(err, results, fields) {
          res.json(results);
        }
      );
});

app.get('/getdoctor/:id', (req, res) => {
    let id = req.params.id;
    let sql = 'SELECT * FROM Doctors WHERE doctor_id = ?';
    connection.query(sql,[id], function(err, results, fields) {
          res.json(results);
        }
      );
});

app.get('/getAppointments/', (req, res) => {
    let sql = 'SELECT * FROM Appointments';
    connection.query(sql, function(err, results, fields) {
          res.json(results);
        }
      );
});

app.get('/getAppointments/:id', (req, res) => {
    let sql = 'SELECT * FROM Appointments';
    connection.query(sql, function(err, results, fields) {
          res.json(results);
        }
      );
});

app.get('/getChatHistory/', (req, res) => {
    let sql = 'SELECT * FROM Chat_History';
    connection.query(sql, function(err, results, fields) {
          res.json(results);
        }
      );
});

app.get('/getChatHistory/:id', (req, res) => {
    let sql = 'SELECT * FROM Chat_History';
    connection.query(sql, function(err, results, fields) {
          res.json(results);
        }
      );
});

app.post('/addDoctor',urlencodedParser, (req, res) => {
  console.log(req.body);
    let sql = 'INSERT INTO doctor(doctor_id, name, expertise) VALUES (?,?,?)';
    let values = [req.body.doctor_id,req.body.name,req.body.expertise];
    let message = "Cannot Insert";
    connection.query(sql,values, function(err, results, fields) {
      if(results) { message = "Inserted";}
          res.json({error:false,data:results,msg:message});
        }
      );
});

app.put('/editDoctor', urlencodedParser, (req, res) => {
  console.log(req.body);
  let sql = 'UPDATE doctor SET doctor_id =?, name =?, expertise=? WHERE doctor_id=? ';
  let values = [req.body.doctor_name,req.body.doctor_phone,req.body.status, req.body.doctor_id];
  let message = "Cannot Edit";

  connection.query(sql,values, function(err, results, fields) {
        if(results) { message = "Updated";}
        res.json({error:false,data:results,msg:message});
      }
    );
});

app.delete('/editDoctor', urlencodedParser, (req, res) => {
console.log(req.body);
  let st = 0;
  if(req.body.doctor_status==1){
    st = 1;
  }
  let sql = 'UPDATE doctor set name=? WHERE doctor_id=? ';
  let values = [st,req.body.doctor_id];
  console.log(values)
  let message = "Cannot Delete";
  connection.query(sql,values, function(err, results, fields) {
          if(results) { message = "Updated";}
          res.json({error:false,data:results,msg:message});
      }
    );
});


