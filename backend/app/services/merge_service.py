from __future__ import annotations

from app.schemas.fna import FNAState, FactField, FieldStatus


class MergeService:
    def merge_fact(self, fna: FNAState, key: str, payload: dict) -> None:
        section_name, field_name = key.split(".")
        target = fna.sections[section_name].fields[field_name]

        new_field = FactField(**payload)
        if target.manually_edited and target.status == FieldStatus.confirmed:
            return
        if target.status == FieldStatus.confirmed and new_field.status == FieldStatus.inferred:
            return

        if target.value and new_field.value and str(target.value) != str(new_field.value):
            target.status = FieldStatus.conflicting
            return

        fna.sections[section_name].fields[field_name] = new_field
