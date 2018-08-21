// import * as DOMUtils            from '../../vlabs.core/utils/dom.utils.js';

export default class Settings {

    constructor(initObj) {
        this.initObj = initObj;

        this.context = this.initObj.context;
        this.vLabLocator = this.initObj.vLabLocator;

        this.initialize();
    }

    initialize() {
        // console.log(this.context);
        this.settingsButton = document.createElement('div');
        this.settingsButton.id = this.context.name + 'Settings';
        this.settingsButton.className = 'sttingsButton';
        this.settingsButton.addEventListener("mouseup", this.activate.bind(this), false);
        this.settingsButton.addEventListener("touchend", this.activate.bind(this), false);
        document.body.appendChild(this.settingsButton);
        this.settingsButton.style.display = 'none';

        this.container = document.createElement('div');
        this.container.id = this.context.name + 'SettingsViewContainer';
        this.container.className = 'settingsViewContainer';
        this.container.style.display = 'none';
        document.body.appendChild(this.container);

        this.closeBtn = document.createElement('div');
        this.closeBtn.id = this.context.name + 'SettingsViewCloseButton';
        this.closeBtn.className = 'settingsViewCloseButton';
        this.container.appendChild(this.closeBtn);
        this.closeBtn.addEventListener("mouseup", this.close.bind(this), false);
        this.closeBtn.addEventListener("touchend", this.close.bind(this), false);

        this.contentContainer = document.createElement('div');
        this.contentContainer.id = this.context.name + 'SettingsViewContentContainer';
        this.contentContainer.className = 'settingsViewContentContainer';
        this.container.appendChild(this.contentContainer);

        this.contentContainerHeader = document.createElement('div');
        this.contentContainerHeader.innerHTML = '<div style="width: 100%; text-align: center; font-size: 24pt; color: #d4d4d4; margin-bottom: 10px;">SETTINGS</div>';
        this.contentContainer.appendChild(this.contentContainerHeader);

        this.itemsContentContainer = document.createElement("div");
        this.itemsContentContainer.className = 'settingsViewItemsContentContainer';
        this.contentContainer.appendChild(this.itemsContentContainer);

        if (this.initObj.content.groups.length > 0) {
            var settingsGroupsContentHTML = '<table style="width: 100%; border: none; color: white;">';
            for (var i = 0; i < this.initObj.content.groups.length; i++) {
                settingsGroupsContentHTML += '<tr>';
                    settingsGroupsContentHTML += '<td style="width: 40%;"><div class="settingsHeaderHR"></div></td>';
                    settingsGroupsContentHTML += '<td style="text-align: center; font-size: 18px; color:#dbfeff;">' + this.initObj.content.groups[i].title + '</td>';
                    settingsGroupsContentHTML += '<td style="width: 40%;"><div class="settingsHeaderHR"></div></td>';
                settingsGroupsContentHTML += '</tr>';
                settingsGroupsContentHTML += '<tr><td colspan="3" style="height: 10px;"></td></tr>';
                for (var j = 0; j < this.initObj.content.groups[i].items.length; j++) {
                    settingsGroupsContentHTML += '<tr>';
                        settingsGroupsContentHTML += '<td>' + this.initObj.content.groups[i].items[j].label + '</td>';
                        settingsGroupsContentHTML += '<td colspan="2">' + this.initObj.content.groups[i].items[j].innerHTML + '</td>';
                    settingsGroupsContentHTML += '</tr>';
                    settingsGroupsContentHTML += '<tr><td colspan="3" style="height: 10px;"></td></tr>';
                }
            }
            settingsGroupsContentHTML += '</table>';
            this.itemsContentContainer.innerHTML = settingsGroupsContentHTML;
        }

        console.log('Settings initialized');
    }

    showButton() {
        this.settingsButton.style.display = 'block';
    }

    hideButton() {
        this.settingsButton.style.display = 'none';
    }

    isActive() {
        return (this.container.style.display == 'block');
    }

    activate() {
        this.container.style.display = 'block';
        this.settingsButton.style.display = 'none';
        if (this.vLabLocator.currentLocationVLab.statsTHREE) {
            this.vLabLocator.currentLocationVLab.statsTHREE.domElement.style.display = 'none';
            this.vLabLocator.currentLocationVLab.statsTHREE.domElement.style.visibility = 'hidden';
        }
        console.log('Settings activated');

        if (this.context.tablet) this.context.tablet.hideButton();

        if (this.context.onSettingsOpened !== undefined) {
            this.context.onSettingsOpened();
        }

        this.keyDownEventHandlerRef = this.keyDownEventHandler.bind(this);
        addEventListener("keydown", this.keyDownEventHandlerRef, true);
    }

    close() {
        removeEventListener('keydown', this.keyDownEventHandlerRef, true);
        this.container.style.display = 'none';
        let self = this;
        setTimeout(function(){
            if (self.vLabLocator.currentLocationVLab.statsTHREE) {
                self.vLabLocator.currentLocationVLab.statsTHREE.domElement.style.display = 'block';
                self.vLabLocator.currentLocationVLab.statsTHREE.domElement.style.visibility = 'visible';
            }
            if (self.context.tablet) self.context.tablet.showButton();
            self.showButton();
        }, 100);
        if (this.initObj.onClosed) {
            this.initObj.onClosed.call(this.context);
        }

        if (this.context.onSettingsClosed !== undefined) {
            this.context.onSettingsClosed();
        }
    }

    keyDownEventHandler(event) {
        //Esc
        if (event.keyCode == 27) {
            this.close();
        }
    }

}