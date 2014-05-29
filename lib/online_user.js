'use strict';
var config = speedy.config,
    tools = speedy.lib.tools,
    redis = require('socket.io/node_modules/redis'),
    redisClient = redis.createClient(config.redis.port, config.redis.host),
    _ = require('underscore'),
    Q = require('q');

var online = [];

function Online() {}

Online.prototype.set = function(uid, socketid) {
  if (!online[uid]) {
    online[uid] = {};
  }
  online[uid][socketid] = socketid;
  redisClient.set(uid, JSON.stringify(online[uid]));
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

Online.prototype.getList = function(uids) {
  var deferred = Q.defer();
  redisClient.mget(uids, function(err, data) {
    if (err) {
      deferred.reject(err);
    }
    deferred.resolve(data);
  });
  return deferred.promise;
}

Online.prototype.clear = function(uid, socketid) {
  if (online[uid]) {
    delete online[uid][socketid];
    if (!_.isEmpty(online[uid])) {
      redisClient.set(uid, JSON.stringify(online[uid]));
    } else {
      //用户退出
      redisClient.del(uid);
      delete online[uid];
    }
  }
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