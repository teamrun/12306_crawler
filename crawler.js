'use strict';

const request = require('request');
const moment = require('moment');

const sendMail = require('./mail');

// 忽略 https 证书问题
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// 关键时间点
const keyDate = '2016-09-10';
const testDate = '2016-09-09';
const apiPath = 'https://kyfw.12306.cn/otn/leftTicket/queryT';
const DEFAULT_QUERY = {
  'leftTicketDTO.train_date': keyDate,
  'leftTicketDTO.from_station': 'HZH',
  'leftTicketDTO.to_station': 'TAK',
  'purpose_codes': 'ADULT'
};

let sendToMaster = (subject, content) => {
  let default_opt = {
    from: '"🕷 🚄" <12306_crawler@chenllos.com>',
    to: 'chenllos@163.com',
    // subject: subject,
    // html: content
  };
  let opt = Object.assign({}, default_opt, { subject, html: content });
  console.log('sending mail...');
  console.log(opt);
  sendMail(opt, (err) => {
    if(err) return console.error(err);
    console.log('send success', new Date());
  });
}

// 请求出错: 发邮件报错
let errHandler = (err) => {
  let content = `<div style="color: #B13254;">
  <p>message: <pre>${err.message}</pre></p>
  <p>stack: <pre>${err.stack}</pre></p>
</div>`;
  sendToMaster('查询班次信息出错啦~', content);
}

// 请求成功: 判断, 是否需要发邮件
let sucHandler = (data) => {
  if(data.status === true && data.httpstatus === 200){
    let arr = data.data;
    // 高铁动车的数据
    let gdInfos = arr.filter((item) => {
      return item && item.queryLeftNewDTO &&
        item.queryLeftNewDTO.station_train_code &&
        /^[gd]/i.test(item.queryLeftNewDTO.station_train_code);
    });

    // 是否可购买
    let canBuyArr = gdInfos.filter((item) => {
      let btnTxt = item.buttonTextInfo;
      if(btnTxt=== '预订') return true;
      if((
        btnTxt.indexOf('暂停') < 0 &&
        btnTxt.indexOf('调整') < 0 &&
        btnTxt.indexOf('系统维护') < 0)){
        return true;
      }
      return false;
    });
    // 可购买/怀疑可购买时,
    if(canBuyArr.length > 0){
      let content = canBuyArr.map((item) => {
        return `<li>${item.queryLeftNewDTO.station_train_code}: ${item.buttonTextInfo}</li>`
      }).join('');
      content = `<ul>${content}<ul>`
      return sendToMaster('可以买车票啦!!', content);
    }
    console.log('还不能购买', moment().format('YYYY-MM-DD HH:mm:ss'));
  }
}


let crawler = () => {
  let param = Object.assign({}, DEFAULT_QUERY, {
    'leftTicketDTO.train_date': testDate
  });

  let j = request.jar();
  let cookie = request.cookie('__NRF=87982EA902E055A62B34594F412D6FD4; JSESSIONID=0A02F00DFCFCCF607C3DC8901D73C9744740F7E717; BIGipServerotn=233832970.64545.0000; current_captcha_type=Z; _jc_save_fromStation=%u676D%u5DDE%2CHZH; _jc_save_toStation=%u6CF0%u5C71%2CTAK; _jc_save_fromDate=2016-10-12; _jc_save_toDate=2016-09-02; _jc_save_wfdc_flag=dc');
  let url = 'http://www.google.com';
  j.setCookie(cookie, apiPath);
  // 请求数据
  request.get(apiPath, {
    qs: param,
    // 携带模拟信息
    jar: j,
    headers: {
      'User-Agent': 'User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
    }
  }, (err, resp, body) => {
    if(err){
      return errHandler(err);
    }
    let d;
    try{
      // console.log(body);
      d = JSON.parse(body);
    }
    catch(err){
      // console.log(body);
      return errHandler(new Error('parse body error, body: '+body));
    }

    sucHandler(d);
  });
};

crawler();
module.exports = crawler;
