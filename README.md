# SAOMDA NEWS SCRIPT
同步saomd官方推文到bilibili，本项目使用AGPL3.0开源协议。

## 使用方法
 1. 构建或导入已构建镜像
 2. 执行`yarn build`编译代码
 3. 创建并启动容器，将容器中`/app/dist`路径映射到编译的dist路径

> 注意：如果已经构建过镜像并且依赖项无变更，可不用重新构建镜像，只用更新代码。  
> 容器只是构建运行环境，防止部分环境安装不上。  

第一次启动会需要登录bilibili，当控制台提示服务器已启动后访问`127.0.0.1:2396`即可显示二维码，扫描二维码登录。
以及需要自己申请百度翻译api并且配置好api key


## Puppeteer Docker 构建
```shell
docker build -t saomda-news .
```

## 启动容器
```shell
# 后台启动
docker container run -p 2396:2396 -v 本地代码路径:/app/dist -d --name=saomda-news --privileged -it saomda-news
# 进入docker并打开新的终端
docker exec -it saomda-news
# 进入docker
docker attach saomda-news
```

## 导出镜像
```shell
docker save saomda-news > docker_image/saomda-news.tar
```

## 导入镜像
```shell
docker load --input saomda-news.tar
```
