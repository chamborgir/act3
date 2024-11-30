import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

//TEXTURE
const textureLoader = new THREE.TextureLoader();
const saturnTexture = textureLoader.load("/saturn.jpg");

// SIZES
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

// CANVAS
const canvas = document.querySelector(".webgl");

// SCENE
const scene = new THREE.Scene();

// SATURN
const saturn = new THREE.Mesh(
    new THREE.SphereGeometry(2, 32, 32),
    new THREE.MeshStandardMaterial({ map: saturnTexture })
);
scene.add(saturn);

//RING
// Parameters for inner ring
const innerRingParameters = {
    count: 10000,
    radius: 4, // Radius of the inner ring
    spread: 2, // Controls the variation in distance
};

// Parameters for outer ring
const outerRingParameters = {
    count: 5000,
    radius: 5.5,
    spread: 0.5,
};

// Function to create a ring
const createRing = (parameters) => {
    const ringGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;
        const angle = Math.random() * Math.PI * 2; // Random angle around the circle
        const distance =
            parameters.radius + (Math.random() - 0.5) * parameters.spread; // Variation in distance

        positions[i3] = Math.cos(angle) * distance; // X position
        positions[i3 + 1] = (Math.random() - 0.5) * 0.2; // Small random offset for Y position
        positions[i3 + 2] = Math.sin(angle) * distance; // Z position
    }

    ringGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    );

    const ringMaterial = new THREE.PointsMaterial({
        color: "#4e443c",
        size: 0.02, // Size of each particle
    });

    return new THREE.Points(ringGeometry, ringMaterial);
};

// Create and add the inner ring
const innerRing = createRing(innerRingParameters);
scene.add(innerRing);

// Create and add the outer ring
const outerRing = createRing(outerRingParameters);
scene.add(outerRing);

innerRing.rotation.x = 0.1; // Rotate 45 degrees around the X-axis

// Tilt the outer ring
outerRing.rotation.x = 0.1; // Rotate slightly around the X-axis

// MODEL
const gltfLoader = new GLTFLoader();
gltfLoader.load("/Fox/glTF/Fox.gltf", (gltf) => {
    gltf.scene.scale.set(0.005, 0.005, 0.005);
    gltf.scene.position.set(4, 0.1, 0); // (x, y, z)

    scene.add(gltf.scene);
    mixer = new THREE.AnimationMixer(gltf.scene);
    const action = mixer.clipAction(gltf.animations[2]);
    action.play();
});

let mixer = null;

// LIGHTS
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.05);
scene.add(hemiLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// CAMERA
const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
);
camera.position.z = 10; // Position the camera away from the sphere
camera.position.y = 5;
scene.add(camera);

// CONTROLS
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// RENDERER
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// Create a clock to track the elapsed time
const clock = new THREE.Clock();

// ANIMATION LOOP
const animate = () => {
    const deltaTime = clock.getDelta(); // Time elapsed since the last frame

    controls.update(); // Update controls
    // Animation play
    if (mixer) {
        mixer.update(deltaTime); // Update mixer with the elapsed time
    }
    renderer.render(scene, camera); // Render the scene
    requestAnimationFrame(animate); // Loop
};

animate();

// RESIZE EVENT
window.addEventListener("resize", () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
