import mongoose from 'mongoose'
import AutoIncrementFactory from 'mongoose-sequence'
import IStudent from '../interfaces/IStudent'
import StudentSchema from '../schemas/StudentSchema'
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

const AutoIncrement = AutoIncrementFactory(mongoose.connection)

interface IStudentModel extends mongoose.Model<IStudent> {aggregatePaginate: any}

const Student: mongoose.Schema = new mongoose.Schema(StudentSchema.schema, { timestamps: true })

Student.plugin(AutoIncrement, { inc_field: 'studentCode' })
Student.plugin(aggregatePaginate)

export default mongoose.model<IStudent, IStudentModel>('students', Student)
