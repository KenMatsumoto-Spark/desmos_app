import Student from '../models/Student'
import to from 'await-to-js'

const KeepAtlasAlive = async (): Promise<void> => {

  try {
    const [errorStudent, student] = await to(Student.findOne())

    if (errorStudent) throw new Error("erro ao encontrar estudantes")

  } catch (errorStudent) {
    console.warn('ERROR-KeepAtlasAlive', errorStudent)
  }
}

export default KeepAtlasAlive
