let Client = require("ssh2-sftp-client");
const {exit} = require("process");
const readTextFile = require("read-text-file");
const axios = require('axios')
// const TXTReport = require('./CreateTXTReport')
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");
const convert = require("xml-js");
const puppeteer = require("puppeteer");
const moment = require('moment')

async function order() {
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
            if (fileObjects == undefined) {
                setInterval(() => {
                    order();
                }, 50000);
            }
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
        for (var i = 0; i < contents.split('\n').slice(1, -1).length; i) {
            masterarr.push(contents.split('\n').slice(1, -1)[i].split(','),contents.split('\n').slice(1, -1)[i].split(',')[1])
            console.log()
            return
            if(masterarr[0].length == 3){
                FinalList.push([masterarr[0][0], masterarr[0][2]])
            }else {
                FinalList.push([masterarr[0][0], masterarr[0][2]]);
                FinalList.push([masterarr[0][3], masterarr[0][5]]);
            }
            let PreFormatOrderDate = `${OrderDate.split('/')[1]}/${OrderDate.split('/')[2]}/${OrderDate.split('/')[0]}`;
            let FormatOrderNumber = '';
            if(PreFormatOrderDate.split('')[0] == 0){
                FormatOrderNumber = PreFormatOrderDate.split('').slice(1,).join('')
            }else {
                FormatOrderNumber = PreFormatOrderDate.split('').join('');
            }
            for (let index1 = 0; index1 < OrderDates.data.length; index1++) {
                const element = OrderDates.data[index1];
                if (element.DISPATCHDAY == FormatOrderNumber) { DeliveryDate = element.DELIVERYDAY }
            }
            if (!DeliveryDate) {
                console.log('Wrong Order Date')
            }else {
                let line = '';
                let masterline = `http://sw.unifresh.com.au:8855/?script=onlineorderingtester&customer=${CustomerName.data[0].CUSTOMER}&requireddate=${DeliveryDate}&ponum=TEST&notes=TEST&`;
                for (let index2 = 0; index2 < FinalList.length; index2++) {
                    const element = FinalList[index2];
                    line += `ItemCode=${element[0]}&qty=${element[1]}&`;
                }
                masterline += line
                let invoicenumbers;
                let NewFilename;
                axios.get(masterline).then(async (res)  =>  {
                    const a = JSON.parse(convert.xml2json(res.data, { compact: true }));
                    if (a.xml.complete._text == 'YES') {
                        invoicenumbers = a.xml.invoice._text;
                        NewFilename = `${filename.split('_')[0]}_${a.xml.invoice._text}_${filename.split('_')[1]}`;
                        TXTReport(PONumber, StoreID, NewFilename, a.xml.invoice._text)
                        const browser = await puppeteer.launch({ headless: false });
                        const page = await browser.newPage();
                        await page.setDefaultNavigationTimeout(120000);
                        await page.goto("https://my.unifresh.com.au/login.php");
                        await page.type("input[name=username", `${CustomerName.data[0].CUSTOMER_WEBUSERNAME}`);
                        await page.type("input[name=password", `${CustomerName.data[0].CUSTOMER_WEBPASS}`);
                        await page.evaluate(() => {document.querySelector("button[type=submit]").click()});
                        await page.waitForNavigation();
                        await page.goto(`https://my.unifresh.com.au/document.php?doc=${invoicenumbers}`);
                        await page.pdf({path: `./PDF/${NewFilename.slice(0, -4)}.pdf`})
                        await browser.close();
                await client.uploadFile(`./Orders/invoice/${NewFilename}`,`./invoice/${NewFilename}`);
                await client.uploadFile(`./Orders/Inbound/${filename}`,`./po/uploaded/${NewFilename}`);
                await client.deleteFile(`./po/${filename}`);
                client.uploadFile(`./PDF/${NewFilename.slice(0, -4)}.pdf`,`./invoice/PDF/${NewFilename.slice(0, -4)}.pdf`);
                client.disconnect();
            }
          })
        }
    }
}
}
order()