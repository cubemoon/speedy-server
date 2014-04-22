-- ----------------------------
-- Table structure for friend
-- ----------------------------
DROP TABLE IF EXISTS `friend`;
CREATE TABLE `friend` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `uid` int(11) NOT NULL COMMENT '用户ID',
  `fuid` int(11) NOT NULL COMMENT '好友用户ID',
  `fgid` int(11) NOT NULL COMMENT '好友分组ID',
  `ischeck` int(11) NOT NULL COMMENT '好友状态',
  `remark` varchar(250) COLLATE utf8_unicode_ci NOT NULL COMMENT '备注',
  `apply` text COLLATE utf8_unicode_ci NOT NULL COMMENT '申请信息',
  `reason` text COLLATE utf8_unicode_ci NOT NULL COMMENT '拒绝理由',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uid_2` (`uid`,`fuid`) USING BTREE,
  KEY `uid` (`uid`) USING BTREE,
  KEY `fuid` (`fuid`) USING BTREE,
  KEY `fgid` (`fgid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='好友表';

-- ----------------------------
-- Table structure for friendgroup
-- ----------------------------
DROP TABLE IF EXISTS `friendgroup`;
CREATE TABLE `friendgroup` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` int(11) NOT NULL,
  `name` varchar(250) COLLATE utf8_unicode_ci NOT NULL COMMENT '分组名称',
  PRIMARY KEY (`id`),
  KEY `uid` (`uid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='好友分组表';

-- ----------------------------
-- Table structure for groupmessage
-- ----------------------------
DROP TABLE IF EXISTS `groupmessage`;
CREATE TABLE `groupmessage` (
  `gid` int(11) NOT NULL COMMENT '群ID',
  `fromuid` int(11) NOT NULL COMMENT '发送人ID',
  `createtime` int(10) NOT NULL COMMENT '发送时间',
  `content` text COLLATE utf8_unicode_ci NOT NULL COMMENT '消息内容',
  PRIMARY KEY (`gid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='群消息表';

-- ----------------------------
-- Table structure for groups
-- ----------------------------
DROP TABLE IF EXISTS `groups`;
CREATE TABLE `groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(250) COLLATE utf8_unicode_ci NOT NULL COMMENT '群名称',
  `description` varchar(250) COLLATE utf8_unicode_ci NOT NULL COMMENT '群描述',
  `type` tinyint(2) NOT NULL COMMENT '群类型',
  `admin` varchar(250) COLLATE utf8_unicode_ci NOT NULL COMMENT '群管理员',
  `createuser` int(11) NOT NULL COMMENT '群创建者',
  `allowtype` tinyint(1) NOT NULL COMMENT '允许加入的验证类型',
  `question` text COLLATE utf8_unicode_ci NOT NULL COMMENT '验证问题',
  `answer` text COLLATE utf8_unicode_ci NOT NULL COMMENT '验证答案',
  `count` int(11) NOT NULL COMMENT '群人数',
  `createtime` int(10) NOT NULL COMMENT '创建时间',
  `notice` text COLLATE utf8_unicode_ci NOT NULL COMMENT '群公告',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='群表';

-- ----------------------------
-- Table structure for groupuser
-- ----------------------------
DROP TABLE IF EXISTS `groupuser`;
CREATE TABLE `groupuser` (
  `gid` int(11) NOT NULL COMMENT '群ID',
  `uid` int(11) NOT NULL COMMENT '用户ID',
  `cname` varchar(250) COLLATE utf8_unicode_ci NOT NULL COMMENT '群名片',
  `msgtype` tinyint(1) NOT NULL COMMENT '消息提示类型',
  PRIMARY KEY (`gid`),
  UNIQUE KEY `uid` (`uid`,`gid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='群用户表';

-- ----------------------------
-- Table structure for message
-- ----------------------------
DROP TABLE IF EXISTS `message`;
CREATE TABLE `message` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `keyid` varchar(255) COLLATE utf8_unicode_ci NOT NULL COMMENT '标识一对用户消息的唯一键值',
  `toid` int(11) NOT NULL COMMENT '接收用户ID',
  `fromid` int(11) NOT NULL COMMENT '发送用户ID',
  `type` tinyint(1) NOT NULL COMMENT '消息类型',
  `createtime` int(10) NOT NULL COMMENT '发送时间',
  `isread` tinyint(1) NOT NULL COMMENT '是否已读',
  `content` text COLLATE utf8_unicode_ci NOT NULL COMMENT '消息内容',
  PRIMARY KEY (`id`),
  KEY `touid` (`toid`) USING BTREE,
  KEY `fromuid` (`fromid`) USING BTREE,
  KEY `createtime` (`createtime`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='消息表';

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `uid` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(250) COLLATE utf8_unicode_ci NOT NULL COMMENT '用户名',
  `password` varchar(250) COLLATE utf8_unicode_ci NOT NULL COMMENT '用户密码',
  `nickname` varchar(250) COLLATE utf8_unicode_ci NOT NULL COMMENT '昵称',
  `mood` text COLLATE utf8_unicode_ci NOT NULL COMMENT '用户描述(心情)',
  `allowtype` tinyint(1) NOT NULL DEFAULT '1' COMMENT '允许加为好友的验证类型',
  `question` text COLLATE utf8_unicode_ci NOT NULL COMMENT '验证问题',
  `answer` text COLLATE utf8_unicode_ci NOT NULL COMMENT '验证答案',
  `regtime` int(10) NOT NULL COMMENT '注册时间',
  `regip` char(15) COLLATE utf8_unicode_ci NOT NULL COMMENT '注册IP',
  `lastlogintime` int(10) NOT NULL COMMENT '最后登录时间',
  `lastloginip` char(15) COLLATE utf8_unicode_ci NOT NULL COMMENT '最后登录IP',
  `avatar` varchar(250) COLLATE utf8_unicode_ci NOT NULL COMMENT '头像地址',
  `area` varchar(255) COLLATE utf8_unicode_ci NOT NULL COMMENT '地区',
  PRIMARY KEY (`uid`),
  UNIQUE KEY `username` (`username`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='用户表';
