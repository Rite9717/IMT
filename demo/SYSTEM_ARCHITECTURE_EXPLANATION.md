# Complete System Architecture: Authentication to Message Management

## Overview
This is a Spring Boot application with JWT-based authentication and a messaging system. The flow goes from user authentication → JWT token generation → secured API access → message sending/receiving.

---

## 🔐 AUTHENTICATION FLOW

### 1. **Entry Point: AuthController**
**Location:** `controller/AuthController.java`

**Purpose:** Handles HTTP requests for login and signup

**Endpoints:**
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

**Functions:**
```java
login(LoginRequest) → AuthResponse
  - Receives username & password
  - Calls AuthService.login()
  - Returns JWT token + user info

signup(SignupRequest) → String
  - Receives user registration data
  - Calls AuthService.signup()
  - Returns success message
```

---

### 2. **Business Logic: AuthService**
**Location:** `service/AuthService.java`

**Purpose:** Core authentication logic

**Key Functions:**

#### `login(LoginRequest loginRequest)`
**Flow:**
1. Creates `UsernamePasswordAuthenticationToken` with username/password
2. Calls `authenticationManager.authenticate()` 
   - This triggers Spring Security's authentication chain
   - Internally calls UserDetailsServiceImpl to load user
   - Compares passwords using BCrypt
3. If successful, stores authentication in `SecurityContextHolder`
4. Generates JWT token using `JwtUtils`
5. Updates user's `lastLogin` timestamp
6. Returns `AuthResponse` with token and user details

#### `signup(SignupRequest signupRequest)`
**Flow:**
1. Checks if username/email already exists
2. Creates new `User` object
3. **Encrypts password** using `passwordEncoder.encode()` (BCrypt)
4. Assigns default role: `ROLE_USER`
5. Saves user to database
6. Returns success message

---

### 3. **User Loading: UserDetailsServiceImpl**
**Location:** `security/UserDetailsServiceImpl.java`

**Purpose:** Loads user from database for Spring Security

**Key Function:**
```java
loadUserByUsername(String username) → UserDetails
```

**Flow:**
1. Queries database via `UserRepository.findByUsername()`
2. If user not found → throws `UsernameNotFoundException`
3. Converts `User` entity to `UserDetailsImpl`
4. Returns UserDetails object to Spring Security

**Relationship:** This is called automatically by Spring Security during authentication

---

### 4. **User Details Wrapper: UserDetailsImpl**
**Location:** `security/UserDetailsImpl.java`

**Purpose:** Adapts your User entity to Spring Security's UserDetails interface

**Fields:**
- `id` - User ID
- `username` - Username
- `email` - Email
- `password` - **Encrypted password** (BCrypt hash)
- `authorities` - User roles/permissions

**Key Function:**
```java
static build(User user) → UserDetailsImpl
```
Converts your User entity into UserDetailsImpl by:
- Extracting user fields
- Converting roles to `GrantedAuthority` objects
- **Critically: Passes the encrypted password from database**

**Why This Matters:** 
- Spring Security compares the password you enter with this encrypted password
- If this password is null/empty, authentication fails with "Empty encoded password"

---

### 5. **JWT Token Management: JwtUtils**
**Location:** `security/JwtUtils.java`

**Purpose:** Creates and validates JWT tokens

**Configuration:**
- `jwt.secret` - Secret key for signing tokens
- `jwt.expiration` - Token validity period

**Key Functions:**

#### `generateJwtToken(Authentication auth)`
1. Extracts username from authenticated user
2. Creates JWT with:
   - Subject: username
   - Issued at: current time
   - Expiration: current time + expiration period
3. Signs with HMAC-SHA using secret key
4. Returns token string

#### `validateJwtToken(String token)`
1. Parses token using secret key
2. Checks signature and expiration
3. Returns true if valid, false otherwise

