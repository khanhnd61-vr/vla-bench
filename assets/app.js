const $=s=>document.querySelector(s);

/* ---------- task map ---------- */
const SUITES=[
  ["LIBERO-Spatial",10,5,"Same objects; the target bowl starts somewhere different","rep"],
  ["LIBERO-Object",10,5,"Different object to pick, always at one of two spots","rep"],
  ["LIBERO-Goal",10,5,"Identical scene; only the instruction differs","rep"],
  ["LIBERO-10 (Long)",10,5,"Long tasks, two sub-goals each","rep"],
  ["LIBERO-90",90,18,"Short tasks, many scenes. For pretraining.","pre"]];
$("#map").innerHTML=SUITES.map(([n,c,cols,d,k])=>
  `<div class="grp ${k}"><div class="cells" style="grid-template-columns:repeat(${cols},13px)">${"<i></i>".repeat(c)}</div><b>${n} <span class="num" style="font-weight:500;color:var(--muted)">· ${c}</span></b><span>${d}</span></div>`).join("")+
  `<div class="brace"><span class="key"><i></i>The 40 tasks behind the usual "LIBERO" score</span><span class="key pre"><i></i>Not in the score</span><span>One square is one task.</span></div>`;

/* ---------- suite comparison maps (coordinates from the BDDL files) ---------- */
const P=(x,y)=>[(x+.5)*300+5,(y+.37)*300+5];
/* arrow between two map points, trimmed t1 from the start and t2 from the end; k "new" = test task, else a training task */
function arw(a,b,k,t1,t2){
  const r1=v=>Math.round(v*10)/10, dx=b[0]-a[0], dy=b[1]-a[1], L=Math.hypot(dx,dy), ux=dx/L, uy=dy/L;
  const nw=k==="new", c=nw?"var(--orange)":"var(--ink2)", h=nw?8:6.5;
  const s=[a[0]+ux*t1,a[1]+uy*t1], e=[b[0]-ux*t2,b[1]-uy*t2], q=[e[0]-ux*h,e[1]-uy*h], px=-uy*h*.5, py=ux*h*.5;
  return `<line x1="${r1(s[0])}" y1="${r1(s[1])}" x2="${r1(q[0])}" y2="${r1(q[1])}" stroke="${c}" stroke-width="${nw?2.5:1.5}" ${nw?'':'stroke-dasharray="4 3"'}/>`+
    `<path d="M${r1(e[0])} ${r1(e[1])}L${r1(q[0]+px)} ${r1(q[1]+py)}L${r1(q[0]-px)} ${r1(q[1]-py)}Z" fill="${c}"/>`;
}
function tmap(objs,floor,arrow,arrows,bare){
  let o=`<rect width="250" height="240" rx="8" fill="${floor?'var(--table2)':'var(--table)'}"/>`, lab="";
  if(arrow){const a=P(...arrow[0]),b=P(...arrow[1]);o+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="var(--orange)" stroke-width="2" stroke-dasharray="5 4"/>`}
  for(const [name,x,y,kind,lp,ring] of objs){
    const [px,py]=P(x,y); let r=9;
    if(kind==="fix"){r=17;o+=`<rect x="${px-19}" y="${py-15}" width="38" height="30" rx="4" fill="var(--stove)"/>`}
    else if(kind==="ghost"){r=17;o+=`<rect x="${px-19}" y="${py-15}" width="38" height="30" rx="4" fill="none" stroke="var(--ink2)" stroke-width="1.5" stroke-dasharray="4 3"/>`}
    else if(kind==="basket"){r=17;o+=`<rect x="${px-19}" y="${py-14}" width="38" height="28" rx="4" fill="none" stroke="var(--ink)" stroke-width="2"/>`}
    else if(kind==="plate"){r=12;o+=`<circle cx="${px}" cy="${py}" r="12" fill="var(--plate)" stroke="var(--muted)" stroke-width="1.5"/>`}
    else if(kind==="bowl"){r=8;o+=`<circle cx="${px}" cy="${py}" r="8" fill="var(--obj)" stroke="var(--bg)" stroke-width="1.5"/>`}
    else {r=7;o+=`<rect x="${px-6}" y="${py-6}" width="12" height="12" rx="3" fill="${ring?'var(--blue)':'var(--muted)'}" stroke="var(--bg)" stroke-width="1"/>`}
    /* ring 1: orange circle, blue fill, bold label; ring 2: blue fill and bold label only */
    if(ring===1) o+=`<circle cx="${px}" cy="${py}" r="${r+6}" fill="none" stroke="var(--orange)" stroke-width="2"/>`;
    const d=r+(ring===1?8:3), q={b:[px,py+d+10,"middle"],t:[px,py-d-3,"middle"],l:[px-d-2,py+4,"end"],r:[px+d+2,py+4,"start"]}[lp];
    lab+=`<text x="${q[0]}" y="${q[1]}" text-anchor="${q[2]}" font-size="10.5" font-family="Inter,system-ui,sans-serif" font-weight="${ring?600:400}" fill="var(${kind==="ghost"?"--ink2":"--ink"})">${name}</text>`;
  }
  if(arrows) o+=arrows.map(([a,b,k,t1,t2])=>arw(P(...a),P(...b),k,t1,t2)).join("");
  return bare?o+lab:`<svg class="tmap" viewBox="0 0 250 240" role="img">${o}${lab}</svg>`;
}
const SPF=[["stove",-.41,-.14,"fix","b"],["cabinet",.03,-.27,"fix","b"],["plate",.06,.20,"plate","r"],["cookie box",.07,.03,"item","r"],["ramekin",-.20,.20,"item","l"]];
const GO=(a,b)=>[["stove",-.41,.21,"fix","t",b],["cabinet",.03,-.24,"fix","b"],["wine rack",-.26,-.26,"fix","b"],["plate",.05,-.02,"plate","r"],["bowl",-.09,0,"bowl","b",a],["wine bottle",-.20,-.05,"item","l"],["cream cheese",-.05,.13,"item","b"]];
const CMP=[
 {n:"LIBERO-Spatial",
  a:[tmap([...SPF,["bowl",-.05,.20,"bowl","t",1],["bowl",-.18,.32,"bowl","b"]]),"pick up the black bowl between the plate and the ramekin and place it on the plate"],
  b:[tmap([...SPF,["bowl",-.41,-.14,"bowl","t",1],["bowl",.03,-.27,"bowl","t"]]),"pick up the black bowl on the stove and place it on the plate"],
  v:[["Objects","same","Two identical bowls, plate, ramekin, cookie box, cabinet, stove."],["Positions","diff","Only the two bowls move. Everything else has identical coordinates."],["Goal","same","Always the target bowl onto the plate. The instruction says which bowl by where it is."]]},
 {n:"LIBERO-Object",
  a:[tmap([["basket",0,.26,"basket","b"],["alphabet soup",-.12,-.24,"item","t",1],["salad dressing",.05,-.10,"item","b"],["cream cheese",-.15,.06,"item","b"],["milk",.10,-.20,"item","r"],["tomato sauce",.15,.03,"item","b"],["butter",-.20,-.08,"item","l"]],1),"pick up the alphabet soup and place it in the basket"],
  b:[tmap([["basket",0,.26,"basket","b"],["milk",-.12,-.24,"item","t",1],["cream cheese",.05,-.10,"item","b"],["tomato sauce",-.15,.06,"item","b"],["butter",.10,-.20,"item","r"],["orange juice",.15,.03,"item","b"],["pudding",-.20,-.08,"item","l"]],1),"pick up the milk and place it in the basket"],
  v:[["Objects","diff","A basket plus six groceries, drawn from a pool of ten. The set changes per task."],["Positions","same","The same seven spots in all ten tasks. The object to pick sits on one of two of them, five tasks each."],["Goal","same","Always the target into the basket. The instruction names a different grocery."]]},
 {n:"LIBERO-Goal",
  a:[tmap(GO(1,0),0,[[-.09,0],[-.41,.21]]),"put the bowl on the stove"],
  b:[tmap(GO(0,1)),"turn on the stove"],
  v:[["Objects","same","Bowl, plate, cream cheese, wine bottle, cabinet, stove, wine rack."],["Positions","same","Identical coordinates. The first camera frame looks the same for all ten tasks."],["Goal","diff","The instruction is the only thing that tells the ten tasks apart."]]}];
$("#cmp").innerHTML=CMP.map(c=>`<div class="cmp"><h3>${c.n}</h3>
  <div>${c.a[0]}<code class="cap">“${c.a[1]}”</code></div><div>${c.b[0]}<code class="cap">“${c.b[1]}”</code></div>
  <dl class="vd">${c.v.map(([k,s,t])=>`<dt>${k}</dt><dd><span class="st ${s}">${s==="same"?"Same":"Differs"}</span>${t}</dd>`).join("")}</dl></div>`).join("");

/* ---------- rollout spread, to scale: 1000 px per unit ---------- */
(()=>{
  let seed=7; const rnd=()=>(seed=(seed*1103515245+12345)%2147483648)/2147483648;
  const T=(x,y,s,a="start",w=400,op=1)=>`<text x="${x}" y="${y}" text-anchor="${a}" font-size="12" font-weight="${w}" opacity="${op}" font-family="Inter,system-ui,sans-serif" fill="currentColor">${s}</text>`;
  let o=`<rect x="20" y="34" width="120" height="120" rx="3" fill="var(--blue-soft)" stroke="var(--blue)" stroke-width="1.5"/>`;
  for(let i=0;i<50;i++) o+=`<circle cx="${26+rnd()*108}" cy="${40+rnd()*108}" r="2.6" fill="var(--blue)"/>`;
  o+=T(20,24,"50 start positions of one object",undefined,600)+T(20,172,"2 cm × 2 cm, enlarged 6×",undefined,400,.75);
  const y=94,x0=220;
  o+=`<path d="M140 34L${x0} ${y-10}M140 154L${x0} ${y+10}" stroke="var(--blue)" stroke-width="1" fill="none" opacity=".6"/>`;
  o+=`<line x1="${x0}" y1="${y+30}" x2="${x0+420}" y2="${y+30}" stroke="currentColor" stroke-width="1" opacity=".5"/>`;
  for(let i=0;i<=4;i++){const x=x0+10+i*100;o+=`<line x1="${x}" y1="${y+26}" x2="${x}" y2="${y+34}" stroke="currentColor" opacity=".5"/>`+T(x,y+50,i?("0."+i):"0","middle",400,.75)}
  o+=`<rect x="${x0}" y="${y-10}" width="20" height="20" fill="var(--blue)" rx="2"/>`+T(x0,y-20,"same square, to scale",undefined,600);
  for(const [u,l1,l2] of [[.2,"LIBERO-PRO shift of 0.2","OpenVLA and π0 fail beyond this"],[.4,"shift of 0.4","π0.5 holds up to about here"]]){
    const x=x0+10+u*1000;
    o+=`<circle cx="${x}" cy="${y}" r="10" fill="none" stroke="var(--orange)" stroke-width="2" stroke-dasharray="4 3"/><circle cx="${x}" cy="${y}" r="2.6" fill="var(--orange)"/>`;
    o+=T(x,y-34,l1,"middle",600)+T(x,y-19,l2,"middle",400,.75);
  }
  o+=T(x0+430,y+75,"shift from the trained position (units presumed metres)","end",400,.75);
  $("#roll").innerHTML=o;
})();

/* ---------- explorer data ---------- */
const BASE="put the bowl on the plate";
const PRO={
  src:'LIBERO-PRO v1, Tables 2–5, suite averages. 50 episodes per task. Scale 0–1.',
  models:["OpenVLA","π0","π0.5"], suites:["Spatial","Object","Goal","10"],
  opts:[
   {k:"Original",what:"The standard LIBERO test: the scene and instruction seen in training.",facts:[],s:{},
    d:[[.98,.99,.98,.93],[.97,.98,.92,.82],[.98,.98,.97,.93]]},
   {k:"Object",what:"The manipulated object keeps its place but changes colour, texture or size.",facts:["Example in the paper: red cup → yellow cup"],s:{bowlFill:"var(--orange)",bowlR:19,mark:"bowl"},
    d:[[.97,.98,.96,.81],[.95,.94,.94,.79],[.97,.98,.97,.92]]},
   {k:"Position",what:"Objects start in different places. The instruction is unchanged.",facts:["OpenVLA and π0 fail beyond about 0.2 units of displacement; π0.5 holds to about 0.4"],s:{swap:true,mark:"bowl"},
    d:[[0,0,0,0],[0,0,0,0],[.20,.17,.38,.08]]},
   {k:"Semantic",what:"The instruction is reworded with the same meaning.",facts:["Three paraphrases per task"],s:{},inst:"place the bowl onto the plate",
    d:[[.97,.98,.98,.96],[.97,.90,.93,.82],[.97,.96,.97,.93]]},
   {k:"Task",what:"A new goal, built from objects and actions that appear in training.",facts:["Cannot be combined with other perturbations"],s:{mark:"mug"},inst:"put the mug on the plate",
    d:[[0,0,0,0],[0,0,0,0],[.01,.01,0,.01]]},
   {k:"Environment",what:"The table or surrounding scene is replaced.",facts:["Example: main table → kitchen table"],s:{table:"var(--table2)"},
    d:[[.89,0,.98,.85],[.60,.29,.39,.27],[.46,.73,.46,.46]]}]};
const PM=["OpenVLA","OpenVLA-OFT","OpenVLA-OFT_w","OpenVLA-OFT_m","NORA","WorldVLA","UniVLA","π0","π0-FAST","RIPT-VLA","OpenVLA-OFT+ (trained on Plus data)"];
const PLUS={
  src:'LIBERO-Plus v3, Table 2. Success rate in %. All rows except the last are trained on standard LIBERO only.',
  opts:[
   {k:"Camera",n:1599,what:"The camera moves: farther away, around the scene, or tilted.",facts:["Distance 1.01–2.00×","Position on a sphere","Orientation 2–10°"],s:{cam:true},
    d:[.8,56.4,10.4,55.6,2.2,.1,1.8,13.8,65.1,55.2,92.8]},
   {k:"Robot",n:1550,what:"The arm starts from different joint angles.",facts:["Joint positions perturbed by 0.1–0.5"],s:{grip:[70,150],mark:"grip"},
    d:[3.5,31.9,38.7,21.7,37.0,27.9,46.2,6.0,21.6,31.2,30.3]},
   {k:"Language",n:1537,what:"An LLM rewrites the instruction.",facts:["Distraction: longer, chatty, irrelevant cues","Common sense: objects described indirectly","Reasoning chain"],s:{},inst:"I'm setting up for dinner, so could you take the thing we eat soup from and set it on the plate?",
    d:[23.0,79.5,70.5,81.0,65.1,41.6,69.6,58.8,61.0,77.6,85.8]},
   {k:"Light",n:1142,what:"Lighting changes.",facts:["Diffuse colour, direction, specular, shadows"],s:{dark:true},
    d:[8.1,88.7,76.8,92.7,45.7,43.7,69.0,85.0,73.2,88.4,94.9]},
   {k:"Background",n:1076,what:"Scene theme and table surface are retextured.",facts:["950 textures"],s:{tex:true},
    d:[34.8,93.3,93.6,91.0,58.6,17.1,81.0,81.4,73.2,91.6,93.9]},
   {k:"Noise",n:1601,what:"The camera image is degraded.",facts:["Motion, Gaussian, zoom and glass blur; fog"],s:{blur:true},
    d:[15.2,75.8,49.9,78.6,12.8,10.9,21.2,79.0,74.4,73.5,89.3]},
   {k:"Layout",n:1525,what:"Distractor objects are added, or the target object's pose changes.",facts:["416 distractor assets"],s:{extra:true,bowl:[95,150],mark:"bowl"},
    d:[28.5,74.2,69.9,68.7,62.1,38.0,31.9,68.9,68.8,74.2,77.6]},
   {k:"Total",n:10030,grid:1,what:"All 10,030 perturbed tasks, each changed along one dimension.",facts:["Five difficulty levels","Generated from the 40 standard tasks"],s:{},
    d:[15.6,69.6,55.8,67.9,39.0,25.0,42.9,53.6,61.6,68.4,79.5]}]};
/* LIBERO-OOD: task files from github.com/QuanyiLi/pi0-text-latent 587a6cb; scores from 2505.03500 Table 3 */
const GOS=[["stove",-.41,.21,"fix","t"],["cabinet",.03,-.24,"fix","b"],["wine rack",-.26,-.26,"fix","b"],["plate",.05,-.02,"plate","r"],["wine bottle",-.20,-.05,"item","l"]];
/* Training side for the Goal-scene tests: the two training tasks that share the test's pick spot or its place */
const GOA=()=>tmap([...GOS,["bowl",-.09,0,"bowl","t",2],["cream cheese",-.05,.13,"item","b",2]],0,null,
  [[[-.05,.13],[-.09,0],"seen",8,9],[[-.09,0],[.05,-.02],"seen",9,13]],1);
const GOT=["put the cream cheese in the bowl","put the bowl on the plate"];
const GOALT="Top view of the LIBERO-Goal training scene. Training tasks move the cream cheese into the bowl and the bowl onto the plate.";
const SPA=[["cabinet",.03,-.27,"fix","b"],["plate",.06,.20,"plate","r"],["cookie box",.07,.03,"item","r"],["bowl",.01,.31,"bowl","b"],["bowl",-.075,0,"bowl","t",2]];
const OBJ=(a,b)=>tmap([["basket",0,.26,"basket","b"],[a,-.12,-.24,"item","t",a==="alphabet soup"?2:0],["salad dressing",.05,-.10,"item","t"],["cream cheese",-.15,.06,"item","l"],["milk",.10,-.20,"item","r"],["butter",-.20,-.08,"item","l"],[b,.15,.03,"item","t",b==="alphabet soup"?2:0]],1,null,
  [a==="alphabet soup"?[[-.12,-.24],[0,.26],"seen",9,18]:[[.15,.03],[0,.26],"new",8,18]],1);
const OOD={
  src:'LIBERO-OOD paper (2505.03500), Table 3. Models fine-tuned on LIBERO demonstrations. 10 runs per task with different random seeds, 100 per sub-suite; each sub-suite mixes the groups above (Goal-OOD: 6 new pairings + 4 new objects; Spatial-OOD: the same split). * The paper\'s own methods: for each test task a person names the two training tasks to combine. Scale 0–1.',
  models:["UniVLA","OpenVLA-OFT","π0-FAST","π0","π0, prompt switched halfway *","π0, text-latent interpolation *"],
  cols:["Goal-OOD","Spatial-OOD","All"],
  d:[[.32,.11,.21],[.01,0,.01],[.13,.17,.15],[.02,.16,.09],[.72,.66,.69],[.85,.81,.83]],
  opts:[
   {k:"Goal: new pairing",inst:"put the cream cheese on the plate",
    what:"The LIBERO-Goal scene, unchanged. The cream cheese is picked up in training and the plate is a place in training, but never in the same task.",
    facts:["6 tasks: the cream cheese onto the plate, the stove or the cabinet top; the wine bottle into the bowl, onto the plate or onto the stove","In training the cream cheese only goes into the bowl, and the wine bottle only to the cabinet top or the rack","Objects, positions and camera are those of the training scene"],
    ta:GOT,ma:GOA,altA:GOALT,
    alt:"The same scene. The test task moves the cream cheese onto the plate.",
    m:()=>tmap([...GOS,["bowl",-.09,0,"bowl","t"],["cream cheese",-.05,.13,"item","b",2]],0,null,
      [[[-.05,.13],[.05,-.02],"new",8,13]],1)},
   {k:"Spatial: new pairing",inst:"put the bowl at table center on the stove",
    what:"The LIBERO-Spatial scene with the stove moved. In LIBERO-Spatial every bowl goes onto the plate; the stove and the cabinet top are places only in LIBERO-Goal, a different scene.",
    facts:["6 tasks: the bowl from the table centre, next to the plate or on the cookie box, onto the cabinet top or the stove","The stove is moved 42 cm, to within 7 cm of where it stands in the Goal scene. The ramekin is left out","LIBERO-Goal's “put the bowl on the stove” starts its bowl 1.5 cm from this one and ends 7 cm from this stove"],
    ta:["pick up the black bowl from table center and place it on the plate"],
    altA:"Top view of the LIBERO-Spatial training scene. The training task moves the bowl at the table centre onto the plate.",
    ma:()=>tmap([["stove",-.41,-.14,"fix","b"],...SPA,["ramekin",-.20,.20,"item","l"]],0,null,
      [[[-.075,0],[.06,.20],"seen",9,13]],1),
    alt:"The same scene with the stove moved 42 centimetres and the ramekin left out. The test task moves the bowl at the table centre onto the stove.",
    m:()=>tmap([["stove",-.39,.28,"fix","r"],...SPA],0,null,
      [[[-.075,0],[-.39,.28],"new",9,19]],1)},
   {k:"Object brought in",inst:"put the bbq source on the plate",
    what:"A grocery from the LIBERO-Object scenes is put into the Goal or Spatial scene, where it never appears in training. Other objects may be swapped too.",
    facts:["8 tasks. Goal: the bbq sauce onto the plate, the orange juice onto the stove, the tomato sauce onto the cabinet top, the cream cheese into a basket that replaces the stove. Spatial: the butter, the milk, the chocolate pudding or the orange juice onto the plate","Here the bbq sauce stands where the cream cheese stood, and a cream cheese stands where the bowl stood","The file name, which is the instruction, spells it “bbq source”"],
    ta:GOT,ma:GOA,altA:GOALT,
    alt:"The same scene with a bbq sauce where the cream cheese stood and a cream cheese where the bowl stood. The test task moves the bbq sauce onto the plate.",
    m:()=>tmap([...GOS,["cream cheese",-.09,0,"item","l"],["bbq sauce",-.05,.13,"item","b",2]],0,null,
      [[[-.05,.13],[.05,-.02],"new",8,13]],1)},
   {k:"Object swap",inst:"pick up the alphabet soup and place it in the basket",same:1,
    what:"A LIBERO-Object task with two objects trading places. The named object starts where another one stood, and a different object stands where the named one stood in training.",
    facts:["10 tasks, one per LIBERO-Object task. In the code release, not in the paper's table","The object to pick starts on one of the five spots that no LIBERO-Object task picks from","The instruction is the training instruction"],
    ta:["pick up the alphabet soup and place it in the basket"],
    altA:"Top view of the LIBERO-Object training scene. The training task moves the alphabet soup into the basket.",
    ma:()=>OBJ("alphabet soup","tomato sauce"),
    alt:"The same scene with the alphabet soup and the tomato sauce swapped. The test task moves the alphabet soup into the basket from the tomato sauce's training spot.",
    na:"Not evaluated in the paper: these 10 files are only in its code release.",
    m:()=>OBJ("tomato sauce","alphabet soup")}]};
const B={pro:PRO,plus:PLUS,ood:OOD};
let bench="pro", sel={pro:2,plus:0,ood:0};

/* ---------- scene ---------- */
/* id: suffix that keeps filter and pattern ids unique when several scenes share the page; nolab: no object names */
function scene(s,id,nolab){
  let bowl=s.bowl||[120,120], mug=[250,150];
  if(s.swap){ bowl=[250,150]; mug=[120,120]; }
  const plate=[185,75], grip=s.grip||[185,28];
  const tf=s.cam?'transform="translate(50 34) scale(.72) rotate(-9 180 110)"':'';
  const mk={bowl:bowl,mug:mug,grip:grip}[s.mark];
  let o=`<defs><filter id="bl${id}"><feGaussianBlur stdDeviation="2.6"/></filter>
    <pattern id="tx${id}" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="14" height="14" fill="var(--table2)"/><rect width="7" height="14" fill="var(--table)"/></pattern></defs>`;
  o+=`<g ${tf} ${s.blur?`filter="url(#bl${id})"`:''}>`;
  o+=`<rect x="18" y="14" width="324" height="192" rx="10" fill="${s.tex?`url(#tx${id})`:(s.table||'var(--table)')}"/>`;
  o+=`<rect x="276" y="34" width="52" height="52" rx="6" fill="var(--stove)"/><circle cx="302" cy="60" r="15" fill="none" stroke="var(--muted)" stroke-width="2"/>`;
  o+=`<circle cx="${plate[0]}" cy="${plate[1]}" r="27" fill="var(--plate)" stroke="var(--muted)" stroke-width="1.5"/><circle cx="${plate[0]}" cy="${plate[1]}" r="17" fill="none" stroke="var(--muted)" stroke-width="1"/>`;
  if(s.extra) o+=`<rect x="52" y="52" width="26" height="34" rx="4" fill="var(--aqua)"/><circle cx="215" cy="172" r="12" fill="var(--blue)"/><rect x="292" y="120" width="22" height="22" rx="11" fill="var(--muted)"/>`;
  o+=`<circle cx="${bowl[0]}" cy="${bowl[1]}" r="${s.bowlR||15}" fill="${s.bowlFill||'var(--obj)'}"/><circle cx="${bowl[0]}" cy="${bowl[1]}" r="${(s.bowlR||15)-6}" fill="none" stroke="var(--bg)" stroke-width="1.5" opacity=".6"/>`;
  o+=`<rect x="${mug[0]-11}" y="${mug[1]-11}" width="22" height="22" rx="5" fill="var(--blue)"/><path d="M${mug[0]+11} ${mug[1]-5}h7v10h-7" fill="none" stroke="var(--blue)" stroke-width="3"/>`;
  o+=`<path d="M${grip[0]-10} ${grip[1]+12}v-12h20v12" fill="none" stroke="var(--ink)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><line x1="${grip[0]}" y1="${grip[1]}" x2="${grip[0]}" y2="${grip[1]-14}" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/>`;
  if(mk) o+=`<circle cx="${mk[0]}" cy="${mk[1]+(s.mark==='grip'?4:0)}" r="27" fill="none" stroke="var(--orange)" stroke-width="2" stroke-dasharray="5 4"/>`;
  o+=`</g>`;
  if(s.dark) o+=`<rect x="18" y="14" width="324" height="192" rx="10" fill="#000" opacity=".5"/><path d="M18 14h150l-150 160z" fill="#fff" opacity=".12"/>`;
  const t=(x,y,w,l)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="12.5" font-family="Inter,system-ui,sans-serif" fill="var(--ink2)">${l}</text>`;
  if(!nolab&&!s.cam&&!s.blur&&!s.dark) o+=t(bowl[0],bowl[1]+(s.mark==="bowl"?40:(s.bowlR||15)+13),0,"bowl")+t(mug[0],mug[1]+25,0,"mug")+t(plate[0],plate[1]+41,0,"plate");
  return o;
}

/* ---------- results ---------- */
const bar=(v,max)=>`<div class="track"><div class="fill" style="width:${Math.max(0,v/max*100)}%"></div></div>`;
function results(){
  const b=B[bench], o=b.opts[sel[bench]];
  if(bench==="pro"){
    $("#resT").textContent=`Success rate · ${o.k}`;
    $("#res").innerHTML=`<div class="scroll"><table class="grid"><thead><tr><th>Model</th>${b.suites.map(s=>`<th>${s}</th>`).join("")}</tr></thead><tbody>`+
      b.models.map((m,i)=>`<tr><td>${m}</td>${o.d[i].map(v=>`<td class="c"><div class="cellbar">${bar(v,1)}<span class="num">${v.toFixed(2)}</span></div></td>`).join("")}</tr>`).join("")+`</tbody></table></div>`;
  }else if(bench==="ood"){
    $("#resT").textContent=o.na?`Success rate · ${o.k}`:"Success rate · whole sub-suites";
    $("#res").innerHTML=o.na?`<p class="what" style="margin:0">${o.na}</p>`:`<div class="scroll"><table class="grid"><thead><tr><th>Model</th>${b.cols.map(s=>`<th>${s}</th>`).join("")}</tr></thead><tbody>`+
      b.models.map((m,i)=>`<tr><td>${m}</td>${b.d[i].map(v=>`<td class="c"><div class="cellbar">${bar(v,1)}<span class="num">${v.toFixed(2)}</span></div></td>`).join("")}</tr>`).join("")+`</tbody></table></div>`;
  }else{
    $("#resT").textContent=`Success rate · ${o.k} · ${o.n.toLocaleString("en-US")} tasks`;
    $("#res").innerHTML=PM.map((m,i)=>`<div class="row"><span>${m}</span>${bar(o.d[i],100)}<span class="v num">${o.d[i].toFixed(1)}</span></div>`).join("");
  }
  $("#src").textContent=(bench==="ood"&&o.na)?"":b.src;
}
const BN={pro:"LIBERO-PRO",plus:"LIBERO-Plus",ood:"LIBERO-OOD"};
const esc=t=>t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const cap=(t,chg)=>`<code class="inst${chg?" chg":""}">“${esc(t)}”</code>`;
function sync(){
  const b=B[bench], o=b.opts[sel[bench]];
  document.querySelectorAll(".tab").forEach(t=>t.setAttribute("aria-selected",t.dataset.b===bench));
  $("#opts").innerHTML=b.opts.map((x,i)=>`<button class="opt" id="opt-${bench}-${i}" data-i="${i}" aria-pressed="${i===sel[bench]}">${x.k}</button>`).join("");
  const ood=bench==="ood", vb=ood?"0 0 250 240":"0 0 360 220";
  const svg=(alt,inner)=>`<svg class="scene" viewBox="${vb}" role="img" aria-label="${esc(alt)}">${inner}</svg>`;
  $("#sideA").innerHTML=svg(ood?o.altA:"Standard LIBERO scene: bowl, mug and plate on the table, gripper above",ood?o.ma():scene({},"A"))+
    (ood?o.ta:[BASE]).map(t=>cap(t)).join("");
  $("#lblB").textContent=`${BN[bench]} · ${o.k}`;
  $("#sideB").innerHTML=o.grid
    ?`<div class="thumbs">${b.opts.filter(x=>!x.grid).map((x,i)=>`<figure>${svg(x.k+": "+x.what,scene(x.s,"T"+i,1))}<figcaption>${x.k}</figcaption></figure>`).join("")}</div>`
    :svg(ood?o.alt:`${o.k}: ${o.what}`,ood?o.m():scene(o.s,"B"))+cap(o.inst||BASE,!!o.inst&&!o.same);
  $("#oodKey").hidden=!ood;
  $("#what").textContent=o.what;
  $("#facts").innerHTML=o.facts.map(f=>`<li>${f}</li>`).join("");
  results();
}
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>{bench=t.dataset.b;sync()});
$("#opts").onclick=e=>{const b=e.target.closest(".opt"); if(b){sel[bench]=+b.dataset.i;sync()}};
sync();

/* ---------- index ---------- */
const IDX=[
 ["LIBERO-OOD","2505.03500","May 2025","New combinations of grasp and place locations seen separately in training","20 tasks (10 more in the code)","none"],
 ["LIBERO-PRO","2510.03827","Oct 2025","Object, position, wording, task and environment changes","40 tasks × 5 types","none"],
 ["LIBERO-Plus","2510.13626","Oct 2025","Camera, robot state, language, light, background, noise, layout","10,030 tasks","own:>20,000 trajectories (optional)"],
 ["LIBERO-Mem","2511.11478","Nov 2025","Object memory under partial observability","10 tasks","own:120 per task"],
 ["LIBERO-Elegant","2511.22555","Nov 2025","Execution quality, not only success","8 tasks","own:327 episodes"],
 ["SafeLIBERO","2512.11891","Dec 2025","Obstacle avoidance","32 scenarios","none"],
 ["VLA-Arena","2512.22539","Dec 2025","Safety, distractors, extrapolation, long horizon; new tasks on LIBERO's stack","170 tasks","own:10–50 per task"],
 ["LIBERO-X","2602.06556","Feb 2026","Five cumulative difficulty levels, new scenes","600 tasks, 100 scenes","own:2,520 trajectories"],
 ["LIBERO-Para","2603.28301","Mar 2026","Paraphrased instructions on LIBERO-Goal","4,092 paraphrases","none"],
 ["LIBERO-Safety","2606.23686","Jun 2026","Physical and semantic safety","75 tasks","own:19,664 demos"],
 ["LIBERO-VPro","2609.24350","Sep 2026","Stale, missing or degraded camera frames","3,296 cases","none"],
 ["LIBERO-RIG","2610.18843","Oct 2026","Hardware and setup changes with tasks fixed","210 conditions","none"],
 ["LIBERO-Industry","2610.16782","Oct 2026","Conveyor motion, timing windows, tolerances","216 tasks","own:size not stated"],
 ["LIBERO-PeRM","2610.22372","Oct 2026","User preferences","312 tasks","own:paired demos"],
 ["LIBERO-Dynamic","2610.24579","Oct 2026","Moving targets with inference latency","1,800 conditions","own:9,000 trajectories"],
 ["LIBERO-Pro2.0","2610.24587","Oct 2026","22 static perturbations and 20 runtime interventions","1,648 task instances","own:39,390 trajectories"]];
function idx(f){
  $("#idx tbody").innerHTML=IDX.filter(r=>f==="all"||r[5].startsWith(f)).map(r=>{
    const own=r[5].startsWith("own");
    return `<tr><td><a href="https://arxiv.org/abs/${r[1]}">${r[0]}</a></td><td class="num" style="white-space:nowrap">${r[2]}</td><td>${r[3]}</td><td class="num">${r[4]}</td><td>${own?`<span class="tag own">${r[5].slice(4)}</span>`:`<span class="tag none">None</span>`}</td></tr>`}).join("");
}
$("#chips").onclick=e=>{const c=e.target.closest(".chip"); if(!c)return;
  document.querySelectorAll("#chips .chip").forEach(x=>x.setAttribute("aria-pressed",x===c)); idx(c.dataset.f)};
idx("all");

/* ---------- side by side ---------- */
const GL=[
 ["Simulator","robosuite (MuJoCo), 20 Hz control","PyBullet, 30 Hz control","SAPIEN"],
 ["Robot","Franka Panda, one arm","Franka Panda, one arm","Aloha-AgileX: two 6-DoF arms with grippers, 14-D action. Four other robots are supported"],
 ["Cameras","Third-person and wrist, 128 × 128","Static 200 × 200 and gripper 84 × 84; depth and tactile also recorded","Head camera and two wrist cameras, 320 × 240"],
 ["Training data","50 demonstrations per task, each showing one task with one instruction","About 24 h of teleoperated play, 6 h per table, about 2.4M steps; about 1% labelled with an instruction","Generated by expert programs in simulation. The paper's protocol: 50 clean demonstrations per task. Later papers: 50 clean + 500 randomized per task"],
 ["Tasks","40 in the usual score (130 in all)","34, shared by the four tables","50 two-arm tasks"],
 ["Scenes","One fixed scene per task","Four tables, A to D","One table, 1.2 × 0.7 m; object poses drawn anew every episode"],
 ["Test","50 rollouts per task from a fixed start-state file","1,000 chains of 5 instructions from 192 start states","100 rollouts per task and setting, from seeds training data does not use"],
 ["Instruction at test","The training instruction","One fixed phrasing per task, not in the training labels","Easy: training templates. Hard: held-out templates and object descriptions"],
 ["Score","Success rate","Average tasks completed per chain, 0 to 5","Success rate, Easy and Hard reported separately"],
 ["Fixed at test","Each object starts in its own 2 cm square","A block on the table sits on one of two spots","Easy keeps the training scene's look. Object poses are never fixed"],
 ["Probe with no language (audit)","Spatial 99.0, Object 100.0, Goal 98.8, Long 92.4; within 1 point of the best published result on three suites","ABC→D 3.24, against 4.78 for the best published result","Clean 60.4, Randomized 59.4 under 50 + 500, against 95.8 and 96.1 for the best published result"]];
$("#glanceRows").innerHTML=GL.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("");

/* ---------- CALVIN tables, coordinates in metres (world frame, after the 0.8 scene scaling) ---------- */
const BC={red:"var(--red)",blue:"var(--bblue)",pink:"var(--pink)"};
const ENV={
 A:{role:"Train",tex:"var(--wood-dark)",texName:"Dark wood",door:-.10,lim:.28,drawer:.10,btn:-.28,sw:.30,cab:-.10,reg:[-.20,.35],sl:[[-.32,-.16],[-.05,.13]],blocks:[["pink",5],["red",7],["blue",10]]},
 B:{role:"Train",tex:"var(--wood-light)",texName:"Light wood",door:.088,lim:.304,drawer:.18,btn:.28,sw:-.32,cab:.08,reg:[-.35,.15],sl:[[-.12,.06],[.15,.33]],blocks:[["red",5],["pink",7],["blue",10]]},
 C:{role:"Train",tex:"var(--wood-mid)",texName:"Wood, with a dark-wood door and drawer",door:.06,lim:.24,drawer:.10,btn:-.12,sw:-.32,cab:.08,reg:[0,.35],sl:[[-.12,.06],[.15,.30]],blocks:[["blue",5],["pink",7],["red",10]]},
 D:{role:"Test",tex:"var(--wood-dark)",texName:"Dark wood, a different image from A's",door:-.10,lim:.28,drawer:.18,btn:-.12,sw:.30,cab:-.10,reg:[0,.35],sl:[[-.32,-.16],[-.05,.13]],blocks:[["blue",5],["red",7],["pink",10]]}};
const geo=(k,x0,y1,pad)=>({k,X:x=>pad+(x-x0)*k,Y:y=>pad+(y1-y)*k});
const f1=v=>v.toFixed(1);
function R(g,x0,x1,y0,y1,a){return `<rect x="${f1(g.X(x0))}" y="${f1(g.Y(y1))}" width="${f1((x1-x0)*g.k)}" height="${f1((y1-y0)*g.k)}" ${a}/>`}
function blk(g,c,cm,x,y,deg,a){const w=cm/100*g.k,h=.05*g.k,cx=g.X(x),cy=g.Y(y);
  return `<rect x="${f1(cx-w/2)}" y="${f1(cy-h/2)}" width="${f1(w)}" height="${f1(h)}" rx="1.5" transform="rotate(${-deg} ${f1(cx)} ${f1(cy)})" ${a||`fill="${BC[c]}" stroke="var(--bg)" stroke-width="1"`}/>`}
function tableTop(g,e){
  const s=g.k/250;
  let o=R(g,-.44,.44,-.18,.18,'rx="4" fill="var(--table)"');
  o+=R(g,e.reg[0],e.reg[1],-.15,-.03,'fill="var(--blue-soft)" stroke="var(--blue)" stroke-width="1.2" stroke-dasharray="4 3"');
  o+=R(g,e.drawer-.22,e.drawer+.22,-.205,-.18,'rx="2" fill="var(--stove)"');
  o+=R(g,e.drawer-.05,e.drawer+.05,-.222,-.205,'rx="1.5" fill="var(--ink2)"');
  o+=R(g,e.cab-.26,e.cab+.26,.035,.175,'rx="2" fill="var(--cab)"');
  for(const [a,b] of e.sl) o+=R(g,a,b,.05,.12,'fill="var(--comp)"');
  o+=`<line x1="${f1(g.X(e.door-e.lim))}" y1="${f1(g.Y(.03))}" x2="${f1(g.X(e.door+.28))}" y2="${f1(g.Y(.03))}" stroke="var(--ink2)" stroke-width="1.2"/>`;
  o+=R(g,e.door,e.door+.28,.04,.13,'fill="var(--ink2)" opacity=".55"');
  o+=R(g,e.sw-.04,e.sw+.04,.035,.175,'rx="2" fill="var(--cab)"');
  o+=R(g,e.sw-.018,e.sw+.018,.05,.07,'rx="1" fill="var(--ink)"');
  o+=`<circle cx="${f1(g.X(e.sw))}" cy="${f1(g.Y(.135))}" r="${f1(4.5*s)}" fill="var(--bulb)" stroke="var(--ink)" stroke-width=".8"/>`;
  o+=`<circle cx="${f1(g.X(e.btn))}" cy="${f1(g.Y(-.12))}" r="${f1(6*s)}" fill="var(--panel)" stroke="var(--ink)" stroke-width="1.6"/>`;
  o+=`<circle cx="${f1(g.X(e.btn))}" cy="${f1(g.Y(.16))}" r="${f1(4*s)}" fill="var(--led)" stroke="var(--ink)" stroke-width=".8"/>`;
  return o;
}
const T9=(x,y,s,a="start",op=.8)=>`<text x="${f1(x)}" y="${f1(y)}" text-anchor="${a}" font-size="9.5" font-family="Inter,system-ui,sans-serif" fill="var(--ink)" opacity="${op}">${s}</text>`;
function cmap(n){
  const e=ENV[n], g=geo(250,-.48,.2,8);
  let o=tableTop(g,e);
  o+=`<circle cx="${f1(g.X(-.34))}" cy="${f1(g.Y(-.46))}" r="17" fill="var(--panel)" stroke="var(--muted)" stroke-width="1.5"/>`+T9(g.X(-.34),g.Y(-.46)+3.5,"robot","middle");
  let x=-.04; for(const [c,cm] of e.blocks){o+=blk(g,c,cm,x+cm/200,-.33,0); x+=cm/100+.03}
  o+=T9(g.X(-.04),g.Y(-.40),"blocks");
  const y=-.47; o+=`<path d="M${f1(g.X(.34))} ${f1(g.Y(y)-3)}v6M${f1(g.X(.34))} ${f1(g.Y(y))}H${f1(g.X(.44))}M${f1(g.X(.44))} ${f1(g.Y(y)-3)}v6" stroke="var(--ink2)" stroke-width="1.2" fill="none"/>`+T9(g.X(.39),g.Y(y)-6,"10 cm","middle");
  return `<svg class="cmap" viewBox="0 0 256 196" role="img" aria-label="Top view of CALVIN table ${n}">${o}</svg>`;
}
$("#envs").innerHTML=Object.keys(ENV).map(n=>{const e=ENV[n];
  return `<figure class="${e.role==="Test"?"test":""}">${cmap(n)}<figcaption><b>Table ${n}<span class="role">${e.role==="Test"?"Test only":"Train"}</span></b>
  <span><i class="sw" style="background:${e.tex}"></i>${e.texName}</span>
  <span>Blocks: ${e.blocks.map(([c,cm])=>`${c} ${cm}`).join(", ")} cm</span></figcaption></figure>`}).join("");
const KS=(svg,t)=>`<span><svg width="22" height="14" aria-hidden="true">${svg}</svg>${t}</span>`;
$("#cvKey").innerHTML=
  KS(`<rect x="1" y="1" width="20" height="12" rx="2" fill="var(--cab)"/><rect x="3" y="4" width="7" height="6" fill="var(--comp)"/><rect x="12" y="3" width="8" height="8" fill="var(--ink2)" opacity=".55"/>`,"Cabinet: two compartments, sliding door shown on the right; the line is its track")+
  KS(`<rect x="1" y="4" width="20" height="5" rx="2" fill="var(--stove)"/><rect x="7" y="9" width="8" height="3" rx="1" fill="var(--ink2)"/>`,"Drawer front, under the table top")+
  KS(`<circle cx="7" cy="7" r="5" fill="var(--panel)" stroke="var(--ink)" stroke-width="1.6"/><circle cx="17" cy="7" r="3.5" fill="var(--led)" stroke="var(--ink)" stroke-width=".8"/>`,"Button, toggles the LED")+
  KS(`<rect x="2" y="4" width="8" height="6" rx="1" fill="var(--ink)"/><circle cx="17" cy="7" r="4" fill="var(--bulb)" stroke="var(--ink)" stroke-width=".8"/>`,"Switch, turns on the bulb")+
  KS(`<rect x="1" y="2" width="20" height="10" fill="var(--blue-soft)" stroke="var(--blue)" stroke-width="1.2" stroke-dasharray="4 3"/>`,"Where a block may start");

/* ---------- CALVIN tasks ---------- */
const RBP=["red","blue","pink"], C2=["red","red","blue","blue","pink","pink"];
const CT=[
 ["Rotate",C2,2,"Right or left, block on the table"],
 ["Push",C2,2,"Right or left, block on the table"],
 ["Lift",[...RBP,...RBP,...RBP],3,"From the table, a compartment or the drawer"],
 ["Place",["nb","nb"],2,"The block in hand, into a compartment or the drawer"],
 ["Push into drawer",["nb"],1,"Slide a block off the table into the drawer"],
 ["Stack, unstack",["nb","nb"],2,"The block in hand onto another; take the top one off"],
 ["Sliding door",["fx","fx"],2,"Left or right"],
 ["Drawer",["fx","fx"],2,"Open or close"],
 ["Light bulb",["fx","fx"],2,"On or off, with the switch"],
 ["LED",["fx","fx"],2,"On or off, with the button"]];
$("#cvTasks").innerHTML=CT.map(([n,c,cols,d])=>
  `<div class="grp"><div class="cells cv" style="grid-template-columns:repeat(${cols},15px)">${c.map(k=>`<i class="${k.length<3?k:"c-"+k}"></i>`).join("")}</div><b>${n} <span class="num" style="font-weight:500;color:var(--muted)">· ${c.length}</span></b><span>${d}</span></div>`).join("")+
  `<div class="brace"><span class="key"><i class="c3"></i>Names a block, by colour (21)</span><span class="key nb"><i></i>Acts on a block without naming it (5)</span><span class="key fx"><i></i>Acts on a part of the table (8)</span><span>One square is one task.</span></div>`;

/* ---------- CALVIN chain ---------- */
const CH=[["pull the handle to open the drawer","open_drawer","ok"],["grasp and lift the red block","lift_red_block_table","ok"],["store the grasped block in the drawer","place_in_drawer","ok"],["push the sliding door to the left side","move_slider_left","fail"],["use the switch to turn on the light bulb","turn_on_lightbulb","never"]];
$("#chain").innerHTML=CH.map(([t,id,s],i)=>`<li class="step ${s}"><span class="n">${i+1}</span><code>“${t}”</code><span class="task">${id}</span><span class="out">${s==="ok"?"Done":s==="fail"?"Not done in 360 steps":"Never given"}</span></li>`).join("");

/* ---------- CALVIN block poses on table D ---------- */
(()=>{
  const e=ENV.D, g=geo(300,-.46,.19,8);
  const pink=blk(g,"pink",10,-.24,.092,90);
  let off=tableTop(g,e)+pink;
  for(const [c,cm,x] of [["red",7,.05],["blue",5,.23]]){
    for(const d of [67.5,112.5]) off+=blk(g,c,cm,x,-.12,d,`fill="none" stroke="${BC[c]}" stroke-width="1" stroke-dasharray="3 2"`);
    off+=blk(g,c,cm,x,-.12,90);
  }
  const yd=-.165, a=g.X(.05), b=g.X(.23);
  off+=`<path d="M${f1(a)} ${f1(g.Y(yd))}H${f1(b)}M${f1(a)} ${f1(g.Y(yd)-3)}v6M${f1(b)} ${f1(g.Y(yd)-3)}v6" stroke="var(--ink)" stroke-width="1" fill="none"/>`+T9((a+b)/2,g.Y(yd)-4,"18 cm","middle",1);
  $("#zOff").innerHTML=off;
  let seed=11; const rnd=()=>(seed=(seed*1103515245+12345)%2147483648)/2147483648;
  let red=tableTop(g,e)+pink;
  for(let i=0;i<40;i++) red+=`<circle cx="${f1(g.X(.02+rnd()*.31))}" cy="${f1(g.Y(-.14+rnd()*.10))}" r="2.2" fill="var(--orange)" opacity=".65"/>`;
  red+=blk(g,"red",7,.27,-.07,25)+blk(g,"blue",5,.11,-.10,150);
  $("#zRed").innerHTML=red;
})();

/* ---------- audit result: dumbbells on one 0–5 axis ---------- */
(()=>{
  const AU=[["X-VLA",4.165,3.138,"1.03 (0.89–1.16)","709 → 459"],["GR-1",3.244,2.495,"0.75 (0.62–0.87)","431 → 296"],["RoboFlamingo",2.367,1.869,"0.50 (0.37–0.62)","209 → 145"]];
  const x0=118,x1=520,X=v=>x0+v/5*(x1-x0), PROBE=3.242;
  const T=(x,y,s,a="start",w=400,op=1,sz=12)=>`<text x="${f1(x)}" y="${f1(y)}" text-anchor="${a}" font-size="${sz}" font-weight="${w}" opacity="${op}" font-family="Inter,system-ui,sans-serif" fill="currentColor">${s}</text>`;
  let o="";
  for(let v=0;v<=5;v++) o+=`<line x1="${X(v)}" y1="26" x2="${X(v)}" y2="146" stroke="currentColor" opacity=".12"/>`+T(X(v),164,v,"middle",400,.7);
  o+=`<line x1="${X(PROBE)}" y1="20" x2="${X(PROBE)}" y2="146" stroke="var(--ink2)" stroke-width="1.5" stroke-dasharray="4 3"/>`+T(X(PROBE),14,"probe 3.24","middle",500,.85);
  AU.forEach(([n,a,b],i)=>{const y=46+i*40;
    o+=T(0,y+4,n,"start",500);
    o+=`<line x1="${X(b)}" y1="${y}" x2="${X(a)}" y2="${y}" stroke="currentColor" stroke-width="2" opacity=".35"/>`;
    o+=`<circle cx="${X(b)}" cy="${y}" r="6" fill="var(--orange)" stroke="var(--panel)" stroke-width="2"><title>${n}, redrawn poses: ${b.toFixed(3)}</title></circle>`;
    o+=`<circle cx="${X(a)}" cy="${y}" r="6" fill="var(--blue)" stroke="var(--panel)" stroke-width="2"><title>${n}, official spots: ${a.toFixed(3)}</title></circle>`;
    o+=T(X(b)-11,y+4,b.toFixed(2),"end",400,.85)+T(X(a)+11,y+4,a.toFixed(2),"start",600);
  });
  $("#db").innerHTML=o;
  $("#dbRows").innerHTML=AU.map(([n,a,b,d,f])=>`<tr><td>${n}</td><td class="num">${a.toFixed(3)}</td><td class="num">${b.toFixed(3)}</td><td class="num">${d}</td><td class="num">${f}</td></tr>`).join("");
})();
const RTT=[
 ["Adjust Bottle",81,75,90,56,97,23,97,0,99,3,95,90],
 ["Beat Block Hammer",77,37,43,21,56,3,42,0,72,8,47,42],
 ["Blocks Ranking RGB",3,0,19,5,1,0,0,0,3,0,44,55],
 ["Blocks Ranking Size",0,0,7,1,0,0,1,0,2,0,36,40],
 ["Click Alarmclock",61,12,63,11,32,4,61,5,77,14,64,68],
 ["Click Bell",80,9,44,3,58,3,54,0,90,0,83,81],
 ["Dump Bin Bigbin",64,32,83,24,68,1,49,0,85,53,48,50],
 ["Grab Roller",74,43,96,80,94,25,98,0,98,2,100,100],
 ["Handover Block",45,14,45,8,42,0,10,0,70,0,67,67],
 ["Handover Mic",90,31,98,13,85,0,53,0,100,3,86,80],
 ["Hanging Mug",23,16,11,3,7,0,8,0,17,1,8,16],
 ["Lift Pot",72,9,84,36,88,0,39,0,97,0,99,100],
 ["Move Can Pot",25,12,58,21,22,4,39,0,70,6,69,61],
 ["Move Pillbottle Pad",8,0,21,1,0,0,1,0,41,0,63,59],
 ["Move Playingcard Away",43,11,53,22,36,0,47,0,68,3,83,86],
 ["Move Stapler Pad",2,0,0,2,0,0,1,0,12,0,6,5],
 ["Open Laptop",59,32,85,46,56,0,49,0,82,7,96,95],
 ["Open Microwave",37,20,80,50,86,0,5,0,61,22,14,21],
 ["Pick Diverse Bottles",2,0,27,6,7,0,6,0,52,1,83,68],
 ["Pick Dual Bottles",42,13,57,12,31,0,24,0,60,1,97,93],
 ["Place A2B Left",3,1,31,1,1,0,2,0,46,2,30,24],
 ["Place A2B Right",1,1,27,6,0,0,13,0,49,0,25,32],
 ["Place Bread Basket",10,2,17,4,6,0,14,0,26,1,83,80],
 ["Place Bread Skillet",5,1,23,1,7,0,11,0,19,0,80,69],
 ["Place Burger Fries",50,27,80,4,49,0,72,0,72,18,91,94],
 ["Place Can Basket",19,6,41,5,1,0,18,0,67,2,50,57],
 ["Place Cans Plasticbox",6,5,34,2,16,0,40,0,48,3,97,97],
 ["Place Container Plate",78,17,88,45,72,1,41,0,86,1,62,51],
 ["Place Dual Shoes",4,4,15,0,9,0,8,0,13,0,24,27],
 ["Place Empty Cup",56,7,37,11,61,0,37,0,65,1,90,87],
 ["Place Fan",12,2,20,10,1,0,3,0,36,1,42,43],
 ["Place Mouse Pad",1,0,7,1,0,0,0,0,4,1,15,20],
 ["Place Object Basket",33,17,16,2,15,0,15,0,65,0,56,62],
 ["Place Object Scale",1,0,10,0,0,0,1,0,15,0,50,47],
 ["Place Object Stand",15,5,36,11,1,0,22,0,60,0,79,76],
 ["Place Phone Stand",15,6,35,7,2,0,13,0,44,2,58,58],
 ["Place Shoe",35,7,28,6,5,0,23,0,58,2,69,67],
 ["Press Stapler",41,24,62,29,31,6,6,0,69,3,99,92],
 ["Put Bottles Dustbin",21,4,54,13,27,1,22,0,60,21,9,7],
 ["Put Object Cabinet",33,18,68,18,15,0,42,0,72,1,50,36],
 ["Rotate QRcode",50,5,68,15,1,0,13,0,74,1,42,44],
 ["Scan Object",4,1,18,1,2,0,9,0,31,1,82,77],
 ["Shake Bottle Horizontally",84,51,99,51,63,4,59,18,100,25,100,100],
 ["Shake Bottle",74,45,97,60,74,10,65,8,98,19,100,100],
 ["Stack Blocks Three",2,0,17,0,0,0,0,0,1,0,28,31],
 ["Stack Blocks Two",21,2,42,1,25,0,7,0,24,0,62,58],
 ["Stack Bowls Three",51,17,66,24,48,0,63,0,57,5,20,25],
 ["Stack Bowls Two",76,30,91,41,82,0,61,0,83,6,60,58],
 ["Stamp Seal",1,0,3,4,2,0,2,0,18,0,33,29],
 ["Turn Switch",35,15,27,23,5,2,36,1,46,8,46,45]];

/* ---------- RoboTwin 2.0: place_shoe, top view to scale (world metres, table 1.2 × 0.7 m centred at the origin, robot side at y < 0) ---------- */
(()=>{
  const k=400, g={X:x=>12+(x+.62)*k, Y:y=>12+(.47-y)*k};
  const F=v=>v.toFixed(1);
  const Rr=(x0,x1,y0,y1,a)=>`<rect x="${F(g.X(x0))}" y="${F(g.Y(y1))}" width="${F((x1-x0)*k)}" height="${F((y1-y0)*k)}" ${a}/>`;
  const T=(x,y,s,a="start",w=400,op=1,sz=11)=>`<text x="${F(x)}" y="${F(y)}" text-anchor="${a}" font-size="${sz}" font-weight="${w}" opacity="${op}" font-family="Inter,system-ui,sans-serif" fill="var(--ink)">${s}</text>`;
  const mk=s=>()=>(s=(s*1103515245+12345)%2147483648)/2147483648;
  // start rule from envs/place_shoe.py: x∈[−.25,.25], y∈[−.10,.05]; if |x|<.15 and y>0, redraw y∈[−.10,0]; reject if within 15 cm of the centre
  const draw=r=>{for(;;){const x=-.25+r()*.5;let y=-.10+r()*.15;while(Math.abs(x)<.15&&y>0)y=-.10+r()*.10;if(x*x+y*y>=.0225)return [x,y]}};
  const lobe=s=>{const p=[[.15,.05],[.25,.05],[.25,-.10],[Math.sqrt(.0125),-.10]];
    for(let i=1;i<=12;i++){const a=Math.atan2(-.10,Math.sqrt(.0125))*(1-i/12);p.push([.15*Math.cos(a),.15*Math.sin(a)])}
    return `<path d="M${p.map(([x,y])=>F(g.X(s*x))+" "+F(g.Y(y))).join("L")}Z" fill="var(--blue-soft)" stroke="var(--blue)" stroke-width="1.2" stroke-dasharray="4 3"/>`};
  const r1=mk(5), starts=Array.from({length:50},()=>draw(r1));
  // illustrative distractors: anywhere on the table, kept off the mat area and away from the shoe region
  const r2=mk(23), clut=[];
  while(clut.length<10){const rad=.03+r2()*.035,x=-.59+rad+r2()*(1.18-2*rad),y=-.34+rad+r2()*(.68-2*rad);
    if(x>-.36&&x<.36&&y>-.21&&y<.16)continue; if(Math.abs(x)<.26&&y<.27)continue; if(x>.06&&y>.15)continue; if(y<-.25)continue;
    if(clut.some(([a,b,c])=>Math.hypot(a-x,b-y)<c+rad+.03))continue; clut.push([x,y,rad])}
  const INST={easy:["Use the left arm to grab the black and white shoe and put it on the mat","Seen template and seen description of shoe model 0, as in the training data"],
              hard:["Grab the black shoe with white midsole from the table and set it on the mat","Unseen template and unseen description of the same shoe"]};
  const SIDE={easy:["Plain table and wall","Fixed lighting","Table top at 0.74 m","No distractors","Instruction from the seen templates"],
              hard:["Table and wall textures from the unseen texture set","Random light colour, type, intensity and position","Table top lowered by 0–3 cm","Up to 10 distractor objects anywhere on the table","Instruction from the unseen templates"]};
  function map(mode){
    const hard=mode==="hard";
    let o=`<defs><pattern id="rtTex" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="12" height="12" fill="var(--table)"/><rect width="5" height="12" fill="var(--orange-soft)"/></pattern>
      <pattern id="rtWall" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><rect width="8" height="8" fill="var(--soft)"/><rect width="3" height="8" fill="var(--blue-soft)"/></pattern>
      <radialGradient id="rtLight" cx=".28" cy=".3" r=".75"><stop offset="0" stop-color="var(--bulb)" stop-opacity=".38"/><stop offset="1" stop-color="var(--bulb)" stop-opacity="0"/></radialGradient></defs>`;
    o+=Rr(-.62,.62,.40,.47,`fill="${hard?"url(#rtWall)":"var(--panel)"}" stroke="var(--line)"`)+T(g.X(-.6),g.Y(.425)+4,"wall","start",500,.75,10);
    o+=Rr(-.6,.6,-.35,.35,`rx="3" fill="${hard?"url(#rtTex)":"var(--table)"}" stroke="var(--ink)" stroke-opacity=".25"`);
    if(hard) o+=Rr(-.6,.6,-.35,.35,`rx="3" fill="url(#rtLight)"`);
    o+=`<line x1="${F(g.X(0))}" y1="${F(g.Y(.35))}" x2="${F(g.X(0))}" y2="${F(g.Y(-.35))}" stroke="var(--ink)" stroke-opacity=".3" stroke-dasharray="2 4"/>`;
    o+=`<circle cx="${F(g.X(0))}" cy="${F(g.Y(0))}" r="${F(.15*k)}" fill="none" stroke="var(--ink)" stroke-opacity=".3" stroke-dasharray="3 3"/>`;
    o+=lobe(1)+lobe(-1);
    o+=Rr(-.13,.13,-.13,-.03,`rx="2" fill="var(--bblue)" fill-opacity=".35" stroke="var(--bblue)" stroke-width="1.2"`)+T(g.X(0),g.Y(-.08)+4,"mat","middle",600,.9);
    for(const [x,y] of starts) o+=`<circle cx="${F(g.X(x))}" cy="${F(g.Y(y))}" r="2.4" fill="var(--blue)"/>`;
    if(hard) for(const [x,y,r] of clut) o+=`<circle cx="${F(g.X(x))}" cy="${F(g.Y(y))}" r="${F(r*k)}" fill="var(--muted)" fill-opacity=".55" stroke="var(--ink)" stroke-opacity=".35"/>`;
    o+=T(g.X(0),g.Y(.15)-6,"no start within 15 cm of the centre","middle",400,.75,10);
    o+=T(g.X(-.19),g.Y(.05)-6,"shoe starts here","middle",600,.9,10);
    o+=`<rect x="${F(g.X(.5))}" y="${F(g.Y(.27))}" width="${F(.02*k)}" height="${F(.02*k)}" fill="var(--ink)" fill-opacity=".75"/>`+T(g.X(.48),g.Y(.26)+3,"LIBERO's 2 cm start square","end",500,.85,10);
    o+=T(g.X(-.3),g.Y(-.35)-8,"left arm picks","middle",400,.7,10)+T(g.X(.3),g.Y(-.35)-8,"right arm picks","middle",400,.7,10);
    const yb=g.Y(-.35)+14;
    o+=`<path d="M${F(g.X(-.6))} ${F(yb)}H${F(g.X(.6))}M${F(g.X(-.6))} ${F(yb-3)}v6M${F(g.X(.6))} ${F(yb-3)}v6" stroke="var(--ink)" stroke-opacity=".6" fill="none"/>`;
    o+=T(g.X(0),yb+14,"1.2 m · robot side","middle",500,.8,10.5);
    $("#rtMap").innerHTML=o;
    $("#rtInst").textContent="“"+INST[mode][0]+"”";
    $("#rtInstNote").textContent=INST[mode][1];
    $("#rtSide").innerHTML=SIDE[mode].map(s=>`<li>${s}</li>`).join("");
    document.querySelectorAll("#rtMode .chip").forEach(c=>c.setAttribute("aria-pressed",c.dataset.m===mode));
  }
  $("#rtMode").onclick=e=>{const c=e.target.closest(".chip"); if(c) map(c.dataset.m)};
  map("easy");
})();

