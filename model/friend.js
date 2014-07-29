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
    var params = {
      uid: data.uid,
      fuid: data.fuid,
      fgid: data.fgid || 0,
      remark: data.remark || '',
    }

    var sql = "INSERT INTO " + table + " (uid,fuid,fgid,remark) VALUES (:uid,:fuid,:fgid,:remark)";
    db.query(sql, params, function(err, rows) {
      if (err) {
        deferred.reject(err);
      }
      params.id = rows.insertId;
      deferred.resolve(params);
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
  if (data.fromid && data.toid) {
    var sql = "INSERT INTO addfriendreply (fromid,toid,acceptted) VALUES (:fromid,:toid,:acceptted)";
    var params = {
      fromid: data.toid,
      toid: data.fromid,
      acceptted: 0
    }
    db.query(sql, params, function(err, rows) {
      if (err) {
        deferred.reject(err);
      }
      var sql = "DELETE FROM addfriend WHERE fromid=:fromid AND toid=:toid";
      var params = {
        fromid: data.fromid,
        toid: data.toid
      }
      db.query(sql, params, function(err, rows) {
        if (err) {
          deferred.reject(err);
        }
        deferred.resolve(rows);
      });
    });
  } else {
    deferred.reject({
      msg: '参数错误'
    });
  }
  return deferred.promise;
}

Friend.prototype.acceptted = function(data) {
  var deferred = Q.defer();
  if (data.fromid && data.toid) {
    var sql = "INSERT INTO addfriendreply (fromid,toid,acceptted) VALUES (:fromid,:toid,:acceptted)";
    var params = {
      fromid: data.toid,
      toid: data.fromid,
      acceptted: 1
    }
    db.query(sql, params, function(err, rows) {
      if (err) {
        deferred.reject(err);
      }
      var sql = "DELETE FROM addfriend WHERE fromid=:fromid AND toid=:toid";
      var params = {
        fromid: data.fromid,
        toid: data.toid
      }
      db.query(sql, params, function(err, rows) {
        if (err) {
          deferred.reject(err);
        }
        deferred.resolve(rows);
      });
    });
  } else {
    deferred.reject({
      msg: '参数错误'
    });
  }
  return deferred.promise;
}


Friend.prototype.ignore = function(data) {
  var deferred = Q.defer();
  if (data.fromid && data.toid) {
    var sql = "DELETE FROM addfriend WHERE fromid=:fromid AND toid=:toid";
    var params = {
      fromid: data.fromid,
      toid: data.toid
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

Friend.prototype.checkReply = function(data) {
  var deferred = Q.defer();
  if (data.fromid && data.toid) {
    var sql = "DELETE FROM addfriendreply WHERE fromid=:fromid AND toid=:toid";
    var params = {
      fromid: data.fromid,
      toid: data.toid
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


Friend.prototype.apply = function(data) {
  var deferred = Q.defer();
  if (data.fromid && data.toid) {
    var sql = "INSERT INTO addfriend (fromid,toid,content) VALUES (:fromid,:toid,:content)";
    var params = {
      fromid: data.fromid,
      toid: data.toid,
      content: data.content || ''
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

Friend.prototype.getOfflineApply = function(uid) {
  var deferred = Q.defer();
  if (!_.isUndefined(uid)) {
    var sql = "SELECT * FROM addfriend WHERE toid=:uid";
    var params = {
      uid: uid
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

Friend.prototype.getOfflineReply = function(uid) {
  var deferred = Q.defer();
  if (!_.isUndefined(uid)) {
    var sql = "SELECT * FROM addfriendreply WHERE toid=:uid";
    var params = {
      uid: uid
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
module.exports = new Friend();