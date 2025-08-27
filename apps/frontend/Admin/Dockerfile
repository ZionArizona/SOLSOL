# 단계 1: Vite 기반 Admin 빌드
FROM node:18 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
ENV NODE_ENV=production
RUN npm ci

COPY . .
RUN npm run build

# 단계 2: Nginx로 정적 서빙 (+ SPA 라우팅)
FROM nginx:alpine

# 커스텀 Nginx 설정 복사 (SPA try_files 처리)
COPY nginx.admin.conf /etc/nginx/conf.d/default.conf

# 정적 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
