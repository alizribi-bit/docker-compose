const API_URL = "http://localhost:3000";
const authToken = localStorage.getItem("authToken");

if (!authToken) {
  window.location.href = "login.html";
}

// Function to Load Students
async function loadStudents() {
  const response = await fetch(`${API_URL}/students`, {
    headers: { token: authToken },
  });
  const students = await response.json();
  const tbody = document.querySelector("#student-table tbody");
  tbody.innerHTML = "";
  students.forEach((student, index) => {
    const row = `
      <tr>
        <td>${index + 1}</td>
        <td><input type="text" value="${student.name}" id="name-${student._id}" disabled /></td>
        <td>
          <button onclick="enableEdit('${student._id}')">Modify</button>
          <button onclick="updateStudent('${student._id}')">Save</button>
          <button onclick="deleteStudent('${student._id}')">Remove</button>
        </td>
      </tr>`;
    tbody.innerHTML += row;
  });
}

// Add Student
document.getElementById("student-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("student-name").value;

  const response = await fetch(`${API_URL}/students`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: authToken,
    },
    body: JSON.stringify({ name }),
  });

  const data = await response.json();
  alert(data.message || data.error);
  loadStudents();
});

// Enable Edit
function enableEdit(id) {
  document.getElementById(`name-${id}`).disabled = false;
}

// Update Student
async function updateStudent(id) {
  const name = document.getElementById(`name-${id}`).value;

  const response = await fetch(`${API_URL}/students/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      token: authToken,
    },
    body: JSON.stringify({ name }),
  });

  const data = await response.json();
  alert(data.message || data.error);
  loadStudents();
}

// Delete Student
async function deleteStudent(id) {
  const response = await fetch(`${API_URL}/students/${id}`, {
    method: "DELETE",
    headers: { token: authToken },
  });

  const data = await response.json();
  alert(data.message || data.error);
  loadStudents();
}

// Initial Load
loadStudents();
