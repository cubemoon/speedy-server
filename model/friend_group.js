'use strict';
var db = speedy.lib.db,
    util = require('util'),
    Q = require('q');
    
var table = 'friendgroup',
    pk = 'id';

function FriendGroup() {

}

FriendGroup.prototype.list = function(data) {
  var deferred = Q.defer();
  if (data['uid']) {
    var sql = "SELECT * FROM " + table + " WHERE uid=:uid";
    var params = {
      uid: data['uid']
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

FriendGroup.prototype.add = function(data) {
  var deferred = Q.defer();
  if (data.uid && data.name) {
    var params = {
      uid: data.uid,
      name: data.name
    }
    var sql = "INSERT INTO " + table + " (uid,name) VALUES (:uid,:name)";
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

FriendGroup.prototype.update = function(data) {
  var deferred = Q.defer();
  if (data[pk]) {
    var updateData = [];
    for (var i in data) {
      if (i != pk) {
        updateData.push(i + '=:' + i);
      }
    }
    updateData = updateData.join(',');
    var sql = "UPDATE " + table + " SET " + updateData + " WHERE " + pk + "=:" + pk + " and uid=:uid";
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

FriendGroup.prototype.delete = function(data) {
  var deferred = Q.defer();
  if (data[pk]) {
    var sql = "DELETE FROM " + table + " WHERE " + pk + "=:" + pk + " and uid=:uid";
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

module.exports = new FriendGroup();