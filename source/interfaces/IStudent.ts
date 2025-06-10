import mongoose from 'mongoose'

export default interface IStudent extends Document {
  _id?: mongoose.Types.ObjectId
  name: string
  desmos: string
  year: string
  createdAt: Date
  studentCode: number
}
