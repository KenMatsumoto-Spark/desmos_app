import express from 'express'
import router from './routes'
import connectToDatabase from './connection/databaseConnection';

const app = express();
const PORT = 3000;

connectToDatabase()
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use('/public', express.static(__dirname + '/public'))

app.use(router)

app.listen(PORT, () => console.log(`connected ${PORT}`))