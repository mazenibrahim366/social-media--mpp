// import { Document } from "mongoose";
// import { Model } from "mongoose";
// import type { FilterQuery, UpdateQuery } from "mongoose";

// // findOne
// export const findOne = async <T extends Document>({
//   model,
//   filter = {},
//   select = "",
//   populate = [],
// }: {
//   model: Model<T>;
//   filter?: FilterQuery<T>;
//   select?: string;
//   populate?: any;
// }) => {
//   return await model.findOne(filter).select(select).populate(populate);
// };

// // find
// export const find = async <T>({
//   model,
//   filter = {},
//   select = "",
//   option = {},
//   populate = [],
// }: {
//   model: Model<T>;
//   filter?: FilterQuery<T>;
//   select?: string;
//   option?: object;
//   populate?: any;
// }) => {
//   return await model.find(filter, option).select(select).populate(populate);
// };

// // findById
// export const findById = async <T extends Document>({
//   model,
//   id = "",
//   select = "",
//   populate = [],
// }: {
//   model: Model<T>;
//   id: string;
//   select?: string;
//   populate?: any;
// }) => {
//   return await model.findById(id).select(select).populate(populate);
// };

// // updateOne
// export const updateOne = async <T>({
//   model,
//   filter = {},
//   data = {},
//   option = { runValidators: true },
// }: {
//   model: Model<T>;
//   filter?: FilterQuery<T>;
//   data?: UpdateQuery<T>;
//   option?: object;
// }) => {
//   return await model.updateOne(filter, data, option);
// };

// // findOneAndUpdate
// export const findOneAndUpdate = async <T>({
//   model,
//   filter = {},
//   data = {},
//   option = { runValidators: true, new: true },
//   select = "",
//   populate = [],
// }: {
//   model: Model<T>;
//   filter?: FilterQuery<T>;
//   data?: UpdateQuery<T>;
//   option?: object;
//   select?: string;
//   populate?: any;
// }) => {
//   return await model
//     .findOneAndUpdate(filter, data, option)
//     .select(select)
//     .populate(populate);
// };

// // create
// export const create = async <T>({
//   model,
//   data = [{}],
//   option = { validateBeforeSave: true },
// }: {
//   model: Model<T>;
//   data?: Partial<T>[];
//   option?: object;
// }) => {
//   return await model.create(data, option);
// };

// // deleteOne
// export const deleteOne = async <T>({
//   model,
//   filter = {},
// }: {
//   model: Model<T>;
//   filter?: FilterQuery<T>;
// }) => {
//   return await model.deleteOne(filter);
// };



import { Document, Model, FilterQuery, UpdateQuery } from "mongoose"

// findOne
export const findOne = async <T extends Document>({
  model,
  filter = {},
  select = "",
  populate = [],
}: {
  model: Model<T>
  filter?: FilterQuery<T>
  select?: string
  populate?: any
}): Promise<T | null> => {
  return model.findOne(filter).select(select).populate(populate)
}

// find
export const find = async <T extends Document>({
  model,
  filter = {},
  select = "",
  option = {},
  populate = [],
}: {
  model: Model<T>
  filter?: FilterQuery<T>
  select?: string
  option?: object
  populate?: any
}): Promise<T[]> => {
  return model.find(filter, option).select(select).populate(populate)
}

// findById
export const findById = async <T extends Document>({
  model,
  id,
  select = "",
  populate = [],
}: {
  model: Model<T>
  id: string
  select?: string
  populate?: any
}): Promise<T | null> => {
  return model.findById(id).select(select).populate(populate)
}

// updateOne
export const updateOne = async <T extends Document>({
  model,
  filter = {},
  data = {} as UpdateQuery<T>,
  option = { runValidators: true },
}: {
  model: Model<T>
  filter?: FilterQuery<T>
  data?: UpdateQuery<T>
  option?: object
}) => {
  return model.updateOne(filter, data, option)
}

// findOneAndUpdate
export const findOneAndUpdate = async <T extends Document>({
  model,
  filter = {},
  data = {} as UpdateQuery<T>,
  option = { runValidators: true, new: true },
  select = "",
  populate = [],
}: {
  model: Model<T>
  filter?: FilterQuery<T>
  data?: UpdateQuery<T>
  option?: object
  select?: string
  populate?: any
}): Promise<T | null> => {
  return model
    .findOneAndUpdate(filter, data, option)
    .select(select)
    .populate(populate)
}

// create
export const create = async <T extends Document>({
  model,
  data,
  option = { validateBeforeSave: true },
}: {
  model: Model<T>
  data: Partial<T> | Partial<T>[]
  option?: object
}): Promise<T | T[]> => {
  return model.create(data, option)
}

// deleteOne
export const deleteOne = async <T extends Document>({
  model,
  filter = {},
}: {
  model: Model<T>
  filter?: FilterQuery<T>
}) => {
  return model.deleteOne(filter)
}
