const express = require("express");
const router = express.Router();

const peopleGeneralCtrl = require("../../../services/security/peopleGeneralCtrl");
const uniqueCtrl = require("../../../services/security/uniqueCtrl");
const CONFIG = require("../../../config");

/**
 * @description 
 * @example http://localhost:3001/v1/AdminMaster/'Route name'
 */

//  save general info data : http://localhost:3000/v1/people-info/general-info-create-update
router.route("/general-info-create-update").post(peopleGeneralCtrl.generalInfoCreateUpdate)

//  listout of general info data : http://localhost:3000/v1/people-info/general-info-list
router.route("/general-info-list").get(peopleGeneralCtrl.generalInfoList)

//  listout of general info data object : http://localhost:3000/v1/people-info/general-info-list-byID
router.route("/general-info-list-byID").get(peopleGeneralCtrl.generalInfoById)



module.exports = router;