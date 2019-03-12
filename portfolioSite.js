/*******************************************************************************
By Noah Trueblood
*******************************************************************************/

const imagePadding = 0.2;

function scrollTextOpacity(factor) {
  const maxOpacity = 0.4;
  const opacity = factor * maxOpacity;

  document.getElementById("scrollEncouragement").style.opacity = opacity;
}

function setupModel() {
  const modal = document.getElementById('myModal');
  // Get the <span> element that closes the modal
  const span = document.getElementsByClassName("close")[0];

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
  }
}

function modalOpen() {
  // Get the modal
  const modal = document.getElementById('myModal');

  // Get the image
  // const val = document.getElementById('imagename').value;
  // src = 'http://webpage.com/images/' + val +'.png',
  // img = document.createElement('img');
  const src = 'https://upload.wikimedia.org/wikipedia/commons/d/dc/PLoSBiol4.e126.Fig6fNeuron.jpg';
  const img = document.createElement('img');
  img.src = src;
  img.alt = "hello world";

  // Get the image and insert it inside the modal - use its "alt" text as a caption
  //const img = document.getElementById('myImg');
  const modalImg = document.getElementById("img01");
  const captionText = document.getElementById("caption");

  modal.style.display = "block";
  modalImg.src = img.src;
  captionText.innerHTML = img.alt;
}

// Synchronizez the column geometry to the associated points
function updateColumn(column, columnWidth, columnImageHeight, points, lines) {
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
    column[i][4].geometry.vertices[0].x = points[i + 1].x - columnWidth / 2 + imagePadding;
    column[i][4].geometry.vertices[0].y = points[i + 1].y - imagePadding;
    column[i][4].geometry.vertices[0].z = points[i + 1].z;
    column[i][4].geometry.vertices[1].x = points[i + 1].x + columnWidth / 2 - imagePadding;
    column[i][4].geometry.vertices[1].y = points[i + 1].y - imagePadding;
    column[i][4].geometry.vertices[1].z = points[i + 1].z;
    column[i][4].geometry.vertices[2].x = points[i].x - columnWidth / 2 + imagePadding;
    column[i][4].geometry.vertices[2].y = points[i].y + imagePadding;
    column[i][4].geometry.vertices[2].z = points[i].z;
    column[i][4].geometry.vertices[3].x = points[i].x + (columnWidth / 2) - imagePadding;
    column[i][4].geometry.vertices[3].y = points[i].y + imagePadding;
    column[i][4].geometry.vertices[3].z = points[i].z;
    column[i][4].geometry.verticesNeedUpdate = true;

    const { line0, line1 } = lines[i];

    line0.geometry.vertices[0].x = points[i].x - columnWidth / 2;
    line0.geometry.vertices[0].y = points[i].y;
    line0.geometry.vertices[0].z = points[i].z;
    line0.geometry.vertices[1].x = points[i + 1].x + columnWidth / 2;
    line0.geometry.vertices[1].y = points[i + 1].y;
    line0.geometry.vertices[1].z = points[i + 1].z;
    line0.geometry.verticesNeedUpdate = true;

    line1.geometry.vertices[0].x = points[i].x + columnWidth / 2;
    line1.geometry.vertices[0].y = points[i].y;
    line1.geometry.vertices[0].z = points[i].z;
    line1.geometry.vertices[1].x = points[i + 1].x - columnWidth / 2;
    line1.geometry.vertices[1].y = points[i + 1].y;
    line1.geometry.vertices[1].z = points[i + 1].z;
    line1.geometry.verticesNeedUpdate = true;

    const imageFadeInY = 10;

    if (points[i].y > imageFadeInY) {
      line0.visible = false;
      line1.visible = false;
      column[i][4].traverse((child) => {
          if (child instanceof THREE.Mesh) {
              child.visible = true;
          }
      });
    } else {
      line0.visible = true;
      line1.visible = true;
      column[i][4].traverse((child) => {
          if (child instanceof THREE.Mesh) {
              child.visible = false;
          }
      });
    }

    // If I switch to using BufferGeometry, then I should use:
    // geometry.attributes.position.needsUpdate = true;
  }
}

