const speech=document.querySelector('#speech'),button=document.querySelector('#speak'),voiceSelect=document.querySelector('#voice'),rate=document.querySelector('#rate'),rateValue=document.querySelector('#rateValue'),count=document.querySelector('#count'),status=document.querySelector('#status'),avatar=document.querySelector('#avatar'),error=document.querySelector('#error');
let voices=[],active=false;
const cue=/(stage\s*(cue|direction)|cue|pause|breathe|breath|smile|look|eye contact|nod|gesture|wait|silence|applause|music|sound|lights?|spotlight|slowly|emphasize|whisper|stand|sit|walk|wave|enter|entrance|exit|turn|face the audience)/i;
const female=/(female|woman|alona|blessica|rosa|samantha|karen|moira|tessa|fiona|zira|ava|victoria|susan|hazel|aria|jenny|joanna|kendra|kimberly|amy|emma|olivia|michelle|nicole|salli|ivy|rosa|ana|monica|elena|laura|helena|julie|chloe|alice|amelie|marie|sonia|natasha|veena|raveena|serena)/i;
const male=/(\bmale\b|\bman\b|angelo|david|mark|george|daniel|james|richard|ryan|brian|christopher|eric|aaron|roger|ralph|fred|thomas|arthur|albert|guy|reed|rocko|junior|rishi|oliver|evan|nathan)/i;
function isCue(s){return s.replace(/[\[\]()*_–—:.-]/g,' ').trim().length<=100&&cue.test(s)}
function clean(s){return s.replace(/\[([^\]]*)\]/g,(a,b)=>isCue(b)?' ':a).replace(/\(([^)]*)\)/g,(a,b)=>isCue(b)?' ':a).split(/\r?\n/).filter(x=>!isCue(x)).join('\n').replace(/[ \t]{2,}/g,' ').trim()}
function load(){
  const available=speechSynthesis.getVoices().filter(v=>/^(en|fil|tl)/i.test(v.lang));
  const filipino=v=>/^(fil|tl)(-|_)|^en-PH$/i.test(v.lang);
  const women=available.filter(v=>female.test(v.name+' '+v.voiceURI)&&!male.test(v.name+' '+v.voiceURI));
  const filipinoWomen=women.filter(filipino);
  const filipinoNonMale=available.filter(v=>filipino(v)&&!male.test(v.name+' '+v.voiceURI));
  const nonMale=available.filter(v=>!male.test(v.name+' '+v.voiceURI));
  voices=filipinoWomen.length?filipinoWomen:(filipinoNonMale.length?filipinoNonMale:(women.length?women:(nonMale.length?nonMale:available)));
  voices.sort((a,b)=>Number(/^(fil|tl)|en-PH/i.test(b.lang))-Number(/^(fil|tl)|en-PH/i.test(a.lang))||Number(/natural|neural|online/i.test(b.name+' '+b.voiceURI))-Number(/natural|neural|online/i.test(a.name+' '+a.voiceURI)));
  voiceSelect.innerHTML='';
  voices.forEach((v,i)=>voiceSelect.add(new Option((/^(fil|tl)(-|_)|^en-PH$/i.test(v.lang)?'Filipino female voice · ':'Female voice · ')+v.name+' · '+v.lang,String(i))));
  if(voices.length)voiceSelect.value='0';
}
if('speechSynthesis'in window){load();speechSynthesis.onvoiceschanged=load}else{button.disabled=true;error.textContent='Please open Aiva in Chrome or Edge.'}
speech.value=localStorage.getItem('aiva-message')||'';count.textContent=speech.value.length;
speech.oninput=()=>{count.textContent=speech.value.length;localStorage.setItem('aiva-message',speech.value);error.textContent=''};
rate.oninput=()=>rateValue.textContent=Number(rate.value).toFixed(2)+'×';
function finish(){active=false;document.body.classList.remove('presenting');button.textContent='▶ SPEAK MY MESSAGE';status.textContent='ready';avatar.classList.remove('speaking')}
button.onclick=()=>{if(active){speechSynthesis.cancel();finish();return}const text=clean(speech.value);if(!text){error.textContent='Type the actual message you want Aiva to say.';return}const u=new SpeechSynthesisUtterance(text),v=voices[Number(voiceSelect.value)];if(v){u.voice=v;u.lang=v.lang}u.rate=Number(rate.value);u.pitch=1.05;u.onstart=()=>{active=true;document.body.classList.add('presenting');button.textContent='■ STOP';status.textContent='speaking';avatar.classList.add('speaking')};u.onend=finish;u.onerror=finish;speechSynthesis.cancel();speechSynthesis.speak(u)};

document.querySelector('.avatar-card').addEventListener('click',()=>{if(active){speechSynthesis.cancel();finish()}});
