sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/layout/form/SimpleForm"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        let detailController;
        let ownerComponent;
        let appController;
        let detailPageModel;
        let detailPage;

        return Controller.extend("ns.splitapp.controller.Detail", {
            onInit: function () {
                if (!detailController){
                    detailController = this;
                    ownerComponent = this.getOwnerComponent();
                    appController = ownerComponent.byId('App').getController();
                    detailController._busyDialog = new sap.m.BusyDialog({
                        text: "Please wait"
                    });
                }
            },
            titleFormatter: function (sFirstName, sLastName){
                return sFirstName + " " + sLastName
            },
            heightFormatter: function (sHeight) {
                return sHeight + "cm";
            },
            editUser: function (e) {
                //get user data
                let oApp = appController.getView();
                let oAppData = oApp.getModel().getData();
                detailController.showDialog(oAppData.selectedData, 'Edit', function(e){

                    detailController._busyDialog.open();

                    let oDialog = e.getSource().getParent();
                    let oEditedData = e.getSource().getParent().getModel().getData();
                    oDialog.close();

                    //get the edited data and send it as a patch
                    let dateFormatter = (sVal) => {
                        let oDate = new Date(sVal);
                        let year = oDate.getFullYear();
                        let month = oDate.getMonth() + 1;
                        let day = oDate.getDate();

                        if (month < 10){
                            month = "0" + month.toString();
                        }

                        if (day < 10){
                            day = "0" + day.toString();
                        }

                        return year + "-" + month + "-" + day;
                    }

                    let oData = {
                        "PersonId" : oEditedData.PersonId,
                        "FirstName": oEditedData.FirstName,
                        "LastName": oEditedData.LastName,
                        "StartDate": dateFormatter(oEditedData.StartDate),
                        "EndDate": dateFormatter(oEditedData.EndDate),
                        "HeightCm":  parseInt(oEditedData.HeightCm),
                        "ImageBase64": ""
                    }

                    let sUrl = appController._baseUri + "odata/v4/peopleservice/PeopleSet('" + oEditedData.PersonId + "')";
                    let sMethod = 'PUT';
                    let oHeaders = {
                        'Content-Type' : 'application/json',
                        'externalcaller' : 'true'
                    };

                    $.ajax({
                        url : sUrl,
                        method: sMethod,
                        dataType: 'text',
                        data: JSON.stringify(oData),
                        headers: oHeaders,
                        success:function(){
                            appController.readData().then((results)=>{
                                appController.bindAppData(results);
                                setTimeout(function(){
                                    detailController._busyDialog.close();
                                }, 1000)
                            })
                        },
                        error:function(e){
                            console.log(e);
                            setTimeout(function(){
                                detailController._busyDialog.close();
                            }, 1000)
                        }
                    })
                })
            },
            createUser: function (e) {
                //create empty data
                let oData = {
                    EndDate: "",
                    EndDateDisp: "",
                    FirstName: "",
                    FullName: "",
                    HeightCm: "",
                    ImageBase64: "",
                    Initials: "",
                    LastName: "",
                    PersonId: "",
                    StartDate: "",
                    StartDateDisp: ""
                }

                detailController.showDialog(oData, 'Create', function(e){
                    detailController._busyDialog.open();

                    let oDialog = e.getSource().getParent();
                    let oDialogData = oDialog.getModel().getData();
                    oDialog.close();
                    
                    //clean up data
                    let oFormattedData = {};
                    let dateFormatter = (sVal) => {
                        let oDate = new Date(sVal);
                        let year = oDate.getFullYear();
                        let month = oDate.getMonth() + 1;
                        let day = oDate.getDate();

                        if (month < 10){
                            month = "0" + month.toString();
                        }

                        if (day < 10){
                            day = "0" + day.toString();
                        }

                        return year + "-" + month + "-" + day;
                    }

                    oFormattedData.EndDate = dateFormatter(oDialogData.EndDateDisp);
                    oFormattedData.StartDate = dateFormatter(oDialogData.StartDateDisp);
                    oFormattedData.PersonId = "";
                    oFormattedData.FirstName = oDialogData.FirstName;
                    oFormattedData.LastName = oDialogData.LastName;
                    oFormattedData.HeightCm = parseInt(oDialogData.HeightCm);
                    oFormattedData.ImageBase64 = "";


                    let sUrl = appController._baseUri + "odata/v4/peopleservice/PeopleSet";
                    let sMethod = 'POST';
                    let oHeaders = {'Content-Type' : 'application/json'};
                    detailController.externalCall(sUrl, sMethod, oFormattedData, oHeaders).then(function(result){
                        appController.readData().then((results)=>{
                            appController.bindAppData(results);
                            setTimeout(function(){
                                detailController._busyDialog.close();
                            }, 1000)
                            
                        })
                    }).catch(function(error){
                        setTimeout(function(){
                            detailController._busyDialog.close();
                        }, 1000)
                        console.log(error);
                    })
                });
            },
            deleteUser: function (e) {
                detailController._busyDialog.open();

                let oApp = appController.getView();
                let oAppData = oApp.getModel().getData();
                let oSelectedData = oAppData.selectedData;
                let sUrl = appController._baseUri + "odata/v4/peopleservice/PeopleSet('" + oSelectedData.PersonId + "')";
                let sMethod = 'DELETE';
                let oHeaders = {'externalcaller' : 'true'};

                detailController.externalCall(sUrl, sMethod, null, oHeaders).then(function(result){
                    appController.readData().then((results)=>{
                        appController.bindAppData(results);
                        setTimeout(function(){
                            detailController._busyDialog.close();
                        }, 1000)
                    })
                }).catch(function(error){
                    setTimeout(function(){
                        detailController._busyDialog.close();
                    }, 1000)
                    console.log(error)
                })
            },
            showDialog: function (data, actionText, actionFn) {
                let oDataCopy = $.extend(true,{},data);
                let oDialogModel = new sap.ui.model.json.JSONModel(oDataCopy);
                let oSimpleForm = new sap.ui.layout.form.SimpleForm({
                    content:[
                        new sap.m.Label({
                            text: "First Name"
                        }),
                        new sap.m.Input({
                            value: "{FirstName}"
                        }),
                        new sap.m.Label({
                            text: "Last Name"
                        }),
                        new sap.m.Input({
                            value: "{LastName}"
                        }),
                        new sap.m.Label({
                            text: "Start Date"
                        }),
                        new sap.m.DatePicker({
                            value: "{StartDateDisp}"
                        }),
                        new sap.m.Label({
                            text: "End Date"
                        }),
                        new sap.m.DatePicker({
                            value: "{EndDateDisp}"
                        }),
                        new sap.m.Label({
                            text: "Height"
                        }),
                        new sap.m.Input({
                            value: "{HeightCm}"
                        })
                    ]
                });

                let oDialog = new sap.m.Dialog({
                    content:[
                        oSimpleForm
                    ],
                    buttons:[
                        new sap.m.Button({
                            text: "Close",
                            press: function(){
                                oDialog.close();
                            }
                        }),
                        new sap.m.Button({
                            text: actionText,
                            press: actionFn
                        })
                    ],
                    afterClose: function (){
                        oDialog.destroy();
                    }
                });

                oDialog.setModel(oDialogModel);
                oDialog.bindElement("/");

                oDialog.open();
            },
            externalCall: function (sUrl, sMethod, data, headers) {
                let oAjaxObj = {
                    url: sUrl,
                    method: sMethod,
                    dataType:'json',
                    async: false
                }

                if (data){
                    oAjaxObj.data = JSON.stringify(data);
                }

                if (headers){
                    oAjaxObj.headers = headers
                }

                return new Promise((resolve,reject) => {
                    oAjaxObj.success = function(result, status, xhr) {
                        resolve(result);
                    };

                    oAjaxObj.error = function(xhr, status, error) {
                        reject(error);
                    };

                    $.ajax(oAjaxObj);
                });
            },

            renderDemoTable : function () {
                console.log('rendering demo tabulator table');
                
                let oTable = new Tabulator('#demoTable', {
                  
                  pagination: 'local',
                  paginationSize: 20,
                  data: [],
                  layout: "fitColumns",
                  columns: [ //Define Table Columns
                    { title: "Carrier ID", field: "carrid" },
                    { title: "Price", field: "PRICE" },
                    { title: "Currency", field: "CURRENCY" },
                    { title: "Plane", field: "PLANETYPE" },
                    { title: "Distance", field: "flightDetails.distance" }
                  ]
                });
            },

            renderThree: function () {
                
                let camera, scene, renderer, manager, clock, loadDiv, loadGIF, objectIsRotating;

                let sphereMat;

                var backgroundIndex = 0;
                let background;

                const OBJECTS = new Map();

                var MAIN_OBJECT;

                init();
                render();

                function init() {
                const container = document.getElementById("demoThree");
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
            }
        });
    });
