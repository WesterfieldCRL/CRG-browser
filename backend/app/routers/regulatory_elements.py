import asyncio
from fastapi import APIRouter
from pydantic import BaseModel, Field
from sqlalchemy import or_, select
from app.models import *
from app.utils import async_session
from fastapi import APIRouter
from app.routers import regulatory_sequences

class Element(BaseModel):
    type: str = Field(..., description="string representing what the element is")
    chromosome: int = Field(..., description="chromsome this element belongs too")
    start: int = Field(..., description="start of this element")
    end: int = Field(..., description="end of this element")

class Segment(BaseModel):
    type: str = Field(..., description="string representing what the element is")
    chromosome: int = Field(..., description="chromsome this element belongs too")
    width: float = Field(..., ge=0, le=100, description="Width percentage (0-100)")
    start: int = Field(..., description="start of this element")
    end: int = Field(..., description="end of this element")

class VariantsDict(BaseModel):
    variants: dict[str, list[Element]] = Field(..., description="dictionary mapping variant types to a list of positions in the given gene/species combo where those variants are")

router = APIRouter(prefix="/elements", tags=["Regulatory Elements"])    

NORMAL_GAP = "none"

@router.get("/all_TFBS", response_model=list[str], tags=["Data"], summary="Gets all TFBS in given gene", description=("Returns a distinct list of strings, which are the names of all transcription factor binding sites found for the given gene name."))
async def get_all_TFBS(gene_name: str) -> list[str]:
    """
    Docstring for get_all_TFBS
    
    :param gene_name: Name of the gene
    :type gene_name: str
    :return: list of all found TFBS's
    :rtype: list[str]
    """
    async with async_session() as session:

        stmt = (select(TranscriptionFactorBindingSites.category)
                .join(RegulatorySequences)
                .join(Genes)
                .where(Genes.name == gene_name)
                .distinct())
        
        result = (await session.execute(stmt)).scalars().all()

    return list(result)

@router.get("/all_variants", response_model=list[str], tags=["Data"], summary="Gets all variants in given gene", description=("Returns a distinct list of all the variants in the given gene represented as strings."))
async def get_all_variants(gene_name: str) -> list[str]:
    """
    Docstring for get_all_variants
    
    :param gene_name: name of the gene
    :type gene_name: str
    :return: list of all found variants
    :rtype: list[str]
    """
    async with async_session() as session:

        stmt = (select(Variants.category)
                .join(RegulatorySequences)
                .join(Genes)
                .where(Genes.name == gene_name)
                .distinct())
        
        result = (await session.execute(stmt)).scalars().all()

    return list(result)

# returns a dictionary mapping the given variants list to a list of all of the locations where those variants appear in the given gene
@router.post("/variants_dict", response_model=VariantsDict, tags=["Data"], summary="Gets a dictionary mapping species to their variants.", description=("Returns a dictionary of species names to a distinct list of all variants found for the given gene and species.\n Additionally only returns variants in the given variant list."))
async def get_variants_dict(gene_name: str, species_name: str, variants_list: list[str]) -> VariantsDict:
    """
    Docstring for get_variants_dict
    
    :param gene_name: name of the gene
    :type gene_name: str
    :param species_name: name of the species
    :type species_name: str
    :param variants_list: list of all desired variants
    :type variants_list: list[str]
    :return: dictionary mapping found variant locations to their species
    :rtype: VariantsDict
    """
    async with async_session() as session:
        
        variants_dict: dict[str, list[Element]] = {}

        for variant_name in variants_list:
            stmt = (select(Variants.category, Variants.start, Variants.end, Variants.chromosome)
                .join(RegulatorySequences)
                .join(Genes)
                .join(Species)
                .where(Genes.name == gene_name)
                .where(Species.name == species_name)
                .where(Variants.category == variant_name)
                .order_by(Variants.start))
        
            result = (await session.execute(stmt)).tuples().all()

            if variant_name not in variants_dict:
                variants_dict[variant_name] = []
            for item in result:
                variants_dict[variant_name].append(Element(type=item[0], start=item[1], end=item[2], chromosome=item[3]))

            if len(variants_dict[variant_name]) == 0:
                del variants_dict[variant_name]
        

    return VariantsDict(variants=variants_dict)

# Function to get elements for all of the "Element" tables. Sorts by start number
async def get_elements(model: type, gene_name: str, species_name: str, model_types: list[str], start: int, end: int) -> list[Element]:
    async with async_session() as session:

        model_list: list[Element] = []


        stmt = (select(model.category, model.start, model.end, model.chromosome)
                .join(RegulatorySequences)
                .join(Genes)
                .join(Species)
                .where(Genes.name == gene_name)
                .where(Species.name == species_name)
                .where(or_(((model.start >= start) & (model.start < end)), ((model.end <= end) & (model.end > start)), ((model.start <= start) & (model.end >= end))))
                .where(model.category.in_(model_types))
                .order_by(model.start))
            
        result = (await session.execute(stmt)).tuples().all()


    for row in result:

            model_list.append(Element(type = row[0], start = row[1], end = row[2], chromosome=row[3]))

    
    return model_list

