import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// Ground
const groundSize = 1000;
const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Grid helper
const gridHelper = new THREE.GridHelper(groundSize, 100);
scene.add(gridHelper);

// Interactive Subject (Vehicle)
const carGroup = new THREE.Group();
scene.add(carGroup);

const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 4);
const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.y = 0.5;
body.castShadow = true;
carGroup.add(body);

const cabinGeometry = new THREE.BoxGeometry(1.5, 0.5, 2);
const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
cabin.position.y = 1;
cabin.position.z = -0.5;
cabin.castShadow = true;
carGroup.add(cabin);

// Wheels
const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.4, 32);
const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });

const wheels = [];
const wheelPositions = [
    [-1, 0.4, 1.5], [1, 0.4, 1.5],
    [-1, 0.4, -1.5], [1, 0.4, -1.5]
];

wheelPositions.forEach((pos, index) => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.position.set(...pos);
    wheel.rotation.z = Math.PI / 2;
    wheel.castShadow = true;
    carGroup.add(wheel);
    wheels.push(wheel);
});

// Headlights
const headLightGeometry = new THREE.CircleGeometry(0.2, 32);
const headLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffaa });

const headLightLeft = new THREE.Mesh(headLightGeometry, headLightMaterial);
headLightLeft.position.set(-0.7, 0.5, 2.01);
carGroup.add(headLightLeft);

const headLightRight = new THREE.Mesh(headLightGeometry, headLightMaterial);
headLightRight.position.set(0.7, 0.5, 2.01);
carGroup.add(headLightRight);

const spotLightLeft = new THREE.SpotLight(0xffffaa, 5, 20, Math.PI / 4, 0.5);
spotLightLeft.position.set(-0.7, 0.5, 2);
spotLightLeft.target.position.set(-0.7, 0.5, 10);
carGroup.add(spotLightLeft);
carGroup.add(spotLightLeft.target);

const spotLightRight = new THREE.SpotLight(0xffffaa, 5, 20, Math.PI / 4, 0.5);
spotLightRight.position.set(0.7, 0.5, 2);
spotLightRight.target.position.set(0.7, 0.5, 10);
carGroup.add(spotLightRight);
carGroup.add(spotLightRight.target);

// Controls
const keys = {
    w: false, a: false, s: false, d: false,
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    ' ': false
};

window.addEventListener('keydown', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (keys.hasOwnProperty(key)) keys[key] = true;
});

window.addEventListener('keyup', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (keys.hasOwnProperty(key)) keys[key] = false;
});

// Physics variables
let speed = 0;
let rotation = 0;
const maxSpeed = 0.5;
const acceleration = 0.01;
const friction = 0.005;
const steeringSpeed = 0.04;
const brakingForce = 0.02;

function updatePhysics() {
    // Steering
    if (keys.a || keys.ArrowLeft) {
        if (Math.abs(speed) > 0.01) {
            rotation += steeringSpeed * (speed > 0 ? 1 : -1);
        }
    }
    if (keys.d || keys.ArrowRight) {
        if (Math.abs(speed) > 0.01) {
            rotation -= steeringSpeed * (speed > 0 ? 1 : -1);
        }
    }

    // Acceleration
    if (keys.w || keys.ArrowUp) {
        speed += acceleration;
    } else if (keys.s || keys.ArrowDown) {
        speed -= acceleration;
    } else {
        // Friction
        if (speed > 0) speed = Math.max(0, speed - friction);
        if (speed < 0) speed = Math.min(0, speed + friction);
    }

    // Braking
    if (keys[' ']) {
        if (speed > 0) speed = Math.max(0, speed - brakingForce);
        if (speed < 0) speed = Math.min(0, speed + brakingForce);
    }

    // Speed limit
    speed = Math.max(-maxSpeed / 2, Math.min(maxSpeed, speed));

    // Wheel rotation
    wheels.forEach(wheel => {
        wheel.rotation.x += speed;
    });

    // Update position and rotation
    carGroup.rotation.y = rotation;
    carGroup.position.x += Math.sin(rotation) * speed;
    carGroup.position.z += Math.cos(rotation) * speed;

    // Follow camera (basic)
    // Use -10 for Z to follow from behind (car faces +Z)
    const cameraOffset = new THREE.Vector3(0, 5, -10);
    cameraOffset.applyQuaternion(carGroup.quaternion);
    camera.position.copy(carGroup.position).add(cameraOffset);
    camera.lookAt(carGroup.position);
}

// Handle resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    updatePhysics();
    renderer.render(scene, camera);
}
animate();
