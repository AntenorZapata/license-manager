#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { LicenseAppStack } from '../src/stacks/licenseApp-stack'
import { LicenseManagerApiStack } from '../src/stacks/licenseManagerAPI-stack'
import { LicensesAppLayerStack } from '../src/stacks/licensesAppLayers-stack'
import { EventsDbdStack } from '../src/stacks/eventsDbd-stack'

const app = new cdk.App()

const env: cdk.Environment = {
  account: '873266883171',
  region: 'us-east-1',
}

const tags = {
  cost: 'LicenseManager',
  team: 'TMR-Software',
}

const licensesAppLayersStack = new LicensesAppLayerStack(app, 'LicensesAppLayers', {
  tags,
  env,
})

// Initialize App and Events stack

const eventsDbdStack = new EventsDbdStack(app, 'EventsDbd', {
  tags,
  env,
})

const licenseAppStack = new LicenseAppStack(app, 'LicenseApp', {
  eventsDbd: eventsDbdStack.eventsDbd,
  tags,
  env,
})

licenseAppStack.addDependency(licensesAppLayersStack)
licenseAppStack.addDependency(eventsDbdStack)

// Initialize API gateway stack

const licenseManagerApiStack = new LicenseManagerApiStack(app, 'LicenseManagerApi', {
  getLicenseHandler: licenseAppStack.getLicenseHandler,
  createLicenseHandler: licenseAppStack.createLicenseHandler,
  updateLicenseHandler: licenseAppStack.updateLicenseHandler,
  deleteLicenseHandler: licenseAppStack.deleteLicenseHandler,
  stripeWebHookHandler: licenseAppStack.stripeWebHookHandler,
  tags,
  env,
})
licenseManagerApiStack.addDependency(licenseAppStack)
