"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseRepository = void 0;
class DatabaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async findOne({ filter = {}, select = '', option = {}, }) {
        let doc = this.model.findOne(filter).select(select);
        if (option?.populate) {
            doc = doc.populate(option.populate);
        }
        if (option?.lean) {
            doc.lean(option.lean);
        }
        return await doc.exec();
    }
    async find({ filter = {}, select = '', option = {}, }) {
        let doc = this.model.find(filter).select(select);
        if (option?.populate) {
            doc = doc.populate(option.populate);
        }
        if (option?.lean) {
            doc.lean(option.lean);
        }
        return await doc.exec();
    }
    async findById({ id, select = '', option = {}, }) {
        let doc = this.model.findById(id).select(select);
        if (option?.populate) {
            doc = doc.populate(option.populate);
        }
        if (option?.lean) {
            doc.lean(option.lean);
        }
        return await doc.exec();
    }
    async updateOne({ filter = {}, data = {}, option = { runValidators: true }, }) {
        return this.model.updateOne(filter, data, option);
    }
    async findOneAndUpdate({ filter = {}, data = {}, option = { runValidators: true, new: true }, select = '', populate = [], }) {
        return this.model
            .findOneAndUpdate(filter, data, option)
            .select(select)
            .populate(populate);
    }
    async create({ data, option = { validateBeforeSave: true }, }) {
        return this.model.create(data, option);
    }
    async deleteOne({ filter = {} }) {
        return this.model.deleteOne(filter);
    }
    async deleteMany({ filter = {} }) {
        return this.model.deleteMany(filter);
    }
}
exports.DatabaseRepository = DatabaseRepository;
