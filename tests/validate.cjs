const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=__dirname+'/../';const ctx=vm.createContext({});vm.runInContext(fs.readFileSync(base+'core.js','utf8')+';globalThis.model=vehicleModel;globalThis.energy=calculateEnergy;',ctx);
const c={vehicle:'bike',mode:'normal',range:100,weight:70,battery:60,chargeTarget:80,chargeMinutes:60},legs=(...d)=>d.map(n=>({distance:n*1000}));const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
let r=ctx.energy(legs(10,20),c,false,true);near(r.destination.remaining,50);near(r.returned.remaining,30);near(r.totalDistance,30000);
r=ctx.energy(legs(10,20),{...c,battery:25},false,true);assert.equal(r.destination.reached,true);assert.equal(r.returned.reached,false);
r=ctx.energy(legs(20,30,40),{...c,battery:30},true,true);near(r.states[0].remaining,10);near(r.destination.remaining,50);near(r.returned.remaining,10);near(r.chargeAdded,70);near(r.totalMinutes,330);
r=ctx.energy(legs(20,2,2),{...c,battery:10},true,true);assert.equal(r.reachable,false);assert.equal(r.chargeAdded,0);assert.equal(r.chargeWait,0);assert.ok(r.states.every(l=>!l.reached));
r=ctx.energy(legs(10,10),{...c,battery:80,chargeTarget:60},true,false);near(r.chargeAdded,0);near(r.destination.remaining,60);near(r.chargeWait,60);
r=ctx.energy(legs(10),{...c,battery:10},false,false);near(r.destination.remaining,0);assert.equal(r.lowReserve,true);
r=ctx.energy(legs(0,10),{...c,battery:0},true,false);near(r.destination.remaining,70);near(r.chargeWait,60);
r=ctx.energy(legs(1),{...c,battery:0},false,false);assert.equal(r.reachable,false);
assert.ok(ctx.model({...c,weight:140}).availableRange<ctx.model(c).availableRange);assert.ok(ctx.model({...c,mode:'sport'}).availableRange<ctx.model(c).availableRange);assert.ok(ctx.model({...c,mode:'eco'}).availableRange>ctx.model(c).availableRange);
assert.throws(()=>ctx.energy(legs(-1),c,false,false));assert.throws(()=>ctx.energy(legs(1),{...c,range:0},false,false));
const html=fs.readFileSync(base+'index.html','utf8'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'Duplicate DOM IDs');const js=fs.readFileSync(base+'app.js','utf8');for(const m of js.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.includes(m[1]),'Missing '+m[1]);for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){if(!/^(https?:|data:)/.test(m[1]))assert.ok(fs.existsSync(base+m[1]),'Missing asset '+m[1]);}
console.log('PASS: 12 battery/charging/boundary checks, input references, unique IDs, local assets.');
