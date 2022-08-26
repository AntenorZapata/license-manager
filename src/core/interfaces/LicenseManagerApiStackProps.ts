import * as lambdaNodeJS from 'aws-cdk-lib/aws-lambda-nodejs'
import * as cdk from 'aws-cdk-lib'

export interface LicenseManagerApiStackProps extends cdk.StackProps {
  getLicenseHandler: lambdaNodeJS.NodejsFunction
  createLicenseHandler: lambdaNodeJS.NodejsFunction
  updateLicenseHandler: lambdaNodeJS.NodejsFunction
  deleteLicenseHandler: lambdaNodeJS.NodejsFunction
  stripeWebHookHandler: lambdaNodeJS.NodejsFunction
}
