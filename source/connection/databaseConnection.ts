import 'dotenv/config'
import colors from 'colors/safe'
import mongoose from 'mongoose'
import to from 'await-to-js'

const username = process.env.DATABASE_USERNAME
const password = process.env.DATABASE_PASSWORD
const clusterName = process.env.DATABASE_CUSTERNAME
const databaseName = process.env.DATABASE_NAME

const connectionString = `mongodb+srv://${username}:${password}${clusterName}.mongodb.net/${databaseName}?retryWrites=true&w=majority`

const connectionOptions = {}

const connectToDatabase = async () => {
  const [error, connection] = await to(mongoose.connect(connectionString, connectionOptions))
  if (error) console.warn(`[DATABASE] Failed to connect to the ${databaseName} database: ${error.message} (user: ${username})`)
  if (connection) console.info(`[DATABASE] Connected ${colors.green('successfully')} to the ${databaseName} database! (user: ${username})`)
  return connection
}

export default connectToDatabase
