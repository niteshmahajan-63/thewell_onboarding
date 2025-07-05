export interface ZohoConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  creatorUrl: string;
  accountsUrl?: string;
  applicationName: string;
  reportName: string;
  accountOwnerName: string;
}

export const zohoConfig = (): { zoho: ZohoConfig } => ({
  zoho: {
    clientId: process.env.ZOHO_CLIENT_ID,
    clientSecret: process.env.ZOHO_CLIENT_SECRET,
    refreshToken: process.env.ZOHO_REFRESH_TOKEN,
    creatorUrl: process.env.ZOHO_CREATOR_URL || 'https://www.zohoapis.com',
    accountsUrl: process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com',
    applicationName: process.env.ZOHO_CREATOR_Application_Name || 'client-onboarding',
    reportName: process.env.ZOHO_CREATOR_Report_Name || 'Onboardings_Report',
    accountOwnerName: process.env.ZOHO_ACCOUNT_OWNER_NAME || 'thewellrecruiting',
  },
});
