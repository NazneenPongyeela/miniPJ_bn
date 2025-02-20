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
            {"api_name":"/editAppointments/","method":"put"},
            {"api_name":"/deleteAppointments/","method":"delete"},
            {"api_name":"/getChatHistory/","method":"get"},
            {"api_name":"/getChatHistory/:id","method":"get"},
            {"api_name":"/addChatHistory/","method":"post"},
            {"api_name":"/deleteChatHistory/","method":"delete"},


        ]
    });
});

app.get('/getDoctors/', (req, res) => {
    console.log('Fetching doctors list...'); // เพิ่ม log เพื่อตรวจสอบการเรียก API
    
    const sql = 'SELECT doctor_id, name, expertise, availability FROM Doctors';
    
    connection.query(sql, function(err, results) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                error: true,
                message: 'Error fetching doctors',
                details: err.message
            });
        }
        
        console.log('Found doctors:', results); // เพิ่ม log เพื่อตรวจสอบผลลัพธ์
        res.json(results);
    });
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
    const sql = 'SELECT * FROM Appointments';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                error: true,
                message: 'Error fetching appointments',
                details: err.message
            });
        }
        res.json(results);
    });
});

app.get('/getAppointments/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM Appointments WHERE appointment_id = ?';
    
    connection.query(sql, [id], function(err, results) {
        if (err) {
            console.error("Database Error:", err);
            return res.json({ error: true, msg: "Database Error", details: err.message });
        }
        res.json(results);
    });
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
    connection.query(sql,[id], function(err, results, fields) {
          res.json(results);
        }
      );
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
    const { appointment_id, user_id, doctor_id, appointment_date } = req.body;

    if (!appointment_id || !user_id || !doctor_id || !appointment_date) {
        return res.json({
            error: true,
            msg: "All fields are required"
        });
    }

    const sql = 'INSERT INTO Appointments (appointment_id, user_id, doctor_id, appointment_date) VALUES (?, ?, ?, ?)';
    const values = [appointment_id, user_id, doctor_id, appointment_date];

    connection.query(sql, values, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.json({
                error: true,
                msg: "Database Error",
                details: err.message
            });
        }
        res.json({
            error: false,
            msg: "Appointment added successfully",
            data: results
        });
    });
});

// Edit appointment endpoint
app.put('/editAppointments', (req, res) => {
    console.log("Updating appointment:", req.body);

    const { appointment_id, user_id, doctor_id, appointment_date } = req.body;

    // Validate required fields
    if (!appointment_id || !user_id || !doctor_id || !appointment_date) {
        return res.json({ 
            error: true, 
            msg: "All fields are required: appointment_id, user_id, doctor_id, appointment_date" 
        });
    }

    const checkDoctorSQL = 'SELECT doctor_id FROM Doctors WHERE doctor_id = ?';
    connection.query(checkDoctorSQL, [doctor_id], function(err, doctorResults) {
        if (err) {
            console.error("Database Error:", err);
            return res.json({ error: true, msg: "Database Error", details: err.message });
        }

        if (doctorResults.length === 0) {
            return res.json({ error: true, msg: "Doctor ID does not exist" });
        }

        // If doctor exists, proceed with appointment update
        const sql = 'UPDATE Appointments SET user_id = ?, doctor_id = ?, appointment_date = ? WHERE appointment_id = ?';
        const values = [user_id, doctor_id, appointment_date, appointment_id];

        connection.query(sql, values, function(err, results) {
            if (err) {
                console.error("Database Error:", err);
                return res.json({ error: true, msg: "Database Error", details: err.message });
            }

            if (results.affectedRows === 0) {
                return res.json({ error: true, msg: "Appointment not found" });
            }

            res.json({ error: false, data: results, msg: "Appointment updated successfully" });
        });
    });
});

app.delete('/deleteAppointments', (req, res) => {
    const { appointment_id } = req.body;
    
    if (!appointment_id) {
        return res.json({
            error: true,
            msg: "Appointment ID is required"
        });
    }

    const sql = 'DELETE FROM Appointments WHERE appointment_id = ?';
    
    connection.query(sql, [appointment_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.json({
                error: true,
                msg: "Database Error",
                details: err.message
            });
        }

        if (results.affectedRows === 0) {
            return res.json({
                error: true,
                msg: "Appointment not found"
            });
        }

        res.json({
            error: false,
            msg: "Appointment deleted successfully",
            data: results
        });
    });
});


app.post('/addChatHistory', (req, res) => {
  console.log(req.body);

  if (!req.body.user_id) {
    return res.json({ error: true, msg: "user_id cannot be null" });
  }

  let checkDoctorSQL = 'SELECT * FROM Doctors WHERE doctor_id = ?';
  connection.query(checkDoctorSQL, [req.body.doctor_id], function(err, doctorResults) {
    if (err) {
      console.error("Database Error:", err);
      return res.json({ error: true, msg: "Database Error", details: err });
    }

    if (doctorResults.length === 0) {
      return res.json({ error: true, msg: "Doctor ID not found in Doctors table" });
    }

    // ถ้า `doctor_id` มีอยู่แล้ว ให้ทำการเพิ่ม Chat_History
    let sql = 'INSERT INTO Chat_History (user_id, doctor_id, message) VALUES (?, ?, ?)';
    let values = [req.body.user_id, req.body.doctor_id, req.body.message];

    connection.query(sql, values, function(err, results) {
      if (err) {
        console.error("Database Error:", err);
        return res.json({ error: true, msg: "Database Error", details: err });
      }
      res.json({ error: false, data: results, msg: "Inserted" });
    });
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

  