# Returns a list of all variant locations within the given parameters
@router.post("/filtered_variants", response_model=list[Element], tags=["Data"], summary="Gets all variants in the given gene and species, filtered by given list.", description=("Returns a list of Elements for the given gene and species names.\n Additionally only returns elements that are present in the given list.\n Ommits elements not present in the given range."))
async def get_filtered_variants(gene_name: str, species_name: str, variants_types: list[str], start: int, end: int) -> list[Element]:
    """
    Docstring for get_filtered_variants
    
    :param gene_name: name of the gene
    :type gene_name: str
    :param species_name: name of the species
    :type species_name: str
    :param variants_types: list of desired elements
    :type variants_types: list[str]
    :param start: start of the desired range
    :type start: int
    :param end: end of the desired range
    :type end: int
    :return: list of all found elements
    :rtype: list[Element]
    """
    return await get_elements(Variants, gene_name, species_name, variants_types, start, end)

# Returns a list of all enahncers and promoter locations within the given parameters
@router.post("/filtered_Enh_Prom", response_model=list[Element], tags=["Data"], summary="Gets all Enhancers and Promoters in the given gene and species, filtered by given list.", description=("Returns a list of Elements for the given gene and species names.\n Additionally only returns elements that are present in the given list.\n Ommits elements not present in the given range."))
async def get_filtered_Enh_Prom(gene_name: str, species_name: str, element_types: list[str], start: int, end: int) -> list[Element]:
    """
    Docstring for get_filtered_Enh_Prom
    
    :param gene_name: name of the gene
    :type gene_name: str
    :param species_name: name of the species
    :type species_name: str
    :param variants_types: list of desired elements
    :type variants_types: list[str]
    :param start: start of the desired range
    :type start: int
    :param end: end of the desired range
    :type end: int
    :return: list of all found elements
    :rtype: list[Element]
    """
    return await get_elements(EnhancersPromoters, gene_name, species_name, element_types, start, end)
    
# Returns a list of all transcription factor binding site locations within the given parameters
@router.post("/filtered_TFBS", response_model=list[Element], tags=["Data"], summary="Gets all Transcription Factor Binding Sites in the given gene and species, filtered by given list.", description=("Returns a list of Elements for the given gene and species names.\n Additionally only returns elements that are present in the given list.\n Ommits elements not present in the given range."))
async def get_filtered_TFBS(gene_name: str, species_name: str, element_types: list[str], start: int, end: int) -> list[Element]:
    """
    Docstring for get_filtered_TFBS
    
    :param gene_name: name of the gene
    :type gene_name: str
    :param species_name: name of the species
    :type species_name: str
    :param variants_types: list of desired elements
    :type variants_types: list[str]
    :param start: start of the desired range
    :type start: int
    :param end: end of the desired range
    :type end: int
    :return: list of all found elements
    :rtype: list[Element]
    """
    return await get_elements(TranscriptionFactorBindingSites, gene_name, species_name, element_types, start, end)
    
@router.post("/mapped_TFBS", response_model=list[Segment], tags=["Processed"], summary="Gets a processed list of TFBS's.", description=("Returns a list of Segments, filtered by the given gene and species names, the given list, and the given range.\n\n" f"The segments containg data to be displayed and widths that add up to 100.\n Any area that does not contain an element will have a type of {NORMAL_GAP}."))
async def get_mapped_TFBS(gene_name: str, species_name: str, element_types: list[str], start: int, end: int) -> list[Segment]:
    """
    Docstring for get_mapped_TFBS
    
    :param gene_name: name of the gene
    :type gene_name: str
    :param species_name: name of the species
    :type species_name: str
    :param variants_types: list of desired elements
    :type variants_types: list[str]
    :param start: start of the desired range
    :type start: int
    :param end: end of the desired range
    :type end: int
    :return: list of all found elemens processed to be displayed on the frontend
    :rtype: list[Segment]
    """

    element_list, offsets = await asyncio.gather(
        get_filtered_TFBS(gene_name, species_name, element_types, start, end),
        regulatory_sequences.get_sequence_offsets(gene_name),
    )

    sequence_start = start + offsets.offsets[species_name]
    sequence_end = end + offsets.offsets[species_name]

    color_map = await populate_color_map(sequence_start, sequence_end, element_list, offsets.offsets[species_name])

    return color_map

