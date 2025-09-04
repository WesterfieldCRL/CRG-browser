/*
Author: Kiron Ang
Date: September 3, 2025
Description: Run this script in pgAdmin 4's Query Tool Workspace.
             Before running this script, create a database
             in the Default Workspace. In the comments, I directly
             reference the project description PDF file when appropriate.
             The schema implemented in this script will change in the future,
             but this is a foundation for web application work. Synthetic data
             is currently used to demonstrate a basic implementation, but
             the final product will use real, processed data.
*/

/*
Delete the schema to delete all the existing tables.
This is only important if you frequently run this script
and need to avoid the error "relation X already exists".
*/
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

/*
A table is needed to store information about the "three key mammalian
species": Homo sapiens, Macaca mulatta, and Mus musculus. Use this
for tooltip or landing page information!
*/
CREATE TABLE species (
    species_id SERIAL PRIMARY KEY,
    scientific_name VARCHAR(100) NOT NULL,
    common_name VARCHAR(100) NOT NULL,
    genome_assembly VARCHAR(50) NOT NULL
);

INSERT INTO species (scientific_name, common_name, genome_assembly) VALUES
('Homo sapiens', 'human', 'GRCh38'),
('Macaca mulatta', 'rhesus macaque', 'Mmul_10'),
('Mus musculus', 'mouse', 'GRCm39');

/*
One of our tasks is to "select a set of human genes of interest". So, we
need a table that first prioritizes human genes, and then stores any
similar genes in rhesus monkeys or mice.
*/
CREATE TABLE genes (
    gene_id SERIAL PRIMARY KEY,
    human_entrez_id INTEGER NOT NULL,           
    human_symbol VARCHAR(50) NOT NULL,          
    rhesus_ortholog VARCHAR(50),                 
    mouse_ortholog VARCHAR(50)                 
);

INSERT INTO genes (human_entrez_id, human_symbol, rhesus_ortholog, mouse_ortholog) VALUES
(5434, 'CRH', 'CRH', 'Crh'),         
(208, 'DRD2', 'DRD2', 'Drd2'),       
(2033, 'GABRA2', 'GABRA2', 'Gabra2'); 

/*
We also need to answer the question, "Which regulatory elements for disease
genes are conserved across human, rhesus, and mouse?" So, I created a table
dedicated to regulatory elements.
*/
CREATE TABLE regulatory_elements (
    reg_element_id SERIAL PRIMARY KEY,
    species_id INTEGER REFERENCES species(species_id) NOT NULL,
    gene_id INTEGER REFERENCES genes(gene_id) NOT NULL,
    element_type VARCHAR(20) NOT NULL,   
    chrom VARCHAR(50) NOT NULL,            
    coord_start INTEGER NOT NULL,           
    coord_end INTEGER NOT NULL,             
    strand CHAR(1) DEFAULT '+'              
);

INSERT INTO regulatory_elements (species_id, gene_id, element_type, chrom, coord_start, coord_end, strand) VALUES
(1, 1, 'promoter', 'chr8', 5380000, 5380500, '+'),
(1, 1, 'enhancer', 'chr8', 5379500, 5379800, '+');

/*
According to the project description, the ideal application is one that 
"displays conservation scores". I'm not sure how we'll calculate these yet,
but I created a separate table for it, anyway.
*/
CREATE TABLE conservation_scores (
    conservation_id SERIAL PRIMARY KEY,
    reg_element_id INTEGER REFERENCES regulatory_elements(reg_element_id) NOT NULL,
    species_pair VARCHAR(20) NOT NULL,         
    score FLOAT NOT NULL                         
);


INSERT INTO conservation_scores (reg_element_id, species_pair, score) VALUES
(1, 'human-rhesus', 0.95),
(1, 'human-mouse', 0.85);

/*
Yet another goal for this project is to "characterize trends in GWAS variants
across species". In this context, we'll have to identify a set of human
"GWAS-identified SNPs". "SNP" means "single nucleotide polymorphism", a single
letter change in the DNA code. I think that all of these will have to reside
within a regulatory element, but I'll ask for confirmation later today.
*/
CREATE TABLE gwas_variants (
    snp_id SERIAL PRIMARY KEY,
    species_id INTEGER REFERENCES species(species_id) NOT NULL,
    rsid VARCHAR(20) NOT NULL,                 
    chrom VARCHAR(50) NOT NULL,                
    position INTEGER NOT NULL,                  
    trait VARCHAR(255) NOT NULL                   
);

INSERT INTO gwas_variants (species_id, rsid, chrom, position, trait) VALUES
(1, 'rs123456', 'chr8', 5380450, 'Alcohol Dependence');

/*
We might need more tables depending on other kinds of relationships
that we need to address. More specifically, I'm not 100% sure what
"motif annotations and map across species" refres to. This should 
give you a basic idea of the kind of data we want to find and
process. Please remember to ask our client for clarification on 
what visualizations she wants.
*/

DO $$
BEGIN
  RAISE NOTICE 'Database schema and synthetic data loaded successfully!';
END;
$$ LANGUAGE plpgsql;
