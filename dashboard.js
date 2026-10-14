
let dashboardCourses = [];
let gradesChart = null;
let attendanceChart = null;
let assignmentChart = null;
let notificationTimeout = null;
let simulationInterval = null;

// Get an HTML element by its ID
function getElement(id) {
    return document.getElementById(id);
}

// Show a notification
function showNotification(message) {
    const notification = getElement("updateNotification");

    if (!notification) return;

    notification.textContent = message;
    notification.classList.remove("d-none");

    clearTimeout(notificationTimeout);

    notificationTimeout = setTimeout(() => {
        notification.classList.add("d-none");
    }, 3000);
}

// Set the welcome message
function setGreeting() {
    const greeting = getElement("greeting");

    if (!greeting) return;

    const hour = new Date().getHours();
    let message = "Good evening";

    if (hour < 12) {
        message = "Good morning";
    } else if (hour < 18) {
        message = "Good afternoon";
    }

    greeting.textContent = `${message}! Welcome to your Student Portal.`;
}

// Update dashboard statistics
function updateStatistics(data = dashboardCourses) {
    const stats = getCourseStatistics(data);

    getElement("stat1-value").textContent = stats.averageGrade;
    getElement("stat2-value").textContent = stats.ongoingCourses;
    getElement("stat3-value").textContent = stats.pendingAssignments;
    getElement("stat4-value").textContent =
        `${stats.averageAttendance}%`;
}

// Display pending assignment information
function updatePendingAlert() {
    const alertSection = getElement("alertSection");
    const pending = getPendingAssignments();

    if (pending.length === 0) {
        alertSection.innerHTML = "";
        return;
    }

    alertSection.innerHTML = `
        <div class="alert alert-warning" role="status">
            <strong>Reminder:</strong>
            You have ${pending.length} pending assignment(s).
        </div>
    `;
}

// Get currently filtered and sorted courses
function getFilteredCourses() {
    const searchTerm = getElement("searchInput").value;
    const category = getElement("categoryFilter").value;
    const status = getElement("statusFilter").value;
    const sort = getElement("sortSelect").value;

    let result = applyFilters(category, status, 0, 100);

    if (searchTerm.trim() !== "") {
        const matchingIds = new Set(
            searchCourses(searchTerm).map(course => course.id)
        );

        result = result.filter(course => matchingIds.has(course.id));
    }

    switch (sort) {
        case "grade-high":
            result = sortCoursesByGrade("desc", result);
            break;

        case "grade-low":
            result = sortCoursesByGrade("asc", result);
            break;

        case "name-az":
            result = sortCoursesByName("asc", result);
            break;

        case "name-za":
            result = sortCoursesByName("desc", result);
            break;
    }

    return result;
}

