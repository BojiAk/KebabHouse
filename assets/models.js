import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const loader = new GLTFLoader();
const items = [];
const clock = new THREE.Clock();

async function createScene(id, path, type) {
  const host = document.getElementById(id);
  if (!host) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({alpha:true, antialias:true, powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = type === 'rotor' ? 1.55 : 1.9;
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, .01, 100);
    scene.add(new THREE.HemisphereLight(0xffeee0, 0x55311f, 3.2));
    const key = new THREE.DirectionalLight(0xffe4c0, 4.2); key.position.set(4, 7, 8); scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 1.6); fill.position.set(-5, 1, 5); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xff7636, 3.8); rim.position.set(-5, 3, -6); scene.add(rim);
    const gltf = await loader.loadAsync(path);
    const model = gltf.scene;
    model.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const dims = box.getSize(new THREE.Vector3());
    // Center geometry in a pivot so rotation never makes the model orbit away.
    // Normalize after orienting: GLB object-space bounds are not its displayed bounds.
    // Rotate the kebab from its Z-up authoring orientation, then re-center the
    // transformed geometry, preventing an offset below the viewport.
    if(type==='wrap') model.rotation.x = -Math.PI / 2;
    model.updateMatrixWorld(true);
    const oriented = new THREE.Box3().setFromObject(model);
    const orientedCenter = oriented.getCenter(new THREE.Vector3());
    const holder = new THREE.Group();
    holder.add(model);
    holder.position.sub(orientedCenter);
    const pivot = new THREE.Group(); pivot.add(holder); scene.add(pivot);
    const max = Math.max(dims.x, dims.y, dims.z) || 1;
    const desired = type === 'rotor' ? 5.0 : 4.4;
    pivot.scale.setScalar(desired/max);
    // The kebab file is built along the Z axis. Tilt it to present its opening, not its base.
    const state = { host, scene, camera, renderer, pivot, type, yaw:type==='rotor' ? -.22 : Math.PI+.22, pitch:type==='rotor' ? .03 : -.08, zoom:1, targetYaw:type==='rotor' ? -.22 : Math.PI+.22, targetPitch:type==='rotor' ? .03 : -.08, targetZoom:1, dragging:false, lastX:0, lastY:0, visible:true };
    const resize = () => {
      const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
      renderer.setSize(w,h,false);camera.aspect=w/h;
      camera.fov=type==='rotor' ? (w<600?38:32) : (w<600?42:34);
      camera.position.set(0,type==='rotor' ? .15 : .55,type==='rotor' ? 7.3 : 9.5);
      camera.lookAt(0,0,0);camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);ro.observe(host);resize();
    items.push(state);

  } catch(err) {
    console.error('Nu s-a putut încărca modelul '+path,err);
    renderer?.dispose();renderer?.domElement?.remove();
    host.setAttribute('aria-label','Modelul 3D nu s-a încărcat; este afișată imaginea demonstrativă.');
  }
}

await Promise.all([createScene('rotisserie-scene','assets/rotisserie.glb','rotor'),createScene('wrap-scene','assets/kebab-model.glb','wrap')]);
let time=0;
function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.05);time+=dt;
  for(const s of items){
    const r=s.host.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)continue;
    const scroll=THREE.MathUtils.clamp((innerHeight*.5-(r.top+r.height*.5))/Math.max(innerHeight,1),-1,1);
    if(s.type==='rotor'){
      if(!reduce)s.targetYaw+=dt*.16;
      s.targetPitch=.03;
      s.pivot.position.y=(reduce?0:Math.sin(time*.75)*.035)+.23;
    } else {
      // Keep the open, appetizing side facing the viewer; gentle bob only.
      s.pivot.position.y=(reduce?0:Math.sin(time*.9)*.055)+.12;
    }
    s.yaw=THREE.MathUtils.damp(s.yaw,s.targetYaw,5,dt);
    s.pitch=THREE.MathUtils.damp(s.pitch,s.targetPitch,5,dt);
    s.zoom=THREE.MathUtils.damp(s.zoom,s.targetZoom,5,dt);
    s.pivot.rotation.set(s.pitch,s.yaw,0,'YXZ');
    s.pivot.scale.setScalar((s.type==='rotor'?5.0:4.4)*s.zoom);
    s.renderer.render(s.scene,s.camera);
    if (!s.host.classList.contains('ready')) s.host.classList.add('ready');
  }
}
animate();
document.addEventListener('visibilitychange',()=>{if(document.hidden)clock.stop();else clock.start()});
