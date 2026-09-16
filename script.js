/* =========================================
   API CONFIGURATION
========================================= */

const API_URL = "http://localhost:8080/api/students";


/* =========================================
   DOM ELEMENTS
========================================= */

const studentForm =
    document.getElementById("studentForm");

const studentIdInput =
    document.getElementById("studentId");

const nameInput =
    document.getElementById("name");

const emailInput =
    document.getElementById("email");

const departmentInput =
    document.getElementById("department");

const yearInput =
    document.getElementById("year");

const studentTable =
    document.getElementById("studentTable");

const searchInput =
    document.getElementById("searchInput");

const message =
    document.getElementById("message");

const formTitle =
    document.getElementById("formTitle");

const saveButton =
    document.getElementById("saveButton");

const cancelButton =
    document.getElementById("cancelButton");

const emptyState =
    document.getElementById("emptyState");


/* =========================================
   APPLICATION DATA
========================================= */

let students = [];


/* =========================================
   LOAD STUDENTS
========================================= */

async function loadStudents() {

    try {

        showLoading();

        const response =
            await fetch(API_URL);


        if (!response.ok) {

            throw new Error(
                "Unable to load student records."
            );

        }


        students =
            await response.json();


        renderStudents();

    } catch (error) {

        console.error(error);

        showMessage(
            error.message,
            "error"
        );

        studentTable.innerHTML = "";

        emptyState.style.display = "block";

    }

}


/* =========================================
   SHOW LOADING
========================================= */

function showLoading() {

    studentTable.innerHTML = `
        <tr>
            <td colspan="6" class="loading">
                Loading student records...
            </td>
        </tr>
    `;

    emptyState.style.display = "none";
}


/* =========================================
   DISPLAY STUDENTS
========================================= */

function renderStudents() {

    const searchText =
        searchInput.value
            .trim()
            .toLowerCase();


    const filteredStudents =
        students.filter(student => {

            const name =
                String(student.name || "")
                    .toLowerCase();

            const email =
                String(student.email || "")
                    .toLowerCase();

            const department =
                String(student.department || "")
                    .toLowerCase();


            return (
                name.includes(searchText) ||
                email.includes(searchText) ||
                department.includes(searchText)
            );

        });


    studentTable.innerHTML = "";


    if (filteredStudents.length === 0) {

        emptyState.style.display = "block";

        return;

    }


    emptyState.style.display = "none";


    filteredStudents.forEach(student => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${student.id}
            </td>

            <td>
                ${escapeHtml(student.name)}
            </td>

            <td>
                ${escapeHtml(student.email)}
            </td>

            <td>
                ${escapeHtml(student.department)}
            </td>

            <td>
                ${getYearText(student.year)}
            </td>

            <td>

                <div class="action-buttons">

                    <button
                        class="action-button edit-button"
                        onclick="editStudent(${student.id})"
                    >
                        Edit
                    </button>

                    <button
                        class="action-button delete-button"
                        onclick="deleteStudent(${student.id})"
                    >
                        Delete
                    </button>

                </div>

            </td>

        `;


        studentTable.appendChild(row);

    });

}


/* =========================================
   YEAR TEXT
========================================= */

function getYearText(year) {

    const yearMap = {

        1: "1st Year",

        2: "2nd Year",

        3: "3rd Year",

        4: "4th Year"

    };


    return yearMap[year] || year;

}


/* =========================================
   CREATE / UPDATE STUDENT
========================================= */

studentForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const id =
            studentIdInput.value;


        const student = {

            name:
                nameInput.value.trim(),

            email:
                emailInput.value.trim(),

            department:
                departmentInput.value.trim(),

            year:
                Number(yearInput.value)

        };


        if (!validateStudent(student)) {

            return;

        }


        try {

            const isUpdate =
                id !== "";


            const url =
                isUpdate
                    ? `${API_URL}/${id}`
                    : API_URL;


            const method =
                isUpdate
                    ? "PUT"
                    : "POST";


            saveButton.disabled = true;

            saveButton.textContent =
                isUpdate
                    ? "Updating..."
                    : "Saving...";


            const response =
                await fetch(url, {

                    method: method,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(student)

                });


            if (!response.ok) {

                const errorText =
                    await response.text();


                throw new Error(
                    getServerErrorMessage(
                        response.status,
                        errorText
                    )
                );

            }


            if (isUpdate) {

                showMessage(
                    "Student updated successfully.",
                    "success"
                );

            } else {

                showMessage(
                    "Student added successfully.",
                    "success"
                );

            }


            resetForm();

            await loadStudents();


        } catch (error) {

            console.error(error);

            showMessage(
                error.message,
                "error"
            );


        } finally {

            saveButton.disabled = false;

            saveButton.textContent =
                "Save Student";

        }

    }
);


/* =========================================
   VALIDATE STUDENT
========================================= */

function validateStudent(student) {

    if (!student.name) {

        showMessage(
            "Student name is required.",
            "error"
        );

        nameInput.focus();

        return false;

    }


    if (student.name.length < 2) {

        showMessage(
            "Name must contain at least 2 characters.",
            "error"
        );

        nameInput.focus();

        return false;

    }


    if (!student.email) {

        showMessage(
            "Email is required.",
            "error"
        );

        emailInput.focus();

        return false;

    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(student.email)) {

        showMessage(
            "Please enter a valid email address.",
            "error"
        );

        emailInput.focus();

        return false;

    }


    if (!student.department) {

        showMessage(
            "Department is required.",
            "error"
        );

        departmentInput.focus();

        return false;

    }


    if (
        !student.year ||
        student.year < 1 ||
        student.year > 4
    ) {

        showMessage(
            "Please select a valid year.",
            "error"
        );

        yearInput.focus();

        return false;

    }


    return true;

}


/* =========================================
   EDIT STUDENT
========================================= */

window.editStudent = function(id) {

    const student =
        students.find(
            item => item.id === id
        );


    if (!student) {

        showMessage(
            "Student not found.",
            "error"
        );

        return;

    }


    studentIdInput.value =
        student.id;


    nameInput.value =
        student.name;


    emailInput.value =
        student.email;


    departmentInput.value =
        student.department;


    yearInput.value =
        student.year;


    formTitle.textContent =
        "Edit Student";


    saveButton.textContent =
        "Update Student";


    cancelButton.classList.remove(
        "hidden"
    );


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

};


/* =========================================
   DELETE STUDENT
========================================= */

window.deleteStudent = async function(id) {

    const student =
        students.find(
            item => item.id === id
        );


    if (!student) {

        showMessage(
            "Student not found.",
            "error"
        );

        return;

    }


    const confirmed =
        confirm(
            `Are you sure you want to delete ${student.name}?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                "Unable to delete student."
            );

        }


        showMessage(
            "Student deleted successfully.",
            "success"
        );


        await loadStudents();


    } catch (error) {

        console.error(error);

        showMessage(
            error.message,
            "error"
        );

    }

};


