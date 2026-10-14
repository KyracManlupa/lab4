const loginBtn = document.getElementById("loginBtn");
const loginAlert = document.getElementById("loginAlert");

loginBtn.addEventListener("click", function () {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "admin" && password === "password123") {

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", username);

        loginAlert.innerHTML = `
            <div class="alert alert-success">
                Login successful! Redirecting to dashboard...
            </div>
        `;

        setTimeout(function () {
            window.location.href = "dashboard.html";
        }, 1000);

    } else {

        loginAlert.innerHTML = `
            <div class="alert alert-danger">
                Invalid username or password.
            </div>
        `;

    }

});