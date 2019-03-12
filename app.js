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

  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

  const line = new THREE.Line(lineGeometry, lineMaterial);

  return line;
}

function createPlane({ width, height, widthSegments, heightSegments }) {
  const planeGeometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
  planeMaterial = new THREE.MeshBasicMaterial({ color: (Math.random() * 0xffffff), side: THREE.DoubleSide });

  // const imageTexture = new THREE.TextureLoader().load('photographs/eye.jpg');
  // const planeMaterial = new THREE.MeshBasicMaterial({ map: imageTexture, side: THREE.DoubleSide });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);

  return plane;
}

function columnIK(column, circumference) {
  // To start, distrubute the bend evenly across all images in the column

  const base = column[0][0];

  let tgt = { x: 1, y: 2 };
  for (let i = 0; i < column.length - 1; i++) {
    const currentXY = { x: column[i][0].geometry.vertices[0].x, y: column[i][0].geometry.vertices[0].y };
    const nextXY = { x: column[i + 1][0].geometry.vertices[0].x, y: column[i + 1][0].geometry.vertices[0].y };

    const r  = reach(currentXY, nextXY, tgt);
    column[i][0].geometry.vertices[0].x = r[0].x;
    column[i][0].geometry.vertices[0].y = r[0].y;
    tgt = r[1];
  }
  column[column.length - 1][0] = tgt;

  tgt = base;
  for (let i = column.length - 1; i > 0; i -= 1) {
    console.log(i);
    console.log(column[i][0]);
    const currentXY = { x: column[i][0].geometry.vertices[0].x, y: column[i][0].geometry.vertices[0].y };
    const nextXY = { x: column[i - 1][0].geometry.vertices[0].x, y: column[i - 1][0].geometry.vertices[0].y };

    const r = reach(currentXY, nextXY, tgt);
    column[i][0].geometry.vertices[0].x = r[0].x;
    column[i][0].geometry.vertices[0].y = r[0].y;
    tgt = r[1];
  }
  column[0][0].geometry.vertices[0].x = tgt.x;
  column[0][0].geometry.vertices[0].y = tgt.y;
  /*
  let belowImage = Math.floor(column.length / 2);
  let aboveImage;

  if ((column.length % 2) > 0) {
    aboveImage = belowImage + 2; // skip the middle image so it remains parallel with the screen
  } else {
    aboveImage = belowImage + 1;
  }

  const numImagesAbove = column.length - aboveImage;

  const radius = circumference / (2 * Math.PI);
  */

  /*

  let lastTopLeftX = column[aboveImage - 1][3].geometry.vertices[0].x;
  let lastTopLeftY = column[aboveImage - 1][3].geometry.vertices[0].y;
  let lastTopRightX = column[aboveImage - 1][3].geometry.vertices[0].x;
  let lastTopRightY = column[aboveImage - 1][3].geometry.vertices[0].y;

  console.log(lastTopLeftX, column[aboveImage][0].geometry.vertices[0].x);

  column[aboveImage][0].geometry.vertices[0].x = lastTopLeftX;
  column[aboveImage][0].geometry.vertices[0].y = lastTopLeftY;
  column[aboveImage][1].geometry.vertices[0].x = lastTopRightX;
  column[aboveImage][1].geometry.vertices[0].y = lastTopRightY;

  const angle = 2 * Math.PI / column.length;
  const newTopLeftX = lastTopLeftX + Math.cos(angle) * radius;
  const newTopLeftY = lastTopLeftY + Math.sin(angle) * radius;
  const newTopRightX = lastTopRightX + Math.cos(angle) * radius;
  const newTopRightY = lastTopRightY + Math.sin(angle) * radius;

  column[aboveImage][2].geometry.vertices[0].x = newTopLeftX;
  column[aboveImage][2].geometry.vertices[0].y = newTopLeftY;
  column[aboveImage][3].geometry.vertices[0].x = newTopRightX;
  column[aboveImage][3].geometry.vertices[0].y = newTopRightY;
  */



  /*
  for (let i = 0; i < numImagesAbove; i += 1) {
    const angle = 2 * Math.PI / column.length;
    const x = originX + cos(angle)*radius;
    const y = originY + sin(angle)*radius;

    aboveImage += 1;
  }
  */
}

