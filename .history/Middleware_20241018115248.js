const Client = require("ssh2-sftp-client");
const nodemailer = require("nodemailer");
require('dotenv').config()
console.log(process.env.USER)
async function order() {
    const SendEmail = nodemailer.createTransport({
        'host': process.env.EMAILHOST,
        'port': process.env.EMAILPORT,
        'secureConnection': true,
        'tls': {
          'ciphers': 'SSLv3'
        },
        'auth': {
          'user': 'CustomerService@unifresh.com.au',
          'pass': "ypzgnwhfgqnrzcbm"
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

    const host = "sftpdev.unifresh.com.au";
    const port = "22";
    const username = "pizzahut";
    const password = "s@X}Z~231>x1";
    const client = new SFTPClient();
    await client.connect({host,port,username,password});
    const data = await client.listFiles("./uploads");
}
    order()