/* eslint-disable import/no-absolute-path */

const Response = require('/opt/nodejs/response.js')
const User = require('/opt/nodejs/user.js')
const parser = require('/opt/nodejs/node_modules/lambda-multipart-parser/index.js')
const AWS = require('aws-sdk')
require('dotenv').config({ path: '/opt/nodejs/.env' })
AWS.config.update({ region: 'us-west-2' })

exports.upload = async (event, context) => {
  const response = new Response()
  const user = new User(event, response)
  await user.resolved
  if (user.data.privilege <= 5) {
    response.statusCode = 400
    return response
  }
  const date = new Date()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const form = await parser.parse(event)
  const uploadParams = {
    Bucket: 'osu-meter-uploads',
    Key: date.getFullYear() + '/' + months[date.getMonth()] + '/' + form.meter + '.jpg',
    ContentType: 'image/jpeg',
    Body: form.files[0].content
  }
  const S3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  })
  const p = new Promise((resolve, reject) => {
    S3.upload(uploadParams, (err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })
  await p
  return response
}
