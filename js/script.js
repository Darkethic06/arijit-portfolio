const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// --------------------Header background on scroll---------------------
const header = document.getElementById('header')

function scrollHeader() {
    header.classList.toggle('scroll-header', window.scrollY >= 50)
}

window.addEventListener('scroll', scrollHeader, { passive: true })
scrollHeader()

// --------------------Mobile menu---------------------
const navToggle = document.getElementById('nav-toggle')
const navList = document.getElementById('nav-list')

navToggle.addEventListener('click', () => {
    const open = navList.classList.toggle('show')
    navToggle.innerHTML = open ? "<i class='bx bx-x'></i>" : "<i class='bx bx-menu'></i>"
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu')
})

navList.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navList.classList.remove('show')
    navToggle.innerHTML = "<i class='bx bx-menu'></i>"
}))

// --------------------Active nav link on scroll---------------------
const sections = document.querySelectorAll('section[id]')

const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const id = entry.target.id
        document.querySelectorAll('.nav_link').forEach(link => {
            link.classList.toggle('active-link', link.getAttribute('href') === '#' + id)
        })
    })
}, { rootMargin: '-45% 0px -50% 0px' })

sections.forEach(s => sectionObserver.observe(s))

// --------------------Dark and light theme---------------------
const themeButton = document.getElementById('theme-button')
const lightTheme = 'light-theme'

function applyTheme(theme) {
    document.body.classList.toggle(lightTheme, theme === 'light')
    themeButton.innerHTML = theme === 'light' ? "<i class='bx bx-moon'></i>" : "<i class='bx bx-sun'></i>"
    window.dispatchEvent(new CustomEvent('themechange', { detail: theme }))
}

let savedTheme = null
try { savedTheme = localStorage.getItem('selected-theme') } catch (e) { }
applyTheme(savedTheme === 'light' ? 'light' : 'dark')

themeButton.addEventListener('click', () => {
    const next = document.body.classList.contains(lightTheme) ? 'dark' : 'light'
    applyTheme(next)
    try { localStorage.setItem('selected-theme', next) } catch (e) { }
})

// --------------------Typing effect---------------------
const roles = [
    'Backend Engineer',
    'Laravel & PHP Engineer',
    'API & Microservices Engineer',
    'Full Stack Developer',
    'System Design Enthusiast',
    'Cybersecurity Enthusiast',
]
const typed = document.getElementById('typed')

if (reduceMotion) {
    typed.textContent = roles[0]
} else {
    let roleIndex = 0, charIndex = 0, deleting = false

    function type() {
        const word = roles[roleIndex]
        charIndex += deleting ? -1 : 1
        typed.textContent = word.slice(0, charIndex)

        let delay = deleting ? 40 : 85
        if (!deleting && charIndex === word.length) {
            deleting = true
            delay = 1800
        } else if (deleting && charIndex === 0) {
            deleting = false
            roleIndex = (roleIndex + 1) % roles.length
            delay = 300
        }
        setTimeout(type, delay)
    }
    type()
}

// --------------------Reveal on scroll---------------------
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            revealObserver.unobserve(entry.target)
        }
    })
}, { threshold: 0.12 })

document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (i % 3) * 90 + 'ms'
    revealObserver.observe(el)
})

// --------------------Animated counters---------------------
const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const el = entry.target
        const target = +el.dataset.count
        const start = performance.now()
        const duration = reduceMotion ? 0 : 1400

        function tick(now) {
            const p = duration ? Math.min((now - start) / duration, 1) : 1
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)))
            if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        counterObserver.unobserve(el)
    })
}, { threshold: 0.6 })

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el))

// --------------------3D tilt cards---------------------
const finePointer = window.matchMedia('(pointer: fine)').matches

if (finePointer && !reduceMotion) {
    document.querySelectorAll('.tilt').forEach(card => {
        const max = card.classList.contains('about_photo') ? 10 : 7

        card.addEventListener('pointermove', e => {
            const r = card.getBoundingClientRect()
            const x = (e.clientX - r.left) / r.width - 0.5
            const y = (e.clientY - r.top) / r.height - 0.5
            card.style.transition = 'transform 0.1s linear'
            card.style.transform =
                `perspective(900px) rotateX(${-y * max}deg) rotateY(${x * max}deg) translateZ(0)`
        })

        card.addEventListener('pointerleave', () => {
            card.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
            card.style.transform = ''
        })
    })
}

// --------------------Project filters---------------------
const filters = document.querySelectorAll('.work_filter')
const workCards = document.querySelectorAll('.work_card')

filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(f => f.classList.remove('active'))
    btn.classList.add('active')
    const cat = btn.dataset.filter
    workCards.forEach(card => {
        const show = cat === 'all' || card.dataset.cat === cat || card.dataset.cat === 'all'
        card.classList.toggle('hidden', !show)
    })
}))

// --------------------Contact form (opens mail client)---------------------
document.getElementById('contact-form').addEventListener('submit', e => {
    e.preventDefault()
    const fields = e.target.elements
    const name = fields['name'].value.trim()
    const email = fields['email'].value.trim()
    const message = fields['message'].value.trim()
    const subject = encodeURIComponent(`Project enquiry from ${name}`)
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`)
    window.location.href = `mailto:arijitpaul062@gmail.com?subject=${subject}&body=${body}`
})

document.getElementById('year').textContent = new Date().getFullYear()
