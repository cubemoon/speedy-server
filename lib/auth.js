'use strict';
var config = speedy.config,
    unixtime = speedy.lib.tools.unixtime,
    authcode = require('authcode');

function getToken(data) {
  if (data.uid && data.username) {
    var token = data.uid + '|' + data.username + '|' + unixtime(new Date);
    token = authcode(token, 'ENCODE', config.authKey);
    return token;
  } else {
    return '';
  }
}

function checkToken(token) {
  token = token.replace('Bearer ','');
  var arr = authcode(token, 'DECODE', config.authKey).split('|');
  if (arr) {
    var user = {};
    user.uid = arr[0];
    user.username = arr[1];
    user.logintime = arr[2];
    return user;
  }
  return false;
}

module.exports = {
  getToken: getToken,
  checkToken: checkToken
};