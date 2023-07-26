const ModelBase = require("./modelBase");
const CONFIG = require("../../config");
const _ = require("lodash")

class csvUploadModel extends ModelBase {
    constructor() {
        super(CONFIG.DB.MONGO.DB_NAME, "csv", {
            category: { type: String, allowNullEmpty: false },
            city: { type: String, allowNullEmpty: false },
            country: { type: String, allowNullEmpty: false },
            customerName: { type: String, allowNullEmpty: false },
            manufacturer: { type: String, allowNullEmpty: false },
            orderDate: { type: Date, allowNullEmpty: false },
            orderID: { type: String, allowNullEmpty: false },
            postalCode: { type: String, allowNullEmpty: false },
            produtName: { type: String, allowNullEmpty: false },
            region: { type: String, allowNullEmpty: false },
            segment: { type: String, allowNullEmpty: false },
            shipDate: { type: Date, allowNullEmpty: false },
            shipMode: { type: String, allowNullEmpty: false },
            state: { type: String, allowNullEmpty: false },
            subCategory: { type: String, allowNullEmpty: false },
            discount: { type: Number, allowNullEmpty: false },
            profit: { type: Number, allowNullEmpty: false },
            quantity: { type: Number, allowNullEmpty: false },
            sales: { type: Number, allowNullEmpty: false },
            status: {
                type: Number,
                allowNullEmpty: false,
                enum: { 1: "active", 2: "inactive" }
            },
        });
    }

    /**
     * @description create Always return an unique id after inserting new user
     * @param {*} data
     * @param {*} cb
     */
    create(data, cb) {
        var err = this.validate(data);

        if (err) {
            return cb(err);
        }

        data.createdAt = new Date();;
        data.status = 1;
        this.insert(data, (err, result) => {
            if (err) {
                return cb(err);
            }

            cb(null, result.ops[0]);
        });
    }

    createMany(data, cb) {
        var self = this;
        //data.createdAt = new Date();;

        self.insertMany(data, function (err, result) {
            if (err) {
                return cb(err);
            }
            cb(null, result.ops);
        });
    }

    find(conditions, options, cb) {
        this.getModel(function (err, model) {
            if (err) {
                return cb(err);
            }
            if (!_.isEmpty(options)) {
                const limit = (!_.isEmpty(options) && options.limit) ? options.limit : 20;
                const skip = options.skip ? options.skip : 0;
                const sort = options.sort ? options.sort : { _id: -1 };
                model.find(conditions).sort(options.sort).skip(options.skip).limit(options.limit).toArray(cb);
            } else {
                model.find(conditions).toArray(cb);
            }
        });
    }


    update(query, data, cb) {
        // data.birthDate = new Date(data.birthDate);

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

    advancedAggregate(query, options, cb) {
        // do a validation with this.schema
        this.getModel(function (err, model) {
            if (err) {
                return cb(err);
            }
            if (!_.isEmpty(options)) {
                const limit = (!_.isEmpty(options) && options.limit) ? options.limit : 2000000;
                const skip = options.skip ? options.skip : 0;
                const sort = options.sort ? options.sort : { _id: -1 };
                model.aggregate(query).skip(skip).limit(limit).sort(sort).toArray(cb);
            } else {
                model.aggregate(query).toArray(cb);
            }
        });
    }
    aggregate(query, cb) {
        // do a validation with this.schema
        this.getModel(function (err, model) {
            if (err) {
                return cb(err);
            }
            model.aggregate(query).toArray(cb);
        });
    }
}

module.exports = csvUploadModel;