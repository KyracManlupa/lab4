
<?php
header("Content-Type: application/json; charset=UTF-8");

$courses = [
    [
        "id" => 1,
        "code" => "ITE313",
        "name" => "Web Systems and Technologies",
        "category" => "IT",
        "instructor" => "Instructor 1",
        "grade" => 95,
        "status" => "Ongoing",
        "units" => 3,
        "attendance" => 95,
        "assignmentStatus" => "Pending"
    ],
    [
        "id" => 2,
        "code" => "IM101",
        "name" => "Advanced Database Systems",
        "category" => "IT",
        "instructor" => "Instructor 2",
        "grade" => 92,
        "status" => "Ongoing",
        "units" => 3,
        "attendance" => 93,
        "assignmentStatus" => "Completed"
    ],
    [
        "id" => 3,
        "code" => "ITE311",
        "name" => "Networking 1",
        "category" => "IT",
        "instructor" => "Instructor 3",
        "grade" => 94,
        "status" => "Ongoing",
        "units" => 3,
        "attendance" => 96,
        "assignmentStatus" => "Completed"
    ],
    [
        "id" => 4,
        "code" => "ITE312",
        "name" => "Data Structures and Algorithms",
        "category" => "IT",
        "instructor" => "Instructor 4",
        "grade" => 90,
        "status" => "Ongoing",
        "units" => 3,
        "attendance" => 91,
        "assignmentStatus" => "Pending"
    ],
    [
        "id" => 5,
        "code" => "RIZAL",
        "name" => "Life and Works of Rizal",
        "category" => "General Education",
        "instructor" => "Instructor 5",
        "grade" => 93,
        "status" => "Completed",
        "units" => 3,
        "attendance" => 97,
        "assignmentStatus" => "Completed"
    ],
    [
        "id" => 6,
        "code" => "PATHFIT3",
        "name" => "PATHFIT 3",
        "category" => "General Education",
        "instructor" => "Instructor 6",
        "grade" => 96,
        "status" => "Ongoing",
        "units" => 2,
        "attendance" => 98,
        "assignmentStatus" => "Completed"
    ]
];

echo json_encode($courses, JSON_PRETTY_PRINT);
