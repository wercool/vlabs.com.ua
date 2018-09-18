window.onload = function() {
    var defaultCSS = document.createElement('link');
    defaultCSS.id = 'defaultCSS';
    defaultCSS.type = 'text/css';
    defaultCSS.rel = 'stylesheet';
    defaultCSS.href = '../vlab.assets/css/default.css';
    document.getElementsByTagName('head')[0].appendChild(defaultCSS);
    defaultCSS.onload = function() {
        var webGLDetectorJS = document.createElement('script');
        webGLDetectorJS.type = 'text/javascript';
        webGLDetectorJS.src = '../vlab.assets/js/WebGLDetector.js';
        document.getElementsByTagName('head')[0].appendChild(webGLDetectorJS);
        webGLDetectorJS.onload = function() {
            if (Detector.webgl) {
                var loader = document.createElement('div');
                loader.id = 'loader';
                document.body.appendChild(loader);

                var ldBarCSS = document.createElement('link');
                ldBarCSS.id = 'ldBarCSS';
                ldBarCSS.type = 'text/css';
                ldBarCSS.rel = 'stylesheet';
                ldBarCSS.href = '../vlab.assets/css/loading-bar.css';
                document.getElementsByTagName('head')[0].appendChild(ldBarCSS);
                ldBarCSS.onload = function() {
                    var ldBarJS = document.createElement('script');
                    ldBarJS.type = 'text/javascript';
                    ldBarJS.src = '../vlab.assets/js/loading-bar.js';
                    document.getElementsByTagName('head')[0].appendChild(ldBarJS);
                    ldBarJS.onload = function() {
                        loader.setAttribute('class', 'ldBar label-center');
                        loader.setAttribute('data-preset', 'circle');
                        loader.setAttribute('data-stroke', '#c3d7e4');
                        var loadingBar = new ldBar(loader);

                        if (document.getElementById('defaultJS').getAttribute('mode') == 'prod') {
                            var ZipLoaderJS = document.createElement('script');
                            ZipLoaderJS.id = 'ZipLoaderJS';
                            ZipLoaderJS.type = 'text/javascript';
                            ZipLoaderJS.src = '../vlab.assets/js/ZipLoader.min.js';
                            document.getElementsByTagName('head')[0].appendChild(ZipLoaderJS);
                            ZipLoaderJS.onload = function() {
                                var zipLoader = new ZipLoader('./bundle.js.zip');
                                zipLoader.on('progress', function(event) {
                                    var percentComplete = event.loaded / event.total * 100;
                                    loadingBar.set(parseInt(percentComplete));
                                });
                                zipLoader.on('load', function(event) {
                                    eval(zipLoader.extractAsText('bundle.js'));
                                    zipLoader.clear();
                                });
                                zipLoader.load();
                            }
                        } else {
                            var oReq = new XMLHttpRequest();
                            oReq.addEventListener('progress', function(event) {
                                var percentComplete = event.loaded / event.total * 100;
                                loadingBar.set(parseInt(percentComplete));
                            });
                            oReq.addEventListener('load', function(event) {
                                eval(oReq.response);
                            });
                            oReq.open('GET', './bundle.js');
                            oReq.send();
                        }
                    };
                };
            } else {
                var warning = Detector.getWebGLErrorMessage();
                console.log(warning);
                document.body.appendChild(warning);
            }
        };
    };
};