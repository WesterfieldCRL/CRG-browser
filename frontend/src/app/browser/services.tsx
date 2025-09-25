export async function fetchEnsemblId(species: string, geneSymbol: string) {
  const url = `https://rest.ensembl.org/lookup/symbol/${species}/${geneSymbol}?content-type=application/json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchFastaSequence(geneId: string) {
  const url = `https://rest.ensembl.org/sequence/id/${geneId}?content-type=text/x-fasta`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("No FASTA for gene ID " + geneId);
    const text = await res.text();
    return parseFasta(text);
  } catch {
    return null;
  }
}

function parseFasta(fastaText: string): string {
  let seq = "";
  for (const line of fastaText.split("\n")) {
    if (line && !line.startsWith(">")) seq += line.trim();
  }
  return seq;
}
