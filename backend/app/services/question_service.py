from __future__ import annotations

from typing import List

from app.schemas.fna import FNAState


class QuestionService:
    def generate(self, fna: FNAState, missing_fields: List[str]) -> List[str]:
        questions = []
        for field in missing_fields[:8]:
            if field.endswith("spouse_name"):
                questions.append("You mentioned you are married — may I confirm your spouse's name for the record?")
            elif field.endswith("education_goal"):
                questions.append("You shared that you have children. Are education costs one of your planning priorities?")
            elif field.endswith("risk_appetite"):
                questions.append("As investment planning is relevant, would you describe your risk appetite as cautious, moderate, or growth-oriented?")
            elif field.endswith("time_horizon"):
                questions.append("Roughly how many years is your intended investment time horizon?")
            elif field.endswith("loans"):
                questions.append("You mentioned a mortgage — do you also have any other loans we should include?")
            elif field.endswith("insurer_names"):
                questions.append("You noted existing cover. Do you know which insurer your policies are with?")
            else:
                label = field.split(".")[-1].replace("_", " ")
                questions.append(f"Could you help confirm your {label} so we can complete this fact-find accurately?")

        best = []
        if questions:
            best.append(questions[0])
        return best + questions[1:]
