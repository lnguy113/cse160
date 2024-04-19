import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/MTLLoader.js';
// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const loader = new THREE.TextureLoader();
const render = new THREE.WebGLRenderer();
render.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(render.domElement);

// Cube
const GeoCube = new THREE.BoxGeometry(1, 1, 1);
//const MatCube = new THREE.MeshBasicMaterial({ color: 0xffc0cb });
const TextCube = loader.load('resources/img/pinkflower.jpg')
const MatCube = new THREE.MeshBasicMaterial({
    map: TextCube,
});
const cube = new THREE.Mesh(GeoCube, MatCube);
cube.position.set(-2, 0, 0);
scene.add(cube);


// Sphere
const GeoSphere = new THREE.SphereGeometry(0.5, 32, 32);
const MatSphere = new THREE.MeshBasicMaterial({ color: 0xadd8e6 });
const sphere = new THREE.Mesh(GeoSphere, MatSphere);
sphere.position.set(0, 0, 0);
scene.add(sphere);

// Cylinder
const GeoCylinder = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
const MatCylinder = new THREE.MeshBasicMaterial({ color: 0xb19cd9 });
const cylinder = new THREE.Mesh(GeoCylinder, MatCylinder);
cylinder.position.set(2, 0, 0);
scene.add(cylinder);

// Object Rendering
// Load the OBJ file
// Load the MTL and OBJ files
const mtlLoader = new MTLLoader();
mtlLoader.load('resources/models/hello kitty/Tuxedo Sam Character.mtl', function(materials) {
    materials.preload();

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load('resources/models/hello kitty/Tuxedo Sam Character.obj', function(object) {
        // Adjust the position, rotation, and scale of the loaded object as needed
        object.position.set(0, -3, 0);
        scene.add(object);
    });
});

// Render loop
function rendering(time) 
{
    time *= 0.001;

    cube.rotation.y = time;
    requestAnimationFrame(rendering);
    render.render(scene, camera);
}
rendering();

// Adding light
function Light()
{
    const AmbLight = new THREE.AmbientLight(0xFFFFFF);
    scene.add(AmbLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFFFF, 1);
    directionalLight.position.set(1,4,-3); //left/right, up down, in out
    scene.add(directionalLight);

    const color = 0xFFFFFF;
    const Light = new THREE.PointLight(color, 1);
    Light.castShadow = true;
    Light.position.set(0, 12, 0);
    scene.add(Light);
} 
Light();
