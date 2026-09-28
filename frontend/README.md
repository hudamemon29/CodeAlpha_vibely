# Vibely

Vibely is a full-stack social media web application where users can create accounts, create posts, like and comment on posts, follow other users, and manage their profiles.

## Features

* User registration and login
* User profiles
* Create and delete posts
* Like posts
* Comment on posts
* Follow and unfollow users
* Home feed
* User search
* Dark and light theme
* MySQL database integration
* REST API using Express.js

## Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js
* REST API

### Database

* MySQL

## Project Structure

```text
Vibely/
│
├── backend/
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   └── data.js
│   └── index.html
│
├── .gitignore
└── README.md
```

## How to Run

### 1. Clone the repository

```bash
git clone https://github.com/hudakamran29/vibely.git
```

### 2. Open the project

```bash
cd vibely-app
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Configure MySQL

Create a MySQL database and update the database connection settings in:

```text
backend/db.js
```

Make sure your MySQL server is running.

### 5. Start the backend

```bash
node server.js
```

The backend will run on:

```text
http://localhost:3000
```

### 6. Open the frontend

Open:

```text
frontend/index.html
```

in your browser.

## API

The backend provides REST API endpoints for application data, including:

```text
/api/users
/api/posts
/api/likes
/api/comments
/api/follows
/api/login
```

## Database

Vibely uses MySQL to store application data such as:

* Users
* Posts
* Likes
* Comments
* Follows

## Future Improvements

* Image upload for posts
* Notifications
* Real-time messaging
* Password hashing and authentication improvements
* Deployment of frontend, backend, and database
* Responsive improvements for mobile devices

## Author

**Huda**

Computer Science Student | Web Developer


