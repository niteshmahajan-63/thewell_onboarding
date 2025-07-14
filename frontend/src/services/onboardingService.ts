import type { CheckoutSessionRequest, CheckoutSessionResponse, CompleteStepRequest, CompleteStepResponse, OnboardingRecordResponse } from "../types/onboarding.types";
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

export const getCheckoutSession = async (checkoutSessionRequest: CheckoutSessionRequest): Promise<CheckoutSessionResponse> => {
    try {
        const url = `/onboarding/create-checkout-session`
        const response = await api.post<CheckoutSessionResponse>(url, checkoutSessionRequest);

        if (!response.data.success) {
            const errorMessage = response.data.message || "Failed to create checkout session";
            throw new Error(errorMessage);
        }

        return response.data;
    } catch (error: any) {
        if (error.response?.data) {
            const apiError = error.response.data;
            if (!apiError.success) {
                const errorMessage = apiError.message || "Failed to create checkout session";
                throw new Error(errorMessage);
            }
        }

        let message = "Something went wrong while creating checkout session";
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
        const url = `/onboarding/create-checkout-session`
        const response = await api.post<CompleteStepResponse>(url, completeStepRequest);

        if (!response.data.success) {
            const errorMessage = response.data.message || "Failed to create checkout session";
            throw new Error(errorMessage);
        }

        return response.data;
    } catch (error: any) {
        if (error.response?.data) {
            const apiError = error.response.data;
            if (!apiError.success) {
                const errorMessage = apiError.message || "Failed to create checkout session";
                throw new Error(errorMessage);
            }
        }

        let message = "Something went wrong while creating checkout session";
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