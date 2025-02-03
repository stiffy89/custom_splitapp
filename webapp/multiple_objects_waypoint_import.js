import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

let camera, scene, renderer, manager, clock, loadDiv, loadGIF, objectIsRotating;

let sphereMat;

var backgroundIndex = 0;
let background;

const OBJECTS = new Map();

var MAIN_OBJECT;

init();
render();

function init() {
  const container = document.getElementById("target-div");
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    0.25,
    100
  );
  camera.position.set(-4, 0, 0);
  camera.rotation.set(0, 0, 0);
  camera.zoom = 1;

  scene = new THREE.Scene();
  clock = new THREE.Clock();

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  //set to clear background
  //need to comment out scene.background in renderBackground func
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.useLegacyLights = false;
  container.appendChild(renderer.domElement);

  addLoadingManager();
  loadBackgrounds();

  window.addEventListener("resize", onWindowResize);

  camera.lookAt(0, 0, 0);
  addViewerSoftLock();

  addCylinder();

  render();
}

function addViewerSoftLock() {
  let mouseDown = false;
  let mouseX = 0;
  let mouseY = 0;

  let canvas = renderer.domElement;

  let enableHoriRot = true;
  let enableVertRot = true;
  let startingRot = {
    x: 0,
    y: 0,
    z: 0,
  };
  let deltaHoriMax = 1;
  let deltaVertMax = 3;
  canvas.addEventListener(
    "mousemove",
    (e) => {
      if (!mouseDown) {
        return;
      }
      e.preventDefault();
      var deltaX = e.clientX - mouseX,
        deltaY = e.clientY - mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (MAIN_OBJECT) {
        //clamp the rotations to the startRot +- the delta
        if (enableHoriRot) {
          MAIN_OBJECT.object.rotation.y = clamp(
            (MAIN_OBJECT.object.rotation.y += deltaX / 100),
            startingRot.y - deltaVertMax,
            startingRot.y + deltaVertMax
          );
        }
        if (enableVertRot) {
          MAIN_OBJECT.object.rotation.z = clamp(
            (MAIN_OBJECT.object.rotation.z += deltaY / 100),
            startingRot.z - deltaHoriMax,
            startingRot.z + deltaHoriMax
          );
        }
      }
    },
    false
  );

  canvas.addEventListener(
    "mousedown",
    (e) => {
      e.preventDefault();

      renderer.setAnimationLoop(() => render());

      mouseDown = true;
      mouseX = e.clientX;
      mouseY = e.clientY;

      //store starting rot
      if (MAIN_OBJECT) {
        startingRot.x = 0;
        startingRot.y = 0;
        startingRot.z = 0;
      }
    },
    false
  );

  canvas.addEventListener(
    "mouseup",
    (e) => {
      e.preventDefault();
      mouseDown = false;
      renderer.setAnimationLoop(() => render());

      //after a second reset back to starting position
      window.setTimeout(() => {
        clock.stop();
        clock.start();
        const duration = 1;
        var time = 0;

        const startRot = new THREE.Euler(
          MAIN_OBJECT.object.rotation.x,
          MAIN_OBJECT.object.rotation.y,
          MAIN_OBJECT.object.rotation.z,
          "XYZ"
        );

        renderer.setAnimationLoop(() => {
          if (time / duration >= 1) {
            clock.stop();

            renderer.setAnimationLoop(() => {
              if (objectIsRotating) {
                MAIN_OBJECT.object.rotateY(0.01);
              }
              render();
            });
          } else {
            const targetRot = new THREE.Euler(0, 0, 0, "XYZ");
            if (!vector3Equals(MAIN_OBJECT.object.rotation, targetRot)) {
              //euler has no built in lerp
              const x = lerp(
                startRot.x,
                targetRot.x,
                easeInOut(time / duration)
              );
              const y = lerp(
                startRot.y,
                targetRot.y,
                easeInOut(time / duration)
              );
              const z = lerp(
                startRot.z,
                targetRot.z,
                easeInOut(time / duration)
              );
              MAIN_OBJECT.object.rotation.set(x, y, z);
            }

            time = clock.getElapsedTime();
            render();
          }
        });
      }, 1000);
    },
    false
  );
}

//reference to background image here
function loadBackgrounds() {
  const geometry = new THREE.SphereGeometry(10);
  sphereMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 1,
  });
  const sphere = new THREE.Mesh(geometry, sphereMat);
  sphereMat.side = THREE.BackSide;
  scene.add(sphere);

  new RGBELoader(manager)
    .setPath()
    .load("/assets/backgrounds/royal_esplanade_1k.hdr", function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;

      background = texture;
    });
}

