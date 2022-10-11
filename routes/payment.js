const http = require('http');
const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
// const PaytmChecksum = require("./PaytmChecksum");

const checksum_lib = require("./PAYTM/PaytmChecksum");
const config = require("./PAYTM/config");

const parseurl = bodyParser.urlencoded({ extended : true });

router.get('/', (req, res)=> {
    res.status(200).json("payment  request");
});

router.get('/paynow', [parseurl] , (req,res)=>res.status(200).json("get request in paynow"));

router.post('/paynow', (req, res) => {

    console.log("request received ");
    console.log("request = ",req.body);

    // take details from user
    var payment_details = {
        amount: req.body.amount || 1000,
        orderid: 'ORDER_ID'+ new Date().getTime(),
        bussinesstype: req.body.btype || 'TECH',
        posId: req.body.posid || '1111123',
        customerEmail: req.body.email || '324'
    };

    // validate if any detail is absent then send message of failure
    if(!payment_details.amount || !payment_details.orderid || !payment_details.bussinesstype || !payment_details.customerEmail ){
        return res.status(404).json({
            "message": "TRY AGAIN , PAYMENT FAILED",
            "amount": payment_details.amount ,
            "customerEmail": payment_details.customer ,
            "orderid": payment_details.orderid ,
            "posId": payment_details.posId
        });
    }
    else{
        // console.log("details validated");

        var paytmParams = [];

        // store complete details of payment to be made
        paytmParams.body = {
            "MID": config.mid,
            "ORDERID": payment_details.orderid,
            "AMOUNT": payment_details.amount,
            "BUSSINESSTYPE": payment_details.business,
            "posId": payment_details.posId,
            "CUSTOMER_EMAIL": payment_details.customerEmail,
            "CHANNEL_ID": 'WEB',
            "callback_url": 'http://localhost:5000/callback'
        };

        checksum_lib.generateSignature(paytmParams , config.PaytmConfig.key , (err , checksum) =>{
            var stg_url = 'https://securegw-stage.paytm.in/paymentservices/qr/create' ;     // staging url 
            var pro_url = 'https://securegw.paytm.in/paymentservices/qr/create' ;

            // var form_details = "" ; 

            console.log(params);

            // for( var x in params ){
            //     form_details = '<input type="text" name=' + x + 'value = ' + params[x];
            //     res.writeHead(
            //         200 , 
            //         { 
            //             'Content-Type': 'text/html'
            //         });
            //     res.write('<html><head><title>MERCHANT CHECKOUT PAGE </title></head><body><center> PLEASE DO NOT REFRESH THIS PAGE ... </center> <form mathod = post');
            //     res.end();
            // };

            paytmParams.head = {
                "clientId"	: "C11",
                "version"	: "v1",
                "signature"	: checksum
            };

            var post_data = JSON.stringify(paytmParams);


            var options = {

                /* for Staging */
                hostname: 'securegw-stage.paytm.in',
        
                /* for Production */
                // hostname: 'securegw.paytm.in',
        
                port: 443,
                path: '/paymentservices/qr/create',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': post_data.length
                }
            };


            var response = "";
            var post_req = https.request(options, function (post_res) {
                post_res.on('data', function (chunk) {
                    response += chunk;
                });
        
                post_res.on('end', function () {
                    console.log('Response: ', response);
                });
            });

            post_req.write(post_data);
            post_req.end();
        
        });
    }
});





module.exports = router;



// CALLBACK -> 



// DATA RECEIVED -> VALIDATE DATA WITH CHECKSUM AND MAKE POST REQUEST TO PAYTM PAYMENT  