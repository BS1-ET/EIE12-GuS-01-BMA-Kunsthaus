
(function(){
const D=window.TEST, KEY='bma-test-'+D.id;
const box=document.getElementById('test'), erg=document.getElementById('ergebnis'), nameIn=document.getElementById('name');
try{nameIn.value=localStorage.getItem('bma-name')||''}catch(e){}
nameIn.addEventListener('input',()=>{try{localStorage.setItem('bma-name',nameIn.value)}catch(e){}});
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function num(s){s=String(s).trim().replace(/\s/g,'').replace(',','.');return s===''?NaN:Number(s)}
function fmt(x){return String(x).replace('.',',')}
let state=[];
function render(){
 box.innerHTML='';erg.hidden=true;state=[];
 D.fragen.forEach((f,i)=>{
  const c=document.createElement('section');c.className='frage';
  let inner=`<div class="fkopf"><span class="nr">${i+1}</span><span class="koord">${f.k}</span>${f.t==='mc'?'<span class="hinweis">mehrere Antworten richtig</span>':''}</div><p class="q">${f.q}</p>`;
  if(f.t==='num'){inner+=`<div class="numrow"><input type="text" inputmode="decimal" class="numin" aria-label="Antwort"><span class="unit">${f.u||''}</span></div>`}
  else{const order=shuffle(f.o.map((_,k)=>k));state[i]={order};
   inner+='<div class="opts">'+order.map(k=>`<label class="opt"><input type="${f.t==='sc'?'radio':'checkbox'}" name="f${i}" value="${k}"><span>${f.o[k]}</span></label>`).join('')+'</div>'}
  inner+=`<div class="fb" hidden></div>`;
  c.innerHTML=inner;box.appendChild(c);
 });
 const b=document.createElement('div');b.className='aktion';
 b.innerHTML='<button id="pruefen" class="btn">Prüfen</button>';
 box.appendChild(b);
 document.getElementById('pruefen').onclick=pruefen;
}
function pruefen(){
 let punkte=0;const proK={};
 D.fragen.forEach((f,i)=>{
  const sec=box.children[i], fb=sec.querySelector('.fb');let ok=false,loes='';
  if(f.t==='num'){const v=num(sec.querySelector('.numin').value);ok=!isNaN(v)&&Math.abs(v-f.a)<=f.tol+1e-9;loes=fmt(f.a)+' '+(f.u||'')}
  else{const sel=[...sec.querySelectorAll('input:checked')].map(x=>+x.value).sort();
   const soll=(f.t==='sc'?[f.a]:f.a).slice().sort();ok=sel.length===soll.length&&sel.every((v,k)=>v===soll[k]);
   loes=soll.map(k=>f.o[k]).join(' · ');
   sec.querySelectorAll('.opt').forEach(l=>{const k=+l.querySelector('input').value;l.classList.toggle('richtig',soll.includes(k));l.classList.toggle('falsch',!soll.includes(k)&&l.querySelector('input').checked)})}
  if(ok)punkte++;
  proK[f.k]=proK[f.k]||[0,0];proK[f.k][1]++;if(ok)proK[f.k][0]++;
  sec.classList.toggle('ok',ok);sec.classList.toggle('nok',!ok);
  fb.hidden=false;fb.innerHTML=(ok?'<b>✔ Richtig.</b> ':'<b>✘ Noch nicht.</b> Richtig: '+loes+'. ')+'<span class="erkl">'+f.e+'</span>';
  sec.querySelectorAll('input').forEach(x=>x.disabled=true);
 });
 const n=D.fragen.length,pz=Math.round(punkte/n*100),ok=pz>=80;
 const datum=new Date().toLocaleString('de-DE',{dateStyle:'short',timeStyle:'short'});
 try{const alt=JSON.parse(localStorage.getItem(KEY)||'{}');localStorage.setItem(KEY,JSON.stringify({p:pz,best:Math.max(pz,alt.best||0),d:datum}))}catch(e){}
 let weg='';
 if(D.weg){weg=pz>=80?'<p><b>Empfehlung:</b> Du hast gutes Vorwissen. Wähle den <b>selbstgesteuerten</b> Weg.</p>':pz>=50?'<p><b>Empfehlung:</b> Wähle den <b>angeleiteten</b> Weg mit Infoblatt und Hilfekarten.</p>':'<p><b>Empfehlung:</b> Wähle heute den Weg <b>mit Erklärung</b> durch die Lehrkraft.</p>'}
 const tab=Object.entries(proK).map(([k,[a,b]])=>`<tr><td>${k}</td><td>${a} / ${b}</td><td>${a===b?'● sicher':a>0?'◐ teilweise':'○ noch nicht'}</td></tr>`).join('');
 erg.hidden=false;erg.className='ergebnis '+(ok?'bestanden':'offen');
 erg.innerHTML=`<h2>${ok?'Bestanden':'Noch nicht bestanden'}: ${punkte} von ${n} richtig (${pz} %)</h2>
 <p class="nachweis">${(nameIn.value||'ohne Namen').replace(/</g,'')} · ${D.kurz} · ${datum}</p>${weg}
 <table><tr><th>Koordinate</th><th>richtig</th><th>Einschätzung</th></tr>${tab}</table>
 <p>${ok?'Gut gemacht! Weiter auf der Lernlandkarte.':'Schau dir die Erklärungen oben an, lies im Infoblatt nach und wiederhole den Test.'} Als Nachweis kannst du diese Seite drucken bzw. als PDF speichern oder einen Screenshot in Teams abgeben.</p>
 <p><button class="btn" id="nochmal">Test wiederholen</button> <a class="btn hell" href="../index.html">Zur Lernlandkarte</a></p>`;
 document.getElementById('nochmal').onclick=()=>{render();window.scrollTo(0,0)};
 document.getElementById('pruefen').disabled=true;
 erg.scrollIntoView({behavior:'smooth'});
}
render();
})();