function launchViz(numImages) {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  renderer = new THREE.WebGLRenderer(antialias = true);
  renderer.setSize(window.innerWidth, window.innerHeight);

  function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
  }

  // each image consists of 4 points and a plane

  // Images are distributed into one of 3 columns
  const leftColumn = [];
  const middleColumn = [];
  const rightColumn = [];

  const leftColumnWidth = 1;
  const middleColumnWidth = 1;
  const rightColumnWidth = 1;

  const leftColumnImageHeight = 1;
  const middleColumnImageHeight = 1;
  const rightColumnImageHeight = 1;

  const leftColumnStart = 0;
  const leftColumnEnd = Math.floor(numImages/3);
  const middleColumnStart = leftColumnEnd;
  const middleColumnEnd = Math.ceil(numImages/3) * 2;
  const rightColumnStart = middleColumnEnd;
  const rightColumnEnd = numImages;

  const spacingGap = 0.2;

  // create points
  /*
  for(let i = middleColumnStart; i < middleColumnEnd; i += 1) {
    const n = i - middleColumnStart;

    middleColumn[n] = [];

    const xLeft = -middleColumnWidth / 2;
    const xRight = middleColumnWidth / 2;

    let heightShift = 0;
    if (((middleColumnEnd - middleColumnStart) % 2) > 0) {
      heightShift = (middleColumnImageHeight / 2)
    }

    const middleHeight = Math.floor((middleColumnEnd - middleColumnStart) / 2) * middleColumnImageHeight;

    const yBottom = n * middleColumnImageHeight - middleHeight - heightShift;
    const yTop = (n + 1) * middleColumnImageHeight - middleHeight - heightShift;

    const point0 = createPoint({ x: xLeft, y: yBottom, z: 0, size: 3 });
    middleColumn[n][0] = point0;
    scene.add(point0);

    const point1 = createPoint({ x: xRight, y: yBottom, z: 0, size: 3 });
    middleColumn[n][1] = point1;
    scene.add(point1);

    const point2 = createPoint({ x: xLeft, y: yTop, z: 0, size: 3 });
    middleColumn[n][2] = point2;
    scene.add(point2);

    const point3 = createPoint({ x: xRight, y: yTop, z: 0, size: 3 });
    middleColumn[n][3] = point3;
    scene.add(point3);
  }
  */
  /*
  for(let i = leftColumnStart; i < leftColumnEnd; i += 1) {
    const n = i - leftColumnStart;

    leftColumn[n] = [];

    const xLeft = (-middleColumnWidth / 2) - leftColumnWidth - spacingGap;
    const xRight = (-middleColumnWidth / 2) - spacingGap;

    let heightShift = 0;
    if (((leftColumnEnd - leftColumnStart) % 2) > 0) {
      heightShift = (leftColumnImageHeight / 2)
    }

    const middleHeight = Math.floor((leftColumnEnd - leftColumnStart) / 2) * leftColumnImageHeight;

    const yBottom = n * leftColumnImageHeight - middleHeight - heightShift;
    const yTop = (n + 1) * leftColumnImageHeight - middleHeight - heightShift;

    const point0 = createPoint({ x: xLeft, y: yBottom, z: 0, size: 3 });
    leftColumn[n][0] = point0;
    scene.add(point0);

    const point1 = createPoint({ x: xRight, y: yBottom, z: 0, size: 3 });
    leftColumn[n][1] = point1;
    scene.add(point1);

    const point2 = createPoint({ x: xLeft, y: yTop, z: 0, size: 3 });
    leftColumn[n][2] = point2;
    scene.add(point2);

    const point3 = createPoint({ x: xRight, y: yTop, z: 0, size: 3 });
    leftColumn[n][3] = point3;
    scene.add(point3);
  }
  */
  /*
  for(let i = rightColumnStart; i < rightColumnEnd; i += 1) {
    const n = i - rightColumnStart;

    rightColumn[n] = [];

    const xLeft = (middleColumnWidth / 2) + spacingGap;
    const xRight = (middleColumnWidth / 2) + rightColumnWidth + spacingGap;

    let heightShift = 0;
    if (((rightColumnEnd - rightColumnStart) % 2) > 0) {
      heightShift = (rightColumnImageHeight / 2)
    }

    const middleHeight = Math.floor((rightColumnEnd - rightColumnStart) / 2) * rightColumnImageHeight;

    const yBottom = ((n * rightColumnImageHeight) - middleHeight) - heightShift;
    const yTop = ((n + 1) * rightColumnImageHeight - middleHeight) - heightShift;

    const point0 = createPoint({ x: xLeft, y: yBottom, z: 0, size: 3 });
    rightColumn[n][0] = point0;
    scene.add(point0);

    const point1 = createPoint({ x: xRight, y: yBottom, z: 0, size: 3 });
    rightColumn[n][1] = point1;
    scene.add(point1);

    const point2 = createPoint({ x: xLeft, y: yTop, z: 0, size: 3 });
    rightColumn[n][2] = point2;
    scene.add(point2);

    const point3 = createPoint({ x: xRight, y: yTop, z: 0, size: 3 });
    rightColumn[n][3] = point3;
    scene.add(point3);
  }
  */

  //const line = createLine({ x0: 0, y0: 0, z0: 0, x1: 2, y1: 2, z1: 2 });
  //scene.add(line);
  /*
  let leftColumnCircumference = 0;

  leftColumn.forEach((points) => {
    const plane = createPlane({ width: 1, height: 1, widthSegments: 1, heightSegments: 1 });
    // scene.add(plane);

    const planeX = points[0].geometry.vertices[0].x + (leftColumnWidth / 2);
    const planeY = points[0].geometry.vertices[0].y + (leftColumnImageHeight / 2);
    const planeZ = points[0].geometry.vertices[0].z;

    plane.position.x = planeX;
    plane.position.y = planeY;
    plane.position.z = planeZ;

    points[0][4] = plane;

    leftColumnCircumference += leftColumnImageHeight;
  });
  */

  // columnIK(leftColumn, leftColumnCircumference);

  /*
  let middleColumnCircumference = 0;

  middleColumn.forEach((points) => {
    const plane = createPlane({ width: 1, height: 1, widthSegments: 1, heightSegments: 1 });
    scene.add(plane);

    const planeX = points[0].geometry.vertices[0].x + (middleColumnWidth / 2);
    const planeY = points[0].geometry.vertices[0].y + (middleColumnImageHeight / 2);
    const planeZ = points[0].geometry.vertices[0].z;

    plane.position.x = planeX;
    plane.position.y = planeY;
    plane.position.z = planeZ;

    points[0][4] = plane;

    middleColumnCircumference += middleColumnImageHeight;
  });

  let rightColumnCircumference = 0;

  rightColumn.forEach((points) => {
    const plane = createPlane({ width: 1, height: 1, widthSegments: 1, heightSegments: 1 });
    scene.add(plane);

    const planeX = points[0].geometry.vertices[0].x + (rightColumnWidth / 2);
    const planeY = points[0].geometry.vertices[0].y + (rightColumnImageHeight / 2);
    const planeZ = points[0].geometry.vertices[0].z;

    plane.position.x = planeX;
    plane.position.y = planeY;
    plane.position.z = planeZ;

    points[0][4] = plane;

    rightColumnCircumference += rightColumnImageHeight;
  });
  */




  document.body.appendChild(renderer.domElement);

  animate();
}

launchViz(6);
