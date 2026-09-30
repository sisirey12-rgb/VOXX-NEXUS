import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.181.2/build/three.module.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.181.2/examples/jsm/loaders/GLTFLoader.js';
import {EffectComposer} from 'https://cdn.jsdelivr.net/npm/three@0.181.2/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'https://cdn.jsdelivr.net/npm/three@0.181.2/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'https://cdn.jsdelivr.net/npm/three@0.181.2/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'https://cdn.jsdelivr.net/npm/three@0.181.2/examples/jsm/postprocessing/OutputPass.js';

const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0x02050a,.055);
const camera=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,.1,100);
camera.position.set(0,.15,8.2);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.45:1.8));
renderer.setSize(innerWidth,innerHeight); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.18;
document.querySelector('#scene').appendChild(renderer.domElement);
const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),1.15,.7,.72); composer.addPass(bloom); composer.addPass(new OutputPass());
scene.add(new THREE.AmbientLight(0x26384a,1.2));
const key=new THREE.PointLight(0x54dfff,55,16); key.position.set(2,2,4); scene.add(key);
const fill=new THREE.PointLight(0x704dff,45,12); fill.position.set(-3,-1,2); scene.add(fill);
const rim=new THREE.PointLight(0x2b8fff,35,14); rim.position.set(3,-2,-3); scene.add(rim);

const root=new THREE.Group(); root.rotation.set(.08,-.25,0); scene.add(root);
let model=null;
const fallback=new THREE.Group(); root.add(fallback);
function makeFallback(){
 const mats=[new THREE.MeshPhysicalMaterial({color:0x091522,metalness:1,roughness:.18}),new THREE.MeshPhysicalMaterial({color:0x46dcff,metalness:.35,roughness:.1,emissive:0x0a6bff,emissiveIntensity:3}),new THREE.MeshPhysicalMaterial({color:0x663dff,metalness:.3,roughness:.12,emissive:0x4318ff,emissiveIntensity:2.2})];
 for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(1.45-i*.3,3),mats[i]);fallback.add(m)}
 for(let i=0;i<3;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(1.8+i*.22,.025,10,128),mats[i+1]);r.rotation.set(i*.8,i*.55,i*.3);fallback.add(r)}
 for(let i=0;i<18;i++){const a=i*Math.PI*2/18;const g=new THREE.BoxGeometry(.16,.5,.16);const m=new THREE.Mesh(g,mats[i%2]);m.position.set(Math.cos(a)*1.6,Math.sin(a)*1.6,Math.sin(i)*.18);m.rotation.z=a;fallback.add(m)}
}
makeFallback();
new GLTFLoader().load('./assets/voxx-nexus-core-v3.glb',g=>{model=g.scene; model.scale.setScalar(1.18); model.rotation.set(.12,0,0); root.add(model); fallback.visible=false;},undefined,()=>{fallback.visible=true});

// orbital rings + data particles
const orbitGroup=new THREE.Group(); root.add(orbitGroup);
for(let i=0;i<5;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(2.0+i*.34,.012+(i%2)*.009,8,160),new THREE.MeshBasicMaterial({color:i%2?0x8c64ff:0x55e9ff,transparent:true,opacity:.32}));ring.rotation.set(.45+i*.37,.25+i*.23,i*.6);orbitGroup.add(ring)}
const particleCount=innerWidth<700?650:1400; const pos=new Float32Array(particleCount*3); const col=new Float32Array(particleCount*3);
for(let i=0;i<particleCount;i++){const r=THREE.MathUtils.lerp(3.2,12,Math.random());const a=Math.random()*Math.PI*2;const y=(Math.random()-.5)*8;pos[i*3]=Math.cos(a)*r;pos[i*3+1]=y;pos[i*3+2]=Math.sin(a)*r;const c=Math.random()>.82?new THREE.Color(0x9a69ff):new THREE.Color(0x51ddff);col.set([c.r,c.g,c.b],i*3)}
const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));pg.setAttribute('color',new THREE.BufferAttribute(col,3));const pts=new THREE.Points(pg,new THREE.PointsMaterial({size:innerWidth<700?.018:.025,vertexColors:true,transparent:true,opacity:.65,depthWrite:false}));scene.add(pts);

let targetX=0,targetY=0,scroll=0; let currentX=0,currentY=0;
addEventListener('pointermove',e=>{targetX=(e.clientX/innerWidth-.5);targetY=(e.clientY/innerHeight-.5)});
addEventListener('scroll',()=>scroll=scrollY);
const sections=[...document.querySelectorAll('.panel')];
const links=[...document.querySelectorAll('.rail a')];
const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.querySelectorAll('.reveal').forEach(x=>x.classList.add('show'));const id=e.target.id;links.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+id))}}),{threshold:.18});
sections.forEach(s=>obs.observe(s));
const menu=document.querySelector('#menuBtn'),rail=document.querySelector('#rail');menu.onclick=()=>rail.classList.toggle('open');links.forEach(l=>l.onclick=()=>rail.classList.remove('open'));

let t0=performance.now();
function animate(t){requestAnimationFrame(animate);const time=t*.001;currentX+=(targetX-currentX)*.035;currentY+=(targetY-currentY)*.035;
 root.rotation.y += .0025; root.rotation.x=.08+currentY*.08; root.position.x=currentX*.55; root.position.y=currentY*.3;
 orbitGroup.rotation.z+=.0018; orbitGroup.rotation.x=Math.sin(time*.16)*.08;
 pts.rotation.y=time*.008; pts.rotation.x=Math.sin(time*.1)*.015;
 key.position.x=2+currentX*2; key.position.y=2-currentY*1.5;
 const sectionIndex=Math.min(sections.length-1,Math.floor((scroll+innerHeight*.35)/innerHeight));
 const phase=sectionIndex/(sections.length-1);
 camera.position.x+=(currentX*.7-camera.position.x)*.025;
 camera.position.y+=((.1+currentY*.35+Math.sin(phase*Math.PI)*.18)-camera.position.y)*.025;
 camera.position.z+=(8.2+phase*1.7-camera.position.z)*.018;
 camera.lookAt(0,0,0);
 composer.render();}
animate(0);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.45:1.8));renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);bloom.setSize(innerWidth,innerHeight)});

// boot screen
const boot=document.querySelector('#boot'),pct=document.querySelector('#bootPct'),bar=document.querySelector('.boot-line span');let p=0;const timer=setInterval(()=>{p=Math.min(100,p+Math.round(Math.random()*16)+4);pct.textContent=p+'%';bar.style.width=p+'%';if(p>=100){clearInterval(timer);setTimeout(()=>{boot.style.opacity='0';boot.style.visibility='hidden'},450)}},90);
