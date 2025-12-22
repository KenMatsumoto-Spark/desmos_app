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

    console.log({ errorStudentCreation, newStudent })

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

// MainController.get('/1234567sdfgh1234567', async (request: Request, response: Response) => {

//   try {

//    const data = [
//   {
//     name: 'Gabriela Silva',
//     year: '2022/1',
//     desmos: 'https://www.desmos.com/calculator/g8ycsqtmfj'
//   }
//   // {
//   //   name: 'Lucas Rossi',
//   //   year: '30/06/2022',
//   //   desmos: 'https://www.desmos.com/calculator/j5wace3v0z?lang=pt-BR'
//   // },
//   // {
//   //   name: 'Gabriel Cardoso',
//   //   year: '30/06/2022',
//   //   desmos: 'https://www.desmos.com/calculator/iewxprccng?lang=pt-BR. '
//   // },
//   // {
//   //   name: 'Anderson Souza',
//   //   year: '30/06/2022',
//   //   desmos: 'https://www.desmos.com/calculator/rkvm1yvzgp?lang=pt-BR'
//   // },
//   // {
//   //   name: 'Nataly Costa',
//   //   year: '30/06/2022',
//   //   desmos: 'https://www.desmos.com/calculator/h2g9vtcpkk?lang=pt-BR'
//   // },
//   // {
//   //   name: 'Matheus Rocha',
//   //   year: '30/06/2022',
//   //   desmos: 'https://www.desmos.com/calculator/ku73moa0la?lang=pt-BR'
//   // },
//   // {
//   //   name: 'Antonio Gomes',
//   //   year: '30/06/2022',
//   //   desmos: 'https://www.desmos.com/calculator/4eitmbdo4g?lang=pt-BR'
//   // },
//   // {
//   //   name: 'Giovana Freitas',
//   //   year: '30/06/2022',
//   //   desmos: 'https://www.desmos.com/calculator/l6tiyh0vqh?lang=pt-BR'
//   // },
//   // {
//   //   name: 'Guilherme Dias',
//   //   year: '30/06/2022',
//   //   desmos: 'https://www.desmos.com/calculator/6lqfbxblik?lang=pt-BR'
//   // },
//   // {
//   //   name: 'Guilherme Sallas',
//   //   year: '30/06/2022',
//   //   desmos: 'https://www.desmos.com/calculator/gi3wrdeery?lang=pt-BR'
//   // },
//   // {
//   //   name: 'Henrique Vinico',
//   //   year: '30/06/2022',
//   //   desmos: 'https://www.desmos.com/calculator/kuachrsfyj?lang=pt-BR'
//   // },
//   // {
//   //   name: 'Carlos Silva',
//   //   year: '30/06/2022',
//   //   desmos: 'https://www.desmos.com/calculator/fqdcmnc67d?lang=pt-BR'
//   // },
//   // {
//   //   name: 'Thalia Ramos',
//   //   year: '30/06/2022',
//   //   desmos: 'https://www.desmos.com/calculator/zwhskcjocw?lang=pt-BR'
//   // },
//   // {
//   //   name: 'Augusto Oliveira',
//   //   year: '30/06/2022',
//   //   desmos: 'https://www.desmos.com/calculator/sjdt3kvj9i?lang=pt-BR'
//   // },
//   // {
//   //   name: 'Regiane Lara',
//   //   year: '30/06/2022',
//   //   desmos: 'https://www.desmos.com/calculator/bfnyzdebg5?lang=pt-BR'
//   // },
//   // {
//   //   name: 'Gustavo Maia',
//   //   year: '30/06/2022',
//   //   desmos: 'https://www.desmos.com/calculator/wsivqbf1i2?lang=pt-BR'
//   // }
// ]

// for (const entry of data){
//         try{

//         console.log({
//           name: entry.name,
//           year: entry.year,
//           desmos: entry.desmos
//         })
//         const [errorDesmosState, desmosState] = await to (axios.get(entry.desmos))

//         if(entry.desmos && errorDesmosState) {
//           throw new Error('link inacessivel, verifique sua disponibilidade.')
//         }

//         if(/desmos.com/gm.test(entry.desmos) && !desmosState?.data?.state){
//           throw new Error('link do desmos não possui informações do grafico.')
//         }

        
//         await Student.create({
//           name: entry.name,
//           year: entry.year,
//           desmos: entry.desmos
//         })

//         // const [errorStudentCreation, newStudent] = await to(Student.findOne())

//         // console.log({errorStudentCreation, newStudent})
//         // if (errorStudentCreation) throw new Error("erro ao criar estudantes")


//       }catch(error){
//         console.log({error})
//       }


// }

//     return response.send('ok')
//   } catch (error) {
//     return response.status(422).send(error.message)
//   }
// })

export default MainController
