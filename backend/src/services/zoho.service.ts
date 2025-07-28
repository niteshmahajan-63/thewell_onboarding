import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ZohoConfig } from '../config/zoho.config';
import { ZohoRecordResponse, ZohoTokenResponse } from '../onboarding/dto/zoho-response.dto';

@Injectable()
export class ZohoService {
	private readonly logger = new Logger(ZohoService.name);
	private accessToken: string | null = null;
	private tokenExpiryTime: number = 0;

	constructor(
		private readonly module: string,
		private readonly configService: ConfigService,
		private readonly httpService: HttpService,
	) { }

	private get zohoConfig(): ZohoConfig {
		return this.configService.get<ZohoConfig>('zoho');
	}

	async getAccessToken(): Promise<string> {
		if (this.accessToken && Date.now() < this.tokenExpiryTime - 300000) {
			return this.accessToken;
		}

		await this.refreshAccessToken();
		return this.accessToken;
	}

	private async refreshAccessToken(): Promise<void> {
		try {
			const { clientId, clientSecret, refreshToken, accountsUrl } = this.zohoConfig;

			const params = new URLSearchParams({
				refresh_token: refreshToken,
				client_id: clientId,
				client_secret: clientSecret,
				grant_type: 'refresh_token',
			});

			const response = await firstValueFrom(
				this.httpService.post<ZohoTokenResponse>(
					`${accountsUrl}/oauth/v2/token`,
					params.toString(),
					{
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
						},
					},
				),
			);

			const tokenData = response.data;
			this.accessToken = tokenData.access_token;
			this.tokenExpiryTime = Date.now() + (tokenData.expires_in * 1000);

			this.logger.log('Access token refreshed successfully');
		} catch (error) {
			this.logger.error('Failed to refresh access token', error.response?.data || error.message);
			throw new InternalServerErrorException('Failed to authenticate with Zoho Creator');
		}
	}

	async getRecordById(
		recordId: string,
	): Promise<Record<string, any>> {
		try {
			const accessToken = await this.getAccessToken();
			const { creatorUrl, applicationName, reportName, accountOwnerName } = this.zohoConfig;

			const url = `${creatorUrl}/creator/v2.1/data/${accountOwnerName}/${applicationName}/report/${reportName}/${recordId}`;

			this.logger.log(`Fetching record with ID: ${recordId} from ${reportName} in ${applicationName}`);

			const response = await firstValueFrom(
				this.httpService.get<ZohoRecordResponse>(url, {
					headers: {
						'Authorization': `Zoho-oauthtoken ${accessToken}`,
						'Content-Type': 'application/json',
						'Accept': 'application/json',
					},
				}),
			);

			if (response.data.code !== 3000) {
				this.logger.error(`Zoho API error: ${response.data.message}`);
				throw new BadRequestException(`Failed to fetch record: ${response.data.message}`);
			}

			this.logger.log(`Successfully fetched record with ID: ${recordId}`);
			return response.data.data;
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}

			const { applicationName, reportName } = this.zohoConfig;

			this.logger.error('Error fetching record from Zoho Creator', {
				recordId,
				reportName,
				applicationName,
				error: error.response?.data || error.message,
			});

			if (error.response?.status === 401) {
				throw new InternalServerErrorException('Authentication failed with Zoho Creator');
			}

			if (error.response?.status === 404) {
				throw new BadRequestException('Record not found or invalid parameters');
			}

			throw new InternalServerErrorException('Failed to fetch record from Zoho Creator');
		}
	}

	async getRecords(): Promise<Record<string, any>> {
		try {
			const accessToken = await this.getAccessToken();
			const { creatorUrl, applicationName, reportName } = this.zohoConfig;

			const url = `${creatorUrl}/creator/v2.1/data/thewellrecruiting/${applicationName}/report/${reportName}`;

			this.logger.log(`Fetching records: From ${reportName} in ${applicationName}`);

			const response = await firstValueFrom(
				this.httpService.get<ZohoRecordResponse>(url, {
					headers: {
						'Authorization': `Zoho-oauthtoken ${accessToken}`,
						'Content-Type': 'application/json',
						'Accept': 'application/json',
					},
				}),
			);

			if (response.data.code !== 3000) {
				this.logger.error(`Zoho API error: ${response.data.message}`);
				throw new BadRequestException(`Failed to fetch record: ${response.data.message}`);
			}

			this.logger.log(`Successfully fetched records`);
			return response.data.data;
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}

			const { applicationName, reportName } = this.zohoConfig;

			this.logger.error('Error fetching records from Zoho Creator', {
				reportName,
				applicationName,
				error: error.response?.data || error.message,
			});

			if (error.response?.status === 401) {
				throw new InternalServerErrorException('Authentication failed with Zoho Creator');
			}

			if (error.response?.status === 404) {
				throw new BadRequestException('Record not found or invalid parameters');
			}

			throw new InternalServerErrorException('Failed to fetch record from Zoho Creator');
		}
	}

	async updateRecord(
		recordId: string,
		data: Record<string, any>,
	): Promise<Record<string, any>> {
		try {
			const accessToken = await this.getAccessToken();
			const { creatorUrl, applicationName, reportName, accountOwnerName } = this.zohoConfig;

			const url = `${creatorUrl}/creator/v2.1/data/${accountOwnerName}/${applicationName}/report/${reportName}/${recordId}`;

			this.logger.log(`Updating record with ID: ${recordId} in ${reportName} of ${applicationName}`);

			const response = await firstValueFrom(
				this.httpService.put<ZohoRecordResponse>(url, { data }, {
					headers: {
						'Authorization': `Zoho-oauthtoken ${accessToken}`,
						'Content-Type': 'application/json',
						'Accept': 'application/json',
					},
				}),
			);

			if (response.data.code !== 3000) {
				this.logger.error(`Zoho API error: ${response.data.message}`);
				throw new BadRequestException(`Failed to update record: ${response.data.message}`);
			}

			this.logger.log(`Successfully updated record with ID: ${recordId}`);
			return response.data.data;
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}

			const { applicationName, reportName } = this.zohoConfig;

			this.logger.error('Error updating record in Zoho Creator', {
				recordId,
				reportName,
				applicationName,
				error: error.response?.data || error.message,
			});

			if (error.response?.status === 401) {
				throw new InternalServerErrorException('Authentication failed with Zoho Creator');
			}

			if (error.response?.status === 404) {
				throw new BadRequestException('Record not found or invalid parameters');
			}

			throw new InternalServerErrorException('Failed to update record in Zoho Creator');
		}
	}
}
