Adhese.prototype.FindSlots = function(options) {
    this.helper.log("----------------------------------- Finding Adslots on the page -------------------------------------------------");
    var returned_slots = {};
    let slots = document.querySelectorAll(".adunit");
    for(x=0; x< slots.length; x++){
        const format = slots[x].dataset.format;
        const slot = slots[x].dataset.slot !== undefined ? slots[x].dataset.slot : this.CountSlot(slots[x].dataset.format);
        const slot_id = format + "_" + slot

        slots[x].id = slot_id;
        options.containerId = slot_id;

        if(this.previewActive && format in Object.keys(adhese.previewFormats)){
            // MAKE PREVIEW SETTINGS
        }else{
            //COMPLETE NORMAL SETTINGS
            options.position = typeof slots[x].dataset.slot !== "undefined" ? slots[x].dataset.slot : "";
            options.parameters = typeof slots[x].dataset.parameters !== "undefined" ? JSON.parse(slots[x].dataset.parameters) : {};
            options.slot = slot;
            options.containingElementID = this.createSlotDestination(slots[x]);
            options.loaded = false;
            options.toRenderAd = new Array;
            returned_slots[slots[x].dataset.format + "_" + slot] = new this.Ad(this, slots[x].dataset.format, options);
        }
        this.helper.log("Slot Found for settings:", returned_slots[slots[x].dataset.format + "_" + slot])
    }
    return returned_slots
}


Adhese.prototype.CountSlot = function(format){
    this.formatCount[format] = this.formatCount[format] !== undefined ? this.formatCount[format]+1 : 1;
    return this.formatCount[format];
}

Adhese.prototype.createSlotDestination = function(destination){
    var child = document.createElement("div");
    child.id = destination.id + "_child";
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