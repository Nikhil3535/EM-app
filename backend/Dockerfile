FROM maven:3.8.6-openjdk-11 AS builder

WORKDIR /app

COPY pom.xml ./
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn package -DskipTests


FROM eclipse-temurin:11-jre-jammy

WORKDIR /app

COPY --from=builder /app/target/employee-management-app-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENV MYSQL_HOST=database-1.chaq4ig4g031.us-east-2.rds.amazonaws.com
ENV MYSQL_PORT=3306
ENV MYSQL_DB=employee_management
ENV MYSQL_USER=admin
ENV MYSQL_PASSWORD=Anirudh123
ENV JWT_SECRET=mySuperSecretKey12345

ENTRYPOINT ["java", "-jar", "app.jar"]