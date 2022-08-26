import { LicenseRepository } from '../layers/licensesLayer/nodejs/licenseRepository'
import { DynamoDB } from 'aws-sdk'

const licensesDdb = process.env.LICENSES_DDB!
const ddbClient = new DynamoDB.DocumentClient()

const licensesRepository = new LicenseRepository(ddbClient, licensesDdb)

export { licensesRepository }
