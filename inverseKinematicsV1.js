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

function updateColumn(column, columnWidth, columnImageHeight, points) {
  for (let i = 0; i < column.length; i += 1) {
    // update points
    column[i][0].geometry.vertices[0].x = points[i].x - columnWidth / 2;
    column[i][0].geometry.vertices[0].y = points[i].y;
    column[i][0].geometry.vertices[0].z = points[i].z;
    column[i][0].geometry.verticesNeedUpdate = true;
    column[i][1].geometry.vertices[0].x = points[i].x + columnWidth / 2;
    column[i][1].geometry.vertices[0].y = points[i].y;
    column[i][1].geometry.vertices[0].z = points[i].z;
    column[i][1].geometry.verticesNeedUpdate = true;
    column[i][2].geometry.vertices[0].x = points[i + 1].x - columnWidth / 2;
    column[i][2].geometry.vertices[0].y = points[i + 1].y;
    column[i][2].geometry.vertices[0].z = points[i + 1].z;
    column[i][2].geometry.verticesNeedUpdate = true;
    column[i][3].geometry.vertices[0].x = points[i + 1].x + columnWidth / 2;
    column[i][3].geometry.vertices[0].y = points[i + 1].y;
    column[i][3].geometry.vertices[0].z = points[i + 1].z;
    column[i][3].geometry.verticesNeedUpdate = true;
    // update plane
    column[i][4].geometry.vertices[0].x = points[i].x - columnWidth / 2;
    column[i][4].geometry.vertices[0].y = points[i].y;
    column[i][4].geometry.vertices[0].z = points[i].z;
    column[i][4].geometry.vertices[1].x = points[i].x + (columnWidth / 2);
    column[i][4].geometry.vertices[1].y = points[i].y;
    column[i][4].geometry.vertices[1].z = points[i].z;
    column[i][4].geometry.vertices[2].x = points[i + 1].x - columnWidth / 2;
    column[i][4].geometry.vertices[2].y = points[i + 1].y;
    column[i][4].geometry.vertices[2].z = points[i + 1].z;
    column[i][4].geometry.vertices[3].x = points[i + 1].x + columnWidth / 2;
    column[i][4].geometry.vertices[3].y = points[i + 1].y;
    column[i][4].geometry.vertices[3].z = points[i + 1].z;
    column[i][4].geometry.verticesNeedUpdate = true;

    // If I switch to using BufferGeometry, then I should use:
    // geometry.attributes.position.needsUpdate = true;
  }
}

function launchViz(numImages) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  const renderer = new THREE.WebGLRenderer(antialias = true);
  renderer.setSize(window.innerWidth, window.innerHeight);

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

  const middleColumnPoints = [];

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

    middleColumnPoints[n] = { x: xLeft + middleColumnWidth / 2, y: yBottom, z: 0 };

    const point1 = createPoint({ x: xRight, y: yBottom, z: 0, size: 3 });
    middleColumn[n][1] = point1;
    scene.add(point1);

    const point2 = createPoint({ x: xLeft, y: yTop, z: 0, size: 3 });
    middleColumn[n][2] = point2;
    scene.add(point2);

    const lastImage = (i == middleColumnEnd - 1);
    if (lastImage) {
        middleColumnPoints[n + 1] = { x: xLeft + middleColumnWidth / 2, y: yTop, z: 0 };
    }

    const point3 = createPoint({ x: xRight, y: yTop, z: 0, size: 3 });
    middleColumn[n][3] = point3;
    scene.add(point3);
  }

  let middleColumnCircumference = 0;

  for (let i = 0; i < middleColumn.length; i += 1) {
    const plane = createPlane({ width: 1, height: 1, widthSegments: 1, heightSegments: 1 });
    scene.add(plane);

    const planeX = 0;// middleColumn[i][0].geometry.vertices[0].x + (middleColumnWidth / 2);
    const planeY = 0;// middleColumn[i][0].geometry.vertices[0].y + (middleColumnImageHeight / 2);
    const planeZ = 0;// middleColumn[i][0].geometry.vertices[0].z;

    plane.position.x = planeX;
    plane.position.y = planeY;
    plane.position.z = planeZ;

    middleColumn[i][4] = plane;

    middleColumnCircumference += middleColumnImageHeight;
  }

  // images stream up from offscrean and flow off to combine into object
  /*
  const goalPos = { x: 0, y: 2, z: -5 };

  const points = fabrik(middleColumnPoints, goalPos);

  updateColumn(middleColumn, middleColumnWidth, middleColumnImageHeight, points);
  */
