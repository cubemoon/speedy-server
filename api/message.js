'use strict';
module.exports = function(app) {
  var messageModel = speedy.model.messageModel,
      _ = require('underscore');

  /**
   * @api {get} /message/count/:fromid/:toid/:type 获取消息统计
   * @apiName 获取消息统计
   * @apiGroup 消息类
   * @apiVersion 0.0.1
   * @apiPermission user
   *
   * @apiParam {Number} :fromid 发送者ID
   * @apiParam {Number} :toid 接收者ID
   * @apiParam {Number} :type 消息类型
   *
   * @apiSuccess {Number} count 消息条数
   *
   * @apiSuccessExample Success-Response:
   *   HTTP/1.1 200 OK  
   *   {
   *     "count": 201
   *   }
   *     
   */
  app.get('/message/count/:fromid/:toid/:type', function(req, res) {
    if (req.params.fromid != speedy.userAuth.uid && req.params.toid != speedy.userAuth.uid) {
      res.status(403);
      res.json();
      return;
    }
    var data = {
      fromid: req.params.fromid,
      toid: req.params.toid,
      type: req.params.type
    }
    messageModel.getLogCount(req.params).then(function(data) {
      res.json(data);
    }).
    catch (function(err) {
      console.log(err);
      res.status(500);
      res.json();
    });
  });

  /**
   * @api {get} /message 获取消息
   * @apiName 获取消息
   * @apiGroup 消息类
   * @apiVersion 0.0.1
   * @apiPermission user
   *
   * @apiParam {Number} fromid 发送者ID
   * @apiParam {Number} toid 接收者ID
   * @apiParam {Number} type 消息类型
   * @apiParam {String} limit 数据分段参数,例:limit 0,15(默认为0,10)(可选)
   * 
   * @apiSuccess {Number} id 消息ID
   * @apiSuccess {Number} type 消息类型
   * @apiSuccess {Number} createtime 创建时间
   * @apiSuccess {Number} isread 是否已读
   * @apiSuccess {Number} from 发送者ID
   * @apiSuccess {Number} to 接收者ID
   * @apiSuccess {String} key 消息key值(同一对用户会话会有相同的key,根据from,to,type字段生成)
   * @apiSuccess {Object} data 消息内容
   *
   * @apiSuccessExample Success-Response:
   *   HTTP/1.1 200 OK  
   *   [
   *     {
   *       "id": 1012,
   *       "type": 1,
   *       "createtime": 1395741052,
   *       "isread": 1,
   *       "data": {
   *         "msg": "你好",
   *         "fromuserdata": {
   *           "uid": 13,
   *           "username": "root",
   *           "nickname": "兔子",
   *           "mood": "今天好心情",
   *           "allowtype": 1,
   *           "question": "haha",
   *           "answer": "lala",
   *           "regtime": 0,
   *           "regip": "",
   *           "lastlogintime": 0,
   *           "lastloginip": "",
   *           "avatar": "57931a1eb6e3c29b849af741dc19b095.jpg",
   *           "area": "河南 郑州"
   *         }
   *       },
   *       "to": 16,
   *       "from": 13,
   *       "key": "5d70c954703728df3ad79d0292275218"
   *     }
   *   ]
   *     
   */
  app.get('/message', function(req, res) {
    if (req.query.fromid != speedy.userAuth.uid && req.query.toid != speedy.userAuth.uid) {
      res.status(403);
      res.json();
      return;
    }
    if (_.isUndefined(req.query.limit)) {
      req.query.limit = '0,15';
    }
    var data = {
      fromid: req.query.fromid,
      toid: req.query.toid,
      type: req.query.type,
      limit: req.query.limit
    }
    messageModel.getLog(data).then(function(result) {
      if (!_.isEmpty(result)) {
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
}