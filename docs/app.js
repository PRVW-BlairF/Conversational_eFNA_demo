const seed = [
  ['adviser','Thanks for coming in, can we start with your family situation?',0],
  ['client','Sure, I am married and we have 2 children aged 7 and 10.',18],
  ['adviser','Great, and your current employment and income details?',36],
  ['client','I am a salaried engineering manager earning about 180000 a year.',54],
  ['client','We also have a mortgage and monthly household expenses around 6000.',72],
  ['client','I already have hospitalisation and life cover but I cannot recall insurer names.',90],
  ['client','Main goals are retirement in about 20 years and education funding for the children.',108],
  ['client','For investing I am moderate risk and can accept some temporary drawdowns.',126]
];

let step = Number(localStorage.getItem('copilot-step') || 0);

const fields = {
  marital_status: ['missing','—'],
  number_of_dependants: ['missing','—'],
  occupation: ['missing','—'],
  annual_income: ['missing','—'],
  mortgage: ['missing','—'],
  hospitalisation_cover: ['missing','—'],
  retirement_goal: ['missing','—'],
  risk_appetite: ['missing','—']
};

function applyFacts(i){
  const t = seed[i]?.[1]?.toLowerCase() || '';
  if(t.includes('married')) fields.marital_status=['confirmed','married'];
  if(t.includes('2 children')) fields.number_of_dependants=['confirmed','2'];
  if(t.includes('engineering manager')) {fields.occupation=['confirmed','engineering manager']; fields.annual_income=['confirmed','180000'];}
  if(t.includes('mortgage')) fields.mortgage=['confirmed','active'];
  if(t.includes('hospitalisation')) fields.hospitalisation_cover=['confirmed','yes'];
  if(t.includes('retirement')) fields.retirement_goal=['inferred','retire in ~20 years'];
  if(t.includes('moderate risk')) fields.risk_appetite=['confirmed','moderate'];
}

function render(){
  Object.keys(fields).forEach(k=>fields[k]=['missing','—']);
  for(let i=0;i<step;i++) applyFacts(i);

  const transcript = document.getElementById('transcript');
  transcript.innerHTML='';
  seed.slice(0,step).forEach(([speaker,text,time])=>{
    const div = document.createElement('div');
    div.className='seg';
    div.innerHTML=`<div class='meta'><span>${speaker.toUpperCase()}</span><span>${time}s</span></div><div>${text}</div>`;
    transcript.appendChild(div);
  });

  const fna = document.getElementById('fna');
  fna.innerHTML='';
  Object.entries(fields).forEach(([k,[status,val]])=>{
    const row = document.createElement('div');
    row.className='row';
    row.innerHTML=`<div><strong>${k.replaceAll('_',' ')}</strong><div>${val}</div></div><span class='status ${status}'>${status}</span>`;
    fna.appendChild(row);
  });

  const missing = Object.entries(fields).filter(([,v])=>v[0]==='missing').map(([k])=>k);
  const list = document.getElementById('missing');
  list.innerHTML='';
  missing.slice(0,6).forEach(m=>{ const li=document.createElement('li'); li.textContent=m.replaceAll('_',' '); list.appendChild(li); });

  const q = [
    'You mentioned a mortgage — roughly how much is still outstanding?',
    'As you are married, may I confirm your spouse’s full name?',
    'Do you know which insurer your hospital cover is with?'
  ];
  document.getElementById('bestQuestion').textContent = step ? q[Math.min(q.length-1, Math.floor(step/3))] : 'Run guided demo to generate suggestions.';

  const completion = Math.round((Object.values(fields).filter(v=>v[0]!=='missing').length / Object.keys(fields).length) * 100);
  document.getElementById('completion').textContent = `${completion}%`;
  document.getElementById('railFill').style.width = `${completion}%`;

  localStorage.setItem('copilot-step', String(step));
}

document.getElementById('advance').addEventListener('click', ()=>{ step = Math.min(seed.length, step + 1); render(); });
document.getElementById('reset').addEventListener('click', ()=>{ step = 0; render(); });

render();
