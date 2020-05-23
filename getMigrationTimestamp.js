let dayjs = require('dayjs')

module.exports = () => {
  return dayjs().format("YYYY_MM_DD_HHMMSS")
}