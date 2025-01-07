# 使用 Node.js 的官方镜像作为基础镜像
FROM m.daocloud.io/library/debian:10

ENV TZ=Asia/Shanghai
# 设置工作目录
WORKDIR /app

RUN apt-get update && \
apt-get upgrade -y && \
apt-get install -y curl && \
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash && \
source ~/.bashrc && \
nvm install 20.8.1 && \
npm install -g cnpm --registry=https://registry.npmmirror.com && \
npm config set registry https://registry.npmmirror.com && \
npm install -g @serverless-devs/s

# 复制项目文件到容器中
COPY . /app


# 设置容器启动时执行的命令

# 安装 Serverless Devs CLI
# RUN npm config set registry https://registry.npmmirror.com
# RUN npm install -g @serverless-devs/s

# 暴露必要的端口（根据实际需求配置）
# EXPOSE 3000

CMD ["/bin/bash"]