from database.connection import supabase


def resolve_material_uuid(pipeline_material_id: str):
    """
    Resolve the supplied material_id directly against
    the material_master UUID.

    IMPORTANT:

    The NMC pipeline communicates using the actual
    material_id UUID.

    We do not use legacy_sap_material_number for
    communication between AIML and the backend.
    """

    response = (
        supabase
        .table("material_master")
        .select("material_id")
        .eq(
            "material_id",
            pipeline_material_id
        )
        .limit(1)
        .execute()
    )

    rows = response.data or []

    if not rows:
        return None

    return rows[0]["material_id"]


def save_nmc_result(data):

    material_id = data.material_id
    standard = data.standard_material
    mapping = data.mapping

    # --------------------------------------------------
    # Resolve source material
    # --------------------------------------------------

    material_uuid = resolve_material_uuid(
        material_id
    )

    if not material_uuid:
        raise ValueError(
            f"Could not resolve material_id "
            f"'{material_id}' in material_master."
        )

    # --------------------------------------------------
    # Check whether NMC already exists
    # --------------------------------------------------

    existing = (
        supabase
        .table("standard_material")
        .select("*")
        .eq(
            "common_material_code",
            standard.common_material_code
        )
        .limit(1)
        .execute()
    )

    existing_rows = existing.data or []

    # --------------------------------------------------
    # Existing standard material
    # --------------------------------------------------

    if existing_rows:

        standard_material = existing_rows[0]

    # --------------------------------------------------
    # Create new standard material
    # --------------------------------------------------

    else:

        response = (
            supabase
            .table("standard_material")
            .insert({
                "common_material_code":
                    standard.common_material_code,

                "standardized_description":
                    standard.standardized_description,

                "standardized_specification":
                    standard.standardized_specification,

                "uom":
                    standard.uom,

                "category":
                    standard.category,

                "subcategory":
                    standard.subcategory,

                "material_group":
                    standard.material_group
            })
            .execute()
        )

        rows = response.data or []

        if not rows:
            raise RuntimeError(
                "Failed to create standard_material."
            )

        standard_material = rows[0]

    standard_material_id = (
        standard_material["standard_material_id"]
    )

    # --------------------------------------------------
    # Check existing mapping
    # --------------------------------------------------

    mapping_check = (
        supabase
        .table("material_mapping")
        .select("mapping_id")
        .eq(
            "material_id",
            material_uuid
        )
        .eq(
            "standard_material_id",
            standard_material_id
        )
        .limit(1)
        .execute()
    )

    existing_mapping = (
        mapping_check.data or []
    )

    # --------------------------------------------------
    # Create mapping
    # --------------------------------------------------

    if not existing_mapping:

        mapping_response = (
            supabase
            .table("material_mapping")
            .insert({
                "material_id":
                    material_uuid,

                "standard_material_id":
                    standard_material_id,

                "mapping_type":
                    mapping.mapping_type,

                "confidence":
                    mapping.confidence,

                "status":
                    "PENDING"
            })
            .execute()
        )

        mapping_rows = (
            mapping_response.data or []
        )

    else:

        mapping_rows = existing_mapping

    return {
        "message": "NMC result stored successfully",

        "material_id":
            material_id,

        "material_uuid":
            material_uuid,

        "standard_material":
            standard_material,

        "mapping":
            mapping_rows[0] if mapping_rows else None
    }


def update_standardized_description(data):

    response = (
        supabase
        .table("standard_material")
        .update({
            "standardized_description":
                data.standardized_description
        })
        .eq(
            "standard_material_id",
            data.standard_material_id
        )
        .execute()
    )

    rows = response.data or []

    if not rows:
        raise ValueError(
            "Could not update standard_material."
        )

    return {
        "message":
            "Standardized description updated successfully",

        "standard_material":
            rows[0]
    }