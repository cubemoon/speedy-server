'use strict';
var mysql = require('mysql'),
    config = speedy.config.mysql;

var pool = mysql.createPool({
  host: config.host,
  user: config.user,
  password: config.passwd,
  database: config.database
});

pool.config.connectionConfig.queryFormat = function(query, values) {
  if (!values) return query;
  return query.replace(/\:(\w+)/g, function(txt, key) {
    if (values.hasOwnProperty(key)) {
      return this.escape(values[key]);
    }
    return txt;
  }.bind(this));
};

module.exports = pool;