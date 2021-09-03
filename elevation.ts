import { DirectionalLight, Scene, PerspectiveCamera, WebGLRenderer, BufferAttribute, BufferGeometry, MeshPhongMaterial, Mesh, AmbientLight } from 'three';
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
  const r: number = 2 + l.elevation / 20000;
  const latRadians: number = l.latitude * Math.PI / 180;
  const lonRadians: number = l.longitude * Math.PI / 180;
  return [
    r * Math.cos(latRadians) * Math.cos(lonRadians),
    r * Math.cos(latRadians) * Math.sin(lonRadians),
    r * Math.sin(latRadians)
  ];
};


const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const light1 = new DirectionalLight(0xFFFFFF, 1);
light1.position.set(-1, 2, 4);
scene.add(light1);
const light2 = new AmbientLight(0xFFFFFF, .3);
scene.add(light2);
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new TrackballControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.rotateSpeed = 1.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;
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


camera.position.z = 5;
let mesh: Mesh;

getElevations()
  .then(locationsWithElevations => {
    const geometry = new BufferGeometry();
    const xyzs = locationsWithElevations.response.map(location2vertex);
    const vertices = new Float32Array(xyzs.flat());
    geometry.setIndex(computeIndices(locationsWithElevations.nLon, locationsWithElevations.nLat));
    geometry.setAttribute('position', new BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    const material = new MeshPhongMaterial({ color: 0x44aa88 });
    //const material = new MeshBasicMaterial({ color: 0x00ff00 });
    //material.wireframe = true;
    mesh = new Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = 1.5 * Math.PI;

    scene.add(mesh);
    animate();
  });

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
