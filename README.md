# CoRGi — Website for Comparative Regulatory Genomics

CoRGi is a website for analyzing comparative regulatory genomics between the following species: *Macaca mulatta* (rhesus macaque), *Mus musculus* (house mouse), and *Homo sapiens* (human). It includes different pages for viewing and comparing genomic information. This website is not yet available for public viewing.

Developers and users should [read the documentation available in the wiki](https://github.com/WesterfieldCRL/CRG-browser/wiki) before creating a pull request or opening an issue.

CoRGi is free for anyone to use. It is developed by undergraduate students in Baylor University's Department of Computer Science. We do not receive compensation for our work, but we love to hear questions, comments, and concerns!

## Getting Started with Docker

The easiest way to run CoRGi locally is using Docker. This will set up the frontend, backend, and database automatically.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git (to clone the repository)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/WesterfieldCRL/CRG-browser.git
   cd CRG-browser
   ```

2. **Start the application:**
   ```bash
   docker-compose up -d
   ```
   This will:
   - Build the frontend (Next.js) and backend (FastAPI) containers
   - Start a PostgreSQL database
   - Load all genomic data (this may take 1-2 minutes on first run)

3. **Access the application:**
   - **Frontend:** http://localhost:3030
   - **Backend API:** http://localhost:8000
   - **API Documentation:** http://localhost:8000/docs

### Useful Commands

```bash
# View container status
docker-compose ps

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop the application
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v

# Rebuild containers after code changes
docker-compose up -d --build
```

### Troubleshooting

**Backend not starting?**
- Check logs: `docker-compose logs backend`
- The backend loads genomic data on startup, which takes 30-60 seconds
- If you see database connection errors, wait for the database to be healthy

**Port already in use?**
- Frontend (3030), Backend (8000), or Database (5432) ports may be in use
- Stop other services using these ports or modify `docker-compose.yml`

**Data loading errors?**
- Run `docker-compose down -v` to clear the database and restart
- Ensure all data files are present in `backend/app/data/` 
