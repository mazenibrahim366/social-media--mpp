import {
  CreateOptions,
  FilterQuery,
  Model,
  PopulateOptions,
  QueryOptions,
  UpdateQuery,
} from 'mongoose'

export class DatabaseRepository<TDocument> {
  constructor(protected readonly model: Model<TDocument>) {}

  async findOne({
    filter = {},
    select = '',

    option = {},
  }: {
    filter?: FilterQuery<TDocument>
    select?: string
    option?: QueryOptions
  }): Promise<TDocument | null> {
    let doc = this.model.findOne(filter).select(select)
    if (option?.populate) {
      doc = doc.populate(option.populate as PopulateOptions)
    }
    if (option?.lean) {
      doc.lean(option.lean)
    }
    return await doc.exec()
  }

  async find({
    filter = {},
    select = '',
    option = {},
  }: {
    filter?: FilterQuery<TDocument>
    select?: string
    option?: QueryOptions
  }): Promise<TDocument[]| unknown> {
    let doc = this.model.find(filter).select(select)
    if (option?.populate) {
      doc = doc.populate(option.populate as PopulateOptions)
    }
    if (option?.lean) {
      doc.lean(option.lean)
    }
    return await doc.exec()
  }

  async findById({
    id,
    select = '',
    option = {},
  }: {
    id: string
    select?: string
    option?: QueryOptions
    
  }): Promise<TDocument | null> {

    let doc = this.model.findById(id).select(select)
    if (option?.populate) {
      doc = doc.populate(option.populate as PopulateOptions)
    }
    if (option?.lean) {
      doc.lean(option.lean)
    }
    return await doc.exec()

  }

  async updateOne({
    filter = {},
    data = {} as UpdateQuery<TDocument>,
    option = { runValidators: true },
  }: {
    filter?: FilterQuery<TDocument>
    data?: UpdateQuery<TDocument>
    option?: object
  }) {
    return this.model.updateOne(filter, data, option)
  }

  async findOneAndUpdate({
    filter = {},
    data = {} as UpdateQuery<TDocument>,
    option = { runValidators: true, new: true },
    select = '',
    populate = [],
  }: {
    filter?: FilterQuery<TDocument>
    data?: UpdateQuery<TDocument>
    option?: object
    select?: string
    populate?: any
  }): Promise<TDocument | null> {
    return this.model
      .findOneAndUpdate(filter, data, option)
      .select(select)
      .populate(populate)
  }

  async create({
    data,
    option = { validateBeforeSave: true },
  }: {
    data: Partial<TDocument>[]
    option?: CreateOptions
  }): Promise<TDocument | TDocument[]> {
    return this.model.create(data, option)
  }

  async deleteOne({ filter = {} }: { filter?: FilterQuery<TDocument> }) {
    return this.model.deleteOne(filter)
  }
  async deleteMany({ filter = {} }: { filter?: FilterQuery<TDocument> }) {
    return this.model.deleteMany(filter)
  }
}
