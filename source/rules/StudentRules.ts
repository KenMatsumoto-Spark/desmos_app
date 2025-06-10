import requestCheck from 'request-check'
import to from 'await-to-js'
import axios from 'axios'

const nameRegex = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/
const yearRegex = /[0-9]{4}\/[0-9]{1}/
const httpsUrlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/

const StudentRules = {
  student: (...args: any) => {
    const validator = requestCheck()
    validator.requiredMessage = 'Campo obrigatório!'

    validator.addRule('name', {
      validator: (value) => !nameRegex.test(value),
      message: 'Nome Inválido!'
    })

    validator.addRule('year', {
      validator: (value) => value.length == 6,
      message: 'Ano Inválido, digite apenas 6 caracteres'
    })

    validator.addRule('year', {
      validator: (value) => yearRegex.test(value),
      message: 'Ano Inválido, digite ano/semestre, ex: 2000/1'
    })

    validator.addRule('desmos', {
      validator: (value) => httpsUrlRegex.test(value),
      message: 'Link do desmos inválido. ex: https://www.desmos.com/calculator/12345'
    })

    const invalid = validator.check(...args)

    return invalid
  }
}

export default StudentRules
