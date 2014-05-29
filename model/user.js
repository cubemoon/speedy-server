'use strict';
var db = speedy.lib.db,
    md5 = speedy.lib.tools.md5,
    unixtime = speedy.lib.tools.unixtime,
    _ = require('underscore'),
    util = require('util'),
    Q = require('q');

var table = 'user',
    pk = 'uid';

function User() {

}

User.prototype.get = function(data) {
  var deferred = Q.defer();
  if (data[pk]) {
    if (!isNaN(data[pk])) {
      var sql = "SELECT * FROM " + table + " WHERE uid=:uid";
      var params = {
        uid: data[pk]
      }
    } else {
      var sql = "SELECT * FROM " + table + " WHERE username=:username";
      var params = {
        username: data[pk]
      }
    }
    db.query(sql, params, function(err, rows) {
      if (err) {
        deferred.reject(err);
      }
      deferred.resolve(rows);
    });
  } else {
    deferred.reject({
      msg: '参数错误'
    });
  }
  return deferred.promise;
}

User.prototype.getList = function(data, limit, withoutfriend) {
  var deferred = Q.defer();
  if (!_.isUndefined(withoutfriend)) {
    if(withoutfriend=='true'){
      var sql = 'select * from user where uid not in (select fuid as id from friend where uid=' + speedy.userAuth.uid + ') and uid != ' + speedy.userAuth.uid;
    }else{
      var sql = 'select * from user';
    }
  } else {
    var sql = 'select * from user where uid in (' + data.uids + ')';
  }
  if (limit) {
    var sql = sql + ' limit ' + limit;
  }
  db.query(sql, function(err, rows) {
    if (err) {
      deferred.reject(err);
    }
    _.forEach(rows, function(value, key) {
      delete value['password'];
    });
    deferred.resolve(rows);
  });
  return deferred.promise;
}

User.prototype.add = function(data) {
  var deferred = Q.defer();
  if (data.username && data.password) {
    data.password = md5(data.password);
    var params = {
      username: data.username,
      password: data.password,
      nickname: data.username,
      mood: '',
      allowtype: 1,
      question: '',
      answer: '',
      regtime: unixtime(new Date),
      regip: data.ip || '',
      lastlogintime: 0,
      lastloginip: '',
      avatar: 'default.gif',
      area: ''
    }
    var sql = "INSERT INTO " + table + " (username,password,nickname,mood,allowtype,question,answer,regtime,regip,lastlogintime,lastloginip,avatar,area) VALUES (:username,:password,:nickname,:mood,:allowtype,:question,:answer,:regtime,:regip,:lastlogintime,:lastloginip,:avatar,:area)";
    db.query(sql, params, function(err, rows) {
      if (err) {
        deferred.reject(err);
      }
      deferred.resolve(rows);
    });
  } else {
    deferred.reject({
      msg: '参数错误'
    });
  }
  return deferred.promise;
}

User.prototype.update = function(data) {
  var deferred = Q.defer();
  if (data.password) {
    data.password = md5(data.password);
  }
  if (data[pk]) {
    var updateData = [];
    for (var i in data) {
      if (i != pk) {
        updateData.push(i + '=:' + i);
      }
    }
    updateData = updateData.join(',');
    var sql = "UPDATE " + table + " SET " + updateData + " WHERE " + pk + "=:" + pk;
    db.query(sql, data, function(err, rows) {
      if (err) {
        deferred.reject(err);
      }
      deferred.resolve(rows);
    });
  } else {
    deferred.reject({
      msg: '参数错误'
    });
  }
  return deferred.promise;
}

User.prototype.delete = function(data) {
  var deferred = Q.defer();
  if (data[pk]) {
    var sql = "DELETE FROM " + table + " WHERE " + pk + "=:" + pk;
    db.query(sql, data, function(err, rows) {
      if (err) {
        deferred.reject(err);
      }
      deferred.resolve(rows);
    });
  } else {
    deferred.reject({
      msg: '参数错误'
    });
  }
  return deferred.promise;
}

User.prototype.check = function(data) {
  var deferred = Q.defer();
  if (data.username && data.password) {
    var params = {
      username: data.username,
      password: md5(data.password)
    }
    var sql = 'SELECT uid,username FROM ' + table + ' WHERE username=:username AND password=:password';
    db.query(sql, params, function(err, rows) {
      if (err) {
        deferred.reject(err);
      }
      deferred.resolve(rows);
    });
  } else {
    deferred.reject({
      msg: '参数错误'
    });
  }
  return deferred.promise;
}

User.prototype.refresh = function(data) {
  var deferred = Q.defer();
  if (data.uid && data.ip) {
    var params = {
      uid: data.uid,
      lastlogintime: unixtime(new Date),
      lastloginip: data.ip
    }
    var sql = 'UPDATE ' + table + ' SET lastloginip=:lastloginip,lastlogintime=:lastlogintime WHERE uid=:uid';
    db.query(sql, params, function(err, rows) {
      if (err) {
        deferred.reject(err);
      }
      deferred.resolve(rows);
    });
  } else {
    deferred.reject({
      msg: '参数错误'
    });
  }
}
module.exports = new User();