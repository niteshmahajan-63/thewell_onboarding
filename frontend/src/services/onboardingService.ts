import type {
    CompleteStepRequest,
    CompleteStepResponse,
    DownloadInvoiceResponse,
    OnboardingRecordResponse,
    PaymentIntentRequest,
    PaymentIntentResponse
} from "../types/onboarding.types";
import api from "./api";

export const getOnboardingByRecordId = async (recordId?: string): Promise<OnboardingRecordResponse> => {
    try {
        const url = `/onboarding/get-record?recordId=${recordId}`
        const response = await api.get<OnboardingRecordResponse>(url);

        if (!response.data.success) {
            const errorMessage = response.data.message || "Failed to fetch record";
            throw new Error(errorMessage);
        }

        return response.data;
    } catch (error: any) {
        if (error.response?.data) {
            const apiError = error.response.data;
            if (!apiError.success) {
                const errorMessage = apiError.message || "Failed to fetch record";
                throw new Error(errorMessage);
            }
        }

        let message = "Something went wrong while fetching record";
        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === "string") {
            message = error;
        } else if (typeof error === "object" && error !== null && "message" in error) {
            message = (error as { message: string }).message;
        }
        throw new Error(message);
    }
};

export const completeStep = async (completeStepRequest: CompleteStepRequest): Promise<CompleteStepResponse> => {
    try {
        const url = `/onboarding/complete-step`
        const response = await api.post<CompleteStepResponse>(url, completeStepRequest);

        if (!response.data.success) {
            const errorMessage = response.data.message || "Failed to complete step";
            throw new Error(errorMessage);
        }

        return response.data;
    } catch (error: any) {
        if (error.response?.data) {
            const apiError = error.response.data;
            if (!apiError.success) {
                const errorMessage = apiError.message || "Failed to complete step";
                throw new Error(errorMessage);
            }
        }

        let message = "Something went wrong while completing step";
        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === "string") {
            message = error;
        } else if (typeof error === "object" && error !== null && "message" in error) {
            message = (error as { message: string }).message;
        }
        throw new Error(message);
    }
};

export const createPaymentIntent = async (paymentIntentRequest: PaymentIntentRequest): Promise<PaymentIntentResponse> => {
    try {
        const url = `/onboarding/create-payment-intent`
        const response = await api.post<PaymentIntentResponse>(url, paymentIntentRequest);

        if (!response.data.success) {
            const errorMessage = response.data.message || "Failed to create payment intent";
            throw new Error(errorMessage);
        }

        return response.data;
    } catch (error: any) {
        if (error.response?.data) {
            const apiError = error.response.data;
            if (!apiError.success) {
                const errorMessage = apiError.message || "Failed to create payment intent";
                throw new Error(errorMessage);
            }
        }

        let message = "Something went wrong while creating payment intent";
        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === "string") {
            message = error;
        } else if (typeof error === "object" && error !== null && "message" in error) {
            message = (error as { message: string }).message;
        }
        throw new Error(message);
    }
};

export const downloadReceipt = async (recordId: string): Promise<DownloadInvoiceResponse> => {
    try {
        const url = `/onboarding/download-invoice?recordId=${recordId}`
        const response = await api.get<DownloadInvoiceResponse>(url);

        if (!response.data.success) {
            const errorMessage = response.data.message || "Failed to fetch record";
            throw new Error(errorMessage);
        }

        return response.data;
    } catch (error: any) {
        if (error.response?.data) {
            const apiError = error.response.data;
            if (!apiError.success) {
                const errorMessage = apiError.message || "Failed to fetch record";
                throw new Error(errorMessage);
            }
        }

        let message = "Something went wrong while fetching record";
        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === "string") {
            message = error;
        } else if (typeof error === "object" && error !== null && "message" in error) {
            message = (error as { message: string }).message;
        }
        throw new Error(message);
    }
};

export const downloadInvoice = async (recordId: string): Promise<DownloadInvoiceResponse> => {
    try {
        const url = `/onboarding/download-due-invoice?recordId=${recordId}`
        const response = await api.get<DownloadInvoiceResponse>(url);

        if (!response.data.success) {
            const errorMessage = response.data.message || "Failed to fetch record";
            throw new Error(errorMessage);
        }

        return response.data;
    } catch (error: any) {
        if (error.response?.data) {
            const apiError = error.response.data;
            if (!apiError.success) {
                const errorMessage = apiError.message || "Failed to fetch record";
                throw new Error(errorMessage);
            }
        }

        let message = "Something went wrong while fetching record";
        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === "string") {
            message = error;
        } else if (typeof error === "object" && error !== null && "message" in error) {
            message = (error as { message: string }).message;
        }
        throw new Error(message);
    }
};