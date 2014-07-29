'use strict';
var db = speedy.lib.db,
    unixtime = speedy.lib.tools.unixtime,
    util = require('util'),
    Q = require('q');

var table = 'message',
    pk = 'id';

function Message() {

}

Message.prototype.add = function(data) {
  var deferred = Q.defer();
  if (data.key && data.toid && data.fromid && data.content) {
    var params = {
      keyid: data.key,
      toid: data.toid,
      fromid: data.fromid,
      createtime: unixtime(new Date),
      isread: 0,
      content: data.content
    }
    var sql = "INSERT INTO " + table + " (keyid,toid,fromid,createtime,isread,content) VALUES (:keyid,:toid,:fromid,:createtime,:isread,:content)";
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

Message.prototype.read = function(data) {
  var deferred = Q.defer();
  if (data[pk]) {
    var sql = "UPDATE " + table + " SET isread=1 WHERE " + pk + "=:" + pk;
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

Message.prototype.getOffline = function(data) {
  var deferred = Q.defer();
  if (data.uid) {
    var params = {
      toid: data.uid
    }
    var sql = "SELECT * FROM " + table + " WHERE toid=:toid AND isread=0";
    db.query(sql, params, function(err, rows) {
      if (err) {
        deferred.reject(err);
      }
      for (var i in rows) {
        rows[i]['data'] = JSON.parse(rows[i]['content']);
        rows[i]['to'] = rows[i]['toid'];
        rows[i]['from'] = rows[i]['fromid'];
        rows[i]['key'] = rows[i]['keyid'];
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

//获取聊天记录
Message.prototype.getLog = function(data) {
  var deferred = Q.defer();
  if (data['toid'] && data['fromid']) {
    var params = {
      toid: data['toid'],
      fromid: data['fromid'],
      limit: data['limit'] || 10
    }
    var sql = "SELECT * FROM " + table + " WHERE ((toid=:toid AND fromid=:fromid) OR (toid=:fromid AND fromid=:toid)) ORDER BY createtime DESC LIMIT " + params.limit;
    db.query(sql, params, function(err, rows) {
      if (err) {
        deferred.reject(err);
      }
      var retrunData = [];
      for (var i in rows) {
        retrunData[i] = {};
        retrunData[i]['id'] = rows[i]['id'];
        retrunData[i]['createtime'] = rows[i]['createtime'];
        retrunData[i]['isread'] = rows[i]['isread'];
        retrunData[i]['data'] = JSON.parse(rows[i]['content']);
        retrunData[i]['to'] = rows[i]['toid'];
        retrunData[i]['from'] = rows[i]['fromid'];
        retrunData[i]['key'] = rows[i]['keyid'];
      }
      deferred.resolve(retrunData);
    });
  } else {
    deferred.reject({
      msg: '参数错误'
    });
  }
  return deferred.promise;
}

//获取聊天记录
Message.prototype.getLogCount = function(data) {
  var deferred = Q.defer();
  if (data['toid'] && data['fromid']) {
    var params = {
      toid: data['toid'],
      fromid: data['fromid']
    }
    var sql = "SELECT count(id) as count FROM " + table + " WHERE ((toid=:toid AND fromid=:fromid) OR (toid=:fromid AND fromid=:toid))";
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


module.exports = new Message();