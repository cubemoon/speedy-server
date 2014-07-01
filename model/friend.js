'use strict';
var db = speedy.lib.db,
    online = speedy.lib.online,
    _ = require('underscore'),
    Q = require('q');

var table = 'friend',
    pk = 'id';

function Friend() {

}

Friend.prototype.list = function(data) {
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
      if (rows != '') {
        var tmpuser = [];
        for (var i in rows) {
          tmpuser.push(rows[i]['fuid']);
        }
        online.check(tmpuser).then(function(result) {
          for (var k in result) {
            if (result[k] != null) {
              rows[k]['isonline'] = true;
            } else {
              rows[k]['isonline'] = false;
            }
          }
          deferred.resolve(rows);
        });
      } else {
        deferred.resolve(rows);
      }
    });
  } else {
    deferred.reject({
      msg: '参数错误'
    });
  }
  return deferred.promise;
}

Friend.prototype.add = function(data) {
  var deferred = Q.defer();
  if (data.uid && data.fuid) {
    var sql = "SELECT id FROM " + table + " WHERE uid=:uid and fuid=:fuid and ischeck=1";
    var tmpparams = {
      uid: data.fuid,
      fuid: data.uid
    }
    db.query(sql, tmpparams, function(err, rows) {
      if (!_.isEmpty(rows)) {
        data.ischeck=1;
      }
      var params = {
        uid: data.uid,
        fuid: data.fuid,
        fgid: data.fgid || 0,
        ischeck: data.ischeck || 0,
        remark: data.remark || '',
        apply: data.apply || '',
        reason: data.reason || ''
      }
      var sql = "INSERT INTO " + table + " (uid,fuid,fgid,ischeck,remark,apply,reason) VALUES (:uid,:fuid,:fgid,:ischeck,:remark,:apply,:reason)";
      db.query(sql, params, function(err, rows) {
        if (err) {
          deferred.reject(err);
        }
        //如果你是对方为审核的好友,将对方好友的状态改为已审核
        var newparams = {
          fuid: data.uid,
          uid: data.fuid
        }
        var sql = "UPDATE " + table + " SET ischeck=1 WHERE uid=:uid AND fuid=:fuid";
        db.query(sql, newparams, function() {});
        params.id = rows.insertId;
        deferred.resolve(params);
      });
    });
  } else {
    deferred.reject({
      msg: '参数错误'
    });
  }
  return deferred.promise;
}

Friend.prototype.update = function(data) {
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

Friend.prototype.delete = function(data) {
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

Friend.prototype.reject = function(data) {
  var deferred = Q.defer();
  if (data.uid && data.fuid) {
    var sql = "DELETE FROM " + table + " WHERE uid=:uid AND fuid=:fuid AND ischeck=0";
    var params = {
      uid: data.uid,
      fuid: data.fuid
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

Friend.prototype.move = function(uid, from, to) {
  var deferred = Q.defer();
  if (!_.isUndefined(uid) && !_.isUndefined(from)) {
    var data = {};
    data['uid'] = uid;
    data['from'] = from;
    data['to'] = to || 0;
    var sql = "UPDATE " + table + " SET fgid=:to WHERE fgid=:from and uid=:uid";
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

module.exports = new Friend();