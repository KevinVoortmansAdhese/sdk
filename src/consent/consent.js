Adhese.prototype.checkConsent = async function(){
    let tcfCount = 0;
    if (typeof __tcfapi === "function"){
        __tcfapi('addEventListener', 2, this.tcfCallback.bind(this));
    }else {
        if(tcfCount < 10) {
            window.setTimeout(tcfListener, 100);
        } else {
            this.helper.log('No tcf string available after 10 tries');
            return false;
        }

    }
}

Adhese.prototype.tcfCallback = function(tcData, success){
    if(success && tcData.eventStatus === 'tcloaded' != '') {
        this.helper.log('logging consent string', tcData.tcString);
        this.config.consentString = tcData.tcString;
        this.registerRequestParameter('xt', tcData.tcString);
        this.FindSlots(this.config);
    } else {
        this.helper.log('Consent string not found yet, waiting.');
        adhese.registerRequestParameter('tl','none');
    }
}