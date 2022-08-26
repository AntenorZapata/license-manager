import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as dynamoDb from 'aws-cdk-lib/aws-dynamodb'
import * as ssm from 'aws-cdk-lib/aws-ssm'

export class EventsDbdStack extends cdk.Stack {
  readonly eventsDbd: dynamoDb.Table

  constructor(scopre: Construct, id: string, props?: cdk.StackProps) {
    super(scopre, id, props)

    this.eventsDbd = new dynamoDb.Table(this, 'EventsDbd', {
      tableName: 'events',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: 'pk',
        type: dynamoDb.AttributeType.STRING,
      },
      sortKey: {
        name: 'sk',
        type: dynamoDb.AttributeType.STRING,
      },
      timeToLiveAttribute: 'ttl',
      billingMode: dynamoDb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    })
  }
}
