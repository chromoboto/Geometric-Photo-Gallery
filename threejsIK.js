/*******************************************************************************
By Noah Trueblood on 19 February 2019

An implementation of FABRIK aside a little library intended to ease IK chain
manipulation making projects with threejs and beyond.

This file contains simple but useful functions for creating elements in threejs.
*******************************************************************************/
function createPoint({ x, y, z , size }) {
  const pointGeometry = new THREE.Geometry();
  pointGeometry.vertices.push(new THREE.Vector3(x, y, z));

  const pointMaterial = new THREE.PointsMaterial({ size, sizeAttenuation: false });

  const point = new THREE.Points(pointGeometry, pointMaterial);

  return point;
}

function createLine({ x0, y0, z0, x1, y1, z1 }) {
  const lineGeometry = new THREE.Geometry();
  lineGeometry.vertices.push(new THREE.Vector3(x0, y0, z0)); // TODO: switch to a BufferGeometry for performance
  lineGeometry.vertices.push(new THREE.Vector3(x1, y1, z1));

  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x777777 });

  const line = new THREE.Line(lineGeometry, lineMaterial);

  return line;
}

function createPlane({ width, height, widthSegments, heightSegments }) {
  const planeGeometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);

  const myUrl = 'https://upload.wikimedia.org/wikipedia/commons/d/dc/PLoSBiol4.e126.Fig6fNeuron.jpg'; // 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Deep_Blue_eye.jpg'

  const textureLoader = new THREE.TextureLoader()
  textureLoader.crossOrigin = "Anonymous"
  const texture = textureLoader.load(myUrl)
  // const texture = THREE.ImageUtils.loadTexture( "http://images.huffingtonpost.com/2014-11-12-eye.jpg" );

  const useImages = true;

  let planeMaterial;
  if (useImages) {
    planeMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: texture });
  } else {
    planeMaterial = new THREE.MeshBasicMaterial({ color: (Math.random() * 0xffffff), side: THREE.DoubleSide });
  }

  const plane = new THREE.Mesh(planeGeometry, planeMaterial);

  return plane;
}
