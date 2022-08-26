import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { licensesRepository } from 'src/core/database'
import { License } from 'src/core/interfaces'
import * as AWSXRay from 'aws-xray-sdk'

AWSXRay.captureAWS(require('aws-sdk'))

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const licenseId = event.pathParameters!.id as string

  const lambdaRequestId = context.awsRequestId // number that identifies the lambda execution
  const apiRequestId = event.requestContext.requestId // number that identifies the APIGateway request

  console.log('Lambda request id: ', lambdaRequestId, 'Api Gateway request id: ', apiRequestId)

  try {
    const licenseBody = JSON.parse(event.body!) as License
    console.log(`License Body ${licenseBody} License Id ${licenseId}`)

    const newLicense = {
      ...licenseBody,
      phase: 'created',
      registerKey: '',
    }

    const updatedLicense = await licensesRepository.updateLicense(licenseId, newLicense)
    return {
      statusCode: 200,
      body: JSON.stringify(updatedLicense),
    }
  } catch (e) {
    return {
      statusCode: 404,
      body: (<Error>e).message,
    }
  }
}
