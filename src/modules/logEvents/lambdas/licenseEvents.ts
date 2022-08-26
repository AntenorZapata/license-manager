import { APIGatewayProxyEvent, APIGatewayProxyResult, Callback, Context } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'
import { licensesRepository } from 'src/core/database'
import { License } from 'src/core/interfaces'
import { LicenseEvent } from 'src/core/layers/licenseEventsLayer/nodejs/licenseEvent'
import * as AWSXRay from 'aws-xray-sdk'
import { createEvent } from 'src/modules/utils/createEvent'

AWSXRay.captureAWS(require('aws-sdk'))

const eventsDbd = process.env.EVENTS_DDB!
const dbdClient = new DynamoDB.DocumentClient()

export async function handler(event: LicenseEvent, context: Context, callback: Callback): Promise<void> {
  console.log('Event: ', event)
  console.log('Lambda RequestId: ', context.awsRequestId)

  await createEvent(event)

  callback(
    null,
    JSON.stringify({
      licenseEventCreated: true,
      message: 'OK',
    }),
  )
}

// function createEvent(event: LicenseEvent) {
//   const timestamp = Date.now()
//   const ttl = ~~(timestamp / 1000 + 5 + 60)

//   return dbdClient
//     .put({
//       TableName: eventsDbd,
//       Item: {
//         pk: `#license_${event.licenseKey}`,
//         sk: `${event.eventType}#${timestamp}`,
//         email: event.email,
//         createdAt: timestamp,
//         requestId: event.requestId,
//         eventType: event.eventType,
//         info: {
//           licenseKey: event.licenseKey,
//           licenseLimit: event.licenseLimit,
//           phase: event.phase,
//         },
//         ttl: ttl,
//       },
//     })
//     .promise()
// }
