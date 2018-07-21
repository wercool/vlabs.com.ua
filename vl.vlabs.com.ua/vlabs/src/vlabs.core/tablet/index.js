import * as DOMUtils            from '../../vlabs.core/utils/dom.utils.js';

export default class Tablet {

    constructor(initObj) {
        this.initObj = initObj;

        this.context = this.initObj.context;
        this.vLabLocator = this.initObj.vLabLocator;

        this.initialize();
    }

    initialize() {
        // console.log(this.context);
        this.tabletButton = document.createElement('div');
        this.tabletButton.id = this.context.name + 'Tablet';
        this.tabletButton.className = 'tabletButton';
        this.tabletButton.addEventListener("mousedown", this.activate.bind(this), false);
        this.tabletButton.addEventListener("touchstart", this.activate.bind(this), false);
        document.body.appendChild(this.tabletButton);

        this.container = document.createElement('div');
        this.container.id = this.context.name + 'TabletViewContainer';
        this.container.className = 'tabletViewContainer';
        this.container.style.display = 'none';
        document.body.appendChild(this.container);

        this.closeBtn = document.createElement('div');
        this.closeBtn.id = this.context.name + 'TabletViewCloseButton';
        this.closeBtn.className = 'tabletViewCloseButton';
        this.container.appendChild(this.closeBtn);
        this.closeBtn.addEventListener("mousedown", this.close.bind(this), false);
        this.closeBtn.addEventListener("touchend", this.close.bind(this), false);

        this.contentContainer = document.createElement('div');
        this.contentContainer.id = this.context.name + 'TabletViewContentContainer';
        this.contentContainer.className = 'tabletViewContentContainer';
        this.container.appendChild(this.contentContainer);

        this.contentContainerHeader = document.createElement('div');
        this.contentContainerHeader.innerHTML = '<div style="width: 100%; text-align: center; font-size: 18pt; color: #d4d4d4;">' + this.initObj.content.header + '</div>';
        this.contentContainer.appendChild(this.contentContainerHeader);

        if (Object.keys(this.initObj.content.tabs).length > 1) {
            this.tabs = document.createElement('div');
            this.tabs.className = 'tabletViewContentTabsButtons';
            for (var tabName in this.initObj.content.tabs) {
                var tabButton = document.createElement('button');
                tabButton.innerHTML = this.initObj.content.tabs[tabName].title;
                tabButton.className = 'tabletViewContentTabsButton';
                this.tabs.appendChild(tabButton);
            }
            this.contentContainer.appendChild(this.tabs);
        } else {

        }

        console.log('Tablet initialized');
    }

    activate() {
        this.container.style.display = 'block';
        this.tabletButton.style.display = 'none';
        if (this.vLabLocator.currentLocationVLab.statsTHREE) this.vLabLocator.currentLocationVLab.statsTHREE.domElement.style.display = 'none';
        console.log('Tablet activated');
    }

    close() {
        this.container.style.display = 'none';
        this.tabletButton.style.display = 'block';
        let self = this;
        setTimeout(function(){
            if (self.vLabLocator.currentLocationVLab.statsTHREE) self.vLabLocator.currentLocationVLab.statsTHREE.domElement.style.display = 'block';
        }, 100);
    }

}