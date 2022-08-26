import { DynamoDB } from 'aws-sdk'
import { LicenseEvent } from 'src/core/layers/licenseEventsLayer/nodejs/licenseEvent'

const eventsDbd = process.env.EVENTS_DDB!
const dbdClient = new DynamoDB.DocumentClient()

export function createEvent(event: LicenseEvent) {
  const timestamp = Date.now()
  const ttl = ~~(timestamp / 1000 + 5 + 60)

  return dbdClient
    .put({
      TableName: eventsDbd,
      Item: {
        pk: `#license_${event.licenseKey}`,
        sk: `${event.eventType}#${timestamp}`,
        email: event.email,
        createdAt: timestamp,
        requestId: event.requestId,
        eventType: event.eventType,
        info: {
          licenseKey: event.licenseKey,
          licenseLimit: event.licenseLimit,
          phase: event.phase,
        },
        ttl: ttl,
      },
    })
    .promise()
}
