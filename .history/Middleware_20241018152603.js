const Client = require("ssh2-sftp-client");
const nodemailer = require("nodemailer");
const ftp = require("basic-ftp");
const fs = require("fs");
require('dotenv').config()
async function order() {
    const SendEmail = nodemailer.createTransport({
        'host': process.env.EMAILHOST,
        'port': process.env.EMAILPORT,
        'secureConnection': true,
        'tls': {
          'ciphers': 'SSLv3'
        },
        'auth': {
          'user': process.env.EMAILUSER,
          'pass': process.env.EMAILPASSWORD
        }
      });
    class SFTPClient {
        constructor() {this.client = new Client();}
        async connect(options) {console.log(`Connecting to ${options.host}:${options.port}`);try {await this.client.connect(options);} catch (err) {console.log("Failed to connect:", err);}}
        async disconnect() {await this.client.end();}
        async listFiles(remoteDir, fileGlob) {
            console.log(`Listing ${remoteDir} ...`);
            let fileObjects;
            try {
                fileObjects = await this.client.list(remoteDir, fileGlob);} catch (err) {console.log("Listing failed:", err);}
            const fileNames = [];
            for (const file of fileObjects) {if (file.type === "d") {console.log(`${new Date(file.modifyTime).toISOString()} PRE ${file.name}`);}else{
                console.log(`${new Date(file.modifyTime).toISOString()} ${file.size} ${file.name}`);}
                fileNames.push(file.name);}
                return fileNames;
            }
        async downloadFile(remoteFile, localFile) {
            console.log(`Downloading ${remoteFile} to ${localFile} ...`);
            try {await this.client.get(remoteFile, localFile);} catch (err) {console.error("Downloading failed:", err);}
        }
        async deleteFile(remoteFile) {
            console.log(`Deleting ${remoteFile}`);
            try {
                await this.client.delete(remoteFile);
            } catch (err) {
                console.error("Deleting failed:", err);
            }
        }
    }

    const host = process.env.SFTPHOST;
    const port = process.env.SFTPPORT;
    const username = process.env.SFTPUSERNAME;
    const password = process.env.SFTPPASSWORD;
    const client = new SFTPClient();
    await client.connect({host,port,username,password});
    const data = await client.listFiles("./uploads");
    for (const file of data) {
        await client.downloadFile(`${"./uploads"}/${file}`, `./Download/${file}`);
        await client.downloadFile(`${"./uploads"}/${file}`, `./ALLFILES/${file}`);
        await client.deleteFile(`${"./uploads"}/${file}`)
    }
    await client.disconnect()
}
    // order()

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
                    fs.unlink(localFilePath, (err) => {
                    });
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
    