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
    database: 'hcss_app_db',
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
            {"api_name":"/editDoctors/","method":"put"},
            {"api_name":"/getAppointments/","method":"get"},
            {"api_name":"/getAppointments/:id","method":"get"},
            {"api_name":"/addAppointments/","method":"post"},
            {"api_name":"/getChatHistory/","method":"get"},
            {"api_name":"/getChatHistory/:id","method":"get"},
            {"api_name":"/addChatHistory/","method":"post"},
            {"api_name":"/editChatHistory/","method":"put"},
            {"api_name":"/deleteChatHistory/","method":"delete"},


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
    connection.query(sql,[id], function(err, results, fields) {
          res.json(results);
        }
      );
});

app.get('/getChatHistory/', (req, res) => {
    let sql = 'SELECT chat_id, user_id, message, timestamp FROM Chat_History';
    connection.query(sql, function(err, results, fields) {
        if (err) {
            console.error("Database Error:", err);
            res.status(500).json({ error: true, msg: "Database Error", details: err });
        } else {
            res.json(results);
        }
    });
});


app.get('/getChatHistory/:id', (req, res) => {
    const chatId = req.params.id;
    let sql = 'SELECT * FROM Chat_History WHERE chat_id = ? ORDER BY timestamp DESC';
    connection.query(sql, [chatId], function(err, results) {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: true, msg: "Database Error", details: err });
        }
        res.json(results);
    });
});

app.post('/addDoctor', (req, res) => {
  console.log(req.body);
  let sql = 'INSERT INTO Doctors(doctor_id, name, expertise) VALUES (?,?,?)';
  let values = [req.body.doctor_id, req.body.name, req.body.expertise];

  connection.query(sql, values, function(err, results) {
      if (err) {
          console.error("Database Error:", err);
          return res.json({ error: true, msg: "Database Error", details: err });
      }
      res.json({ error: false, data: results, msg: "Inserted" });
  });
});


app.put('/editDoctors', urlencodedParser, (req, res) => {
  console.log(req.body);
  let sql = 'UPDATE Doctors SET name =?, expertise=? WHERE doctor_id=? ';
  let values = [req.body.name, req.body.expertise, req.body.doctor_id];
  let message = "Cannot Edit";

  connection.query(sql, values, function(err, results, fields) {
    if (err) {
      console.error(err);
      return res.json({ error: true, msg: "Database Error", details: err });
    }

    if (results.affectedRows > 0) { 
      message = "Updated"; 
    }
    
    res.json({ error: false, data: results, msg: message });
  });
});


app.post('/addAppointments', (req, res) => {
  console.log(req.body);
  let sql = 'INSERT INTO Appointments(appointment_id, user_id, doctor_id,appointment_date) VALUES (?,?,?)';
  let values = [req.body.Appointments_id, req.body.user_id, req.body.doctor_id,req.body.appointments_date];

  connection.query(sql, values, function(err, results) {
      if (err) {
          console.error("Database Error:", err);
          return res.json({ error: true, msg: "Database Error", details: err });
      }
      res.json({ error: false, data: results, msg: "Inserted" });
  });
});

app.post('/addChatHistory', (req, res) => {
  console.log(req.body);
  let sql = 'INSERT INTO Chat_History( user_id, message) VALUES (?,?)';
  let values = [req.body.user_id, req.body.message];

  connection.query(sql, values, function(err, results) {
      if (err) {
          console.error("Database Error:", err);
          return res.json({ error: true, msg: "Database Error", details: err });
      }
      res.json({ 
          error: false, 
          data: {
              user_id: req.body.user_id,
              message: req.body.message
          }, 
          msg: "Chat created successfully" 
      });
  });
});

app.put('/editChatHistory', urlencodedParser, (req, res) => {
  console.log("Request Body:", req.body);

  if (!req.body.chat_id || !req.body.message) {
    return res.json({ error: true, msg: "Missing chat_id or message" });
  }

    let sql = 'UPDATE Chat_History SET chat_id=?, user_id=?, doctor_id=?, message=? WHERE chat_id=?';
     let values = [req.body.chat_id, req.body.user_id, req.body.doctor_id, req.body.message, req.body.chat_id];

  connection.query(sql, values, function(err, results) {
    if (err) {
      console.error("Database Error:", err);
      return res.json({ error: true, msg: "Database Error", details: err });
    }

    console.log("Query Results:", results);

    if (results.affectedRows > 0) { 
      return res.json({ error: false, data: results, msg: "Updated" });
    } else {
      return res.json({ error: true, msg: `No rows updated. Check chat_id: ${req.body.chat_id}` });
    }
  });
});


app.delete('/deleteChatHistory', urlencodedParser, (req, res) => {
  console.log(req.body);
  
  let sql = 'DELETE FROM Chat_History WHERE chat_id = ?';
  let values = [req.body.chat_id];
  console.log(values);

  let message = "Cannot Delete";
  connection.query(sql, values, function(err, results) {
    if (err) {
      console.error("Database Error:", err);
      return res.json({ error: true, msg: "Database Error", details: err });
    }

    if (results.affectedRows > 0) { 
      message = "Deleted Successfully"; 
    }
    res.json({ error: false, data: results, msg: message });
  });
});

  
