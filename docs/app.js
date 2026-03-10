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
let liveSegments = JSON.parse(localStorage.getItem('copilot-live-segments') || '[]');
let recognition = null;
let listening = false;
let startTime = Date.now();

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

function applyFacts(text){
  const t = text.toLowerCase();
  if(t.includes('married')) fields.marital_status=['confirmed','married'];
  if(t.includes('children')) {
    const m = t.match(/(\d+)\s+children/);
    fields.number_of_dependants=['confirmed', m ? m[1] : 'mentioned'];
  }
  if(t.includes('engineering manager')) fields.occupation=['confirmed','engineering manager'];
  if(t.includes('salaried')) fields.occupation[0] = fields.occupation[0] === 'missing' ? 'inferred' : fields.occupation[0];
  const incomeMatch = t.match(/(\d{2,3}[\d,]{2,})/);
  if(t.includes('income') || t.includes('earning') || t.includes('salary')) if(incomeMatch) fields.annual_income=['confirmed',incomeMatch[1].replaceAll(',','')];
  if(t.includes('mortgage')) fields.mortgage=['confirmed','active'];
  if(t.includes('hospital') || t.includes('hospitalisation')) fields.hospitalisation_cover=['confirmed','yes'];
  if(t.includes('retirement') || t.includes('retire')) fields.retirement_goal=['inferred','retirement planning'];
  if(t.includes('moderate risk') || (t.includes('risk') && t.includes('moderate'))) fields.risk_appetite=['confirmed','moderate'];
}

function rebuildFacts(){
  Object.keys(fields).forEach(k=>fields[k]=['missing','—']);
  seed.slice(0,step).forEach(([,text])=>applyFacts(text));
  liveSegments.forEach((s)=>applyFacts(s.text));
}

function computeSpeaker(text){
  const t = text.toLowerCase();
  if (t.includes('i am') || t.includes('my') || t.includes('we have')) return 'client';
  return 'adviser';
}

function nowSeconds(){
  return Math.floor((Date.now() - startTime) / 1000);
}

function addLiveSegment(text){
  if(!text || !text.trim()) return;
  liveSegments.push({ speaker: computeSpeaker(text), text: text.trim(), timestamp: nowSeconds() });
  if (liveSegments.length > 80) liveSegments = liveSegments.slice(liveSegments.length - 80);
  localStorage.setItem('copilot-live-segments', JSON.stringify(liveSegments));
  render();
}

function render(){
  rebuildFacts();

  const transcript = document.getElementById('transcript');
  transcript.innerHTML='';
  const scripted = seed.slice(0,step).map(([speaker,text,time]) => ({speaker,text,timestamp:time}));
  const timeline = [...scripted, ...liveSegments].sort((a,b)=>a.timestamp-b.timestamp);

  timeline.forEach(({speaker,text,timestamp})=>{
    const div = document.createElement('div');
    div.className='seg';
    div.innerHTML=`<div class='meta'><span>${speaker.toUpperCase()}</span><span>${timestamp}s</span></div><div>${text}</div>`;
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
    'Do you know which insurer your hospital cover is with?',
    'For planning suitability, how comfortable are you with temporary market declines?'
  ];
  const done = Object.values(fields).filter(v=>v[0]!=='missing').length;
  document.getElementById('bestQuestion').textContent = done ? q[Math.min(q.length-1, Math.floor(done/2))] : 'Run guided demo or start listening to generate suggestions.';

  const completion = Math.round((done / Object.keys(fields).length) * 100);
  document.getElementById('completion').textContent = `${completion}%`;
  document.getElementById('railFill').style.width = `${completion}%`;

  localStorage.setItem('copilot-step', String(step));
}

function startListening(){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const status = document.getElementById('micStatus');
  const badge = document.getElementById('sessionState');

  if(!SpeechRecognition){
    status.textContent = 'Speech recognition is not supported in this browser. Use guided demo mode instead.';
    return;
  }

  if(!recognition){
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      for(let i=event.resultIndex; i<event.results.length; i++){
        if(event.results[i].isFinal){
          addLiveSegment(event.results[i][0].transcript);
        }
      }
    };

    recognition.onerror = () => {
      status.textContent = 'Microphone permission/error encountered. Check browser permissions and retry.';
      listening = false;
      badge.textContent = 'Demo';
    };

    recognition.onend = () => {
      if(listening) recognition.start();
    };
  }

  listening = true;
  recognition.start();
  badge.textContent = 'Live';
  status.textContent = 'Listening to conversation in real time. New transcript turns will update fields automatically.';
}

function stopListening(){
  const badge = document.getElementById('sessionState');
  const status = document.getElementById('micStatus');
  listening = false;
  if(recognition) recognition.stop();
  badge.textContent = 'Ready';
  status.textContent = 'Listening stopped. You can resume or continue guided demo.';
}

document.getElementById('advance').addEventListener('click', ()=>{ step = Math.min(seed.length, step + 1); render(); });
document.getElementById('reset').addEventListener('click', ()=>{ step = 0; liveSegments = []; localStorage.removeItem('copilot-live-segments'); stopListening(); render(); });
document.getElementById('startListening').addEventListener('click', startListening);
document.getElementById('stopListening').addEventListener('click', stopListening);

render();
