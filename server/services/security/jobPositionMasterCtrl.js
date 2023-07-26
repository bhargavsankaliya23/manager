let jobPositionMasterCtrl = {};
const HttpRespose = require("../../common/httpResponse");
const Logger = require("../../common/logger");
const bcrypt = require("bcryptjs");
const blacklist = require('express-jwt-blacklist');
const ObjectID = require("mongodb").ObjectID;
const CONFIG = require("../../config");
// const _ = require("lodash");
const async = require("async");
const AppCode = require("../../common/constant/appCods");
const { ObjectId } = require("mongodb");
const { query } = require("express");
const _ = require("lodash");

const jobPositionMasterModel = new (require("../../common/model/jobPositionMasterModel"))();

const fs = require("fs");


/* Job Position Create */
jobPositionMasterCtrl.create = (req, res) => {
    var response = new HttpRespose()
    var data = req.body;
    let query = { name: req.body.name }
    jobPositionMasterModel.findOne(query, {}, (err, JobPositionData) => {
        if (err) {
            console.log(err)
            response.setError(AppCode.Fail);
            response.send(res);
        } else if (JobPositionData !== null) {
            response.setError(AppCode.AllreadyExist);
            response.send(res);
        } else {
            jobPositionMasterModel.create(data, (err, jobPositionCreate) => {
                if (err) {
                    console.log(err)
                    response.setError(AppCode.Fail);
                    response.send(res);
                } else {
                    response.setData(AppCode.Success, jobPositionCreate);
                    response.send(res);
                }
            });
        }
    })
};


/* Job Position List */
jobPositionMasterCtrl.list = (req, res) => {
    const response = new HttpRespose();
    try {
        jobPositionMasterModel.aggregate([], (err, jobPositionData) => {
            if (err) {
                throw err;
            } else if (_.isEmpty(jobPositionData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                response.setData(AppCode.Success, jobPositionData);
                response.send(res);
            }
        });
    } catch (exception) {
        response.setError(AppCode.InternalServerError);
        response.send(res);
    }
}


module.exports = jobPositionMasterCtrl;