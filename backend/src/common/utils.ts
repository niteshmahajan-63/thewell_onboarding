/**
 * Utility functions for API response handling
 */

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    timestamp: string;
    statusCode: number;
}

/**
 * Creates a standardized success response
 * @param data The data to include in the response
 * @param message Optional success message
 * @param statusCode Optional status code (default: 200)
 * @returns Standardized API success response
 */
export function createSuccessResponse<T>(
    data: T,
    message: string = 'Operation successful',
    statusCode: number = 200
): ApiResponse<T> {
    return {
        success: true,
        data,
        message,
        timestamp: new Date().toISOString(),
        statusCode,
    };
}

/**
 * Creates a standardized error response
 * @param message Error message
 * @param statusCode HTTP status code (default: 500)
 * @param data Optional data to include with error
 * @returns Standardized API error response
 */
export function createErrorResponse(
    message: string,
    statusCode: number = 500,
    data: any = null
): ApiResponse<any> {
    return {
        success: false,
        data,
        message,
        timestamp: new Date().toISOString(),
        statusCode,
    };
}
