import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

const mobile=matchMedia('(max-width:900px)').matches;
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const webgl=document.querySelector('#webgl');
const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0x090909,mobile?.028:.018);
const camera=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,.1,100);
camera.position.set(0,0,8.4);
const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.2:1.6));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.1;
webgl.appendChild(renderer.domElement);
const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),mobile?.18:.28,.65,.92));
composer.addPass(new OutputPass());

scene.add(new THREE.AmbientLight(0xffffff,.7));
const key=new THREE.DirectionalLight(0xffe2a0,3.5); key.position.set(4,5,6); scene.add(key);
const rim=new THREE.PointLight(0xc7e7ff,8,14); rim.position.set(-4,1,3); scene.add(rim);

const sculpture=new THREE.Group();
scene.add(sculpture);
const loader=new GLTFLoader();
loader.load('./assets/voxx-vx-sculpture.glb',g=>{
  g.scene.traverse(o=>{if(o.isMesh&&o.material){o.material.metalness=.8;o.material.roughness=.25}});
  g.scene.scale.setScalar(mobile?.82:1.02);
  sculpture.add(g.scene);
  document.querySelector('#loader')?.classList.add('done');
  setTimeout(()=>document.querySelector('#loader')?.remove(),700);
},undefined,()=>{document.querySelector('#loader small').textContent='VOXX NEXUS / READY';setTimeout(()=>document.querySelector('#loader')?.classList.add('done'),700)});

// restrained architectural line field
const lineGroup=new THREE.Group(); scene.add(lineGroup);
for(let i=0;i<12;i++){
  const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-8+(i*1.45),-5,-2),new THREE.Vector3(-4+(i*1.45),5,-2)]);
  const m=new THREE.LineBasicMaterial({color:0x7a7a7a,transparent:true,opacity:.055});
  lineGroup.add(new THREE.Line(g,m));
}
const pCount=mobile?180:430; const pos=new Float32Array(pCount*3);
for(let i=0;i<pCount;i++){pos[i*3]=(Math.random()-.5)*15;pos[i*3+1]=(Math.random()-.5)*9;pos[i*3+2]=(Math.random()-.5)*5-2;}
const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
const pts=new THREE.Points(pg,new THREE.PointsMaterial({color:0xd9a82b,size:mobile?.014:.018,transparent:true,opacity:.28,depthWrite:false}));scene.add(pts);

const pointer=new THREE.Vector2(); const smooth=new THREE.Vector2();
addEventListener('pointermove',e=>{pointer.x=e.clientX/innerWidth*2-1;pointer.y=-(e.clientY/innerHeight*2-1)});

const cards=[...document.querySelectorAll('.contact-card')];
cards.forEach(card=>{
  card.addEventListener('pointermove',e=>{
    if(!matchMedia('(pointer:fine)').matches)return;
    const r=card.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width-.5; const y=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`perspective(900px) rotateX(${(-y*3.5).toFixed(2)}deg) rotateY(${(x*4.5).toFixed(2)}deg) translateZ(3px)`;
  });
  card.addEventListener('pointerleave',()=>card.style.transform='');
});

const menu=document.querySelector('#menu'), mobileMenu=document.querySelector('#mobileMenu');
menu.addEventListener('click',()=>mobileMenu.classList.add('open'));
document.querySelector('#closeMenu').addEventListener('click',()=>mobileMenu.classList.remove('open'));
mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobileMenu.classList.remove('open')));

const sections=[...document.querySelectorAll('main section')];
const indexLinks=[...document.querySelectorAll('.side-index a')];
function updateIndex(){const y=scrollY+innerHeight*.45;let idx=0;sections.forEach((s,i)=>{if(y>=s.offsetTop)idx=i});indexLinks.forEach((a,i)=>a.classList.toggle('active',i===idx));}
addEventListener('scroll',updateIndex,{passive:true});updateIndex();

let last=performance.now();
function frame(ms){
  const t=ms*.001; last=ms;
  smooth.lerp(pointer,reduced?0:.035);
  const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
  const p=scrollY/max;
  const hero=document.querySelector('#home'); const heroP=Math.max(0,Math.min(1,scrollY/Math.max(1,hero.offsetHeight)));
  // The sculpture is a quiet art-direction element, never a dashboard/core engine.
  sculpture.rotation.y=(reduced?0:t*.08)+smooth.x*.12;
  sculpture.rotation.x=smooth.y*.04+Math.sin(t*.45)*.018;
  sculpture.position.x=smooth.x*(mobile?.1:.28);
  sculpture.position.y=.05-smooth.y*(mobile?.06:.18)-heroP*.55;
  sculpture.position.z=-.2-heroP*.55;
  sculpture.scale.setScalar((mobile?.82:1.02)*(1-heroP*.12));
  key.position.x=4+smooth.x*2; key.position.y=4-smooth.y*2;
  rim.position.x=-4-smooth.x*1.5;
  pts.rotation.y=t*.008; pts.rotation.z=Math.sin(t*.08)*.015;
  lineGroup.rotation.z=Math.sin(t*.04)*.015;
  camera.position.x+=(smooth.x*(mobile?.12:.32)-camera.position.x)*.03;
  camera.position.y+=(smooth.y*(mobile?.08:.18)-camera.position.y)*.03;
  camera.position.z+=(8.4-heroP*.45-camera.position.z)*.025;
  camera.lookAt(smooth.x*.05,-heroP*.12,-.2);
  composer.render(); requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(max-width:900px)').matches?1.2:1.6));renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight)});
