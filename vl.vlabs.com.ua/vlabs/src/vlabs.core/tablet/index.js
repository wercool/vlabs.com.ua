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
        this.tabletButtonCompleted = document.createElement('div');
        this.tabletButtonCompleted.id = this.context.name + 'TabletButtonCompleted';
        this.tabletButtonCompleted.className = 'tabletButtonCompleted';
        this.tabletButtonCompleted.classList.add("hidden");
        this.tabletButton.appendChild(this.tabletButtonCompleted);
        this.tabletButtonPointer = document.createElement('div');
        this.tabletButtonPointer.id = this.context.name + 'tabletButtonPointer';
        this.tabletButtonPointer.className = 'tabletButtonPointer';
        this.tabletButton.appendChild(this.tabletButtonPointer);


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
        this.contentContainerHeader.innerHTML = '<div style="width: 100%; text-align: center; font-size: 24pt; color: #d4d4d4; margin-bottom: 10px;">' + this.initObj.content.header + '</div>';
        this.contentContainer.appendChild(this.contentContainerHeader);

        if (Object.keys(this.initObj.content.tabs).length > 1) {
            this.tabButtons = [];
            this.tabs = document.createElement('div');
            this.tabs.className = 'tabletViewContentTabsButtons';
            for (var i = 0; i < this.initObj.content.tabs.length; i++) {
                var tabButton = document.createElement('button');
                tabButton.innerHTML = this.initObj.content.tabs[i].title;
                tabButton.className = 'tabletViewContentTabsButton';
                tabButton.setAttribute('tabId', i);
                tabButton.addEventListener("mousedown", this.tabButtonPressed.bind(this), false);
                tabButton.addEventListener("touchstart", this.tabButtonPressed.bind(this), false);
                this.tabs.appendChild(tabButton);
                this.tabButtons.push(tabButton);
            }
            this.contentContainer.appendChild(this.tabs);

            this.tabsPrevButton = document.createElement('div');
            this.tabsPrevButton.className = 'tabletViewTabPrev';
            this.tabsPrevButton.addEventListener("mousedown", this.tabPrevNextButtonPressed.bind(this), false);
            this.tabsPrevButton.addEventListener("touchstart", this.tabPrevNextButtonPressed.bind(this), false);
            this.contentContainer.appendChild(this.tabsPrevButton);
            this.tabsNextButton = document.createElement('div');
            this.tabsNextButton.className = 'tabletViewTabNext';
            this.tabsNextButton.addEventListener("mousedown", this.tabPrevNextButtonPressed.bind(this), false);
            this.tabsNextButton.addEventListener("touchstart", this.tabPrevNextButtonPressed.bind(this), false);
            this.contentContainer.appendChild(this.tabsNextButton);

            var headerHR = document.createElement("hr");
            headerHR.className = 'tabletHeaderHR';
            this.contentContainer.appendChild(headerHR);

            this.itemsContentContainer = document.createElement("div");
            this.itemsContentContainer.className = 'tabletViewItemsContentContainer';
            this.contentContainer.appendChild(this.itemsContentContainer);

            this.setActiveTab(0);
        } else {

        }

        console.log('Tablet initialized');
    }

    activate() {
        this.tabletButtonPointer.style.display = 'none';
        this.container.style.display = 'block';
        this.tabletButton.style.display = 'none';
        if (this.vLabLocator.currentLocationVLab.statsTHREE) this.vLabLocator.currentLocationVLab.statsTHREE.domElement.style.display = 'none';
        console.log('Tablet activated');

        var sumWidthOfButtonsInHeader = 0;
        this.tabButtons.forEach(tabButton => {
            sumWidthOfButtonsInHeader += tabButton.offsetWidth;
        });
        if (this.tabs.offsetWidth < sumWidthOfButtonsInHeader + this.tabButtons.length * 10) {
            if (this.tabs.scrollLeft == 0) {
                this.tabsNextButton.style.display = 'block';
            }
        }

        this.setActiveTab(this.currentActiveTabId);
    }

    close() {
        this.container.style.display = 'none';
        this.tabletButton.style.display = 'block';
        let self = this;
        setTimeout(function(){
            if (self.vLabLocator.currentLocationVLab.statsTHREE) self.vLabLocator.currentLocationVLab.statsTHREE.domElement.style.display = 'block';
        }, 100);
    }

    tabButtonPressed(event) {
        var pressedTabButton = event.target;
        this.tabButtons.forEach(tabButton => {
            tabButton.classList.remove("tabletViewContentTabsButtonPreselected");
        });
        pressedTabButton.classList.add("tabletViewContentTabsButtonPreselected");
        // console.log(pressedTabButton.getAttribute('tabId'));
    }

    tabPrevNextButtonPressed(event) {
        var pressedButton = event.target;
        if (pressedButton == this.tabsNextButton) {
            this.tabs.scrollBy(50, 0);
            this.tabsPrevButton.style.display = 'block';
        }
        if (pressedButton == this.tabsPrevButton) {
            this.tabs.scrollBy(-50, 0);
        }
        if (this.tabs.scrollLeft == 0) {
            this.tabsNextButton.style.display = 'block';
            this.tabsPrevButton.style.display = 'none';
        }
        if (this.tabs.offsetWidth + this.tabs.scrollLeft == this.tabs.scrollWidth) {
            this.tabsNextButton.style.display = 'none';
        }
    }

    setActiveTab(tabId) {
        this.tabButtons[tabId].classList.add("tabletViewContentTabsButtonSelected");

        if (this.initObj.content.tabs[tabId].items.length > 0) {
            var tabContentHTML = '<table style="width: 100%; border: none; color: white;">';
            for (var i = 0; i < this.initObj.content.tabs[tabId].items.length; i++) {
                tabContentHTML += '<tr>';
                    tabContentHTML += '<td style="font-size: 24px; vertical-align: top; ' + (this.initObj.content.tabs[tabId].items[i].completed ? 'color: #44ff00;' : '') + '">';
                    tabContentHTML += (i + 1) + '.';
                    tabContentHTML += '</td>';
                    tabContentHTML += '<td style="max-width: 70vw;">';
                    tabContentHTML += '<span style="font-size: 24px; vertical-align: top; ' + (this.initObj.content.tabs[tabId].items[i].completed ? 'color: #44ff00;' : '') + '">' + this.initObj.content.tabs[tabId].items[i].shortDesc + '</span>';
                    tabContentHTML += '</br>';
                    tabContentHTML += '<span style="font-size: 16px; vertical-align: top;">' + this.initObj.content.tabs[tabId].items[i].detailDesc + '</span>';
                    tabContentHTML += '</td>';
                    tabContentHTML += '<td style="vertical-align: top;">';
                    tabContentHTML += this.initObj.content.tabs[tabId].items[i].completed ? '<img src="../vlabs.assets/img/completed.png"/>' : '<img src="../vlabs.assets/img/incompleted.png"/>';
                    tabContentHTML += '</td>';
                tabContentHTML += '</tr>';
            }
            tabContentHTML += '</table>';

            this.itemsContentContainer.innerHTML = tabContentHTML;
        }

        this.currentActiveTabId = tabId;
    }

    stepCompletedAnimation(){
        this.tabletButtonCompleted.classList.remove("hidden");
        this.tabletButtonCompleted.classList.add("visible");
        var self = this;
        setTimeout(()=>{
            self.tabletButtonCompleted.classList.remove("visible");
            self.tabletButtonCompleted.classList.add("hidden");
            self.tabletButtonPointer.style.display = 'block';
        }, 4000);
    }

}