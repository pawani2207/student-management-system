from flask import Flask, request, jsonify, render_template
import sqlite3
import re

app = Flask(__name__)
DATABASE = "students.db"


def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            roll_no TEXT NOT NULL UNIQUE,
            student_class TEXT NOT NULL,
            marks REAL NOT NULL,
            contact TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def validate_student(data):
    required = ["name", "roll_no", "student_class", "marks", "contact"]

    for field in required:
        if field not in data or str(data[field]).strip() == "":
            return f"{field.replace('_', ' ').title()} is required."

    try:
        marks = float(data["marks"])
    except (ValueError, TypeError):
        return "Marks must be a number."

    if marks < 0 or marks > 100:
        return "Marks must be between 0 and 100."

    if not re.fullmatch(r"\d{10}", str(data["contact"]).strip()):
        return "Contact number must contain exactly 10 digits."

    return None


@app.route("/")
def home():
    return render_template("index.html")


# GET - view/search students
@app.route("/api/students", methods=["GET"])
def get_students():
    search = request.args.get("search", "").strip()

    conn = get_db_connection()

    if search:
        students = conn.execute("""
            SELECT * FROM students
            WHERE name LIKE ? OR roll_no LIKE ?
            ORDER BY id DESC
        """, (f"%{search}%", f"%{search}%")).fetchall()
    else:
        students = conn.execute(
            "SELECT * FROM students ORDER BY id DESC"
        ).fetchall()

    conn.close()

    return jsonify([dict(student) for student in students])


# POST - add student
@app.route("/api/students", methods=["POST"])
def add_student():
    data = request.get_json(silent=True) or {}

    error = validate_student(data)
    if error:
        return jsonify({"error": error}), 400

    conn = get_db_connection()

    try:
        conn.execute("""
            INSERT INTO students
            (name, roll_no, student_class, marks, contact)
            VALUES (?, ?, ?, ?, ?)
        """, (
            data["name"].strip(),
            data["roll_no"].strip(),
            data["student_class"].strip(),
            float(data["marks"]),
            data["contact"].strip()
        ))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "Roll number already exists."}), 409

    conn.close()
    return jsonify({"message": "Student added successfully."}), 201


# PUT - update student
@app.route("/api/students/<int:student_id>", methods=["PUT"])
def update_student(student_id):
    data = request.get_json(silent=True) or {}

    error = validate_student(data)
    if error:
        return jsonify({"error": error}), 400

    conn = get_db_connection()

    existing = conn.execute(
        "SELECT * FROM students WHERE id = ?", (student_id,)
    ).fetchone()

    if existing is None:
        conn.close()
        return jsonify({"error": "Student not found."}), 404

    try:
        conn.execute("""
            UPDATE students
            SET name = ?, roll_no = ?, student_class = ?, marks = ?, contact = ?
            WHERE id = ?
        """, (
            data["name"].strip(),
            data["roll_no"].strip(),
            data["student_class"].strip(),
            float(data["marks"]),
            data["contact"].strip(),
            student_id
        ))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "Roll number already exists."}), 409

    conn.close()
    return jsonify({"message": "Student updated successfully."})


# DELETE - delete student
@app.route("/api/students/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):
    conn = get_db_connection()

    cursor = conn.execute(
        "DELETE FROM students WHERE id = ?", (student_id,)
    )
    conn.commit()
    conn.close()

    if cursor.rowcount == 0:
        return jsonify({"error": "Student not found."}), 404

    return jsonify({"message": "Student deleted successfully."})


if __name__ == "__main__":
    init_db()
    app.run(debug=True)
