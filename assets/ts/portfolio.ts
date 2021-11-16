window.addEventListener('DOMContentLoaded', () => {
    const projectAboutBs: NodeListOf<HTMLSpanElement> = document.querySelectorAll('.project-box .btn-toggle-view');
    for (let i = 0; i < projectAboutBs.length; i++) {
        if (projectAboutBs[i] === null) {
            continue;
        }
        projectAboutBs[i].addEventListener('click', () => {
            if (!projectAboutBs[i].parentElement) {
                return 1;
            }
            if (projectAboutBs[i].parentElement?.classList.contains('collapsed')) {
                projectAboutBs[i].parentElement?.classList.remove('collapsed')
            } else {
                projectAboutBs[i].parentElement?.classList.add('collapsed')
            }
        })
    }

})