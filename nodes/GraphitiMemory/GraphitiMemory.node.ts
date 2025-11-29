import {
    ISupplyDataFunctions,
    INodeType,
    INodeTypeDescription,
    SupplyData,
} from 'n8n-workflow';
import { v4 as uuidv4 } from 'uuid';
import { GraphitiChatMemory } from './GraphitiChatMemory';

export class GraphitiMemory implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Graphiti Memory',
        name: 'graphitiMemory',
        icon: 'file:graphiti-memory.svg',
        group: ['transform'],
        version: 1,
        description: 'Graphiti temporal knowledge graph memory for AI agents',
        defaults: {
            name: 'Graphiti Memory',
        },
        codex: {
            categories: ['AI'],
            subcategories: {
                AI: ['Memory'],
            },
            resources: {
                primaryDocumentation: [
                    {
                        url: 'https://github.com/GoGoButters/Graphiti_n8n_node',
                    },
                ],
            },
        },
        inputs: [],
        outputs: ['ai_memory'],
        outputNames: ['Memory'],
        credentials: [
            {
                name: 'graphitiApi',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Session Key',
                name: 'sessionKey',
                type: 'string',
                default: '={{ $json.sessionId }}',
                description:
                    'Expression to get the session/user ID. Defaults to sessionId from input data. If empty, a UUID will be generated.',
                required: false,
            },
            {
                displayName: 'Context Window Length',
                name: 'contextWindowLength',
                type: 'number',
                default: 5,
                description: 'Number of recent messages to keep in short-term memory',
                typeOptions: {
                    minValue: 1,
                    maxValue: 50,
                },
            },
            {
                displayName: 'Memory Key',
                name: 'memoryKey',
                type: 'string',
                default: 'chat_history',
                description: 'Key name for storing memory in the context',
                required: false,
            },
            {
                displayName: 'Search Limit',
                name: 'searchLimit',
                type: 'number',
                default: 10,
                description: 'Maximum number of facts to retrieve from long-term memory',
                typeOptions: {
                    minValue: 1,
                    maxValue: 100,
                },
            },
        ],
    };

    async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
        // Get credentials
        const credentials = await this.getCredentials('graphitiApi');
        const apiUrl = credentials.apiUrl as string;
        const apiKey = credentials.apiKey as string;

        // Get parameters
        const sessionKeyExpression = this.getNodeParameter('sessionKey', itemIndex, '') as string;
        const contextWindowLength = this.getNodeParameter('contextWindowLength', itemIndex, 5) as number;
        const memoryKey = this.getNodeParameter('memoryKey', itemIndex, 'chat_history') as string;
        const searchLimit = this.getNodeParameter('searchLimit', itemIndex, 10) as number;

        // Extract session/user ID
        let userId = sessionKeyExpression;

        // If sessionKey is empty or undefined, generate UUID
        if (!userId || userId.trim() === '') {
            userId = uuidv4();
        }

        // Initialize memory instance
        const memory = new GraphitiChatMemory({
            apiUrl,
            apiKey,
            userId,
            contextWindowLength,
            searchLimit,
            memoryKey,
        });

        return {
            response: memory,
        };
    }
}
