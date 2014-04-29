## 错误状态码

* 400 参数错误
* 401 用户未登录
* 403 没有操作该资源的权限
* 404 资源未找到
* 500 服务器内部错误

## 权限验证  

所有需要用户权限的接口必须在header中携带token  
token从登录借口获取  
header中Authorization格式:  
Authorization:Bearer token