/* ---------- RoboTwin 2.0 scores ---------- */
(()=>{
  // averages, paper Table 10 (single-task, 50 clean demonstrations per task, 100 rollouts per setting)
  const AV=[["DP3",55.2,5.0],["π0",46.4,16.3],["RDT",34.5,13.7],["ACT",29.7,1.7],["DP",28.0,0.6]];
  const x0=70,x1=520,X=v=>x0+v/100*(x1-x0);
  const T=(x,y,s,a="start",w=400,op=1,sz=12)=>`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${a}" font-size="${sz}" font-weight="${w}" opacity="${op}" font-family="Inter,system-ui,sans-serif" fill="currentColor">${s}</text>`;
  let o="";
  for(let v=0;v<=100;v+=20) o+=`<line x1="${X(v)}" y1="18" x2="${X(v)}" y2="198" stroke="currentColor" opacity=".12"/>`+T(X(v),216,v,"middle",400,.7);
  AV.forEach(([n,e,h],i)=>{const y=34+i*38;
    o+=T(0,y+4,n,"start",500);
    o+=`<line x1="${X(h)}" y1="${y}" x2="${X(e)}" y2="${y}" stroke="currentColor" stroke-width="2" opacity=".35"/>`;
    o+=`<circle cx="${X(h)}" cy="${y}" r="6" fill="var(--orange)" stroke="var(--panel)" stroke-width="2"><title>${n}, Hard: ${h}%</title></circle>`;
    o+=`<circle cx="${X(e)}" cy="${y}" r="6" fill="var(--blue)" stroke="var(--panel)" stroke-width="2"><title>${n}, Easy: ${e}%</title></circle>`;
    o+=T(X(e)+11,y+4,e.toFixed(1),"start",600)+T(X(h)+(X(e)-X(h)>60?11:-11),y-9,h.toFixed(1),X(e)-X(h)>60?"start":"end",400,.85,11);
  });
  $("#rtDb").innerHTML=o;

  // per task
  const M=[["RDT",1,"Easy","Hard"],["π0",3,"Easy","Hard"],["ACT",5,"Easy","Hard"],["DP",7,"Easy","Hard"],["DP3",9,"Easy","Hard"],["Audit probe, 50 + 500",11,"Clean","Rand."]];
  let m=1, sort="az";
  $("#rtModel").innerHTML=M.map(([n],i)=>`<button class="chip" data-i="${i}" aria-pressed="${i===m}">${n}</button>`).join("");
  function tiles(){
    const [n,j,a,b]=M[m];
    let rows=RTT.map(r=>[r[0],r[j],r[j+1]]);
    if(sort==="drop") rows.sort((p,q)=>(q[1]-q[2])-(p[1]-p[2])||q[1]-p[1]); else if(sort==="first") rows.sort((p,q)=>q[1]-p[1]);
    $("#rtKey").innerHTML=`<span><svg width="14" height="14" aria-hidden="true"><rect y="4" width="14" height="6" rx="3" fill="var(--blue)"/></svg>${a}</span><span><svg width="14" height="14" aria-hidden="true"><rect y="4" width="14" height="6" rx="3" fill="var(--orange)"/></svg>${b}</span><span>Success rate, %, 100 rollouts per task and setting</span>`;
    $("#rtTasks").innerHTML=rows.map(([t,e,h])=>`<div class="rt-tile"><b>${t}</b>
      <div class="rt-row"><span>${a[0]}</span><span class="rt-bar"><i style="width:${e}%;background:var(--blue)"></i></span><span class="num">${e}</span></div>
      <div class="rt-row"><span>${b[0]}</span><span class="rt-bar"><i style="width:${h}%;background:var(--orange)"></i></span><span class="num">${h}</span></div></div>`).join("");
    document.querySelectorAll("#rtModel .chip").forEach((c,i)=>c.setAttribute("aria-pressed",i===m));
    document.querySelectorAll("#rtSort .chip").forEach(c=>c.setAttribute("aria-pressed",c.dataset.s===sort));
  }
  $("#rtModel").onclick=e=>{const c=e.target.closest(".chip"); if(c){m=+c.dataset.i; tiles()}};
  $("#rtSort").onclick=e=>{const c=e.target.closest(".chip"); if(c){sort=c.dataset.s; tiles()}};
  tiles();
})();