function launchViz(numImages) {
  setupModel();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 1000);
  camera.position.z = 5.5;
  camera.position.y = -0.5;
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // each image consists of 4 points and a plane

  // Images are distributed into one of 3 columns
  const leftColumn = [];
  const middleColumn = [];
  const rightColumn = [];

  // 1440, 789
  const leftColumnWidth = 3; //(window.innerWidth / window.innerHeight) * 1.7;
  const middleColumnWidth = 3;//(window.innerWidth / window.innerHeight) * 1.7;
  const rightColumnWidth = 3;//(window.innerWidth / window.innerHeight) * 1.7;
  const leftColumnHeight = 3;//window.innerWidth / window.innerHeight;
  const middleColumnHeight = 3;//window.innerWidth / window.innerHeight;
  const rightColumnHeight = 3;//window.innerWidth / window.innerHeight;

  const leftColumnImageWidth = 3;//(window.innerWidth / window.innerHeight) * 1.7;
  const middleColumnImageWidth = 3;//(window.innerWidth / window.innerHeight) * 1.7;
  const rightColumnImageWidth = 3;//(window.innerWidth / window.innerHeight) * 1.7;
  const leftColumnImageHeight = 3;//window.innerHeight / window.innerWidth;
  const middleColumnImageHeight = 3;//window.innerHeight / window.innerWidth;
  const rightColumnImageHeight = 3;//window.innerHeight / window.innerWidth;

  const leftColumnStart = 0;
  const leftColumnEnd = Math.floor(numImages/3);
  const middleColumnStart = leftColumnEnd;
  const middleColumnEnd = Math.ceil(numImages/3) * 2;
  const rightColumnStart = middleColumnEnd;
  const rightColumnEnd = numImages;

  const spacingGap = 0;

  const scrunchFactor = Math.random() * 0.05 + 0.035;

  // ---- Middle
  const middleColumnPoints = [];
  const middleColumnLines = [];

  for(let i = middleColumnStart; i < middleColumnEnd; i += 1) {
    const n = i - middleColumnStart;

    middleColumn[n] = [];

    const xLeft = -middleColumnWidth / 2;
    const xRight = middleColumnWidth / 2;

    let heightShift = 0;
    if (((middleColumnEnd - middleColumnStart) % 2) > 0) {
      heightShift = middleColumnImageHeight / 2;;
    }

    const middleHeight = Math.floor((middleColumnEnd - middleColumnStart) / 2) * scrunchFactor;

    const yBottom = n * scrunchFactor - middleHeight - heightShift;
    const yTop = (n + 1) * scrunchFactor - middleHeight - heightShift;

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

    const line0 = createLine({ x0: xLeft, y0: yBottom, z0: 0, x1: xRight, y1: yTop, z1: 0 });

    line0.traverse((object) => {
      object.frustumCulled = false;
    });

    scene.add(line0);

    const line1 = createLine({ x0: xLeft, y0: yTop, z0: 0, x1: xRight, y1: yBottom, z1: 0 });

    line1.traverse((object) => {
      object.frustumCulled = false;
    });

    scene.add(line1);

    middleColumnLines[n] = { line0, line1 };
  }

  let middleColumnCircumference = 0;

  for (let i = 0; i < middleColumn.length; i += 1) {
    const plane = createPlane({ width: middleColumnImageWidth, height: middleColumnImageHeight, widthSegments: 1, heightSegments: 1 });

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
  const leftColumnLines = [];

  for(let i = leftColumnStart; i < leftColumnEnd; i += 1) {
    const n = i - leftColumnStart;

    leftColumn[n] = [];

    const xLeft = (-middleColumnWidth / 2) - leftColumnWidth - spacingGap;
    const xRight = (-middleColumnWidth / 2) - spacingGap;

    let heightShift = 0;
    if (((leftColumnEnd - leftColumnStart) % 2) > 0) {
      heightShift = (leftColumnImageHeight / 2)
    }

    const middleHeight = Math.floor((leftColumnEnd - leftColumnStart) / 2) * scrunchFactor;

    const yBottom = n * scrunchFactor - middleHeight - heightShift;
    const yTop = (n + 1) * scrunchFactor - middleHeight - heightShift;

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

    const line0 = createLine({ x0: xLeft, y0: yBottom, z0: 0, x1: xRight, y1: yTop, z1: 0 });

    line0.traverse((object) => {
      object.frustumCulled = false;
    });

    scene.add(line0);

    const line1 = createLine({ x0: xLeft, y0: yTop, z0: 0, x1: xRight, y1: yBottom, z1: 0 });

    line1.traverse((object) => {
      object.frustumCulled = false;
    });

    scene.add(line1);

    leftColumnLines[n] = { line0, line1 };

  }

  let leftColumnCircumference = 0;

  for (let i = 0; i < leftColumn.length; i += 1) {
    const plane = createPlane({ width: leftColumnImageWidth, height: leftColumnImageHeight, widthSegments: 1, heightSegments: 1 });

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
  const rightColumnLines = [];

  for(let i = rightColumnStart; i < rightColumnEnd; i += 1) {
    const n = i - rightColumnStart;

    rightColumn[n] = [];

    const xLeft = (middleColumnWidth / 2) + spacingGap;
    const xRight = (middleColumnWidth / 2) + rightColumnWidth + spacingGap;

    let heightShift = 0;
    if (((rightColumnEnd - rightColumnStart) % 2) > 0) {
      heightShift = (rightColumnImageHeight / 2)
    }

    const middleHeight = Math.floor((rightColumnEnd - rightColumnStart) / 2) * scrunchFactor;

    const yBottom = n * scrunchFactor - middleHeight - heightShift;
    const yTop = (n + 1) * scrunchFactor - middleHeight - heightShift;

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

    const line0 = createLine({ x0: xLeft, y0: yBottom, z0: 0, x1: xRight, y1: yTop, z1: 0 });

    line0.traverse((object) => {
      object.frustumCulled = false;
    });

    scene.add(line0);

    const line1 = createLine({ x0: xLeft, y0: yTop, z0: 0, x1: xRight, y1: yBottom, z1: 0 });

    line1.traverse((object) => {
      object.frustumCulled = false;
    });

    scene.add(line1);

    rightColumnLines[n] = { line0, line1 };
  }

  let rightColumnCircumference = 0;

  for (let i = 0; i < rightColumn.length; i += 1) {
    const plane = createPlane({ width: rightColumnImageWidth, height: rightColumnImageHeight, widthSegments: 1, heightSegments: 1 });

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

  // to adjust for screen aspect ratio
  const zCamOffset = (window.innerHeight / window.innerWidth) * 5;

  const crunchedPosition = { x: 0, y: -1, z: 0 };
  const extendedPosition = { x: 0, y: 2, z: 30 }; // { x: 0, y: 2, z: 3 };
  const downPosition = { x: 0, y: -20, z: 0 };
  const upPosition = { x: 0, y: 999999999999, z: 0 };
  const testPosition = { x: 0, y: -15, z: 15 };

  const homePosition = { x: 0, y: -0.5, z: 2.5 + zCamOffset };
  const backPosition = { x: 0, y: -0.5, z: 32 + zCamOffset };
  const viewingOriginPosition = { x: 0, y: -40, z: 37 + zCamOffset };// { x: 0, y: -30, z: 7 };
  const imageViewingPosition = { x: 0, y: -50, z: 3 + zCamOffset };
  const viewingOriginPosition_Up = { x: 0, y: 46, z: 47 + zCamOffset };// { x: 0, y: -30, z: 7 };
  const imageViewingPosition_Up = { x: 0, y: 45, z: 2.75 + zCamOffset };

  const moveCycle = [crunchedPosition, extendedPosition, downPosition, upPosition, upPosition];
  const cameraMoveCyle = [homePosition, backPosition, backPosition, viewingOriginPosition_Up, imageViewingPosition_Up];
  let currentGoalMoveIndex = 1;

  const viewingTransistionY = 30; // 45

  let xVal = crunchedPosition.x + 0.0001; // cant be 0?
  let yVal = crunchedPosition.y;
  let zVal = crunchedPosition.z;

  // disableScroll();

  let nextIndex = 1;
  let previousIndex = 0;

  let camX = camera.position.x;
  let camY = camera.position.y;
  let camZ = camera.position.z;

  let moveSpeed = 0;

  const memory = []; // for reversing the IK motion
  let scrubForward = false;
  let scrubBackward = false;
  let memoryIndex = 0;
  const maxMemoryIndex = 9500;

  const maxOpacityIndex = 100;

  let oldYVal = 0;

  // TODO: if the camera is in image viewing position then slow motion down.

  //DOMMouseScroll(firefox), mousewheel(chrome/most others), touchmove(mobile)

  /*
  let scroll = 0;
  let velocity = -0.2;
  let lastScroll = 0;
  */

  /*
  // for mobile
  let ts;
  window.addEventListener('touchstart', function (e) {
     ts = e.originalEvent.touches[0].clientY;
  });

  window.addEventListener('touchend', function (e) {
     var te = e.originalEvent.changedTouches[0].clientY;
     if (ts > te + 5){
       scrubForward = false;
       scrubBackward = true;
     } else if(ts < te - 5){
       scrubForward = true;
       scrubBackward = false;
     }
  });
  */
  /*
  window.addEventListener('wheel', function(e) {

  });
  */
  /*
  window.setInterval(() => {
    scroll = window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight);
    velocity = (velocity * 0.9 + (scroll - lastScroll));
    lastScroll = scroll;
  }, 100);
  */
  // let lastScrollTop = 0;

  //const body = document.getElementById("body");

/*
  window.addEventListener('scroll', function(e) {
    // console.log('scrolling');
    const diff = document.documentElement.scrollHeight - window.innerHeight;
    if (diff == 0) {

    }
    scroll = window.pageYOffset / ;
    velocity = (velocity * 0.99 + (scroll - lastScroll)) * 10;
    lastScroll = scroll;
  });
  */
  /*
  window.addEventListener('wheel', function (e) {
    if (e.deltaY > 0) {
      velocity = -1;
    } else if (e.deltaY < 0) {
      velocity = 1;
    }
  });
  */

  window.addEventListener('wheel', function (e) {
    if (e.deltaY > 0) {
      scrubForward = true;
      scrubBackward = false;
    } else if (e.deltaY < 0) {
      scrubForward = false;
      scrubBackward = true;
    }
  });

  window.setInterval(() => {
    if (scrubForward) {
      memoryIndex += 1;
    } else if (scrubBackward && (memoryIndex > 0)) {
      memoryIndex -= 1;
    }

    let opacityFactor= 0;

    if (memoryIndex > maxOpacityIndex) {
      opacityFactor = 0;
    } else {
      opacityFactor = 1 - memoryIndex / maxOpacityIndex;
    }

    scrollTextOpacity(opacityFactor);

    if (memoryIndex > maxMemoryIndex) {
      memoryIndex = maxMemoryIndex;
    }

    const sLI = 3;
    const lI = 4;

    const lastRecordedIndex = memory.length - 1;

    if (memoryIndex < lastRecordedIndex) {
      // get positions from memory
      const { leftPointsRecord, middlePointsRecord, rightPointsRecord, cameraPosRecord } = memory[memoryIndex];

      updateColumn(leftColumn, leftColumnWidth, leftColumnImageHeight, leftPointsRecord, leftColumnLines);
      updateColumn(middleColumn, middleColumnWidth, middleColumnImageHeight, middlePointsRecord, middleColumnLines);
      updateColumn(rightColumn, rightColumnWidth, rightColumnImageHeight, rightPointsRecord, rightColumnLines);

      camera.position.x = cameraPosRecord.camX;
      camera.position.y = cameraPosRecord.camY;
      camera.position.z = cameraPosRecord.camZ;
    } else if (memoryIndex > lastRecordedIndex) {
      currentGoalMoveIndex = nextIndex;

      const goalXVal = moveCycle[currentGoalMoveIndex].x;
      const goalYVal = moveCycle[currentGoalMoveIndex].y;
      const goalZVal = moveCycle[currentGoalMoveIndex].z;

      const minMoveSpeed = 0.1;
      const maxMoveSpeed = 1;

      const startMemoryIndex = 0;
      const endMemoryIndex = 225;

      const step = (maxMoveSpeed - minMoveSpeed) / (endMemoryIndex - startMemoryIndex);

      if (memoryIndex >= startMemoryIndex && memoryIndex < endMemoryIndex) {
        moveSpeed = maxMoveSpeed - step * memoryIndex;// * Math.abs(velocity);
      } else {
        moveSpeed = minMoveSpeed;// * Math.abs(velocity);
      }

      const xMove = moveTowards(xVal, goalXVal, moveSpeed);
      xVal = xMove.newVal;
      let yMove = moveTowards(yVal, goalYVal, moveSpeed);
      yVal = yMove.newVal;
      oldYVal = yVal;
      const zMove = moveTowards(zVal, goalZVal, moveSpeed);
      zVal = zMove.newVal;

      let camGoalXVal = cameraMoveCyle[currentGoalMoveIndex].x;
      let camGoalYVal = cameraMoveCyle[currentGoalMoveIndex].y;
      let camGoalZVal = cameraMoveCyle[currentGoalMoveIndex].z;

      if (yVal < viewingTransistionY) {
        camGoalXVal = cameraMoveCyle[1].x;
        camGoalYVal = cameraMoveCyle[1].y;
        camGoalZVal = cameraMoveCyle[1].z;

        if (nextIndex == lI) {
          nextIndex -= 1;
        }
      }

      if ((yVal > viewingTransistionY) && (currentGoalMoveIndex == sLI)) {
        camGoalXVal = cameraMoveCyle[2].x;
        camGoalYVal = cameraMoveCyle[2].y;
        camGoalZVal = cameraMoveCyle[2].z;

        galleryMode = true;

        nextIndex = lI;
      }

      const camXMove = moveTowards(camX, camGoalXVal, moveSpeed);
      camX = camXMove.newVal;
      let camYMove;
      if (currentGoalMoveIndex == lI) {
        camYMove = moveTowards(camY, camGoalYVal, moveSpeed * 3.25); // 2.75
        camY = camYMove.newVal;
      } else {
        camYMove = moveTowards(camY, camGoalYVal, moveSpeed);
        camY = camYMove.newVal;
      }
      const camZMove = moveTowards(camZ, camGoalZVal, moveSpeed * 2);
      camZ = camZMove.newVal;

      if (nextIndex != lI) {
        if (xMove.reached == true && yMove.reached == true && zMove.reached == true) {
          if ((nextIndex > 1) && scrubBackward) {
            nextIndex -= 1;
          }
          if ((previousIndex > 0) && scrubBackward) {
            previousIndex -= 1;
          }
          if ((nextIndex < (moveCycle.length - 1)) && scrubForward) {
            nextIndex += 1;
          }
          if ((previousIndex < (moveCycle.length - 2)) && scrubForward) {
            previousIndex += 1;
          }
        }
      }

      const middleGoalPos = { x: xVal, y: yVal, z: zVal };
      const middlePoints = fabrik(middleColumnPoints, middleGoalPos);

      const leftGoalPos = { x: xVal - middleColumnWidth - spacingGap, y: yVal, z: zVal };
      const leftPoints = fabrik(leftColumnPoints, leftGoalPos);

      const rightGoalPos = { x: xVal + middleColumnWidth + spacingGap, y: yVal, z: zVal };
      const rightPoints = fabrik(rightColumnPoints, rightGoalPos);

      const leftPointsRecord = Object.assign({}, leftPoints);
      const middlePointsRecord = Object.assign({}, middlePoints);
      const rightPointsRecord = Object.assign({}, rightPoints);
      const cameraPosRecord = { camX, camY, camZ };

      memory[memoryIndex] = { leftPointsRecord, middlePointsRecord, rightPointsRecord, cameraPosRecord };

      updateColumn(leftColumn, leftColumnWidth, leftColumnImageHeight, leftPoints, leftColumnLines);
      updateColumn(middleColumn, middleColumnWidth, middleColumnImageHeight, middlePoints, middleColumnLines);
      updateColumn(rightColumn, rightColumnWidth, rightColumnImageHeight, rightPoints, rightColumnLines);

      // update camera
      camera.position.x = camX;
      camera.position.y = camY;
      camera.position.z = camZ;
    }

    // animate();
    renderer.render(scene, camera);

    scrubForward = false;
    scrubBackward = false;
  }, 10);

  document.addEventListener('mousedown', onDocumentMouseDown);

  function onDocumentMouseDown(event) {
      event.preventDefault();

      scene.traverse((o) => {
        if (o.geometry) {
          o.geometry.computeBoundingBox();
          o.geometry.computeBoundingSphere();
        }
      });

      camera.updateProjectionMatrix();

      const mouse3Dx = (event.clientX / window.innerWidth) * 2 - 1;
      const mouse3Dy = -(event.clientY / window.innerHeight) * 2 + 1;
      const mouse3Dz = 0.5;

      const mouse3D = new THREE.Vector3(mouse3Dx, mouse3Dy, mouse3Dz);
      const raycaster =  new THREE.Raycaster();
      raycaster.setFromCamera(mouse3D, camera);

      // Left column
      const leftPlanes = [];

      leftColumn.forEach((imageStrucData) => {
        const imagePlane = imageStrucData[4];
        imagePlane.geometry.verticesNeedUpdate = true;
        leftPlanes.push(imagePlane)
      });

      const leftIntersects = raycaster.intersectObjects(leftPlanes, true);
      if (leftIntersects.length > 0) {
          //leftIntersects[0].object.material.color.setHex(0xaaaaaa);
          modalOpen();
      }

      // Middle column
      const middlePlanes = [];

      middleColumn.forEach((imageStrucData) => {
        middlePlanes.push(imageStrucData[4]);
      });

      const middleIntersects = raycaster.intersectObjects(middlePlanes);
      if (middleIntersects.length > 0) {
        //middleIntersects[0].object.material.color.setHex(0xeeeeee);
        modalOpen();
      }

      // Right column
      const rightPlanes = [];

      rightColumn.forEach((imageStrucData) => {
        rightPlanes.push(imageStrucData[4]);
      });

      const rightIntersects = raycaster.intersectObjects(rightPlanes);
      if (rightIntersects.length > 0) {
          //rightIntersects[0].object.material.color.setHex(0xeeeeee);
          modalOpen();
      }
  }

  window.addEventListener( 'resize', onWindowResize, false );

  function onWindowResize(){

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize( window.innerWidth, window.innerHeight );

  }
}
// buffer of 50 blank images

// 93 visible on desktop
launchViz(140); // 140 is the minimum, 101 are viewable on mobile( middle scrolls 2 extra)
