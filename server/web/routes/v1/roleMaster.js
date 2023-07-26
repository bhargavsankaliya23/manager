const express = require("express");
const router = express.Router();

const roleMasterCtrl = require("../../../services/security/roleMasterCtrl");
const uniqueCtrl = require("../../../services/security/uniqueCtrl");
const CONFIG = require("../../../config");

/**
 * @description 
 * @example http://localhost:3001/v1/AdminMaster/'Route name'
 */
////Un Read Notification Count API : http://localhost:3000/v1/notification/getUnReadNotificationCount

//  save role data : http://localhost:3000/v1/role-master/create
router.route("/create").post(roleMasterCtrl.roleCreate)

//  update role data : http://localhost:3000/v1/role-master/update
router.route("/update").post(roleMasterCtrl.roleUpdate)

//  soft delete role data active deactive : http://localhost:3000/v1/role-master/active-deactive
router.route("/active-deactive").get(roleMasterCtrl.roleActiveDeactive)

//  list role data : http://localhost:3000/v1/role-master/list
router.route("/list").get(roleMasterCtrl.roleList);

//  active list role data : http://localhost:3000/v1/role-master/active-list
router.route("/active-list").get(roleMasterCtrl.activeRoleList);

//  list role data by id : http://localhost:3000/v1/role-master/listdata-byId
router.route("/listdata-byId").get(roleMasterCtrl.roleDetailsById);

//  delete role data by id : http://localhost:3000/v1/role-master/delete
router.route("/delete").get(roleMasterCtrl.deleteRole);


module.exports = router;