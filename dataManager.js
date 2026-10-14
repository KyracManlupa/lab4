
const API_URL = "/lab3_2411600346/api/courses.php";

let courses = [];

// Fetch course records from the PHP API
async function fetchCoursesFromAPI() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Invalid course data received from API.");
        }

        courses = data.map(course => ({
            ...course,
            id: Number(course.id),
            grade: Number(course.grade),
            units: Number(course.units),
            attendance: Number(course.attendance)
        }));

        return courses;
    } catch (error) {
        console.error("Unable to load courses:", error);
        throw error;
    }
}

// Get all courses
function getCourses() {
    return courses;
}

// Get one course by ID
function getCourseById(id) {
    return courses.find(course => course.id === Number(id));
}

// Filter by category
function getCoursesByCategory(category) {
    if (category === "All") {
        return [...courses];
    }

    return courses.filter(course => course.category === category);
}

// Get pending assignments
function getPendingAssignments() {
    return courses.filter(
        course => course.assignmentStatus === "Pending"
    );
}

// Calculate dashboard statistics
function getCourseStatistics(data = courses) {
    const totalCourses = data.length;

    if (totalCourses === 0) {
        return {
            totalCourses: 0,
            averageGrade: "0.00",
            averageAttendance: "0.00",
            ongoingCourses: 0,
            completedCourses: 0,
            pendingAssignments: 0
        };
    }

    const averageGrade =
        data.reduce((total, course) => total + course.grade, 0)
        / totalCourses;

    const averageAttendance =
        data.reduce((total, course) => total + course.attendance, 0)
        / totalCourses;

    return {
        totalCourses,
        averageGrade: averageGrade.toFixed(2),
        averageAttendance: averageAttendance.toFixed(2),
        ongoingCourses: data.filter(
            course => course.status === "Ongoing"
        ).length,
        completedCourses: data.filter(
            course => course.status === "Completed"
        ).length,
        pendingAssignments: data.filter(
            course => course.assignmentStatus === "Pending"
        ).length
    };
}

// Filter by category
function filterByCategory(category) {
    return getCoursesByCategory(category);
}

// Filter by status
function filterByStatus(status) {
    if (status === "All") {
        return [...courses];
    }

    return courses.filter(course => course.status === status);
}

// Filter by grade range
function filterByGrade(minGrade, maxGrade) {
    return courses.filter(course =>
        course.grade >= Number(minGrade)
        && course.grade <= Number(maxGrade)
    );
}

// Apply multiple filters
function applyFilters(
    category = "All",
    status = "All",
    minGrade = 0,
    maxGrade = 100
) {
    return courses.filter(course => {
        const categoryMatch =
            category === "All" || course.category === category;

        const statusMatch =
            status === "All" || course.status === status;

        const gradeMatch =
            course.grade >= Number(minGrade)
            && course.grade <= Number(maxGrade);

        return categoryMatch && statusMatch && gradeMatch;
    });
}

// Search by course name, code, or instructor
function searchCourses(searchTerm) {
    const term = String(searchTerm || "").toLowerCase().trim();

    if (!term) {
        return [...courses];
    }

    return courses.filter(course =>
        String(course.name).toLowerCase().includes(term)
        || String(course.code).toLowerCase().includes(term)
        || String(course.instructor).toLowerCase().includes(term)
    );
}

// Sort courses by grade
function sortCoursesByGrade(order = "desc", data = courses) {
    return [...data].sort((a, b) =>
        order === "asc"
            ? a.grade - b.grade
            : b.grade - a.grade
    );
}

// Sort courses alphabetically
function sortCoursesByName(order = "asc", data = courses) {
    return [...data].sort((a, b) => {
        const result = a.name.localeCompare(b.name);
        return order === "asc" ? result : -result;
    });
}

// Export course records to CSV
function exportToCSV(data) {
    if (!Array.isArray(data) || data.length === 0) {
        alert("No course data available to export.");
        return;
    }

    const headers = [
        "Course Code",
        "Course Name",
        "Category",
        "Instructor",
        "Grade",
        "Status",
        "Units",
        "Attendance",
        "Assignment Status"
    ];

    function escapeCSV(value) {
        const text = String(value ?? "");
        return `"${text.replace(/"/g, '""')}"`;
    }

    const rows = data.map(course => [
        course.code,
        course.name,
        course.category,
        course.instructor,
        course.grade,
        course.status,
        course.units,
        course.attendance,
        course.assignmentStatus
    ]);

    const csvContent = [
        headers.map(escapeCSV).join(","),
        ...rows.map(row => row.map(escapeCSV).join(","))
    ].join("\r\n");

    downloadCSV("\uFEFF" + csvContent, "student-portal-records.csv");
}

// Download the generated CSV file
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
