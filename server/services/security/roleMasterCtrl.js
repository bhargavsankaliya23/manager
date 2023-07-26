let roleMasterCtrl = {};
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

const roleModel = new (require("../../common/model/roleMasterModel"))();

const fs = require("fs");


/* Role Create */
roleMasterCtrl.roleCreate = (req, res) => {
    var response = new HttpRespose()
    var data = req.body;
    let query = { roleName: req.body.roleName }
    roleModel.findOne(query, {}, (err, roleData) => {
        if (err) {
            console.log(err)
            response.setError(AppCode.Fail);
            response.send(res);
        } else if (roleData !== null) {
            response.setError(AppCode.AllreadyExist);
            response.send(res);
        } else {
            roleModel.create(data, (err, RoleCreate) => {
                if (err) {
                    console.log(err)
                    response.setError(AppCode.Fail);
                    response.send(res);
                } else {
                    response.setData(AppCode.Success, RoleCreate);
                    response.send(res);
                }
            });
        }
    })
};

/* Role Update*/
roleMasterCtrl.roleUpdate = (req, res) => {
    var response = new HttpRespose();
    let bodydata = req.body;

    if (!!req.body) {
        try {
            let query = { _id: ObjectID(req.query._id) };
            roleModel.findOne(query, function (err, roleData) {
                if (err) {
                    response.setError(AppCode.Fail);
                    response.send(res);
                } else {
                    if (roleData === null) {
                        response.setError(AppCode.NotFound);
                        response.send(res);
                    } else {
                        delete bodydata._id
                        roleModel.update(query, bodydata, function (err, roleData) {
                            if (err) {
                                console.log(err)
                                response.setError(AppCode.Fail);
                                response.send(res);
                            } else if (roleData == undefined || (roleData.matchedCount === 0 && roleData.modifiedCount === 0)) {
                                response.setError(AppCode.NotFound);
                            } else {
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
        AppCode.Fail.error = "Oops! something went wrong, please try again later";
        response.setError(AppCode.Fail);
        response.send(res);
    }
};

/* Role List */
roleMasterCtrl.roleList = (req, res) => {
    const response = new HttpRespose();
    try {
        roleModel.aggregate([], (err, roleData) => {
            if (err) {
                throw err;
            } else if (_.isEmpty(roleData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                response.setData(AppCode.Success, roleData);
                response.send(res);
            }
        });
    } catch (exception) {
        response.setError(AppCode.InternalServerError);
        response.send(res);
    }
}

/* Role Details By Id*/
roleMasterCtrl.roleDetailsById = (req, res) => {
    const response = new HttpRespose();
    try {
        let query = [
            {
                $match: {
                    _id: ObjectID(req.query._id)
                }

            },
        ];
        roleModel.advancedAggregate(query, {}, (err, roleData) => {
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

/* Role Active-Deactive */
roleMasterCtrl.roleActiveDeactive = (req, res) => {
    const response = new HttpRespose();
    let query = { _id: ObjectID(req.query._id) };

    roleModel.findOne(query, function (err, roleData) {
        if (err) {
            response.setError(AppCode.Fail);
            response.send(res);
        } else {
            if (roleData === null) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                let status;
                if (roleData.status == 1) {
                    status = 2;
                }
                else {
                    status = 1
                }
                roleModel.updateOne(query, { $set: { status: status } }, function (err, roleData) {
                    if (err) {
                        AppCode.Fail.error = err.message;
                        response.setError(AppCode.Fail);
                        response.send(res);
                    } else {
                        response.setData(AppCode.Success);
                        response.send(res);
                    }
                });
            }
        }
    })


};

/* Active Role List */
roleMasterCtrl.activeRoleList = (req, res) => {
    const response = new HttpRespose();
    try {
        let query = [
            {
                $match: {
                    status: 1
                }
            },
        ];
        roleModel.advancedAggregate(query, {}, (err, activeRoleList) => {
            if (err) {
                throw err;
            } else if (_.isEmpty(activeRoleList)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                response.setData(AppCode.Success, activeRoleList);
                response.send(res);
            }
        });
    } catch (exception) {
        response.setError(AppCode.InternalServerError);
        response.send(res);
    }
}

/* Role Delete*/
roleMasterCtrl.deleteRole = (req, res) => {
    const response = new HttpRespose();
    const data = req.query;
    const query = {
        _id: ObjectID(data._id)
    };
    roleModel.findOne(query, function (err, roleData) {
        if (err) {
            AppCode.Fail.error = err.message;
            response.setError(AppCode.Fail);
            response.send(res);
        } else {
            if (roleData == null) {
                AppCode.Fail.error = "No record found";
                response.setError(AppCode.Fail);
                response.send(res);
            } else {
                roleModel.remove(query, function (err, roleData) {
                    if (err) {
                        AppCode.Fail.error = err.message;
                        response.setError(AppCode.Fail);
                        response.send(res);
                    } else if (roleData == undefined || roleData.deletedCount === 0) {
                        AppCode.Fail.error = "No Data found";
                        response.setError(AppCode.Fail);
                        response.send(res);
                    } else {
                        response.setData(AppCode.Success);
                        response.send(res);
                    }
                });
            }
        }
    });
};


module.exports = roleMasterCtrl;