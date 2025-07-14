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
        steps: OnboardingStep[]
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
    recordId: string;
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