CREATE TABLE IF NOT EXISTS "RegulatorySequences" (
	"id" INTEGER NOT NULL UNIQUE,
	"gene_id" INTEGER NOT NULL,
	"species_id" INTEGER NOT NULL,
	"start" BIGINT NOT NULL,
	"end" BIGINT NOT NULL,
	"sequence" TEXT NOT NULL,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "Species" (
	"id" INTEGER NOT NULL UNIQUE,
	"name" VARCHAR(255) NOT NULL UNIQUE,
	"assembly" VARCHAR(255) NOT NULL,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "Genes" (
	"id" INTEGER NOT NULL UNIQUE,
	"name" VARCHAR(255) NOT NULL UNIQUE,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "RegulatoryElements" (
	"id" INTEGER NOT NULL UNIQUE,
	"chromosome" INTEGER NOT NULL,
	"strand" CHAR(1) NOT NULL,
	"element_type" VARCHAR(4) NOT NULL,
	"start" INTEGER NOT NULL CHECK("[object Object]" >= 0),
	"end" INTEGER NOT NULL CHECK("[object Object]" >= "[object Object]"),
	"regulatory_sequence_id" INTEGER NOT NULL,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "ConservationScores" (
	"id" INTEGER NOT NULL UNIQUE,
	"gene_id" INTEGER NOT NULL,
	"phylop_score" DECIMAL NOT NULL,
	"phastcon_score" DECIMAL NOT NULL,
	"position" VARCHAR(255) NOT NULL,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "ConservationNucleotides" (
	"id" INTEGER NOT NULL UNIQUE,
	"species_id" INTEGER NOT NULL,
	"conservation_id" INTEGER NOT NULL,
	"nucleotide" CHAR(1) NOT NULL,
	PRIMARY KEY("id")
);



ALTER TABLE "RegulatorySequences"
ADD FOREIGN KEY("gene_id") REFERENCES "Genes"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "RegulatorySequences"
ADD FOREIGN KEY("species_id") REFERENCES "Species"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "ConservationScores"
ADD FOREIGN KEY("gene_id") REFERENCES "Genes"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "ConservationNucleotides"
ADD FOREIGN KEY("species_id") REFERENCES "Species"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "ConservationNucleotides"
ADD FOREIGN KEY("conservation_id") REFERENCES "ConservationScores"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "RegulatoryElements"
ADD FOREIGN KEY("regulatory_sequence_id") REFERENCES "RegulatorySequences"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;