const express = require("express");
const router = express.Router();

const jobPositionMasterCtrl = require("../../../services/security/jobPositionMasterCtrl");
const uniqueCtrl = require("../../../services/security/uniqueCtrl");
const CONFIG = require("../../../config");

/**
 * @description 
 * @example http://localhost:3001/v1/AdminMaster/'Route name'
 */
////Un Read Notification Count API : http://localhost:3000/v1/notification/getUnReadNotificationCount

//  save job position data : http://localhost:3000/v1/job-position/create
router.route("/create").post(jobPositionMasterCtrl.create)

//  list job position data : http://localhost:3000/v1/job-position/list
router.route("/list").get(jobPositionMasterCtrl.list);



module.exports = router;