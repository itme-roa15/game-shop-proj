FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /workspace

COPY gradle ./gradle
COPY gradlew build.gradle.kts settings.gradle.kts ./
RUN chmod +x gradlew

COPY src ./src
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

RUN addgroup -S gameshop && adduser -S gameshop -G gameshop

COPY --from=builder --chown=gameshop:gameshop /workspace/build/libs/*.jar ./app.jar

USER gameshop
EXPOSE 8080

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
