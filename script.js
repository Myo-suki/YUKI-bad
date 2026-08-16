const holes=document.querySelector("#holes");
const lostEl=document.querySelector("#attempts");
const savedEl=document.querySelector("#escapes");
const sausageEl=document.querySelector("#reliability");
const statusEl=document.querySelector("#button-status");
const globalStatusEl=document.querySelector("#global-status");
const secureLabel=document.querySelector("#secure-label");
const instruction=document.querySelector("#instruction");
const log=document.querySelector("#log");
const grid=document.querySelector("#incident-grid");
const pad=n=>String(n).padStart(2,"0");

let lost=0,saved=0,pieces=1,active=-1,timer=null,running=true,cellIndex=0;

const yukiSVG=`
<svg viewBox="0 0 150 125" aria-hidden="true">
 <g class="head">
  <path d="M34 47 18 9 56 30M116 47l16-38-38 21" fill="#8b6b50" stroke="#c5a45d" stroke-width="2"/>
  <path d="M27 19 39 43 51 34M123 19 111 43 99 34" fill="#d7a6b3" opacity=".75"/>
  <path d="M33 48Q39 23 75 25t42 23v31q-6 34-42 37-36-3-42-37Z" fill="#b89573" stroke="#c5a45d" stroke-width="2"/>
  <path d="M39 45q8-20 22-12l-4 59-20-13ZM111 45q-8-20-22-12l4 59 20-13Z" fill="#6e5542"/>
  <path d="M57 29q18-15 36 0l-7 59H64Z" fill="#d9bd94"/>
  <path d="M49 66q11-15 23 0M78 66q12-15 23 0" fill="none" stroke="#fffdfc" stroke-width="3" opacity=".75"/>
  <circle cx="57" cy="67" r="5" fill="#090909"/><circle cx="94" cy="67" r="5" fill="#090909"/>
  <circle cx="55" cy="65" r="1.5" fill="#fffdfc"/><circle cx="92" cy="65" r="1.5" fill="#fffdfc"/>
  <path d="M61 82q14-12 29 0l-4 15H65Z" fill="#ead4b4"/>
  <path d="M67 83q8-7 16 0-2 8-8 8t-8-8" fill="#090909"/>
 </g>
 <g class="sausage">
  <rect x="74" y="93" width="46" height="13" rx="6.5" fill="#c96f69" stroke="#fffdfc" stroke-width="1.5"/>
  <path d="m117 96 8-5m-8 12 8 5" stroke="#c5a45d" stroke-width="2" stroke-linecap="round"/>
  <path d="M84 96v7m10-7v7m10-7v7" stroke="#8f4845" opacity=".65"/>
 </g>
</svg>`;

function time(){return new Date().toLocaleTimeString("en-GB",{hour12:false})}
function addLog(type,message){
 const line=document.createElement("div");line.className="log-line";
 const cls=type==="HIT"?"log-ok":type==="MISS"?"log-critical":"log-info";
 line.innerHTML=`<time>${time()}</time><span class="${cls}">${type}</span><p>${message}</p>`;
 log.appendChild(line);while(log.children.length>12)log.firstElementChild.remove();log.scrollTop=log.scrollHeight;
}
function buildGrid(){
 grid.innerHTML="";
 for(let i=0;i<104;i++){const c=document.createElement("i");c.className="incident-cell";grid.appendChild(c)}
}
function record(result){
 const cells=[...grid.children];
 if(cellIndex>=cells.length){cells.forEach(c=>c.className="incident-cell");cellIndex=0}
 cells[cellIndex++].classList.add(result);
}
function buildHoles(){
 holes.innerHTML="";
 for(let i=0;i<9;i++){
  const hole=document.createElement("div");hole.className="hole";
  hole.innerHTML=`<span class="hole-number">0${i+1}</span><button class="yorkie-button" type="button" aria-label="Catch Yuki">${yukiSVG}</button>`;
  const dog=hole.querySelector("button");
  dog.addEventListener("pointerenter",e=>{if(e.pointerType==="mouse")hit(i)});
  dog.addEventListener("pointerdown",e=>{e.preventDefault();hit(i)});
  holes.appendChild(hole);
 }
}
const dogs=()=>[...document.querySelectorAll(".yorkie-button")];
function updateScore(){
 lostEl.textContent=pad(lost);savedEl.textContent=pad(saved);sausageEl.textContent=`${pad(pieces)} PCS`;
 const dog=dogs()[active];if(dog)dog.style.setProperty("--sausage-scale",Math.min(1+pieces*.085,2.2));
}
function showNext(delay=160){
 clearTimeout(timer);
 setTimeout(()=>{
  if(!running)return;
  const all=dogs();
  let next;do{next=Math.floor(Math.random()*all.length)}while(next===active);
  active=next;all[active].classList.remove("retreat");
  all[active].style.setProperty("--sausage-scale",Math.min(1+pieces*.085,2.2));
  requestAnimationFrame(()=>all[active].classList.add("active"));
  const visibleFor=Math.max(520,1300-(lost+saved)*18);
  timer=setTimeout(miss,visibleFor);
 },delay);
}
function hideActive(){
 const dog=dogs()[active];if(!dog)return;
 dog.classList.remove("active");dog.classList.add("retreat");
}
function miss(){
 if(!running||active<0)return;
 hideActive();lost++;pieces++;record("miss");updateScore();
 addLog("MISS",`Yuki escaped. Sausage loss #${lost}`);
 instruction.textContent=pieces<6?"Missed. Yuki stole another piece.":pieces<12?"The sausage is getting longer. Yuki is not sorry.":"This is now a serious sausage situation.";
 showNext();
}
function hit(index){
 if(!running||index!==active)return;
 clearTimeout(timer);hideActive();saved++;record("hit");
 addLog("HIT",`Sausage #${saved} recovered from Yuki`);
 pieces=1;updateScore();
 statusEl.textContent="STILL RUNNING";globalStatusEl.textContent="RECOVERY CONTINUES";secureLabel.textContent="NICE HIT";
 instruction.textContent="Sausage saved. Yuki already stole another one.";
 showNext(230);
}
function reset(){
 clearTimeout(timer);lost=0;saved=0;pieces=1;active=-1;cellIndex=0;running=true;
 statusEl.textContent="ON THE RUN";globalStatusEl.textContent="RECOVERY IN PROGRESS";secureLabel.textContent="ACTIVE";
 instruction.textContent="Catch Yuki and take the sausage back.";
 buildGrid();buildHoles();updateScore();log.innerHTML="";
 addLog("INFO","Continuous recovery mode started");addLog("INFO","White = missed · Pink = caught");
 showNext(500);
}
document.querySelector("#clear-log").addEventListener("click",()=>{log.innerHTML="";addLog("INFO","Operational log cleared")});
document.querySelector("#reset-system").addEventListener("click",reset);
document.querySelector("#year").textContent=new Date().getFullYear();
reset();
