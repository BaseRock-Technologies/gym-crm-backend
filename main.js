const { spawn } = require('child_process');
const sleep = require('util').promisify(setTimeout);

(async function main() {
    while (true) {
        // Run the server script as a child process and return console output
        const proc = spawn('npm', ['start'], {
            stdio: 'inherit',
            shell: true
        });

        // Wait for the server to finish (or crash)
        const exitCode = await new Promise((resolve) => {
            proc.on('exit', resolve);
        });

        // Print message indicating whether the server exit status
        console.log(`Server exited with return code ${exitCode}`);

        // Wait a few seconds before restarting the server
        await sleep(100);
    }
})();