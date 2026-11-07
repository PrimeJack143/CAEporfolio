const DATA=[
 {k:"Square",items:[["QR code",35,3],["Icon / PFP",30,3],["Stamp",25,2],["Watermark",25,2]]},
 {k:"Banner",note:"Portrait and landscape are the same price.",items:[["Custom banner",40,5],["Pricelist",45,5],["Template",45,6],["Wallpaper",35,5]]},
 {k:"Carrd",items:[["Intro page, simple",80,6],["Intro page, complex",100,8],["Extra page, simple",60,5],["Extra page, complex",80,6],["Artist Carrd Set, simple",250,20,"Intro + Terms &amp; Conditions / Terms of Service + Art Pricelist + Samples"],["Artist Carrd Set, complex",350,25,"Intro + Terms &amp; Conditions / Terms of Service + Art Pricelist + Samples"],["Piloting Carrd Set, simple",400,40,"Intro + Terms &amp; Conditions / Terms of Service + 1 Game Pricelist"],["Piloting Carrd Set, complex",550,45,"Intro + Terms &amp; Conditions / Terms of Service + 1 Game Pricelist"]]},
 {k:"Editing",note:"Prices are per minute or cycle.",items:[["Animated banner",50,5],["Trend editing",50,5],["Promotion editing",100,7]]},
 {k:"Extras",note:"Rush fees are added on top of the base price.",items:[["Watermark removal, banner",200,10],["Watermark removal, Carrd",300,15],["Cancellation fee",50,5],["1 day rush (banner / Carrd / editing)","75% / 100% / 100%",0],["3 days rush (banner / Carrd / editing)","50% / 80% / 75%",0],["7 days rush (banner / Carrd / editing)","10% / 35% / 30%",0]]}
];
let cur="php",tab=0;
const $=id=>document.getElementById(id);
const fmt=(p,u)=>typeof p==="string"?p:(cur==="php"?"₱"+p:"$"+u);
function renderTabs(){
  $("tabs").innerHTML=DATA.map((d,i)=>`<button class="tab" role="tab" aria-selected="${i===tab}" data-i="${i}">${d.k}</button>`).join("");
  $("tabs").querySelectorAll(".tab").forEach(b=>b.onclick=()=>{tab=+b.dataset.i;renderTabs();renderPanel()});
}
function renderPanel(){
  const d=DATA[tab];
  $("panel").innerHTML=d.items.map(([n,p,u,s])=>`<div class="row"><b>${n}${s?`<small>${s}</small>`:""}</b><span>${fmt(p,u)}</span></div>`).join("");
  $("tabnote").textContent=d.note||"";
}
function renderEst(){
  const keep=$("svc").value;
  $("svc").innerHTML=DATA.slice(0,4).flatMap(d=>d.items.map(([n,p,u])=>({n:d.k+": "+n,p,u,g:GRP[d.k]})))
    .map((o,i)=>`<option value="${i}" data-p="${o.p}" data-u="${o.u}" data-g="${o.g}">${o.n}</option>`).join("");
  if(keep)$("svc").value=keep;
  renderRush();
}
const RUSH={banner:[.75,.5,.1],carrd:[1,.8,.35],editing:[1,.75,.3]};
const GRP={Square:"banner",Banner:"banner",Carrd:"carrd",Editing:"editing"};
function renderRush(){
  const o=$("svc").selectedOptions[0];if(!o)return;
  const r=RUSH[o.dataset.g],i=$("rush").selectedIndex,pc=x=>Math.round(x*100);
  $("rush").innerHTML=`<option value="0">Standard</option><option value="${r[2]}">Rush: 1 week (+${pc(r[2])}%)</option><option value="${r[1]}">Rush: 3 days (+${pc(r[1])}%)</option><option value="${r[0]}">Rush: 1 day (+${pc(r[0])}%)</option>`;
  $("rush").selectedIndex=Math.max(i,0);
  calc();
}
function calc(){
  const o=$("svc").selectedOptions[0];if(!o)return;
  const r=parseFloat($("rush").value);
  const v=(cur==="php"?+o.dataset.p:+o.dataset.u)*(1+r);
  const t=$("total"),nv=(cur==="php"?"₱":"$")+Math.round(v*100)/100;
  if(t.textContent!==nv){t.textContent=nv;t.classList.remove("pop");void t.offsetWidth;t.classList.add("pop")}
}
$("svc").onchange=renderRush;$("rush").onchange=calc;
$("cur").onclick=()=>{cur=cur==="php"?"usd":"php";$("cur").textContent=cur==="php"?"₱ PHP":"$ USD";renderPanel();calc()};
function isDark(){const t=document.documentElement.dataset.theme;return t?t==="dark":matchMedia("(prefers-color-scheme:dark)").matches}
function syncTheme(){$("theme").textContent=isDark()?"Light":"Dark"}
$("theme").onclick=()=>{document.documentElement.dataset.theme=isDark()?"light":"dark";syncTheme()};
let tk=0;
function route(){
  let v=location.hash.slice(1);
  if(!document.getElementById('v-'+v))v='home';
  document.querySelectorAll('nav a[data-v]').forEach(a=>a.dataset.v===v?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
  const next=document.getElementById('v-'+v),prev=document.querySelector('.view.on');
  if(prev===next)return;
  const t=++tk;
  const show=()=>{if(t!==tk)return;document.querySelectorAll('.view').forEach(e=>e.classList.remove('on','out'));next.classList.add('on');window.scrollTo(0,0)};
  if(prev){prev.classList.add('out');setTimeout(show,220)}else show();
}
addEventListener('hashchange',route);
syncTheme();renderTabs();renderPanel();renderEst();route();
const lb=$("lb");
document.querySelectorAll(".zoom").forEach(b=>b.onclick=()=>{const im=b.querySelector("img");$("lbimg").src=im.src;$("lbimg").alt=im.alt;lb.showModal()});
function closeLb(){if(!lb.open||lb.classList.contains("closing"))return;lb.classList.add("closing");setTimeout(()=>{lb.close();lb.classList.remove("closing")},200)}
lb.addEventListener("click",e=>{if(e.target===lb)closeLb()});
lb.addEventListener("cancel",e=>{e.preventDefault();closeLb()});
lb.querySelector("form").addEventListener("submit",e=>{e.preventDefault();closeLb()});

(function(){
const a=$("bgm"),box=$("pl"),play=$("plPlay"),seek=$("plSeek"),tc=$("plCur"),td=$("plDur"),mute=$("plMute"),vol=$("plVol");
let manual=false,drag=false;
const t=s=>{if(!isFinite(s))return"0:00";const m=Math.floor(s/60),r=Math.floor(s%60);return m+":"+String(r).padStart(2,"0")};
const fill=(el,v,max)=>el.style.setProperty("--p",(max>0?Math.min(v/max,1)*100:0)+"%");
const sync=()=>{const on=!a.paused;box.classList.toggle("playing",on);play.setAttribute("aria-label",on?"Pause":"Play")};
const meta=()=>{if(isFinite(a.duration)){seek.max=a.duration;td.textContent=t(a.duration)}fill(seek,seek.value,seek.max)};
const tick=()=>{if(!drag){seek.value=a.currentTime;fill(seek,a.currentTime,seek.max)}tc.textContent=t(a.currentTime)};
const vsync=()=>{const m=a.muted||a.volume===0;box.classList.toggle("muted",m);mute.setAttribute("aria-label",m?"Unmute":"Mute");vol.value=m?0:a.volume;fill(vol,vol.value,1)};
a.volume=.5;
a.addEventListener("play",sync);
a.addEventListener("pause",sync);
a.addEventListener("loadedmetadata",meta);
a.addEventListener("durationchange",meta);
a.addEventListener("timeupdate",tick);
a.addEventListener("volumechange",vsync);
play.addEventListener("click",()=>{manual=true;if(a.paused)a.play().catch(()=>{});else a.pause()});
seek.addEventListener("pointerdown",()=>{drag=true});
addEventListener("pointerup",()=>{drag=false});
addEventListener("pointercancel",()=>{drag=false});
seek.addEventListener("input",()=>{fill(seek,seek.value,seek.max);tc.textContent=t(+seek.value);a.currentTime=+seek.value});
vol.addEventListener("input",()=>{a.muted=false;a.volume=+vol.value});
mute.addEventListener("click",()=>{a.muted=!a.muted;if(!a.muted&&a.volume===0)a.volume=.5});
const evs=["pointerdown","keydown","touchstart"];
const done=()=>evs.forEach(e=>removeEventListener(e,first));
function first(e){
  if(box.contains(e.target))return;
  if(!manual&&a.paused)a.play().then(done).catch(()=>{});else done();
}
evs.forEach(e=>addEventListener(e,first,{passive:true}));
a.play().then(done).catch(()=>{});
sync();vsync();meta();
})();