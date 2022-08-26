import { AWSError, Lambda, SES } from 'aws-sdk'

const sesClient = new SES()

export function sendEmail(secretMessage: string, email: string) {
  return sesClient
    .sendEmail({
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: `A chanve da licença é ${secretMessage}`,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'MoovSec - chave de licença',
        },
      },
      Source: 'antenorzapata@gmail.com',
    })
    .promise()
}
