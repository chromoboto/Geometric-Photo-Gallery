let canReachFarther = true;

// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
const keys = {37: 1, 38: 1, 39: 1, 40: 1};

function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;
}

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

function disableScroll() {
  if (window.addEventListener) // older FF
      window.addEventListener('DOMMouseScroll', preventDefault, false);
  window.onwheel = preventDefault; // modern standard
  window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
  window.ontouchmove  = preventDefault; // mobile
  document.onkeydown  = preventDefaultForScrollKeys;
}

function enableScroll() {
    if (window.removeEventListener)
        window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.onmousewheel = document.onmousewheel = null;
    window.onwheel = null;
    window.ontouchmove = null;
    document.onkeydown = null;
}

function createPoint({ x, y, z , size }) {
  const pointGeometry = new THREE.Geometry();
  pointGeometry.vertices.push(new THREE.Vector3(x, y, z));

  const pointMaterial = new THREE.PointsMaterial({ size, sizeAttenuation: false, color: 0xffffff }); // 0x000000

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

    if (points[i].y < -10) {
      column[i][4].traverse((child) => {
          if (child instanceof THREE.Mesh) {
              child.visible = true;
          }
      });
    }

    // If I switch to using BufferGeometry, then I should use:
    // geometry.attributes.position.needsUpdate = true;
  }
}

function moveTowards(currentVal, goalVal, moveSpeed) {
  let newVal = currentVal;
  if (currentVal < goalVal) {
    const distLeft = goalVal - currentVal
    if (distLeft < moveSpeed) {
      newVal = currentVal + distLeft;
    } else {
      newVal = currentVal + moveSpeed;
    }
  }
  if (currentVal > goalVal) {
    const distLeft = currentVal - goalVal
    if (distLeft < moveSpeed) {
      newVal = currentVal - distLeft;
    } else {
      newVal = currentVal - moveSpeed;
    }
  }
  if (currentVal == goalVal) {
    return { reached: true, newVal };
  }
  return { reached: false, newVal };
}

