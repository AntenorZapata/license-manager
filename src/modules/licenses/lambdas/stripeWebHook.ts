import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  console.log('Stripe Event: ', event.body)

  return {
    statusCode: 200,
    body: JSON.stringify(event.body),
  }
}
