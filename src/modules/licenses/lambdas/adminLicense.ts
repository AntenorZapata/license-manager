import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod

  const lambdaRequestId = context.awsRequestId // number that identifies the lambda execution
  const apiRequestId = event.requestContext.requestId // number that identifies the APIGateway request

  console.log('Lambda request id: ', lambdaRequestId, 'Api Gateway request id: ', apiRequestId)

  const responses = {
    POST: {
      statusCode: 201,
      body: JSON.stringify({
        message: `POST license CREATED - OK`,
      }),
    },
    PUT: {
      statusCode: 200,
      body: JSON.stringify({
        message: `PUT license UPDATED - OK`,
      }),
    },
    DELETE: {
      statusCode: 200,
      body: JSON.stringify({
        message: `DELETE license DELETED - OK`,
      }),
    },
  }

  if (event.resource === '/licenses') {
    return responses[method as keyof typeof responses]
  } else if (event.resource === '/licenses/{id}') {
    const licenseId = event.pathParameters!.id as string
    return responses[method as keyof typeof responses]
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: 'Bad request',
    }),
  }
}
