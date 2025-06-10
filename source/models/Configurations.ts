import mongoose from 'mongoose'
import AutoIncrementFactory from 'mongoose-sequence'
import IConfigurations from '../interfaces/IConfigurations'
import ConfigurationsSchema from '../schemas/ConfigurationsSchema'
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

interface IConfigurationsModel extends mongoose.Model<IConfigurations> {aggregatePaginate: any}

const Configurations: mongoose.Schema = new mongoose.Schema(ConfigurationsSchema.schema, { timestamps: true })

Configurations.plugin(aggregatePaginate)

export default mongoose.model<IConfigurations, IConfigurationsModel>('configurations', Configurations)
