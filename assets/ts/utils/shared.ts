import FingerprintJS from "@fingerprintjs/fingerprintjs";


declare global {
    interface Window {
        FingerprintJS: typeof FingerprintJS
    }
}

export function fingerprintLoaded() {
    return new Promise((resolve) => {
        const i = setInterval(() => {
            if ((window.FingerprintJS) !== undefined) {
                clearInterval(i);
                resolve(true);
            }
        }, 500);

    })
}

export function lazyloadScript(path: string) {
    const scriptElement = document.createElement('script');
    scriptElement.src = path;
    document.head.appendChild(scriptElement);
}

export function errorInterceptor(res: Response) {
    if (res.ok) {
        return res;
    }
    return Promise.reject({message: res.statusText, status: res.status});
}

export function notification(body: Error | { status: number, message: string }, type: 'success' | 'error' = 'success') {
    const elem = document.querySelector(`#toast-notification .toast-message`);
    if (!elem) {
        return
    }


    if (body instanceof Error) {
        elem.textContent = 'Unexpected error encountered';
    } else if (body.status >= 400 && body.status < 500) {
        elem.textContent = 'Hmm. Your request could not be processed by the server';
    } else {
        elem.textContent = body.message
    }
    elem.parentElement?.classList.add('show', `${type}-message`)
    setTimeout(() => {
        elem.parentElement?.classList.remove('show', `${type}-message`)
    }, 12000);
}
