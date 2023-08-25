Adhese.prototype.FindSlots = function(options) {
    this.helper.log("----------------------------------- Finding Adslots on the page -------------------------------------------------");
    let slots = document.querySelectorAll(".adunit");
    for(x=0; x< slots.length; x++){
        const format = slots[x].dataset.format;
        const slot = slots[x].dataset.slot !== undefined ? slots[x].dataset.slot : this.CountSlot(slots[x].dataset.format);
        const slot_id = format + "_" + slot

        //slots[x].id = slot_id;
        //options.containerId = slot_id;
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
            this.previewAds[slots[x].dataset.format + "_" + slot] = previewAd;
            this.helper.log("Preview Required for slot: "+ slots[x].dataset.format + "_" + slot + "with settings;", previewAd)
        }else{
            //COMPLETE NORMAL SETTINGS
            options.position = typeof slots[x].dataset.slot !== "undefined" ? slots[x].dataset.slot : "";
            options.parameters = typeof slots[x].dataset.parameters !== "undefined" ? JSON.parse(slots[x].dataset.parameters) : {};
            options.slot = slot;

            options.lazyRequest = typeof slots[x].dataset.lazyrequest !== "undefined" && slots[x].dataset.lazyrequest === "true" ? true : false;
            options.disableLazyRender = typeof slots[x].dataset.disablelazyrender !== "undefined" && slots[x].dataset.disablelazyrender === "true" ? true : false;

            this.ads[slots[x].dataset.format + "_" + slot] = new this.Ad(this, slots[x].dataset.format, options);
            this.helper.log("Slot Found for settings:", this.ads[slots[x].dataset.format + "_" + slot])
        }
        
    }
    this.requestAds();
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