# FrankSheets

An engineering-focused spreadsheet application built with the RETARD stack (React, Express/Oak, Tailwind, AWS, Redis, Deno).

## Features

- **Engineering Functions**: Built-in thermodynamics, fluid mechanics, heat transfer, and more
- **Unit-Aware Calculations**: Automatic unit conversion and dimensional analysis
- **Advanced Solvers**: ODE/PDE solvers, optimization, Monte Carlo simulations
- **Real-time Collaboration**: Multi-user editing with live updates
- **Process Visualization**: Engineering charts including Bode plots, Smith charts, and P&ID diagrams
- **Integration Ready**: Connect with Frank's Chemical Simulator and other engineering tools

## Getting Started

### Prerequisites
- Node.js 18+
- Deno 1.38+
- Docker & Docker Compose
- AWS CLI (for deployment)

### Development Setup

1. Clone the repository
2. Start the development environment:
   ```bash
   docker-compose up -d
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Start the backend:
   ```bash
   cd backend
   deno task dev
   ```

## Project Structure

- `/frontend` - React-based UI with engineering components
- `/backend` - Deno/Oak API server
- `/shared` - Shared types and utilities
- `/infrastructure` - AWS/Terraform deployment configs
- `/docs` - Documentation

## License

MIT License - see LICENSE file for details
