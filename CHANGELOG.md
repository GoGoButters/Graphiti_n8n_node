# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-29

### Added
- Initial release of Graphiti Memory node for n8n
- Graphiti API credentials configuration
- GraphitiChatMemory class with LangChain integration
- Dual memory system (short-term + long-term)
- Session-based user memory tracking
- Configurable context window length (1-50 messages)
- Configurable search limit for long-term facts (1-100)
- Automatic session ID generation with UUID fallback
- Graceful error handling and network resilience
- 10-second timeout protection for API calls
- Structured memory formatting optimized for LLMs
- POST /memory/append endpoint integration
- POST /memory/query endpoint integration
- Comprehensive documentation and examples

### Features
- Compatible with n8n AI Agent nodes
- Expression-based session key extraction
- Semantic search for relevant facts
- Automatic conversation persistence
- Network error resilience with fallback to empty memory

[1.0.0]: https://github.com/GoGoButters/Graphiti_n8n_node/releases/tag/v1.0.0
