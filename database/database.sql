/*
Simplified and commented PostgreSQL schema for Comparative Regulatory Genomics Project.

Tables:
- genes: stores gene metadata and aligned sequences.
- regulatory_elements: stores genomic regulatory features (enhancers, promoters, TFBS).
- snps: stores single nucleotide polymorphisms (SNPs) linked to genes.

Data includes example entries for key genes DRD4 and CHRNA6 across three species.

--------------------------
*/

/* -------------------
   Table: genes
-------------------
Stores gene information including species, genomic coordinates, human gene symbol, and aligned sequences.
*/
CREATE TABLE genes (
    gene_id VARCHAR(50) PRIMARY KEY,                    -- Unique gene identifier (ENSEMBL/NCBI/custom)
    species VARCHAR(100) NOT NULL,                      -- Species name (e.g., 'Homo sapiens')
    human_gene_name VARCHAR(50) NOT NULL,               -- Human gene symbol (e.g., 'DRD4', 'CHRNA6')
    chromosome INT NOT NULL CHECK (chromosome BETWEEN 1 AND 30), -- Chromosome number (1-30)
    start_position BIGINT NOT NULL CHECK (start_position >= 0), -- Genomic start coordinate (0-based)
    end_position BIGINT NOT NULL CHECK (end_position >= start_position), -- Genomic end coordinate
    aligned_sequence TEXT NOT NULL DEFAULT 'ABC',       -- Aligned DNA/RNA sequence (placeholder or real data)
    UNIQUE(species, chromosome, start_position, end_position)    -- Prevent genomic coordinate duplicates within species
);

/* Indexes for fast query by species, chromosome, and gene name. */
CREATE INDEX idx_genes_species ON genes(species);
CREATE INDEX idx_genes_chromosome ON genes(chromosome);
CREATE INDEX idx_genes_human_gene_name ON genes(human_gene_name);


/* --------------------------
   Table: regulatory_elements
--------------------------
Stores genomic regulatory elements linked to species and chromosome positions.
Types include enhancers, promoters, TFBS, etc.
*/
CREATE TABLE regulatory_elements (
    element_id SERIAL PRIMARY KEY,                     -- Unique internal ID
    species VARCHAR(100) NOT NULL,                      -- Species name
    chromosome INT NOT NULL CHECK (chromosome BETWEEN 1 AND 30),
    start_position BIGINT NOT NULL CHECK (start_position >= 0),
    end_position BIGINT NOT NULL CHECK (end_position >= start_position),
    element_type VARCHAR(50) NOT NULL,                  -- Type of regulatory element
    description TEXT                                    -- Optional details about element
);

/* Indexes for quick species and chromosome filtering */
CREATE INDEX idx_re_species_chr ON regulatory_elements(species, chromosome);


/* --------------------------
   Table: snps
--------------------------
Stores single nucleotide polymorphisms with allele info and linkage to genes.
*/
CREATE TABLE snps (
    snp_id VARCHAR(50) PRIMARY KEY,                     -- SNP identifier (e.g., rsID)
    species VARCHAR(100) NOT NULL,                       -- Species name
    chromosome INT NOT NULL CHECK (chromosome BETWEEN 1 AND 30),
    position BIGINT NOT NULL CHECK (position >= 0),     -- SNP genomic coordinate (1-based)
    reference_allele CHAR(1) NOT NULL CHECK (reference_allele IN ('A','C','G','T')),    -- Reference nucleotide
    alternate_allele CHAR(1) NOT NULL CHECK (alternate_allele IN ('A','C','G','T')),    -- Alternate nucleotide
    consequence TEXT,                                    -- Optional functional impact annotation
    gene_id VARCHAR(50),                                -- Foreign key to gene if applicable
    CONSTRAINT fk_snp_gene FOREIGN KEY(gene_id) REFERENCES genes(gene_id) ON DELETE SET NULL
);

/* Index on SNP position for species/chromosome */
CREATE INDEX idx_snps_species_chr_pos ON snps(species, chromosome, position);


/* --------------------------
   Example data for DRD4 and CHRNA6 genes, regulatory elements, and SNPs
--------------------------*/

/* -- Genes: DRD4 -- */
INSERT INTO genes (gene_id, species, human_gene_name, chromosome, start_position, end_position, aligned_sequence) VALUES
('ENSG000001_DRD4_HS', 'Homo sapiens', 'DRD4', 11, 6350000, 6400000, 'ATGCGTACGTTAG...'),  -- Human
('MMU_DRD4', 'Mus musculus', 'DRD4', 9, 7550000, 7600000, 'ATGCGTACGCTAG...'),               -- Mouse
('MACMU_DRD4', 'Macaca mulatta', 'DRD4', 11, 6380000, 6430000, 'ATGCGTACGTTGG...');        -- Macaque

/* -- Genes: CHRNA6 -- */
INSERT INTO genes (gene_id, species, human_gene_name, chromosome, start_position, end_position, aligned_sequence) VALUES
('ENSG000002_CHRNA6_HS', 'Homo sapiens', 'CHRNA6', 8, 42000000, 42016000, 'GCTAGCTAGCTAC...'),
('MMU_CHRNA6', 'Mus musculus', 'CHRNA6', 7, 41500000, 41516000, 'GCTAGCTTGCTGC...'),
('MACMU_CHRNA6', 'Macaca mulatta', 'CHRNA6', 8, 41980000, 41996000, 'GCTAGCTAGCTAA...');


/* -- Regulatory Elements -- */
INSERT INTO regulatory_elements (species, chromosome, start_position, end_position, element_type, description) VALUES
('Homo sapiens', 11, 6350500, 6352000, 'enhancer', 'Brain-specific enhancer near DRD4'),
('Homo sapiens', 8, 42002000, 42004000, 'promoter', 'Promoter region for CHRNA6'),
('Mus musculus', 9, 7550500, 7552000, 'enhancer', 'Mouse DRD4 brain enhancer'),
('Mus musculus', 7, 41502000, 41504000, 'promoter', 'Mouse CHRNA6 promoter site'),
('Macaca mulatta', 11, 6380500, 6382000, 'enhancer', 'Macaque DRD4 enhancer candidate'),
('Macaca mulatta', 8, 41982000, 41984000, 'promoter', 'Macaque CHRNA6 proximal promoter');


/* -- SNPs for DRD4 and CHRNA6 genes -- */
INSERT INTO snps (snp_id, species, chromosome, position, reference_allele, alternate_allele, consequence, gene_id) VALUES
('rs123456_DRD4_HS', 'Homo sapiens', 11, 6351234, 'A', 'G', 'missense_variant', 'ENSG000001_DRD4_HS'),
('rs123457_CHRNA6_HS', 'Homo sapiens', 8, 42000234, 'C', 'T', 'synonymous_variant', 'ENSG000002_CHRNA6_HS'),
('rs223344_DRD4_MM', 'Mus musculus', 9, 7551120, 'G', 'A', 'intron_variant', 'MMU_DRD4'),
('rs223355_CHRNA6_MM', 'Mus musculus', 7, 41500123, 'T', 'C', 'missense_variant', 'MMU_CHRNA6'),
('rs334455_DRD4_MACMU', 'Macaca mulatta', 11, 6381123, 'C', 'T', 'intron_variant', 'MACMU_DRD4'),
('rs334466_CHRNA6_MACMU', 'Macaca mulatta', 8, 41983201, 'A', 'G', 'synonymous_variant', 'MACMU_CHRNA6');
