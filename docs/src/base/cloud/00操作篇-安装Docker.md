# 安装Docker

Docker 分为 CE 和 EE 两大版本。CE 即社区版（免费，支持周期 7 个月），EE 即企业版，强调安全，付费使用，支持周期 24 个月。

Docker CE 分为 `stable` `test` 和 `nightly` 三个更新频道。

官方网站上有各种环境下的 [安装指南](https://docs.docker.com/install/)，这里主要介绍 Docker CE 在 CentOS上的安装。



## CentOS安装Docker

Docker CE 支持 64 位版本 CentOS 7，并且要求内核版本不低于 3.10， CentOS 7 满足最低内核的要求，所以我们在CentOS 7安装Docker。

<br/>

### 卸载（可选）

如果之前安装过旧版本的Docker，可以使用下面命令卸载：

```sh
yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-selinux \
                  docker-engine-selinux \
                  docker-engine \
                  docker-ce
```

<br/>

### 安装Docker

首先需要大家虚拟机联网，安装yum工具

```sh
yum install -y yum-utils \
           device-mapper-persistent-data \
           lvm2 --skip-broken
```

<br/>

然后更新本地镜像源

```shell
yum-config-manager \
    --add-repo \
    https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
    
sed -i 's/download.docker.com/mirrors.aliyun.com\/docker-ce/g' /etc/yum.repos.d/docker-ce.repo
```

<br/>

创建元数据缓存，提升搜索安装 yum 速度

```sh
yum makecache fast
```

<br/>

然后输入命令：

```shell
yum install -y docker-ce
```

docker-ce 为社区免费版本。稍等片刻，docker即可安装成功。

<br/>

### 启动Docker

Docker应用需要用到各种端口，逐一去修改防火墙设置。非常麻烦，因此建议大家直接关闭防火墙！

启动docker前，一定要关闭防火墙后！！

启动docker前，一定要关闭防火墙后！！

启动docker前，一定要关闭防火墙后！！

```sh
# 关闭
systemctl stop firewalld
# 禁止开机启动防火墙
systemctl disable firewalld
# 查看防火墙状态
systemctl status firewalld
# 开机自启动
systemctl enable docker
```

<br/>

通过命令启动docker：

```sh
sudo systemctl start docker  # 启动docker服务
sudo systemctl stop docker  # 停止docker服务
sudo systemctl restart docker  # 重启docker服务
```

<br/>

然后输入命令，可以查看docker版本：

```sh
docker -v 
```

<br/>

### 配置镜像加速

docker官方镜像仓库网速较差，我们需要设置国内镜像服务：

参考阿里云的镜像加速文档：https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors

```sh
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://hwud7scp.mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

多个镜像源

```json
{
  "registry-mirrors": [
    "https://xx4bwyg2.mirror.aliyuncs.com",
    "http://f1361db2.m.daocloud.io",
    "https://registry.docker-cn.com",
    "http://hub-mirror.c.163.com",
    "https://docker.mirrors.ustc.edu.cn"
  ]
}
```

官方镜像源

```json
{
  "registry-mirrors": ["https://registry.docker-cn.com"]
}
```



## CentOS安装DockerCompose

### 下载

DockerCompose安装地址：https://github.com/docker/compose/releases

<br/>

Linux下需要通过命令下载：

```sh
# 安装
curl -L \
https://github.com/docker/compose/releases/download/1.23.1/docker-compose-`uname -s`-`uname -m` > \
/usr/local/bin/docker-compose
```

<br/>

如果下载速度较慢，或者下载失败，可以使用 `docker-compose` 文件，上传到`/usr/local/bin/`目录。

:::warning 注意： `docker-compose` 分为 `x86` 版本 和  `aarch64` 版本

:::

<br/>

### 修改文件权限

修改文件权限：

```sh
# 修改权限
chmod +x /usr/local/bin/docker-compose
```

<br/>

### Base自动补全命令

```sh
# 补全命令
curl -L \
https://raw.githubusercontent.com/docker/compose/1.29.1/contrib/completion/bash/docker-compose > \
/etc/bash_completion.d/docker-compose
```

<br/>

如果这里出现错误，需要修改自己的hosts文件：

```sh
echo "199.232.68.133 raw.githubusercontent.com" >> /etc/hosts
```

<br/>

查看是否安装成功

```sh
docker-compose --version
```



## Docker镜像仓库

搭建镜像仓库可以基于 `Docker` 官方提供的 `DockerRegistry` 来实现。

官网地址：https://hub.docker.com/_/registry

<br/>

### 简化版镜像仓库

Docker官方的Docker Registry是一个基础版本的Docker镜像仓库，具备仓库管理的完整功能，但是没有图形化界面。

搭建方式比较简单，命令如下：

```sh
docker run -d \
    --restart=always \
    --name registry	\
    -p 5000:5000 \
    -v /usr/local/src/docker-registry:/var/lib/registry \
    registry
```

<br/>

命令中挂载了一个数据卷registry-data到容器内的/var/lib/registry 目录，这是私有镜像库存放数据的目录。

可以查看当前私有镜像服务中包含的镜像访问：http://YourIp:5000/v2/_catalog

```json
{
    "repositories": []
}
```

<br/>

### 带有图形化界面版本

使用 `DockerCompose` 部署带有图象界面的 `DockerRegistry`

配置信息：`docker-registry-compose.yml`

```yaml
version: '3.2'

services:
  registry:
    image: registry
    volumes:
      - /usr/lcoal/src/docker-registry:/var/lib/registry
  ui:
    image: joxit/docker-registry-ui:1.5-static
    container_name: registry-ui
    ports:
      - 8080:80
    environment:
      - REGISTRY_TITLE=传智教育私有仓库
      - REGISTRY_URL=http://registry:5000
      - CATALOG_ELEMENTS_LIMIT="1000"
    depends_on:
      - registry
```

命令如下

```sh
docker-compose -f docker-registry-compose.yml up -d
```

<br/>

### 配置Docker信任地址

我们的私服采用的是http协议，默认不被Docker信任，所以需要做一个配置：

```sh
# 打开要修改的文件
vi /etc/docker/daemon.json
# 添加内容：
"insecure-registries":["http://ipadress:8080"]
# 重加载
systemctl daemon-reload
# 重启docker
systemctl restart docker
```

注意：ipadress为当前用于登录的ip地址

<br/>

### 推送、拉取镜像

推送镜像到私有镜像服务必须先tag，步骤如下：

重新tag本地镜像，名称前缀为私有仓库的地址：192.168.150.101:8080/

 ```sh
docker tag nginx:latest 192.168.150.101:8080/nginx:1.0 
 ```

<br/>

推送镜像

```sh
docker push 192.168.150.101:8080/nginx:1.0 
```

<br/>

拉取镜像

```sh
docker pull 192.168.150.101:8080/nginx:1.0 
```







