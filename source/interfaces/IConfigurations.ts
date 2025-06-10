import mongoose from 'mongoose'

export default interface ITeacher extends Document {
  _id?: mongoose.Types.ObjectId
  createdAt: Date
  showNames: Boolean
}
