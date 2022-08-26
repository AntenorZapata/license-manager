import { License } from 'src/core/interfaces'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

export class LicenseRepository {
  readonly ddbClient: DocumentClient
  private licensesDbd: string

  constructor(ddbClient: DocumentClient, licensesDbd: string) {
    this.ddbClient = ddbClient
    this.licensesDbd = licensesDbd
  }

  // -----------------------------------------------------------------
  // Get all Licenses
  // -----------------------------------------------------------------

  async getAllLicenses(): Promise<License[]> {
    const data = await this.ddbClient
      .scan({
        TableName: this.licensesDbd,
      })
      .promise()

    return data.Items as License[]
  }

  // -----------------------------------------------------------------
  // Get license by id
  // -----------------------------------------------------------------

  async getLicenseById(licenseId: string): Promise<License> {
    const data = await this.ddbClient
      .get({
        TableName: this.licensesDbd,
        Key: {
          licenseKey: licenseId,
        },
      })
      .promise()

    if (data.Item) {
      return data.Item as License
    } else {
      throw new Error('License not found')
    }
  }

  // -----------------------------------------------------------------
  // Create License
  // -----------------------------------------------------------------

  async createLicense(license: License): Promise<License> {
    await this.ddbClient
      .put({
        TableName: this.licensesDbd,
        Item: license,
      })
      .promise()
    return license
  }

  // -----------------------------------------------------------------
  // Update License
  // -----------------------------------------------------------------

  async updateLicense(licenseId: string, license: License): Promise<License> {
    const data = await this.ddbClient
      .update({
        TableName: this.licensesDbd,
        Key: {
          licenseKey: licenseId,
        },
        ConditionExpression: 'attribute_exists(licenseKey)',
        ReturnValues: 'UPDATED_NEW',
        UpdateExpression: 'set fullName = :f, email = :e, licenseLimit = :l, phase = :p, registerKey = :r',
        ExpressionAttributeValues: {
          ':f': license.fullName,
          ':e': license.email,
          ':l': license.licenseLimit,
          ':p': license.phase,
          ':r': license.registerKey,
        },
      })
      .promise()
    data.Attributes!.licenseKey = licenseId
    return data.Attributes as License
  }

  // -----------------------------------------------------------------
  // Delete License
  // -----------------------------------------------------------------

  async deleteLicense(licenseId: string): Promise<License> {
    const data = await this.ddbClient
      .delete({
        TableName: this.licensesDbd,
        Key: {
          licenseKey: licenseId,
        },
        ReturnValues: 'ALL_OLD',
      })
      .promise()

    if (data.Attributes) {
      return data.Attributes as License
    } else {
      throw new Error('License not found')
    }
  }
}
