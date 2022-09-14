import {errorInterceptor, lazyloadScript, notification} from "./utils/shared.js";
import{Agent, GetResult} from "@fingerprintjs/fingerprintjs";


window.addEventListener('DOMContentLoaded', () => {
    lazyloadScript('/assets/js/fingerprintjs@3.3.2.min.js');
    contactForm();
});

function contactForm() {
    const contactButton = document.getElementById('contactFormSubmitForm');
    if (contactButton) {
        contactButton.addEventListener('click', () => {

            ((window.FingerprintJS).load() as Promise<any>)
                .then((agent:Agent) => agent.get())
             .then((agent)=> sendMessage(agent))
        });
    }
}


function sendMessage(agent:GetResult) {

    const payload = {
        name: (<HTMLInputElement>document.getElementById('name')).value,
        email: (<HTMLInputElement>document.getElementById('email')).value,
        message: (<HTMLInputElement>document.getElementById('message')).value,
        visitor: agent.visitorId
    }

    fetch(`/api/v1/messages`, {
        method:'POST',
        headers: {'accept': 'application/json','content-type':'application/json'},
        body: JSON.stringify(payload)
    })
        .then((rs) => errorInterceptor(rs))
        .then((res) => res.json())
        .then(()=>{
            notification({message:'Message sent successfully',status:200},'success')
        }).catch((err)=>{
            notification(err,'error')
    })
}
