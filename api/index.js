'use strict';
module.exports = function(app) {
  var userRoutes = speedy.route.userRoutes,
      friendRoutes = speedy.route.friendRoutes,
      friendGroupRoutes = speedy.route.friendGroupRoutes,
      messageRoutes = speedy.route.messageRoutes;
      
  userRoutes(app);
  friendRoutes(app);
  friendGroupRoutes(app);
  messageRoutes(app);
}