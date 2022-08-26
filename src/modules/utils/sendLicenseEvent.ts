import { LicenseEvent, LicenseEventType } from 'src/core/layers/licenseEventsLayer/nodejs/licenseEvent'
import { License } from 'src/core/interfaces'
import { AWSError, Lambda, SES } from 'aws-sdk'

const licenseEventsFunctionName = process.env.LICENSE_EVENTS_FUNCTION_NAME!
const lambdaClient = new Lambda()

export function sendLicenseEvent(
  license: License,
  eventType: LicenseEventType,
  email: string,
  lambdaRequestId: string,
) {
  const event: LicenseEvent = {
    email,
    eventType,
    licenseKey: license.licenseKey,
    requestId: lambdaRequestId,
    licenseLimit: license.licenseLimit,
    phase: license.phase,
  }

  return lambdaClient
    .invoke({
      FunctionName: licenseEventsFunctionName,
      Payload: JSON.stringify(event),
      InvocationType: 'Event', // RequestResponse - Synchronous invocation
    })
    .promise()
}
