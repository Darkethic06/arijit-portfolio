import * as THREE from 'three'

// --------------------Three.js background scene---------------------
const canvas = document.getElementById('bg-canvas')
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const palettes = {
    dark: { a: 0x8b7bff, b: 0x3ee6ff, c: 0xff5fa2, core: 0x2b3170, blending: THREE.AdditiveBlending, pointOpacity: 0.85 },
    light: { a: 0x5b47f5, b: 0x0aa5c9, c: 0xe0337f, core: 0xdfe3ff, blending: THREE.NormalBlending, pointOpacity: 0.55 },
}

let renderer
try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
} catch (e) {
    // No WebGL: the CSS gradient background remains
    canvas.remove()
    throw e
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)

const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0x070b18, 0.035)

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 0, 9)

// --------------------Lights---------------------
const ambient = new THREE.AmbientLight(0xffffff, 0.35)
const lightA = new THREE.PointLight(0x8b7bff, 60, 30)
const lightB = new THREE.PointLight(0x3ee6ff, 45, 30)
const keyLight = new THREE.DirectionalLight(0xffffff, 1.2)
lightA.position.set(-4, 3, 5)
lightB.position.set(5, -3, 4)
keyLight.position.set(2, 4, 6)
scene.add(ambient, lightA, lightB, keyLight)

// --------------------Hero object---------------------
const hero = new THREE.Group()
scene.add(hero)

const coreMat = new THREE.MeshStandardMaterial({ color: 0x1a1f4a, emissive: 0x8b7bff, emissiveIntensity: 0.22, metalness: 0.7, roughness: 0.3, flatShading: true })
const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.25, 0), coreMat)
hero.add(core)

const shellMat = new THREE.LineBasicMaterial({ color: 0x8b7bff, transparent: true, opacity: 0.55 })
const shell = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2, 1)), shellMat)
hero.add(shell)

const nodeMat = new THREE.PointsMaterial({ color: 0x3ee6ff, size: 0.09, transparent: true, depthWrite: false })
const nodes = new THREE.Points(new THREE.IcosahedronGeometry(2, 1), nodeMat)
hero.add(nodes)

const ringMats = []
const rings = [2.7, 3.2].map((radius, i) => {
    const mat = new THREE.MeshBasicMaterial({ color: i ? 0xff5fa2 : 0x3ee6ff, transparent: true, opacity: 0.5 })
    ringMats.push(mat)
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.012, 8, 160), mat)
    ring.rotation.x = Math.PI / 2 + (i ? 0.5 : -0.35)
    ring.rotation.y = i ? 0.3 : -0.2
    hero.add(ring)
    return ring
})

// small satellites orbiting the core
const satMat = new THREE.MeshStandardMaterial({ color: 0x3ee6ff, emissive: 0x3ee6ff, emissiveIntensity: 0.6, metalness: 0.3, roughness: 0.4 })
const satellites = [0, 1, 2].map(i => {
    const sat = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), satMat)
    sat.userData = { radius: 2.7 + i * 0.25, speed: 0.35 + i * 0.18, offset: (i * Math.PI * 2) / 3, tilt: 0.4 - i * 0.35 }
    hero.add(sat)
    return sat
})

// --------------------Particle field---------------------
function circleTexture() {
    const size = 64
    const c = document.createElement('canvas')
    c.width = c.height = size
    const ctx = c.getContext('2d')
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.35, 'rgba(255,255,255,0.6)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    return new THREE.CanvasTexture(c)
}

const PARTICLES = window.innerWidth < 700 ? 900 : 1800
const positions = new Float32Array(PARTICLES * 3)
const colors = new Float32Array(PARTICLES * 3)
const mix = new Float32Array(PARTICLES)

for (let i = 0; i < PARTICLES; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40
    positions[i * 3 + 1] = 8 - Math.random() * 60
    positions[i * 3 + 2] = -Math.random() * 25 + 3
    mix[i] = Math.random()
}

const particleGeo = new THREE.BufferGeometry()
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

const particleMat = new THREE.PointsMaterial({
    size: 0.09,
    map: circleTexture(),
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
})
const particles = new THREE.Points(particleGeo, particleMat)
scene.add(particles)

// --------------------Floating shapes down the page---------------------
const floaters = []
const floaterMats = []
const shapeGeos = [
    new THREE.TetrahedronGeometry(0.5, 0),
    new THREE.OctahedronGeometry(0.45, 0),
    new THREE.BoxGeometry(0.6, 0.6, 0.6),
    new THREE.TorusGeometry(0.4, 0.12, 10, 32),
    new THREE.DodecahedronGeometry(0.45, 0),
]

