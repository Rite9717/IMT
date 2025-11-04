# 📨 IMS — Integrated Mail System (demo)

[![Java](https://img.shields.io/badge/Java-21-blue?logo=java&logoColor=white)](https://adoptium.net/)
[![Maven](https://img.shields.io/badge/Build-Maven-orange?logo=apachemaven&logoColor=white)](https://maven.apache.org/)
[![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)](./front)

A compact demo mail system with a Spring Boot backend and a React frontend.

## 📁 Project layout

- 🧩 `demo/` — Java Spring Boot backend (Maven, contains `pom.xml`, `mvnw`).
- 🖥️ `front/` — React frontend (contains `package.json`, `src/`).
- 📝 Other legacy artifacts and Tomcat distribution are present at repo root.

## 🚀 Quick start

Prerequisites
- Java 21 (LTS) installed and active (see "Java 21" section below).
- Maven (optional — wrapper `mvnw` provided) for backend.
- Node.js and npm/yarn for frontend.

Backend (Spring Boot)

1. Open a terminal and go to the backend folder:

```bash
cd demo
# Use the Maven wrapper to build and run
./mvnw clean package spring-boot:run
```

The backend runs on the port configured in `demo/src/main/resources/application.properties` (default Spring Boot port 8080 unless overridden).

Frontend (React)

1. Open another terminal and go to the frontend folder:

```bash
cd front
npm install
npm start
```

By default the dev server opens at http://localhost:3000 and will proxy API requests to the backend if configured.

## 🪪 Java 21 (upgrade / verification)

This repository targets Java 21 (LTS). To install or switch to Java 21 on macOS, you can use one of these options:

- SDKMAN (recommended for developers):

```bash
# install SDKMAN if you don't have it
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
# install Java 21 (Eclipse Temurin / Temurin builds)
sdk install java 21.0.0-tem
# or a different vendor/identifier as listed by `sdk list java`
```

- Homebrew (Adoptium Temurin):

```bash
brew install --cask temurin21
# verify
java -version
```

Verify Java version

```bash
java -version
# Expect output to show a 21.x version
```

If you need help upgrading the build tooling to explicitly require Java 21 in Maven, I can run the Java upgrade tooling and update the `pom.xml` for you.

## ⚙️ Notes & tips

- The backend includes an executable Maven wrapper `mvnw` so you don't need Maven installed globally.
- If you run behind a firewall or corporate proxy, configure Maven and npm accordingly.
- For production builds consider packaging the backend as a Docker image and the frontend as a static bundle.

## 🤝 Contributing

If you'd like improvements (examples: CI badges, test coverage badge, Dockerfiles), tell me which to add and I can update the README and repository accordingly.

---

Happy hacking — let me know if you want a README variant with more icons, a screenshot, or a shorter README for the project root.
