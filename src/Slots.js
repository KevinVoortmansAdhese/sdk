Adhese.prototype.getFormat = function (slot){
    if (typeof this.config.currentBreakpoint !== "undefined"){
        if (typeof slot.dataset[this.config.currentBreakpoint+"Format"] !== "undefined"){
            return slot.dataset[this.config.currentBreakpoint+"Format"];
        }else {
            return typeof slot.dataset.format !== "undefined" ? slot.dataset.format : slot.dataset[this.config.device+"Format"];
        }
    }else {
        return typeof slot.dataset.format !== "undefined" ? slot.dataset.format : slot.dataset[this.config.device+"Format"];
    }
}

Adhese.prototype.FindSlots = function(options) {
    this.helper.log("----------------------------------- Finding Adslots on the page -------------------------------------------------");
    let slots = document.querySelectorAll(".adunit");
    for(x=0; x< slots.length; x++){
        const format = this.getFormat(slots[x]);
        const slot = slots[x].dataset.slot !== undefined ? slots[x].dataset.slot : this.CountSlot(format);
        const slot_id = format + "_" + slot
        options.containingElementID = this.createSlotDestination(slots[x], slot_id);
        options.loaded = false;
        options.toRenderAd = new Array;

        if(this.previewActive && format in adhese.previewFormats){
            options.previewActive = true;
            var previewAd = new this.Ad(this, format, options);
            //previewAd.adType = format;
            previewAd.ext = "js";
            previewAd.previewUrl = this.config.previewHost + "/creatives/preview/json/tag.do?id=" + this.previewFormats[format].creative + "&slotId=" + this.previewFormats[format].slot;
            previewAd.width = this.previewFormats[format].width;
            previewAd.height = this.previewFormats[format].height;
            this.previewAds[format + "_" + slot] = previewAd;
            this.helper.log("Preview Required for slot: "+ format + "_" + slot + "with settings;", previewAd)
        }else{
            //COMPLETE NORMAL SETTINGS
            options.position = typeof slots[x].dataset.slot !== "undefined" ? slots[x].dataset.slot : "";
            options.parameters = typeof slots[x].dataset.parameters !== "undefined" ? JSON.parse(slots[x].dataset.parameters) : {};
            options.slot = slot;

            options.disableLazyRender = typeof slots[x].dataset.disablelazyrender !== "undefined" && slots[x].dataset.disablelazyrender === "true" ? true : false;

            if (typeof slots[x].dataset.maxads !== "undefined" && slots[x].dataset.maxads){
                if(typeof this.StackAd !== "undefined"){
                    if(typeof slots[x].dataset.lazyrequest !== "undefined" && slots[x].dataset.lazyrequest === "true"){
                        this.stackAds.lazyRequest[format + "_" + slot] = new this.StackAd(this, format, options, slots[x].dataset.maxads);
                        this.helper.log("Stack Ad Slot Found for Lazy Requesting with settings:", this.stackAds.lazyRequest[format + "_" + slot])
                    }else{
                        this.stackAds.initRequest[format + "_" + slot] = new this.StackAd(this, format, options, slots[x].dataset.maxads);
                        this.helper.log("Stack Ad Slot Found for Init requesting with settings:", this.stackAds.initRequest[format + "_" + slot])
                    }
                }else{
                    this.helper.log("Stack Ads not enabled in this library. Contact Adhese support if you need this.");
                }
            }else{
                if(typeof slots[x].dataset.lazyrequest !== "undefined" && slots[x].dataset.lazyrequest === "true"){
                    this.ads.lazyRequest[format + "_" + slot] = new this.Ad(this, format, options);
                    this.helper.log("Slot Found for Lazy Requesting with settings:", this.ads.lazyRequest[format + "_" + slot])
                }else{
                    this.ads.initRequest[format + "_" + slot] = new this.Ad(this, format, options);
                    this.helper.log("Slot Found for Init requesting with settings:", this.ads.initRequest[format + "_" + slot])
                }
            }
        }
    }
    this.FindAds();
}


Adhese.prototype.CountSlot = function(format){
    this.formatCount[format] = this.formatCount[format] !== undefined ? this.formatCount[format]+1 : 1;
    return this.formatCount[format];
}

Adhese.prototype.createSlotDestination = function(destination, slot_id){
    var child = document.createElement("div");
    child.id = slot_id;
    destination.appendChild(child);
    return child.id
}

/**
 * Returns the slot name for this ad
 *
 * @param {Ad} ad the Ad instance whose uri is needed
 * @return {string}
 */
Adhese.prototype.getSlotName = function(ad) {
	if(ad.options.position && ad.options.location) {
		u = ad.options.location + ad.options.position;
	} else if(ad.options.position) {
		u = this.config.location + ad.options.position;
	} else if (ad.options.location) {
		u = ad.options.location;
	} else {
		u = this.config.location;
	}
	return u  + "-" + ad.format;	
}