/*
  let goalPos = { x: 2, y: 2, z: 0 };

  let points = fabrik(middleColumnPoints, goalPos);

  updateColumn(middleColumn, middleColumnWidth, middleColumnImageHeight, points);
  */

  document.body.appendChild(renderer.domElement);


  // updateColumn(middleColumn, middleColumnWidth, middleColumnImageHeight, points);

  /*
  document.addEventListener( 'mousewheel', function(e) {
    // console.log("scrolled")
    window.xVal = 1;
    console.log(xVal);
  }, false );

  window.addEventListener("wheel", function(e) {
    console.log("scrolled")
    xVal = 1;
    console.log(xVal);
  }, true);

  function animate() {
    requestAnimationFrame(animate);

    goalPos = { x: window.xVal, y: 2, z: 0 };

    points = fabrik(middleColumnPoints, goalPos);
    console.log(goalPos.x);
    updateColumn(middleColumn, middleColumnWidth, middleColumnImageHeight, points);

    renderer.render(scene, camera);
  }
  */


  // animate();
  // renderer.render(scene, camera);

  // console.log(middleColumn);

  let moveRight = true;
  const xRightMax = 3;
  const xLeftMax = -3;

  let xVal = 1;

  window.setInterval(function(){
    if (xVal > xRightMax) {
      moveRight = false;
    }
    if (xVal < xLeftMax) {
      moveRight = true;
    }
    if (moveRight) {
      xVal += 0.1;
    } else {
      xVal -= 0.1;
    }

    const goalPos = { x: xVal, y: 0, z: 0 };
    const points = fabrik(middleColumnPoints, goalPos);

    console.log(points);
    updateColumn(middleColumn, middleColumnWidth, middleColumnImageHeight, points);

    // animate();
    renderer.render(scene, camera);
  }, 100);
}

// ---------------------------- Inverse Kinematics ----------------------------

function distance(firstPoint, secondPoint) {
  const xDif = Math.abs(secondPoint.x - firstPoint.x);
  const yDif = Math.abs(secondPoint.y - firstPoint.y);
  const zDif = Math.abs(secondPoint.z - firstPoint.z);

  const dist = Math.sqrt(xDif * xDif + yDif * yDif + zDif * zDif);

  return dist;
}

function needToMove(endEffectorPos, goalPos, epsilon) {
  const distFromGoal = distance(endEffectorPos, goalPos);

  return (distFromGoal > epsilon);
}

function targetReachable(points, goalPos) {
  // console.log('Checking if the target is reachable');
  const basePoint = points[0];
  let maxReach = 0;

  let lastPoint = basePoint;
  points.forEach((point) => {
    maxReach += distance(lastPoint, point);
    lastPoint = point;
  });

  // console.log('Max reach is ' + maxReach);

  const distFromGoal = distance(basePoint, goalPos);

  return (distFromGoal <= maxReach);
}

function reachUntilMaxInDirection(direction) {
  // TODO: Make points travel along unit vector towards input direction
  console.log('Unimplemented: Reaching until max');
}

function findMagnitude(vector) {
  const xSqrd = vector.x * vector.x;
  const ySqrd = vector.y * vector.y;
  const zSqrd = vector.z * vector.z;

  const mag = Math.sqrt(xSqrd + ySqrd + zSqrd);

  return mag;
}

