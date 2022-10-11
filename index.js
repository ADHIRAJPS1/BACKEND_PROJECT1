require("dotenv").config();

const express = require("express");
const cors = require('cors'); 
const bodyParser = require('body-parser');
const app = express();

const payment = require("./routes/payment");
const pay = require("./routes/paymentserver");

app.use(cors("*"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('', (req,res)=> res.json("message"));
app.use('/payment', payment);
app.use("/paytmserver", pay);


module.exports = app;