import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    IDataObject,
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
        inputs: ['main'],
        outputs: ['main'],
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

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        // Get credentials
        const credentials = await this.getCredentials('graphitiApi');
        const apiUrl = credentials.apiUrl as string;
        const apiKey = credentials.apiKey as string;

        for (let i = 0; i < items.length; i++) {
            try {
                // Get parameters
                const sessionKeyExpression = this.getNodeParameter('sessionKey', i, '') as string;
                const contextWindowLength = this.getNodeParameter('contextWindowLength', i, 5) as number;
                const memoryKey = this.getNodeParameter('memoryKey', i, 'chat_history') as string;
                const searchLimit = this.getNodeParameter('searchLimit', i, 10) as number;

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

                // Get input data
                const inputData = items[i].json;
                const userInput = inputData.input || inputData.question || inputData.message || '';
                const aiResponse = inputData.response || inputData.output || inputData.answer || '';

                let resultData: IDataObject = { ...inputData };

                // If this is a query (we have input but no response yet), load memory
                if (userInput && !aiResponse) {
                    const memoryVariables = await memory.loadMemoryVariables({ input: userInput });
                    resultData = {
                        ...inputData,
                        memory: memoryVariables,
                        [memoryKey]: memoryVariables[memoryKey],
                    };
                }

                // If we have both input and response, save context
                if (userInput && aiResponse) {
                    await memory.saveContext(
                        { input: userInput },
                        { response: aiResponse }
                    );
                    resultData = {
                        ...inputData,
                        memorySaved: true,
                    };
                }

                // Add session ID to output
                resultData.sessionId = userId;

                returnData.push({
                    json: resultData,
                    pairedItem: i,
                });
            } catch (error) {
                // On error, pass through input data with error info
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            ...items[i].json,
                            error: error instanceof Error ? error.message : 'Unknown error',
                        },
                        pairedItem: i,
                    });
                    continue;
                }
                throw error;
            }
        }

        return [returnData];
    }
}
