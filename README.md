# SAOMDA NEWS SCRIPT
SAOMDA资讯脚本

## 使用方法
 1. 构建或导入已构建镜像
 2. 执行`yarn build`编译代码
 3. 创建并启动容器，将容器中`/app/dist`路径映射到编译的dist路径

> 注意：如果已经构建过镜像并且依赖项无变更，可不用重新构建镜像，只用更新代码。


## Puppeteer Docker 构建
```shell
docker build -t tsukirei/saomda-news .
```

## 启动容器
```shell
# 后台启动
docker container run -p 2396:2396 -v 本地代码路径:/app/dist -d --name=saomda-news --privileged -it tsukirei/saomda-news
# 进入docker并打开新的终端
docker exec -it saomda-news
# 进入docker
docker attach saomda-news
```

## 导出镜像
```shell
docker save tsukirei/saomda-news > docker_image/saomda-news.tar
```

## 导入镜像
```shell
docker load --input saomda-news.tar
```