function launchViz(numImages) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 1000);
  camera.position.z = 5.5;
  camera.position.y = -1.5;
  const renderer = new THREE.WebGLRenderer(antialias = true);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // each image consists of 4 points and a plane

  // Images are distributed into one of 3 columns
  const leftColumn = [];
  const middleColumn = [];
  const rightColumn = [];

  const leftColumnWidth = 3;
  const middleColumnWidth = 3;
  const rightColumnWidth = 3;

  const leftColumnImageHeight = 3;
  const middleColumnImageHeight = 3;
  const rightColumnImageHeight = 3;

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

    const middleHeight = Math.floor((middleColumnEnd - middleColumnStart) / 2) * 0.1;

    const yBottom = n * 0.1 - middleHeight - heightShift;
    const yTop = (n + 1) * 0.1 - middleHeight - heightShift;

    const point0 = createPoint({ x: xLeft, y: yBottom, z: 0, size: 3 });
    middleColumn[n][0] = point0;

    point0.traverse((object) => {
      object.frustumCulled = false;
    });

    scene.add(point0);

    middleColumnPoints[n] = { x: xLeft + middleColumnWidth / 2, y: yBottom, z: 0 };

    const point1 = createPoint({ x: xRight, y: yBottom, z: 0, size: 3 });
    middleColumn[n][1] = point1;

    point1.traverse((object) => {
      object.frustumCulled = false;
    });

    scene.add(point1);

    const point2 = createPoint({ x: xLeft, y: yTop, z: 0, size: 3 });
    middleColumn[n][2] = point2;

    point2.traverse((object) => {
      object.frustumCulled = false;
    });

    scene.add(point2);

    const lastImage = (i == middleColumnEnd - 1);
    if (lastImage) {
        middleColumnPoints[n + 1] = { x: xLeft + middleColumnWidth / 2, y: yTop, z: 0 };
    }

    const point3 = createPoint({ x: xRight, y: yTop, z: 0, size: 3 });
    middleColumn[n][3] = point3;

    point3.traverse((object) => {
      object.frustumCulled = false;
    });

    scene.add(point3);
  }

  let middleColumnCircumference = 0;

  for (let i = 0; i < middleColumn.length; i += 1) {
    const plane = createPlane({ width: 3, height: 3, widthSegments: 1, heightSegments: 1 });

    plane.traverse((child) => {
      child.frustumCulled = false;

      if (child instanceof THREE.Mesh) {
          child.visible = false;
      }
    });

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

  // ----- Left
  const leftColumnPoints = [];

  for(let i = leftColumnStart; i < leftColumnEnd; i += 1) {
    const n = i - leftColumnStart;

    leftColumn[n] = [];

    const xLeft = (-middleColumnWidth / 2) - leftColumnWidth - spacingGap;
    const xRight = (-middleColumnWidth / 2) - spacingGap;

    let heightShift = 0;
    if (((leftColumnEnd - leftColumnStart) % 2) > 0) {
      heightShift = (leftColumnImageHeight / 2)
    }

    const middleHeight = Math.floor((leftColumnEnd - leftColumnStart) / 2) * 0.1;

    const yBottom = n * 0.1 - middleHeight - heightShift;
    const yTop = (n + 1) * 0.1 - middleHeight - heightShift;

    const point0 = createPoint({ x: xLeft, y: yBottom, z: 0, size: 3 });
    leftColumn[n][0] = point0;

    point0.traverse((object) => {
      object.frustumCulled = false;
    });

    scene.add(point0);

    leftColumnPoints[n] = { x: xLeft + leftColumnWidth / 2, y: yBottom, z: 0 };

    const point1 = createPoint({ x: xRight, y: yBottom, z: 0, size: 3 });
    leftColumn[n][1] = point1;

    point1.traverse((object) => {
      object.frustumCulled = false;
    });

    scene.add(point1);

    const point2 = createPoint({ x: xLeft, y: yTop, z: 0, size: 3 });
    leftColumn[n][2] = point2;

    point2.traverse((object) => {
      object.frustumCulled = false;
    });

    scene.add(point2);

    const lastImage = (i == leftColumnEnd - 1);
    if (lastImage) {
        leftColumnPoints[n + 1] = { x: xLeft + leftColumnWidth / 2, y: yTop, z: 0 };
    }

    const point3 = createPoint({ x: xRight, y: yTop, z: 0, size: 3 });
    leftColumn[n][3] = point3;

    point3.traverse((object) => {
      object.frustumCulled = false;
    });

    scene.add(point3);
  }

  let leftColumnCircumference = 0;

  for (let i = 0; i < leftColumn.length; i += 1) {
    const plane = createPlane({ width: 3, height: 3, widthSegments: 1, heightSegments: 1 });

    plane.traverse((child) => {
      child.frustumCulled = false;

      if (child instanceof THREE.Mesh) {
          child.visible = false;
      }
    });

    scene.add(plane);

    const planeX = 0;// middleColumn[i][0].geometry.vertices[0].x + (middleColumnWidth / 2);
    const planeY = 0;// middleColumn[i][0].geometry.vertices[0].y + (middleColumnImageHeight / 2);
    const planeZ = 0;// middleColumn[i][0].geometry.vertices[0].z;

    plane.position.x = planeX;
    plane.position.y = planeY;
    plane.position.z = planeZ;

    leftColumn[i][4] = plane;

    leftColumnCircumference += leftColumnImageHeight;
  }

  // ----- Right
  const rightColumnPoints = [];

  for(let i = rightColumnStart; i < rightColumnEnd; i += 1) {
    const n = i - rightColumnStart;

    rightColumn[n] = [];

    const xLeft = (middleColumnWidth / 2) + spacingGap;
    const xRight = (middleColumnWidth / 2) + rightColumnWidth + spacingGap;

    let heightShift = 0;
    if (((rightColumnEnd - rightColumnStart) % 2) > 0) {
      heightShift = (rightColumnImageHeight / 2)
    }

    const middleHeight = Math.floor((rightColumnEnd - rightColumnStart) / 2) * 0.1;

    const yBottom = n * 0.1 - middleHeight - heightShift;
    const yTop = (n + 1) * 0.1 - middleHeight - heightShift;

    const point0 = createPoint({ x: xLeft, y: yBottom, z: 0, size: 3 });
    rightColumn[n][0] = point0;

    point0.traverse((object) => {
      object.frustumCulled = false;
    });

    scene.add(point0);

    rightColumnPoints[n] = { x: xLeft + rightColumnWidth / 2, y: yBottom, z: 0 };

    const point1 = createPoint({ x: xRight, y: yBottom, z: 0, size: 3 });
    rightColumn[n][1] = point1;

    point1.traverse((object) => {
      object.frustumCulled = false;
    });

    scene.add(point1);

    const point2 = createPoint({ x: xLeft, y: yTop, z: 0, size: 3 });
    rightColumn[n][2] = point2;

    point2.traverse((object) => {
      object.frustumCulled = false;
    });

    scene.add(point2);

    const lastImage = (i == rightColumnEnd - 1);
    if (lastImage) {
        rightColumnPoints[n + 1] = { x: xLeft + rightColumnWidth / 2, y: yTop, z: 0 };
    }

    const point3 = createPoint({ x: xRight, y: yTop, z: 0, size: 3 });
    rightColumn[n][3] = point3;

    point3.traverse((object) => {
      object.frustumCulled = false;
    });

    scene.add(point3);
  }

  let rightColumnCircumference = 0;

  for (let i = 0; i < rightColumn.length; i += 1) {
    const plane = createPlane({ width: 3, height: 3, widthSegments: 1, heightSegments: 1 });

    plane.traverse((child) => {
      child.frustumCulled = false;

      if (child instanceof THREE.Mesh) {
          child.visible = false;
      }
    });

    scene.add(plane);

    const planeX = 0;// middleColumn[i][0].geometry.vertices[0].x + (middleColumnWidth / 2);
    const planeY = 0;// middleColumn[i][0].geometry.vertices[0].y + (middleColumnImageHeight / 2);
    const planeZ = 0;// middleColumn[i][0].geometry.vertices[0].z;

    plane.position.x = planeX;
    plane.position.y = planeY;
    plane.position.z = planeZ;

    rightColumn[i][4] = plane;

    rightColumnCircumference += rightColumnImageHeight;
  }

  // --------------------------------------------------------------------------

  document.body.appendChild(renderer.domElement);

  // --------------------------------------------------------------------------

  const crunchedPosition = { x: 0, y: -1, z: 0 };
  const extendedPosition = { x: 0, y: 2, z: 15 }; // { x: 0, y: 2, z: 3 };
  const downPosition = { x: 0, y: -999999999999, z: 0 };

  const homePosition = { x: 0, y: -1.5, z: 5.5 };
  const backPosition = { x: 0, y: -1.5, z: 25 };
  const viewingOriginPosition = { x: 0, y: -40, z: 60 };// { x: 0, y: -30, z: 7 };

  const moveCycle = [crunchedPosition, extendedPosition, downPosition];
  const cameraMoveCyle = [homePosition, backPosition, viewingOriginPosition];
  let currentGoalMoveIndex = 1;

  let xVal = crunchedPosition.x + 0.0001; // cant be 0?
  let yVal = crunchedPosition.y;
  let zVal = crunchedPosition.z;

  disableScroll();

  let nextIndex = 1;
  let previousIndex = 0;

  let camX = camera.position.x;
  let camY = camera.position.y;
  let camZ = camera.position.z;

  const moveSpeed = 0.25;

  let galleryMode = false;

  window.addEventListener("wheel", function(e) {
    if (galleryMode) {
      // pass
    } else {
      if (e.deltaY > 0) {
        currentGoalMoveIndex = nextIndex;
      } else {
        currentGoalMoveIndex = previousIndex;
      }

      //if (e.deltaY < 0) {
      const goalXVal = moveCycle[currentGoalMoveIndex].x;
      const goalYVal = moveCycle[currentGoalMoveIndex].y;
      const goalZVal = moveCycle[currentGoalMoveIndex].z;

      const oldYVal = xVal;

      const xMove = moveTowards(xVal, goalXVal, moveSpeed);
      xVal = xMove.newVal;
      const yMove = moveTowards(yVal, goalYVal, moveSpeed);
      yVal = yMove.newVal;
      const zMove = moveTowards(zVal, goalZVal, moveSpeed);
      zVal = zMove.newVal;

      let camGoalXVal = cameraMoveCyle[currentGoalMoveIndex].x;
      let camGoalYVal = cameraMoveCyle[currentGoalMoveIndex].y;
      let camGoalZVal = cameraMoveCyle[currentGoalMoveIndex].z;

      if ((yVal > -5) && (currentGoalMoveIndex == 2)) {
        camGoalXVal = cameraMoveCyle[1].x;
        camGoalYVal = cameraMoveCyle[1].y;
        camGoalZVal = cameraMoveCyle[1].z;
      }

      if (yVal < -5) {
        camGoalXVal = cameraMoveCyle[2].x;
        camGoalYVal = cameraMoveCyle[2].y;
        camGoalZVal = cameraMoveCyle[2].z;

        galleryMode = true;
      }

      const camXMove = moveTowards(camX, camGoalXVal, moveSpeed);
      camX = camXMove.newVal;
      const camYMove = moveTowards(camY, camGoalYVal, moveSpeed);
      camY = camYMove.newVal;
      const camZMove = moveTowards(camZ, camGoalZVal, moveSpeed * 2);
      camZ = camZMove.newVal;

      if ((!canReachFarther) && (currentGoalMoveIndex == 2)) {
        console.log("!!!!!");
      }

      if (xMove.reached == true && yMove.reached == true && zMove.reached == true) {
        if ((nextIndex > 1) && (e.deltaY < 0)) {
          nextIndex -= 1;
        }
        if ((previousIndex > 0) && (e.deltaY < 0)) {
          previousIndex -= 1;
        }
        if ((nextIndex < (moveCycle.length - 1)) && (e.deltaY > 0)) {
          nextIndex += 1;
        }
        if ((previousIndex < (moveCycle.length - 2)) && (e.deltaY > 0)) {
          previousIndex += 1;
        }
      }
    }
  }, true);

  window.setInterval(function() {
    if (galleryMode) {
      const xMove = moveTowards(xVal, downPosition.x, moveSpeed * 2);
      xVal = xMove.newVal;
      const yMove = moveTowards(yVal, downPosition.y, moveSpeed * 2);
      yVal = yMove.newVal;
      const zMove = moveTowards(zVal, downPosition.z, moveSpeed * 2);
      zVal = zMove.newVal;

      camGoalXVal = cameraMoveCyle[2].x;
      camGoalYVal = cameraMoveCyle[2].y;
      camGoalZVal = cameraMoveCyle[2].z;

      const camXMove = moveTowards(camX, camGoalXVal, moveSpeed);
      camX = camXMove.newVal;
      const camYMove = moveTowards(camY, camGoalYVal, moveSpeed);
      camY = camYMove.newVal;
      const camZMove = moveTowards(camZ, camGoalZVal, moveSpeed);
      camZ = camZMove.newVal;
    }

    const middleGoalPos = { x: xVal, y: yVal, z: zVal };
    const middlePoints = fabrik(middleColumnPoints, middleGoalPos);


    if (middlePoints) {
      updateColumn(middleColumn, middleColumnWidth, middleColumnImageHeight, middlePoints);
    } else {
      canReachFarther = false;
    }

    const leftGoalPos = { x: xVal - middleColumnWidth - spacingGap, y: yVal, z: zVal };
    const leftPoints = fabrik(leftColumnPoints, leftGoalPos);

    if (leftPoints) {
        updateColumn(leftColumn, leftColumnWidth, leftColumnImageHeight, leftPoints);
    }

    const rightGoalPos = { x: xVal + middleColumnWidth + spacingGap, y: yVal, z: zVal };
    const rightPoints = fabrik(rightColumnPoints, rightGoalPos);

    if (rightPoints) {
        updateColumn(rightColumn, rightColumnWidth, rightColumnImageHeight, rightPoints);
    }

    /*
    if (points) {
      updateColumn(middleColumn, middleColumnWidth, middleColumnImageHeight, middlePoints);
    } else {
      canReachFarther = false;
    }
    */

    // update camera
    camera.position.x = camX;
    camera.position.y = camY;
    camera.position.z = camZ;

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

  const isReachable = distFromGoal <= maxReach;

  return { isReachable, maxReach };
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

function fabrik(points, goalPos, length = 3, epsilon = 0.05) {
  const { isReachable, maxReach } = targetReachable(points, goalPos)
  // console.log(isReachable, maxReach);
  if (isReachable) {
    // console.log('Target reachable, running FABRIK');

    let endEffectorPos = points[points.length - 1];

    while(needToMove(endEffectorPos, goalPos, epsilon)) {
      points = fabrik_finalToRoot(points, goalPos); // Part one
      points = fabrik_rootToFinal(points, goalPos, length); // Part two

      endEffectorPos = points[points.length - 1];
    }
  } else {
    // console.log('Target not reachable');
    // console.log('Target not reachable');
    const direction = normalize(goalPos);
    // reach until max in direction of goal
    const reachGoalX = direction.x * (maxReach * 0.99);
    const reachGoalY = direction.y * (maxReach * 0.99);
    const reachGoalZ = direction.z * (maxReach * 0.99);

    reachGoalPos = { x: reachGoalX, y: reachGoalY, z: reachGoalZ };

    // console.log(reachGoalPos);

    return fabrik(points, reachGoalPos);
  }

  return points;
  // moveArm(points);
}

function testFabrik() {
  // console.log('testing FABRIK');
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 3;
  renderer = new THREE.WebGLRenderer(antialias = true);
  renderer.setSize(window.innerWidth, window.innerHeight);

  function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
  }

  const point0 = createPoint({ x: 0, y: 0, z: 0, size: 3});
  const point1 = createPoint({ x: 0, y: 1, z: 0, size: 3});
  const point2 = createPoint({ x: 0, y: 2, z: 0, size: 3});

  point0.traverse((object) => {
    object.frustumCulled = false;
  });

  scene.add(point0);

  point1.traverse((object) => {
    object.frustumCulled = false;
  });

  scene.add(point1);

  point2.traverse((object) => {
    object.frustumCulled = false;
  });

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
launchViz(99);
