import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as cwlogs from 'aws-cdk-lib/aws-logs'
import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { LicenseManagerApiStackProps } from '../core/interfaces'

export class LicenseManagerApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LicenseManagerApiStackProps) {
    super(scope, id, props)

    const logGroup = new cwlogs.LogGroup(this, 'LicenseManagerApiLogs')

    // -----------------------------------------------------------------
    // API Gateway
    // -----------------------------------------------------------------

    const api = new apigateway.RestApi(this, 'LicenseManagerApi', {
      restApiName: 'licenseManagerApi',
      deployOptions: {
        accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          caller: true,
          user: true,
        }),
      },
    })

    // Create API endpoints

    const getLicenseIntegration = new apigateway.LambdaIntegration(props.getLicenseHandler)
    const createLicenseIntegration = new apigateway.LambdaIntegration(props.createLicenseHandler)
    const updateLicenseIntegration = new apigateway.LambdaIntegration(props.updateLicenseHandler)
    const deleteLicenseIntegration = new apigateway.LambdaIntegration(props.deleteLicenseHandler)
    const webHookIntegration = new apigateway.LambdaIntegration(props.stripeWebHookHandler)

    // "/licenses"

    const licenseResource = api.root.addResource('licenses')
    licenseResource.addMethod('GET', getLicenseIntegration)

    const licenseRequestValidator = new apigateway.RequestValidator(this, 'LicenseRequestValidator', {
      restApi: api,
      requestValidatorName: 'LicenseRequestValidator',
      validateRequestBody: true,
    })

    // "/licenses/:id"

    const licenseIdResource = licenseResource.addResource('{id}')
    licenseIdResource.addMethod('GET', getLicenseIntegration)
    licenseIdResource.addMethod('PUT', updateLicenseIntegration)
    licenseIdResource.addMethod('DELETE', deleteLicenseIntegration)

    // Validations

    const licenseModel = new apigateway.Model(this, 'LicenseModel', {
      modelName: 'LicenseModel',
      restApi: api,
      schema: {
        type: apigateway.JsonSchemaType.OBJECT,
        properties: {
          fullName: {
            type: apigateway.JsonSchemaType.STRING,
          },
          email: {
            type: apigateway.JsonSchemaType.STRING,
          },
          licenseLimit: {
            type: apigateway.JsonSchemaType.NUMBER,
          },
        },
        required: ['fullName', 'email', 'licenseLimit'],
      },
    })
    licenseResource.addMethod('POST', createLicenseIntegration, {
      requestValidator: licenseRequestValidator,
      requestModels: {
        'application/json': licenseModel,
      },
    })

    // Stripe WebHook

    const webHookResource = api.root.addResource('webhook')
    webHookResource.addMethod('POST', webHookIntegration)
  }
}
