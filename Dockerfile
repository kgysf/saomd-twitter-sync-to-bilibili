FROM alpine:edge

# 安装Chromium、Chromium依赖以及nodejs和yarn
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      freetype-dev \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn \
      screen

# 告诉Puppeteer跳过Chromium安装，使用已安装的Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# 切换到工作目录
WORKDIR /app

# 安装Puppeteer
RUN yarn add puppeteer@3.1.0

# COPY package.json 到工作目录
COPY package.json /app/package.json
COPY LICENSE /app/LICENSE

# 安装依赖缓存当前环境，加快后续构建速度
RUN yarn install

# 使用非root用户启动Chromium，以便跳过 --no-sandbox
RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app \
    && chmod -R 777 /app

# 切换到pptruser
USER pptruser

EXPOSE 2396

CMD ["node", "./dist/main.js"]
