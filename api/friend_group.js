'use strict';
module.exports = function(app) {
  var friendGroupModel = speedy.model.friendGroupModel,
      friendModel = speedy.model.friendModel,
      _ = require('underscore');

  /**
   * @api {get} /friendGroup/:uid 获取好友分组列表
   * @apiName 获取好友分组列表
   * @apiGroup 好友分组类
   * @apiVersion 0.0.1
   * @apiPermission user
   *
   * @apiParam {Number} :uid 用户ID
   * 
   * @apiSuccess {Number} id 记录ID
   * @apiSuccess {Number} uid 用户ID
   * @apiSuccess {String} name 分组名
   *
   * @apiSuccessExample Success-Response:
   *   HTTP/1.1 200 OK
   *   [
   *     {
   *       "id": 42,
   *       "uid": 13,
   *       "name": "我的同事"
   *     }
   *     ......
   *   ]
   *
   */
  app.get('/friendGroup/:uid', function(req, res) {
    if (req.params.uid != speedy.userAuth.uid) {
      res.status(403);
      res.json();
      return;
    }
    var data = {
      uid: req.params.uid
    }
    friendGroupModel.list(data).then(function(result) {
      if (result != '') {
        res.json(result);
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
   * @api {post} /friendGroup 添加分组
   * @apiName 添加分组
   * @apiGroup 好友分组类
   * @apiVersion 0.0.1
   * @apiPermission user
   *
   * @apiParam {Number} uid 用户ID
   * @apiParam {String} name 分组名
   * 
   * @apiSuccess {Number} id 记录ID
   *
   * @apiSuccessExample Success-Response:
   *   HTTP/1.1 200 OK
   *   {
   *     "id": 45
   *   }
   *
   */
  app.post('/friendGroup', function(req, res) {
    if (req.body.id) {
      console.log('参数错误');
      res.status(400);
      res.json();
      return;
    }
    if (_.isUndefined(req.body.uid) || _.isUndefined(req.body.name)) {
      res.status(400);
      res.json();
      return;
    }
    if (req.body.uid != speedy.userAuth.uid) {
      res.status(403);
      res.json();
      return;
    }
    var data = {
      uid: req.body.uid,
      name: req.body.name
    }
    friendGroupModel.add(data).then(function(result) {
      res.json({
        id: result.insertId
      });
    }).
    catch (function(err) {
      console.log(err);
      res.status(500);
      res.json();
    });
  });

  /**
   * @api {put} /friendGroup/:id 更改分组
   * @apiName 更改分组
   * @apiGroup 好友分组类
   * @apiVersion 0.0.1
   * @apiPermission user
   *
   * @apiParam {Number} :id 记录ID
   * @apiParam {String} name 分组名
   * 
   * @apiSuccess {Number} id 记录ID
   * @apiSuccess {Number} uid 用户ID
   * @apiSuccess {String} name 分组名
   *
   * @apiSuccessExample Success-Response:
   *   HTTP/1.1 200 OK
   *   {
   *     "id": 472
   *     "uid": 13
   *     "name": "test"
   *   }
   *
   */
  app.put('/friendGroup/:id', function(req, res) {
    if (_.isUndefined(req.body.name)) {
      res.status(400);
      res.json();
      return;
    }
    var data = {
      id: req.params.id,
      uid: speedy.userAuth.uid,
      name: req.body.name
    }
    friendGroupModel.update(data).then(function(result) {
      if (result.changedRows > 0) {
        res.json(data);
      } else {
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
   * @api {delete} /friendGroup/:id 删除分组
   * @apiName 删除分组
   * @apiGroup 好友分组类
   * @apiVersion 0.0.1
   * @apiPermission user
   *
   * @apiParam {Number} :id 记录ID
   * 
   * @apiSuccessExample Success-Response:
   *   HTTP/1.1 200 OK
   *
   */
  app.delete('/friendGroup/:id', function(req, res) {
    var data = {
      id: req.params.id,
      uid: speedy.userAuth.uid
    }
    friendGroupModel.delete(data).then(function(result) {
      if (result.affectedRows > 0) {
        friendModel.move(data.uid, data.id);
        res.json();
      } else {
        res.status(400);
        res.json();
      }
    }).
    catch(function(err) {
      console.log(err);
      res.status(500);
      res.json();
    });
  });
}