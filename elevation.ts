import { PCFSoftShadowMap, DirectionalLight, Scene, PerspectiveCamera, WebGLRenderer, BufferAttribute, BufferGeometry, MeshPhongMaterial, Mesh, AmbientLight } from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';


type Location = {
  latitude: number,
  longitude: number,
  elevation: number
};

const elevationAPiUrl = 'http://localhost:1234/elevations.json';

const getElevations = function(): Promise<any> {
  return new Promise((resolve, reject) =>
    fetch(elevationAPiUrl)
      .then(response => response.json())
      .then(resolve)
      .catch(error => reject(error)));
};


const location2vertex = function(l: Location): Array<number> {
  const r: number = 2 + l.elevation / 7000;
  const latRadians: number = l.latitude * Math.PI / 180;
  const lonRadians: number = l.longitude * Math.PI / 180;
  const vertex = [
    r * Math.cos(latRadians) * Math.cos(lonRadians),
    r * Math.cos(latRadians) * Math.sin(lonRadians),
    r * Math.sin(latRadians)
  ];
  return vertex;
};


const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const light1 = new DirectionalLight(0xFFFFFF, 1);
light1.position.set(-1, 2, 4);
light1.shadow.mapSize.width = 8192;
light1.shadow.mapSize.height = 8192;
light1.castShadow = true;
scene.add(light1);
const light2 = new AmbientLight(0xFFFFFF, .3);
scene.add(light2);
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
//renderer.shadowMap.type = PCFSoftShadowMap;
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
const controls = new TrackballControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.rotateSpeed = .1;
controls.zoomSpeed = 0.5;
controls.panSpeed = 0.1;
controls.keys = ['KeyA', 'KeyS', 'KeyD'];


const computeIndices = function(n: number, m: number): Array<number> {
  let result = [];
  for (let row = 0; row < m - 1; row++) {
    for (let col = 0; col < n - 1; col++) {
      result = result.concat([
        row * n + col + 1,
        row * n + col,
        (row + 1) * n + col,

        (row + 1) * n + col + 1,
        row * n + col + 1,
        (row + 1) * n + col
      ]);
    }
  }
  return result;
};


// whole world view
camera.position.z = 5;


// centred on UK
camera.position.x = -0.09195594223398357;
camera.position.y = 1.8426236013197486;
camera.position.z = 1.327364264585299;
camera.rotation.x = -0.9523924208079326;
camera.rotation.y = -0.04746069682089011;
camera.rotation.z = -0.06488203924640336;


let mesh: Mesh;

getElevations()
  .then(locationsWithElevations => {
    const geometry = new BufferGeometry();

    const xyzs = [];
    for (let row of locationsWithElevations.response) {
      for (let cell of row) {
        xyzs.push(location2vertex(cell))
      }
    }

    const vertices = new Float32Array(xyzs.flat());

    geometry.setIndex(computeIndices(locationsWithElevations.nLon, locationsWithElevations.nLat));
    geometry.setAttribute('position', new BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    const material = new MeshPhongMaterial({ color: 0x44aa88 });
    //const material = new MeshBasicMaterial({ color: 0x00ff00 });
    //material.wireframe = true;
    mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = 1.5 * Math.PI;

    scene.add(mesh);
    animate();
  });

let t = 0;
function animate() {
  t += 0.01;
  light1.position.x = 20 * Math.sin(t);
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
