var PaytmChecksum = require("./PAYTM/PaytmChecksum");
const express = require('express');
const app = express.Router();
const https = require('https');

const config = require("./PAYTM/config");

app.get('/healthcheck', (req, res) => {
    res.status(200).send("HEALTH IS OK");
});

app.post('/paynow', (req, res) => {
    console.log("payment page =", req.body);
    var paytmParams = {};

    paytmParams["MID"] = "HtKyiO88973037779271";
    paytmParams["ORDERID"] = "ORDER_ID12345";


    var paytmChecksum = PaytmChecksum.generateSignature(paytmParams, "NNueT@ouKxweYtlO");

    paytmChecksum.then(function (result) {
        console.log("generateSignature Returns: " + result);

        var txn_url = 'https://securegw.paytm.in/paymentservices/qr/create';
        var form_fields = "";

        for (var x in paytmParams) {
            form_fields += "<input type='hidden' name='" + x + "' value='" + paytmParams[x] + "' >";
        }
        form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + paytmChecksum + "' >";

        const htmlHeader = '<head><title>Checkout Page</title></head>';
        const htmlForm = `<form method="post" action="${txn_url}" name="f1">${form_fields}</form>`;
        const htmlScript = '<script type="text/javascript">document.f1.submit();</script>';
        const htmlBody = `<body><center><h1>Please do not refresh this page...</h1></center>${htmlForm}${htmlScript}</body>`;


        var verifyChecksum = PaytmChecksum.verifySignature(paytmParams, "NNueT@ouKxweYtlO", result);
        console.log("verifySignature Returns: " + verifyChecksum);

        res.clearCookie("TXNID");
        res.clearCookie("STATUS");
        res.clearCookie("RESPCODE");
        res.clearCookie("RESPMSG");
        res.clearCookie("TXNDATE");
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(`<html>${htmlHeader}${htmlBody}</html>`);
        res.end();

    }).catch(function (error) {
        console.log(" error occurred = ", error);
    });

    // body = "{\"mid\":\"YOUR_MID_HERE\",\"orderId\":\"YOUR_ORDER_ID_HERE\"}";




});

module.exports = app;
