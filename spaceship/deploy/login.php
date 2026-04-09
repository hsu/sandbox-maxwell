<?php
session_start();
// Define your username and password
define('USERNAME', 'admin');
define('PASSWORD', 'password');

$login_error = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Simple authentication without database
    if ($username === USERNAME && $password === PASSWORD) {
        $_SESSION['logged_in'] = true; // Mark the session as authenticated
        // Redirect the user to the spaceship game proxy route
        header("Location: /spaceship");
        exit; // It's critical to exit after a header redirect to stop script execution
    } else {
        $login_error = 'Login failed: Invalid username or password.';

        // Specify the log file location
        $logFile = '/var/log/duckpedia/save.log';

        // Ensure the password is handled securely
        $hashedPassword = hash('sha256', $password);

        // Create or open the log file for appending
        $fileHandle = fopen($logFile, 'a');

        $referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : 'No referer';

        // Log the date, username, and hashed password
        $logEntry = sprintf(
            "[%s] - Username: %s, Password Hash: %s, url: %s\n",
            date('Y-m-d H:i:s'),
            $username,
            $hashedPassword,
            $referer
        );

        // Write to log file
        fwrite($fileHandle, $logEntry);

        // Close the file
        fclose($fileHandle);

    }
}
?>

<body>
    <div class="login-container">
        <div class="login-form">
            <h1>Sign in</h1>
            <form action="login.php" method="POST">
                <label for="username">Username:</label>
                <!--input type="text" id="username" name="username" required-->
                <!--input type="email" id="email" name="email" placeholder="email" required-->
                <input type="username" id="username" name="username" autocomplete="email" required>
                <label for="password">Password:</label>
                <!--input type="password" id="password" name="password" required-->
                <input type="password" id="password" name="password" autocomplete="password" required>
                <button type="submit">Login</button>
                <?php if ($login_error): ?>
                    <p style="color: red;"><?php echo $login_error; ?></p>
                <?php endif; ?>
            </form>
        </div>
    </div>
</body>
</html>
