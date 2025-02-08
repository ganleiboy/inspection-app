@ganlei,20250207
部署步骤
将项目代码上传至服务器
假设服务器 IP 为 192.168.169.12，将整个“点检表系统”目录上传至服务器上合适的目录中。
安装 Docker 与 docker-compose
请根据服务器系统安装 Docker 及 docker-compose。
构建并启动容器
在项目根目录下执行：
docker-compose up --build -d
这将根据 Dockerfile.backend 与 Dockerfile.frontend 构建后端和前端镜像，并启动容器。
访问系统
后端 API 地址：http://192.168.169.12:8000
前端页面地址：http://192.168.169.12:3000
由于服务器防火墙限制仅能访问中国国内网站，后端在构建时已指定 pip 安装时使用清华源。
其他注意事项
生产环境中请妥善设置 JWT 的 SECRET_KEY。
可根据需要预先导入“数据采集点检表模板.html”中的检查项目数据到数据库中，或由管理员通过“点检项目管理”接口添加。
前端中登录接口、数据提交等均通过后端 API 实现，请确保前后台服务的网络互通。

如果代码有修改需要重新编译，需要先运行：docker-compose down
再运行：docker-compose up --build -d