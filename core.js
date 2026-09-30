'use strict';
const VEHICLES={bike:{name:'Bike elétrica',range:40,speed:{eco:16,normal:20,sport:24}},scooter:{name:'Patinete',range:25,speed:{eco:12,normal:16,sport:20}},moto:{name:'Moto elétrica',range:70,speed:{eco:25,normal:32,sport:38}}};
function vehicleModel(c){const factor=Math.max(.88,1+(c.weight-70)*.004)*({eco:.85,normal:1,sport:1.25}[c.mode]);const adjustedRange=c.range/factor;return {adjustedRange,availableRange:adjustedRange*c.battery/100,percentPerKm:100/adjustedRange,speed:VEHICLES[c.vehicle].speed[c.mode]};}
function calculateEnergy(legs,c,hasStop,roundTrip){
 if(!Array.isArray(legs)||legs.length!==(hasStop?2:1)+(roundTrip?1:0)||legs.some(l=>!Number.isFinite(l.distance)||l.distance<0)||!Number.isFinite(c.range)||c.range<=0)throw new Error('Dados de rota inválidos.');
 const model=vehicleModel(c);let battery=c.battery,reachable=true,chargeAdded=0,chargeWait=0;const states=[];
 for(let i=0;i<legs.length;i++){
  const used=legs[i].distance/1000*model.percentPerKm,requiredRemaining=battery-used,reached=reachable&&requiredRemaining>=-1e-9;
  states.push({distance:legs[i].distance,used,before:battery,remaining:reached?Math.max(0,requiredRemaining):0,requiredRemaining,reached,minutes:legs[i].distance/1000/model.speed*60});battery=reached?Math.max(0,requiredRemaining):requiredRemaining;reachable=reached;
  if(hasStop&&i===0&&reachable){chargeAdded=Math.max(0,c.chargeTarget-battery);battery+=chargeAdded;chargeWait=c.chargeMinutes;}
 }
 const destinationIndex=hasStop?1:0,outbound=states.slice(0,destinationIndex+1),destination=states[destinationIndex],returned=roundTrip?states[destinationIndex+1]:null,critical=returned||destination;
 const lowest=Math.min(...states.filter(s=>s.reached).map(s=>s.remaining));
 return {states,model,destination,returned,chargeAdded,chargeWait,outboundMinutes:outbound.reduce((s,l)=>s+l.minutes,0)+chargeWait,totalMinutes:states.reduce((s,l)=>s+l.minutes,0)+chargeWait,reachable:critical.reached,lowReserve:critical.reached&&lowest<15,totalDistance:legs.reduce((s,l)=>s+l.distance,0),outboundDistance:outbound.reduce((s,l)=>s+l.distance,0),returnDistance:returned?.distance||0};
}
