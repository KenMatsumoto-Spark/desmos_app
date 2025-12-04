import express from 'express'
import router from './routes'
import connectToDatabase from './connection/databaseConnection';
import { CronJob } from 'cron';
import KeepAtlasAlive from './jobs/KeepAtlasAlive';

const app = express();
const PORT = 3000;

connectToDatabase()
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use('/public', express.static(__dirname + '/public'))

app.use(router)

const ReportGenerator = new CronJob('0 0 * * MON' , KeepAtlasAlive)

ReportGenerator.start()

app.listen(PORT, () => console.log(`connected ${PORT}`))