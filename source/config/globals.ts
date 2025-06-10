import dayjs from 'dayjs'

export const timestamps = {
  createdAt: { type: Date, default: () => dayjs() },
  updatedAt: { type: Date, set: () => dayjs() },
}
