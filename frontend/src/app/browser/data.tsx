export const speciesList = ["homo_sapiens", "mus_musculus", "macaca_mulatta"];
export const speciesDisplay: Record<string, string> = {
  homo_sapiens: "Homo sapiens",
  mus_musculus: "Mus musculus",
  macaca_mulatta: "Macaca mulatta",
};

export const dataset: Record<string, any> = {
  DRD4: {
    description:
      "Dopamine receptor D4, involved in dopamine signaling, attention, novelty-seeking behavior, ADHD risk.",
  },
  CHRNA6: {
    description:
      "Nicotinic acetylcholine receptor alpha-6 subunit; modulates addiction and Parkinson’s disease pathways.",
  },
};

export const genes = Object.keys(dataset);
