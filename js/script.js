function scrollHeader() {
    const header = document.getElementById('header')
    if(this.scrollY>=50){
        header.classList.add('scroll-header');

    } else{
        header.classList.remove('scroll-header')
    }
}

window.addEventListener('scroll',scrollHeader);

// --------------------Mixitup portfolio sorting---------------------

let mixerPortfolio = mixitup('.work_container', {
    selectors: {
        target: '.work_card'
    },
    animation: {
        duration: 300
    }
});
// ------------------------activr link work

const linkWork =  document.querySelectorAll('.work_item')

function activeWork(){
    linkWork.forEach(L=>L.classList.remove('active_work'))
    this.classList.add('active_work')
}

linkWork.forEach(L=>L.addEventListener('click',activeWork))

/* ---------------------------Scroll section active link------------------------ */

const sections = document.querySelectorAll('section[id]')

function scrollActive(){
    const scrollY = window.pageYOffset

    sections.forEach(current=>{
        const sectionHeight = current.offsetHeight,
        sectionTop = current.offsetTop - 58,
        sectionID = current.getAttribute('id')

        if (scrollY > sectionTop && scrollY <= sectionTop+sectionHeight) {
            document.querySelector('.nav_menu a[href*='+sectionID+ ']').classList.add('active-link')

        }else{
            document.querySelector('.nav_menu a[href*='+sectionID+ ']').classList.remove('active-link')
        }
    })

}

window.addEventListener('scroll', scrollActive)

// -------------------------Dark and light theme--------------------------------------------

const themeButton = document.getElementById('theme-button')
const lightTheme = 'light-theme'
const iconTheme = 'bx-sun'

// Previously selected topic (if user selected)
const selectedTheme = localStorage.getItem('selected-theme')
const selectedIcon = localStorage.getItem('selected-icon')

// We obtain the current theme that the interface has by validating the dark-theme class
const getCurrentTheme = () => document.body.classList.contains(lightTheme) ? 'dark' : 'light'
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'bx bx-moon' : 'bx bx-sun'

// We validate if the user previously chose a topic
if (selectedTheme) {
  // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the dark
  document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](lightTheme)
  themeButton.classList[selectedIcon === 'bx bx-moon' ? 'add' : 'remove'](iconTheme)
}

// Activate / deactivate the theme manually with the button
themeButton.addEventListener('click', () => {
    // Add or remove the dark / icon theme
    document.body.classList.toggle(lightTheme)
    themeButton.classList.toggle(iconTheme)
    // We save the theme and the current icon that the user chose
    localStorage.setItem('selected-theme', getCurrentTheme())
    localStorage.setItem('selected-icon', getCurrentIcon())
})
// ------------------------------------Scroll reveal js-------------------------------////


const sr = ScrollReveal({
    origin:'top',
    distance:'60px',
    duration:2500,
    delay:400,
    // reset:true 
})

sr.reveal('.home_data')
sr.reveal('.home_handle',{delay:700})
sr.reveal('.home_social, .home_scroll',{delay:900, origin:'bottom'})

