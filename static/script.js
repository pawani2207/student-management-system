const form = document.getElementById("student-form");
const studentId = document.getElementById("student-id");
const nameInput = document.getElementById("name");
const rollInput = document.getElementById("roll_no");
const classInput = document.getElementById("student_class");
const marksInput = document.getElementById("marks");
const contactInput = document.getElementById("contact");

const tableBody = document.getElementById("student-table");
const searchInput = document.getElementById("search");
const message = document.getElementById("message");
const formTitle = document.getElementById("form-title");
const submitButton = document.getElementById("submit-btn");
const cancelButton = document.getElementById("cancel-btn");
const countText = document.getElementById("student-count");


async function loadStudents() {
    const search = searchInput.value.trim();
    const url = search
        ? `/api/students?search=${encodeURIComponent(search)}`
        : "/api/students";

    try {
        const response = await fetch(url);
        const students = await response.json();

        displayStudents(students);
    } catch (error) {
        tableBody.innerHTML =
            `<tr><td colspan="7" class="empty">Could not load students.</td></tr>`;
    }
}


function displayStudents(students) {
    countText.textContent =
        `${students.length} student${students.length === 1 ? "" : "s"}`;

    if (students.length === 0) {
        tableBody.innerHTML =
            `<tr><td colspan="7" class="empty">No students found.</td></tr>`;
        return;
    }

    tableBody.innerHTML = students.map((student, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${escapeHTML(student.name)}</td>
            <td>${escapeHTML(student.roll_no)}</td>
            <td>${escapeHTML(student.student_class)}</td>
            <td>${student.marks}</td>
            <td>${escapeHTML(student.contact)}</td>
            <td>
                <button class="edit"
                    onclick="editStudent(${student.id}, '${escapeJS(student.name)}',
                    '${escapeJS(student.roll_no)}',
                    '${escapeJS(student.student_class)}',
                    '${student.marks}',
                    '${escapeJS(student.contact)}')">
                    Edit
                </button>
                <button class="delete" onclick="deleteStudent(${student.id})">
                    Delete
                </button>
            </td>
        </tr>
    `).join("");
}


function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function escapeJS(value) {
    return String(value)
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'")
        .replaceAll("\n", "\\n")
        .replaceAll("\r", "\\r");
}


form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = studentId.value;

    const data = {
        name: nameInput.value.trim(),
        roll_no: rollInput.value.trim(),
        student_class: classInput.value.trim(),
        marks: marksInput.value,
        contact: contactInput.value.trim()
    };

    const method = id ? "PUT" : "POST";
    const url = id ? `/api/students/${id}` : "/api/students";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            showMessage(result.error, true);
            return;
        }

        showMessage(result.message, false);
        resetForm();
        loadStudents();

    } catch (error) {
        showMessage("Server error. Please try again.", true);
    }
});


function editStudent(id, name, rollNo, studentClass, marks, contact) {
    studentId.value = id;
    nameInput.value = name;
    rollInput.value = rollNo;
    classInput.value = studentClass;
    marksInput.value = marks;
    contactInput.value = contact;

    formTitle.textContent = "Update Student";
    submitButton.textContent = "Update Student";
    cancelButton.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


cancelButton.addEventListener("click", () => {
    resetForm();
});


function resetForm() {
    form.reset();
    studentId.value = "";

    formTitle.textContent = "Add Student";
    submitButton.textContent = "Add Student";
    cancelButton.classList.add("hidden");
}


async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student?")) {
        return;
    }

    try {
        const response = await fetch(`/api/students/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            showMessage(result.error, true);
            return;
        }

        showMessage(result.message, false);
        loadStudents();

    } catch (error) {
        showMessage("Could not delete student.", true);
    }
}


function showMessage(text, isError) {
    message.textContent = text;
    message.style.color = isError ? "#c62828" : "#2e7d32";

    setTimeout(() => {
        message.textContent = "";
    }, 3000);
}


let searchTimer;

searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadStudents, 250);
});


loadStudents();
