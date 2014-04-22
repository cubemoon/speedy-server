'use strict';
var config = speedy.config,
    unixtime = speedy.lib.tools.unixtime,
    authcode = require('authcode');

function Auth(req, res) {
  this.req = req;
  this.res = res;
  this.cookiename = config.cookiepre + 'auth';
  this.key = config.authKey;
}

Auth.prototype.set = function(data) {
  if (data.uid && data.username) {
    var cookieString = data.uid + '|' + data.username + '|' + unixtime(new Date);
    cookieString = authcode(cookieString, 'ENCODE', this.key);
    this.res.cookie(this.cookiename, cookieString);
  }else{
    throw '用户不合法';
  }
}

Auth.prototype.get = function() {
  var cookiename = this.cookiename;
  if (this.req.cookies[cookiename]) {
    var arr = authcode(this.req.cookies[cookiename], 'DECODE', this.key).split('|');
    if (arr) {
      var user = {};
      user.uid = arr[0];
      user.username = arr[1];
      user.logintime = arr[2];
      return user;
    }
    return false;
  } else {
    return false;
  }
}

Auth.prototype.clear = function() {
  this.res.clearCookie(this.cookiename);
}

module.exports = Auth;