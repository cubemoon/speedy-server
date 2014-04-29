'use strict';
module.exports = function(app) {
  var userModel = speedy.model.userModel,
      auth = speedy.lib.auth,
      md5 = speedy.lib.tools.md5,
      unixtime = speedy.lib.tools.unixtime,
      _ = require('underscore'),
      fs = require('fs'),
      path = require('path');

  /**
   * @api {post} /user/login 登录
   * @apiName 登录
   * @apiGroup 用户类
   * @apiVersion 0.0.1
   * @apiPermission none
   *
   * @apiParam {String} username 用户名
   * @apiParam {String} password 用户密码
   *
   * @apiSuccess {Number} uid 用户ID
   * @apiSuccess {String} token 授权码
   *
   * @apiSuccessExample Success-Response:
   *   HTTP/1.1 200 OK
   *   {
   *     "uid":"1",
   *     "token":"44edMrEL8MMBJwb8A0xj32VDbx/zYSVwbPCgko/nVwuFAB5fIpzPul88OMrnO9M"
   *   }
   *
   */
  app.post('/user/login', function(req, res) {
    var data = req.body;
    userModel.check(data).then(function(result) {
      if (!_.isEmpty(result)) {
        result = result[0];
        try {
          var token = auth.getToken(result);
          //更新用户最后登录状态
          userModel.refresh({
            ip: req.ip,
            uid: result.uid
          });
          res.json({
            uid: result.uid,
            token: token
          });
        } catch (err) {
          console.error(err);
          res.status(500);
          res.json();
        }
      } else {
        res.status(401);
        res.json();
      }
    }).
    catch (function(err) {
      console.error(err);
      res.status(500);
      res.json();
    });
  });

  /**
   * @api {get} /user/status 获取用户状态
   * @apiName 获取用户状态
   * @apiGroup 用户类
   * @apiVersion 0.0.1
   * @apiPermission user
   *
   * @apiSuccess {Number} uid 用户ID
   * @apiSuccess {String} username 用户名
   * @apiSuccess {String} logintime 登录时间
   *
   * @apiSuccessExample Success-Response:
   *   HTTP/1.1 200 OK
   * {
   *   "uid": "1",
   *   "username": "user",
   *   "logintime": "passwd"
   * }
   *
   */
  app.get('/user/status', function(req, res) {
    if (speedy.userAuth) {
      res.json(speedy.userAuth);
    } else {
      res.status(401);
      res.json();
    }
  });

  /**
   * @api {get} /user/:uid 获取指定用户
   * @apiName 获取指定用户
   * @apiGroup 用户类
   * @apiVersion 0.0.1
   * @apiPermission user
   *
   * @apiParam {Number} :uid 用户ID
   *
   * @apiSuccess {Number} uid 用户ID
   * @apiSuccess {String} username 用户名
   * @apiSuccess {String} nickname 用户昵称
   * @apiSuccess {String} mood 用户心情
   * @apiSuccess {Number} allowtype 允许将其加为好友的验证类型
   * @apiSuccess {String} question 验证问题
   * @apiSuccess {String} answer 验证回答
   * @apiSuccess {String} regtime 注册时间
   * @apiSuccess {String} regip 注册IP
   * @apiSuccess {String} lastlogintime 最后登录时间
   * @apiSuccess {String} lastloginip 最后登录IP
   * @apiSuccess {String} avatar 用户头像地址
   * @apiSuccess {String} area 用户所在地区
   *
   * @apiSuccessExample Success-Response:
   *   HTTP/1.1 200 OK  
   *   {
   *     "uid": 13,
   *     "username": "root",
   *     "nickname": "兔子",
   *     "mood": "今天好心情",
   *     "allowtype": 1,
   *     "question": "haha",
   *     "answer": "lala",
   *     "regtime": 1382837732,
   *     "regip": "127.0.0.1",
   *     "lastlogintime": 1382837732,
   *     "lastloginip": "127.0.0.1",
   *     "avatar": "57931a1eb6e3c29b849af741dc19b095.jpg",
   *     "area": "河南 郑州"
   *   }
   *
   */
  app.get('/user/:uid', function(req, res) {
    var data = {
      uid: req.params.uid
    }
    userModel.get(data).then(function(result) {
      if (!_.isEmpty(result)) {
        delete result[0].password;
        res.json(result[0]);
      } else {
        res.status(404);
        res.json();
      }
    }).
    catch (function(err) {
      console.error(err);
      res.status(500);
      res.json();
    });
  });
  
  /**
   * @api {get} /user 获取用户列表
   * @apiName 获取用户列表
   * @apiGroup 用户类
   * @apiVersion 0.0.1
   * @apiPermission user
   *
   * @apiParam {String} uids 用户ID,多个uid用逗号分隔,如13,14,15,....
   * @apiParam {String} limit 数据分段参数,例:limit 0,15(如存在uids,本参数无效)
   * @apiParam {String} friend 是否包含好友(默认为"true",如存在uids,本参数无效,本字段为String类型只接收"true"|"false",其他值一律视为false)
   *
   * @apiSuccess {Number} uid 用户ID
   * @apiSuccess {String} username 用户名
   * @apiSuccess {String} nickname 用户昵称
   * @apiSuccess {String} mood 用户心情
   * @apiSuccess {Number} allowtype 允许将其加为好友的验证类型
   * @apiSuccess {String} question 验证问题
   * @apiSuccess {String} answer 验证回答
   * @apiSuccess {String} regtime 注册时间
   * @apiSuccess {String} regip 注册IP
   * @apiSuccess {String} lastlogintime 最后登录时间
   * @apiSuccess {String} lastloginip 最后登录IP
   * @apiSuccess {String} avatar 用户头像地址
   * @apiSuccess {String} area 用户所在地区
   *
   * @apiSuccessExample Success-Response:
   *   HTTP/1.1 200 OK  
   *   [
   *     {
   *       "uid": 13,
   *       "username": "root",
   *       "nickname": "兔子",
   *       "mood": "今天好心情",
   *       "allowtype": 1,
   *       "question": "haha",
   *       "answer": "lala",
   *       "regtime": 1382837732,
   *       "regip": "127.0.0.1",
   *       "lastlogintime": 1382837732,
   *       "lastloginip": "127.0.0.1",
   *       "avatar": "57931a1eb6e3c29b849af741dc19b095.jpg",
   *       "area": "河南 郑州"
   *     }
   *     ......
   *   ]
   */
  app.get('/user', function(req, res) {
    if (req.query.uids) {
      var data = {
        uids: req.query.uids
      };
      userModel.getList(data).then(function(result) {
        res.json(result);
      }).
      catch (function(err) {
        console.error(err);
        res.status(500);
        res.json();
      });
    } else {
      if (_.isUndefined(req.query.friend)) {
        req.query.friend = "true";
      } else {
        if (req.query.friend != "true" && req.query.friend != "false") {
          req.query.friend = "false";
        }
      }
      userModel.getList({}, req.query.limit, req.query.friend).then(function(data) {
        res.json(data);
      }).
      catch (function(err) {
        console.error(err);
        res.status(500);
        res.json();
      });
    }
  });
  
  /**
   * @api {put} /user/:uid/nickname 更改昵称
   * @apiName 更改昵称
   * @apiGroup 用户类
   * @apiVersion 0.0.1
   * @apiPermission user
   *
   * @apiParam {Number} :uid 用户ID
   * @apiParam {String} nickname 用户昵称
   *
   * @apiSuccess {Number} uid 用户ID
   * @apiSuccess {String} nickname 用户昵称
   *
   * @apiSuccessExample Success-Response:
   *   HTTP/1.1 200 OK  
   *   {
   *     "uid": 13,
   *     "nickname": "兔子",
   *   }
   *
   */
  app.put('/user/:uid/nickname', function(req, res) {
    if (_.isUndefined(req.body.nickname)) {
      console.error('参数错误');
      res.status(400);
      res.json();
      return;
    }
    if (speedy.userAuth.uid != req.params.uid) {
      res.status(403);
      res.json();
      return;
    }
    var data = {
      uid: req.params.uid,
      nickname: req.body.nickname
    }
    userModel.update(data).then(function(result) {
      res.json(data);
    }).
    catch (function(err) {
      console.error(err);
      res.status(500);
      res.json();
    });
  });

  /**
   * @api {post} /user/:uid/avatar 上传头像
   * @apiName 上传头像
   * @apiGroup 用户类
   * @apiVersion 0.0.1
   * @apiPermission user
   *
   * @apiParam {Number} :uid 用户ID
   * @apiParam {Object} file 表单文件对象
   *
   * @apiSuccess {String} path 头像地址
   *
   * @apiSuccessExample Success-Response:
   *   HTTP/1.1 200 OK  
   *   {
   *     path: "a049da063b26904d7aa7e1621d10f93b.jpg"
   *   }
   *
   */
  app.post('/user/:uid/avatar', function(req, res, next) {
    if (speedy.userAuth.uid != req.params.uid) {
      res.status(403);
      res.json();
      return;
    }
    var time = unixtime(new Date()).toString();
    // 获得文件的临时路径
    var tmpPath = req.files.file.path;
    // 指定文件上传后的目录 - 示例为"images"目录。 
    var dbSavePath = md5(speedy.userAuth.uid + time) + path.extname(req.files.file.name);
    var targetPath = DIR_ROOT + '/avatar/' + dbSavePath;

    // 移动文件
    fs.rename(tmpPath, targetPath, function(err) {
      if (err) throw err;
      // 删除临时文件夹文件, 
      fs.unlink(tmpPath, function() {
        if (err) throw err;
      });
      var data = {
        uid: speedy.userAuth.uid,
        avatar: dbSavePath
      }
      userModel.update(data).then(function(data) {
        res.json({
          path: dbSavePath
        });
      }).
      catch (function(err) {
        console.error(err);
        res.status(500);
        res.json();
      });
    });
  });
}