var express = require('express');
var router = express.Router();
const md5 = require('blueimp-md5');

const model = require('../db/models');
const UserModel = model.getModel('user');
const _filter = {'pwd:': 0, '__v': 0};    // 查詢時被過濾掉
const sms_util = require('../util/sms-util');
const users = {};
const ajax = require('../api/ajax');
const svgCaptcha = require('svg-captcha');

/* GET home page. */
// router.get('/', function (req, res, next) {
//     res.render('index', {title: 'Express'});
// });

// 密碼登入
router.post('/login_pwd', (req, res) => {

    const name = req.body.name;
    const pwd = md5(req.body.pwd);
    const captcha = req.body.captcha.toLowerCase();
    console.log('/login_pwd', name, pwd, captcha, req.session);


    // 可以對帳號、密碼格式進行檢查，如果非法，返回提示訊息
    if (captcha !== req.session.captcha) {
        return res.send({code: 1, msg: '驗證碼不正確'});
    }


    // 刪除保存的驗證碼
    delete req.session.captcha;

    UserModel.findOne({name}, (err, user) => {

        if (user) {
            console.log('findUser', user);
            if (user.pwd !== pwd) {
                res.send({code: 1, msg: '帳號或密碼不正確'});
            } else {
                req.session.userid = user._id;
                res.send({code: 0, data: {_id: user._id, name: user.name, phone: user.phone}});
            }
        } else {
            const UserModel = new UserModel({name, pwd});
            UserModel.save((err, user) => {
                // 向瀏覽器返回cookie（key = value）
                // req.cookie('userid', user._id, {maxAge: 1000 * 60 * 60 * 24 * 7});
                req.session.userid = user._id;
                const data = {_id: user._id, name: user.name};
                // 返回數據（新的 user）
                res.send({code: 0, data});
            });
        }
    });

});


// 一次性圖形驗證碼
router.get('/captcha', (req, res) => {
    const captcha = svgCaptcha.create({
        size: 4,  // 驗證碼長度
        ignoreChars: '0o1l',    // 驗證碼字符中排除 0o1l
        noise: 3,   // 干擾線條的數量
        color: true   // 驗證碼是否有顏色
    });
    req.session.captcha = captcha.text.toLowerCase();
    console.log(req.session.captcha);
    // res.type('svg');
    // res.status(200).send(captcha.data);
    res.type('svg');
    res.send(captcha.data);
});


// 發送驗證碼簡訊
router.get('/sendcode', (req, res) => {
    // 1.獲取請求參數數據
    const phone = req.query.phone;

    // 2.處理數據
    // 生成驗證碼（6個隨機數）
    const code = sms_util.randomCode(6);

    // 發送給指定的手機號碼
    console.log(`向${phone}發送驗證簡訊：${code}`);
    sms_util.sendCode(phone, code, success => {  // success表示是否成功
        if (success) {
            users[phone] = code;
            console.log('保存驗證碼', phone, code);
            res.send({'code': 0});
        } else {
            // 返回響應數據
            res.send({code: 1, msg: '簡訊驗證碼發送失敗'});
        }
    });

});

// 簡訊登入
router.post('/login_sms', (req, res) => {
    const phone = req.body.phone;
    const code = req.body.code;
    console.log('/login_sms', phone, code);
    if (users[phone] !== code) {
        res.send({code: 1, msg: '手機號碼或驗證碼不正確'});
        return;
    }
    // 保存刪除的code
    delete users[phone];

    UserModel.findOne({phone}, (err, user) => {
        if (user) {
            res.session.userid = user._id;
            res.send({code: 0, data: user});
        } else {
            // 儲存數據
            const userModel = new UserModel({phone});
            userModel.save((err, user) => {
                res.session.userid = user._id;
                res.send({code: 0, data: user});
            });
        }
    });
});


// 根據session中的userid，查詢對應的user
router.get('/userinfo', (req, res) => {
    // 取出userid
    const userid = req.session.userid;
    // 查詢
    UserModel.findOne({_id: userid}, _filter, (err, user) => {
        // 如果沒有，返回錯誤提示
        if (!user) {
            // 清除瀏覽器保存的userid的cookie
            delete req.session.userid;
            res.send({code: 1, msg: '請先登入'});
        } else {
            // 如果有，返回user
            res.send({code: 0, data: user});
        }
    });
});


// 登出
router.get('/logout', (req, res) => {
    // 清除瀏覽器保存的userid的cookie
    delete req.session.userid;
    // 返回數據
    res.send({code: 0});
});


// 根據經緯度獲取位置詳情
router.get('/position/:geohash', (req, res) => {
    const {geohash} = req.params;
    ajax(`http://cangdu.org:8001/v2/pois/${geohash}`)
        .then(data => {
            // 返回數據
            res.send({code: 0, data});
        });
});

// 獲取首頁分頁列表
router.get('/index_category', (req, res) => {
    setTimeout(() => {
        const data = require('../data/index_category.json');
        res.send({code: 0, data});
    }, 300);
});

// 根據經緯度獲取商家列表
// ?latitude=40.10038&longitude=116.36867
router.get('/shops', (req, res) => {
    const latitude = req.query.latitude;
    const longitude = req.query.longitude;

    setTimeout(() => {
        const data = require('../data/shops.json');
        res.send({code: 0, data});
    }, 300);
});

// 搜尋商家列表
router.get('/search_shops', (req, res) => {
    const {geohash, keyword} = req.query;

    ajax('http://cangdu.org:8001/v4/restaurants', {
        'extras[]': 'restaurant_activity',
        geohash,
        keyword,
        type: 'search'
    }).then(data => {
        res.send({code: 0, data});
    });
});


module.exports = router;
