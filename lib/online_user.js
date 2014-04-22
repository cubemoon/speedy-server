'use strict';
var config = speedy.config,
    tools = speedy.lib.tools,
    friendModel = speedy.model.friendModel,
    redis = require('socket.io/node_modules/redis'),
    redisClient = redis.createClient(config.redis.port, config.redis.host),
    _ = require('underscore'),
    Q = require('q');

var online = [];

function Online() {}

Online.prototype.set = function(uid, socketid) {
  var deferred = Q.defer();
  if (!online[uid]) {
    online[uid] = {};
    //获取好友列表
    friendModel.list({
      uid: uid
    }).then(function(result) {
      var deferred = Q.defer();
      var tmpuser = [];
      for (var i in result) {
        tmpuser.push(result[i]['fuid']);
      }
      //从好友中取出在线好友
      redisClient.mget(tmpuser, function(err, data) {
        if (err) {
          deferred.reject(err);
        }
        deferred.resolve(data);
      });
      return deferred.promise;
    }).then(function(data) {
      //获取在线好友的socketid
      var newData = [];
      for (var i in data) {
        if (data[i] != null) {
          data[i] = JSON.parse(data[i]);
          for (var k in data[i]) {
            newData.push(data[i][k]);
          }
        }
      }
      deferred.resolve(newData);
    }).
    catch (function(err) {
      deferred.reject(err);
    });
  } else {
    deferred.resolve([null]);
  }
  online[uid][socketid] = socketid;
  redisClient.set(uid, JSON.stringify(online[uid]));
  return deferred.promise;
}

Online.prototype.get = function(uid) {
  var deferred = Q.defer();
  redisClient.get(uid, function(err, data) {
    if (!err) {
      deferred.resolve(JSON.parse(data));
    } else {
      deferred.reject(err);
    }
  });
  return deferred.promise;
}

Online.prototype.clear = function(uid, socketid) {
  var deferred = Q.defer();
  if (online[uid]) {
    delete online[uid][socketid];
    if (!_.isEmpty(online[uid])) {
      redisClient.set(uid, JSON.stringify(online[uid]));
      deferred.resolve([null]);
    } else {
      //用户退出
      redisClient.del(uid);
      delete online[uid];
      //获取好友列表
      friendModel.list({
        uid: uid
      }).then(function(result) {
        var deferred = Q.defer();
        var tmpuser = [];
        for (var i in result) {
          tmpuser.push(result[i]['fuid']);
        }
        //从好友中取出在线好友
        redisClient.mget(tmpuser, function(err, data) {
          if (err) {
            deferred.reject(err);
          }
          deferred.resolve(data);
        });
        return deferred.promise;
      }).then(function(data) {
        //获取在线好友的socketid
        var newData = [];
        for (var i in data) {
          if (data[i] != null) {
            data[i] = JSON.parse(data[i]);
            for (var k in data[i]) {
              newData.push(data[i][k]);
            }
          }
        }
        deferred.resolve(newData);
      }).
      catch (function(err) {
        deferred.reject(err);
      });
    }
  } else {
    deferred.resolve([null]);
  }
  return deferred.promise;
}

//检查用户是否在线
Online.prototype.check = function(data) {
  var deferred = Q.defer();
  redisClient.mget(data, function(err, result) {
    if (err) {
      deferred.reject(err);
    }
    deferred.resolve(result);
  });
  return deferred.promise;
}

module.exports = new Online;