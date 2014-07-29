'use strict';
//定义公共常量
global.DIR_ROOT = __dirname;

//注册全局变量
global.speedy = {};
speedy.userAuth={};
speedy.lib={};
speedy.model={};
speedy.route={};
speedy.config = require(DIR_ROOT + '/config.json');
speedy.routes = require(DIR_ROOT + '/api');
speedy.lib.db = require(DIR_ROOT + '/lib/db');
speedy.lib.tools = require(DIR_ROOT + '/lib/tools');
speedy.lib.online = require(DIR_ROOT + '/lib/online_user');
speedy.lib.auth = require(DIR_ROOT + '/lib/auth');
speedy.model.messageModel = require(DIR_ROOT + '/model/message');
speedy.model.friendModel = require(DIR_ROOT + '/model/friend');
speedy.model.friendGroupModel = require(DIR_ROOT + '/model/friend_group');
speedy.model.userModel = require(DIR_ROOT + '/model/user');
speedy.route.userRoutes = require(DIR_ROOT + '/api/user');
speedy.route.friendRoutes = require(DIR_ROOT + '/api/friend');
speedy.route.friendGroupRoutes = require(DIR_ROOT + '/api/friend_group');
speedy.route.messageRoutes = require(DIR_ROOT + '/api/message');

var express = require('express'),
    http = require('http'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    favicon = require('static-favicon'),
    morgan  = require('morgan'),
    methodOverride = require('method-override'),
    multipart = require('connect-multiparty'),
    cookie = require('express/node_modules/cookie');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(favicon());
app.use(express.static(path.join(__dirname, '/client')));
app.use(express.static(path.join(__dirname, '/avatar')));
app.use(morgan('dev'));
app.use(multipart());
app.use(bodyParser({
  uploadDir: DIR_ROOT + '/tmp'
}));
app.use(methodOverride());
app.use(cookieParser());
//CORS设置
app.use(function(req, res, next) {
  var oneof = false;
  if (req.headers.origin) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    oneof = true;
  }
  if (req.headers['access-control-request-method']) {
    res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
    oneof = true;
  }
  if (req.headers['access-control-request-headers']) {
    res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
    oneof = true;
  }
  if (oneof) {
    res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
  }
  // intercept OPTIONS method
  if (oneof && req.method == 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
});
app.use(function(req, res, next) {
  //登录验证
  if (!((req.url == '/user/login' || req.url == '/user') && req.method == 'POST') && !(req.url.substr(0, 4) == '/lib')) {
    var auth = speedy.lib.auth;
    var token = req.headers.authorization || '';
    speedy.userAuth = auth.checkToken(token);
    if (!speedy.userAuth.uid) {
      res.status(401);
      res.json();
      return false;
    }
  }
  next();
});

var server = http.createServer(app),
    sio = require('socket.io'),
    io = sio(server);

server.listen(app.get('port'), function() {
  console.log("speedy server listening on port " + app.get('port'));
});

var redis = require('socket.io-redis');
io.adapter(redis({
  host: speedy.config.redis.host,
  port: speedy.config.redis.port
}));

io.sockets.on('connection', function(socket) {
  var socketUser = {};
  //用户登录socket
  socket.on('login', function(data) {
    speedy.lib.online.set(data.uid, socket.id);
    //获取好友列表
    speedy.model.friendModel.list({
      uid: data.uid
    }).then(function(result) {
      var tmpuser = [];
      for (var i in result) {
        tmpuser.push(result[i]['fuid']);
      }
      return speedy.lib.online.getList(tmpuser);
    }).then(function(result) {
      //获取在线好友的socketid
      var newData = [];
      for (var i in result) {
        if (result[i] != null) {
          result[i] = JSON.parse(result[i]);
          for (var k in result[i]) {
            newData.push(result[i][k]);
          }
        }
      }
      //向在线好友广播用户上线
      for (var i in newData) {
        io.sockets.connected[newData[i]].emit('online', data.uid);
      }
    }).catch(function(err) {
      deferred.reject(err);
    });
    socketUser = data;
    speedy.model.messageModel.getOffline({
      uid: socketUser.uid
    }).then(function(result) {
      for (var i in result) {
        socket.emit('msg', result[i]);
      }
    }).
    catch (function(err) {
      console.log(err);
    });
    speedy.model.friendModel.getOfflineApply(socketUser.uid).then(function(result) {
      for (var i in result) {
        result[i]['type']='checkfriend';
        socket.emit('addfriendapply', result[i]);
      }
    });
    speedy.model.friendModel.getOfflineReply(socketUser.uid).then(function(result) {
      for (var i in result) {
        result[i]['type'] = 'replyfriendapply';
        socket.emit('replyfriendapply', result[i]);
      }
    });
  });

  //客户端回执,更新消息为已读
  socket.on('receipt', function(id) {
    speedy.model.messageModel.read({
      id: id
    });
  });

  //接收用户私聊信息
  socket.on('msg', function(data, fn) {
    var nowtime = speedy.lib.tools.unixtime(new Date);
    data.createtime = nowtime;
    data.key = speedy.lib.tools.md5(data.to + '|' + data.from);
    var dbSaveData = {
      toid: data.to,
      fromid: data.from,
      key: data.key,
      content: JSON.stringify(data.data)
    }
    speedy.model.messageModel.add(dbSaveData).then(function(result) {
      speedy.lib.online.get(data['to']).then(function(user) {
        data.id = result.insertId;
        fn(data);
        //向用户发送私聊信息
        for (var i in user) {
          io.sockets.connected[user[i]].emit('msg', data);
        }
      });
    }).
    catch (function(err) {
      console.log(err);
    });
  });

  //好友申请
  socket.on('addfriendapply', function(data) {
    data['type']='checkfriend';
    speedy.lib.online.get(data['toid']).then(function(user) {
      //向用户发送私聊信息
      for (var i in user) {
        io.sockets.connected[user[i]].emit('addfriendapply', data);
      }
    });
  });

  //回复好友申请
  socket.on('replyfriendapply', function(data) {
    data['type']='replyfriendapply';
    speedy.lib.online.get(data['toid']).then(function(user) {
      //向用户发送私聊信息
      for (var i in user) {
        io.sockets.connected[user[i]].emit('replyfriendapply', data);
      }
    });
  });

  //用户退出
  socket.on('logout', function() {
    speedy.lib.online.clear(socketUser.uid, socket.id);
    //获取好友列表
    speedy.model.friendModel.list({
      uid: socketUser.uid
    }).then(function(result) {
      var tmpuser = [];
      for (var i in result) {
        tmpuser.push(result[i]['fuid']);
      }
      return speedy.lib.online.getList(tmpuser);
    }).then(function(result) {
      //获取在线好友的socketid
      var newData = [];
      for (var i in result) {
        if (result[i] != null) {
          result[i] = JSON.parse(result[i]);
          for (var k in result[i]) {
            newData.push(result[i][k]);
          }
        }
      }
      //向在线好友广播用户下线
      for (var i in newData) {
        io.sockets.connected[newData[i]].emit('offline', socketUser.uid);
      }
    }).catch(function(err) {
      deferred.reject(err);
    });
  });

  //用户断开socket
  socket.on('disconnect', function() {
    if (typeof(socketUser) != 'undefined') {
      speedy.lib.online.clear(socketUser.uid, socket.id);
      //获取好友列表
      speedy.model.friendModel.list({
        uid: socketUser.uid
      }).then(function(result) {
        var tmpuser = [];
        for (var i in result) {
          tmpuser.push(result[i]['fuid']);
        }
        return speedy.lib.online.getList(tmpuser);
      }).then(function(result) {
        //获取在线好友的socketid
        var newData = [];
        for (var i in result) {
          if (result[i] != null) {
            result[i] = JSON.parse(result[i]);
            for (var k in result[i]) {
              newData.push(result[i][k]);
            }
          }
        }
        //向在线好友广播用户下线
        for (var i in newData) {
          io.sockets.connected[newData[i]].emit('offline', socketUser.uid);
        }
      }).catch(function(err) {
        deferred.reject(err);
      });
    }
  });

});

speedy.routes(app);