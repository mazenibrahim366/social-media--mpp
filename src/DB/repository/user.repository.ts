import { CreateOptions, Model } from 'mongoose'
import { AppError } from '../../utils/response/error.response'
import { IUser as TDocument } from './../models/models.dto'
import { DatabaseRepository } from './database.repository'

export class UserRepository extends DatabaseRepository<TDocument> {
  constructor(protected override readonly model: Model<TDocument>) {
    super(model)
  }

  async createUser({
    data,
    option = { validateBeforeSave: true },
  }: {
    data: Partial<TDocument>[]
    option?: CreateOptions
  }): Promise<TDocument | TDocument[]> {
    const [user] = (await this.create({ data, option })) as TDocument[]

    if (!user) {
      throw new AppError('User not created', 404)
      
    }
    return user
  }
}
