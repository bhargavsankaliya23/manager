const ModelBase = require("./modelBase");
const CONFIG = require("../../config");
const bcrypt = require("bcryptjs");
const randToken = require('rand-token');
const saltRounds = 10;
const AppCode = require("../constant/appCods");
const ObjectID = require("mongodb").ObjectID;
const jwt = require("jsonwebtoken");
const validator = {
    email: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
    mobile: /^\d+$/
};
const _ = require("lodash");

class adminUserModel extends ModelBase {
    constructor() {
        super(CONFIG.DB.MONGO.DB_NAME, "adminUser", {
            firstName: { type: String, allowNullEmpty: false },
            lastName: { type: String, allowNullEmpty: false },
            profile_image: { type: String, allowNullEmpty: true },
            pwd: { type: String, allowNullEmpty: false },
            email: {
                type: String,
                allowNullEmpty: false,
                regex: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
            },
            createdby: { type: Object, allowNullEmpty: true },
            updatedBy: { type: Object, allowNullEmpty: true },
            roleId: { type: Object, allowNullEmpty: true },
            status: {
                type: Number,
                allowNullEmpty: false,
                enum: { 1: "active", 2: "inactive" }
            },
            createdAt: { type: Object, allowNullEmpty: false },
            updatedAt: { type: Object, allowNullEmpty: true },
            deviceTokens: { type: Array, allowNullEmpty: true },
        });
    }
    /**
     * @description create Always return an unique id after inserting new user
     * @param {*} data
     * @param {*} cb
     */
    create(data, cb) {
        if (!!data.roleId) {
            data.roleId = ObjectID(data.roleId)
        }
        if (!!data.createdby) {
            data.createdby = ObjectID(data.createdby)
        }
        var err = this.validate(data);

        if (err) {
            return cb(err);
        }
        var self = this;
        data.status = 1;
        data.createdAt = new Date();
        bcrypt.hash(data.pwd, saltRounds, function (encryptErr, hash) {
            if (encryptErr) {
                return cb(encryptErr);
            }

            data.pwd = hash;

            self.insert(data, function (err, user) {
                if (err) {
                    return cb(err);
                }
                delete user.ops[0].pwd;

                cb(null, user.ops[0]);
            });
        });
    }

    findOne(conditions, projection, options, callback) {
        if (typeof conditions === 'function') {
            callback = conditions;
            conditions = null;
            projection = null;
            options = {};
        } else if (typeof projection === 'function') {
            callback = projection;
            options = {};
            projection = null;
        } else if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        let projectionAndOpt = { fields: projection };
        if (!!options && typeof options !== 'function' && options.sort !== undefined) {
            projectionAndOpt.sort = options.sort;
        }

        this.getModel(function (err, model) {
            if (err) {
                return callback(err);
            }
            model.findOne(conditions, projectionAndOpt, callback);
        });
    }

    advancedAggregate(query, options, cb) {
        this.getModel(function (err, model) {
            if (err) {
                return cb(err);
            }
            const limit = (!_.isEmpty(options) && options.limit) ? options.limit : 20;
            const skip = options.skip ? options.skip : 0;
            const sort = options.sort ? options.sort : { _id: -1 };
            model.aggregate(query).skip(skip).limit(limit).sort(sort).toArray(cb);
        });
    }
    update(query, data, cb) {
        if (!!data.roleId) {

            data.roleId = ObjectID(data.roleId)
        } else {
            delete data.roleId
        }
        if (!!data.updatedBy) {
            data.updatedBy = ObjectID(data.updatedBy)
        }
        console.log(data);

        var err = this.validate(data);
        if (err) {
            return cb(err);
        }

        data.updatedAt = new Date();
        var self = this;
        self.updateOne(query, { $set: data }, function (err, result) {
            if (err) {
                return cb(err);
            }
            cb(null, result);
        });
    }
    updateUser(params, cb) {
        if (!!data.roleId) {
            data.roleId = ObjectID(data.roleId)
        }
        if (!!data.updatedBy) {
            data.updatedBy = ObjectID(data.updatedBy)
        }
        var err = this.validate(data);
        if (err) {
            return cb(err);
        }
        var updateSetObj = {};
        updateSetObj = params;
        updateSetObj.updatedAt = new Date();
        var self = this;
        self.updateOne({ _id: ObjectID(params._id) }, { $set: updateSetObj }, function (err, updatedInfo) {
            if (err) {
                return cb(err);
            }
            cb(null, updateSetObj);
        });
    }

    removeDeviceToken(params, cb) {
        var self = this;
        self.updateOne({ _id: ObjectID(params.masterUserId) }, { $pull: { "deviceTokens": { jti: params.jti } } }, function (err, UpdatedMasterUser) {
            if (err) {
                console.log("err at logout : ", err);
                cb(err);
            } else {
                cb(null);
            }
        });
    }


    generateSessionToken(paramsObj, callback) {
        var self = this;
        const query = [
            {
                $match: { _id: paramsObj._id }
            },
            {
                $project: {
                    _id: 1,
                    status: 1,
                    firstName: 1,
                    fullName: { $concat: ["$firstName", " ", "$lastName"] },
                    lastName: 1,
                    email: 1,
                    roleId: 1,
                    accountType: 1,
                    profile_image: { $ifNull: ['$profile_image', CONFIG.DEFAULT_PROFILE_PHOTO_ADMIN] }
                }
            }
        ];
        if (!!paramsObj && paramsObj._id) {
            self.advancedAggregate(query, { limit: 1, skip: 0 }, function (err, user) {
                if (err) {
                    callback(AppCode.InternalServerError);
                } else {
                    if (user === null || user[0] === undefined) {
                        callback(AppCode.NoUserFound);
                    } else {
                        user = user[0];
                        user.jti = user._id + "_" + randToken.generator({ chars: '0-9' }).generate(6);
                        user.myToken = jwt.sign(user, CONFIG.JWTTOKENKEY, {
                            expiresIn: '30d' //365 days
                        });

                        let deviceTokenInfo = {};

                        deviceTokenInfo.tokenId = user.myToken;
                        deviceTokenInfo.jti = user.jti;

                        if (!!deviceTokenInfo) {
                            self.updateOne({ _id: paramsObj._id }, { $push: { deviceTokens: deviceTokenInfo } }, function (err, UpdatedMasterUser) {
                                if (err) {
                                    console.log(err)
                                    callback(AppCode.SomethingWrong);
                                } else {
                                    callback(null, user);
                                }
                            });
                        } else {
                            callback(AppCode.MissingDeviceTokenParameter);
                        }
                    }
                }
            });
        } else {
            callback(AppCode.SomethingWrong);
        }
    }

    isEmail(email) {
        return validator.email.test(email);
    }
    isMobile(mobile) {
        return validator.mobile.test(mobile);
    }
}

module.exports = adminUserModel;

