'use strict';
module.exports = function(app) {
  var friendModel = speedy.model.friendModel,
      userModel = speedy.model.userModel,
      _ = require('underscore');

  /**
   * @api {get} /friend/:uid 获取好友列表
   * @apiName 获取好友列表
   * @apiGroup 好友类
   * @apiVersion 0.0.1
   * @apiPermission user
   *
   * @apiParam {Number} :uid 用户ID
   * 
   * @apiSuccess {Number} id 记录ID
   * @apiSuccess {Number} uid 用户ID
   * @apiSuccess {Number} fuid 好友用户ID
   * @apiSuccess {Number} fgid 好友分组ID
   * @apiSuccess {Number} ischeck 是否已审核通过
   * @apiSuccess {String} remark 备注名
   * @apiSuccess {String} apply 好友申请理由
   * @apiSuccess {String} reason 好友拒绝了理由
   * @apiSuccess {Number} isonline 是否在线
   *
   * @apiSuccessExample Success-Response:
   *   HTTP/1.1 200 OK
   *   [
   *     {
   *       "id": 472,
   *       "uid": 13,
   *       "fuid": 16,
   *       "fgid": 0,
   *       "ischeck": 1,
   *       "remark": "加贤",
   *       "apply": "333",
   *       "reason": "",
   *       "isonline": false
   *     }
   *     ......
   *   ]
   *
   */
  app.get('/friend/:uid', function(req, res) {
    if (req.params.uid != speedy.userAuth.uid) {
      res.status(403);
      res.json();
      return;
    }
    var data = {
      uid: req.params.uid
    }
    friendModel.list(data).then(function(data) {
      if (data != '') {
        res.json(data);
      } else {
        res.json([]);
      }
    }).
    catch (function(err) {
      console.log(err);
      res.status(500);
      res.json();
    });
  });

  /**
   * @api {post} /friend 添加好友
   * @apiName 添加好友
   * @apiGroup 好友类
   * @apiVersion 0.0.1
   * @apiPermission user
   *
   * @apiParam {Number} uid 用户ID
   * @apiParam {Number} fuid 好友用户ID
   * @apiParam {Number} fgid 好友分组ID(默认为0)
   * @apiParam {String} remark 备注名
   * 
   * @apiSuccess {Number} id 记录ID
   * @apiSuccess {Number} uid 用户ID
   * @apiSuccess {Number} fuid 好友用户ID
   * @apiSuccess {Number} fgid 好友分组ID
   * @apiSuccess {String} remark 备注名
   *
   * @apiSuccessExample Success-Response:
   *   HTTP/1.1 200 OK
   *   {
   *     "id": 472
   *     "uid": 13,
   *     "fuid": 16,
   *     "fgid": 0,
   *     "remark": "加贤",
   *   }
   *
   */
  app.post('/friend', function(req, res) {
    if (!_.isUndefined(req.body.id)) {
      console.log('参数错误');
      res.status(400);
      res.json();
      return;
    }
    if(_.isUndefined(req.body.uid) || _.isUndefined(req.body.fuid)){
      res.status(400);
      res.json();
      return;
    }
    if(req.body.uid != speedy.userAuth.uid){
      res.status(403);
      res.json();
      return;
    }
    friendModel.add(req.body).then(function(result) {
      res.json(result);
    }).
    catch (function(err) {
      console.log(err);
      res.status(500);
      res.json();
    });
  });

  /**
   * @api {put} /friend/:id 更改好友
   * @apiName 更改好友
   * @apiGroup 好友类
   * @apiVersion 0.0.1
   * @apiPermission user
   *
   * @apiParam {Number} :id 记录ID
   * @apiParam {Number} fgid 好友分组ID(可选)
   * @apiParam {Number} ischeck 是否已审核通过(可选)
   * @apiParam {String} remark 备注名(可选)
   * 
   * @apiSuccess {Number} id 记录ID
   * @apiSuccess {Number} uid 用户ID
   * @apiSuccess {mixed} 更多 变更的字段
   *
   * @apiSuccessExample Success-Response:
   *   HTTP/1.1 200 OK
   *   {
   *     "id": 472
   *     "uid": 13
   *     ......
   *   }
   *
   */
  app.put('/friend/:id', function(req, res) {
    var data = {};
    data.id = req.params.id;
    data.uid = speedy.userAuth.uid;
    if (req.body.fgid >= 0) {
      data.fgid = req.body.fgid;
    }
    if (req.body.ischeck) {
      data.ischeck = req.body.ischeck;
    }
    if (req.body.remark) {
      data.remark = req.body.remark;
    }
    friendModel.update(data).then(function(result) {
      if (result.changedRows > 0) {
        res.json(data);
      } else {
        res.status(400);
        res.json();
      }
    }).
    catch (function() {
      console.log(err);
      res.status(500);
      res.json();
    });
  });


  /**
   * @api {delete} /friend/:id 删除好友
   * @apiName 删除好友
   * @apiGroup 好友类
   * @apiVersion 0.0.1
   * @apiPermission user
   *
   * @apiParam {Number} :id 记录ID
   * 
   * @apiSuccessExample Success-Response:
   *   HTTP/1.1 200 OK
   *
   */
  app.delete('/friend/:id', function(req, res) {
    var data = {
      id: req.params.id,
      uid: speedy.userAuth.uid
    }
    friendModel.delete(data).then(function(result) {
      if(result.affectedRows > 0){
        res.json();
      }else{
        res.status(400);
        res.json();
      }
    }).
    catch (function(err) {
      console.log(err);
      res.status(500);
      res.json();
    });
  });

  /**
   * @api {post} /friend/reject 拒绝好友
   * @apiName 拒绝好友
   * @apiGroup 好友类
   * @apiVersion 0.0.1
   * @apiPermission user
   *
   * @apiParam {Number} fromid 原发起人ID
   * @apiParam {Number} fuid 原接收人ID
   * 
   * @apiSuccessExample Success-Response:
   *   HTTP/1.1 200 OK
   *
   */
  app.post('/friend/reject', function(req, res) {
    if (_.isUndefined(req.body.fromid) || _.isUndefined(req.body.toid)) {
      res.status(400);
      res.json();
      return;
    }
    if (req.body.toid != speedy.userAuth.uid) {
      res.status(403);
      res.json();
      return;
    }
    var data = {
      fromid: req.body.fromid,
      toid: req.body.toid
    }
    friendModel.reject(data).then(function(result) {
      res.json(data);
    }).
    catch (function(err) {
      console.log(err);
    });
  });

 /**
   * @api {post} /friend/acceptted 同意好友
   * @apiName 同意好友
   * @apiGroup 好友类
   * @apiVersion 0.0.1
   * @apiPermission user
   *
   * @apiParam {Number} fromid 原发起人ID
   * @apiParam {Number} fuid 原接收人ID
   * 
   * @apiSuccessExample Success-Response:
   *   HTTP/1.1 200 OK
   *
   */
  app.post('/friend/acceptted', function(req, res) {
    if (_.isUndefined(req.body.fromid) || _.isUndefined(req.body.toid)) {
      res.status(400);
      res.json();
      return;
    }
    if (req.body.toid != speedy.userAuth.uid) {
      res.status(403);
      res.json();
      return;
    }
    var data = {
      fromid: req.body.fromid,
      toid: req.body.toid
    }
    friendModel.acceptted(data).then(function(result) {
      res.json(data);
    }).
    catch (function(err) {
      console.log(err);
    });
  });

  /**
   * @api {get} /friend/allow/:uid 获取添加好友的类型
   * @apiName 获取添加好友的类型
   * @apiGroup 好友类
   * @apiVersion 0.0.1
   * @apiPermission user
   *
   * @apiParam {Number} uid 用户ID
   *
   * @apiSuccessExample Success-Response:
   *   HTTP/1.1 200 OK
   *
   */
  app.get('/friend/allow/:uid', function(req, res) {
    userModel.get({
      uid: req.params.uid
    }).then(function(result) {
      if (_.isEmpty(result)) {
        res.status(404);
        res.json();
        return;
      }
      if (result[0]['allowtype'] == 1) {
        res.status(200);
        res.json();
        return;
      }
      if (result[0]['allowtype'] == 2) {
        res.status(403);
        res.json();
        return;
      }
      if (result[0]['allowtype'] == 3) {
        res.status(412);
        res.json();
        return;
      }
    });
  });

  /**
   * @api {post} /friend/ignore 忽略好友申请
   * @apiName 忽略好友申请
   * @apiGroup 好友类
   * @apiVersion 0.0.1
   * @apiPermission user
   *
   * @apiParam {Number} fromid 原发起人ID
   * @apiParam {Number} toid 原接收人ID
   * 
   *
   * @apiSuccessExample Success-Response:
   *   HTTP/1.1 200 OK
   *
   */
  app.post('/friend/ignore', function(req, res) {
    if (_.isUndefined(req.body.fromid) || _.isUndefined(req.body.toid)) {
      res.status(400);
      res.json();
      return;
    }
    if (req.body.toid != speedy.userAuth.uid) {
      res.status(403);
      res.json();
      return;
    }
    var data = {
      fromid: req.body.fromid,
      toid: req.body.toid
    }
    friendModel.ignore(data).then(function(){
      res.json();
    });
  });

  /**
   * @api {post} /friend/apply 添加好友申请
   * @apiName 添加好友申请
   * @apiGroup 好友类
   * @apiVersion 0.0.1
   * @apiPermission user
   *
   * @apiParam {Number} fromid 发起人ID
   * @apiParam {Number} toid   接收人ID
   * @apiParam {String} content 附加内容  
   * 
   *
   * @apiSuccessExample Success-Response:
   *   HTTP/1.1 200 OK
   *
   */
  app.post('/friend/apply', function(req, res) {
    if (_.isUndefined(req.body.fromid) || _.isUndefined(req.body.toid)) {
      res.status(400);
      res.json();
      return;
    }
    if (req.body.fromid != speedy.userAuth.uid) {
      res.status(403);
      res.json();
      return;
    }
    var data = {
      fromid: req.body.fromid,
      toid: req.body.toid,
      content: req.body.content
    }
    friendModel.apply(data).then(function(result) {
      res.json(data);
    }).
    catch(function(err) {
      res.status(412);
      res.json();
      console.log(err);
    });
  });

  /**
   * @api {post} /friend/checkReply 确认收到好友申请回复
   * @apiName 确认收到好友申请回复
   * @apiGroup 好友类
   * @apiVersion 0.0.1
   * @apiPermission user
   *
   * @apiParam {Number} fromid 原发起人ID
   * @apiParam {Number} fuid 原接收人ID
   * 
   * @apiSuccessExample Success-Response:
   *   HTTP/1.1 200 OK
   *
   */
  app.post('/friend/checkReply', function(req, res) {
    if (_.isUndefined(req.body.fromid) || _.isUndefined(req.body.toid)) {
      res.status(400);
      res.json();
      return;
    }
    if (req.body.toid != speedy.userAuth.uid) {
      res.status(403);
      res.json();
      return;
    }
    var data = {
      fromid: req.body.fromid,
      toid: req.body.toid
    }
    friendModel.checkReply(data).then(function(result) {
      res.json(data);
    }).
    catch (function(err) {
      console.log(err);
    });
  });
}