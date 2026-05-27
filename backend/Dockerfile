FROM maven:3.8.6-openjdk-11 AS builder

WORKDIR /app

COPY pom.xml ./

COPY src ./src

RUN mvn clean package -DskipTests


FROM eclipse-temurin:11-jre-jammy

WORKDIR /app

COPY --from=builder /app/target/employee-management-app-0.0.1-SNAPSHOT.jar app.jar

# Create otel directory
RUN mkdir /otel

# Download OpenTelemetry Java Agent
ADD https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar /otel/opentelemetry-javaagent.jar

EXPOSE 8080

ENTRYPOINT ["java", \
"-javaagent:/otel/opentelemetry-javaagent.jar", \
"-Dotel.service.name=employee-backend", \
"-Dotel.exporter.otlp.endpoint=http://otel-collector-opentelemetry-collector.observability.svc.cluster.local:4318", \
"-Dotel.exporter.otlp.protocol=http/protobuf", \
"-jar", \
"app.jar"]