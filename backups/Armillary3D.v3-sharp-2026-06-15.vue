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
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(width, height)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.setClearColor(0x070b1c, 1)
  el.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x070b1c, 10, 24)

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

  const R = 2.2
  const tiltGroup = new THREE.Group()
  scene.add(tiltGroup)
  const sphere = new THREE.Group() // spins about the polar axis (Y)
  tiltGroup.add(sphere)

  const makeRing = (radius: number, tube: number, mat: THREE.Material) => {
    const geo = new THREE.TorusGeometry(radius, tube, 28, 260)
    disposables.push(geo)
    return new THREE.Mesh(geo, mat)
  }

  // graduation ticks in the XY plane, returned as one InstancedMesh
  const makeTicks = (radius: number, count: number, majorEvery: number, mat: THREE.Material) => {
    const geo = new THREE.BoxGeometry(0.07, 0.014, 0.03)
    disposables.push(geo)
    const inst = new THREE.InstancedMesh(geo, mat, count)
    const dummy = new THREE.Object3D()
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      dummy.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0)
      dummy.rotation.set(0, 0, a)
      const major = i % majorEvery === 0
      dummy.scale.set(major ? 2.3 : 1, 1, 1)
      dummy.updateMatrix()
      inst.setMatrixAt(i, dummy.matrix)
    }
    inst.instanceMatrix.needsUpdate = true
    return inst
  }

  // ring + ticks built in XY, then oriented together
  const gradedRing = (radius: number, tube: number, mat: THREE.Material, ticks = 72, major = 6) => {
    const grp = new THREE.Group()
    grp.add(makeRing(radius, tube, mat))
    grp.add(makeTicks(radius, ticks, major, brassBright))
    return grp
  }

  const obliquity = THREE.MathUtils.degToRad(23.4)

  // Meridian (faces camera), equator (horizontal), colure, ecliptic (tilted)
  const meridian = gradedRing(R, 0.022, brass)
  sphere.add(meridian)

  // Equator lives in its own pivot so it can tumble about a horizontal axis,
  // sweeping "through the vertical" rings.
  const equatorPivot = new THREE.Group()
  sphere.add(equatorPivot)
  const equator = gradedRing(R, 0.022, brass)
  equator.rotation.x = Math.PI / 2
  equatorPivot.add(equator)

  const colure = makeRing(R, 0.018, brass)
  colure.rotation.y = Math.PI / 2
  sphere.add(colure)

  // Ecliptic (with the RA band + planet) gets its own tumbling pivot too.
  const eclipticPivot = new THREE.Group()
  sphere.add(eclipticPivot)
  const ecliptic = gradedRing(R, 0.03, brassBright, 96, 8)
  ecliptic.rotation.x = Math.PI / 2 + obliquity
  eclipticPivot.add(ecliptic)

  // Outer horizon ring — heavier band
  const horizon = makeRing(R * 1.16, 0.05, brass)
  horizon.rotation.x = Math.PI / 2
  sphere.add(horizon)

  // ------------------------------------------------- the showpiece: zodiac band
  const bandGeo = new THREE.CylinderGeometry(R * 1.05, R * 1.05, 0.46, 220, 1, true)
  disposables.push(bandGeo)
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
  const band = new THREE.Mesh(bandGeo, bandMat)
  band.rotation.x = obliquity // coplanar with the ecliptic ring
  eclipticPivot.add(band)

  // ------------------------------------------------------------- polar axis
  const axisGeo = new THREE.CylinderGeometry(0.014, 0.014, R * 2.6, 16)
  disposables.push(axisGeo)
  sphere.add(new THREE.Mesh(axisGeo, brassBright))
  const finialGeo = new THREE.SphereGeometry(0.07, 24, 24)
  disposables.push(finialGeo)
  for (const y of [R * 1.3, -R * 1.3]) {
    const f = new THREE.Mesh(finialGeo, brassBright)
    f.position.y = y
    sphere.add(f)
  }

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

  // ------------------------------------------------- a planet riding the ecliptic
  const planetPivot = new THREE.Group()
  // orbit perpendicular to the polar axis, so it circles the star in line with
  // the (leaned) central axis rather than tilted away from it
  planetPivot.rotation.x = 0
  sphere.add(planetPivot)
  const planetGeo = new THREE.SphereGeometry(0.12, 32, 32)
  disposables.push(planetGeo)
  const planetMat = new THREE.MeshPhysicalMaterial({
    color: 0x6f8fd0,
    metalness: 0.2,
    roughness: 0.45,
    clearcoat: 0.3,
    envMapIntensity: 1,
  })
  disposables.push(planetMat)
  const planet = new THREE.Mesh(planetGeo, planetMat)
  planet.position.set(R * 0.62, 0, 0)
  planetPivot.add(planet)
  // tiny moon
  const moonPivot = new THREE.Group()
  planet.add(moonPivot)
  const moonGeo = new THREE.SphereGeometry(0.035, 16, 16)
  disposables.push(moonGeo)
  const moonMat = new THREE.MeshStandardMaterial({ color: 0xd8d2c2, roughness: 0.7, metalness: 0.1 })
  disposables.push(moonMat)
  const moon = new THREE.Mesh(moonGeo, moonMat)
  moon.position.set(0.28, 0, 0)
  moonPivot.add(moon)

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
  const brightStars = makeStars(70, 0.26, [13, 24], 1) // these bloom
  const starGroup = new THREE.Group()
  starGroup.add(dust, brightStars)
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

  // ------------------------------------------------------------- interaction
  const targetRot = { x: 0, y: 0 }
  const onPointerMove = (e: PointerEvent) => {
    const r = el.getBoundingClientRect()
    targetRot.y = ((e.clientX - r.left) / r.width - 0.5) * 0.6
    targetRot.x = ((e.clientY - r.top) / r.height - 0.5) * 0.4
  }
  window.addEventListener('pointermove', onPointerMove)

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
  const baseTiltX = THREE.MathUtils.degToRad(-16)
  const baseTiltZ = THREE.MathUtils.degToRad(8)
  const render = (t: number) => {
    const dt = last ? Math.min((t - last) / 1000, 0.05) : 0
    last = t

    if (!reduceMotion) {
      sphere.rotation.y += dt * 0.12
      // each horizontal ring tumbles along its own vertical ring:
      // equator about Z (follows the meridian), ecliptic about X (follows the colure)
      equatorPivot.rotation.z += dt * 0.5
      eclipticPivot.rotation.x += dt * 0.36
      planetPivot.rotation.y -= dt * 0.5
      moonPivot.rotation.y -= dt * 2.4
      starGroup.rotation.y += dt * 0.008
      // ease the whole instrument toward the pointer
      tiltGroup.rotation.y += (targetRot.y - tiltGroup.rotation.y) * 0.04
      tiltGroup.rotation.x += (baseTiltX + targetRot.x - tiltGroup.rotation.x) * 0.04
      tiltGroup.rotation.z = baseTiltZ
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
    window.removeEventListener('pointermove', onPointerMove)
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
