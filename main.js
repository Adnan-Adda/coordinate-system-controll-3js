import * as THREE from 'three';
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min.js';

//===============================================GLOBAL=====================================================
const fov = 75;
const aspect = 2;
const near = 0.1;
const far = 10000;
const gui = new GUI();
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
const scene = new THREE.Scene();
camera.position.set(0, 50, 0);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);

//===============================================CLASSES=====================================================
class Range {
    constructor(min = 0, max = 0, step = 0) {
        this.min = min;
        this.max = max;
        this.step = step;
    }
}

class AxisGridHelper {
    constructor(node, units = 28) {
        const axes = new THREE.AxesHelper();
        axes.material.depthTest = false;
        axes.renderOrder = 2; // after the grid
        this.node = node;
        this.units = units;
        this._step = 28;
        node.add(axes);
        const grid = new THREE.GridHelper(units, this._step);
        grid.material.depthTest = false;
        grid.renderOrder = 1;
        node.add(grid);
        this.grid = grid;
        this.axes = axes;
        this.grid.visible = false;
        this.axes.visible = false;
    }

    get step() {
        return this._step;
    }

    set step(value) {
        this._step = value;
        this.node.remove(this.grid);
        const grid = new THREE.GridHelper(this.units, value);
        grid.material.depthTest = false;
        grid.renderOrder = this.grid.renderOrder;
        this.node.add(grid);
        this.grid = grid;
    }

}

class Axis {
    constructor(colorHex = 0x0, renderOrder = 0) {
        this.geom = new THREE.BufferGeometry();
        this.material = new THREE.LineBasicMaterial({linewidth: 2, color: colorHex});
        this.dis = new THREE.Vector3();
        this.src = new THREE.Vector3();
        this._x = 0;
        this._y = 0;
        this._z = 0;
        this.geom.setFromPoints([this.src, this.dis]);
        this.line = new THREE.Line(this.geom, this.material);
        this.line.renderOrder = renderOrder;
        this.line.rotateX(45);
    }

    get x() {
        return this._x;
    }

    set x(value) {
        this._x = value;
        this.src.x = -value;
        this.dis.x = value;
        this.line.geometry.setFromPoints([this.src, this.dis]);
    }

    get y() {
        return this._y;
    }

    set y(value) {
        this._y = value;
        this.src.y = -value;
        this.dis.y = value;
        this.geom.setFromPoints([this.src, this.dis]);
    }

    get z() {
        return this._z;
    }

    set z(value) {
        this._z = value;
        this.src.z = -value;
        this.dis.z = value;
        this.geom.setFromPoints([this.src, this.dis]);
    }
}


//===============================================FUNCTIONS=====================================================
function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

function makeAxisGrid(gui, node, units, label = '') {
    const helper = new AxisGridHelper(node, units);
    let folder = gui.addFolder(label + 'Grid')
    folder.add(helper.grid, 'visible').name('Grid visible');
    folder.add(helper.axes, 'visible').name('Grid axis visible');
    folder.add(helper, 'step', 0, units / 2, 2).name('Cell Size');
}

function animate(time) {
    time *= 0.000001;
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}


function main() {
    // Creating x, y, and z axis
    const axisOrder = 4;
    let xAxis = new Axis(0xFF0000, axisOrder);
    let yAxis = new Axis(0x00FF00, axisOrder);
    let zAxis = new Axis(0x0000FF, axisOrder);
    // Adding the created axis to the scene
    scene.add(xAxis.line);
    scene.add(yAxis.line);
    scene.add(zAxis.line);
    makeAxisGrid(gui, xAxis.line, 200);

    let axisRange = new Range(0, 1000, 2);
    // nested controllers
    const axisFolder = gui.addFolder('Axis');
    axisFolder.add(zAxis, 'z', axisRange.min, axisRange.max, axisRange.step);
    axisFolder.add(xAxis, 'x', axisRange.min, axisRange.max, axisRange.step);
    axisFolder.add(yAxis, 'y', axisRange.min, axisRange.max, axisRange.step);

    const cameraFolder = gui.addFolder('Camera');
    const cameraLookAt = cameraFolder.addFolder('LookAt');
    const cameraPosition = cameraFolder.addFolder('Position');
    const cameraUp = cameraFolder.addFolder('UP');
    let lookAt3 = new THREE.Vector3();
    let camRange = new Range(-600, 600, 1);

    cameraLookAt.add(lookAt3, 'x', camRange.min, camRange.max, camRange.step).onChange(() => camera.lookAt(lookAt3));
    cameraLookAt.add(lookAt3, 'y', camRange.min, camRange.max, camRange.step).onChange(() => camera.lookAt(lookAt3));
    cameraLookAt.add(lookAt3, 'z', camRange.min, camRange.max, camRange.step).onChange(() => camera.lookAt(lookAt3));
    cameraPosition.add(camera.position, 'x', camRange.min, camRange.max, camRange.step);
    cameraPosition.add(camera.position, 'y', camRange.min, camRange.max, camRange.step);
    cameraPosition.add(camera.position, 'z', camRange.min, camRange.max, camRange.step);

    cameraUp.add(camera.up, 'x', camRange.min, camRange.max, camRange.step);
    cameraUp.add(camera.up, 'y', camRange.min, camRange.max, camRange.step);
    cameraUp.add(camera.up, 'z', camRange.min, camRange.max, camRange.step);

    // Close all folders panels
    gui.open(gui._closed);
    Object(gui.foldersRecursive()).forEach(folder => folder.open(folder._closed));


    // Start animation
    animate();
}

main();
