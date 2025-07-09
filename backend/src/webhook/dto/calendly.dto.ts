/**
 * Types for Calendly webhook events
 */
export interface CalendlyWebhookPayload {
    event: string;
    payload: CalendlyInviteeData;
}

export interface CalendlyInviteeData {
    uri: string;
    email: string;
    name: string;
    first_name: string;
    last_name: string;
    event?: CalendlyEventData;
    scheduled_event?: CalendlyEventData;
    questions_and_answers?: Array<{
        question: string;
        answer: string;
    }>;
    cancellation?: any;
    rescheduled: boolean;
    status: string;
    created_at: string;
    updated_at: string;
    event_type: any;
    tracking: any;
}

export interface CalendlyEventData {
    uri: string;
    name: string;
    start_time: string;
    end_time: string;
    location: string | Record<string, any>;
    canceled?: boolean;
    cancellation_reason?: string;
}
