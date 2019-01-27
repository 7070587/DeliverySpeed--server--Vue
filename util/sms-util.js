const md5 = require('blueimp-md5');
const moment = require('moment');
const Base64 = require('js-base64').Base64;
const request = require('request');

// 生成指定長度的隨機數

function randomCode(length) {
    const chars = ['0','1','2','3','4','5','6','7','8','9'];
    let result = '';
    for (let i = 0; i < length; i++) {
        let index = Math.ceil(Math.random() * 9);   // Math.ceil()執行向上捨入，即它總是將數值向上捨入為最接近的整數；
        result += chars[index];
    }

    return result;
}

exports.randomCode = randomCode;

// 向指定號碼發送指定驗證碼
function sendCode(phone, code, callback) {
    var ACCOUNT_SID = '8aaf070855b647ab0155b9f80994058a';
    var AUTH_TOKEN = 'aa8aa679414e49df8908ea5b3d043c24';
    var Rest_URL = 'https://app.cloopen.com:8883';
    var AppID = '8aaf070855b647ab0155b9f809f90590';

    //1. 準備請求url
    /*
     1.使用MD5加密（賬戶Id + 賬戶授權令牌 + 時間戳）。其中賬戶Id和賬戶授權令牌根據url的驗證級別對應主賬戶。
     時間戳是當前系統時間，格式"yyyyMMddHHmmss"。時間戳有效時間為24小時，如：20140416142030
     2.SigParameter參數需要大寫，如不能寫成sig=abcdefg而應該寫成sig=ABCDEFG
     */
    var sigParameter = '';
    var time = moment().format('YYYYMMDDHHmmss');
    sigParameter = md5(ACCOUNT_SID+AUTH_TOKEN+time);
    var url = Rest_URL+'/2013-12-26/Accounts/'+ACCOUNT_SID+'/SMS/TemplateSMS?sig='+sigParameter;

    //2. 準備請求體
    var body = {
        to : phone,
        appId : AppID,
        templateId : '1',
        "datas":[code,"1"]
    };
    //body = JSON.stringify(body);

    //3. 準備請求頭
    /*
     1.使用Base64編碼（賬戶Id + 冒號 + 時間戳）其中賬戶Id根據url的驗證級別對應主賬戶
     2.冒號為英文冒號
     3.時間戳是當前系統時間，格式"yyyyMMddHHmmss"，需與SigParameter中時間戳相同。
     */
    var authorization = ACCOUNT_SID + ':' + time;
    authorization = Base64.encode(authorization);
    var headers = {
        'Accept' :'application/json',
        'Content-Type' :'application/json;charset=utf-8',
        'Content-Length': JSON.stringify(body).length+'',
        'Authorization' : authorization
    };

    //4. 發送請求, 並得到返回的結果, 調用callback
    // callback(true);
    request({
        method : 'POST',
        url : url,
        headers : headers,
        body : body,
        json : true
    }, function (error, response, body) {
        console.log(error, response, body);
        callback(body.statusCode==='000000');
        // callback(true);
    });
}
exports.sendCode = sendCode;

/*
sendCode('13716962779', randomCode(6), function (success) {
    console.log(success);
})*/
