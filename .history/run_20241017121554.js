let Client = require("ssh2-sftp-client");
const {exit} = require("process");
const readTextFile = require("read-text-file");
const axios = require('axios')
const nodemailer = require("nodemailer");
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");
const convert = require("xml-js");
const puppeteer = require("puppeteer");
const moment = require('moment');
const { format } = require("path");

async function order() {
    const SendEmail = nodemailer.createTransport({
        'host': "smtp.office365.com",
        'port': "587",
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
        constructor() {
            this.client = new Client();
        }

        async connect(options) {
            console.log(`Connecting to ${options.host}:${options.port}`);
            try {
                await this.client.connect(options);
            } catch (err) {
                console.log("Failed to connect:", err);
            }
        }

        async disconnect() {
            await this.client.end();
        }
        async listFiles(remoteDir, fileGlob) {
            console.log(`Listing ${remoteDir} ...`);
            let fileObjects;
            try {
                fileObjects = await this.client.list(remoteDir, fileGlob);
            } catch (err) {
                console.log("Listing failed:", err);
            }
            const fileNames = [];
            for (const file of fileObjects) {
                if (file.type === "d") {
                    console.log(
                        `${new Date(file.modifyTime).toISOString()} PRE ${file.name}`
                    );
                } else {
                    console.log(
                        `${new Date(file.modifyTime).toISOString()} ${file.size} ${
              file.name
            }`
                    );
                }

                fileNames.push(file.name);
            }
            return fileNames;
        }
        async uploadFile(localFile, remoteFile) {
            console.log(`Uploading ${localFile} to ${remoteFile} ...`);
            try {
                await this.client.put(localFile, remoteFile);
            } catch (err) {
                console.error("Uploading failed:", err);
            }
        }

        async downloadFile(remoteFile, localFile) {
            console.log(`Downloading ${remoteFile} to ${localFile} ...`);
            try {
                await this.client.get(remoteFile, localFile);
            } catch (err) {
                console.error("Downloading failed:", err);
            }
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

    const host = "sftpdev.unifresh.com.au";
    const port = "22";
    const username = "pizzahut";
    const password = "s@X}Z~231>x1";
    const client = new SFTPClient();
    await client.connect({host,port,username,password});
    const data = await client.listFiles("./uploads");
    let filename = data[0];
    if (filename == undefined || filename == 'uploaded') {
        await client.disconnect();
        console.log("No File Found");
        exit();
    } else {
        await client.downloadFile(`./uploads/${filename}`,`./Orders/Inbound/${filename}`);
        var contents = readTextFile.readSync(`./Orders/Inbound/${filename}`);
        const StoreID = contents.split('\n')[0].split(',')[0];
        const OrderDate = contents.split('\n')[0].split(',')[2];
        const PONumber = 0;
        const CustomerName = await axios.get(`http://10.0.0.52:5000/Ostendo/EDI/CUSTOMER/DETAIL/${StoreID}`);
        const OrderDates = await axios.get(`http://10.0.0.52:5000/Ostendo/EDI/CUSTOMER/SCHEDULE/DETAIL/${CustomerName.data[0].CUSTOMER}`)
        let masterarr = [];
        let FinalList = [];
        let DeliveryDate;
        for (var i = 0; i <= contents.split('\n').slice(1, -1).length - 1; i++) {
            masterarr.push([contents.split('\n').slice(1, -1)[i].split(',')[0],contents.split('\n').slice(1, -1)[i].split(',')[1].replace('\r','')])
            for (let index1 = 0; index1 < OrderDates.data.length; index1++) {
                const element = OrderDates.data[index1];
                if (element.DISPATCHDAY == moment(OrderDate).format('D/MM/YYYY')) { DeliveryDate = element.DELIVERYDAY }
            }
            if (!DeliveryDate) {
                console.log('Wrong Order Date')
            }else {
                let line = '';
                let masterline = `http://sw.unifresh.com.au:8855/?script=onlineorderingtester&customer=${CustomerName.data[0].CUSTOMER}&requireddate=${DeliveryDate}&ponum=TEST&notes=TEST&`;
                for (let index2 = 0; index2 < masterarr.length; index2++) {
                    const element = masterarr[index2];
                    line += `ItemCode=${element[0]}&qty=${element[1].replace('.000','')}&`;
                }
                masterline += line
                axios.get(masterline).then(async (res)  =>  {
                    console.log(res)
                    const a = JSON.parse(convert.xml2json(res.data, { compact: true }));
                    if(a.xml.complete._text == "YES"){
                        var _0x571196 = {
                            'from': "CustomerService@unifresh.com.au",
                            'to': 'technology@unifresh.com.au',
                            'subject': "PizzaHut Order Confirmation!",
                            'text': `Order Place Successfully.
                                     Customer: ${CustomerName.data[0].CUSTOMER} \n 
                                     Store ID: ${StoreID} \n
                                     Order Date: ${OrderDate} \n
                                     PO Number: ${PONumber}`
                          };
                          SendEmail.sendMail(_0x571196, function (_0xb8b9df, _0x2d173d) {
                            if (_0xb8b9df) {
                              console.log(_0xb8b9df);
                            } else {
                              console.log("Email sent: " + _0x2d173d.response);
                            }
                          });
                    }else {
                        var _0x571196 = {
                            'from': "CustomerService@unifresh.com.au",
                            'to': 'technology@unifresh.com.au',
                            'subject': "PizzaHut Order Confirmation!",
                            'text': `Order Place Unsuccessfully.
                            Customer: ${CustomerName.data[0].CUSTOMER} 
                            Store ID: ${StoreID}
                            Order Date: ${OrderDate}
                            PO Number: ${PONumber}
                            Reason: ${a}`
                          };
                          SendEmail.sendMail(_0x571196, function (_0xb8b9df, _0x2d173d) {
                            if (_0xb8b9df) {
                              console.log(_0xb8b9df);
                            } else {
                              console.log("Email sent: " + _0x2d173d.response);
                            }
                          });
                    }
                })
        }
        }
}
}
order()