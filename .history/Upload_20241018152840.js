const ftp = require("basic-ftp");
const fs = require("fs");

async function connectToFtpWithTLS() {
    const client = new ftp.Client();
    client.ftp.verbose = true; // Enable logging for debugging

    try {
        await client.access({
            host: "sw.unifresh.com.au",  // FTP host
            port: 2133,                  // Port for explicit TLS
            user: "ph",                  // Username
            password: "pizzahut",        // Password
            secure: true,          // Explicit FTPS (TLS/SSL)
            secureOptions: {
                minVersion: "TLSv1.2",   // Ensure compatibility with TLSv1.2+
                rejectUnauthorized: false, // Ignore cert validation for self-signed certificates
            }
        });
        client.ftp.passive = true;
        const localFiles = fs.readdirSync('./Download');
        for (const file of localFiles) {
            if (fs.statSync(`./Download/${file}`).isFile()) {
                await client.uploadFrom(`./Download/${file}`, `./${file}`);
                fs.unlink(`./Download/${file}`);
            } else {
                // console.log(`${localFilePath} is not a file. Skipping.`);
            }
        }
    } catch (err) {
        console.error("Error connecting to the FTP server:", err);
    } finally {
        client.close();
    }
}

connectToFtpWithTLS();