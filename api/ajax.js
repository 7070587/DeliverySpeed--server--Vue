const axios = require('axios');

module.exports = function ajax(url = '', data = {}, type = 'GET') {
    return new Promise((resolve, reject) => {
        let promise;

        if (type === 'GET') {
            // 準備url query參數數據
            let dataStr = '';   // 數據拼接的字串
            Object.keys(data).forEach(key => {
                dataStr += key + '=' + data[key] + '&';
            });

            if (dataStr !== '') {
                dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
                url = `${url}?${dataStr}`;
            }
            // 發送get請求
            promise = axios.get(url);
        } else {
            // 發送post請求
            promise = axios.post(url, data);
        }

        promise.then(response => {
            // 成功
            resolve(response.data);
        })
            // 失敗
            .catch(error => reject(error));
    });
};