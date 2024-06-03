import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/MTLLoader.js';
import { FBXLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/FBXLoader.js';

// Set up the scene, camera, and renderer
const canvas = document.querySelector('#c');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
camera.position.z = 5;

// Orbit Controls
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

// Your additional three.js code here...

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

const loader = new THREE.TextureLoader();

// adding fog 
{
    const color = 0xFFEAD0;
    const near = 0;
    const far = 80;
    scene.fog = new THREE.Fog(color, near, far);
  }

// chair one
// Cube
const GeoCube = new THREE.BoxGeometry(1, 1, 1);
const TextCube = loader.load('resources/img/wood.jpg');
const MatCube = new THREE.MeshBasicMaterial({
    map: TextCube,
});
const cube = new THREE.Mesh(GeoCube, MatCube);
cube.position.set(-3, -3.5, -1.5);
scene.add(cube);

// cube 1
const GeoCube1 = new THREE.BoxGeometry(1, 1, 1);
const TextCube1 = loader.load('resources/img/wood.jpg');
const MatCube1 = new THREE.MeshBasicMaterial({
    map: TextCube,
});

const cube1 = new THREE.Mesh(GeoCube, MatCube);
cube1.position.set(-3, -3.5, -2);
scene.add(cube1);

// cube 2
const GeoCube2 = new THREE.BoxGeometry(1, 1, 1);
const TextCube2 = loader.load('resources/img/wood.jpg');
const MatCube2 = new THREE.MeshBasicMaterial({
    map: TextCube,
});
const cube2 = new THREE.Mesh(GeoCube, MatCube);
cube2.position.set(-3, -2.5, -2);
scene.add(cube2);

// chair two
// cube 3
const GeoCube3 = new THREE.BoxGeometry(1, 1, 1);
const TextCube3 = loader.load('resources/img/wood.jpg');
const MatCube3 = new THREE.MeshBasicMaterial({
    map: TextCube,
});
const cube3 = new THREE.Mesh(GeoCube, MatCube);
cube3.position.set(3, -3.5, -2);
scene.add(cube3);

// cube 4
const GeoCube4 = new THREE.BoxGeometry(1, 1, 1);
const TextCube4 = loader.load('resources/img/wood.jpg');
const MatCube4 = new THREE.MeshBasicMaterial({
    map: TextCube,
});

const cube4 = new THREE.Mesh(GeoCube, MatCube);
cube4.position.set(3, -2.5, -2);
scene.add(cube4);


// cube 5
const GeoCube5 = new THREE.BoxGeometry(1, 1, 1);
const TextCube5 = loader.load('resources/img/wood.jpg');
const MatCube5 = new THREE.MeshBasicMaterial({
    map: TextCube,
});

const cube5 = new THREE.Mesh(GeoCube, MatCube);
cube5.position.set(3, -3.5, -1.5);
scene.add(cube5);

// chair three
// cube 6
const GeoCube6 = new THREE.BoxGeometry(1, 1, 1);
const TextCube6 = loader.load('resources/img/wood.jpg');
const MatCube6 = new THREE.MeshBasicMaterial({
    map: TextCube,
});

const cube6 = new THREE.Mesh(GeoCube, MatCube);
cube6.position.set(-3, -3.5, 2);
scene.add(cube6);

// cube 7
const GeoCube7 = new THREE.BoxGeometry(1, 1, 1);
const TextCube7 = loader.load('resources/img/wood.jpg');
const MatCube7 = new THREE.MeshBasicMaterial({
    map: TextCube,
});

const cube7 = new THREE.Mesh(GeoCube, MatCube);
cube7.position.set(-3, -3.5, 2.5);
scene.add(cube7);

// cube 7
const GeoCube8 = new THREE.BoxGeometry(1, 1, 1);
const TextCube8 = loader.load('resources/img/wood.jpg');
const MatCube8 = new THREE.MeshBasicMaterial({
    map: TextCube,
});

const cube8 = new THREE.Mesh(GeoCube, MatCube);
cube8.position.set(-3, -2.5, 2.5);
scene.add(cube8);

// chair four
// cube 8
const GeoCube9 = new THREE.BoxGeometry(1, 1, 1);
const TextCube9 = loader.load('resources/img/wood.jpg');
const MatCube9 = new THREE.MeshBasicMaterial({
    map: TextCube,
});

const cube9 = new THREE.Mesh(GeoCube, MatCube);
cube9.position.set(3, -2.5, 2.5);
scene.add(cube9);

// cube 9
const GeoCube10 = new THREE.BoxGeometry(1, 1, 1);
const TextCube10 = loader.load('resources/img/wood.jpg');
const MatCube10 = new THREE.MeshBasicMaterial({
    map: TextCube,
});

const cube10 = new THREE.Mesh(GeoCube, MatCube);
cube10.position.set(3, -3.5, 2);
scene.add(cube10);

// cube 10
const GeoCube11 = new THREE.BoxGeometry(1, 1, 1);
const TextCube11 = loader.load('resources/img/wood.jpg');
const MatCube11 = new THREE.MeshBasicMaterial({
    map: TextCube,
});

const cube11 = new THREE.Mesh(GeoCube, MatCube);
cube11.position.set(3, -3.5, 2.5);
scene.add(cube11);

// chair five
// cube 11
const GeoCube12 = new THREE.BoxGeometry(1, 1, 1);
const TextCube12 = loader.load('resources/img/wood.jpg');
const MatCube12 = new THREE.MeshBasicMaterial({
    map: TextCube,
});

const cube12 = new THREE.Mesh(GeoCube, MatCube);
cube12.position.set(8, -2.5, 2.5);
scene.add(cube12);

// cube 9
const GeoCube13 = new THREE.BoxGeometry(1, 1, 1);
const TextCube13 = loader.load('resources/img/wood.jpg');
const MatCube13 = new THREE.MeshBasicMaterial({
    map: TextCube,
});

const cube13 = new THREE.Mesh(GeoCube, MatCube);
cube13.position.set(8, -3.5, 2);
scene.add(cube13);

// cube 10
const GeoCube14 = new THREE.BoxGeometry(1, 1, 1);
const TextCube14 = loader.load('resources/img/wood.jpg');
const MatCube14 = new THREE.MeshBasicMaterial({
    map: TextCube,
});

const cube14 = new THREE.Mesh(GeoCube, MatCube);
cube14.position.set(8, -3.5, 2.5);
scene.add(cube14);

// chair six
// cube 11
const GeoCube15 = new THREE.BoxGeometry(1, 1, 1);
const TextCube15 = loader.load('resources/img/wood.jpg');
const MatCube15 = new THREE.MeshBasicMaterial({
    map: TextCube,
});

const cube15 = new THREE.Mesh(GeoCube, MatCube);
cube15.position.set(-8, -2.5, 2.5);
scene.add(cube15);

// cube 9
const GeoCube16 = new THREE.BoxGeometry(1, 1, 1);
const TextCube16 = loader.load('resources/img/wood.jpg');
const MatCube16 = new THREE.MeshBasicMaterial({
    map: TextCube,
});

const cube16 = new THREE.Mesh(GeoCube, MatCube);
cube16.position.set(-8, -3.5, 2);
scene.add(cube16);

// cube 10
const GeoCube17 = new THREE.BoxGeometry(1, 1, 1);
const TextCube17 = loader.load('resources/img/wood.jpg');
const MatCube17 = new THREE.MeshBasicMaterial({
    map: TextCube,
});

const cube17 = new THREE.Mesh(GeoCube, MatCube);
cube17.position.set(-8, -3.5, 2.5);
scene.add(cube17);

// chair seven
// cube 11
const GeoCube18 = new THREE.BoxGeometry(1, 1, 1);
const TextCube18 = loader.load('resources/img/wood.jpg');
const MatCube18 = new THREE.MeshBasicMaterial({
    map: TextCube,
});

const cube18 = new THREE.Mesh(GeoCube, MatCube);
cube18.position.set(-8, -2.5, -2.5);
scene.add(cube18);

// cube 9
const GeoCube19 = new THREE.BoxGeometry(1, 1, 1);
const TextCube19 = loader.load('resources/img/wood.jpg');
const MatCube19 = new THREE.MeshBasicMaterial({
    map: TextCube,
});

const cube19 = new THREE.Mesh(GeoCube, MatCube);
cube19.position.set(-8, -3.5, -2);
scene.add(cube19);

// cube 10
const GeoCube20 = new THREE.BoxGeometry(1, 1, 1);
const TextCube20 = loader.load('resources/img/wood.jpg');
const MatCube20 = new THREE.MeshBasicMaterial({
    map: TextCube,
});

const cube20 = new THREE.Mesh(GeoCube, MatCube);
cube20.position.set(-8, -3.5, -2.5);
scene.add(cube20);

// chair eight
// cube 
const GeoCube21 = new THREE.BoxGeometry(1, 1, 1);
const TextCube21 = loader.load('resources/img/wood.jpg');
const MatCube21 = new THREE.MeshBasicMaterial({
    map: TextCube,
});

const cube21 = new THREE.Mesh(GeoCube, MatCube);
cube21.position.set(8, -2.5, -2.5);
scene.add(cube21);

// cube 
const GeoCube22 = new THREE.BoxGeometry(1, 1, 1);
const TextCube22 = loader.load('resources/img/wood.jpg');
const MatCube22 = new THREE.MeshBasicMaterial({
    map: TextCube,
});

const cube22 = new THREE.Mesh(GeoCube, MatCube);
cube22.position.set(8, -3.5, -2);
scene.add(cube22);

// cube 
const GeoCube23 = new THREE.BoxGeometry(1, 1, 1);
const TextCube23 = loader.load('resources/img/wood.jpg');
const MatCube23 = new THREE.MeshBasicMaterial({
    map: TextCube,
});

const cube23 = new THREE.Mesh(GeoCube, MatCube);
cube23.position.set(8, -3.5, -2.5);
scene.add(cube23);

// Sphere
const GeoSphere = new THREE.SphereGeometry(0.5, 32, 32);
const MatSphere = new THREE.MeshBasicMaterial({ color: 0xadd8e6 });
const sphere = new THREE.Mesh(GeoSphere, MatSphere);
sphere.position.set(-3, -3, 0.3);
scene.add(sphere);

// sphere 1
const GeoSphere1 = new THREE.SphereGeometry(0.5, 32, 32);
const MatSphere1 = new THREE.MeshBasicMaterial({ color: 0xadd8e6 });
const sphere1 = new THREE.Mesh(GeoSphere, MatSphere);
sphere1.position.set(3, -3, 0.3);
scene.add(sphere1);

// sphere 2
const GeoSphere2 = new THREE.SphereGeometry(0.5, 32, 32);
const MatSphere2 = new THREE.MeshBasicMaterial({ color: 0xadd8e6 });
const sphere2 = new THREE.Mesh(GeoSphere, MatSphere);
sphere2.position.set(-8, -3, 0);
scene.add(sphere2);

// sphere 3
const GeoSphere3 = new THREE.SphereGeometry(0.5, 32, 32);
const MatSphere3 = new THREE.MeshBasicMaterial({ color: 0xadd8e6 });
const sphere3 = new THREE.Mesh(GeoSphere, MatSphere);
sphere3.position.set(8, -3, 0);
scene.add(sphere3);

// Cylinder
// table 1
const GeoCylinder = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
const MatCylinder = new THREE.MeshBasicMaterial({ color: 0xb19cd9 });
const cylinder = new THREE.Mesh(GeoCylinder, MatCylinder);
cylinder.position.set(-3, -3.5, 0.3);
scene.add(cylinder);

// table 2
const GeoCylinder1 = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
const MatCylinder1 = new THREE.MeshBasicMaterial({ color: 0xb19cd9 });
const cylinder1 = new THREE.Mesh(GeoCylinder, MatCylinder);
cylinder1.position.set(3, -3.5, 0.3);
scene.add(cylinder1);

// table 3
const GeoCylinder2 = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
const MatCylinder2 = new THREE.MeshBasicMaterial({ color: 0xb19cd9 });
const cylinder2 = new THREE.Mesh(GeoCylinder, MatCylinder);
cylinder2.position.set(-8, -3.5, 0);
scene.add(cylinder2);

// table 4
const GeoCylinder3 = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
const MatCylinder3 = new THREE.MeshBasicMaterial({ color: 0xb19cd9 });
const cylinder3 = new THREE.Mesh(GeoCylinder, MatCylinder);
cylinder3.position.set(8, -3.5, 0);
scene.add(cylinder3);

// Playmat (Floor)
const woodTexture = loader.load('resources/img/cloud.jpeg', function(texture)
{
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
});
woodTexture.wrapS = THREE.RepeatWrapping;
woodTexture.wrapT = THREE.RepeatWrapping;
const planeGeo = new THREE.PlaneGeometry(30, 20);
const planeMat = new THREE.MeshBasicMaterial({ map: woodTexture });
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = - Math.PI / 2;
plane.position.y =-4; // Adjust position if needed
scene.add(plane);

// Skybox 
    const texture = loader.load('resources/img/background.jpg', () => 
    {
        const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
        rt.fromEquirectangularTexture(renderer, texture);
        scene.background = rt.texture;
    });

// Object Rendering
// Load the OBJ file
let cool;
const mtlLoader = new MTLLoader();
mtlLoader.load('resources/models/tux sam/Tuxedo Sam Character.mtl', function(materials) 
{
    materials.preload();

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load('resources/models/tux sam/Tuxedo Sam Character.obj', function(object) 
    {
        // Adjust the position, rotation, and scale of the loaded object as needed
        object.position.set(3, -3.2, -1);
        scene.add(object);
        cool = object;
    });
});

// const chococat = new OBJLoader();
// let awesome;
// chococat.load('resources/models/chococat/source/choco cat.obj', function(object) 
//     {
//         // Adjust the position, rotation, and scale of the loaded object as needed
//         object.position.set(3, -3.2, -1);
//         scene.add(object);
//         awesome = object;
//     });

function loadFBXModel(scene, filePath, position, scale)
{
    const loader = new FBXLoader();
    loader.load(
        filePath, // path to the FBX file
        (object)=>
        {
            //This callback function is called when the load is completed
            scene.add(object); //Add the loaded object to the scene
            object.position.set(position[0], position[1], position[2]);//Set the position of the model
            object.rotation.y = Math.PI;//rotate to the proper face
            object.scale.set(scale, scale, scale);

        },

        (xhr)=>
        {
            //This function is called while loading is progressing
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        
        (error)=>
        {
            //This function is called if there is an error loading the model
            console.error('An error happened during loading the FBX model:', error);
        }
    );
}
                    // x,y,z
const melodypos = [3, -2, 1.7];
loadFBXModel(scene, 'resources/models/melody/melody.fbx', melodypos, 0.005);

const kittypos = [-3, -3, 1.5];
loadFBXModel(scene, 'resources/models/hello kitty/kitty.fbx', kittypos, 0.01);

const kuromipos = [-3, -3, -1.4];
const loader1 = new FBXLoader();
    loader1.load(
        'resources/models/kuromi/source/Kuromi.fbx', // path to the FBX file
        (object)=>
        {
            //This callback function is called when the load is completed
            scene.add(object); //Add the loaded object to the scene
            object.position.set(kuromipos[0], kuromipos[1], kuromipos[2]);//Set the position of the model
            object.rotation.y = Math.PI;//rotate to the proper face
            object.rotation.x = 90;
            object.scale.set(0.01, 0.01, 0.01);

        },

        (xhr)=>
        {
            //This function is called while loading is progressing
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        
        (error)=>
        {
            //This function is called if there is an error loading the model
            console.error('An error happened during loading the FBX model:', error);
        }
    );

// Adding light
function Light()
{
    // light one
    const AmbLight = new THREE.AmbientLight(0xFFFFFF);
    scene.add(AmbLight);

    // light two
    const directionalLight = new THREE.DirectionalLight(0xFFFFFFFF, 1);
    directionalLight.position.set(1,4,-3); //left/right, up down, in out
    scene.add(directionalLight);

    // light three 
    const color = 0xFFFFFF;
    const Light = new THREE.PointLight(color, 1);
    Light.castShadow = true;
    Light.position.set(0, 12, 0);
    scene.add(Light);
}
Light();

// Render loop
function rendering(time)
{
    time *= 0.001;


    if(cool){
        cool.rotation.y = time;
    }
    requestAnimationFrame(rendering);
    controls.update();
    renderer.render(scene, camera);
}
rendering();