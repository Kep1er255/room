// シーン作成
const scene = new THREE.Scene();

// カメラ作成
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 5); // 身長相当の高さと前に配置

// レンダラー作成
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // 影を有効化
document.body.appendChild(renderer.domElement);

// 照明を作成
const ambientLight = new THREE.AmbientLight(0x404040); // 環境光
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // ディレクショナルライト
directionalLight.position.set(10, 10, 10).normalize();
scene.add(directionalLight);

// 簡単な部屋作成
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });

function createWall(width, height, depth, x, y, z, rotation = 0) {
  const wallGeometry = new THREE.BoxGeometry(width, height, depth);
  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  wall.position.set(x, y, z);
  wall.rotation.y = rotation;
  wall.castShadow = true;
  wall.receiveShadow = true;
  scene.add(wall);
  return wall;
}

// 壁を作成
createWall(10, 5, 0.5, 0, 2.5, -5); // 奥の壁
createWall(10, 5, 0.5, 0, 2.5, 5);  // 手前の壁
createWall(0.5, 5, 10, -5, 2.5, 0); // 左の壁
createWall(0.5, 5, 10, 5, 2.5, 0);  // 右の壁

// 床を作成
const floorGeometry = new THREE.PlaneGeometry(10, 10);
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// 家具を追加
const furnitureMaterial = new THREE.MeshStandardMaterial();

// 机
const deskGeometry = new THREE.BoxGeometry(2, 0.5, 1);
const desk = new THREE.Mesh(deskGeometry, new THREE.MeshStandardMaterial({ color: 0x8B4513 }));
desk.position.set(0, 0.25, 0);
desk.castShadow = true;
desk.receiveShadow = true;
scene.add(desk);

// ベッド
const bedFrameGeometry = new THREE.BoxGeometry(2, 0.5, 1);
const bedFrame = new THREE.Mesh(bedFrameGeometry, new THREE.MeshStandardMaterial({ color: 0x4B0082 }));
bedFrame.position.set(2, 0.25, -2);
bedFrame.castShadow = true;
bedFrame.receiveShadow = true;
scene.add(bedFrame);

const mattressGeometry = new THREE.BoxGeometry(1.8, 0.3, 0.8);
const mattress = new THREE.Mesh(mattressGeometry, new THREE.MeshStandardMaterial({ color: 0xFFFFFF }));
mattress.position.set(2, 0.55, -2);
mattress.castShadow = true;
mattress.receiveShadow = true;
scene.add(mattress);

// 服掛け
const hangerGeometry = new THREE.BoxGeometry(0.5, 2, 0.5);
const hanger = new THREE.Mesh(hangerGeometry, new THREE.MeshStandardMaterial({ color: 0x654321 }));
hanger.position.set(-2, 1, -2);
hanger.castShadow = true;
hanger.receiveShadow = true;
scene.add(hanger);

// 椅子
const chairSeatGeometry = new THREE.BoxGeometry(1, 0.2, 1);
const chairBackGeometry = new THREE.BoxGeometry(1, 1, 0.2);
const chairLegGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);

const chairSeat = new THREE.Mesh(chairSeatGeometry, new THREE.MeshStandardMaterial({ color: 0x8B4513 }));
const chairBack = new THREE.Mesh(chairBackGeometry, new THREE.MeshStandardMaterial({ color: 0x8B4513 }));
const chairLegs = [];
for (let i = 0; i < 4; i++) {
  const chairLeg = new THREE.Mesh(chairLegGeometry, new THREE.MeshStandardMaterial({ color: 0x8B4513 }));
  chairLegs.push(chairLeg);
}

chairSeat.position.set(-3, 0.1, -2);
chairBack.position.set(-3, 0.6, -1.75);
chairBack.rotation.y = Math.PI;

chairLegs[0].position.set(-3.4, 0.5, -2.4);
chairLegs[1].position.set(-3.4, 0.5, -1.6);
chairLegs[2].position.set(-2.6, 0.5, -2.4);
chairLegs[3].position.set(-2.6, 0.5, -1.6);

scene.add(chairSeat);
scene.add(chairBack);
chairLegs.forEach(leg => scene.add(leg));

// 謎解き要素: スイッチ
const switchGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.5);
const switchMaterial = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
const switchMesh = new THREE.Mesh(switchGeometry, switchMaterial);
switchMesh.position.set(0, 0.05, 3);
switchMesh.userData = { isActivated: false };
scene.add(switchMesh);

// ポインターロックコントロール設定
const controls = new THREE.PointerLockControls(camera, document.body);

// キー操作関連
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let autoRotate = false;

document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyW':
      moveForward = true;
      break;
    case 'KeyS':
      moveBackward = true;
      break;
    case 'KeyA':
      moveLeft = true;
      break;
    case 'KeyD':
      moveRight = true;
      break;
    case 'KeyC':
      autoRotate = true; // 自動回転の切り替え
      break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW':
      moveForward = false;
      break;
    case 'KeyS':
      moveBackward = false;
      break;
    case 'KeyA':
      moveLeft = false;
      break;
    case 'KeyD':
      moveRight = false;
      break;
    case 'KeyC':
      autoRotate = false; // 自動回転の切り替え
      break;
  }
});

// ループ処理
function animate() {
  requestAnimationFrame(animate);

  if (autoRotate) {
    // 自動回転の処理
    const delta = clock.getDelta();
    camera.rotation.y += delta * 0.5;
  }

  // 移動処理
  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize(); // Normalize the direction vector

  if (moveForward || moveBackward || moveLeft || moveRight) {
    velocity.z -= direction.z * 0.0005; // スピード調整
    velocity.x -= direction.x * 0.0005; // スピード調整
  } else {
    velocity.z *= 0.9; // 滑らかに停止
    velocity.x *= 0.9;
  }

  // 重力の影響
  velocity.y -= 0.0002;

  // 衝突チェック
  if (!checkCollisions()) {
    camera.position.x += velocity.x;
    camera.position.z += velocity.z;
    camera.position.y = Math.max(camera.position.y + velocity.y, 1.6); // 地面に引き戻す
  }

  // 画面更新
  renderer.render(scene, camera);
}

function checkCollisions() {
  const boundingBox = new THREE.Box3().setFromObject(camera);
  const walls = scene.children.filter(child => child.type === 'Mesh' && child.geometry.type === 'BoxGeometry');
  return walls.some(wall => boundingBox.intersectsBox(new THREE.Box3().setFromObject(wall)));
}

const clock = new THREE.Clock();
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
