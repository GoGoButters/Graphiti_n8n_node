# Changelog
- Removed `as any` type cast to satisfy ESLint rules

## [1.0.4] - 2025-11-29

### Fixed
- Added `executionData` to `supplyData` response to enable node visualization in n8n UI
- Added server-side logging to `GraphitiChatMemory` for better debugging of memory operations
- Fixed TypeScript type casting for `SupplyData` return value

## [1.0.3] - 2025-11-29

### Fixed
- Fixed integration with LangChain by using standard `chatHistory` mechanism
- Fixed issue where AI Agent would not consistently read/write memory
- Restored missing AI message saving logic
- Fixed TypeScript interface errors for `memoryKey`

## [1.0.2] - 2025-11-29

### Added
- Added `sessionIdType` parameter matching standard n8n memory nodes
- Session ID can now be taken automatically from input or defined with custom key

### Changed
- Improved session ID handling logic
- `sessionKey` parameter now only shows when `sessionIdType` is set to "customKey"

## [1.0.1] - 2025-11-29

### Changed
- **BREAKING**: Refactored node to AI Memory type
- Changed from `execute` to `supplyData` method
- Changed connection type from `main` to `ai_memory`
- Node now connects directly to AI Agent's memory port (top connection)
- Removed standard inputs/outputs (left/right connections)

### Fixed
- Added missing ESLint configuration files
- Added `.eslintignore` to exclude build artifacts from linting
- Installed missing `@typescript-eslint/eslint-plugin` dependency

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
