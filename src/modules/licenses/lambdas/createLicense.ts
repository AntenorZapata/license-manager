import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { licensesRepository } from 'src/core/database'
import { License } from 'src/core/interfaces'
// import { AWSError, Lambda, SES } from 'aws-sdk'
import { LicenseEventType } from 'src/core/layers/licenseEventsLayer/nodejs/licenseEvent'
import * as AWSXRay from 'aws-xray-sdk'
import { v4 as uuid } from 'uuid'
// import { PromiseResult } from 'aws-sdk/lib/request'
import { sendEmail } from 'src/core/helper/sendEmail'
import { sendLicenseEvent } from 'src/modules/utils/sendLicenseEvent'

AWSXRay.captureAWS(require('aws-sdk'))

// const sesClient = new SES()

// const licenseEventsFunctionName = process.env.LICENSE_EVENTS_FUNCTION_NAME!
// const lambdaClient = new Lambda()

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  // const method = event.httpMethod

  const lambdaRequestId = context.awsRequestId // number that identifies the lambda execution
  const apiRequestId = event.requestContext.requestId // number that identifies the APIGateway request

  console.log('Lambda request id: ', lambdaRequestId, 'Api Gateway request id: ', apiRequestId)

  const licenseBody = JSON.parse(event.body!) as License
  const licenseSecret = uuid()

  const newLicense = {
    ...licenseBody,
    phase: 'created',
    registerKey: '',
    licenseKey: licenseSecret,
  }

  const createdLicense = await licensesRepository.createLicense(newLicense)

  // Send E-mail

  try {
    await sendEmail(licenseSecret, licenseBody.email)
  } catch (e) {
    console.log((<Error>e).message)
  }

  // Create log event

  const response = await sendLicenseEvent(
    newLicense,
    LicenseEventType.CREATED,
    newLicense.email,
    lambdaRequestId,
  )
  console.log(response)

  return {
    statusCode: 201,
    body: JSON.stringify(createdLicense),
  }
}

// function sendEmail(secretMessage: string, email: string) {
//   return sesClient
//     .sendEmail({
//       Destination: {
//         ToAddresses: [email],
//       },
//       Message: {
//         Body: {
//           Text: {
//             Charset: 'UTF-8',
//             Data: `A chanve da licença é ${secretMessage}`,
//           },
//         },
//         Subject: {
//           Charset: 'UTF-8',
//           Data: 'MoovSec - chave de licença',
//         },
//       },
//       Source: 'antenorzapata@gmail.com',
//     })
//     .promise()
// }

// function sendLicenseEvent(
//   license: License,
//   eventType: LicenseEventType,
//   email: string,
//   lambdaRequestId: string,
// ) {
//   const event: LicenseEvent = {
//     email,
//     eventType,
//     licenseKey: license.licenseKey,
//     requestId: lambdaRequestId,
//     licenseLimit: license.licenseLimit,
//     phase: license.phase,
//   }

//   return lambdaClient
//     .invoke({
//       FunctionName: licenseEventsFunctionName,
//       Payload: JSON.stringify(event),
//       InvocationType: 'Event',
//       // InvocationType: 'RequestResponse',
//     })
//     .promise()
// }
