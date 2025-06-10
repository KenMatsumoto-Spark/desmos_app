import { timestamps } from '../config/globals'

const schema = {

  ...timestamps,

  name: {
    type: String,
    required: false
  },

  desmos: {
    type: String,
    required: false
  },

  year: {
    type: String,
    required: false
  }

}

export default {
  schema,
}
