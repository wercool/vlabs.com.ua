// import * as DOMUtils            from '../../vlabs.core/utils/dom.utils.js';

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
        this.tabletButton.addEventListener("mouseup", this.activate.bind(this), false);
        this.tabletButton.addEventListener("touchend", this.activate.bind(this), false);
        this.tabletButton.style.display = 'none';
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

        this.tabletShortToast = document.createElement('div');
        this.tabletShortToast.id = this.context.name + 'TabletShortToast';
        this.tabletShortToast.className = 'tabletShortToast';
        document.body.appendChild(this.tabletShortToast);

        this.container = document.createElement('div');
        this.container.id = this.context.name + 'TabletViewContainer';
        this.container.className = 'tabletViewContainer';
        this.container.style.display = 'none';
        document.body.appendChild(this.container);

        this.closeBtn = document.createElement('div');
        this.closeBtn.id = this.context.name + 'TabletViewCloseButton';
        this.closeBtn.className = 'tabletViewCloseButton';
        this.container.appendChild(this.closeBtn);
        this.closeBtn.addEventListener("mouseup", this.close.bind(this), false);
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

            this.modeActivationButton = document.createElement('button');
            this.modeActivationButton.innerHTML = 'ACTIVATE MODE';
            this.modeActivationButton.setAttribute('defaultInnerHTML', 'ACTIVATE MODE');
            this.modeActivationButton.setAttribute('confirmInnerHTML', '<span style="color: yellow;">Sure?</span>');
            this.modeActivationButton.className = 'tabletViewTabActivateButton';
            this.modeActivationButton.addEventListener("mousedown", this.modeActivateButtonPressed.bind(this), false);
            this.modeActivationButton.addEventListener("touchstart", this.modeActivateButtonPressed.bind(this), false);
            this.contentContainer.appendChild(this.modeActivationButton);

            this.setActiveTab(0);
        } else {

        }

        console.log('Tablet initialized');
    }

    showButton() {
        this.tabletButton.style.display = 'block';
        this.showTabletShortToast();
    }

    hideButton() {
        this.tabletButton.style.display = 'none';
        this.tabletShortToast.style.display = 'none';
    }

    isActive() {
        return (this.container.style.display == 'block');
    }

    showTabletShortToast(extraInnerHtml, showTabletPointer = false, attention = false) {
        if (this.tabletShortToastTimeout) {
            this.tabletShortToast.style.display = 'none';
            this.tabletShortToast.innerHTML = '';
            clearTimeout(this.tabletShortToastTimeout);
        }
        if (this.initObj.content.tabs[this.currentActiveTabId].items.length > 0) {
            for (var i = 0; i < this.initObj.content.tabs[this.currentActiveTabId].items.length; i++) {
                if (this.tabletShortToast.style.display !== 'block' && !this.initObj.content.tabs[this.currentActiveTabId].items[i].completed) {
                    this.tabletShortToast.innerHTML = '<div style="color: #c4c4c4; font-size: 18px; margin: 5px; min-height: 24px; clear: both;">' + this.initObj.content.tabs[this.currentActiveTabId].title + '</div>';
                    this.tabletShortToast.innerHTML += (attention == true ? '<img src="../vlabs.assets/img/attention.png" style="margin-right: 10px; vertical-align: middle;"/>' : '') + this.initObj.content.tabs[this.currentActiveTabId].items[i].shortDesc;
                    if (attention == true) {
                        this.tabletShortToast.innerHTML += '<div> click / tap <img src="../vlabs.assets/img/tablet.png" height="64" style="vertical-align: middle;"> for assistance</div>';
                    }
                    if (extraInnerHtml !== undefined) {
                        this.tabletShortToast.innerHTML += extraInnerHtml;
                    }
                    this.tabletShortToast.style.display = 'block';
                    var self = this;
                    this.tabletShortToastTimeout = setTimeout(() => {
                        self.tabletShortToast.style.display = 'none';
                        this.tabletShortToast.innerHTML = '';
                    }, 15000);
                }
            }
        }
        if (showTabletPointer) {
            self.tabletButtonPointer.style.display = 'block';
        }
    }

    activate() {
        this.tabletButtonPointer.style.display = 'none';
        this.container.style.display = 'block';
        this.hideButton();
        if (this.vLabLocator.currentLocationVLab.statsTHREE) {
            this.vLabLocator.currentLocationVLab.statsTHREE.domElement.style.visibility = 'hidden';
            this.vLabLocator.currentLocationVLab.statsTHREE.domElement.style.display = 'none';
        }
        console.log('Tablet activated');

        if (this.context.settings) this.context.settings.hideButton();

        if (this.context.onTabletOpened !== undefined) {
            this.context.onTabletOpened();
        }

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

        this.keyDownEventHandlerRef = this.keyDownEventHandler.bind(this);
        addEventListener("keydown", this.keyDownEventHandlerRef, true);
    }

    close(event) {
        if (event) event.stopPropagation();
        this.container.style.display = 'none';
        let self = this;
        setTimeout(function(){
            if (self.vLabLocator.currentLocationVLab.statsTHREE) {
                self.vLabLocator.currentLocationVLab.statsTHREE.domElement.style.display = 'block';
                self.vLabLocator.currentLocationVLab.statsTHREE.domElement.style.visibility = 'visible';
            }
            if (self.context.settings) self.context.settings.showButton();
            self.showButton();
        }, 100);
        removeEventListener('keydown', this.keyDownEventHandlerRef, true);
        this.showTabletShortToast();
        if (this.context.onTabletClosed !== undefined) {
            this.context.onTabletClosed();
        }
    }

    tabButtonPressed(event) {
        var pressedTabButton = event.target;
        this.tabButtons.forEach(tabButton => {
            tabButton.classList.remove("tabletViewContentTabsButtonPreselected");
        });
        pressedTabButton.classList.add("tabletViewContentTabsButtonPreselected");
        console.log('"' + this.initObj.content.tabs[pressedTabButton.getAttribute('tabId')].title + '" Tablet tab selected');

        this.renderTabContent(pressedTabButton.getAttribute('tabId'));
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

    modeActivateButtonPressed() {
        // if (this.modeActivationButton.innerHTML == this.modeActivationButton.getAttribute('confirmInnerHTML')) {
        if (true) {
            if (this.initObj.content.tabs[this.currentSelectedTabId].setModeCallBack !== undefined) {
                this.initObj.content.tabs[this.currentSelectedTabId].setModeCallBack.call(this.context);
            }
            this.resetTabContentItems();
            this.setActiveTab(this.currentSelectedTabId);
            this.modeActivationButton.style.visibility = 'collapse';
        } else {
            this.modeActivationButton.innerHTML = this.modeActivationButton.getAttribute('confirmInnerHTML');
        }
    }

    setActiveTab(tabId) {
        this.tabButtons.forEach(tabButton => {
            tabButton.classList.remove("tabletViewContentTabsButtonSelected");
        });
        this.tabButtons[tabId].classList.add("tabletViewContentTabsButtonSelected");
        this.currentActiveTabId = tabId;
        this.renderTabContent(tabId);
    }

    renderTabContent(tabId) {
        this.currentSelectedTabId = tabId;
        this.modeActivationButton.style.visibility = 'collapse';
        let tabContentHTML = '';
        if (tabId != this.currentActiveTabId) {
            this.modeActivationButton.innerHTML = this.modeActivationButton.getAttribute('defaultInnerHTML');
            this.modeActivationButton.style.visibility = 'visible';
            tabContentHTML += '<div style="opacity: 0.35;">';
        }
        if (this.initObj.content.tabs[tabId].items.length > 0) {
            tabContentHTML += '<table style="width: 100%; border: none; color: white;">';
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
        }
        if (tabId != this.currentActiveTabId) {
            tabContentHTML += '</div>';
        }
        this.itemsContentContainer.innerHTML = tabContentHTML;
    }

    stepCompletedAnimation(){
        this.tabletButtonCompleted.classList.remove("hidden");
        this.tabletButtonCompleted.classList.add("visible");
        var self = this;
        setTimeout(()=>{
            self.tabletButtonCompleted.classList.remove("visible");
            self.tabletButtonCompleted.classList.add("hidden");
            self.tabletButtonPointer.style.display = 'block';

            self.showTabletShortToast();

        }, 2000);
    }

    resetTabContentItems() {
        for (var t = 0; t < this.initObj.content.tabs.length; t++) {
            for (var ti = 0; ti < this.initObj.content.tabs[t].items.length; ti++) {
                if (this.initObj.content.tabs[t].items[ti].completed !== undefined) {
                    this.initObj.content.tabs[t].items[ti].completed = false;
                }
            }
        }
    }

    keyDownEventHandler(event) {
        //Esc
        if (event.keyCode == 27) {
            this.close();
        }
    }
}