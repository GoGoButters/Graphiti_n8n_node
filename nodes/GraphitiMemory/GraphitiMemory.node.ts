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
                displayName: 'Session ID Type',
                name: 'sessionIdType',
                type: 'options',
                options: [
                    {
                        name: 'Take From Previous Node Automatically',
                        value: 'fromInput',
                        description: 'Use sessionId from the input data',
                    },
                    {
                        name: 'Define Below',
                        value: 'customKey',
                        description: 'Use a custom session key expression',
                    },
                ],
                default: 'fromInput',
                description: 'How to determine the session ID for the user',
            },
            {
                displayName: 'Session Key',
                name: 'sessionKey',
                type: 'string',
                default: '={{ $json.sessionId }}',
                description:
                    'The key to use to store session ID. Can be an expression. If empty or not found, a random ID will be generated.',
                displayOptions: {
                    show: {
                        sessionIdType: ['customKey'],
                    },
                },
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
        const sessionIdType = this.getNodeParameter('sessionIdType', itemIndex, 'fromInput') as string;
        const contextWindowLength = this.getNodeParameter(
            'contextWindowLength',
            itemIndex,
            5,
        ) as number;
        const searchLimit = this.getNodeParameter('searchLimit', itemIndex, 10) as number;

        console.log(`[Graphiti Node] Params - contextWindowLength: ${contextWindowLength}, searchLimit: ${searchLimit}`);

        // Determine session ID based on type
        let sessionId: string;

        // Debug: Log available data
        console.log('[Graphiti Node] ===== SESSION ID EXTRACTION =====');
        console.log('[Graphiti Node] sessionIdType:', sessionIdType);

        if (sessionIdType === 'customKey') {
            const sessionKey = this.getNodeParameter('sessionKey', itemIndex, '') as string;
            console.log('[Graphiti Node] customKey sessionKey:', sessionKey);
            sessionId = sessionKey || uuidv4();
        } else {
            // Try multiple sources for session ID
            const inputData = this.getInputData(itemIndex);
            console.log('[Graphiti Node] inputData:', JSON.stringify(inputData, null, 2));

            // Try to get from various possible locations
            const fromJsonSessionId = inputData[0]?.json?.sessionId as string;
            const fromJsonChatSessionId = inputData[0]?.json?.chatSessionId as string;

            console.log('[Graphiti Node] fromJsonSessionId:', fromJsonSessionId);
            console.log('[Graphiti Node] fromJsonChatSessionId:', fromJsonChatSessionId);

            sessionId = fromJsonSessionId || fromJsonChatSessionId || uuidv4();
        }

        console.log('[Graphiti Node] FINAL sessionId (userId):', sessionId);
        console.log('[Graphiti Node] ===============================');

        // Initialize memory instance
        const memory = new GraphitiChatMemory({
            apiUrl,
            apiKey,
            userId: sessionId,
            contextWindowLength,
            searchLimit,
            memoryKey: 'chat_history',
        });

        return {
            response: memory,
        };
    }
}
