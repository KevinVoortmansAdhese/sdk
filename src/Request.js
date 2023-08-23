Adhese.prototype.requestAds = async function(){
    this.helper.log("----------------------------------- Requesting Ads from the adserver -------------------------------------------------");
    let results = this.config.requestType === "GET" ? await this.getAds() : await this.postAds();
    this.helper.log("The following Ads are returned from the request", results);
    for (x=0;x<results.length; x++){
        for (var key in this.ads){
            if(results[x].slotName === this.ads[key].slotName){
                this.helper.log("We found this ad for position: "+ key, results[x])
                results[x].destination = this.ads[key].containingElementId;
                this.ads[key].ToRenderAd = results[x];
                if (this.config.safeframe === true)
                    this.safeframe.addPositions([results[x]]);
            }
        }
    }
	if(typeof this.previewActive !== "undefined" && this.previewActive){
		this.getPreviewAds();
	}
    if(!this.config.lazyloading){
        this.helper.log("Lazy loading Not Active! Rendering all positions");
        this.renderAds();
    }else{
        this.helper.log("Lazy loading Active! Loading all Ads and Rendering when in view with the following options:", this.config.lazyloading);
        this.observeAds();
    }
}

Adhese.prototype.getAds = async function(previewURL){	
	this.helper.log("Using GET to Fetch Ads from the adserver");
	const url = typeof previewURL !== "undefined" && previewURL ? previewURL : this.getMultipleRequestUri(this.ads, {'type':'json'});
	this.helper.log("Fetching Ads for all positions with url: ", url);
	try {
		const call = await fetch(url);
		const result = await call.json();	
        return result;
	}
	catch(err) {
		console.log(err);
	}
}

Adhese.prototype.postAds = async function(){
    this.helper.log("Using POST to Fetch Ads from the adserver");
    try {
        const requestbody = this.getRequestPayload(this.ads, this.config);
        this.helper.log("Post settings used are:", requestbody)
		const call = await fetch(this.config.host+"json", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestbody)
        });
        const result = await call.json();
        return result;
    }
    catch(err) {
        console.log(err);
    }
}


Adhese.prototype.getPreviewAds = async function(){
    for (let key in this.previewAds){
		results = await this.getAds(this.previewAds[key].previewUrl);
		for (x=0;x<results.length; x++){
			if (this.previewAds[key].format === results[x].adFormat)
				results[x].destination = this.previewAds[key].containingElementId;
				this.previewAds[key].ToRenderAd = results[x];
				if (this.config.safeframe === true)
                    this.safeframe.addPositions([results[x]]);
		}
	}
	this.renderPreviewAds();
}

/**
 * This function can be used to create a request for several slots at once. For each ad object passed, a sl part is added to the request. The target parameters are added once.
 * @param  {Ad[]} adArray An array of Ad objects that need to be included in the URI
 * @param  {object} options Possible options: type:'js'|'json'|'jsonp', when using type:'jsonp' you can also provide the name of a callback function callback:'callbackFunctionName'. Type 'js' is the default if no options are given. Callback 'callback' is the default for type 'jsonp'
 * @return {string}         The URI to be used to retrieve an array of ads.
 */
Adhese.prototype.getMultipleRequestUri = function(adArray, options) {
	var uri = this.config.host;
 	if (!options) options = {'type':'js'};

 	// add prefix depending on request type
 	switch(options.type) {
	 	case 'json':
	 	uri += 'json/';
	 	break;

	 	case 'jsonp':
	 	if (!options.callbackFunctionName) options.callbackFunctionName = 'callback';
	 	uri += 'jsonp/' + options.callbackFunctionName + '/';
	 	break;

	 	default:
	 	uri += 'ad/';
	 	break;
	}

	 // add an sl clause for each Ad in adArray
	for (var i = adArray.length - 1; i >= 0; i--) {
		var ad = adArray[i];
		if (!ad.previewUrl || (ad.previewUrl && ad.previewUrl.indexOf('preview') == -1)){
			uri += "sl" + ad.slotName + "/";
		}
    }

	for (var a in this.request) {
		var s = a;
		for (var x=0; x<this.request[a].length; x++) {
			s += this.request[a][x] + (this.request[a].length-1>x?';':'');
		}
		uri += s + '/';
	}

	for (var i = 0, a = this.requestExtra; i < a.length; i++) {
        if (a[i]) {
            uri += a[i] + "/";
        }
    }
	uri += '?t=' + new Date().getTime();
	return uri;
};

/**
 * Function that translates array opf ads and target parameters into a payload object for use in a POST request to the ad endpoint
 * @param  {Ad[]} adArray An array of Ad objects that need to be included in the URI
 * @param {object} options	options object
 * @param {object} options.vastContentAsUrl	set to false if you want to receive VAST markup inline, if set to true, response contains a url to retrieve the VAST markup (default true)
 * @return {object}         Object in the Adhese payload structure
 */
Adhese.prototype.getRequestPayload = function(adArray, options) {
	
	let slots = [];
	for (var i in adArray) {
		var ad = adArray[i];
		if (!ad.previewUrl || (ad.previewUrl && ad.previewUrl.indexOf('preview') == -1)){
			slots.push({
				"slotname": ad.slotName,
				"parameters": ad.parameters
			});
		}
	}

	let commonParams = {};
	for (var a in this.request) {
		var values = [];
		for (var x=0; x<this.request[a].length; x++) {
			values.push(this.request[a][x]);
		}
		commonParams[a] = values;
	}
	
	let payload = {
		"slots": slots,
		"parameters": commonParams,
		"vastContentAsUrl": (options && options.vastContentAsUrl ? options.vastContentAsUrl : true)
	 };
	 return payload;
};

/**
 * Returns the uri to execute the actual request for this ad
 *
 * @param {Ad} ad the Ad instance whose uri is needed
 * @param {object} options Possible options: type:'js'|'json'|'jsonp', when using type:'jsonp' you can also provide the name of a callback function callback:'callbackFunctionName'. Type 'js' is the default if no options are given. Callback 'callback' is the default for type 'jsonp'
 * @return {string}
 */
Adhese.prototype.getRequestUri = function(ad, options) {
    if(options.preview  && options.preview == true){
       return ad.swfSrc;
    }else{
        var adArray = [ ad ];
        return this.getMultipleRequestUri(adArray, options);
    }

};