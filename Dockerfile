FROM py310-cmake316-cuda11.3:ubuntu20

# 设置为非交互式模式
ENV DEBIAN_FRONTEND=noninteractive

# 更新软件包并安装依赖（curl 用于获取 Node.js 安装脚本）
RUN sed -i 's|http://archive.ubuntu.com/ubuntu/|https://mirrors.tuna.tsinghua.edu.cn/ubuntu/|g' /etc/apt/sources.list
RUN apt-get update && apt-get install -y nodejs npm

# 可选：设置工作目录或其他配置
WORKDIR /app

CMD ["/bin/bash"]
