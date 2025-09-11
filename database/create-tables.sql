/* 
Schema for genes table in the Comparative Regulatory Genomics of Disease-Related Genes project.
- Stores gene identifiers (ENSEMBL/NCBI-style), species names, official human gene symbols, chromosome locations, and coordinates.
- Includes constraints to ensure valid chromosome and coordinate ranges, and a uniqueness condition preventing duplicate entries across genomes.
- Indexes are created on species, chromosome, and human gene name to improve common queries.
- The INSERT statements below add 10 example rows of fake but realistic cross-species data
covering Homo sapiens, Mus musculus, and Macaca mulatta with key stress and addiction-related genes.
*/

CREATE TABLE genes (
    gene_id VARCHAR(50) PRIMARY KEY,
    species VARCHAR(100) NOT NULL,
    human_gene_name VARCHAR(50),
    chromosome INT NOT NULL CHECK (chromosome >= 1 AND chromosome <= 30),
    start_position BIGINT NOT NULL CHECK (start_position >= 0),
    end_position BIGINT NOT NULL CHECK (end_position >= 0 AND end_position >= start_position),
    UNIQUE (species, chromosome, start_position, end_position)
);

CREATE INDEX idx_genes_species ON genes(species);
CREATE INDEX idx_genes_chromosome ON genes(chromosome);
CREATE INDEX idx_genes_human_name ON genes(human_gene_name);

INSERT INTO genes (gene_id, species, human_gene_name, chromosome, start_position, end_position) VALUES
('ENSG000001_DC1', 'Homo sapiens', 'DRD2', 11, 113300000, 113350000),
('ENSG000002_OPRM1', 'Homo sapiens', 'OPRM1', 6, 154000000, 154060000),
('ENSG000003_NPY', 'Homo sapiens', 'NPY', 7, 24200000, 24250000),
('MMU_GENE_DRD2', 'Mus musculus', 'DRD2', 8, 45320000, 45370000),
('MMU_GENE_OPRM1', 'Mus musculus', 'OPRM1', 10, 131400000, 131410000),
('MMU_GENE_CRH', 'Mus musculus', 'CRH', 3, 19020000, 19025000),
('MACMU_GENE_DRD2', 'Macaca mulatta', 'DRD2', 11, 113310000, 113370000),
('MACMU_GENE_OPRM1', 'Macaca mulatta', 'OPRM1', 6, 154010000, 154070000),
('MACMU_GENE_FKBP5', 'Macaca mulatta', 'FKBP5', 12, 59210000, 59216000),
('ENSG000004_FKBP5', 'Homo sapiens', 'FKBP5', 6, 35640000, 35646000);
