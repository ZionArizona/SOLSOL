# 단계 1: Expo 웹 정적 빌드
FROM node:22.12-alpine AS builder

WORKDIR /app
ENV EXPO_NO_TELEMETRY=1

# 네트워크 불안정 대비: 재시도/타임아웃 설정
ENV NPM_CONFIG_FETCH_RETRIES=5 \
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000 \
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000 \
    NPM_CONFIG_FETCH_TIMEOUT=600000 \
    NPM_CONFIG_CONNECT_TIMEOUT=120000

# lockfile 기반 설치 + BuildKit 캐시 활용
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --progress=false

# 소스 복사 후 빌드
COPY . .
# 산출물 디렉터리를 명시 -> dist
RUN npx --yes expo export --platform web --output-dir dist

# 단계 2: Nginx로 정적 서빙 (+ SPA 라우팅)
FROM nginx:alpine

# 커스텀 Nginx 설정 복사 (SPA try_files 처리)
COPY ./nginx/user.conf /etc/nginx/conf.d/default.conf

# 정적 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
