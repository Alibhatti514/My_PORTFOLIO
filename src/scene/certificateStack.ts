/** All nine centres stay on one circumference. The selected slot is the lower focal point. */
export function certificateStackPose(index: number, active: number, count: number) {
  const angle = (index-active) * (2*Math.PI/count) + Math.PI/2;
  const front = index === active;
  return { angle, x:`${Math.cos(angle)*33}%`,y:`${Math.sin(angle)*33}%`,
    z:front?80:10+Math.cos(angle)*6,rotateX:front?-1:-Math.sin(angle)*8,
    rotateY:front?-2:-Math.cos(angle)*10,
    rotateZ:front?0:(angle+Math.PI/2)*180/Math.PI,scale:front?1:.5263157895 };
}
export function nearestCertificateAngle(current: number, target: number) {
  return current+Math.atan2(Math.sin(target-current),Math.cos(target-current));
}
export function nearestCertificateRotation(current: number, target: number) {
  return current+Math.atan2(Math.sin((target-current)*Math.PI/180),Math.cos((target-current)*Math.PI/180))*180/Math.PI;
}