#### `getUserNameFromJwtToken(String token)`
1. Parses token
2. Extracts username from subject claim
3. Returns username

---

### 6. **Request Filtering: AuthTokenFilter**
**Location:** `security/AuthTokenFilter.java`

**Purpose:** Intercepts every HTTP request to validate JWT tokens

**Type:** `OncePerRequestFilter` - runs once per request

**Flow:**
```
HTTP Request → AuthTokenFilter → Controller
```

**Function: `doFilterInternal()`**

**Step-by-step:**
1. **Check if auth endpoint:** If path starts with `/api/auth`, skip authentication (allow login/signup)
2. **Extract JWT:** Looks for `Authorization: Bearer <token>` header
3. **Validate token:** Calls `jwtUtils.validateJwtToken()`
4. **Load user:** If valid, extracts username and loads user via `UserDetailsServiceImpl`
5. **Set authentication:** Creates `UsernamePasswordAuthenticationToken` and stores in `SecurityContextHolder`
6. **Continue:** Passes request to next filter/controller

**Result:** If token is valid, user is authenticated for this request

---

### 7. **Security Configuration: SecurityConfig**
**Location:** `config/SecurityConfig.java`

**Purpose:** Configures Spring Security

**Key Beans:**

#### `passwordEncoder()`
Returns `BCryptPasswordEncoder` - used to hash passwords

#### `authenticationProvider()`
Configures how authentication works:
- Uses `UserDetailsServiceImpl` to load users
- Uses `BCryptPasswordEncoder` to compare passwords

#### `authenticationManager()`
Returns the authentication manager used by AuthService

#### `filterChain(HttpSecurity http)`
Configures security rules:
- **CSRF:** Disabled (for REST API)
- **CORS:** Enabled for frontend origins
- **Session:** Stateless (JWT-based, no server sessions)
- **Authorization rules:**
  - `/api/auth/**` - Public (no authentication)
  - `/api/test/**` - Public
  - All other requests - Require authentication
- **Filters:** Adds `AuthTokenFilter` before username/password filter

---

## 📨 MESSAGING FLOW

### 8. **Entry Point: MessageController**
**Location:** `controller/MessageController.java`

**Purpose:** Handles message-related HTTP requests

**Authentication:** All endpoints require JWT token (enforced by SecurityConfig)

**Key Feature:** `@AuthenticationPrincipal UserDetailsImpl userDetails`
- Automatically injects authenticated user
- No need to manually extract from SecurityContext

**Endpoints & Functions:**

#### `POST /api/messages` - Send Message
```java
sendMessage(UserDetailsImpl userDetails, MessageRequest request)
```
- Gets sender ID from authenticated user
- Calls `MessageService.sendMessage()`
- Returns created message

#### `GET /api/messages/inbox` - Get Inbox
```java
getInbox(UserDetailsImpl userDetails)
```
- Gets user ID from authenticated user
- Calls `MessageService.getInbox()`
- Returns list of received messages

#### `GET /api/messages/sent` - Get Sent Messages
```java
getSentMessages(UserDetailsImpl userDetails)
```
- Returns messages sent by authenticated user

#### `GET /api/messages/folder/{folder}` - Get Messages by Folder
```java
getMessagesByFolder(UserDetailsImpl userDetails, String folder)
```
- Returns messages in specific folder (inbox, archive, etc.)

#### `PUT /api/messages/{id}/read` - Mark as Read
```java
markAsRead(UserDetailsImpl userDetails, Long id)
```
- Marks message as read
- Updates `readAt` timestamp

#### `DELETE /api/messages/{id}` - Delete Message
```java
deleteMessage(UserDetailsImpl userDetails, Long id)
```
- Soft delete (sets `isDeleted = true`)
- Doesn't actually remove from database

#### `GET /api/messages/unread-count` - Get Unread Count
```java
getUnreadCount(UserDetailsImpl userDetails)
```
- Returns count of unread messages

---

