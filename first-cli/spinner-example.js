import ora from "ora";
import cliSpinners from "cli-spinners";

async function performTask() {
    const spinner = ora({
        text: "Loading...",
        spinner: cliSpinners.dots, // Use a spinner from cli-spinners
    }).start();

    // Simulate an asynchronous operation
    await new Promise((resolve) => setTimeout(resolve, 3000));

    spinner.succeed("Task completed!");
    spinner.warn("This is a warning message.");
    spinner.fail("This is an error message.");
    spinner.stop(); // Stop the spinner
}

performTask();
