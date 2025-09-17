
# User Story 1.1: Employee Registration

## Story
As a new employee,
I want to create a new account with my email and a secure password
so that I can gain access to the CRM system and begin my work.

## Acceptance Criteria

- **Given** I am on the registration page, **when** I enter a valid email address, a password that meets the complexity requirements, and confirm the password, **then** I should receive a success message and my account is created.

- **Given** I am on the registration page, **when** I enter an email that is already registered, **then** I should see an error message stating "An account with this email already exists."

- **Given** I am on the registration page, **when** I enter a password that does not meet the complexity requirements (e.g., less than 8 characters, no numbers), **then** the form should indicate the specific requirement I failed.

- **Given** I submit the registration form, **when** my account is created, **then** my password must be encrypted (hashed and salted) in the database.

---

## Tasks Breakdown

### 1. Registration Page (Frontend)
- Build a registration form with fields for Email, Password, and Confirm Password.
- Validate required fields and email format.
- Show clear success and error messages.

### 2. Password Complexity Validation (Frontend)
- Ensure password is at least 8 characters and includes a number.
- Display specific error messages for failed requirements.

### 3. API Endpoint for Registration (Backend)
- Create an ASP.NET Core controller with a `POST /api/register` endpoint.
- Accept email and password, check if the email already exists, and return appropriate messages.

### 4. Password Hashing (Backend)
- Hash and salt passwords before saving to the database for security.
- Use Entity Framework Core for database operations.

### 5. Database Table for Users
- Create a `Users` table with columns for email and hashed password.
- Implement models and database context for user management.

### 6. Success/Error Messages (Frontend)
- Show a success message if registration is successful.
- Display errors for duplicate emails or weak passwords.
