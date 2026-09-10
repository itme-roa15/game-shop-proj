FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /workspace

COPY gradle ./gradle
COPY gradlew build.gradle.kts settings.gradle.kts ./
RUN chmod +x gradlew

COPY src ./src
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

RUN addgroup -S -g 10001 gameshop \
  && adduser -S -D -H -u 10001 -G gameshop gameshop

COPY --from=builder --chown=10001:10001 \
  /workspace/build/libs/*.jar ./app.jar

USER 10001:10001

EXPOSE 8080

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