### 9. **Business Logic: MessageService**
**Location:** `service/MessageService.java`

**Purpose:** Message management logic

**Dependencies:**
- `MessageRepository` - Database access
- `UserRepository` - User lookup

**Key Functions:**

#### `sendMessage(Long senderId, MessageRequest request)`
**Flow:**
1. Load sender from database using `senderId`
2. Load receiver from database using `request.getReceiverId()`
3. Create new `Message` object:
   - Set sender, receiver
   - Set subject, body, folder
   - Set `sentAt` to current time
   - Default: `isRead = false`, `isDeleted = false`
4. Save to database via `messageRepository.save()`
5. Convert to `MessageResponse` DTO
6. Return response

#### `getInbox(Long userId)`
**Flow:**
1. Load user from database
2. Query: `findByReceiverAndIsDeletedFalseOrderBySentAtDesc(user)`
   - Gets messages where user is receiver
   - Excludes deleted messages
   - Orders by sent time (newest first)
3. Convert each Message to MessageResponse
4. Return list

#### `getSentMessages(Long userId)`
Similar to inbox, but queries messages where user is sender

#### `getMessagesByFolder(Long userId, String folder)`
Gets messages in specific folder (inbox, archive, etc.)

#### `markAsRead(Long messageId, Long userId)`
**Flow:**
1. Load message from database
2. **Security check:** Verify user is the receiver
3. Set `isRead = true`
4. Set `readAt = current time`
5. Save and return

#### `deleteMessage(Long messageId, Long userId)`
**Flow:**
1. Load message
2. **Security check:** Verify user is sender OR receiver
3. Set `isDeleted = true` (soft delete)
4. Save

#### `getUnreadCount(Long userId)`
Counts messages where:
- User is receiver
- `isRead = false`
- `isDeleted = false`

#### `convertToResponse(Message message)`
**Helper function** - Converts Message entity to MessageResponse DTO:
- Extracts all fields
- Includes sender/receiver usernames
- Returns clean DTO for API response

---

### 10. **Data Model: Message**
**Location:** `model/Message.java`

**Purpose:** Database entity for messages

**Table:** `messages`

**Fields:**
- `id` - Primary key (auto-generated)
- `sender` - ManyToOne relationship to User
- `receiver` - ManyToOne relationship to User
- `subject` - Message subject
- `body` - Message content (TEXT column)
- `sentAt` - Timestamp when sent
- `readAt` - Timestamp when read (null if unread)
- `isRead` - Boolean flag (default: false)
- `isDeleted` - Boolean flag for soft delete (default: false)
- `folder` - Folder name (default: "inbox")
- `attachmentPath` - Path to attachment file (optional)

**Relationships:**
- Each message has ONE sender (User)
- Each message has ONE receiver (User)
- User can have MANY sent messages
- User can have MANY received messages

---

### 11. **Data Model: User**
**Location:** `model/User.java`

**Purpose:** Database entity for users

**Table:** `users`

**Fields:**
- `id` - Primary key
- `username` - Unique username
- `password` - **BCrypt encrypted password**
- `email` - Unique email
- `firstName`, `lastName`, `phone` - Profile info
- `active` - Account status (default: true)
- `createdAt` - Registration timestamp
- `lastLogin` - Last login timestamp
- `roles` - Set of role strings (stored in `user_roles` table)

**Relationships:**
- `sentMessages` - OneToMany to Message (as sender)
- `receivedMessages` - OneToMany to Message (as receiver)

---

### 12. **Data Access: MessageRepository**
**Location:** `repository/MessageRepository.java`

**Purpose:** Database queries for messages

**Type:** JpaRepository interface - Spring Data JPA auto-implements

