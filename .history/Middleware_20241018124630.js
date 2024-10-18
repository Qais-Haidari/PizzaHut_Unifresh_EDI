const Client = require("ssh2-sftp-client");
const nodemailer = require("nodemailer");
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
    }

    const host = process.env.SFTPHOST;
    const port = process.env.SFTPPORT;
    const username = process.env.SFTPUSERNAME;
    const password = process.env.SFTPPASSWORD;
    const client = new SFTPClient();
    await client.connect({host,port,username,password});
    const data = await client.listFiles("./uploads");
    console.log(data)
}
    order()