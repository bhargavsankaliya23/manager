const express = require("express");
const router = express.Router();

const csvUploadCtrl = require("../../../services/security/csvUploadCtrl");
const uniqueCtrl = require("../../../services/security/uniqueCtrl");
const CONFIG = require("../../../config");

/**
 * @description 
 * @example http://localhost:3001/v1/AdminMaster/'Route name'
 */
////Un Read Notification Count API : http://localhost:3000/v1/notification/getUnReadNotificationCount

//  save role data : http://localhost:3000/v1/csv/csv-upload
router.route("/csv-upload").post(csvUploadCtrl.csvExcelUpload)

module.exports = router;