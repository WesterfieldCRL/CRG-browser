# CRG Browser: Developer Documentation
This web application is an interactive comparative genome browser built with Next.js and React that enables users to select disease-related human genes and view aligned DNA sequences across human, mouse, and rhesus macaque. It features responsive nucleotide visualization, pagination for long sequences, dynamic tooltips for base-level information, and robust loading/error handling, providing a foundational interface for multi-species regulatory genomics exploration.

## Repository Structure Overview

```
├── .github
│   └── workflows
│       └── docker-image.yml
├── README.md
├── backend
│   ├── .gitignore
│   ├── Dockerfile
│   ├── README.md
│   ├── app
│   │   ├── __init__.py
│   │   └── main.py
│   └── requirements.txt
├── database
│   └── database.sql
├── docker-compose.yml
├── frontend
│   ├── .gitignore
│   ├── Dockerfile
│   ├── README.md
│   ├── eslint.config.mjs
│   ├── next.config.mjs
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── public
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   └── src
│       ├── app
│       │   ├── browser
│       │   │   ├── page.tsx
│       │   │   └── services.tsx
│       │   ├── components
│       │   │   ├── PageNavigation.tsx
│       │   │   ├── SequenceViewer.tsx
│       │   │   └── Tooltip.tsx
│       │   ├── favicon.ico
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   └── page.tsx
│       └── tsconfig.json
```

## Architecture

- **Backend** (`/backend`):  
  Implemented in Python using **FastAPI** for building a modern, high-performance RESTful API.  
  - Core API service exposing endpoints to query genes, regulatory regions, conservation metrics, and GWAS variants.  
  - Uses SQLAlchemy Core and ORM for database interaction with PostgreSQL.  
  - Includes automatic data validation with Pydantic models and built-in asynchronous support.  
  - CORS middleware is configured for frontend-backend communication.  
  - Dockerized using `/backend/Dockerfile`.  
  - Main application entrypoint: `backend/app/main.py`.

- **Database** (`/database`):  
  Single SQL schema file `/database/database.sql` for setting up tables related to genes, regulatory elements, conservation scores, and variant annotations. Intended for PostgreSQL.

- **Frontend** (`/frontend`):  
  Next.js React app for interactive data visualization and browsing.  
  - Components include genome-browser style viewers, conservation heatmaps, and SNP visualizations located under `src/app/components`.  
  - Dockerized with `/frontend/Dockerfile`.  
  - Entry point: `src/app/page.tsx` and routing in `src/app/layout.tsx`.

- **DevOps**:  
  - Docker Compose file `/docker-compose.yml` to orchestrate backend, frontend, and database services together.
  - GitHub Actions workflow `/github/workflows/docker-image.yml` to automate Docker builds and tests.

## Installation and Setup

1. Clone the repository:

   ```
   git clone https://github.com/WesterfieldCRL/CRG-browser.git
   cd CRG-browser
   ```

2. Ensure Docker and Docker Compose are installed.

3. Build and run services:

   ```
   docker compose up --build -d
   ```

This will also initialize the database using provided SQL schema from `/database/database.sql`. This can be done manually in your PostgreSQL instance or automated in the backend startup.

5. Access frontend app at `http://localhost:3030`.

6. Stop and remove all containers, images, and volumes:

    ```
    docker compose down -v --rmi all
    ```

## Backend API Endpoints

| Endpoint                           | Description                                                     |
|----------------------------------|-----------------------------------------------------------------|
| `/genes/`                        | List curated disease-related genes, filterable by species       |
| `/genes/{gene_id}`               | Retrieve detailed information for a single gene by ID           |
| `/genes/` [POST]                 | Insert a new gene (fail if gene_id exists)                      |
| `/genes/{gene_id}` [PUT]         | Update an existing gene by ID                                   |
| `/genes/{gene_id}` [DELETE]      | Delete a gene by ID                                            |
| `/regulatory_elements/`          | List regulatory elements, filterable by species and element_type|
| `/regulatory_elements/` [POST]   | Insert a new regulatory element                                 |
| `/regulatory_elements/{element_id}` [DELETE] | Delete a regulatory element by ID                    |
| `/snps/`                        | List SNPs, filterable by species and gene_id                     |
| `/snps/{snp_id}`                | Retrieve SNP details by SNP ID                                   |
| `/snps/` [POST]                  | Insert a new SNP (fail if snp_id exists)                        |
| `/snps/{snp_id}` [DELETE]        | Delete a SNP by SNP ID                                          |

All endpoints return JSON responses. Request bodies for POST and PUT endpoints must match the respective Pydantic models.  
Refer to the backend `/README.md` for full API schema, example requests, and response formats.

## Frontend Features

- Gene search with autocomplete and filtering by trait/disease category.
- Multi-species aligned genome browser with overlays for regulatory elements, conservation scores, and GWAS variants.
- Interactive visuals for variant impact and regulatory conservation trends.
- Download data subsets in CSV or JSON.
- Responsive UI built with TypeScript and styled via global CSS.

## Development Guidelines

- Backend uses Python with dependencies listed in `backend/requirements.txt`.
- Frontend uses Next.js with package management in `frontend/package.json`.
- Follow coding and linting standards specified in respective `.gitignore` and config files.
- Docker containers facilitate consistent environment for development, testing, and production.
- Update individual `README.md` files in `/backend` and `/frontend` for module-specific instructions.
- Use feature branching and pull requests on GitHub repository.
- Write tests for API and frontend components. Integration with CI workflow `/github/workflows/docker-image.yml`.

## Contribution

1. Fork the repository on GitHub.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit changes with clear messages.
4. Push branch and submit a pull request linking related issues.
5. Participate in code reviews and iterate as needed.

---

# CRG Browser: User Documentation

## Overview

CRG Browser is an interactive web application designed to explore regulatory DNA conservation and divergence of disease-related genes across human (Homo sapiens), mouse (Mus musculus), and rhesus macaque (Macaca mulatta). Users can select genes to view their aligned DNA sequences across species, analyze conservation patterns, and examine trait-associated genetic variants within a responsive and user-friendly interface.

## Getting Started

- Open the application in a web browser.
- Use the dropdown menu to select a gene of interest from the curated list of disease-associated human genes.
- The application loads aligned DNA sequences for the selected gene across the three species.
- Navigate through the sequences using pagination controls.
- Hover over nucleotides in the sequence to see detailed base information through tooltips.
- Loading messages and error notifications will appear to inform about the system’s state.

## Features

- **Gene Selection:** Search and select genes implicated in addiction, alcohol use, and stress response.
- **Multi-species Alignment:** Visualize nucleotide alignments across human, mouse, and rhesus macaque.
- **Responsive Design:** The nucleotide display adjusts to screen size for optimal readability.
- **Pagination:** Efficiently browse long sequences in manageable segments.
- **Interactive Tooltips:** Obtain contextual nucleotide information by hovering over sequence bases.
- **User Feedback:** Visual indicators for data loading and error statuses.

## Usage Tips

- Begin by exploring well-characterized genes to familiarize yourself with conservation patterns.
- Use the pagination controls to methodically analyze the entire gene sequence.
- When sequences fail to load, check your network connection or try refreshing the page.
- Export features for data download will be added in future updates.

## Support

For technical assistance or to report issues, please visit the GitHub repository issues page at:  
https://github.com/WesterfieldCRL/CRG-browser/issues