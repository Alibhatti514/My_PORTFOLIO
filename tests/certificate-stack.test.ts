import test from 'node:test';
import assert from 'node:assert/strict';
import {certificateStackPose,nearestCertificateAngle,nearestCertificateRotation} from '../src/scene/certificateStack.ts';

test('all nine certificate centres occupy one circumference, including the selected certificate',()=>{
 for(let active=0;active<9;active++){
  const poses=Array.from({length:9},(_,i)=>certificateStackPose(i,active,9));
  assert.equal(new Set(poses.map(p=>`${p.x},${p.y}`)).size,9);
  for(const p of poses)assert.ok(Math.abs(Math.hypot(parseFloat(p.x),parseFloat(p.y))-33)<1e-9);
  assert.equal(poses[active].scale,1);assert.equal(poses[active].z,80);
  assert.ok(poses.filter((_,i)=>i!==active).every(p=>p.scale<1&&p.z<80&&p.z>0));
  const angles=poses.map(p=>(p.angle%(2*Math.PI)+2*Math.PI)%(2*Math.PI)).sort((a,b)=>a-b);
  for(let i=0;i<9;i++)assert.ok(Math.abs((angles[(i+1)%9]-angles[i]+2*Math.PI)%(2*Math.PI)-2*Math.PI/9)<1e-9);
 }
});
test('rear sheets follow tangent directions, and wrapping navigates forward and backward by 40 degrees',()=>{
 for(let active=0;active<9;active++)for(let i=0;i<9;i++){
  const p=certificateStackPose(i,active,9);
  if(i===active){assert.equal(p.rotateZ,0);continue;}
  const rotation=p.rotateZ*Math.PI/180;
  assert.ok(Math.abs(Math.cos(p.angle)*Math.cos(rotation)+Math.sin(p.angle)*Math.sin(rotation))<1e-9);
 }
 const step=2*Math.PI/9;
 assert.ok(Math.abs(nearestCertificateAngle(8*step,0)-9*step)<1e-9);
 assert.ok(Math.abs(nearestCertificateAngle(0,8*step)+step)<1e-9);
 assert.ok(Math.abs(nearestCertificateRotation(350,0)-360)<1e-9);
 assert.ok(Math.abs(nearestCertificateRotation(10,350)+10)<1e-9);
});
