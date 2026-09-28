from typing import Optional, List

from pydantic import BaseModel


class StandardMaterialData(BaseModel):

    common_material_code: str

    standardized_description: str

    standardized_specification: Optional[str] = None

    uom: str

    category: str

    subcategory: str

    material_group: str


class MappingData(BaseModel):

    mapping_type: str

    confidence: float


class NMCResult(BaseModel):

    material_id: str

    standard_material: StandardMaterialData

    mapping: MappingData


class NMCSourcePair(BaseModel):

    left_material_id: str

    right_material_id: str

    splink_score: Optional[float] = None

    prototype_decision: Optional[str] = None


class NMCResultsRequest(BaseModel):

    source_pair: NMCSourcePair

    results: List[NMCResult]


class StandardizedDescriptionUpdate(BaseModel):

    standard_material_id: str

    standardized_description: str