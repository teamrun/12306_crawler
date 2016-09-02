'use strict';

const schedule = require('node-schedule');

// const crawler = require('./crawler');

// exec a job every 30 mins: sec min hour day month day-in-week
// 整点和半点执行查询, 7点~23点(23~6系统维护)
var j = schedule.scheduleJob('0 */30 7-23 * *', () => {
  setTimeout(crawler, Math.random() * 5 * 60 * 1000);
});
