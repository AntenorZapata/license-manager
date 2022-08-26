export enum LicenseEventType {
  CREATED = 'LICENSE_CREATED',
  UPDATED = 'PRODUCT_UPDATED',
  DELETED = 'PRODUCT_DELETED',
}

export interface LicenseEvent {
  requestId: string
  eventType: LicenseEventType
  licenseKey: string
  licenseLimit: number
  email: string
  phase: string
}
