import {
    IAuthenticateGeneric,
    ICredentialTestRequest,
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class GraphitiApi implements ICredentialType {
    name = 'graphitiApi';
    displayName = 'Graphiti API';
    documentationUrl = 'https://github.com/GoGoButters/Graphiti_n8n_node';
    properties: INodeProperties[] = [
        {
            displayName: 'API URL',
            name: 'apiUrl',
            type: 'string',
            default: 'http://localhost:8000',
            placeholder: 'http://192.168.1.98:8000',
            description: 'Base URL of your Graphiti server',
            required: true,
        },
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            typeOptions: {
                password: true,
            },
            default: '',
            description: 'API key for Graphiti server authentication',
            required: true,
        },
    ];

    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
            headers: {
                'X-API-KEY': '={{$credentials.apiKey}}',
            },
        },
    };

    test: ICredentialTestRequest = {
        request: {
            baseURL: '={{$credentials.apiUrl}}',
            url: '/health',
            method: 'GET',
        },
    };
}
