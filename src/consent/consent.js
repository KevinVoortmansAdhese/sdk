Adhese.prototype.checkTCFConsent = async function(){
    if (typeof __tcfapi === "function"){
        __tcfapi('addEventListener', 2, this.tcfCallback.bind(this));
    }
}

Adhese.prototype.tcfCallback = function(tcData, success){
    if(success && tcData.eventStatus === 'tcloaded' != '') {
        this.helper.log('logging consent string', tcData.tcString);
        this.config.consentString = tcData.tcString;
        this.registerRequestParameter('xt', tcData.tcString);
        this.FindSlots(this.config);
        if (this.config.userSync){
            this.usersync();
        }
    } else {
        this.helper.log('Consent string not found yet, waiting.');
        adhese.registerRequestParameter('tl','none');
    }
}