import * as THREE from 'three';

export class Portrait {
  group = new THREE.Group();
  private portrait?: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private points?: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private disposed = false;
  ready: Promise<void>;
  private count:number;
  constructor(count: number) {
    this.count=count;
    this.ready = new Promise((resolve, reject) => {
      new THREE.TextureLoader().load('/assets/ali-bhatti-portrait.png', texture => {
        if(this.disposed) { texture.dispose(); resolve(); return; }
        texture.colorSpace=THREE.SRGBColorSpace;
        const material=new THREE.ShaderMaterial({
          uniforms:{uMap:{value:texture},uMorph:{value:0}}, transparent:true, depthWrite:false,toneMapped:false,
          vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
          fragmentShader:`uniform sampler2D uMap; uniform float uMorph; varying vec2 vUv;
            float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
            void main(){ vec4 c=texture2D(uMap,vUv); float cut=vUv.y*.65+hash(floor(vUv*420.))*.35;
              float keep=1.-smoothstep(cut-.018,cut+.018,uMorph*1.08); gl_FragColor=vec4(c.rgb,c.a*keep*smoothstep(.15,.22,vUv.y));
              #include <tonemapping_fragment>
              #include <colorspace_fragment>
            }`,
        });
        this.portrait=new THREE.Mesh(new THREE.PlaneGeometry(8.4,8.4,1,1),material);
        this.portrait.position.set(0,-.66,.6);this.portrait.renderOrder=2;this.group.add(this.portrait);
        this.createParticles(texture.image as HTMLImageElement); resolve();
      },undefined,reject);
    });
  }
  private createParticles(image: HTMLImageElement) {
    const canvas=document.createElement('canvas');canvas.width=220;canvas.height=220;
    const ctx=canvas.getContext('2d',{willReadFrequently:true})!;ctx.drawImage(image,0,0,220,220);
    const pixels=ctx.getImageData(0,0,220,220).data;
    const candidates:number[]=[];for(let i=0;i<220*220;i++) if(pixels[i*4+3]>160)candidates.push(i);
    const code=document.createElement('canvas');code.width=880;code.height=420;
    const c=code.getContext('2d',{willReadFrequently:true})!;c.font='600 36px monospace';c.fillStyle='white';
    ['const idea = {','  human: true,','  possibility: Infinity','};','','build(idea);'].forEach((s,i)=>c.fillText(s,40,48+i*58));
    const codePixels=c.getImageData(0,0,880,420).data;const targets:number[]=[];
    for(let y=0;y<420;y+=2)for(let x=0;x<880;x+=2)if(codePixels[(y*880+x)*4+3]>100)targets.push(y*880+x);
    const positions=new Float32Array(this.count*3),dest=new Float32Array(this.count*3),colors=new Float32Array(this.count*3),delays=new Float32Array(this.count);
    for(let i=0;i<this.count;i++){
      const source=candidates[(i*173+31)%candidates.length];const x=source%220,y=Math.floor(source/220);
      positions.set([(x/220-.5)*8.4,(.5-y/220)*8.4-.66,.62],i*3);
      const target=targets[(i*37)%targets.length];dest.set([((target%880)/880-.5)*7.1+.7,(.5-Math.floor(target/880)/420)*2.55-1.03,-.3],i*3);
      const color=new THREE.Color(pixels[source*4]/255,pixels[source*4+1]/255,pixels[source*4+2]/255).convertSRGBToLinear();colors.set([color.r,color.g,color.b],i*3);
      delays[i]=((1-y/220)*.65+((i*31)%100)/100*.35)*.5;
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));geo.setAttribute('aTarget',new THREE.BufferAttribute(dest,3));geo.setAttribute('aColor',new THREE.BufferAttribute(colors,3));geo.setAttribute('aDelay',new THREE.BufferAttribute(delays,1));
    const mat=new THREE.ShaderMaterial({uniforms:{uMorph:{value:0},uExit:{value:0},uPixelRatio:{value:Math.min(devicePixelRatio,1.5)}},transparent:true,depthWrite:false,
      vertexShader:`attribute vec3 aTarget; attribute vec3 aColor; attribute float aDelay; uniform float uMorph; uniform float uExit; uniform float uPixelRatio; varying vec3 vColor; varying float vAlpha;
        void main(){float t=smoothstep(aDelay,aDelay+.5,uMorph); vec3 p=mix(position,aTarget,t);
          p.x+=sin(t*3.14159265)*sin(position.y*.6)*1.6; p.z+=sin(t*3.14159265)*(.9+aDelay*2.);
          p.y+=sin(t*3.14159265)*.4; p.y-=uExit*3.;p.x*=1.-uExit*.7;
          vColor=mix(aColor,vec3(.09,.06,.25),t);vAlpha=smoothstep(0.,.13,uMorph)*(1.-uExit);
          vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=clamp(30./-mv.z,1.4,4.)*uPixelRatio;gl_Position=projectionMatrix*mv;}`,
      fragmentShader:`varying vec3 vColor; varying float vAlpha; void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(vColor,vAlpha*smoothstep(.5,.15,d));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`});
    this.points=new THREE.Points(geo,mat);this.points.frustumCulled=false;this.group.add(this.points);
  }
  update(progress:number,mobile:boolean) {
    this.group.visible=progress<2.01;
    this.group.scale.setScalar(mobile?.88:1);
    if(this.portrait){this.portrait.material.uniforms.uMorph.value=Math.min(1,progress*1.18);this.portrait.visible=progress<.9;}
    if(this.points){this.points.material.uniforms.uMorph.value=Math.min(1,progress*1.12);this.points.material.uniforms.uExit.value=Math.max(0,Math.min(1,progress-1));}
  }
  dispose(){this.disposed=true;}
}
