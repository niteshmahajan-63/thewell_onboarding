import type { DocumentDetails, PandaDocResponse } from "../types/pandadoc.types"

const API_KEY = import.meta.env.VITE_PANDADOC_API_KEY
const IS_SANDBOX = import.meta.env.VITE_PANDADOC_SANDBOX_MODE === 'true'
const BASE_URL = 'https://api.pandadoc.com'

const makeRequest = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = `${BASE_URL}${endpoint}`
    const config: RequestInit = {
        headers: {
            'Authorization': `API-Key ${API_KEY}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    }

    try {
        const response = await fetch(url, config)

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(`PandaDoc API Error: ${response.status} - ${errorData.message || response.statusText}`)
        }

        return await response.json() as T
    } catch (error) {
        console.error('PandaDoc API Request Failed:', error)
        throw error
    }
}

const isConfigured = (): boolean => {
    return !!API_KEY
}

const getConfigStatus = () => {
    return {
        hasApiKey: !!API_KEY,
        isSandbox: IS_SANDBOX,
        baseUrl: BASE_URL
    }
}

const getDocumentById = async (documentId: string): Promise<PandaDocResponse> => {
    if (!documentId) {
        throw new Error('Document ID is required')
    }

    console.log('Fetching document by ID:', documentId)

    const document = await makeRequest<DocumentDetails>(
        `/public/v1/documents/${documentId}/details`,
        {
            method: 'GET'
        }
    )

    const recipient = document.recipients?.[0]
    const publicUrl = recipient?.shared_link

    if (document.status === 'document.completed' || document.status === 'document.paid') {
        console.log('Document already completed')
        return {
            document,
            isExisting: true,
            isCompleted: true,
            publicUrl
        }
    }

    if (document.status === 'document.sent' || document.status === 'document.viewed') {
        console.log('Document ready for signing')
        return {
            document,
            isExisting: true,
            isCompleted: false,
            publicUrl
        }
    }

    console.log('Document found but may need to be sent, status:', document.status)
    return {
        document,
        isExisting: true,
        isCompleted: false,
        publicUrl
    }
}

export default {
    isConfigured,
    getConfigStatus,
    getDocumentById
}
