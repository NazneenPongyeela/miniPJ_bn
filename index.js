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
    user: '2YvACbsnBzQNyec.root',
    password:"O5njBU0SZ87qqnfA",
    database: 'imi_his_db',
    port:4000,
    ssl:{
      ca:fs.readFileSync(cer_part)
    }
  });