// Display course records in the table
function renderCourseTable(data) {
    const table = getElement("courseTable");

    if (!data.length) {
        table.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    No courses found.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = data.map(course => {
        const statusClass = course.status === "Completed"
            ? "success"
            : "primary";

        const assignmentClass =
            course.assignmentStatus === "Pending"
                ? "warning"
                : "success";

        return `
            <tr>
                <td>${escapeHTML(course.code)}</td>
                <td>${escapeHTML(course.name)}</td>
                <td>${escapeHTML(course.instructor)}</td>
                <td>${Number(course.grade).toFixed(2)}</td>
                <td>
                    <span class="badge text-bg-${statusClass}">
                        ${escapeHTML(course.status)}
                    </span>
                </td>
                <td>${Number(course.attendance)}%</td>
                <td>
                    <span class="badge text-bg-${assignmentClass}">
                        ${escapeHTML(course.assignmentStatus)}
                    </span>
                </td>
            </tr>
        `;
    }).join("");
}

// Escape text before inserting API values into HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Create or refresh the charts
function refreshCharts(data = getFilteredCourses()) {
    if (typeof Chart === "undefined") {
        console.error("Chart.js could not be loaded.");
        return;
    }

    const labels = data.map(course => course.code);
    const grades = data.map(course => Number(course.grade));
    const attendance = data.map(course => Number(course.attendance));

    const pendingCount = data.filter(
        course => course.assignmentStatus === "Pending"
    ).length;

    const submittedCount = data.filter(
        course => course.assignmentStatus !== "Pending"
    ).length;

    if (gradesChart) {
        gradesChart.data.labels = labels;
        gradesChart.data.datasets[0].data = grades;
        gradesChart.update();
    } else {
        gradesChart = new Chart(getElement("gradesChart"), {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Grade",
                    data: grades,
                    backgroundColor: "#0d6efd"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    if (attendanceChart) {
        attendanceChart.data.labels = labels;
        attendanceChart.data.datasets[0].data = attendance;
        attendanceChart.update();
    } else {
        attendanceChart = new Chart(getElement("attendanceChart"), {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Attendance (%)",
                    data: attendance,
                    borderColor: "#198754",
                    backgroundColor: "rgba(25, 135, 84, 0.15)",
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    if (assignmentChart) {
        assignmentChart.data.datasets[0].data = [
            pendingCount,
            submittedCount
        ];
        assignmentChart.update();
    } else {
        assignmentChart = new Chart(getElement("assignmentChart"), {
            type: "doughnut",
            data: {
                labels: ["Pending", "Submitted / Other"],
                datasets: [{
                    data: [pendingCount, submittedCount],
                    backgroundColor: ["#ffc107", "#198754"]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// Update the table and charts when filters change
function applyAllFilters() {
    const filteredCourses = getFilteredCourses();

    renderCourseTable(filteredCourses);
    refreshCharts(filteredCourses);
}

// Show sample recent activities
function renderRecentActivities() {
    const activityTable = getElement("activityTable");

    const activities = [
        {
            activity: "Dashboard Loaded",
            description: "Course information was loaded.",
            date: new Date().toLocaleDateString()
        },
        {
            activity: "Course Monitoring",
            description: "Grades and attendance are available for review.",
            date: new Date().toLocaleDateString()
        },
        {
            activity: "Assignment Reminder",
            description: "Check your courses for pending assignments.",
            date: new Date().toLocaleDateString()
        }
    ];

    activityTable.innerHTML = activities.map(item => `
        <tr>
            <td>${escapeHTML(item.activity)}</td>
            <td>${escapeHTML(item.description)}</td>
            <td>${escapeHTML(item.date)}</td>
        </tr>
    `).join("");
}

// Export the currently filtered courses
function handleExport() {
    exportToCSV(getFilteredCourses());
}

// Logout handler
function handleLogout() {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }

    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");

    window.location.href = "index.html";
}

// Connect dashboard controls
function attachEventListeners() {
    ["searchInput", "categoryFilter", "statusFilter", "sortSelect"]
        .forEach(id => {
            getElement(id).addEventListener("input", applyAllFilters);
            getElement(id).addEventListener("change", applyAllFilters);
        });

    getElement("exportBtn").addEventListener("click", handleExport);
    getElement("logoutBtn").addEventListener("click", handleLogout);
}

// Load dashboard data from the API
async function initializeDashboard() {
    setGreeting();
    attachEventListeners();

    try {
        dashboardCourses = await fetchCoursesFromAPI();

        updateStatistics();
        updatePendingAlert();
        applyAllFilters();
        renderRecentActivities();

        console.log("Student Portal dashboard loaded successfully.");
    } catch (error) {
        getElement("courseTable").innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    Unable to load courses. Check XAMPP and the PHP API.
                </td>
            </tr>
        `;

        getElement("alertSection").innerHTML = `
            <div class="alert alert-danger">
                Course data could not be loaded. Please check the API.
            </div>
        `;
    }
}

// Start after the HTML has loaded
document.addEventListener("DOMContentLoaded", initializeDashboard);
