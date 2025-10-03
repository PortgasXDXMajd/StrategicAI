# StrategicAI

A full-stack AI-powered strategic application built with FastAPI, Next.js, and MongoDB. This repository contains the complete source code for the StrategicAI platform developed as part of academic research.



## Architecture Overview

StrategicAI follows a modern microservices architecture with the following components:

- Backend: FastAPI (Python) - RESTful API server
- Frontend: Next.js (React/TypeScript) - Web application interface
- Database: MongoDB
- Database Admin: Mongo Express - Web-based MongoDB administration
- Containerization: Docker & Docker Compose

## Project Structure
```
    StrategicAI/
    ├── backend/            # FastAPI backend application
    │├── app/               # Main application package
    ││├── agents/           # AI agent implementations
    ││├── core/             # Core application logic
    ││├── helpers/          # Utility functions and helpers
    ││├── middleware/       # Custom middleware components
    ││├── models/           # Data models and schemas
    ││├── repositories/     # Data access layer
    ││├── routers/          # API route definitions
    ││└── services/         # Business logic services
    │├── main.py            # FastAPI application entry point
    │├── requirements.txt   # Python dependencies
    │├── Dockerfile.dev     # Development Docker configuration
    │└── Dockerfile.prod    # Production Docker configuration
    ├── frontend/           # Next.js frontend application
    ├── db/                 # Database env for dev and prod
    ├── .env.dev            # Development environment variables
    ├── .env.prod           # Production environment variables
    ├── compose.dev.yaml    # Development Docker Compose configuration
    ├── compose.prod.yaml   # Production Docker Compose configuration
    ├── start.sh            # Application startup script
    └── README.md
```

## 🚀 Quick Start

### Prerequisites

Before running StrategicAI, ensure you have the following installed:

-   **Docker** (v20.10+) - [Installation Guide](https://docs.docker.com/get-docker/)
-   **Docker Compose** (v2.0+) - [Installation Guide](https://docs.docker.com/compose/install/)
-   **Unix-like environment** (Linux, macOS, or WSL on Windows)


### Environment Setup

1.  **Clone the repository**
    
    ```bash
    git clone <repository-url>
    cd StrategicAI
    ```

    
2.  **Set required environment variables:** Edit your environment file(s) [backend/.env.dev](https://github.com/PortgasXDXMajd/StrategicAI/blob/main/backend/.env.dev) and/or [backend/.env.prod](https://github.com/PortgasXDXMajd/StrategicAI/blob/main/backend/.env.prod) and configure the following variables:

    ```bash

    # API Keys (Add your actual keys here)
	# Add other API keys as needed
    OPENAI_API_KEY=PLACEHOLDER_OPENAI_API_KEY
    FIREWORKS_API_KEY=PLACEHOLDER_FIREWORKS_API_KEY

    ```
    

### Running the Application

#### Development Mode
```bash
./start.sh dev
```

#### Production Mode

```bash
./start.sh prod
```

### Accessing the Application

Once running, you can access:

-   **Frontend Application**: [http://localhost:3000](http://localhost:3000)
-   **Backend API**: [http://localhost:8000](http://localhost:8000)
-   **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
-   **Database Admin (Mongo Express)**: [http://localhost:8081](http://localhost:8081) (username: root, password: toor)

## 📝 API Documentation

The FastAPI backend automatically generates interactive API documentation:

-   **Swagger UI**: Available at `/docs` endpoint
-   **ReDoc**: Available at `/redoc` endpoint


## Evaluation Dataset

  

To evaluate StrategicAI, we compiled a dataset of six business case studies from well-known business schools. Evaluation results are reported in our paper.

  

| Case Title | Industry | Source |
|----------------------------------------|-------------------------|------------------------------------------------------------------------------------------------------------------------------|
| Sticky Surfactants (CavalierChem) | Chemicals | Darden Casebook (2021–2022)[¹](https://drive.google.com/file/d/1HrzPiMKPZjdc-yeFe1nH8fMaH1L1C2QW/view) |
| A Golden Ticket? (Whizzy Wilco) | Manufacturing | Darden Casebook (2021–2022)[¹](https://drive.google.com/file/d/1HrzPiMKPZjdc-yeFe1nH8fMaH1L1C2QW/view) |
| Canyon Capital Partners | Private Equity | Darden Casebook (2021–2022)[¹](https://drive.google.com/file/d/1HrzPiMKPZjdc-yeFe1nH8fMaH1L1C2QW/view) |
| Papyr Co | Industrial Goods | Duke MBA Consulting Club Casebook[²](https://drive.google.com/file/d/1KX2pxkQdWSVcT_UNEepSxc2mk3xYCIrh/view) |
| Tres Burritos | Restaurant | NYU Stern School of Business[³](https://drive.google.com/file/d/1MKhqj27wTZ6u3bVHdw_PvLENAkxYdAEy/view) |
| Quest Diagnostics | Diagnostic Laboratories | MIT Sloan[⁴](https://mitsloan.mit.edu/teaching-resources-library/quest-diagnostics-a-improving-performance-call-centers) |

  

---

  

**Footnotes:**

1. Darden School of Business Case Collection, University of Virginia (2021–2022), [link](https://drive.google.com/file/d/1HrzPiMKPZjdc-yeFe1nH8fMaH1L1C2QW/view)

2. Duke University Fuqua School of Business, MBA Consulting Club Casebook, [link](https://drive.google.com/file/d/1KX2pxkQdWSVcT_UNEepSxc2mk3xYCIrh/view)

3. New York University, Stern School of Business Case Repository, [link](https://drive.google.com/file/d/1MKhqj27wTZ6u3bVHdw_PvLENAkxYdAEy/view)

4. Massachusetts Institute of Technology, Sloan School of Management, [link](https://mitsloan.mit.edu/teaching-resources-library/quest-diagnostics-a-improving-performance-call-centers)

  

## License

This software is provided for academic and research purposes only. You may not use, distribute, or modify the code for commercial purposes without explicit written permission from the authors.

All rights reserved. © 2025 Majd Alkayyal, Simon Malberg.
