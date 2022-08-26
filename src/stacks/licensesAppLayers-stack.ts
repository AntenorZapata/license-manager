import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as lambdaNodeJS from 'aws-cdk-lib/aws-lambda-nodejs'
import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ssm from 'aws-cdk-lib/aws-ssm'

export class LicensesAppLayerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // ------------------------------

    // ------------------------------

    const licensesLayers = new lambda.LayerVersion(this, 'LicensesLayer', {
      code: lambda.Code.fromAsset('src/core/layers/licensesLayer'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
      layerVersionName: 'LicensesLayer',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    })

    new ssm.StringParameter(this, 'LicensesLayerVersionArn', {
      parameterName: 'LicensesLayerVersionArn',
      stringValue: licensesLayers.layerVersionArn,
    })

    // ------------------------------

    // ------------------------------

    const licenseEventsLayer = new lambda.LayerVersion(this, 'licenseEventsLayer', {
      code: lambda.Code.fromAsset('src/core/layers/licenseEventsLayer'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
      layerVersionName: 'licenseEventsLayer',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    })

    new ssm.StringParameter(this, 'LicenseEventsLayerArn', {
      parameterName: 'LicenseEventsLayerArn',
      stringValue: licenseEventsLayer.layerVersionArn,
    })
  }
}
