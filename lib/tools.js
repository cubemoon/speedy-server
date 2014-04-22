'use strict';

module.exports = {
  md5: md5,
  unixtime: unixtime
};

function md5(str) {
  var Buffer = require('buffer').Buffer
  var buf = new Buffer(1024);
  var len = buf.write(str, 0);
  str = buf.toString('binary', 0, len);

  var md5sum = require('crypto').createHash('md5');
  md5sum.update(str);
  str = md5sum.digest('hex');
  return str;
}

function unixtime(date) {
  date = new Date(date);
  return Math.floor(date.getTime() / 1000);
}