# Changelog

All notable changes to the Tutor Application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-03-14

### Added
- FastAPI backend implementation
- Python-based API endpoints for health checks, connection tests, and token generation
- Comprehensive error handling for API requests
- Graceful handling of static file serving
- Docker-based deployment configuration
- Unit tests for API endpoints

### Changed
- Migrated backend from Node.js/Express to Python/FastAPI
- Updated CORS configuration to support both local and production environments
- Improved static file mounting with conditional checks
- Enhanced frontend-backend integration
- Optimized Docker build process

### Removed
- Node.js Express server implementation
- Node.js backend dependencies
- Redundant configuration files

### Fixed
- Static file serving issues in Docker environments
- Module import path problems
- CORS configuration for production deployment
- Frontend URL configuration for Railway deployment

## [1.0.0] - 2025-03-01

### Added
- Initial release of the Tutor Application
- Voice conversation functionality with OpenAI integration
- Modern dark gradient UI
- WebRTC integration for real-time communication
- Responsive design for mobile and desktop
- Railway.app deployment configuration
