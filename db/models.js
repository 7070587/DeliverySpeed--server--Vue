/*
包含多個操作mongodb數據庫集合的model的模塊
1. 連接數據庫
（1）引入mongoose
（2）連接指定數據庫（URL只有數據庫是變化的）
（3）獲取連接對象
（4）綁定連接完成的監聽（用來提示連接成功）
2.定義對應特定集合的model
（1）定義Schema（描述文檔結構）
（2）定義Model（與集合對應，可以操作集合）
3.向外暴露獲取Model的方法
 */

// 1. 連接數據庫
// 1-1 引入mongoose
const mongoose = require('mongoose');

// 1-2 連接指定數據庫（URL只有數據庫是變化的）
mongoose.connect('mongodb://localhost:27017/deliveryspeed');

// 1-3 獲取連接對象
const conn = mongoose.connection;

// 1-4綁定連接完成的監聽（用來提示連接成功）
conn.on('connected', () => console.log(`mongodb connect success!!`));

// 2.定義對應特定集合的model：UserModel
// 2.1 定義Schema（描述文檔結構）
const userSchema = mongoose.Schema({
    // 帳號
    'name': {type: String},

    // 密碼
    'pwd': {type: String},

    // 類型
    'phone': {'type': String}
});

// 2.2 定義Model（與集合對應，可以操集合）
UserModel = mongoose.model('user', userSchema);

// 3.向外暴露獲取model的方法
module.exports = {
    getModel(name) {
        return mongoose.model(name)
    }
};
