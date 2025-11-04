# 📨 IMS — Integrated Mail System

<div align="center">

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Maven](https://img.shields.io/badge/Maven-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white)](https://maven.apache.org/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

**A modern, secure internal messaging system with JWT authentication, built with Spring Boot and React**

[Features](#-features) • [Architecture](#-architecture) • [Installation](#-installation) • [API Documentation](#-api-endpoints) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

IMS (Integrated Mail System) is a full-stack messaging application that demonstrates modern web development practices. It features a robust Spring Boot backend with JWT-based authentication and a responsive React frontend, providing a complete solution for internal communication.

### ✨ Features

🔐 **Secure Authentication**
- JWT-based stateless authentication
- BCrypt password encryption
- Role-based access control (RBAC)
- Automatic token validation on every request

📬 **Message Management**
- Send and receive messages between users
- Inbox and sent messages views
- Folder organization (inbox, archive, etc.)
- Mark messages as read/unread
- Soft delete functionality (messages can be recovered)
- Real-time unread message counter

👥 **User Management**
- User registration and login
- Profile information management
- Last login tracking
- Active/inactive account status

🎨 **Modern UI/UX**
- Responsive React frontend
- Clean and intuitive interface
- Real-time updates
- Mobile-friendly design

---

## 🏗️ Architecture

### Tech Stack

**Backend (Spring Boot)**
- **Framework:** Spring Boot 3.x
- **Security:** Spring Security + JWT
- **Database:** JPA/Hibernate with relational database
- **Build Tool:** Maven
- **Java Version:** 21 (LTS)

**Frontend (React)**
- **Framework:** React 18.x
- **HTTP Client:** Axios
- **Routing:** React Router
- **State Management:** Context API
- **Styling:** CSS3

### Project Structure

```
📦 IMS
├── 📂 demo/                    # Backend (Spring Boot)
│   ├── 📂 src/main/java/com/project/ims/
│   │   ├── 📂 config/          # Security & app configuration
│   │   ├── 📂 controller/      # REST API endpoints
│   │   ├── 📂 dto/             # Data Transfer Objects
│   │   ├── 📂 model/           # JPA entities
│   │   ├── 📂 repository/      # Database access layer
│   │   ├── 📂 security/        # JWT & authentication
│   │   └── 📂 service/         # Business logic
│   ├── 📂 src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
└── 📂 front/                   # Frontend (React)
    ├── 📂 public/
    ├── 📂 src/
    │   ├── 📂 components/      # Reusable UI components
    │   ├── 📂 context/         # React Context (Auth)
    │   ├── 📂 pages/           # Page components
    │   └── 📂 services/        # API service layer
    └── package.json
```

### Security Flow

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Client    │─────▶│ AuthToken    │─────▶│ Controller  │
│  (React)    │      │   Filter     │      │  Endpoint   │
└─────────────┘      └──────────────┘      └─────────────┘
      │                     │                      │
      │ JWT Token           │ Validate             │
      │                     │ Extract User         │
      │                     ▼                      ▼
      │              ┌──────────────┐      ┌─────────────┐
      │              │  JwtUtils    │      │  Service    │
      │              └──────────────┘      │   Layer     │
      │                                    └─────────────┘
      │                                           │
      └───────────────────────────────────────────┘
                    Response with data
```

For detailed architecture documentation, see [SYSTEM_ARCHITECTURE_EXPLANATION.md](demo/SYSTEM_ARCHITECTURE_EXPLANATION.md)

---

## 🚀 Installation

### Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Purpose | Installation Guide |
|------|---------|---------|-------------------|
| ☕ **Java** | 21 (LTS) | Backend runtime | [See below](#-installing-java-21) |
| 📦 **Node.js** | 16+ | Frontend runtime | [nodejs.org](https://nodejs.org/) |
| 🔧 **npm** | 8+ | Package manager | Comes with Node.js |
| 🗄️ **Database** | Any JPA-compatible | Data storage | MySQL, PostgreSQL, H2, etc. |

> **Note:** Maven is not required as the project includes the Maven wrapper (`mvnw`)

---

### ☕ Installing Java 21

#### Option 1: SDKMAN (Recommended for Developers)

```bash
# Install SDKMAN
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# Install Java 21 (Eclipse Temurin)
sdk install java 21.0.0-tem

# Set as default
sdk default java 21.0.0-tem

# Verify installation
java -version
```

#### Option 2: Homebrew (macOS)

```bash
# Install Java 21
brew install --cask temurin21

# Verify installation
java -version
```

#### Option 3: Direct Download

Download from [Adoptium](https://adoptium.net/temurin/releases/?version=21) and follow the installation wizard.

**Verify Java Installation:**
```bash
java -version
# Expected output: openjdk version "21.x.x" or similar
```

---

### 🔧 Backend Setup (Spring Boot)

1️⃣ **Navigate to backend directory:**
```bash
cd demo
```

2️⃣ **Configure database connection:**

Edit `src/main/resources/application.properties`:
```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/ims_db
spring.datasource.username=your_username
spring.datasource.password=your_password

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT Configuration
jwt.secret=your-secret-key-here-make-it-long-and-secure
jwt.expiration=86400000

# Server Port
server.port=8080
```

3️⃣ **Build and run the backend:**
```bash
# Clean build and run
./mvnw clean package spring-boot:run

# Or build first, then run
./mvnw clean package
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

4️⃣ **Verify backend is running:**
```bash
# Should return 401 Unauthorized (expected for protected endpoint)
curl http://localhost:8080/api/messages/inbox
```

✅ **Backend is now running on** `http://localhost:8080`

---

### 🎨 Frontend Setup (React)

1️⃣ **Navigate to frontend directory:**
```bash
cd front
```

2️⃣ **Install dependencies:**
```bash
npm install
```

3️⃣ **Configure API endpoint (if needed):**

Edit `package.json` to add proxy (if backend is on different port):
```json
{
  "proxy": "http://localhost:8080"
}
```

Or update `src/services/api.js` with your backend URL.

4️⃣ **Start development server:**
```bash
npm start
```

5️⃣ **Access the application:**

The app will automatically open at `http://localhost:3000`

✅ **Frontend is now running!**

---

### 🐳 Quick Start with Docker (Optional)

Coming soon! Docker Compose configuration for one-command setup.

---

## 🎯 Usage

### First Time Setup

1. **Start the backend** (see Backend Setup above)
2. **Start the frontend** (see Frontend Setup above)
3. **Register a new account:**
   - Navigate to `http://localhost:3000`
   - Click "Sign Up"
   - Fill in your details
   - Click "Register"

4. **Login:**
   - Use your credentials to log in
   - You'll receive a JWT token (stored automatically)

5. **Start messaging:**
   - Compose new messages
   - View inbox and sent messages
   - Organize messages in folders

---

## 📡 API Endpoints

### Authentication (Public)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/api/auth/signup` | Register new user | `{ username, password, email, firstName, lastName }` |
| `POST` | `/api/auth/login` | Login user | `{ username, password }` |

### Messages (Protected - Requires JWT)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/messages` | Send a message | ✅ |
| `GET` | `/api/messages/inbox` | Get inbox messages | ✅ |
| `GET` | `/api/messages/sent` | Get sent messages | ✅ |
| `GET` | `/api/messages/folder/{folder}` | Get messages by folder | ✅ |
| `PUT` | `/api/messages/{id}/read` | Mark message as read | ✅ |
| `DELETE` | `/api/messages/{id}` | Delete message (soft) | ✅ |
| `GET` | `/api/messages/unread-count` | Get unread count | ✅ |

### Users (Protected)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/users` | Get all users | ✅ |
| `GET` | `/api/users/{id}` | Get user by ID | ✅ |

**Authentication Header Format:**
```
Authorization: Bearer <your-jwt-token>
```

---

## 🧪 Testing

### Backend Tests

```bash
cd demo
./mvnw test
```

### Frontend Tests

```bash
cd front
npm test
```

---

## 🔒 Security Features

- ✅ **JWT Authentication:** Stateless, secure token-based auth
- ✅ **BCrypt Password Hashing:** Industry-standard password encryption
- ✅ **CORS Configuration:** Controlled cross-origin access
- ✅ **CSRF Protection:** Disabled for REST API (stateless)
- ✅ **Role-Based Access Control:** User roles and permissions
- ✅ **Request Filtering:** Every request validated before processing
- ✅ **Soft Delete:** Messages preserved for audit trails

---

## 🛠️ Development

### Running in Development Mode

**Backend (with hot reload):**
```bash
cd demo
./mvnw spring-boot:run
```

**Frontend (with hot reload):**
```bash
cd front
npm start
```

### Building for Production

**Backend:**
```bash
cd demo
./mvnw clean package
# JAR file created in target/
```

**Frontend:**
```bash
cd front
npm run build
# Static files created in build/
```

**Serve production build:**
```bash
npx serve -s build -l 3001
```

---

## 📝 Configuration

### Backend Configuration

Key properties in `application.properties`:

```properties
# JWT Settings
jwt.secret=your-256-bit-secret
jwt.expiration=86400000  # 24 hours in milliseconds

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/ims_db
spring.jpa.hibernate.ddl-auto=update

# Server
server.port=8080

# Logging
logging.level.com.project.ims=DEBUG
```

### Frontend Configuration

Update API base URL in `src/services/api.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
```

---

## 🐛 Troubleshooting

### Common Issues

**❌ "Empty encoded password" error**
- Ensure `UserDetailsImpl` properly sets the password field
- Check database has encrypted passwords (not plain text)

**❌ CORS errors**
- Verify `SecurityConfig` allows your frontend origin
- Check frontend is using correct backend URL

**❌ JWT token expired**
- Token expires after 24 hours by default
- User needs to log in again

**❌ Database connection failed**
- Verify database is running
- Check credentials in `application.properties`
- Ensure database exists

**❌ Port already in use**
- Backend: Change `server.port` in `application.properties`
- Frontend: Set `PORT=3001 npm start`

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🔀 Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📄 License

This project is open source and available for educational purposes.

---

## 👨‍💻 Authors

Built with ❤️ by developers learning modern web development

---

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- React team for the powerful UI library
- JWT.io for authentication standards
- All contributors and users of this project

---

## 📞 Support

Having issues? Here's how to get help:

- 📖 Check the [System Architecture Documentation](demo/SYSTEM_ARCHITECTURE_EXPLANATION.md)
- 🐛 Open an issue on GitHub
- 💬 Reach out to the development team

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ☕ and 💻

</div>
