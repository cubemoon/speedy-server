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
speedy.lib.online = require(DIR_ROOT + '/lib/online_user');
speedy.lib.tools = require(DIR_ROOT + '/lib/tools');
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
    io = sio.listen(server),
    RedisStore = require('socket.io/lib/stores/redis'),
    redis = require('socket.io/node_modules/redis'),
    pub = redis.createClient(speedy.config.redis.port, speedy.config.redis.host),
    sub = redis.createClient(speedy.config.redis.port, speedy.config.redis.host),
    client = redis.createClient(speedy.config.redis.port, speedy.config.redis.host);

server.listen(app.get('port'), function() {
  console.log("speedy server listening on port " + app.get('port'));
});

//socket.io 配置
io.configure(function() {
  io.set('store', new RedisStore({
    redisPub: pub,
    redisSub: sub,
    redisClient: client
  }));
  io.set('authorization', function(handshakeData, callback) {
    if (handshakeData.headers.cookie) {
      handshakeData.cookies = cookie.parse(decodeURIComponent(handshakeData.headers.cookie));
      return callback(null, true);
    }
    return callback(null, true);
  });
});

io.sockets.on('connection', function(socket) {
  //验证用户cookie
  if (socket.handshake.cookies) {
    var auth = new speedy.lib.Auth(socket.handshake);
    var socketUser = auth.get();
  }

  //用户登录socket
  socket.on('login', function(data) {
    speedy.lib.online.set(data.uid, socket.id).then(function(result) {
      //向在线好友广播用户上线
      for (var i in result) {
        io.sockets.socket(result[i]).emit('online', data.uid);
      }
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
    data.key = speedy.lib.tools.md5(data.to + '|' + data.from + '|' + data.type);
    var dbSaveData = {
      toid: data.to,
      fromid: data.from,
      type: data.type,
      key: data.key,
      content: JSON.stringify(data.data)
    }

    speedy.model.messageModel.add(dbSaveData).then(function(result) {
      speedy.lib.online.get(data['to']).then(function(user) {
        data.id = result.insertId;
        fn(data);
        //向用户发送私聊信息
        for (var i in user) {
          io.sockets.socket(user[i]).emit('msg', data);
        }
      });
    }).
    catch (function(err) {
      console.log(err);
    });
  });

  //用户退出
  socket.on('logout', function() {
    speedy.lib.online.clear(socketUser.uid, socket.id).then(function(result) {
      //向在线好友广播用户离线
      for (var i in result) {
        io.sockets.socket(result[i]).emit('offline', socketUser.uid);
      }
    });
  });

  //用户断开socket
  socket.on('disconnect', function() {
    if (typeof(socketUser) != 'undefined') {
      speedy.lib.online.clear(socketUser.uid, socket.id).then(function(result) {
        //向在线好友广播用户离线
        for (var i in result) {
          io.sockets.socket(result[i]).emit('offline', socketUser.uid);
        }
      });
    }
  });

  //webrtc部分
  socket.on('rtc_offer', function(data) {
    io.sockets.socket(data.socketId).emit('rtc_receiveOffer', {
      "sdp": data.sdp,
      "socketId": socket.id
    });
  });

  socket.on('rtc_offer_ice_candidate', function(data) {
    io.sockets.socket(data.socketId).emit('rtc_receiveOfferIce', {
      "ice": data.ice,
      "socketId": socket.id
    });
  });

  socket.on('rtc_answer', function(data) {
    io.sockets.socket(data.socketId).emit('rtc_receiveAnswer', {
      "sdp": data.sdp,
      "socketId": socket.id
    });
  });

  socket.on('rtc_answer_ice_candidate', function(data) {
    io.sockets.socket(data.socketId).emit('rtc_receiveAnswerIce', {
      "ice": data.ice,
      "socketId": socket.id
    });
  });

  socket.on('rtc_file_transfer', function(data, fn) {
    var eventName;
    data.key = speedy.lib.tools.md5(data.to + '|' + data.from + '|' + data.type);
    data.fromsocketid = socket.id;
    speedy.lib.online.get(data.to).then(function(user) {
      for (var i in user) {
        switch (data.action) {
          case 'ask':
            eventName = 'rtc_file_transfer_receiveAsk';
            break;
          case 'accept':
            eventName = 'rtc_file_transfer_receiveAccept';
            break;
          case 'refuse':
            eventName = 'rtc_file_transfer_receiveRefuse';
            break;
          case 'chunk':
            eventName = 'rtc_file_transfer_receiveChunk';
            break;
          case 'close':
            eventName = 'rtc_file_transfer_receiveClose';
            break;
          default:
            console.log('not action');
        }
        if (eventName) {
          fn(data);
          io.sockets.socket(user[i]).emit(eventName, data);
        }
      }
    });
  });

});

speedy.routes(app);