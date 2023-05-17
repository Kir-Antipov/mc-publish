import { main } from "@/program";

/**
 * The exit code for failure situations.
 */
const EXIT_FAILURE = 1;

// Execute the script and catch any errors it may throw.
// If the script threw an error, exit with generic failure exit code.
const exitCode = await main().catch(() => EXIT_FAILURE);
if (typeof exitCode === "number") {
    process.exitCode = exitCode;
}
