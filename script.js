const holes = document.querySelector("#holes");
const missesEl = document.querySelector("#attempts");
const escapesEl = document.querySelector("#escapes");
const stolenEl = document.querySelector("#reliability");
const statusEl = document.querySelector("#button-status");
const globalStatusEl = document.querySelector("#global-status");
const secureLabel = document.querySelector("#secure-label");
const instruction = document.querySelector("#instruction");
const log = document.querySelector("#log");
const grid = document.querySelector("#incident-grid");
const modal = document.querySelector("#result-modal");
const finalMisses = document.querySelector("#final-attempts");
const finalPieces = document.querySelector("#final-escapes");
const pad = value => String(value).padStart(2,"0");

let misses=0, moves=0, pieces=1, active=-1, timer=null, playing=true, currentCell=0;

const yorkieSVG = `
<svg viewBox="0 0 150 125" aria-hidden="true">
 <g class="head">
  <path d="M34 47 18 9 56 30M116 47l16-38-38 21" fill="#8b6b50" stroke="#c5a45d" stroke-width="2"/>
  <path d="M27 19 39 43 51 34" fill="#d7a6b3" opacity=".72"/>
  <path d="M123 19 111 43 99 34" fill="#d7a6b3" opacity=".72"/>
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

function timestamp(){return new Date().toLocaleTimeString("en-GB",{hour12:false})}
function addLog(level,message){
 const line=document.createElement("div"); line.className="log-line";
 const cls=level==="CAUGHT"?"log-ok":level==="THEFT"?"log-critical":"log-info";
 line.innerHTML=`<time>${timestamp()}</time><span class="${cls}">${level}</span><p>${message}</p>`;
 log.appendChild(line); while(log.children.length>12)log.removeChild(log.firstElementChild); log.scrollTop=log.scrollHeight;
}
function buildGrid(){
 grid.innerHTML="";
 for(let i=0;i<104;i++){const c=document.createElement("i");c.className="incident-cell";grid.appendChild(c)}
}
function markTheft(){
 const cells=[...grid.children]; const c=cells[currentCell%cells.length];
 c.classList.add(pieces>12?"active-3":pieces>5?"active-2":"active-1"); currentCell+=Math.floor(Math.random()*4)+1;
}
function buildHoles(){
 holes.innerHTML="";
 for(let i=0;i<9;i++){
  const hole=document.createElement("div"); hole.className="hole";
  hole.innerHTML=`<span class="hole-number">0${i+1}</span><button class="yorkie-button" type="button" aria-label="Catch the Yorkshire terrier">${yorkieSVG}</button>`;
  const dog=hole.querySelector("button");
  dog.addEventListener("pointerenter",e=>{if(e.pointerType==="mouse")catchDog(i)});
  dog.addEventListener("pointerdown",e=>{e.preventDefault();catchDog(i)});
  holes.appendChild(hole);
 }
}
function buttons(){return [...document.querySelectorAll(".yorkie-button")]}
function update(){
 missesEl.textContent=pad(misses); escapesEl.textContent=pad(moves); stolenEl.textContent=`${pad(pieces)} PCS`;
 const target=buttons()[active]; if(target)target.style.setProperty("--sausage-scale",Math.min(1+pieces*.085,2.15));
 stolenEl.classList.remove("theft-flash"); void stolenEl.offsetWidth; stolenEl.classList.add("theft-flash");
}
function nextHole(){
 if(!playing)return;
 const all=buttons();
 if(active>=0){all[active].classList.remove("active");all[active].classList.add("retreat")}
 let next; do{next=Math.floor(Math.random()*all.length)}while(next===active);
 active=next; all[active].classList.remove("retreat");
 requestAnimationFrame(()=>all[active].classList.add("active"));
 const delay=Math.max(480,1250-moves*32);
 timer=setTimeout(missed,delay);
}
function missed(){
 if(!playing)return;
 misses++; moves++; pieces++; markTheft(); update();
 addLog("THEFT",`Yorkie escaped with sausage piece #${pieces}`);
 instruction.textContent=pieces<6?"Too slow. The stolen sausage is getting longer.":pieces<12?"The suspect is accelerating. So is the sausage.":"This has become a major sausage incident.";
 nextHole();
}
function catchDog(index){
 if(!playing||index!==active)return;
 playing=false; clearTimeout(timer);
 buttons()[active].classList.remove("active");
 statusEl.textContent="DETAINED";globalStatusEl.textContent="SAUSAGE SECURED";secureLabel.textContent="CAUGHT";
 finalMisses.textContent=pad(misses);finalPieces.textContent=pad(pieces);
 addLog("CAUGHT",`Yorkie detained after ${moves} hole changes`);
 setTimeout(()=>{modal.hidden=false;document.body.style.overflow="hidden"},180);
}
function reset(){
 clearTimeout(timer); misses=0;moves=0;pieces=1;active=-1;playing=true;currentCell=0;
 statusEl.textContent="ON THE RUN";globalStatusEl.textContent="RECOVERY IN PROGRESS";secureLabel.textContent="ACTIVE";
 instruction.textContent="Catch the Yorkie and take the sausage back.";
 modal.hidden=true;document.body.style.overflow="";
 buildGrid();buildHoles();update();log.innerHTML="";
 addLog("INFO","Yorkie located with stolen sausage");addLog("INFO","Manual recovery authorized");
 setTimeout(nextHole,500);
}
document.querySelector("#clear-log").addEventListener("click",()=>{log.innerHTML="";addLog("INFO","Operational log cleared")});
document.querySelector("#reset-system").addEventListener("click",reset);
document.querySelector("#restart").addEventListener("click",reset);
modal.addEventListener("click",e=>{if(e.target===modal)reset()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!modal.hidden)reset()});
document.querySelector("#year").textContent=new Date().getFullYear();
reset();
