/**
 * @class
 * Ad object represents an internal advertisement that can be requested from the server.
 * Both request and response are defined by this object. An ad can be found in the mainObject.ads array, through it's format code.
 *
 * @formatCode {string} The format code for this Ad, will be used as id in further reference to this Ad.
 * @param	{object} options	An object containing the available options for this Ad.
 * @param {string} options.location An optional string that identifies this Ad's location. Beware, this will overwrite the global Adhese.location property for this Ad.
 * @param {string} options.position An optional string defining this Ad's position. The string will be added to Adhese.location to identifiy this Ad. Intended for using the same formatCode more than once in the same location.
 * @param {string} options.containerId An optional string defining this Ad's container, intended to be used in pages where the same slot is requested multiple times and needs to be visualised in a different element (ex.: endlessly scrolling web pages)
 * @param {string} options.parameters An optional object containing target parameters for this ad. The object keys are the request prefixes, the values an array of strings or ints.
 * @return {void}
 */
 Adhese.prototype.StackAd = function(adhese, formatCode, options, maxAds) {
 	var defaults = { write:false };
 	this.format = (options && options.format?options.format:formatCode);
    this.options = adhese.helper.merge(defaults, options);
	this.uid = formatCode;
	this.safeframe = (options && options.safeframe?options.safeframe:false);
	this.maxAds = maxAds;
	this.ToRenderAds = [];
 	if (this.options.position!=undefined) {
		this.uid = this.options.position + this.format;
	}
	this.slotName = this.getSlotName(this);
	this.containingElementId = options.containingElementID;
	if (options && options.parameters) this.parameters = options.parameters;
	else this.parameters = {};
 	return this;
 };


/**
 * Returns the containing element id for this ad
 *
 * @param {Ad} ad the Ad instance whose uri is needed
 * @return {string}
 */
Adhese.prototype.StackAd.prototype.getContainingElementId = function() {
	if (this.options.slotName && this.containerId!="") {
		return this.options.slotName + "_" + this.containerId;
	} else if (this.options.slotName) {
		return this.options.slotName;
	} else if (this.containerId!="") {
		return this.uid + "_" + this.containerId;
	} else {
		return this.uid;
	}
}


/**
 * Returns the slot name for this ad
 *
 * @param {Ad} ad the Ad instance whose uri is needed
 * @return {string}
 */
Adhese.prototype.StackAd.prototype.getSlotName = function(adhese) {
	var u = "";
	if(this.options.position && this.options.location) {
		u = this.options.location + this.options.position;
	} else if(this.options.position) {
		u = adhese.config.location + this.options.position;
	} else if (this.options.location) {
		u = this.options.location;
	} else {
		u = adhese.config.location;
	}
	return u  + "-" + this.format;	
}
