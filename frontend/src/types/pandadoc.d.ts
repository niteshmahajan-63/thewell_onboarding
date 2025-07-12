// Type declarations for modules without typescript definitions
declare module '../services/pandadoc' {
    import { PandaDocResponse } from '../types/pandadoc.types';
    
    const pandaDocService: {
        isConfigured: () => boolean;
        getDocumentById: (documentId: string) => Promise<PandaDocResponse>;
        getConfigStatus: () => {
            hasApiKey: boolean;
            isSandbox: boolean;
            baseUrl: string;
        };
    };
    
    export default pandaDocService;
}
