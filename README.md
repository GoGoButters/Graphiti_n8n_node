# n8n-nodes-graphiti

![Graphiti Memory Node](https://img.shields.io/badge/n8n-community--node-00D4AA)
![npm version](https://img.shields.io/npm/v/n8n-nodes-graphiti)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

> 🧠 **Temporal Knowledge Graph Memory for n8n AI Agents**

## ⚠️ Dependencies

**This node requires [Graphiti Awesome Memory](https://github.com/GoGoButters/Graphiti_Awesome_Memory) backend to be running.**

Graphiti Awesome Memory is a FastAPI-based adapter that provides REST API endpoints for Graphiti temporal knowledge graph. It handles:
- User session management
- Message persistence
- Semantic fact extraction
- Episode (conversation history) storage
- Knowledge graph querying

📖 **[Setup Graphiti Awesome Memory Backend →](https://github.com/GoGoButters/Graphiti_Awesome_Memory)**

---

## ✨ Features

### 🧠 Dual Memory Architecture

- **Short-term Memory**: Recent conversation episodes from database (persistent across restarts)
- **Long-term Memory**: Extracted facts stored in temporal knowledge graph
- **Semantic Search**: Intelligent fact retrieval based on query relevance

### 🔧 n8n Integration

- ✅ AI Agent node compatible
- ✅ Session-based memory per user
- ✅ Configurable context windows
- ✅ Graceful error handling with fallbacks
- ✅ Comprehensive logging

### 🚀 Production Ready

- ⏱️ 180-second timeout for slow LLM processing
- 🔄 Network resilience with automatic fallbacks
- 📊 Structured memory formatting for optimal LLM consumption
- 🎯 Version **1.0.11** with episodes integration

---

## 📦 Installation

### Via n8n Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** → **Community Nodes**
3. Click **Install**
4. Enter: `n8n-nodes-graphiti`
5. Click **Install**
6. Restart n8n

### Manual Installation

```bash
npm install n8n-nodes-graphiti
```

---

## ⚙️ Configuration

### 1. Set up Graphiti Awesome Memory Backend

Follow the setup instructions at [Graphiti Awesome Memory](https://github.com/GoGoButters/Graphiti_Awesome_Memory)

**Quick start:**
```bash
docker pull gogobutters/graphiti-awesome-memory:latest
docker run -p 8000:8000 -e API_KEY=your-secret-key gogobutters/graphiti-awesome-memory
```

### 2. Configure Credentials in n8n

1. Go to **Credentials** → **New**
2. Search for **"Graphiti API"**
3. Fill in:
   - **API URL**: Your Graphiti server URL (e.g., `http://192.168.1.98:8000`)
   - **API Key**: Your authentication key
4. Test and save

---

## 🎯 Usage

### Basic AI Agent Workflow

```
[Webhook/Chat Trigger]
       ↓
[Settings Node] ← Define chatId/userId
       ↓
[Graphiti Memory] ← Load context (before agent)
       ↓
[AI Agent] ← Uses enriched memory
       ↓
[Graphiti Memory] ← Save conversation (after agent)
       ↓
[Respond to User]
```

### Node Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| **Session ID Type** | `fromInput` | How to determine session ID |
| **Session Key** | `={{ $json.sessionId }}` | Expression to extract user/session ID |
| **Context Window Length** | `5` | Number of recent episodes to fetch from database |
| **Search Limit** | `10` | Maximum facts retrieved from knowledge graph |

### How It Works

When AI Agent requests memory, the node performs **2 API calls**:

1. **Semantic Search** (`POST /memory/query`)
   - Searches knowledge graph for relevant facts
   - Uses current user input as query
   - Returns top N most relevant facts with confidence scores

2. **Episode Retrieval** (`GET /memory/users/{userId}/episodes`)
   - Fetches last N conversation messages from database
   - Persistent across n8n restarts
   - Returns actual user/assistant dialogue

### Memory Output Format

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

---

## 🔌 API Reference

### Graphiti Awesome Memory Endpoints

**POST /memory/append** - Save conversation message
```json
{
  "user_id": "35145416",
  "text": "User message content",
  "metadata": {
    "role": "user",
    "source": "n8n",
    "session_id": "35145416",
    "timestamp": "2025-12-01T12:00:00Z"
  }
}
```

**POST /memory/query** - Semantic fact search
```json
{
  "user_id": "35145416",
  "query": "What do I like?",
  "limit": 10
}
```

**GET /memory/users/{userId}/episodes** - Retrieve conversation history
```http
GET /memory/users/35145416/episodes?limit=5
```

---

## 🛠️ Development

### Prerequisites

- Node.js 18+
- n8n installed locally
- Graphiti Awesome Memory backend running

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
npm link n8n-nodes-graphiti
```

### Scripts

- `npm run build` - Compile TypeScript and copy assets
- `npm run dev` - Watch mode for development
- `npm run format` - Format code with Prettier
- `npm run lint` - Lint code with ESLint
- `npm run lintfix` - Auto-fix linting issues

---

## 🐛 Troubleshooting

### Memory not loading

- ✅ Check Graphiti Awesome Memory backend is running
- ✅ Verify API credentials are correct
- ✅ Check Session Key expression resolves correctly
- ✅ Look at n8n server logs for detailed error messages

**Server Logs Location:**
```bash
# Docker
docker logs n8n-container --tail 100

# PM2
pm2 logs n8n
```

### Connection timeout issues

- ✅ Ensure Graphiti server is reachable from n8n
- ✅ Check firewall/network settings
- ✅ Verify API URL format (no trailing slash)
- ✅ Consider increasing timeout if processing is slow

### Session ID not persisted

- ✅ Set **Session ID Type** to `Define Below`
- ✅ Use expression: `={{ $('Settings').first().json.chatId }}`
- ✅ Ensure Settings node passes chatId/userId
- ✅ Check logs for `[Graphiti Node] FINAL sessionId`

### Episodes endpoint fails

Node automatically falls back to in-memory `chatHistory` if episodes endpoint is unavailable. Check logs:
```
[Graphiti] Error fetching episodes: ...
[Graphiti] Falling back to chatHistory...
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with tests
4. Ensure linting passes (`npm run lint`)
5. Commit changes (`git commit -m 'feat: Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 💰 Support the Project

If you find this project valuable, consider supporting its development:

### Cryptocurrency Donations

- **USDT (ERC20)**: `0xd91e775b3636f2be35d85252d8a17550c0f869a6`
- **Bitcoin (BTC)**: `3Eaa654UHa7GZnKTpYr5Nt2UG5XoUcKXgx`
- **Ethereum (ETH)**: `0x4dbf76b16b9de343ff17b88963d114f8155a2df0`
- **Tron (TRX)**: `TT9gPkor4QoR9c12x8HLbvCLeNcS9KDutc`

Your support helps maintain and improve this project! 🙏

---

## 📄 License

MIT © [GoGoButters](https://github.com/GoGoButters)

---

## 🔗 Links

- [GitHub Repository](https://github.com/GoGoButters/Graphiti_n8n_node)
- [npm Package](https://www.npmjs.com/package/n8n-nodes-graphiti)
- [Graphiti Awesome Memory Backend](https://github.com/GoGoButters/Graphiti_Awesome_Memory)
- [Graphiti Project](https://github.com/getzep/graphiti)
- [n8n Documentation](https://docs.n8n.io/integrations/community-nodes/)

---

## 📞 Support

- 🐛 [Report Issues](https://github.com/GoGoButters/Graphiti_n8n_node/issues)
- 💬 [n8n Community Forum](https://community.n8n.io/)
- 📧 Create an issue on GitHub for questions

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=GoGoButters/Graphiti_n8n_node&type=Date)](https://star-history.com/#GoGoButters/Graphiti_n8n_node&Date)

---

**Made with ❤️ for the n8n and Graphiti communities**
