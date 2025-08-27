# 단계 1: Expo 웹 정적 빌드
FROM node:18 AS builder

WORKDIR /app

# 패키지 설치는 lockfile 기반 권장
COPY package.json package-lock.json ./
RUN npm ci

# 소스 복사 후 빌드
COPY . .
RUN npx expo export --platform web

# 단계 2: Nginx로 정적 서빙 (+ SPA 라우팅)
FROM nginx:alpine

# 커스텀 Nginx 설정 복사 (SPA try_files 처리)
COPY ./nginx/user.conf /etc/nginx/conf.d/default.conf

# 정적 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
