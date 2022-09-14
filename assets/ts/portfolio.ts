import {GetResult} from '@fingerprintjs/fingerprintjs';
import {errorInterceptor, fingerprintLoaded, lazyloadScript, notification} from "./utils/shared.js";

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

  lazyloadScript('/assets/js/fingerprintjs@3.3.2.min.js')

    fingerprintLoaded()
        .then(() => {
            loadVotes();
            reactionToggleListener();
        })

});

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
    window.FingerprintJS.load()
        .then((agent) => agent.get())
        .then((rs: GetResult) => {
            fetch(`/api/v1/reactions/${rs.visitorId}`, {
                headers: {'accept': 'application/json'}
            })
                .then((rs) => errorInterceptor(rs))
                .then((res) => res.json())
                .then((res) => renderReactions(res.reactions))
        })
}

function saveReaction(projectId: string) {
    window.FingerprintJS.load()
        .then((agent) => agent.get())
        .then((rs) => {
            fetch(`/api/v1/reactions/${projectId}`, {
                method: 'post',
                headers: {'accept': 'application/json', 'content-type': 'application/json'},
                body: JSON.stringify({device_id: rs.visitorId})
            })
                .then((rs) => errorInterceptor(rs))
                .then((res) => res.json())
                .then((res) => renderReactions(res.reactions))
                .catch((err) => {
                    notification(err,'error')
                    loadVotes(); //reload the votes
                })
        })
}

function deleteReaction(projectId: string) {
    window.FingerprintJS.load()
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
                    notification(err,'error')
                    loadVotes(); //reload the votes
                })
        })
}