for (let i = 0; i < 16; i++) {
    const mat = new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.35 })
    floaterMats.push(mat)
    const mesh = new THREE.Mesh(shapeGeos[i % shapeGeos.length], mat)
    const side = i % 2 ? 1 : -1
    mesh.position.set(side * (4 + Math.random() * 5), -6 - i * 3 - Math.random() * 2, -2 - Math.random() * 6)
    mesh.userData = { spin: new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.4), baseY: mesh.position.y, phase: Math.random() * 10 }
    scene.add(mesh)
    floaters.push(mesh)
}

// --------------------Theme---------------------
function applyPalette() {
    const theme = document.body.classList.contains('light-theme') ? 'light' : 'dark'
    const p = palettes[theme]
    const ca = new THREE.Color(p.a), cb = new THREE.Color(p.b), cc = new THREE.Color(p.c)

    coreMat.color.set(p.core)
    coreMat.emissive.copy(ca)
    shellMat.color.copy(ca)
    nodeMat.color.copy(cb)
    ringMats[0].color.copy(cb)
    ringMats[1].color.copy(cc)
    satMat.color.copy(cb)
    satMat.emissive.copy(cb)
    lightA.color.copy(ca)
    lightB.color.copy(cb)
    floaterMats.forEach((m, i) => m.color.copy([ca, cb, cc][i % 3]))

    const tmp = new THREE.Color()
    for (let i = 0; i < PARTICLES; i++) {
        const t = mix[i]
        tmp.copy(ca).lerp(t > 0.85 ? cc : cb, t)
        colors.set([tmp.r, tmp.g, tmp.b], i * 3)
    }
    particleGeo.attributes.color.needsUpdate = true
    particleMat.blending = p.blending
    particleMat.opacity = p.pointOpacity
    particleMat.needsUpdate = true

    scene.fog.color.set(theme === 'light' ? 0xf4f6ff : 0x070b18)
    ambient.intensity = theme === 'light' ? 0.9 : 0.35
    render()
}

window.addEventListener('themechange', applyPalette)

// --------------------Layout---------------------
function layoutHero() {
    const w = window.innerWidth
    if (w > 900) {
        hero.position.set(3.1, 0.1, 0)
        hero.scale.setScalar(1)
    } else {
        // centre behind the text on narrow screens, pushed back so text stays readable
        hero.position.set(1.2, 2.8, -7)
        hero.scale.setScalar(0.85)
    }
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    layoutHero()
    render()
}

window.addEventListener('resize', onResize)
layoutHero()

// --------------------Interaction---------------------
const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
let scrollProgress = 0

window.addEventListener('pointermove', e => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1
}, { passive: true })

function onScroll() {
    scrollProgress = window.scrollY / window.innerHeight
    if (reduceMotion) render()
}
window.addEventListener('scroll', onScroll, { passive: true })
onScroll()

// --------------------Render loop---------------------
const clock = new THREE.Clock()

function updateScene(t) {
    pointer.x += (pointer.tx - pointer.x) * 0.05
    pointer.y += (pointer.ty - pointer.y) * 0.05

    // camera travels down through the floating shapes as the page scrolls
    camera.position.x = pointer.x * 0.6
    camera.position.y = -scrollProgress * 6 - pointer.y * 0.4
    camera.lookAt(0, camera.position.y, 0)

    const spin = 1 + scrollProgress * 0.8
    core.rotation.x = t * 0.25 * spin + pointer.y * 0.4
    core.rotation.y = t * 0.35 * spin + pointer.x * 0.6
    shell.rotation.x = nodes.rotation.x = -t * 0.08 + pointer.y * 0.25
    shell.rotation.y = nodes.rotation.y = -t * 0.12 + pointer.x * 0.35
    rings[0].rotation.z = t * 0.2
    rings[1].rotation.z = -t * 0.15

    const breathe = 1 + Math.sin(t * 1.4) * 0.03
    core.scale.setScalar(breathe)

    satellites.forEach(s => {
        const { radius, speed, offset, tilt } = s.userData
        const a = t * speed + offset
        s.position.set(Math.cos(a) * radius, Math.sin(a) * radius * tilt, Math.sin(a) * radius)
        s.rotation.x = s.rotation.y = t * 2
    })

    floaters.forEach(f => {
        const { spin: sp, baseY, phase } = f.userData
        f.rotation.x = t * sp.x
        f.rotation.y = t * sp.y
        f.position.y = baseY + Math.sin(t * 0.6 + phase) * 0.3
    })

    particles.rotation.y = t * 0.01
}

function render() {
    if (reduceMotion) updateScene(0)
    renderer.render(scene, camera)
}

function animate() {
    updateScene(clock.getElapsedTime())
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

applyPalette()
if (!reduceMotion) animate()
