from __future__ import annotations

from app.schemas.fna import FNAState, FactField, Section, SessionState

SECTION_FIELDS = {
    "personal_details": ["full_name", "date_of_birth", "age", "gender", "marital_status", "nationality", "residency_status"],
    "household_and_dependants": ["spouse_name", "number_of_dependants", "dependant_details", "housing_status"],
    "employment_and_income": ["employment_status", "occupation", "employer", "annual_income", "monthly_income", "bonus_or_variable_income", "cpf_or_pension_notes"],
    "expenses_and_liabilities": ["monthly_expenses", "mortgage", "loans", "credit_card_debt", "other_liabilities"],
    "assets_and_savings": ["cash_savings", "investments", "property_assets", "retirement_assets"],
    "existing_insurance": ["hospitalisation_cover", "life_cover", "ci_cover", "disability_income_cover", "insurer_names", "annual_premiums", "sum_assured"],
    "goals_and_priorities": ["protection_goal", "retirement_goal", "education_goal", "wealth_accumulation_goal", "timeline_notes"],
    "risk_and_investing": ["investment_experience", "risk_appetite", "drawdown_tolerance", "time_horizon", "liquidity_needs"],
    "health_and_underwriting_notes": ["smoker_status", "known_conditions", "family_history", "current_medications"],
}


def create_empty_session(session_id: str) -> SessionState:
    sections = {
        name: Section(name=name.replace("_", " ").title(), fields={field: FactField() for field in fields})
        for name, fields in SECTION_FIELDS.items()
    }
    fna = FNAState(session_id=session_id, sections=sections)
    return SessionState(id=session_id, fna=fna)
