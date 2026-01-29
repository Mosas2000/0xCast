# 0xCast Development Guide

Welcome to the 0xCast developer guide. This document provides technical overview and instructions for contributing to the platform.

## Architecture Overview

- **Smart Contracts**: Written in Clarity (Stacks blockchain). Core logic is in `market-core.clar`.
- **Frontend**: Built with React, TypeScript, and Vite.
- **State Management**: Uses React Context API for wallet and global state.
- **Styling**: Vanilla CSS with Tailwind CSS for utility-first components.

## Getting Started

1. Clone the repository.
2. Install dependencies: `npm install` and `cd frontend && npm install`.
3. Start the dev server: `npm run dev`.

## Testing Policy

We maintain a strict one-commit-per-file policy for granular history.
- Run frontend tests: `npm test`
- Run contract tests: `clarinet test`

## Project Structure

- `contracts/`: Clarity smart contracts
- `frontend/src/components/`: Reusable UI components
- `frontend/src/utils/`: Performance and security utilities
- `tests/`: Contract integration tests
