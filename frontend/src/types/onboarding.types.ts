export interface OnboardingStep {
    id: string;
    title: string;
    name: string;
    type: string;
    isCompleted: boolean;
    isRequired: boolean;
}

export interface OnboardingRecordResponse {
    success: boolean;
    message: string;
    timestamp: string;
    statusCode: number;
    data: {
        record: OnboardingRecord,
        steps: OnboardingStep[],
        pandadoc_session_id: string;
    };
}

export interface OnboardingRecord {
    Stripe_Required: string;
    Deal_ID: string;
    PandaDoc_ID: string;
    Payment_Link: string;
    Contact_Name: string;
    Intake_Meeting_Required: string;
    Agreement_Name: string;
    Agreement_Required: string;
    Contact_ID: string;
    Deal_Name: string;
    Company_ID: string;
    Company_Name: string;
    ID: string;
    Agreement_ID: string;
    dbId: number
    Amount: number;
    Calendly_Booking_URL: {
        url: string;
        value: string;
    };
}

export interface CheckoutSessionRequest {
    recordId: string;
}

export interface CheckoutSessionResponse {
    success: boolean;
    message: string;
    timestamp: string;
    statusCode: number;
    data: {
        sessionUrl: string;
    };
}

export interface CompleteStepRequest {
    zohoRecordId: string;
    stepId: number;
}

export interface CompleteStepResponse {
    success: boolean;
    message: string;
    timestamp: string;
    statusCode: number;
    data: {
        id: number;
        zohoRecordId: string;
        stepId: number;
        isCompleted: boolean;
    };
}

export interface PaymentIntentRequest {
    recordId: string;
}

export interface PaymentIntentResponse {
    success: boolean;
    message: string;
    timestamp: string;
    statusCode: number;
    data: string;
}

export interface DownloadInvoiceResponse {
    success: boolean;
    message: string;
    timestamp: string;
    statusCode: number;
    data: string;
}

export interface PaymentStatusResponse {
    success: boolean;
    message: string;
    timestamp: string;
    statusCode: number;
    data: {
        status: string;
        amount: number;
        currency: string;
    };
}

export interface PaymentStatusRequest {
    paymentIntentId: string;
}