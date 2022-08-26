import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as lambdaNodeJS from 'aws-cdk-lib/aws-lambda-nodejs'
import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as dynamoDb from 'aws-cdk-lib/aws-dynamodb'
import * as ssm from 'aws-cdk-lib/aws-ssm'
import * as iam from 'aws-cdk-lib/aws-iam'

interface LicensesAppStackProps extends cdk.StackProps {
  eventsDbd: dynamoDb.Table
}

export class LicenseAppStack extends cdk.Stack {
  readonly getLicenseHandler: lambdaNodeJS.NodejsFunction
  readonly createLicenseHandler: lambdaNodeJS.NodejsFunction
  readonly updateLicenseHandler: lambdaNodeJS.NodejsFunction
  readonly deleteLicenseHandler: lambdaNodeJS.NodejsFunction
  readonly stripeWebHookHandler: lambdaNodeJS.NodejsFunction
  readonly licensesDbd: dynamoDb.Table

  constructor(scope: Construct, id: string, props: LicensesAppStackProps) {
    super(scope, id, props)

    // -----------------------------------------------------------------
    // Dynamodb - LicensesDbd Table
    // -----------------------------------------------------------------

    this.licensesDbd = new dynamoDb.Table(this, 'LicensesDbd', {
      tableName: 'licenses',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: 'licenseKey',
        type: dynamoDb.AttributeType.STRING,
      },
      billingMode: dynamoDb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    })

    // -----------------------------------------------------------------
    // Layers
    // -----------------------------------------------------------------

    const licensesLayerArn = ssm.StringParameter.valueForStringParameter(this, 'LicensesLayerVersionArn')
    const licensesLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      'LicensesLayerVersionArn',
      licensesLayerArn,
    )

    const licenseEventLayerArn = ssm.StringParameter.valueForStringParameter(this, 'LicenseEventsLayerArn')
    const licenseEventsLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      'LicenseEventsLayerArn',
      licenseEventLayerArn,
    )

    // -----------------------------------------------------------------
    // Events Lambda
    // -----------------------------------------------------------------

    const licenseEventsHandler = new lambdaNodeJS.NodejsFunction(this, 'eventsHandler', {
      functionName: 'licenseEvents',
      entry: 'src/modules/logEvents/lambdas/licenseEvents.ts',
      handler: 'handler',
      memorySize: 128,
      timeout: cdk.Duration.seconds(2),
      bundling: {
        minify: true,
        sourceMap: false,
      },
      environment: {
        EVENTS_DDB: props.eventsDbd.tableName,
      },
      layers: [licenseEventsLayer],
      tracing: lambda.Tracing.ACTIVE,
      insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
    })

    props.eventsDbd.grantWriteData(licenseEventsHandler)

    // -----------------------------------------------------------------
    // Get License Lambda
    // -----------------------------------------------------------------

    this.getLicenseHandler = new lambdaNodeJS.NodejsFunction(this, 'getLicenseHandler', {
      functionName: 'getLicense',
      entry: 'src/modules/licenses/lambdas/getLicense.ts',
      handler: 'handler',
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      bundling: {
        minify: true,
        sourceMap: false,
      },
      environment: {
        LICENSES_DDB: this.licensesDbd.tableName,
      },
      layers: [licensesLayer],
      tracing: lambda.Tracing.ACTIVE,
      insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
    })

    this.licensesDbd.grantReadData(this.getLicenseHandler)

    // -----------------------------------------------------------------
    // Create License Lambda
    // -----------------------------------------------------------------

    this.createLicenseHandler = new lambdaNodeJS.NodejsFunction(this, 'createLicenseHandler', {
      functionName: 'createLicense',
      entry: 'src/modules/licenses/lambdas/createLicense.ts',
      handler: 'handler',
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      bundling: {
        minify: true,
        sourceMap: false,
      },
      environment: {
        LICENSES_DDB: this.licensesDbd.tableName,
        LICENSE_EVENTS_FUNCTION_NAME: licenseEventsHandler.functionName,
      },
      layers: [licensesLayer, licenseEventsLayer],
      tracing: lambda.Tracing.ACTIVE,
      insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
    })

    this.licensesDbd.grantWriteData(this.createLicenseHandler)
    licenseEventsHandler.grantInvoke(this.createLicenseHandler)

    const sendEmailSesPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*'],
    })

    this.createLicenseHandler.addToRolePolicy(sendEmailSesPolicy)

    // -----------------------------------------------------------------
    // Update License Lambda
    // -----------------------------------------------------------------

    this.updateLicenseHandler = new lambdaNodeJS.NodejsFunction(this, 'updateLicenseHandler', {
      functionName: 'updateLicense',
      entry: 'src/modules/licenses/lambdas/updateLicense.ts',
      handler: 'handler',
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      bundling: {
        minify: true,
        sourceMap: false,
      },
      environment: {
        LICENSES_DDB: this.licensesDbd.tableName,
      },
      layers: [licensesLayer],
      tracing: lambda.Tracing.ACTIVE,
      insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
    })

    this.licensesDbd.grantWriteData(this.updateLicenseHandler)

    // -----------------------------------------------------------------
    // Delete License Lambda
    // -----------------------------------------------------------------

    this.deleteLicenseHandler = new lambdaNodeJS.NodejsFunction(this, 'deleteLicenseHandler', {
      functionName: 'deleteLicense',
      entry: 'src/modules/licenses/lambdas/deleteLicense.ts',
      handler: 'handler',
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      bundling: {
        minify: true,
        sourceMap: false,
      },
      environment: {
        LICENSES_DDB: this.licensesDbd.tableName,
      },
      layers: [licensesLayer],
      tracing: lambda.Tracing.ACTIVE,
      insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
    })

    this.licensesDbd.grantWriteData(this.deleteLicenseHandler)

    // -----------------------------------------------------------------
    // Stripe Integration
    // -----------------------------------------------------------------

    this.stripeWebHookHandler = new lambdaNodeJS.NodejsFunction(this, 'stripeWebHookHandler', {
      functionName: 'stripeWebHook',
      entry: 'src/modules/licenses/lambdas/stripeWebHook.ts',
      handler: 'handler',
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      bundling: {
        minify: true,
        sourceMap: false,
      },
      tracing: lambda.Tracing.ACTIVE,
      insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
    })
  }
}
