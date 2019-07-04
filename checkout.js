const AWS = require('aws-sdk')
const SNS = new AWS.SNS({ region: process.env.region })

const badRequestHTTPStatusCode = 400
const okHTTPStatusCode = 200
const internalServerErrorHTTPStatusCode = 500

const handleRequest = (httpStatus, body) => {
  return {
    statusCode: httpStatus,
    body: JSON.stringify(body)
  }
}

const publishSNSTopic = async data => {
  const params = {
    Message: JSON.stringify(data),
    TopicArn: `arn:aws:sns:${process.env.region}:${process.env.accountId}:${process.env.snsTopic}`
  }
  
  return SNS.publish(params).promise()
}

module.exports.handle = async event => {
  const data = JSON.parse(event.body)

  if (typeof data.customerId !== 'number') {
    return handleRequest(badRequestHTTPStatusCode, { error: 'customerId must be an integer and it is required.' })
  }

  try {
    const snsMetadata = await publishSNSTopic(data)

    return handleRequest(okHTTPStatusCode, {
      message: 'Successfully published SNS to invoice topic.',
      data: snsMetadata
    })
  } catch (error) {
    return handleRequest(internalServerErrorHTTPStatusCode, { error: 'Couldn\'t publish to the invoice SNS topic due to an internal error.' })
  }
}