function normalize(vector) {
  const mag = findMagnitude(vector);

  const normX = vector.x / mag;
  const normY = vector.y / mag;
  const normZ = vector.z / mag;

  const normVec = { x: normX, y: normY, z: normZ };

  return normVec;
}

// Part one
function fabrik_finalToRoot(points, goalPos) {
  let currentGoal = goalPos;

  for (let i = points.length - 1; i > 0; i -= 1) {
    const length = distance(points[i - 1], points[i]);

    points[i] = {
      x: currentGoal.x,
      y: currentGoal.y,
      z: currentGoal.z,
    };

    const lineCurGoalToCurManip = {
      x: points[i - 1].x - currentGoal.x,
      y: points[i - 1].y - currentGoal.y,
      z: points[i - 1].z - currentGoal.z,
    }

    const lineDirection = normalize(lineCurGoalToCurManip);

    const updatedLength = {
      x: lineDirection.x * length,
      y: lineDirection.y * length,
      z: lineDirection.z * length,
    };

    currentGoal = {
      x: currentGoal.x + updatedLength.x,
      y: currentGoal.y + updatedLength.y,
      z: currentGoal.z + updatedLength.z,
    }
  }

  return points;
}

// Part two
function fabrik_rootToFinal(points, goalPos, length) {
  let base = points[0];

  for(let i = 0; i < points.length - 1; i += 1) {
    // const length = distance(points[i], points[i + 1]);

    const lineCurGoalToCurPt = {
      x: points[i + 1].x - points[i].x,
      y: points[i + 1].y - points[i].y,
      z: points[i + 1].z - points[i].z,
    }

    const lineDirection = normalize(lineCurGoalToCurPt);

    const updatedLength = {
      x: lineDirection.x * length,
      y: lineDirection.y * length,
      z: lineDirection.z * length,
    };

    // This is where constraint adjustment would happen.
    // Adjust the point before assigning it
    points[i + 1] = {
      x: points[i].x + updatedLength.x,
      y: points[i].y + updatedLength.y,
      z: points[i].z + updatedLength.z,
    }
  }

  return points;
}

function fabrik(points, goalPos, length = 1, epsilon = 0.05) {
  if (targetReachable(points, goalPos)) {
    // console.log('Target reachable, running FABRIK');

    let endEffectorPos = points[points.length - 1];

    while(needToMove(endEffectorPos, goalPos, epsilon)) {
      points = fabrik_finalToRoot(points, goalPos); // Part one
      points = fabrik_rootToFinal(points, goalPos, length); // Part two

      endEffectorPos = points[points.length - 1];
    }
  } else {
    // console.log('Target not reachable');
    const direction = normalize(goalPos);
    reachUntilMaxInDirection();
  }

  return points;
  // moveArm(points);
}

function testFabrik() {
  // console.log('testing FABRIK');
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  renderer = new THREE.WebGLRenderer(antialias = true);
  renderer.setSize(window.innerWidth, window.innerHeight);

  function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
  }

  const point0 = createPoint({ x: 0, y: 0, z: 0, size: 3});
  const point1 = createPoint({ x: 0, y: 1, z: 0, size: 3});
  const point2 = createPoint({ x: 0, y: 2, z: 0, size: 3});

  scene.add(point0);
  scene.add(point1);
  scene.add(point2);

  let points = [
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 0, y: 2, z: 0 }
  ];

  const goalPos = { x: 0, y: 2, z: 0 };

  points = fabrik(points, goalPos);

  point0.geometry.vertices[0].x = points[0].x;
  point0.geometry.vertices[0].y = points[0].y;
  point0.geometry.vertices[0].z = points[0].z;

  point1.geometry.vertices[0].x = points[1].x;
  point1.geometry.vertices[0].y = points[1].y;
  point1.geometry.vertices[0].z = points[1].z;

  point2.geometry.vertices[0].x = points[2].x;
  point2.geometry.vertices[0].y = points[2].y;
  point2.geometry.vertices[0].z = points[2].z;

  document.body.appendChild(renderer.domElement);

  animate();
}

//testFabrik();
launchViz(40);
