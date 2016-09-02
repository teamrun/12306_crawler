'use strict';

const schedule = require('node-schedule');

// const crawler = require('./crawler');

// exec a job every 30 mins: sec min hour day month day-in-week
// 整点和半点执行查询, 7点~23点(23~6系统维护)
// var j = schedule.scheduleJob('0 */30 7-23 * *', crawler);
var j = schedule.scheduleJob('0 * 7-22 * * *', () => {
  console.log('i will run every 2mins, now is', (new Date()).getMinutes());
});
