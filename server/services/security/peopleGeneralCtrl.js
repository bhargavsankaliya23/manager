let peopleGeneralCtrl = {};
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

const peopleGeneralModel = new (require("../../common/model/peopleGeneralModel"))();

const fs = require("fs");


/* General Info Create */
peopleGeneralCtrl.generalInfoCreateUpdate = (req, res) => {
    var response = new HttpRespose()

    var bodyData = req.body;

    if (req.query._id) {
        try {
            let query = { _id: ObjectID(req.query._id) };
            peopleGeneralModel.findOne(query, function (err, generalInfoData) {
                if (err) {
                    response.setError(AppCode.Fail);
                    response.send(res);
                } else {
                    if (generalInfoData === null) {
                        response.setError(AppCode.NotFound);
                        response.send(res);
                    } else {
                        if (bodyData.role) {
                            bodyData.role = ObjectID(req.body.role);
                        }
                        if (bodyData.jobPosition) {
                            bodyData.jobPosition = ObjectID(req.body.jobPosition);
                        }
                        if (bodyData.location) {
                            bodyData.location = ObjectID(req.body.location);
                        }
                        if (bodyData.birthDate && bodyData.birthDate != 'null') {
                            bodyData.birthDate = new Date(bodyData.birthDate).toUTCString()
                        }
                        if (bodyData.hireDate && bodyData.hireDate != 'null') {
                            bodyData.hireDate = new Date(bodyData.hireDate).toUTCString()
                        }
                        if (req.files) {
                            if (req.files.profilePicture) {
                                bodyData.profilePicture = req.files.profilePicture[0].filename;
                            }
                        }

                        peopleGeneralModel.update(query, bodyData, function (err, generalInfoData) {
                            if (err) {
                                console.log(err)
                                response.setError(AppCode.Fail);
                                response.send(res);
                            } else if (generalInfoData == undefined || (generalInfoData.matchedCount === 0 && generalInfoData.modifiedCount === 0)) {
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
        if (bodyData.role) {
            bodyData.role = ObjectID(req.body.role);
        }
        peopleGeneralModel.findOne(query, {}, (err, generalInfoData) => {
            if (err) {
                console.log(err)
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (generalInfoData !== null) {
                response.setError(AppCode.AllreadyExist);
                response.send(res);
            } else {
                peopleGeneralModel.create(bodyData, (err, peopleGeneralInfoCreate) => {
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

/* General info List */
peopleGeneralCtrl.generalInfoList = (req, res) => {
    const response = new HttpRespose();
    try {

        let condition = {};
        condition["$and"] = [];
        condition["$and"].push({
            $or: [
                {
                    status: 1
                },
                {
                    status: 2
                },
            ]
        });

        if (!!req.query.location && req.query.location != "null") {
            condition["$and"].push({
                location: ObjectID(req.query.location),
            });
        }
        if (!!req.query.role && req.query.role != "null") {
            condition["$and"].push({
                role: ObjectID(req.query.role),
            });
        }

        let query = [
            {
                $match: condition,
            },
            {
                $lookup: {
                    from: "Role",
                    as: "roleData",
                    let: {
                        roleId: "$role",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$roleId"],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                roleName: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: {
                    path: "$roleData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "location-master",
                    as: "locationData",
                    let: {
                        locationId: "$location",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$locationId"],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: {
                    path: "$locationData",
                    preserveNullAndEmptyArrays: true,
                },
            },
        ]
        peopleGeneralModel.aggregate(query, (err, generalInfoData) => {
            if (err) {
                throw err;
            } else if (_.isEmpty(generalInfoData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                response.setData(AppCode.Success, generalInfoData);
                response.send(res);
            }
        });
    } catch (exception) {
        response.setError(AppCode.InternalServerError);
        response.send(res);
    }
}

/* general info Details By Id*/
peopleGeneralCtrl.generalInfoById = (req, res) => {
    const response = new HttpRespose();
    try {
        let query = [
            {
                $match: {
                    _id: ObjectID(req.query._id)
                }

            },
        ];
        peopleGeneralModel.advancedAggregate(query, {}, (err, roleData) => {
            if (err) {
                throw err;
            } else if (_.isEmpty(roleData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                response.setData(AppCode.Success, roleData[0]);
                response.send(res);
            }
        });
    } catch (exception) {
        response.setError(AppCode.InternalServerError);
        response.send(res);
    }
}


module.exports = peopleGeneralCtrl;