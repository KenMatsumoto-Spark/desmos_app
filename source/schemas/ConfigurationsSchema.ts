import { timestamps } from '../config/globals'

const schema = {

  ...timestamps,

  showNames: {
    type: Boolean,
    required: false
  }

}

export default {
  schema,
}