**Custom Query Methods:**
```java
findByReceiverAndIsDeletedFalseOrderBySentAtDesc(User receiver)
  → Gets all non-deleted messages for receiver, newest first

findBySenderAndIsDeletedFalseOrderBySentAtDesc(User sender)
  → Gets all non-deleted messages from sender, newest first

findByReceiverAndFolderAndIsDeletedFalseOrderBySentAtDesc(User receiver, String folder)
  → Gets messages in specific folder for receiver

countByReceiverAndIsReadFalseAndIsDeletedFalse(User receiver)
  → Counts unread, non-deleted messages for receiver
```

**How it works:** Spring Data JPA parses method names and generates SQL queries automatically

---

## 🔄 COMPLETE REQUEST FLOW EXAMPLES

### Example 1: User Login

```
1. Frontend sends POST /api/auth/login
   Body: { "username": "ripu", "password": "mypassword" }

2. AuthTokenFilter checks path → starts with /api/auth → skips authentication

3. Request reaches AuthController.login()

4. AuthController calls AuthService.login()

5. AuthService creates UsernamePasswordAuthenticationToken

6. AuthenticationManager.authenticate() is called
   ↓
7. Spring Security calls UserDetailsServiceImpl.loadUserByUsername("ripu")
   ↓
8. UserDetailsServiceImpl queries database via UserRepository
   ↓
9. Finds user, calls UserDetailsImpl.build(user)
   ↓
10. Returns UserDetailsImpl with encrypted password from database

11. Spring Security's DaoAuthenticationProvider compares:
    - Password entered: "mypassword"
    - Encrypts it with BCrypt
    - Compares with stored hash from UserDetailsImpl
    - If match → authentication successful

12. AuthService receives successful Authentication object

13. AuthService calls JwtUtils.generateJwtToken()
    ↓
14. JwtUtils creates JWT token with username and expiration

15. AuthService updates user's lastLogin timestamp

16. AuthService returns AuthResponse with:
    - JWT token
    - User ID, username, email
    - Roles

17. Frontend receives response and stores JWT token
```

---

### Example 2: Sending a Message (Authenticated Request)

```
1. Frontend sends POST /api/messages
   Headers: { "Authorization": "Bearer <jwt_token>" }
   Body: { 
     "receiverId": 2,
     "subject": "Hello",
     "body": "Test message"
   }

2. Request enters AuthTokenFilter.doFilterInternal()

3. AuthTokenFilter extracts JWT from Authorization header

4. AuthTokenFilter calls JwtUtils.validateJwtToken()
   ↓
5. JwtUtils verifies signature and expiration → valid

6. AuthTokenFilter calls JwtUtils.getUserNameFromJwtToken()
   ↓
7. Extracts username: "ripu"

8. AuthTokenFilter calls UserDetailsServiceImpl.loadUserByUsername("ripu")
   ↓
9. Loads user from database

10. AuthTokenFilter creates UsernamePasswordAuthenticationToken
    and stores in SecurityContextHolder

11. Request continues to MessageController.sendMessage()

12. Spring automatically injects UserDetailsImpl (from SecurityContext)
    into @AuthenticationPrincipal parameter

13. MessageController calls MessageService.sendMessage()
    - Passes authenticated user's ID
    - Passes MessageRequest

14. MessageService loads sender (ID=1) and receiver (ID=2) from database

15. MessageService creates new Message object:
    - sender = User(id=1)
    - receiver = User(id=2)
    - subject = "Hello"
    - body = "Test message"
    - sentAt = now()
    - isRead = false
    - isDeleted = false
    - folder = "inbox"

16. MessageService saves via MessageRepository.save()
    ↓
17. Hibernate generates SQL INSERT into messages table

18. MessageService converts Message to MessageResponse

19. MessageController returns ResponseEntity with MessageResponse

20. Frontend receives created message details
```

---

### Example 3: Getting Inbox (Authenticated Request)

