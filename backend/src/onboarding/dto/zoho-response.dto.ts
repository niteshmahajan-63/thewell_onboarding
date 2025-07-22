export interface ZohoTokenResponse {
	access_token: string;
	expires_in: number;
	api_domain: string;
	token_type: string;
	expires_in_sec: number;
}

export interface ZohoRecordResponse {
	code: number;
	data: Record<string, any>;
	message: string;
}
