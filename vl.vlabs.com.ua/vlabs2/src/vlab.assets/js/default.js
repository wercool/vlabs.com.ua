(() => {
    let defaultCSS = document.createElement('link');
    defaultCSS.id = 'defaultCSS';
    defaultCSS.type = 'text/css';
    defaultCSS.rel = 'stylesheet';
    defaultCSS.href = '../vlab.assets/css/default.css';
    document.getElementsByTagName('head')[0].appendChild(defaultCSS);
    defaultCSS.onload = function() {
        let loader = document.createElement('div');
        loader.id = 'loader';
        document.body.appendChild(loader);

        let ldBarCSS = document.createElement('link');
        ldBarCSS.id = 'ldBarCSS';
        ldBarCSS.type = 'text/css';
        ldBarCSS.rel = 'stylesheet';
        ldBarCSS.href = '../vlab.assets/css/loading-bar.css';
        document.getElementsByTagName('head')[0].appendChild(ldBarCSS);
        ldBarCSS.onload = function() {
            let ldBarJS = document.createElement('script');
            ldBarJS.type = 'text/javascript';
            ldBarJS.src = '../vlab.assets/js/loading-bar.js';
            document.getElementsByTagName('head')[0].appendChild(ldBarJS);
            ldBarJS.onload = function() {
                loader.setAttribute('class', 'ldBar label-center');
                loader.setAttribute('data-preset', 'circle');
                loader.setAttribute('data-stroke', '#c3d7e4');
                let loadingBar = new ldBar(loader);

                var oReq = new XMLHttpRequest();
                oReq.addEventListener('progress', (event) => {
                    let percentComplete = event.loaded / event.total * 100;
                    loadingBar.set(parseInt(percentComplete));
                });
                oReq.addEventListener('load', (event) => {
                    eval(oReq.response);
                });
                oReq.open('GET', './bundle.js');
                oReq.send();
            };
        };
    };
})();