```
1. Frontend sends GET /api/messages/inbox
   Headers: { "Authorization": "Bearer <jwt_token>" }

2. AuthTokenFilter validates JWT (same as Example 2, steps 2-10)

3. Request reaches MessageController.getInbox()

4. UserDetailsImpl automatically injected (user ID = 1)

5. MessageController calls MessageService.getInbox(1)

6. MessageService loads User(id=1) from database

7. MessageService calls MessageRepository.findByReceiverAndIsDeletedFalseOrderBySentAtDesc(user)

8. Spring Data JPA generates SQL:
   SELECT * FROM messages 
   WHERE receiver_id = 1 
   AND is_deleted = false 
   ORDER BY sent_at DESC

9. Database returns list of Message entities

10. MessageService converts each Message to MessageResponse:
    - Extracts all fields
    - Includes sender username, receiver username
    - Creates clean DTO

11. MessageService returns List<MessageResponse>

12. MessageController returns ResponseEntity with list

13. Frontend receives array of messages
```

---

## 🔑 KEY SECURITY CONCEPTS

### Password Encryption (BCrypt)
- **Signup:** Plain password → BCrypt hash → stored in database
- **Login:** Plain password → BCrypt hash → compared with stored hash
- **Why BCrypt:** One-way encryption, includes salt, resistant to rainbow tables

### JWT (JSON Web Token)
- **Structure:** Header.Payload.Signature
- **Payload contains:** username, issued time, expiration
- **Signature:** Prevents tampering (signed with secret key)
- **Stateless:** Server doesn't store sessions, token contains all info

### Spring Security Filter Chain
```
Request → AuthTokenFilter → SecurityFilterChain → Controller
```
- AuthTokenFilter validates JWT
- SecurityFilterChain checks authorization rules
- If authenticated, request proceeds to controller

### @AuthenticationPrincipal
- Spring annotation that injects authenticated user
- Extracts from SecurityContextHolder
- Avoids manual SecurityContext access

---

## 📊 DATABASE RELATIONSHIPS

```
User (1) ←→ (Many) Message [as sender]
User (1) ←→ (Many) Message [as receiver]

User Table:
- id (PK)
- username
- password (encrypted)
- email
- roles (separate table: user_roles)

Message Table:
- id (PK)
- sender_id (FK → users.id)
- receiver_id (FK → users.id)
- subject
- body
- sentAt
- readAt
- isRead
- isDeleted
- folder
```

---

## 🎯 IMPORTANT NOTES

### Why Your Login Failed Initially
The `UserDetailsImpl` had two constructors:
1. Lombok's `@AllArgsConstructor` (correct)
2. Empty manual constructor (wrong)

The `build()` method was calling the empty constructor, so the password field was never set. Spring Security saw an empty password and failed authentication.

### Soft Delete Pattern
Messages aren't actually deleted from database. Instead:
- `isDeleted` flag is set to true
- Queries filter out deleted messages
- Allows recovery and audit trails

### Lazy Loading
```java
@ManyToOne(fetch = FetchType.LAZY)
```
- Sender/receiver aren't loaded immediately
- Only loaded when accessed
- Improves performance

### Transaction Management
```java
@Transactional
```
- Ensures database operations are atomic
- If error occurs, changes are rolled back
- Maintains data consistency

---

## 🚀 API ENDPOINTS SUMMARY

### Authentication (Public)
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Register

### Messages (Authenticated)
- `POST /api/messages` - Send message
- `GET /api/messages/inbox` - Get inbox
- `GET /api/messages/sent` - Get sent messages
- `GET /api/messages/folder/{folder}` - Get by folder
- `PUT /api/messages/{id}/read` - Mark as read
- `DELETE /api/messages/{id}` - Delete message
- `GET /api/messages/unread-count` - Get unread count

---

This architecture follows standard Spring Boot + Spring Security + JWT patterns with clean separation of concerns:
- **Controllers** handle HTTP
- **Services** contain business logic
- **Repositories** handle database
- **Security** manages authentication/authorization
- **DTOs** transfer data between layers
