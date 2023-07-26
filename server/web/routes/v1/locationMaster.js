const express = require("express");
const router = express.Router();

const locationMasterCtrl = require("../../../services/security/locationMasterCtrl");
const uniqueCtrl = require("../../../services/security/uniqueCtrl");
const CONFIG = require("../../../config");

/**
 * @description 
 * @example http://localhost:3001/v1/AdminMaster/'Route name'
 */
////Un Read Notification Count API : http://localhost:3000/v1/notification/getUnReadNotificationCount

//  save location data : http://localhost:3000/v1/location-master/createUpdate
router.route("/createUpdate").post(locationMasterCtrl.create)

//  list location data : http://localhost:3000/v1/location-master/list
router.route("/list").get(locationMasterCtrl.list);

//  list location data : http://localhost:3000/v1/location-master/activeList
router.route("/activeList").get(locationMasterCtrl.activeList);

//  list location data by id : http://localhost:3000/v1/location-master/listById
router.route("/listById").get(locationMasterCtrl.listById);



module.exports = router;