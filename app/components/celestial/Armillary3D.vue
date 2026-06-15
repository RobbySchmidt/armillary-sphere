<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const host = ref<HTMLDivElement | null>(null)
let cleanup: (() => void) | null = null

onMounted(async () => {
  const el = host.value
  if (!el) return

  // three core + postprocessing/environment addons
  const THREE = await import('three')
  const { EffectComposer } = await import('three/addons/postprocessing/EffectComposer.js')
  const { RenderPass } = await import('three/addons/postprocessing/RenderPass.js')
  const { UnrealBloomPass } = await import('three/addons/postprocessing/UnrealBloomPass.js')
  const { OutputPass } = await import('three/addons/postprocessing/OutputPass.js')
  const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js')

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const disposables: Array<{ dispose: () => void }> = []

  let width = el.clientWidth
  let height = el.clientHeight

  // ---------------------------------------------------------------- renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(width, height)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.setClearAlpha(0) // transparent — the hero background shows through, no visible box
  el.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x070b1c, 11, 26)

  const CAM_DIST = 10
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
  camera.position.set(0, 0.3, CAM_DIST)
  camera.lookAt(0, 0, 0)

  // ----------------------------------------------- studio env for real metal
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04)
  scene.environment = envRT.texture
  disposables.push(envRT, pmrem)

  // -------------------------------------------------------- canvas textures
  const radialTexture = (inner: string, mid: string, outer: string) => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const g = c.getContext('2d')!
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
    grad.addColorStop(0, inner)
    grad.addColorStop(0.45, mid)
    grad.addColorStop(1, outer)
    g.fillStyle = grad
    g.fillRect(0, 0, 256, 256)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    disposables.push(tex)
    return tex
  }

  const raBandTexture = () => {
    const w = 2048
    const h = 160
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const g = c.getContext('2d')!
    g.clearRect(0, 0, w, h)
    const brass = '#e7c66b'
    g.strokeStyle = brass
    g.fillStyle = brass
    // graduation: minor every 1°, medium every 5°, major every 15° (= 1 RA hour)
    for (let deg = 0; deg < 360; deg++) {
      const x = (deg / 360) * w
      const hour = deg % 15 === 0
      const medium = deg % 5 === 0
      const len = hour ? 52 : medium ? 26 : 13
      g.globalAlpha = hour ? 0.95 : medium ? 0.65 : 0.35
      g.lineWidth = hour ? 2.6 : 1.1
      g.beginPath()
      g.moveTo(x, h)
      g.lineTo(x, h - len)
      g.stroke()
    }
    // right-ascension hour labels 0–23
    g.globalAlpha = 0.95
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.font = '700 30px "Courier New", monospace'
    for (let hh = 0; hh < 24; hh++) {
      const x = ((hh * 15) / 360) * w
      g.fillText(`${hh}`, x, 40)
    }
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.wrapS = THREE.RepeatWrapping
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
    disposables.push(tex)
    return tex
  }

  // ------------------------------------------------------------- materials
  const brass = new THREE.MeshPhysicalMaterial({
    color: 0xc9a24a,
    metalness: 1,
    roughness: 0.26,
    clearcoat: 0.5,
    clearcoatRoughness: 0.25,
    envMapIntensity: 1.15,
  })
  const brassBright = new THREE.MeshPhysicalMaterial({
    color: 0xe7c66b,
    metalness: 1,
    roughness: 0.18,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.35,
  })
  disposables.push(brass, brassBright)

  const tiltGroup = new THREE.Group()
  scene.add(tiltGroup)
  const sphere = new THREE.Group() // the gimbal root
  tiltGroup.add(sphere)

  const makeRing = (radius: number, tube: number, mat: THREE.Material) => {
    const geo = new THREE.TorusGeometry(radius, tube, 28, 260)
    disposables.push(geo)
    return new THREE.Mesh(geo, mat)
  }

  // bearing cap + pivot-pin helpers for the gimbal
  const pinGeo = new THREE.SphereGeometry(0.08, 20, 20)
  disposables.push(pinGeo)
  const addBearing = (parent: THREE.Object3D, x: number, y: number, z: number) => {
    const s = new THREE.Mesh(pinGeo, brassBright)
    s.position.set(x, y, z)
    parent.add(s)
  }
  // a pair of pins bridging from radius `inner` to `outer` along a principal axis
  const addPins = (parent: THREE.Object3D, axis: 'x' | 'z', inner: number, outer: number) => {
    const geo = new THREE.CylinderGeometry(0.022, 0.022, outer - inner, 12)
    disposables.push(geo)
    const mid = (inner + outer) / 2
    for (const sign of [1, -1]) {
      const c = new THREE.Mesh(geo, brass)
      if (axis === 'x') {
        c.position.set(sign * mid, 0, 0)
        c.rotation.z = Math.PI / 2
      } else {
        c.position.set(0, 0, sign * mid)
        c.rotation.x = Math.PI / 2
      }
      parent.add(c)
    }
  }

  // --- A real gimbal: three nested rings (R1 > R2 > R3), each hung inside the
  // next by bearing pins on a perpendicular axis. Nothing pierces anything and
  // every ring can actually spin about its own bearing line. ---
  const R1 = 2.25
  const R2 = 1.95
  const R3 = 1.65
  const tube = 0.03

  // fixed polar bearing caps — the two "bubbles" the instrument hangs from
  addBearing(sphere, 0, R1, 0)
  addBearing(sphere, 0, -R1, 0)

  // OUTER ring — spins about the vertical (polar) axis Y; meets the Y caps
  const outerGimbal = new THREE.Group()
  sphere.add(outerGimbal)
  outerGimbal.add(makeRing(R1, tube, brass)) // torus in the XY plane

  // MIDDLE ring — pivots about X, hung inside the outer ring at (±R1, 0, 0)
  const middleGimbal = new THREE.Group()
  outerGimbal.add(middleGimbal)
  addPins(middleGimbal, 'x', R2, R1)
  addBearing(middleGimbal, R1, 0, 0)
  addBearing(middleGimbal, -R1, 0, 0)

  // the right-ascension scale rides the middle ring as a flush band
  const bandTex = raBandTexture()
  const bandMat = new THREE.MeshStandardMaterial({
    map: bandTex,
    emissive: 0xffffff,
    emissiveMap: bandTex,
    emissiveIntensity: 0.5,
    metalness: 0.7,
    roughness: 0.4,
    transparent: true,
    side: THREE.DoubleSide,
    envMapIntensity: 0.6,
  })
  disposables.push(bandMat)
  const bandGeo = new THREE.CylinderGeometry(R2, R2, 0.34, 240, 1, true)
  disposables.push(bandGeo)
  middleGimbal.add(new THREE.Mesh(bandGeo, bandMat)) // axis Y → lies in XZ plane
  const middleRing = makeRing(R2, tube * 0.8, brassBright)
  middleRing.rotation.x = Math.PI / 2 // XZ plane, meets the X pins
  middleGimbal.add(middleRing)

  // INNER ring — pivots about Z, hung inside the middle ring at (0, 0, ±R2)
  const innerGimbal = new THREE.Group()
  middleGimbal.add(innerGimbal)
  addPins(innerGimbal, 'z', R3, R2)
  addBearing(innerGimbal, 0, 0, R2)
  addBearing(innerGimbal, 0, 0, -R2)
  const innerRing = makeRing(R3, tube, brass)
  innerRing.rotation.y = Math.PI / 2 // YZ plane, meets the Z pins
  innerGimbal.add(innerRing)

  // OUTER fixed meridian frame — the polar bearings hang from it; it does not spin
  const R0 = 2.6
  const frame = makeRing(R0, 0.042, brass)
  frame.rotation.y = Math.PI / 2 // YZ plane (vertical), perpendicular to the outer gimbal
  sphere.add(frame)
  {
    const g = new THREE.CylinderGeometry(0.024, 0.024, R0 - R1, 12) // ties caps → frame
    disposables.push(g)
    const mid = (R0 + R1) / 2
    for (const s of [1, -1]) {
      const c = new THREE.Mesh(g, brass) // default cylinder axis is Y — already vertical
      c.position.set(0, s * mid, 0)
      sphere.add(c)
    }
  }

  // INNERMOST ring — a 4th nested gimbal hung in the inner ring at (0, ±R3, 0),
  // spinning about Y to add life near the star
  const R4 = 1.32
  const coreGimbal = new THREE.Group()
  innerGimbal.add(coreGimbal)
  {
    const g = new THREE.CylinderGeometry(0.02, 0.02, R3 - R4, 12) // pins along Y
    disposables.push(g)
    const mid = (R3 + R4) / 2
    for (const s of [1, -1]) {
      const c = new THREE.Mesh(g, brass)
      c.position.set(0, s * mid, 0)
      coreGimbal.add(c)
    }
  }
  addBearing(coreGimbal, 0, R3, 0)
  addBearing(coreGimbal, 0, -R3, 0)
  const coreRing = makeRing(R4, tube, brassBright)
  coreGimbal.add(coreRing) // XY plane, spins about Y

  // ----------------------------------------------------------- central star
  const starGeo = new THREE.SphereGeometry(0.28, 48, 48)
  disposables.push(starGeo)
  const starMat = new THREE.MeshStandardMaterial({
    color: 0xfff4d6,
    emissive: 0xffd98a,
    emissiveIntensity: 1.6,
    metalness: 0,
    roughness: 0.5,
  })
  disposables.push(starMat)
  const star = new THREE.Mesh(starGeo, starMat)
  sphere.add(star)

  const coronaMat = new THREE.SpriteMaterial({
    map: radialTexture('rgba(255,235,170,0.95)', 'rgba(231,198,107,0.35)', 'rgba(231,198,107,0)'),
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
  })
  disposables.push(coronaMat)
  const corona = new THREE.Sprite(coronaMat)
  corona.scale.set(1.9, 1.9, 1)
  sphere.add(corona)

  const coreLight = new THREE.PointLight(0xffd98a, 3, 14, 2)
  sphere.add(coreLight)


  // ----------------------------------------------------------- starfields
  const starSprite = radialTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0)')
  const makeStars = (count: number, size: number, spread: [number, number], opacity: number) => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const palette = [
      [1.0, 0.97, 0.9],
      [0.72, 0.82, 1.0],
      [0.95, 0.8, 0.45],
      [1.0, 1.0, 1.0],
    ]
    for (let i = 0; i < count; i++) {
      const r = spread[0] + Math.random() * (spread[1] - spread[0])
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi) - 4
      const p = palette[(Math.random() * palette.length) | 0]
      col[i * 3] = p[0]
      col[i * 3 + 1] = p[1]
      col[i * 3 + 2] = p[2]
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    disposables.push(geo)
    const mat = new THREE.PointsMaterial({
      size,
      map: starSprite,
      vertexColors: true,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })
    disposables.push(mat)
    return new THREE.Points(geo, mat)
  }
  const dust = makeStars(1400, 0.07, [12, 28], 0.85)
  const starGroup = new THREE.Group()
  starGroup.add(dust)
  scene.add(starGroup)

  // faint gold haze behind everything for depth
  const hazeMat = new THREE.SpriteMaterial({
    map: radialTexture('rgba(231,198,107,0.22)', 'rgba(110,90,40,0.06)', 'rgba(0,0,0,0)'),
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    transparent: true,
  })
  disposables.push(hazeMat)
  const haze = new THREE.Sprite(hazeMat)
  haze.scale.set(20, 20, 1)
  haze.position.set(0, 0, -8)
  haze.renderOrder = -1
  scene.add(haze)

  // ------------------------------------------------------------- lighting
  scene.add(new THREE.AmbientLight(0x35406a, 0.8))
  const key = new THREE.PointLight(0xffd9a0, 50, 60, 2)
  key.position.set(5, 6, 6)
  scene.add(key)
  const rim = new THREE.PointLight(0x6f8fd0, 40, 60, 2)
  rim.position.set(-6, -3, -3)
  scene.add(rim)

  // resting three-quarter lean
  tiltGroup.rotation.x = THREE.MathUtils.degToRad(-16)
  tiltGroup.rotation.z = THREE.MathUtils.degToRad(8)

  // ----------------------------------------------------- post-processing
  // EffectComposer renders into its own target and bypasses the renderer's MSAA,
  // which is what made the thin rings look jagged. A multisampled HalfFloat
  // target restores antialiasing and keeps the bloom gradient smooth.
  const rt = new THREE.WebGLRenderTarget(width, height, {
    type: THREE.HalfFloatType,
    samples: 4,
  })
  const composer = new EffectComposer(renderer, rt)
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.42, 0.5, 0.85)
  composer.addPass(bloom)
  composer.addPass(new OutputPass())
  composer.setSize(width, height)

  // Scale the instrument so it always fits the (often portrait) container in
  // BOTH axes — horizontal FOV is the tighter constraint here.
  const FIT_RADIUS = 3.4 // bounding radius of the instrument
  const fitInstrument = () => {
    const vFov = THREE.MathUtils.degToRad(camera.fov)
    const halfH = CAM_DIST * Math.tan(vFov / 2)
    const halfW = halfH * camera.aspect
    const s = Math.min(1, Math.min(halfW, halfH) / FIT_RADIUS)
    tiltGroup.scale.setScalar(s)
  }

  const resize = () => {
    width = el.clientWidth
    height = el.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    composer.setSize(width, height)
    fitInstrument()
  }
  fitInstrument()
  const ro = new ResizeObserver(resize)
  ro.observe(el)

  // --------------------------------------------------------------- loop
  let raf = 0
  let last = 0
  const render = (t: number) => {
    const dt = last ? Math.min((t - last) / 1000, 0.05) : 0
    last = t

    if (!reduceMotion) {
      // whole instrument (incl. the fixed frame) turns about its tilted polar axis
      sphere.rotation.y += dt * 0.1
      // gimbal: each ring spins about its own bearing axis (nested gyroscope)
      outerGimbal.rotation.y += dt * 0.25
      middleGimbal.rotation.x += dt * 0.4
      innerGimbal.rotation.z += dt * 0.55
      coreGimbal.rotation.y += dt * 0.7
      starGroup.rotation.y += dt * 0.008
      // breathing star
      const pulse = 1.6 + Math.sin(t * 0.0022) * 0.3
      starMat.emissiveIntensity = pulse
      corona.scale.setScalar(1.9 + Math.sin(t * 0.0022) * 0.12)
    }

    composer.render()
    if (!reduceMotion) raf = requestAnimationFrame(render)
  }
  if (reduceMotion) {
    render(0)
  } else {
    raf = requestAnimationFrame(render)
  }

  cleanup = () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    composer.dispose()
    for (const d of disposables) d.dispose()
    renderer.dispose()
    if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement)
  }
})

onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <div
    ref="host"
    aria-hidden="true"
    class="h-full w-full"
    style="-webkit-mask-image: radial-gradient(82% 82% at 52% 48%, #000 66%, transparent 100%);
           mask-image: radial-gradient(82% 82% at 52% 48%, #000 66%, transparent 100%);"
  />
</template>
