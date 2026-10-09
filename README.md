# Student Management System

A beginner-friendly full-stack web application built using:

- HTML
- CSS
- JavaScript
- Python Flask
- SQLite
- REST API
- Fetch API

## Features

- Add student
- View students
- Search by name or roll number
- Update student
- Delete student
- Input validation
- Duplicate roll-number prevention
- Dynamic updates without page reload

## Project Structure

student_management_system/
│
├── app.py
├── requirements.txt
├── README.md
│
├── templates/
│   └── index.html
│
└── static/
    ├── style.css
    └── script.js

The `students.db` file is automatically created when the application starts.

## How to Run

### 1. Open the project folder in VS Code

Open the folder:

student_management_system

### 2. Open Terminal

In VS Code:

Terminal -> New Terminal

### 3. Create a virtual environment (recommended)

Windows:

python -m venv venv

Activate it:

venv\Scripts\activate

### 4. Install Flask

pip install -r requirements.txt

### 5. Run the application

python app.py

### 6. Open in browser

http://127.0.0.1:5000

## API Endpoints

GET /api/students
- View all students

GET /api/students?search=abc
- Search students

POST /api/students
- Add student

PUT /api/students/<id>
- Update student

DELETE /api/students/<id>
- Delete student

## Example JSON

{
    "name": "Rahul Sharma",
    "roll_no": "101",
    "student_class": "BTech CSE",
    "marks": 85,
    "contact": "9876543210"
}
