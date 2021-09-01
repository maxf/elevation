import { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh } from 'three';

type Location = {
  latitude: number,
  longitude: number
};


const elevationAPiUrl = 'http://localhost:1234/elevations.json';

const getElevations = function(): Promise<any> {
  return new Promise((resolve, reject) =>
    fetch(elevationAPiUrl)
      .then(response => response.json())
      .then(jsonResponse => resolve(jsonResponse.results))
      .catch(error => reject(error)));
};

/*
const ll2xyz = function({lat: number, lon: number}):{x: number, y: number} {
  return {
    lat: ( y / height) * (south - north) + north,
    lon: ( x / width ) * (east - west) + west
  }
};
*/


const scene = new Scene();
const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new BoxGeometry();
const material = new MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

getElevations()
  .then(locationsWithElevations => {
    // create a mesh
  });

function animate() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
}
animate();
