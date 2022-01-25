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

    const fp = document.createElement('script');
    fp.src = '/assets/js/fingerprintjs@3.3.2.min.js';
    document.head.appendChild(fp);

    fingerprintLoaded()
        .then(() => {
            loadVotes();
            reactionToggleListener();
        })

})

function fingerprintLoaded() {
    return new Promise((resolve) => {
        const i = setInterval(() => {
            if (window.FingerprintJS !== undefined) {
                clearInterval(i);
                resolve(true);
            }
        }, 500);

    })
}

function flashError(err: Error | { status: number, error: string }) {
    const elem = document.querySelector('.error-toast .error-message');
    if (!elem) {
        return
    }

    if (err instanceof Error) {
        elem.textContent = 'Unexpected error encountered';
    } else if (err.status != 404 && err.status != 422) {
        elem.textContent = 'Hmm. Your request could not be processed by the server';
    } else {
        elem.textContent = err.error
    }
    elem.parentElement?.classList.add('show')
    setTimeout(() => {
        elem.parentElement?.classList.remove('show')
    }, 6000);
}

function errorInterceptor(res: Response) {
    if (res.ok) {
        return res;
    }
    return res.json().then((er) => Promise.reject({...er, status: res.status}));
}

function renderReactions(reactions: { project_id: string, total_reactions: number, reacted: boolean }[]) {
    for (const reaction of reactions) {
        const count = document.querySelector(`[data-id='${reaction.project_id}'] .reaction .reaction-count`)
        if (count) {
            count.textContent = String(reaction.total_reactions);
        }
        const icon = document.querySelector(`[data-id='${reaction.project_id}'] .reaction .reaction-icon`);
        if (icon) {
            if (reaction.reacted) {
                icon.classList.add('liked')
            } else {
                icon.classList.remove('liked')
            }
        }
    }
}

function reactionToggleListener() {
    const btns: NodeListOf<HTMLSpanElement> = document.querySelectorAll('.project-box .reaction .reaction-icon')

    btns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const box: HTMLDivElement | null = btn.closest('.project-box');
            if (!box) {
                return
            }
            let projectId = ''
            projectId = box.getAttribute('data-id') as never;
            if (btn.classList.contains('liked')) {
                deleteReaction(projectId);
            } else {
                saveReaction(projectId);
            }
        });
    })
}


function loadVotes() {
    ((FingerprintJS as any).load() as Promise<any>)
        .then((agent) => agent.get())
        .then((rs: any) => {
            fetch(`/api/v1/reactions/${rs.visitorId}`, {
                headers: {'accept': 'application/json'}
            })
                .then((rs) => errorInterceptor(rs))
                .then((res) => res.json())
                .then((res) => renderReactions(res.reactions))
        })
}

function saveReaction(projectId: string) {
    ((FingerprintJS as any).load() as Promise<any>)
        .then((agent) => agent.get())
        .then((rs: any) => {
            fetch(`/api/v1/reactions/${projectId}`, {
                method: 'post',
                headers: {'accept': 'application/json', 'content-type': 'application/json'},
                body: JSON.stringify({device_id: rs.visitorId})
            })
                .then((rs) => errorInterceptor(rs))
                .then((res) => res.json())
                .then((res) => renderReactions(res.reactions))
                .catch((err) => {
                    flashError(err)
                    loadVotes(); //reload the votes
                })
        })
}

function deleteReaction(projectId: string) {
    ((FingerprintJS as any).load() as Promise<any>)
        .then((agent) => agent.get())
        .then((rs: any) => {
            fetch(`/api/v1/reactions/${projectId}`, {
                method: 'delete',
                headers: {'accept': 'application/json', 'content-type': 'application/json'},
                body: JSON.stringify({device_id: rs.visitorId})
            })
                .then((rs) => errorInterceptor(rs))
                .then((res) => res.json())
                .then((res) => renderReactions(res.reactions))
                .catch((err) => {
                    flashError(err)
                    loadVotes(); //reload the votes
                })
        })
}