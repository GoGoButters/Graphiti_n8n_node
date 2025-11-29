import { BaseChatMemory, BaseChatMemoryInput } from '@langchain/community/memory/chat_memory';
import { InputValues, MemoryVariables, OutputValues } from '@langchain/core/memory';
import { BaseMessage } from '@langchain/core/messages';
import axios, { AxiosInstance } from 'axios';

export interface GraphitiChatMemoryInput extends BaseChatMemoryInput {
    apiUrl: string;
    apiKey: string;
    userId: string;
    contextWindowLength?: number;
    searchLimit?: number;
    memoryKey?: string;
}

interface GraphitiAppendRequest {
    user_id: string;
    text: string;
    role: 'user' | 'assistant';
    metadata?: {
        source: string;
        session_id: string;
        timestamp: string;
    };
}

interface GraphitiQueryRequest {
    user_id: string;
    query: string;
    limit: number;
}

interface GraphitiHit {
    fact: string;
    score: number;
    uuid: string;
    created_at: string;
    metadata?: Record<string, unknown>;
}

interface GraphitiQueryResponse {
    hits: GraphitiHit[];
    total: number;
}

export class GraphitiChatMemory extends BaseChatMemory {
    private apiClient: AxiosInstance;
    private userId: string;
    private contextWindowLength: number;
    private searchLimit: number;
    memoryKey = 'chat_history';

    constructor(fields: GraphitiChatMemoryInput) {
        super({
            returnMessages: fields.returnMessages ?? false,
            inputKey: fields.inputKey,
            outputKey: fields.outputKey,
            chatHistory: fields.chatHistory,
        });

        this.userId = fields.userId;
        this.contextWindowLength = fields.contextWindowLength ?? 5;
        this.searchLimit = fields.searchLimit ?? 10;
        this.memoryKey = fields.memoryKey ?? 'chat_history';

        // Initialize axios client with timeout and auth headers
        this.apiClient = axios.create({
            baseURL: fields.apiUrl,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': fields.apiKey,
            },
        });
    }

    get memoryKeys(): string[] {
        return [this.memoryKey];
    }

    /**
     * Load memory variables by combining short-term memory with long-term facts from Graphiti
     */
    async loadMemoryVariables(values: InputValues): Promise<MemoryVariables> {
        try {
            const userInput = values[this.inputKey || 'input'] || '';
            console.log(`[Graphiti] Loading memory for user: ${this.userId}, input: ${userInput}`);
            const longTermFacts: string[] = [];

            // Query Graphiti for relevant long-term facts
            if (userInput && typeof userInput === 'string') {
                try {
                    const queryRequest: GraphitiQueryRequest = {
                        user_id: this.userId,
                        query: userInput,
                        limit: this.searchLimit,
                    };

                    const response = await this.apiClient.post<GraphitiQueryResponse>(
                        '/memory/query',
                        queryRequest,
                    );

                    if (response.data.hits && response.data.hits.length > 0) {
                        response.data.hits.forEach((hit, index) => {
                            longTermFacts.push(
                                `${index + 1}. ${hit.fact} (confidence: ${hit.score.toFixed(2)})`,
                            );
                        });
                    }
                } catch (error) {
                    console.error('[Graphiti] Error querying Graphiti memory:', error);
                    // Continue with empty long-term facts on error
                }
            }

            // Get recent messages from chat history (managed by BaseChatMemory)
            const messages = await this.chatHistory.getMessages();
            const recentMessages = messages.slice(-this.contextWindowLength);

            // Format memory content
            let memoryContent = '';

            if (longTermFacts.length > 0) {
                memoryContent += '=== Relevant Facts from Long-term Memory ===\n';
                memoryContent += longTermFacts.join('\n');
                memoryContent += '\n\n';
            }

            if (recentMessages.length > 0) {
                memoryContent += '=== Recent Conversation ===\n';
                const conversationHistory = recentMessages
                    .map((msg: BaseMessage) => {
                        const role = msg._getType() === 'human' ? 'User' : 'Assistant';
                        return `${role}: ${msg.content}`;
                    })
                    .join('\n');
                memoryContent += conversationHistory;
            }

            return {
                [this.memoryKey]: memoryContent || 'No previous conversation history.',
            };
        } catch (error) {
            console.error('[Graphiti] Error loading memory variables:', error);
            // Return empty memory on error
            return {
                [this.memoryKey]: 'No previous conversation history.',
            };
        }
    }

    /**
     * Save conversation context to both short-term memory and Graphiti long-term storage
     */
    async saveContext(inputValues: InputValues, outputValues: OutputValues): Promise<void> {
        try {
            // Save to chat history (managed by BaseChatMemory parent class)
            await super.saveContext(inputValues, outputValues);

            // Extract messages
            const userInput = inputValues[this.inputKey || 'input'] || '';
            const aiResponse = outputValues[this.outputKey || 'output'] || '';

            console.log(`[Graphiti] Saving context for user: ${this.userId}`);

            // Save to Graphiti long-term storage
            const timestamp = new Date().toISOString();

            // Save user message
            if (userInput) {
                try {
                    const userRequest: GraphitiAppendRequest = {
                        user_id: this.userId,
                        text: String(userInput),
                        role: 'user',
                        metadata: {
                            source: 'n8n',
                            session_id: this.userId,
                            timestamp,
                        },
                    };

                    await this.apiClient.post('/memory/append', userRequest);
                } catch (error) {
                    console.error('[Graphiti] Error saving user message to Graphiti:', error);
                }
            }

            // Save AI message
            if (aiResponse) {
                try {
                    const aiRequest: GraphitiAppendRequest = {
                        user_id: this.userId,
                        text: String(aiResponse),
                        role: 'assistant',
                        metadata: {
                            source: 'n8n',
                            session_id: this.userId,
                            timestamp,
                        },
                    };

                    await this.apiClient.post('/memory/append', aiRequest);
                } catch (error) {
                    console.error('[Graphiti] Error saving AI message to Graphiti:', error);
                }
            }
        } catch (error) {
            console.error('[Graphiti] Error saving context:', error);
            // Don't throw - allow workflow to continue even if memory save fails
        }
    }

    /**
     * Clear all memory (both short-term and long-term)
     */
    async clear(): Promise<void> {
        await this.chatHistory.clear();
    }
}
