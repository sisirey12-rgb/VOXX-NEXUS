import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js";
import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/controls/OrbitControls.js";
import {GLTFLoader} from "https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/loaders/GLTFLoader.js";
import {EffectComposer} from "https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/postprocessing/RenderPass.js";
import {UnrealBloomPass} from "https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/postprocessing/UnrealBloomPass.js";

const canvas=document.querySelector("#webgl");
const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;toneMapExposure=1;
const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0x02040a,.045);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,100);camera.position.set(0,.1,7.4);

const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),1.15,.75,.18);
composer.addPass(bloom);

scene.add(new THREE.AmbientLight(0x26476d,1.3));
const key=new THREE.PointLight(0x2de0ff,35,18);key.position.set(3,3,4);scene.add(key);
const fill=new THREE.PointLight(0x8c50ff,28,18);fill.position.set(-4,-2,2);scene.add(fill);

const nexus=new THREE.Group();scene.add(nexus);
let asset;
new GLTFLoader().load("./assets/voxx-core.gltf",g=>{
  asset=g.scene; asset.scale.setScalar(1.35); nexus.add(asset);
  asset.traverse(o=>{
    if(o.isMesh){
      o.material= new THREE.MeshPhysicalMaterial({
        vertexColors:true,metalness:.9,roughness:.16,emissive:o.name.includes("Inner")?0x3800aa:0x003d88,
        emissiveIntensity:1.3,clearcoat:1,clearcoatRoughness:.12
      });
    }
  });
},undefined,()=>{ /* visual fallback remains below */ });

const fallback=new THREE.Mesh(new THREE.IcosahedronGeometry(1.15,2),
  new THREE.MeshPhysicalMaterial({color:0x0a2852,metalness:.9,roughness:.14,emissive:0x064b98,emissiveIntensity:1.3,wireframe:false}));
nexus.add(fallback);

const shaderUniforms={uTime:{value:0},uColorA:{value:new THREE.Color("#11dfff")},uColorB:{value:new THREE.Color("#804cff")}};
const shellMat=new THREE.ShaderMaterial({
 uniforms:shaderUniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
 vertexShader:`varying vec3 vPos;varying vec3 vNormal;uniform float uTime;void main(){vPos=position;vNormal=normal;vec3 p=position+normal*sin(uTime*1.7+position.y*5.0)*0.035;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
 fragmentShader:`varying vec3 vPos;varying vec3 vNormal;uniform vec3 uColorA;uniform vec3 uColorB;uniform float uTime;void main(){float edge=pow(1.0-max(dot(normalize(vNormal),normalize(cameraPosition-vPos)),0.0),2.2);float bands=0.5+0.5*sin(vPos.y*9.0-uTime*3.0);vec3 c=mix(uColorA,uColorB,bands);gl_FragColor=vec4(c,edge*.75);}`
});
const shell=new THREE.Mesh(new THREE.IcosahedronGeometry(1.42,3),shellMat);nexus.add(shell);

const rings=new THREE.Group();nexus.add(rings);
for(let i=0;i<7;i++){
 const r=new THREE.Mesh(new THREE.TorusGeometry(1.65+i*.13,.008,8,180),
   new THREE.MeshBasicMaterial({color:i%2?0x8555ff:0x22dfff,transparent:true,opacity:.48,blending:THREE.AdditiveBlending}));
 r.rotation.set(Math.random()*2,Math.random()*2,Math.random()*2);r.userData.speed=(i%2?-.0012:.0015)*(1+i*.12);rings.add(r);
}

const pCount=2600,pPos=new Float32Array(pCount*3);
for(let i=0;i<pCount;i++){const r=THREE.MathUtils.randFloat(3.2,16),a=Math.random()*Math.PI*2;pPos[i*3]=Math.cos(a)*r;pPos[i*3+1]=THREE.MathUtils.randFloatSpread(12);pPos[i*3+2]=THREE.MathUtils.randFloat(-8,3);}
const pg=new THREE.BufferGeometry();pg.setAttribute("position",new THREE.BufferAttribute(pPos,3));
scene.add(new THREE.Points(pg,new THREE.PointsMaterial({color:0x4fc9ff,size:.014,transparent:true,opacity:.6,blending:THREE.AdditiveBlending})));

const controls=new OrbitControls(camera,renderer.domElement);
controls.enableZoom=false;controls.enablePan=false;controls.enableDamping=true;controls.dampingFactor=.05;controls.autoRotate=false;controls.minPolarAngle=1.15;controls.maxPolarAngle=2.0;
let targetCam=new THREE.Vector3(0,.1,7.4), targetLook=new THREE.Vector3(0,0,0), scroll=0;
const sections=[...document.querySelectorAll(".scene-section")];
const mode=document.querySelector("#mode"),pct=document.querySelector("#progress");
const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)mode.textContent=e.target.dataset.mode}),{threshold:.45});sections.forEach(s=>obs.observe(s));

function updateChoreography(){
 const max=document.documentElement.scrollHeight-innerHeight;scroll=max?scrollY/max:0;pct.textContent=Math.round(scroll*100).toString().padStart(3,"0")+"%";
 const y=scroll*Math.PI*2.7;
 nexus.rotation.y=y*.55;nexus.rotation.z=Math.sin(y*.7)*.12;
 const tx=Math.sin(y*.8)*.9, ty=Math.cos(y*.55)*.55;
 targetCam.set(tx,ty,7.4-Math.sin(y*.7)*.65);targetLook.set(Math.sin(y)*.3,Math.cos(y*.7)*.2,0);
}
addEventListener("scroll",updateChoreography,{passive:true});updateChoreography();

let mx=0,my=0,tx=0,ty=0;
addEventListener("pointermove",e=>{tx=(e.clientX/innerWidth-.5)*.7;ty=(e.clientY/innerHeight-.5)*.45});
const clock=new THREE.Clock();
function animate(){
 requestAnimationFrame(animate);const t=clock.getElapsedTime();shaderUniforms.uTime.value=t;
 mx+=(tx-mx)*.035;my+=(ty-my)*.035;
 nexus.position.x=mx*.35;nexus.position.y=my*.2;
 camera.position.lerp(targetCam,.025);controls.target.lerp(targetLook,.025);controls.update();
 fallback.visible=!asset;
 fallback.rotation.x=t*.25;fallback.rotation.y=t*.45;
 shell.rotation.y=-t*.15;
 rings.children.forEach(r=>r.rotation.z+=r.userData.speed);
 pg.rotation.y=t*.008;
 composer.render();
}
animate();

addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);bloom.setSize(innerWidth,innerHeight)});

window.addEventListener("load",()=>setTimeout(()=>{const l=document.querySelector("#loader");l.style.opacity=0;setTimeout(()=>l.remove(),900)},1200));

document.querySelector("#form").addEventListener("submit",e=>{
 e.preventDefault();document.querySelector("#status").textContent="Brief captured locally — connect your email/CRM endpoint before launch.";
});