function renderBackground() {
  const texture = background;

  //dont assign background for transparent background
  // scene.background = texture;
  scene.environment = texture;

  render();

  window.setTimeout(() => fadeBackground(), 100);
}

function fadeBackground() {
  if (sphereMat.opacity > 0) {
    sphereMat.opacity -= 0.05;
    render();
    requestAnimationFrame(fadeBackground);
  }
}

//reference to cylinder model here
function addCylinder(callbackFunc) {
  //create the reference object
  const cylObj = {
    name: "mainCylinder",
    object: null,
    material: null,
    callback: callbackFunc,
  };

  // model
  const tankLoader = new GLTFLoader(manager).setPath(
    "/assets/models/AirCylinder/"
  );
  tankLoader.load("scene.gltf", function (gltf) {
    gltf.scene.scale.set(10, 10, 10);
    gltf.scene.position.set(0, -2, 0);
    //have a name so we can find it
    gltf.scene.name = "mainCylinder";

    gltf.parser.getDependencies("material").then((materials) => {
      materials.forEach((material) => {
        cylObj.material = material;
        cylObj.material.transparent = true;
        cylObj.material.opacity = 1;
      });
    });

    const group = new THREE.Group();
    group.position.set(0, 0, 0);
    group.add(gltf.scene);
    cylObj.object = group;

    render();
  });

  //add it to our list of objects
  OBJECTS.set(cylObj.name, cylObj);
}

//reference to loading gif here
function addLoadingManager() {
  loadDiv = document.createElement("div");
  loadDiv.style =
    "background-color: #FFFFFF;border-radius: 15px;border: 2px solid #FFFFFF;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);padding: 10px;";

  loadGIF = document.createElement("img");
  loadGIF.src = "/assets/images/loading3.gif";
  loadGIF.style = "display: flex;align-self: center;";
  loadDiv.appendChild(loadGIF);

  const loadText = document.createElement("span");
  loadText.innerHTML = "Loading...";
  loadText.style =
    "display: flex;align-self: center; justify-content: center; color: #333;font-family: Arial, Verdana; font-size: 1em;";
  loadDiv.appendChild(loadText);

  document.getElementById("target-div").appendChild(loadDiv);

  manager = new THREE.LoadingManager();
  manager.onStart = function (url, itemsLoaded, itemsTotal) {
    console.log(
      "Started loading file: " +
        url +
        ".\nLoaded " +
        itemsLoaded +
        " of " +
        itemsTotal +
        " files."
    );
  };

  manager.onLoad = function () {
    console.log("Loading complete!");

    renderBackground();

    window.setTimeout(removeLoading, 250);
    initialAnimation();
  };

  manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    console.log(
      "Loading file: " +
        url +
        ".\nLoaded " +
        itemsLoaded +
        " of " +
        itemsTotal +
        " files."
    );
  };

  manager.onError = function (url) {
    console.log("There was an error loading " + url);
  };
}

//initial object spinning
function initialAnimation() {
  objectIsRotating = true;

  window.setTimeout(() => {
    showObject();
  }, 100);
}

//show the new object
function showObject() {
  clock.stop();
  clock.start();

  MAIN_OBJECT = OBJECTS.get(Array.from(OBJECTS.keys())[0]);
  MAIN_OBJECT.object.scale.set(1, 1, 1);

  if (MAIN_OBJECT.callback) {
    MAIN_OBJECT.callback();
  }

  //need to find a way to check if material has been loaded
  MAIN_OBJECT.material.opacity = 1;

  scene.add(MAIN_OBJECT.object);

  scaleUp();
}

function scaleUp() {
  const duration = 3;
  var time = 0;

  MAIN_OBJECT.object.scale.set(0, 0, 0);

  const startScale = MAIN_OBJECT.object.scale;
  const targetScale = new THREE.Vector3(1, 1, 1);
  var atTargetScale = false;

  renderer.setAnimationLoop(() => {
    if (
      !vector3Equals(MAIN_OBJECT.object.scale, targetScale) &&
      !atTargetScale
    ) {
      MAIN_OBJECT.object.scale.lerpVectors(
        startScale,
        targetScale,
        easeInOut(time / duration)
      );
    } else {
      atTargetScale = true;
    }
    if (objectIsRotating) {
      MAIN_OBJECT.object.rotateY(0.01);
    }

    time = clock.getElapsedTime();
    render();
  });
}

function removeLoading() {
  loadDiv.style.display = "none";
}

function vector3Equals(v1, v2) {
  return v1.x == v2.x && v1.y == v2.y && v1.z == v2.z;
}

function lerp(start, end, t) {
  return start + t * (end - start);
}

function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

function clamp(input, min, max) {
  return Math.min(Math.max(input, min), max);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

function render() {
  renderer.render(scene, camera);
}