/* =========================================
   CANCEL EDIT
========================================= */

cancelButton.addEventListener(
    "click",
    function() {

        resetForm();

        showMessage(
            "Edit cancelled.",
            "success"
        );

    }
);


/* =========================================
   RESET FORM
========================================= */

function resetForm() {

    studentForm.reset();


    studentIdInput.value = "";


    formTitle.textContent =
        "Add Student";


    saveButton.textContent =
        "Save Student";


    cancelButton.classList.add(
        "hidden"
    );

}


/* =========================================
   SEARCH
========================================= */

searchInput.addEventListener(
    "input",
    function() {

        renderStudents();

    }
);


/* =========================================
   SHOW MESSAGE
========================================= */

function showMessage(
    text,
    type = "success"
) {

    message.textContent = text;


    message.className =
        `message ${type}`;


    setTimeout(
        function() {

            message.textContent = "";

            message.className =
                "message";

        },
        4000
    );

}


/* =========================================
   SERVER ERROR MESSAGE
========================================= */

function getServerErrorMessage(
    status,
    errorText
) {

    if (status === 400) {

        try {

            const errors =
                JSON.parse(errorText);


            return Object.values(errors)
                .join(" ");

        } catch {

            return (
                errorText ||
                "Invalid student data."
            );

        }

    }


    if (status === 404) {

        return "Student not found.";

    }


    if (status === 409) {

        return (
            errorText ||
            "Email already exists."
        );

    }


    if (status >= 500) {

        return "Server error. Please try again.";

    }


    return (
        errorText ||
        "An unexpected error occurred."
    );

}


/* =========================================
   SECURITY
   Prevent HTML injection when displaying
   user-provided values.
========================================= */

function escapeHtml(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================
   INITIAL APPLICATION LOAD
========================================= */

loadStudents();
