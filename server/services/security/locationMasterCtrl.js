let locationMasterCtrl = {};
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

const locationMasterModel = new (require("../../common/model/locationMasterModel"))();

const fs = require("fs");


/* location Create */
locationMasterCtrl.create = (req, res) => {
    var response = new HttpRespose()
    var bodyData = req.body;
    if (req.query._id) {
        try {
            let query = { _id: ObjectID(req.query._id) };
            locationMasterModel.findOne(query, function (err, locationData) {
                if (err) {
                    response.setError(AppCode.Fail);
                    response.send(res);
                } else {
                    if (locationData === null) {
                        response.setError(AppCode.NotFound);
                        response.send(res);
                    } else {
                        locationMasterModel.update(query, bodyData, function (err, locationData) {
                            if (err) {
                                console.log(err)
                                response.setError(AppCode.Fail);
                                response.send(res);
                            } else if (locationData == undefined || (locationData.matchedCount === 0 && locationData.modifiedCount === 0)) {
                                response.setError(AppCode.NotFound);
                            } else {
                                req.body._id = req.query._id
                                response.setData(AppCode.Success, req.body);
                                response.send(res);
                            }
                        });
                    }
                }
            });
        } catch (exception) {
            response.setError(AppCode.Fail);
            response.send(res);
        }
    }
    else {
        let query = { email: req.body.email }

        locationMasterModel.findOne(query, {}, (err, locationData) => {
            if (err) {
                console.log(err)
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (locationData !== null) {
                response.setError(AppCode.AllreadyExist);
                response.send(res);
            } else {
                locationMasterModel.create(bodyData, (err, peopleGeneralInfoCreate) => {
                    if (err) {
                        console.log(err)
                        response.setError(AppCode.Fail);
                        response.send(res);
                    } else {
                        response.setData(AppCode.Success, peopleGeneralInfoCreate);
                        response.send(res);
                    }
                });
            }
        })
    }
};


/* location List */
locationMasterCtrl.list = (req, res) => {
    const response = new HttpRespose();
    try {
        locationMasterModel.aggregate([], (err, jobPositionData) => {
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

/* location active List */
locationMasterCtrl.activeList = (req, res) => {
    const response = new HttpRespose();
    try {
        let query = [
            {
                $match: {
                    status: 1
                }
            },
        ];
        locationMasterModel.aggregate(query, (err, jobPositionData) => {
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

/* job Details By Id*/
locationMasterCtrl.listById = (req, res) => {
    const response = new HttpRespose();
    try {
        let query = [
            {
                $match: {
                    _id: ObjectID(req.query._id)
                }

            },
        ];
        locationMasterModel.advancedAggregate(query, {}, (err, listByIdData) => {
            if (err) {
                throw err;
            } else if (_.isEmpty(listByIdData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                response.setData(AppCode.Success, listByIdData[0]);
                response.send(res);
            }
        });
    } catch (exception) {
        response.setError(AppCode.InternalServerError);
        response.send(res);
    }
}


module.exports = locationMasterCtrl;