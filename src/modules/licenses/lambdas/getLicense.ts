import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { licensesRepository } from 'src/core/database'
import * as AWSXRay from 'aws-xray-sdk'
import { License } from 'src/core/interfaces'

AWSXRay.captureAWS(require('aws-sdk'))

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod

  const lambdaRequestId = context.awsRequestId // number that identifies the lambda execution
  const apiRequestId = event.requestContext.requestId // number that identifies the APIGateway request

  console.log('Lambda request id: ', lambdaRequestId, 'Api Gateway request id: ', apiRequestId)

  const responses = {
    GET: (licenses: License[]) => ({
      statusCode: 200,
      body: JSON.stringify({
        data: licenses,
      }),
    }),
    ByID: (license: License) => ({
      statusCode: 200,
      body: JSON.stringify({
        data: license,
      }),
    }),
  }
  try {
    if (event.resource === '/licenses') {
      const licenses = await licensesRepository.getAllLicenses()
      return responses.GET(licenses)

      // return {
      //   statusCode: 200,
      //   body: JSON.stringify({
      //     data: licenses,
      //   }),
      // }
    } else if (event.resource === '/licenses/{id}') {
      const licenseId = event.pathParameters!.id as string

      const license = await licensesRepository.getLicenseById(licenseId)
      return responses.ByID(license)
      // return {
      //   statusCode: 200,
      //   body: JSON.stringify({
      //     data: license,
      //   }),
      // }
    }
  } catch (e) {
    return {
      statusCode: 404,
      body: (<Error>e).message,
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: 'Bad request',
    }),
  }
}
