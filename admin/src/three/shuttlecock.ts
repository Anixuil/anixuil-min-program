import * as THREE from "three";

export interface ShuttlecockSceneController {
  setPaused: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
  point: (x: number, y: number) => void;
  clearPointer: () => void;
  rotate: (yaw: number, pitch: number) => void;
  reset: () => void;
  dispose: () => void;
}

interface SceneOptions {
  paused: boolean;
  reducedMotion: boolean;
  onError: () => void;
}

/** Loaded only by the login illustration. No Three objects escape this lifecycle. */
export function createShuttlecockScene(
  host: HTMLElement,
  options: SceneOptions,
): ShuttlecockSceneController {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const shadowLights = new Set<THREE.DirectionalLight>();
  let renderer: THREE.WebGLRenderer | undefined;
  let observer: ResizeObserver | undefined;
  let frame = 0;
  let disposed = false;
  let paused = options.paused;
  let reducedMotion = options.reducedMotion;
  let lastTime = 0;
  let floatTime = 0;
  let yaw = 0;
  let pitch = 0;
  let currentYaw = 0;
  let currentPitch = 0;
  let pointerX = 0;
  let pointerY = 0;
  let currentPointerX = 0;
  let currentPointerY = 0;
  let currentFloat = 0;
  let currentSway = 0;

  const scene = new THREE.Scene();
  const shuttle = new THREE.Group();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 30);
  scene.add(shuttle);

  const geometry = <T extends THREE.BufferGeometry>(value: T): T => {
    geometries.add(value);
    return value;
  };
  const material = <T extends THREE.Material>(value: T): T => {
    materials.add(value);
    return value;
  };
  const addMesh = (
    shape: THREE.BufferGeometry,
    surface: THREE.Material,
    parent: THREE.Object3D = shuttle,
  ) => {
    const mesh = new THREE.Mesh(shape, surface);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", visibilityChanged);
    renderer?.domElement.removeEventListener("webglcontextlost", contextLost);
    geometries.forEach((value) => value.dispose());
    materials.forEach((value) => value.dispose());
    textures.forEach((value) => value.dispose());
    shadowLights.forEach((value) => value.shadow.dispose());
    scene.clear();
    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      renderer = undefined;
    }
  }

  function contextLost(event: Event) {
    event.preventDefault();
    dispose();
    options.onError();
  }

  function schedule() {
    if (!disposed && !document.hidden && !frame) {
      frame = requestAnimationFrame(render);
    }
  }

  function resize() {
    if (!renderer || disposed) return;
    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);
    camera.aspect = width / height;
    camera.position.set(0, 0.35, 6.65 * Math.max(1, 0.76 / camera.aspect));
    camera.lookAt(0, -0.05, 0);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(width, height, false);
    schedule();
  }

  function visibilityChanged() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (!document.hidden) schedule();
  }

  function render(now: number) {
    frame = 0;
    if (disposed || !renderer || document.hidden) return;
    const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 1 / 60;
    lastTime = now;
    const automaticMotion = !paused && !reducedMotion;
    if (automaticMotion) floatTime += delta;
    const blend = reducedMotion ? 1 : 1 - Math.exp(-delta * 9);
    const float = reducedMotion ? 0 : Math.sin(floatTime * 0.8) * 0.055;
    const sway = reducedMotion ? 0 : Math.sin(floatTime * 0.36) * 0.045;
    currentYaw = THREE.MathUtils.lerp(currentYaw, yaw, blend);
    currentPitch = THREE.MathUtils.lerp(currentPitch, pitch, blend);
    currentPointerX = THREE.MathUtils.lerp(currentPointerX, pointerX, blend);
    currentPointerY = THREE.MathUtils.lerp(currentPointerY, pointerY, blend);
    currentFloat = THREE.MathUtils.lerp(currentFloat, float, blend);
    currentSway = THREE.MathUtils.lerp(currentSway, sway, blend);
    shuttle.rotation.set(
      -0.2 + currentPitch + currentPointerY,
      0.42 + currentYaw + currentPointerX + currentSway,
      -0.34,
    );
    shuttle.position.y = currentFloat;
    try {
      renderer.render(scene, camera);
    } catch {
      dispose();
      options.onError();
      return;
    }
    const unsettled =
      Math.abs(currentYaw - yaw) +
      Math.abs(currentPitch - pitch) +
      Math.abs(currentPointerX - pointerX) +
      Math.abs(currentPointerY - pointerY) +
      Math.abs(currentFloat - float) +
      Math.abs(currentSway - sway) >
      0.0005;
    if (automaticMotion || unsettled) schedule();
    else lastTime = 0;
  }

  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%;";
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xfffdf4, 0x60776c, 2.2));
    const keyLight = new THREE.DirectionalLight(0xfff2db, 3.6);
    shadowLights.add(keyLight);
    keyLight.position.set(-3.5, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -3;
    keyLight.shadow.camera.right = 3;
    keyLight.shadow.camera.top = 3;
    keyLight.shadow.camera.bottom = -3;
    keyLight.shadow.normalBias = 0.03;
    keyLight.shadow.bias = -0.00015;
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xffd8ae, 2.7);
    rimLight.position.set(2.5, 2, -4);
    scene.add(rimLight);
    const fillLight = new THREE.DirectionalLight(0xf0f5ff, 1.1);
    fillLight.position.set(4, 0, 3);
    scene.add(fillLight);

    const corkMaterial = material(
      new THREE.MeshStandardMaterial({ color: 0xeee3ca, roughness: 0.93 }),
    );
    const shaftMaterial = material(
      new THREE.MeshStandardMaterial({ color: 0xf0eadb, roughness: 0.65 }),
    );
    const threadMaterial = material(
      new THREE.MeshStandardMaterial({ color: 0xe6dfca, roughness: 0.9 }),
    );
    const orangeMaterial = material(
      new THREE.MeshStandardMaterial({ color: 0xd97842, roughness: 0.58 }),
    );
    const corkPoints = [
      new THREE.Vector2(0, -1.51),
      new THREE.Vector2(0.1, -1.49),
      new THREE.Vector2(0.21, -1.43),
      new THREE.Vector2(0.285, -1.34),
      new THREE.Vector2(0.313, -1.23),
      new THREE.Vector2(0.323, -1.04),
      new THREE.Vector2(0.33, -0.85),
      new THREE.Vector2(0, -0.85),
    ];
    addMesh(geometry(new THREE.LatheGeometry(corkPoints, 64)), corkMaterial);
    const band = addMesh(
      geometry(new THREE.CylinderGeometry(0.336, 0.333, 0.125, 64, 1, true)),
      orangeMaterial,
    );
    band.position.y = -0.93;
    const collar = addMesh(
      geometry(new THREE.CylinderGeometry(0.338, 0.336, 0.075, 64, 1, true)),
      threadMaterial,
    );
    collar.position.y = -0.835;
    for (const height of [-0.805, -0.824, -0.843, -0.862]) {
      const winding = addMesh(
        geometry(new THREE.TorusGeometry(0.338, 0.006, 5, 64)),
        shaftMaterial,
      );
      winding.rotation.x = Math.PI / 2;
      winding.position.y = height;
    }

    const barbs: number[] = [];
    // A curved vane sits on each radial shaft. Its asymmetry keeps the crown organic.
    const featherPoint = (angle: number, v: number, across: number) => {
      const bladeT = THREE.MathUtils.clamp((v - 0.27) / 0.73, 0, 1);
      const halfWidth = 0.195 * Math.pow(Math.sin(Math.PI * bladeT), 0.48);
      const width = across * halfWidth * (across < 0 ? 0.93 : 1.08);
      const radius =
        0.255 + 0.83 * v + 0.052 * Math.sin(Math.PI * v) +
        Math.abs(across) ** 1.7 * halfWidth * 0.16;
      return new THREE.Vector3(
        Math.sin(angle) * radius + Math.cos(angle) * width,
        -0.865 + v * 2.25 - Math.abs(across) * halfWidth * 0.11,
        Math.cos(angle) * radius - Math.sin(angle) * width,
      );
    };
    for (let feather = 0; feather < 16; feather += 1) {
      const angle = (feather / 16) * Math.PI * 2;
      const positions: number[] = [];
      const indices: number[] = [];
      const rows = 32;
      const columns = 6;
      for (let row = 0; row <= rows; row += 1) {
        const v = 0.27 + (row / rows) * 0.73;
        for (let column = 0; column <= columns; column += 1) {
          const point = featherPoint(angle, v, (column / columns) * 2 - 1);
          positions.push(point.x, point.y, point.z);
          if (row < rows && column < columns) {
            const first = row * (columns + 1) + column;
            indices.push(first, first + 1, first + columns + 1);
            indices.push(first + 1, first + columns + 2, first + columns + 1);
          }
        }
      }
      const vane = geometry(new THREE.BufferGeometry());
      vane.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      vane.setIndex(indices);
      vane.computeVertexNormals();
      const vaneMaterial = material(
        new THREE.MeshStandardMaterial({
          color: feather % 3 === 0 ? 0xf7f1e5 : 0xfffcf3,
          side: THREE.DoubleSide,
          roughness: 0.78,
          metalness: 0,
        }),
      );
      addMesh(vane, vaneMaterial);
      const spine: THREE.Vector3[] = [];
      for (let segment = 0; segment <= 12; segment += 1) {
        const point = featherPoint(angle, segment / 12, 0);
        point.x += Math.sin(angle) * 0.014;
        point.z += Math.cos(angle) * 0.014;
        spine.push(point);
      }
      addMesh(
        geometry(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spine), 32, 0.01, 5, false)),
        shaftMaterial,
      );
      for (let rib = 0; rib < 26; rib += 1) {
        const start = 0.34 + (rib / 26) * 0.59;
        for (const side of [-1, 1]) {
          for (let part = 0; part < 3; part += 1) {
            for (const step of [part, part + 1]) {
              const point = featherPoint(angle, start + (step / 3) * 0.045, side * step / 3);
              point.x += Math.sin(angle) * 0.004;
              point.z += Math.cos(angle) * 0.004;
              barbs.push(point.x, point.y, point.z);
            }
          }
        }
      }
    }
    const barbGeometry = geometry(new THREE.BufferGeometry());
    barbGeometry.setAttribute("position", new THREE.Float32BufferAttribute(barbs, 3));
    shuttle.add(new THREE.LineSegments(
      barbGeometry,
      material(new THREE.LineBasicMaterial({ color: 0xc5bea8, transparent: true, opacity: 0.35 })),
    ));

    for (const v of [0.225, 0.36]) {
      const radius = 0.255 + 0.83 * v + 0.052 * Math.sin(Math.PI * v);
      const ring = addMesh(
        geometry(new THREE.TorusGeometry(radius + 0.014, 0.016, 6, 96)),
        threadMaterial,
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.865 + v * 2.25;
    }

    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const context = shadowCanvas.getContext("2d");
    if (context) {
      const gradient = context.createRadialGradient(64, 64, 3, 64, 64, 64);
      gradient.addColorStop(0, "rgba(35, 56, 43, 0.22)");
      gradient.addColorStop(0.35, "rgba(35, 56, 43, 0.1)");
      gradient.addColorStop(1, "rgba(35, 56, 43, 0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 128, 128);
      const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
      textures.add(shadowTexture);
      const contactShadow = addMesh(
        geometry(new THREE.PlaneGeometry(3.7, 2.8)),
        material(new THREE.MeshBasicMaterial({
          map: shadowTexture,
          transparent: true,
          depthWrite: false,
          toneMapped: false,
        })),
        scene,
      );
      contactShadow.rotation.x = -Math.PI / 2;
      contactShadow.position.y = -1.73;
      contactShadow.castShadow = false;
    }
    const floor = addMesh(
      geometry(new THREE.PlaneGeometry(12, 12)),
      material(new THREE.ShadowMaterial({ opacity: 0.1 })),
      scene,
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.72;
    floor.castShadow = false;

    document.addEventListener("visibilitychange", visibilityChanged);
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(resize);
      observer.observe(host);
    } else {
      window.addEventListener("resize", resize);
    }
    resize();
  } catch (error) {
    dispose();
    throw error;
  }

  return {
    setPaused(value) {
      paused = value;
      pointerX = 0;
      pointerY = 0;
      schedule();
    },
    setReducedMotion(value) {
      reducedMotion = value;
      pointerX = 0;
      pointerY = 0;
      schedule();
    },
    point(x, y) {
      if (paused || reducedMotion) return;
      pointerX = THREE.MathUtils.clamp(x, -1, 1) * 0.085;
      pointerY = THREE.MathUtils.clamp(y, -1, 1) * 0.055;
      schedule();
    },
    clearPointer() {
      pointerX = 0;
      pointerY = 0;
      schedule();
    },
    rotate(yawDelta, pitchDelta) {
      yaw += yawDelta;
      pitch = THREE.MathUtils.clamp(pitch + pitchDelta, -0.95, 0.95);
      pointerX = 0;
      pointerY = 0;
      schedule();
    },
    reset() {
      yaw = 0;
      pitch = 0;
      pointerX = 0;
      pointerY = 0;
      floatTime = 0;
      schedule();
    },
    dispose,
  };
}
