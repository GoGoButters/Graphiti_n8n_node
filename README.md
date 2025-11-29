# n8n-nodes-graphiti-memory

![Graphiti Memory Node](https://img.shields.io/badge/n8n-community--node-00D4AA)
![npm version](https://img.shields.io/npm/v/n8n-nodes-graphiti-memory)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

> Graphiti temporal knowledge graph memory integration for n8n AI agents

This community node integrates [Graphiti](https://github.com/getzep/graphiti) temporal knowledge graph as a powerful memory system for AI agents in n8n. It combines short-term conversation history with long-term fact retrieval, enabling your AI agents to remember and recall information across conversations.

## Features

✨ **Dual Memory System**
- 🧠 **Short-term Memory**: Recent conversation context (configurable window)
- 📚 **Long-term Memory**: Persistent fact storage via Graphiti knowledge graph
- 🔍 **Semantic Search**: Intelligent retrieval of relevant facts

🔧 **n8n Integration**
- 🎯 Compatible with n8n AI Agent nodes
- 🔑 Session-based memory per user
- ⚙️ Configurable parameters
- 🛡️ Graceful error handling

🚀 **Production Ready**
- ⏱️ 10-second timeout protection
- 🔄 Network error resilience
- 📊 Structured memory formatting for LLMs

## Installation

### Via n8n Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** → **Community Nodes**
3. Click **Install**
4. Enter: `n8n-nodes-graphiti-memory`
5. Click **Install**
6. Restart n8n

### Manual Installation

```bash
npm install n8n-nodes-graphiti-memory
```

## Configuration

### 1. Set up Graphiti Server

You need a running Graphiti server. See [Graphiti documentation](https://github.com/getzep/graphiti) for setup instructions.

### 2. Configure Credentials in n8n

1. Go to **Credentials** → **New**
2. Search for "Graphiti API"
3. Fill in:
   - **API URL**: Your Graphiti server URL (e.g., `http://192.168.1.98:8000`)
   - **API Key**: Your authentication key
4. Test and save

## Usage

### Basic AI Agent Workflow

```
[When Chat Message Received]
    ↓
[Graphiti Memory] ← Load context
    ↓
[AI Agent] ← Uses memory as context
    ↓
[Graphiti Memory] ← Save conversation
    ↓
[Respond to User]
```

### Node Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| **Session Key** | `{{ $json.sessionId }}` | Expression to extract user/session ID |
| **Context Window Length** | `5` | Number of recent messages in short-term memory |
| **Memory Key** | `chat_history` | Key name for memory in LLM context |
| **Search Limit** | `10` | Maximum facts retrieved from long-term memory |

### Example Workflow

1. **Add Graphiti Memory Node** before your AI Agent
   - Set Session Key: `{{ $json.chatId }}` or `{{ $json.userId }}`
   - Leave other settings as default

2. **Connect to AI Agent**
   - Memory will automatically populate the context

3. **Add Graphiti Memory Node** after AI Agent response
   - To save the conversation to long-term storage

### Memory Output Format

The memory is formatted for optimal LLM consumption:

```
=== Relevant Facts from Long-term Memory ===
1. User's name is Alice (confidence: 0.95)
2. Alice is interested in robotics (confidence: 0.89)
3. Alice is working on a robot arm project (confidence: 0.87)

=== Recent Conversation ===
User: Hi, how are you?
Assistant: I'm doing well, thanks for asking!
User: What's my name?
```

## API Reference

### Graphiti Endpoints Used

**POST /memory/append**
```json
{
  "user_id": "string",
  "text": "string",
  "role": "user" | "assistant",
  "metadata": {
    "source": "n8n",
    "session_id": "string",
    "timestamp": "ISO-8601"
  }
}
```

**POST /memory/query**
```json
{
  "user_id": "string",
  "query": "string",
  "limit": 10
}
```

## Development

### Prerequisites

- Node.js 18+
- n8n installed locally
- Graphiti server running

### Setup

```bash
# Clone repository
git clone https://github.com/GoGoButters/Graphiti_n8n_node.git
cd Graphiti_n8n_node

# Install dependencies
npm install

# Build
npm run build

# Link for local n8n development
npm link
cd ~/.n8n/nodes
npm link n8n-nodes-graphiti-memory
```

### Scripts

- `npm run build` - Compile TypeScript and copy assets
- `npm run dev` - Watch mode for development
- `npm run format` - Format code with Prettier
- `npm run lint` - Lint code with ESLint

## Troubleshooting

### Memory not loading

- ✅ Check Graphiti server is running
- ✅ Verify API credentials are correct
- ✅ Check Session Key expression is valid
- ✅ Look at n8n execution logs for errors

### Connection timeout

- ✅ Ensure Graphiti server is reachable
- ✅ Check firewall/network settings
- ✅ Verify API URL doesn't have trailing slash

### Session ID issues

- ✅ Use expressions like `{{ $json.sessionId }}`
- ✅ Fallback: Leave empty to auto-generate UUID
- ✅ Check input data structure

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT © [GoGoButters](https://github.com/GoGoButters)

## Links

- [GitHub Repository](https://github.com/GoGoButters/Graphiti_n8n_node)
- [npm Package](https://www.npmjs.com/package/n8n-nodes-graphiti-memory)
- [Graphiti Project](https://github.com/getzep/graphiti)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)

## Support

- 🐛 [Report Issues](https://github.com/GoGoButters/Graphiti_n8n_node/issues)
- 💬 [n8n Community Forum](https://community.n8n.io/)
- 📧 Create an issue on GitHub

---

**Made with ❤️ for the n8n community**
