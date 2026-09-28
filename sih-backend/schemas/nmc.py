from typing import Optional
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
class StandardizedDescriptionUpdate(BaseModel):
    standard_material_id: str
    standardized_description: str