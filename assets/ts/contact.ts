import {errorInterceptor, lazyloadScript, notification} from "./utils/shared.js";
import {Agent, GetResult} from "@fingerprintjs/fingerprintjs";


window.addEventListener('DOMContentLoaded', () => {
    lazyloadScript('/assets/js/fingerprintjs@3.3.2.min.js');
    contactForm();
    contactFormValidity();
});

function contactForm() {
    const contactForm = document.getElementById('contact-form') as HTMLFormElement;
    if (contactForm) {
        contactForm.addEventListener('submit', (evt) => {
            evt.preventDefault(); //prevent page reload
            ((window.FingerprintJS).load() as Promise<any>)
                .then((agent: Agent) => agent.get())
                .then((agent) => sendMessage(agent))
        })
    }
}

function contactFormValidity() {
    [{
        elem: document.getElementById('name') as HTMLInputElement,
        message: 'Please provide your name',
    },
        {
            elem: document.getElementById('email') as HTMLInputElement,
            message: 'Please provide a valid email address',
        },
        {
            elem: document.getElementById('message') as HTMLTextAreaElement,
            message: 'Please type your message',
        },
    ].map(({elem,message}) => {
        if (elem) {
            elem.addEventListener('invalid', () => {
                elem.setCustomValidity(message);
                elem.classList.add('is-invalid');
            });

            elem.addEventListener('input', () => {
                elem.setCustomValidity('');
                elem.classList.remove('is-invalid');
            });
        }
    })
}



function sendMessage(agent: GetResult) {

    const payload = {
        name: (<HTMLInputElement>document.getElementById('name'))?.value,
        email: (<HTMLInputElement>document.getElementById('email'))?.value,
        message: (<HTMLInputElement>document.getElementById('message'))?.value,
        visitor: agent.visitorId
    }
    const normalFormBtn = document.getElementById('contactFormSubmitForm');
    const loaderFormBtn = document.getElementById('submissionLoader');
    if (normalFormBtn && loaderFormBtn) {
        normalFormBtn.classList.add('d-none')
        loaderFormBtn.classList.remove('d-none')
    }

    fetch(`https://murageyun.com/api/v1/messages`, {
        method: 'POST',
        headers: {'accept': 'application/json', 'content-type': 'application/json'},
        body: JSON.stringify(payload)
    }).then((rs) => errorInterceptor(rs))
        .then(() => {
            notification({
                message: 'Thank you for reaching out. Your message has been received and I will get back to you as soon as possible.',
                status: 200
            }, 'success');
            (<HTMLInputElement>document.getElementById('name')).value = '';
            (<HTMLInputElement>document.getElementById('email')).value = '';
            (<HTMLInputElement>document.getElementById('message')).value = '';
        })
        .catch((err) => {
            notification(err, 'error')
        })
        .finally(() => {
            if (normalFormBtn && loaderFormBtn) {
                loaderFormBtn.classList.add('d-none')
                normalFormBtn.classList.remove('d-none')
            }
        })
}
