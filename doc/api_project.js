define({
  "name": "speedy-server",
  "version": "0.0.1",
  "apidoc": "<h2 id=\"-\">错误状态码</h2>\n<ul>\n<li>400 参数错误</li>\n<li>401 用户未登录</li>\n<li>403 没有操作该资源的权限</li>\n<li>404 资源未找到</li>\n<li>500 服务器内部错误</li>\n</ul>\n<h2 id=\"-\">权限验证</h2>\n<p>所有需要用户权限的接口必须在header中携带token<br>token从登录借口获取<br>header中Authorization格式:<br>Authorization:Bearer token</p>\n",
  "generator": {
    "version": "0.4.2",
    "time": "2014-07-29T00:46:21.521Z"
  }
});