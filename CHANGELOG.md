# Changelog

All notable changes to this project will be documented in this file.

## [1.0.13] - 2025-12-01

### Fixed
- **CRITICAL**: Fixed memory leak in chatHistory storage
- Filtered out `system_message`, `formatting_instructions`, and other metadata from in-memory chatHistory
- Only essential `input` and `output` are now stored in BaseChatMemory
- Significantly reduces memory consumption for AI Agents with large system prompts

## [1.0.12] - 2025-12-01

### Documentation
- Major README.md update with comprehensive documentation
- Added dependency information for Graphiti Awesome Memory backend
- Added donation/support section with cryptocurrency addresses
- Added star history chart
- Improved troubleshooting section
- Updated API reference documentation

## [1.0.11] - 2025-12-01

### Added
- **Episodes integration**: Now fetches conversation history from Graphiti `/memory/users/{user_id}/episodes` endpoint
- Combines semantic facts search with actual conversation history from database
- Fallback to in-memory chatHistory if episodes endpoint fails

### Changed
- `Context Window Length` now controls how many episodes are fetched from Graphiti database
- More detailed logging for memory loading operations

## [1.0.10] - 2025-11-30

### Fixed
- Increased API timeout to 180s (3 minutes) for very slow Graphiti processing
- Improved error handling for timeout scenarios

## [1.0.9] - 2025-11-30

### Fixed
- Increased API timeout from 10s to 60s to handle slow Graphiti LLM processing
- Prevents timeout errors during memory save operations

## [1.0.8] - 2025-11-30

### Added
- Comprehensive debug logging for session ID extraction in GraphitiMemory node
- Support for multiple session ID sources (sessionId, chatSessionId)

### Fixed
- Improved session ID detection to properly identify user across messages

## [1.0.7] - 2025-11-30

### Fixed
- **CRITICAL**: Fixed API request structure. Moved `role` field inside `metadata` object to match Graphiti API requirements
- Validated against working CURL command example

## [1.0.6] - 2025-11-30

### Fixed
- **CRITICAL**: Added default `inputKey`/`outputKey` values to resolve LangChain saveContext error

## [1.0.5] - 2025-11-30

### Added
- Comprehensive debug logging in `saveContext` method

### Fixed
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
