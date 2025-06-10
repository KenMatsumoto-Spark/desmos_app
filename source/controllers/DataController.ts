import { Request, Response, Router } from 'express'
import Student from '../models/Student'
import to from 'await-to-js'
import axios from 'axios'
import 'dotenv/config'
import mongoose from 'mongoose'
import StudentRules from '../rules/StudentRules'
import Configurations from '../models/Configurations'

const adminLogin = process.env.ADMIN_LOGIN
const adminPassword = process.env.ADMIN_PASSWORD
const configurationsId = process.env.CONFIGURATIONS_ID
const adminToken = process.env.ADMIN_TOKEN

const MainController = Router()

MainController.get('/', async (request: Request, response: Response) => {

  const query = request.query
  var page = query?.page || '1'
  const limit = 9

  const { isAdmin } = request.query
  const [errorConfigurations, configurations] = await to(Configurations.findOne({ _id: new mongoose.Types.ObjectId(configurationsId) }).exec())

  try {
    const filter = {}
    if(query?.year && query?.year !== 'Todos') filter['year'] = query.year
    if(query?.page) page = String(query.page)

    var showNames = configurations.showNames
    if(isAdmin) showNames = true

    const [errorStudents, students] = await to(Student.aggregatePaginate(Student.aggregate([
      {
        $match: filter
      }, 
      {
        $sort: { 'name': 1}
      },
      {
        $project:{
          name: showNames ? 1 : { $concat: [{ $substr : ["$name", 0, 5] }, '***']} ,
          _id: 1,
          year: 1,
          desmos: 1
        }
      }
    ]), { limit, page, lean: true }))


    if (errorStudents) throw new Error("erro ao encontrar estudantes")
    if (!students) throw new Error("Estudantes não encontrado")

    return response.send({ students })
  } catch (error) {
    return response.send('not found')
  }
})

MainController.get('/resource/year', async (request: Request, response: Response) => {

  try {
    const [errorYears, years] = await to(Student.aggregate([
      {
        $group:{
          _id: "$year"
        }
      },
      {
        $sort:{
         "_id": -1
        }
      }
    ]).exec())

    if (errorYears) throw new Error("erro ao encontrar anos")

    const yearsForSelect = ['Todos', ...years.map((year) => year._id)]

    return response.send({ yearsForSelect })
  } catch (error) {
    return response.send('not found')
  }
})

MainController.post('/create', async (request: Request, response: Response) => {

  const name = request.body.name.trim()
  const year = request.body.year.trim()
  const desmos = request.body.desmos.trim()

  try {
    const { authorized } = request.body

    if(!authorized) return response.status(401).send()

    var invalid = StudentRules.student(
      { name },
      { year },
      { desmos }
    )
    
    const [errorDesmosState, desmosState] = await to (axios.get(desmos))
    
    if(desmos && errorDesmosState) {
      if(!invalid) invalid = []

      invalid.push({
        field: 'desmos',
        message: 'link inacessivel, verifique sua disponibilidade.'
      })
    }

    if(/desmos.com/gm.test(desmos) && !desmosState?.data?.state){
      if(!invalid) invalid = []

      invalid.push({
        field: 'desmos',
        message: 'link do desmos não possui informações do grafico.'
      })
    }

    if (invalid) return response.status(422).send({ invalid })

    const [errorStudentCreation, newStudent] = await to(Student.create({
      name,
      year,
      desmos
    }))

    if (errorStudentCreation) throw new Error("erro ao criar estudantes")


    return response.send("estudante criado com sucesso")
  } catch (error) {
    return response.status(422).send(error.message)
  }
})

MainController.patch('/edit', async (request: Request, response: Response) => {

  const name = request.body.name.trim()
  const year = request.body.year.trim()
  const desmos = request.body.desmos.trim()

  const { id } = request.body

  try {
    const { authorized } = request.body

    if(!authorized) return response.status(401).send()

    var invalid = StudentRules.student(
      { name },
      { year },
      { desmos }
    )
    
    const [errorDesmosState, desmosState] = await to (axios.get(desmos))
    
    if(desmos && errorDesmosState) {
      if(!invalid) invalid = []

      invalid.push({
        field: 'desmos',
        message: 'link inacessivel, verifique sua disponibilidade.'
      })
    }

    if(/desmos.com/gm.test(desmos) && !desmosState?.data?.state){
      if(!invalid) invalid = []

      invalid.push({
        field: 'desmos',
        message: 'link do desmos não possui informações do grafico.'
      })
    }

    if (invalid) return response.status(422).send({ invalid })

    const [errorStudentUpdate, updateResult] = await to(Student.updateOne({
      _id: new mongoose.Types.ObjectId(id)
    },{
      name,
      year,
      desmos
    }))

    if (errorStudentUpdate) throw new Error("erro ao atualizar estudantes")

    return response.send("estudante atualizado com sucesso")
  } catch (error) {
    return response.status(422).send(error.message)
  }
})

MainController.delete('/delete/:id', async (request: Request, response: Response) => {

  const { id } = request.params

  try {
    const { authorized } = request.body

    if(!authorized) return response.status(401).send()

    const [errorStudentDelete, deleteResult] = await to(Student.deleteOne({
      _id: new mongoose.Types.ObjectId(id)
    }))

    if (errorStudentDelete) throw new Error("erro ao apagar dados do estudantes")

    return response.send("dados do estudante apagados com sucesso")
  } catch (error) {
    return response.status(422).send(error.message)
  }
})

MainController.post('/login', async (request: Request, response: Response) => {

  const { login, password } = request.body

  try {
    if(login !== adminLogin || password !== adminPassword) throw new Error('login ou senha incorreto.')


    return response.send({message: "professor logado com sucesso", adminToken })
  } catch (error) {
    return response.status(422).send(error.message)
  }
})

MainController.get('/configurations', async (request: Request, response: Response) => {

  try {
    const [errorConfigurations, configurations] = await to(Configurations.findOne({ _id: new mongoose.Types.ObjectId(configurationsId) }).exec())
        
    if (errorConfigurations) throw new Error("erro ao encontrar configurações")

    return response.status(200).send({ configurations })
  } catch (error) {
    return response.send('not found')
  }
})

MainController.patch('/configurations', async (request: Request, response: Response) => {

  const { showNames } = request.body
  try {
    const { authorized } = request.body

    if(!authorized) return response.status(401).send()

    const [errorConfigurations, configurations] = await to(Configurations.updateOne({
      _id: new mongoose.Types.ObjectId(configurationsId)
    },{
      showNames: showNames ? true : false
    }).exec())
        
    if (errorConfigurations) throw new Error("erro ao encontrar configurações")

    return response.status(200).send({ configurations })
  } catch (error) {
    return response.send('not found')
  }
})

export default MainController