@router.post("/mapped_Enh_Prom", response_model=list[Segment], tags=["Processed"], summary="Gets a processed list of Enhancers and Promoters", description=("Returns a list of Segments, filtered by the given gene and species names, the given list, and the given range.\n\n" f"The segments containg data to be displayed and widths that add up to 100.\n Any area that does not contain an element will have a type of {NORMAL_GAP}."))
async def get_mapped_Enh_Prom(gene_name: str, species_name: str, element_types: list[str], start: int, end: int) -> list[Segment]:
    """
    Docstring for get_mapped_Enh_Prom
    
    :param gene_name: name of the gene
    :type gene_name: str
    :param species_name: name of the species
    :type species_name: str
    :param variants_types: list of desired elements
    :type variants_types: list[str]
    :param start: start of the desired range
    :type start: int
    :param end: end of the desired range
    :type end: int
    :return: list of all found elemens processed to be displayed on the frontend
    :rtype: list[Segment]
    """
    element_list, offsets = await asyncio.gather(
        get_filtered_Enh_Prom(gene_name, species_name, element_types, start, end),
        regulatory_sequences.get_sequence_offsets(gene_name),
    )

    sequence_start = start + offsets.offsets[species_name]
    sequence_end = end + offsets.offsets[species_name]

    color_map = await populate_color_map(sequence_start, sequence_end, element_list, offsets.offsets[species_name])

    return color_map

@router.post("/mapped_Variants", response_model=list[Segment], tags=["Processed"], summary="Gets a processed list of Variant's.", description=("Returns a list of Segments, filtered by the given gene and species names, the given list, and the given range.\n\n" f"The segments containg data to be displayed and widths that add up to 100.\n Any area that does not contain an element will have a type of {NORMAL_GAP}."))
async def get_mapped_Variants(gene_name: str, species_name: str, variant_types: list[str], start: int, end: int) -> list[Segment]:
    """
    Docstring for get_mapped_Variants
    
    :param gene_name: name of the gene
    :type gene_name: str
    :param species_name: name of the species
    :type species_name: str
    :param variants_types: list of desired elements
    :type variants_types: list[str]
    :param start: start of the desired range
    :type start: int
    :param end: end of the desired range
    :type end: int
    :return: list of all found elemens processed to be displayed on the frontend
    :rtype: list[Segment]
    """
    element_list, offsets = await asyncio.gather(
        get_filtered_variants(gene_name, species_name, variant_types, start, end),
        regulatory_sequences.get_sequence_offsets(gene_name),
    )

    sequence_start = start + offsets.offsets[species_name]
    sequence_end = end + offsets.offsets[species_name]

    color_map = await populate_color_map(sequence_start, sequence_end, element_list, offsets.offsets[species_name])

    return color_map
    
# From the parameters generates a list of segments where the widths add up to 100 that can be given to the frontend to display
async def populate_color_map(sequence_start: int, sequence_end: int, element_list: list[Element], offset: int) -> list[Segment]:

    total_width = sequence_end-sequence_start

    prev_index = sequence_start

    curr_width = 0

    color_segment_list: list[Segment] = []

    for element in element_list:

        relative_start = element.start + offset
        relative_end = element.end + offset

        if relative_start < sequence_start:
            relative_start = sequence_start
        
        if relative_end > sequence_end:
            relative_end = sequence_end

        # if the elements are right not right next to each other we need this to fill in the gap
        if relative_start > prev_index:
            gap_width = ((relative_start - prev_index) / total_width) * 100
            color_segment_list.append(Segment(type = NORMAL_GAP, width = gap_width, start =(prev_index - offset), end = (element.start), chromosome=(0)))
            curr_width += gap_width
            prev_index = relative_start

        # using prev_index instead of element.start to handle overlaps
        element_width = ((relative_end - prev_index) / total_width) * 100

        if element_width == 0:
            element_width = ((1) / total_width) * 100 # Variants have start and end the same if one nucleotide so this should handle that

        if element_width > 0:
            color_segment_list.append(Segment(type = element.type, width = element_width, start = element.start, end = element.end, chromosome=(element.chromosome)))
            curr_width += element_width
            prev_index = relative_end

    # add any remaing space in the sequence

    # add any remaing allignment space
    if (prev_index < sequence_end) and (curr_width < 100):
        color_segment_list.append(Segment(type = NORMAL_GAP, width=100-curr_width, start = (prev_index - offset), end = (sequence_end - offset), chromosome=(0)))
    

    # Merge segments that are below the threshold
    # length = len(color_segment_list)
    # i = 0
    # while i < length:
        
    #     if color_segment_list[i].width < THRESHOLD:
    #         if i > 0:
    #             color_segment_list[i - 1].width += color_segment_list[i].width
    #             del color_segment_list[i]
    #             i -= 1
    #             length -= 1
    #         else:
    #             color_segment_list[i + 1].width += color_segment_list[i].width
    #             del color_segment_list[i]
    #             i -= 1
    #             length -= 1

    #     i += 1


    return color_segment_list