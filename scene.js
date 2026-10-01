import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';

const stage=document.getElementById('logoStage');
const canvas=document.getElementById('vxCanvas');
if(!stage||!canvas) throw new Error('VX stage missing');

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(32,1,.1,100);
camera.position.set(0,0,7.4);
const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.15;

scene.add(new THREE.AmbientLight(0xffffff,.7));
const key=new THREE.DirectionalLight(0xdffaff,3.2); key.position.set(3,4,5); scene.add(key);
const rim=new THREE.PointLight(0x64eaff,18,12); rim.position.set(-3,1,3); scene.add(rim);
const fill=new THREE.PointLight(0x8a7cff,8,10); fill.position.set(3,-2,1); scene.add(fill);

const logo=new THREE.Group(); scene.add(logo);
const pieces=[];
const loader=new GLTFLoader();
let ready=false;
let targetBlast=0, blast=0, pointerX=0, pointerY=0;
let accent=new THREE.Color('#8eeeff');

function ease(t){return t*t*(3-2*t)}
function seed(n){return Math.sin(n*999.17)*43758.5453%1}

loader.load('./assets/voxx-vx.glb',(gltf)=>{
  const root=gltf.scene;
  root.traverse((o)=>{
    if(!o.isMesh) return;
    o.material=o.material.clone();
    o.material.metalness=.92;
    o.material.roughness=.18;
    o.material.color.set(accent);
    o.material.emissive=accent.clone().multiplyScalar(.12);
    o.material.emissiveIntensity=.7;
    o.castShadow=false;
    o.receiveShadow=false;
    const p=o.parent;
    pieces.push({
      obj:o,
      parent:p,
      home:o.position.clone(),
      homeRot:o.rotation.clone(),
      homeScale:o.scale.clone(),
      dir:new THREE.Vector3((seed(pieces.length*3+1)-.5)*3.8,(seed(pieces.length*3+2)-.5)*3.2,(seed(pieces.length*3+3)-.5)*3.0),
      rot:new THREE.Vector3((seed(pieces.length*4+1)-.5)*2,(seed(pieces.length*4+2)-.5)*2,(seed(pieces.length*4+3)-.5)*2)
    });
  });
  logo.add(root);
  root.scale.setScalar(1.35);
  ready=true;
},undefined,(err)=>console.error('VOXX VX GLB failed to load',err));

function resize(){
  const r=stage.getBoundingClientRect();
  renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);
  camera.aspect=Math.max(1,r.width)/Math.max(1,r.height); camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage); resize();

stage.addEventListener('pointerenter',()=>targetBlast=1);
stage.addEventListener('pointerleave',()=>targetBlast=0);
stage.addEventListener('pointerdown',()=>targetBlast=1);
window.addEventListener('pointerup',()=>{if(!stage.matches(':hover')) targetBlast=0});
stage.addEventListener('pointermove',(e)=>{
  const r=stage.getBoundingClientRect();
  pointerX=(e.clientX-r.left)/r.width-.5;
  pointerY=(e.clientY-r.top)/r.height-.5;
});
window.addEventListener('scroll',()=>{
  const y=scrollY/Math.max(1,document.body.scrollHeight-innerHeight);
  logo.rotation.z += (y*.18-logo.rotation.z)*.04;
  logo.position.y += (y*.65-logo.position.y)*.04;
},{passive:true});

window.addEventListener('voxx-theme',(e)=>{
  const c=e.detail?.accent || '#8eeeff'; accent.set(c);
  pieces.forEach(p=>{p.obj.material.color.set(accent);p.obj.material.emissive.copy(accent).multiplyScalar(.12)});
  rim.color.copy(accent);
});

const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.05);
  blast += (targetBlast-blast)*Math.min(1,dt*8.5);
  const b=ease(blast);
  logo.rotation.x += ((-pointerY*.13)-logo.rotation.x)*Math.min(1,dt*4);
  logo.rotation.y += ((pointerX*.2)-logo.rotation.y)*Math.min(1,dt*4);
  logo.position.x += (pointerX*.10-logo.position.x)*Math.min(1,dt*4);
  logo.position.y += (Math.sin(performance.now()*.0007)*.035-logo.position.y*.04)*dt*8;
  logo.rotation.z += dt*.035*(1-b);
  if(ready) pieces.forEach((p,i)=>{
    const epos=p.home.clone().addScaledVector(p.dir,b);
    p.obj.position.lerp(epos,Math.min(1,dt*12));
    p.obj.rotation.x += (p.homeRot.x+p.rot.x*b-p.obj.rotation.x)*Math.min(1,dt*10);
    p.obj.rotation.y += (p.homeRot.y+p.rot.y*b-p.obj.rotation.y)*Math.min(1,dt*10);
    p.obj.rotation.z += (p.homeRot.z+p.rot.z*b-p.obj.rotation.z)*Math.min(1,dt*10);
    p.obj.scale.lerp(p.homeScale.clone().multiplyScalar(1+b*.035),Math.min(1,dt*10));
  });
  renderer.render(scene,camera);
}
animate();
