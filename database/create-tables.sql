CREATE TABLE genes (
    gene_id VARCHAR(50) PRIMARY KEY,       -- unique identifier per gene, can include ENSEMBL, NCBI, etc.
    species VARCHAR(100) NOT NULL,         -- species name, e.g., "Homo sapiens", "Mus musculus"
    human_gene_name VARCHAR(50),           -- official human gene symbol (HGNC standard, e.g., DRD2, OPRM1)
    chromosome INT NOT NULL CHECK (chromosome >= 1 AND chromosome <= 30), 
                                           -- accommodates human (1–22, X=23, Y=24), macaque, mouse
    start_position BIGINT NOT NULL CHECK (start_position >= 0), 
                                           -- genomic start coordinate (0-based)
    end_position BIGINT NOT NULL CHECK (end_position >= 0 AND end_position >= start_position),
                                           -- genomic end coordinate (must be >= start)
    UNIQUE (species, chromosome, start_position, end_position) 
                                           -- prevents duplicates across genomes
);

-- Indexes to improve querying
CREATE INDEX idx_genes_species ON genes(species);
CREATE INDEX idx_genes_chromosome ON genes(chromosome);
CREATE INDEX idx_genes_human_name ON genes(human_gene_name);

-- Note from Kiron: To scale this, we may need more tables,
-- but this is the updated script after simplification.
