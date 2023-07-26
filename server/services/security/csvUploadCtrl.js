let csvUploadCtrl = {};
const HttpRespose = require("../../common/httpResponse");
const Logger = require("../../common/logger");
const bcrypt = require("bcryptjs");
const ObjectID = require("mongodb").ObjectID;
const CONFIG = require("../../config");
const async = require("async");
const AppCode = require("../../common/constant/appCods");
const { query } = require("express");
const _ = require("lodash");
const readXlsxFile = require("read-excel-file/node");

const csvUploadModel = new (require("../../common/model/csvUploadModel"))();
// const csvParser = require('csv-parser');
const fs = require("fs");
const csv = require('fast-csv');


csvUploadCtrl.csvExcelUpload = (req, res) => {
    const response = new HttpRespose();

    try {
        let extension = '';
        if (!!req.files.excelUpload) {
            req.body.excelUpload = req.files.excelUpload[0].filename;
            extension = req.files.excelUpload[0].filename.split('.').pop();
        }
        console.log(extension);

        if (extension == 'csv') {
            // promise through set csv upload code
            var bar = new Promise((resolve) => {
                const data = [];

                // const rowcheck = fs.createReadStream(req.files.excelUpload[0].path).pipe(csvParser());
                fs.createReadStream(req.files.excelUpload[0].path).pipe(csv.parse())
                    .on('data', (row) => {
                        let orderDate = new Date(new Date(row[5]));
                        orderDate.setHours(5, 30, 0, 0);

                        let shipDate = new Date(new Date(row[11]));
                        shipDate.setHours(5, 30, 0, 0);



                        let rowObj = {
                            category: row[0],
                            city: row[1],
                            country: row[2],
                            customerName: row[3],
                            manufacturer: row[4],
                            orderDate: orderDate,
                            orderID: row[6],
                            postalCode: row[7],
                            produtName: row[8],
                            region: row[9],
                            segment: row[10],
                            shipDate: shipDate,
                            shipMode: row[12],
                            state: row[13],
                            subCategory: row[14],
                            discount: parseFloat(row[15]),
                            profit: parseFloat(row[16]),
                            quantity: parseFloat(row[17]),
                            sales: parseFloat(row[18])
                        }
                        data.push(rowObj);
                    })
                    .on('end', () => {
                        data.splice(0, 1);

                        console.log("datalength", data.length);
                        csvUploadModel.createMany(data, function (err) {
                            if (err) {
                                response.setError(AppCode.InternalServerError);
                                response.send(res);
                            } else {
                                response.setData(AppCode.Success);
                                response.send(res);
                            }
                        });
                    })
                    .on('error', (error) => {
                        reject(error);
                    });
            })
        }
        else {
            /* excel upload code */

            const excelStartDate = new Date(1899, 11, 30); // Excel's start date: December 30, 1899
            // const excelDate = new Date(excelStartDate);
            // excelDate.setDate(excelStartDate.getDate() + excelDateSerialNumber);


            readXlsxFile(req.files.excelUpload[0].path).then((rows) => {
                if (rows.length > 0) {
                    let excelList = [];
                    var lengthArray = rows.length;
                    var bar = new Promise((resolve) => {
                        rows.forEach(function (xslxData, index) {
                            if (index > 0) {
                                const excelOrderDate = new Date(excelStartDate);
                                let orderDate = new Date(excelOrderDate.setDate(excelStartDate.getDate() + xslxData[5]));
                                orderDate.setHours(5, 30, 0, 0);

                                const excelShipDate = new Date(excelStartDate);
                                let shipDate = new Date(excelShipDate.setDate(excelStartDate.getDate() + xslxData[11]));
                                shipDate.setHours(5, 30, 0, 0);
                                // new Date(row[11].split('/')[2] + '-' + row[11].split('/')[0] + '-' + row[11].split('/')[1])

                                let excelData = {
                                    category: xslxData[0],
                                    city: xslxData[1],
                                    country: xslxData[2],
                                    customerName: xslxData[3],
                                    manufacturer: xslxData[4],
                                    orderDate: orderDate,
                                    orderID: xslxData[6],
                                    postalCode: xslxData[7],
                                    produtName: xslxData[8],
                                    region: xslxData[9],
                                    segment: xslxData[10],
                                    shipDate: shipDate,
                                    shipMode: xslxData[12],
                                    state: xslxData[13],
                                    subCategory: xslxData[14],
                                    discount: parseFloat(xslxData[15]),
                                    profit: parseFloat(xslxData[16]),
                                    quantity: parseFloat(xslxData[17]),
                                    sales: parseFloat(xslxData[18])
                                }

                                excelList.push(excelData);
                            } else {
                                if (lengthArray === index + 1) {
                                    resolve();
                                }
                            }
                        });

                        csvUploadModel.createMany(excelList, function (err) {
                            if (err) {
                                response.setError(AppCode.InternalServerError);
                                response.send(res);
                            } else {
                                response.setData(AppCode.Success);
                                response.send(res);
                            }
                        });
                    });
                    bar.then(() => {
                        console.log(excelList);
                    });
                }
                //   console.log(rows)
            });

        }



        /* csv upload code */
        // const content = fs.readFileSync(req.files.excelUpload[0].path, 'utf-8');
        // const rows = content.split('\n');
        // const header = rows[0].replace("\r", "").split(',');

        // const data = [];

        // var bar = new Promise((resolve) => {
        // rows.forEach((x, index) => {
        //     if (index > 0) {
        //         if (x) {

        //             const values = x.replace("\r", "").split(',');
        //             const row = {};
        //             for (let j = 0; j < header.length; j++) {
        //                 row[header[j]] = values[j];
        //             }
        //             data.push({
        //                 name: row.name,
        //                 email: row.email,
        //                 gender: row.gender,
        //                 birthdate: new Date(row.birthdate.split('/')[2] + '-' + row.birthdate.split('/')[1] + '-' + row.birthdate.split('/')[0]),
        //                 mobile: row.mobile,
        //                 number: parseInt(row.number)
        //             });
        //         }
        //     }
        //     else {
        //         if (index + 1 == rows.length) {
        //             resolve();
        //         }
        //     }
        // })
        // })


        /* excel upload code */
        // readXlsxFile(req.files.excelUpload[0].path).then((rows) => {
        //     if (rows.length > 0) {
        //         let excelList = [];
        //         var lengthArray = rows.length;
        //         var bar = new Promise((resolve) => {
        //             rows.forEach(function (xslxData, index) {
        //                 if (index > 0) {
        //                     let excelData = {};
        //                     excelData.name = xslxData[0];
        //                     excelData.email = xslxData[1];
        //                     excelData.gender = xslxData[2];
        //                     excelData.birthdate = new Date(xslxData[3].split('/')[2] + '-' + xslxData[3].split('/')[1] + '-' + xslxData[3].split('/')[0]);
        //                     excelData.mobile = xslxData[4].toString();
        //                     excelList.push(excelData);
        //                 } else {
        //                     if (lengthArray === index + 1) {
        //                         resolve();
        //                     }
        //                 }
        //             });

        //             csvUploadModel.createMany(excelList, function (err) {
        //                 if (err) {
        //                     response.setError(AppCode.InternalServerError);
        //                     response.send(res);
        //                 } else {
        //                     response.setData(AppCode.Success);
        //                     response.send(res);
        //                 }
        //             });
        //         });
        //         bar.then(() => {
        //             console.log(excelList);
        //         });
        //     }
        //     //   console.log(rows)
        // });

    } catch (exception) {
        console.log(exception);
        response.setError(AppCode.InternalServerError);
        response.send(res);
    }
};


module.exports = csvUploadCtrl;