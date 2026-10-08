const D=require(process.env.DUMP_DIR+"/rules.js").__dump;
const out={roster:[],party:[],enemy:[],persona:[]};
const FAMS=Object.keys(D.FAMILY), PARTY=["ELF","PIXIE","CU SITH"];
const isTok=s=>/^[a-z]{2,8}$/.test(s)||["LAW","CHAOS","NEUTRAL"].includes(s);
const LAB={ASK:["Question","If YES","If NO"],BANTER_ASK:["Offer","If YES","If NO"],DEMON_ASK:["Question","(want)","Liked reply","Disliked reply"],mend:["Question","If YES","If NO"]};
function walk(v,lab,cb,path=[]){
  if(v==null||typeof v==="number"||typeof v==="boolean")return;
  if(typeof v==="string"){if(!isTok(v))cb(path.join(" / ")||lab,v);return}
  if(Array.isArray(v)){v.forEach((x,i)=>walk(x,lab,cb,path.concat(v.length>1&&v.every(y=>typeof y==="string")?[]:[path.length?`#${i+1}`:`#${i+1}`])));return}
  for(const k of Object.keys(v))walk(v[k],lab,cb,path.concat(k));
}
function emit(table,who,group,name,v,labels){
  const rows=out[table];
  const ind=(a,i)=>a;
  if(labels){ // list of tuples [q,[..],[..]] or flat tuple
    const items=Array.isArray(v[0])||(typeof v[0]==="string"&&v.length>1&&typeof v[1]!=="string"&&false)?v:[v];
    items.forEach((t,n)=>{t.forEach((x,i)=>{ if(labels[i]==="(want)")return; const arr=Array.isArray(x)?x.filter(y=>typeof y==="string"):typeof x==="string"&&!isTok(x)?[x]:[]; arr.forEach(line=>rows.push([who,group,`${name}: ${labels[i]}${items.length>1?` (set ${n+1})`:""}`,line]))})});
    return;
  }
  walk(v,name,(sub,line)=>rows.push([who,group,sub?`${name}: ${sub}`:name,line]));
}
const TOP=[["PARTY_TALK","Idle chatter"],["PARTY_HEAT","Noise warnings"],["PARTY_TIRED","Tired of talking"],["SNAP","Snaps at KURA"],["SNATCH","Snatches an item"],["GRIEF","Grieves a broken item"],["QUIT","Leaves the party"],["CONFIDE","Confides"],["DRINK_REACT","Reacts to KURA drinking"],["LOOPED","KURA looping / searching too long"],["ASK","Asks a question"],["BANTER_ASK","Offers to help"]];
for(const [k,name] of TOP){const m=D[k];
  for(const who of Object.keys(m)){
    if(/^banter:/.test(who))continue;
    const grp=PARTY.includes(who)?"Party":D.PROGRAMS.includes(who)?"Program":FAMS.includes(who)?"Family":null; if(!grp)continue;
    const tbl=grp==="Family"?"enemy":"party";
    const lab=k==="ASK"||k==="BANTER_ASK"?LAB[k]:null;
    emit(tbl,who,grp,name,m[who],lab);
  }}
// family-level tables for enemies
for(const [k,name] of [["FAMILY_TALK","Idle chatter"],["FAMILY_HEAT","Noise warnings"],["FAMILY_TIRED","Tired of talking"]])for(const f of FAMS)emit("enemy",f,"Family",name,D[k][f]);
for(const f of FAMS)for(const [k,v] of Object.entries(D.VOICE[f]))emit("enemy",f,"Family","Voice - "+k,v);
for(const f of FAMS)emit("enemy",f,"Family","Asks a gift (ASK)",D.DEMON_ASK[f],LAB.DEMON_ASK.length?null:null)
for(const f of FAMS){D.DEMON_ASK[f].forEach((t,n)=>{[[0,"Question"],[2,"Liked reply"],[3,"Disliked reply"]].forEach(([i,l])=>{if(typeof t[i]==="string"&&!isTok(t[i]))out.enemy.push([f,"Family","Demon question: "+l+` (set ${n+1})`,t[i]])})})}
// remove the bad generic DEMON_ASK dump above (first loop) - rebuild cleanly
out.enemy=out.enemy.filter(r=>!/^Asks a gift/.test(r[2]));
// persona sheet
for(const [k,name] of [["SILENCE","Reaction to KURA's silence"],["LEAVE_NO","Walks away after NO"],["SILENT_PARTY","Reacts to silence (party)"]])for(const p of Object.keys(D[k]))emit("persona",p,"Persona",name,D[k][p]);
LAB.mend; emit("persona","(all)","Persona","Final chance",D.ASK.mend,LAB.mend);
// roster
const PERSONA={ELF:D.PARTY_PERSONA.ELF,PIXIE:D.PARTY_PERSONA.PIXIE,"CU SITH":D.PARTY_PERSONA["CU SITH"]};
for(const n of PARTY)out.roster.push([n,"Party member","folklore",D.alignOf(n),PERSONA[n],""]);
for(const n of D.PROGRAMS)out.roster.push([n,"Program (recruitable)","data",D.alignOf(n),"",D.PROGRAM_JOB[n]||""]);
for(const f of FAMS)for(const n of D.FAMILY[f]){if(PARTY.includes(n))continue;out.roster.push([n,"Enemy",f,D.alignOf(n),D.PERSONA_OF[f].join(" / "),n==="WORM"||n==="KITSUNE.EXE"||n==="VENDOR"||n==="PAGER GHOUL"?"alignment differs from its family":""])}
out.roster.push(["ATOM SLASHER","Unique enemy","—","—","—","Does not talk"]);
// last words, by family (shared by every enemy of that family); CU SITH gets wordless lines
for(const f of FAMS)for(const l of D.LAST_WORDS[f]||[])out.enemy.push([f,"Family","Last words",l]);
for(const l of D.LAST_ANY||[])for(const f of FAMS)out.enemy.push([f,"Family","Last words",l]);
for(const l of D.LAST_BEAST||[])out.party.push(["CU SITH","Party","Last words (wordless)",l]);
out.personaOf=D.PERSONA_OF;
require("fs").writeFileSync(process.env.OUT_DIR+"/rows.json",JSON.stringify(out));
for(const k of ["roster","party","enemy","persona"])console.log(k,out[k].length);
console.log(JSON.stringify(D.PROGRAM_JOB).slice(0,300));
