from __future__ import annotations

from typing import Dict, List

from app.schemas.fna import FNAState, FieldStatus

MANDATORY_FIELDS = {
    "personal_details": ["full_name", "date_of_birth", "marital_status", "nationality"],
    "employment_and_income": ["employment_status", "occupation", "annual_income"],
    "expenses_and_liabilities": ["monthly_expenses"],
    "goals_and_priorities": ["retirement_goal", "timeline_notes"],
    "risk_and_investing": ["risk_appetite", "time_horizon"],
}


def find_missing_required(fna: FNAState) -> List[str]:
    missing: List[str] = []
    for section_name, fields in MANDATORY_FIELDS.items():
        section = fna.sections.get(section_name)
        if not section:
            continue
        for field in fields:
            fact_field = section.fields.get(field)
            if not fact_field or fact_field.status == FieldStatus.missing:
                missing.append(f"{section_name}.{field}")

    marital = fna.sections["personal_details"].fields["marital_status"].value
    if marital and str(marital).lower() == "married":
        spouse = fna.sections["household_and_dependants"].fields["spouse_name"]
        if spouse.status == FieldStatus.missing:
            missing.append("household_and_dependants.spouse_name")

    deps = fna.sections["household_and_dependants"].fields["number_of_dependants"].value or 0
    try:
        if int(deps) > 0 and fna.sections["goals_and_priorities"].fields["education_goal"].status == FieldStatus.missing:
            missing.append("goals_and_priorities.education_goal")
    except ValueError:
        pass

    invest_goal = fna.sections["goals_and_priorities"].fields["wealth_accumulation_goal"].status
    if invest_goal != FieldStatus.missing:
        for field in ["risk_appetite", "time_horizon"]:
            if fna.sections["risk_and_investing"].fields[field].status == FieldStatus.missing:
                missing.append(f"risk_and_investing.{field}")

    mortgage = fna.sections["expenses_and_liabilities"].fields["mortgage"].status
    if mortgage != FieldStatus.missing:
        if fna.sections["expenses_and_liabilities"].fields["loans"].status == FieldStatus.missing:
            missing.append("expenses_and_liabilities.loans")

    return sorted(set(missing))


def section_coverage(fna: FNAState) -> Dict[str, float]:
    coverage = {}
    for section_name, section in fna.sections.items():
        total = len(section.fields)
        complete = sum(1 for f in section.fields.values() if f.status in {FieldStatus.confirmed, FieldStatus.inferred})
        coverage[section_name] = round((complete / total) * 100, 1) if total else 0
    return coverage


def compute_completion_score(fna: FNAState) -> float:
    values = section_coverage(fna).values()
    return round(sum(values) / max(1, len(list(values))), 1)
