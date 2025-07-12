export interface Recipient {
    email: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    shared_link?: string;
    has_completed?: boolean;
}

export interface DocumentDetails {
    id: string;
    name: string;
    status: string;
    date_created?: string;
    date_modified?: string;
    expiration_date?: string;
    version?: string;
    uuid?: string;
    recipients?: Recipient[];
    metadata?: Record<string, any>;
    [key: string]: any;
}

export interface PandaDocResponse {
    document: DocumentDetails;
    isExisting: boolean;
    isCompleted: boolean;
    publicUrl?: string;
}

export interface PandaDocConfigStatus {
    hasApiKey: boolean;
    isSandbox: boolean;
    baseUrl: string;
}
