import { SessionState, TranscriptSegment, FactField } from '@/types/session';

const seedSegments: TranscriptSegment[] = [
  { id: 'seed-0', speaker: 'adviser', text: 'Thanks for coming in, can we start with your family situation?', timestamp: 0 },
  { id: 'seed-1', speaker: 'client', text: 'Sure, I am married and we have 2 children aged 7 and 10.', timestamp: 18 },
  { id: 'seed-2', speaker: 'adviser', text: 'Great, and your current employment and income details?', timestamp: 36 },
  { id: 'seed-3', speaker: 'client', text: 'I am a salaried engineering manager earning about 180000 a year.', timestamp: 54 },
  { id: 'seed-4', speaker: 'client', text: 'We also have a mortgage and monthly household expenses around 6000.', timestamp: 72 },
  { id: 'seed-5', speaker: 'client', text: 'I already have hospitalisation and life cover but I cannot recall insurer names.', timestamp: 90 },
  { id: 'seed-6', speaker: 'client', text: 'Main goals are retirement in about 20 years and education funding for the children.', timestamp: 108 },
  { id: 'seed-7', speaker: 'client', text: 'For investing I am moderate risk and can accept some temporary drawdowns.', timestamp: 126 }
];

const sectionFields: Record<string, string[]> = {
  personal_details: ['full_name', 'date_of_birth', 'age', 'gender', 'marital_status', 'nationality', 'residency_status'],
  household_and_dependants: ['spouse_name', 'number_of_dependants', 'dependant_details', 'housing_status'],
  employment_and_income: ['employment_status', 'occupation', 'employer', 'annual_income', 'monthly_income', 'bonus_or_variable_income', 'cpf_or_pension_notes'],
  expenses_and_liabilities: ['monthly_expenses', 'mortgage', 'loans', 'credit_card_debt', 'other_liabilities'],
  assets_and_savings: ['cash_savings', 'investments', 'property_assets', 'retirement_assets'],
  existing_insurance: ['hospitalisation_cover', 'life_cover', 'ci_cover', 'disability_income_cover', 'insurer_names', 'annual_premiums', 'sum_assured'],
  goals_and_priorities: ['protection_goal', 'retirement_goal', 'education_goal', 'wealth_accumulation_goal', 'timeline_notes'],
  risk_and_investing: ['investment_experience', 'risk_appetite', 'drawdown_tolerance', 'time_horizon', 'liquidity_needs'],
  health_and_underwriting_notes: ['smoker_status', 'known_conditions', 'family_history', 'current_medications']
};

const emptyField = (): FactField => ({ value: null, status: 'missing', confidence: 0, evidence_snippet: '', speaker: 'unknown', timestamp: 0, source_segment_id: '', manually_edited: false });

function emptyState(): SessionState {
  return {
    id: 'demo-local',
    status: 'demo',
    transcript: [],
    fna: {
      completion_score: 0,
      contradictions: [],
      sections: Object.fromEntries(
        Object.entries(sectionFields).map(([k, fields]) => [k, { name: k.replaceAll('_', ' '), fields: Object.fromEntries(fields.map((f) => [f, emptyField()])) }])
      )
    },
    next_questions: ['Run guided demo to generate personalised follow-up questions.'],
    missing_fields: ['personal_details.full_name', 'employment_and_income.annual_income', 'risk_and_investing.time_horizon'],
    warnings: ['Running in local guided demo mode for GitHub Pages. Backend APIs are optional.'],
    audit_trail: ['Session initialised in static demo mode']
  };
}

function stamp(field: FactField, value: string | number, status: 'confirmed' | 'inferred', seg: TranscriptSegment, confidence: number) {
  field.value = value;
  field.status = status;
  field.confidence = confidence;
  field.evidence_snippet = seg.text;
  field.speaker = seg.speaker;
  field.timestamp = seg.timestamp;
  field.source_segment_id = seg.id;
}

export function buildDemoState(step: number): SessionState {
  const state = emptyState();
  const transcript = seedSegments.slice(0, Math.max(0, Math.min(step, seedSegments.length)));
  state.transcript = transcript;
  transcript.forEach((seg) => {
    const t = seg.text.toLowerCase();
    if (t.includes('married')) stamp(state.fna.sections.personal_details.fields.marital_status, 'married', 'confirmed', seg, 0.9);
    if (t.includes('2 children')) stamp(state.fna.sections.household_and_dependants.fields.number_of_dependants, 2, 'confirmed', seg, 0.88);
    if (t.includes('engineering manager')) {
      stamp(state.fna.sections.employment_and_income.fields.occupation, 'engineering manager', 'confirmed', seg, 0.86);
      stamp(state.fna.sections.employment_and_income.fields.annual_income, 180000, 'confirmed', seg, 0.86);
      stamp(state.fna.sections.employment_and_income.fields.employment_status, 'salaried', 'confirmed', seg, 0.84);
    }
    if (t.includes('mortgage')) {
      stamp(state.fna.sections.expenses_and_liabilities.fields.mortgage, 'active', 'confirmed', seg, 0.83);
      stamp(state.fna.sections.expenses_and_liabilities.fields.monthly_expenses, 6000, 'inferred', seg, 0.75);
    }
    if (t.includes('hospitalisation')) {
      stamp(state.fna.sections.existing_insurance.fields.hospitalisation_cover, 'yes', 'confirmed', seg, 0.82);
      stamp(state.fna.sections.existing_insurance.fields.life_cover, 'yes', 'confirmed', seg, 0.8);
    }
    if (t.includes('retirement')) {
      stamp(state.fna.sections.goals_and_priorities.fields.retirement_goal, 'retire in 20 years', 'confirmed', seg, 0.85);
      stamp(state.fna.sections.goals_and_priorities.fields.education_goal, 'fund children education', 'confirmed', seg, 0.85);
      stamp(state.fna.sections.risk_and_investing.fields.time_horizon, '20 years', 'inferred', seg, 0.72);
    }
    if (t.includes('moderate risk')) {
      stamp(state.fna.sections.risk_and_investing.fields.risk_appetite, 'moderate', 'confirmed', seg, 0.9);
      stamp(state.fna.sections.risk_and_investing.fields.drawdown_tolerance, 'accepts temporary drawdowns', 'inferred', seg, 0.74);
    }
  });

  const allFields = Object.values(state.fna.sections).flatMap((s) => Object.entries(s.fields));
  const completed = allFields.filter(([, f]) => f.status === 'confirmed' || f.status === 'inferred').length;
  state.fna.completion_score = Math.round((completed / allFields.length) * 100);

  state.missing_fields = [
    'personal_details.full_name',
    'personal_details.date_of_birth',
    'household_and_dependants.spouse_name',
    'existing_insurance.insurer_names',
    'expenses_and_liabilities.loans',
    'goals_and_priorities.timeline_notes'
  ].filter((f) => {
    const [s, k] = f.split('.');
    return state.fna.sections[s].fields[k].status === 'missing';
  });

  state.next_questions = [
    'You mentioned a mortgage — roughly how much remains outstanding?',
    'As you are married, may I confirm your spouse’s full name?',
    'Do you recall which insurer your existing cover is held with?',
    'Besides the mortgage, do you have any other loans or liabilities?',
    'To complete retirement planning, when would you like optional work to stop?'
  ].slice(0, Math.max(1, Math.min(5, state.missing_fields.length)));

  state.audit_trail.push(`Guided demo progressed to segment ${transcript.length}/${seedSegments.length}`);
  if (transcript.length === seedSegments.length) state.status = 'ready_for_review';
  return state;
}

export const seedLength = seedSegments.length;
