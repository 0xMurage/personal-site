window.addEventListener('DOMContentLoaded', () => {

    const navbar = document.querySelector('nav.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 55) {
                navbar.classList.add('opaque')
            } else {
                navbar.classList.remove('opaque')
            }
        })
    }


    const elems: NodeListOf<HTMLElement> = document.querySelectorAll('.current-year');
    const year = new Date().getFullYear()
    for (let i = 0; i < elems.length; i++) {
        elems[i].innerText = String(year);
    }

})