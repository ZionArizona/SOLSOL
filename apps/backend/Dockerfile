# 단계 1: Gradle 프로젝트 빌드 (테스트 제외)
FROM gradle:jdk17 AS builder

WORKDIR /home/gradle/src

# 빌드 캐시 최적화를 위해 gradle 스크립트/래퍼 먼저 복사
COPY build.gradle settings.gradle gradlew ./
COPY gradle ./gradle

RUN chmod +x ./gradlew || true

# 의존성 사전 다운로드 (캐시 활용)
RUN ./gradlew dependencies -x test --no-daemon || true

# 실제 소스 복사 후 빌드
COPY . .
RUN ./gradlew clean build -x test --no-daemon

# 단계 2: 런타임 이미지
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 빌드 산출물 JAR 복사
COPY --from=builder /home/gradle/src/build/libs/*.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
