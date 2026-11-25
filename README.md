# Smart Library Management System

A MERN-stack mini-project for managing books, library members, book issue/return transactions, notifications, and basic reports.

## Technology stack
- MongoDB + Mongoose
- Node.js + Express
- React + Vite
- JWT authentication
- Tailwind CSS

## Features
- Register and log in using JWT authentication
- Dashboard with total books, members, issued books, and overdue books
- Add, edit, delete, and search books
- Add, edit, and delete library members
- Issue available books to members
- Return issued books
- View active and overdue transactions
- View a simple report of library activity
- Form validation and basic API error handling

## Prerequisites
- Node.js 18 or newer
- npm
- MongoDB running locally, or a MongoDB Atlas connection string

## Setup

### 1. Backend
Open a terminal in the project folder:

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and update the values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart_library
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

### 2. Frontend
Open a second terminal:

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start React:

```bash
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`).

## First use
1. Open the application.
2. Choose **Create account** and register a library administrator account.
3. Log in.
4. Add books and members.
5. Issue a book to a member and use the Return action when it is returned.

The first registered account is an ordinary authenticated user; for this academic prototype, all registered users can manage the library.

## API overview
All routes except registration and login require:

`Authorization: Bearer <JWT_TOKEN>`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/books` | List/search books |
| POST | `/api/books` | Add book |
| PUT | `/api/books/:id` | Update book |
| DELETE | `/api/books/:id` | Delete book |
| GET | `/api/members` | List/search members |
| POST | `/api/members` | Add member |
| PUT | `/api/members/:id` | Update member |
| DELETE | `/api/members/:id` | Delete member |
| GET | `/api/loans` | List issue/return records |
| POST | `/api/loans` | Issue a book |
| PATCH | `/api/loans/:id/return` | Return a book |
| GET | `/api/dashboard` | Dashboard statistics |

## Testing checklist
- Register with valid details; try invalid or duplicate email.
- Log in with correct and incorrect passwords.
- Add a book; try an empty title or negative quantity.
- Search by title, author, category, or ISBN.
- Add a member; try an invalid email.
- Issue a book when copies are available.
- Try issuing when no copies are available.
- Return an issued book and confirm available copies increase.
- Check the dashboard and overdue list.

## Git workflow required by the assignment
Use meaningful commits at different stages. Example:

```bash
git init
git add .
git commit -m "Create project structure and backend setup"

git checkout -b feature/book-management
git add .
git commit -m "Implement book management API and interface"

git checkout main
git merge feature/book-management

git checkout -b feature/issue-return
git add .
git commit -m "Implement book issue and return workflow"

git checkout main
git merge feature/issue-return

git add .
git commit -m "Add README and final validation"
```

Push to GitHub:

```bash
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
git push -u origin feature/book-management
git push -u origin feature/issue-return
```

If your Git installation uses `master` instead of `main`, rename the branch with `git branch -M main`.

## Team contributions
Update this section with the actual names and work completed by each team member. Do not claim work that a member did not perform.

| Team member | Contribution |
|---|---|
| Member 1 | Update with actual contribution |
| Member 2 | Update with actual contribution |
| Member 3 | Update with actual contribution |

## Limitations and future enhancements
- Email/SMS notifications are represented as in-app overdue and new-arrival information; an external notification service is not connected.
- The prototype uses a simple authenticated-user model without separate librarian/student roles.
- Future work can include fine calculation, role-based access, barcode scanning, email reminders, and deployment.
