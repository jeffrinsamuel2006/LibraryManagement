# Smart Library Management System

A full-stack library management application for maintaining a book catalogue, library members, issue/return transactions, dashboard statistics, and overdue notifications.

## Technology stack
- **Frontend:** React 18, Vite, React Router, Axios, Tailwind CSS
- **Backend:** Node.js, Express
- **Local persistence:** JSON file storage (`backend/data/library.json`)
- **Authentication:** JWT and bcryptjs password hashing

> This edition intentionally uses local JSON-file persistence instead of MongoDB. It is designed for a local academic demonstration and small single-instance use. It is not intended for concurrent production workloads or multi-server deployment.

## Features
- Register and log in using JWT authentication
- Password hashing with bcryptjs
- Dashboard with book-copy, member, issued-book, and overdue-book statistics
- Add, edit, delete, and search books
- Add, edit, delete, and search library members
- Issue available books to members
- Return issued books and update available-copy counts
- View active, returned, and overdue transactions
- Overdue reminders and recently added books
- Input validation, duplicate checks, authentication checks, and API error responses
- Data persists across backend restarts in a local JSON file

## Project structure
```text
Smart_Library_Management_System/
├── backend/
│   ├── data/                 # Runtime JSON data (not committed)
│   ├── src/
│   │   ├── middleware/       # JWT authentication middleware
│   │   ├── routes/           # Auth, books, members, loans APIs
│   │   └── storage/          # JSON storage helpers
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── style.css
│   └── package.json
├── .gitignore
└── README.md
```

## Prerequisites
- Node.js 18 or newer
- npm

No MongoDB installation, database server, or cloud database account is required.

## Setup and run

### 1. Backend
```bash
cd backend
npm install
```
Copy `.env.example` to `.env` and set a long random `JWT_SECRET`:

```env
PORT=5000
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```
The API runs at `http://localhost:5000`. The JSON data file is created automatically at `backend/data/library.json` on first startup.

### 2. Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL, normally `http://localhost:5173`.

## First use
1. Select **Create account** and register an administrator account.
2. Log in with the registered credentials.
3. Add books and members.
4. Issue a book to a member with a future due date.
5. Use the Return action when the book is returned.

All registered users have the same library-management permissions in this academic prototype.

## API overview
All routes except registration and login require `Authorization: Bearer <JWT_TOKEN>`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health and local-storage status |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/books` | List/search books |
| POST | `/api/books` | Add book |
| PUT | `/api/books/:id` | Update book |
| DELETE | `/api/books/:id` | Delete book (blocked if issued) |
| GET | `/api/members` | List/search members |
| POST | `/api/members` | Add member |
| PUT | `/api/members/:id` | Update member |
| DELETE | `/api/members/:id` | Delete member (blocked with active issue) |
| GET | `/api/loans` | List issue/return records |
| POST | `/api/loans` | Issue a book |
| PATCH | `/api/loans/:id/return` | Return a book |
| GET | `/api/dashboard` | Dashboard statistics |

## Validation and error handling
- Required fields are checked before creating or updating records.
- Email addresses are checked for basic valid format.
- Passwords must contain at least six characters and are hashed before storage.
- Duplicate user/member emails and book ISBNs are rejected.
- Book copy counts must be positive whole numbers; total copies cannot be reduced below the number currently issued.
- A book with active issues and a member with active loans cannot be deleted.
- Issue requests require an existing book, existing member, available copies, and a future due date.
- Missing/invalid authentication tokens return HTTP 401; invalid input, missing records, and conflicts return appropriate 4xx responses.

## Testing checklist
Perform and record these checks before final submission:
- [ ] Backend health endpoint returns `status: ok` and `storage: local-json`.
- [ ] Register with valid details; test invalid and duplicate email.
- [ ] Log in with correct and incorrect passwords.
- [ ] Add a book; test empty fields, invalid copy count, and duplicate ISBN.
- [ ] Search, edit, and delete a book.
- [ ] Add a member; test invalid and duplicate email.
- [ ] Search, edit, and delete a member.
- [ ] Issue an available book; verify available copies decrease.
- [ ] Attempt to issue an unavailable book and verify validation.
- [ ] Return an issued book; verify available copies increase.
- [ ] Restart the backend and verify data persists.
- [ ] Check dashboard counts and overdue notifications.

## Team
| Team member | Contribution |
|---|---|
| Jeffrin Samuel C | To be updated with work actually completed |
| Ayush Dhankar | To be updated with work actually completed |

Update the contribution column based on the work each person genuinely performs.

## Git workflow
Use separate feature branches and meaningful commits for work as it is completed. Do not manufacture historical commits or claim unperformed work. Suggested next development workflow:

```bash
git switch -c feature/local-json-storage
# Review and test the JSON storage implementation
git add backend/ README.md .gitignore
git commit -m "Replace MongoDB dependency with local JSON storage"
git switch main
git merge --no-ff feature/local-json-storage -m "Merge local JSON storage feature"

git switch -c feature/validation-tests
# Add and run validation tests
git add backend/ README.md
git commit -m "Add API validation tests and document test results"
git switch main
git merge --no-ff feature/validation-tests -m "Merge validation and testing improvements"
```

Push branches and main:
```bash
git push -u origin main
git push -u origin feature/local-json-storage
git push -u origin feature/validation-tests
```

## Limitations and future enhancements
- Local JSON persistence is suitable for a single running instance, not concurrent production traffic.
- Data is stored on the machine running the backend; it is not automatically shared across team members.
- Role-based permissions, fine calculation, barcode scanning, and external email/SMS notifications are future enhancements.
