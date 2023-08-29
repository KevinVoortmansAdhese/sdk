Adhese.prototype.FindAds = async function(){
    this.helper.log("----------------------------------- Requesting Ads from the adserver -------------------------------------------------");
	if(typeof this.previewActive !== "undefined" && this.previewActive){
		this.helper.log("************************************ Setting up a Preview *******************************************************");
		this.getPreviewAds();
	}
	if (Object.keys(this.ads.initRequest).length !== 0){
		await this.requestAds(this.ads.initRequest);
		if(!this.config.lazyloading){
			this.helper.log("Lazy Rendering Not Active! Rendering all positions");
			this.renderAds(this.ads.initRequest);
		}else{
			this.helper.log("************************************ Setting up lazy Rendering *******************************************************");
			this.helper.log("Lazy Rendering Active! Rendering the ads when they come into view with the following options:", this.config.lazyloading);
			this.observeAds(this.ads.initRequest);
		}
	}
	if (Object.keys(this.stackAds.initRequest).length !== 0){
		// await this.requestStackAds(this.stackAds.initRequest); // Us this for the old endpoint
		await this.requestStackAds(this.stackAds.initRequest); // use this for the new /m/stack endpoint
		if(!this.config.lazyloading){
			this.helper.log("Lazy Rendering Not Active! Rendering all Stack positions");
			this.renderStackAds(this.stackAds.initRequest);
		}else{
			this.helper.log("************************************ Setting up lazy Rendering *******************************************************");
			this.helper.log("Lazy Rendering Active! Rendering the stack ads when they come into view with the following options:", this.config.lazyloading);
			this.observeStackAds(this.stackAds.initRequest);
		}
	}
	if(Object.keys(this.ads.lazyRequest).length !== 0){
		this.helper.log("************************************ Setting up lazy Requesting for ads *******************************************************");
		this.helper.log("Found Postions with Lazy Requesting Enabled. Only requesting ads when the position becomes visible")
		this.observeRequests(this.ads.lazyRequest);
	}
	if(Object.keys(this.stackAds.lazyRequest).length !== 0){
		this.helper.log("************************************ Setting up lazy Requesting for stack ads *******************************************************");
		this.helper.log("Found Stack Postions with Lazy Requesting Enabled. Only requesting ads when the position becomes visible")
		this.observeRequests(this.stackAds.lazyRequest);
	}
}


Adhese.prototype.requestAds = async function(ads){
	let results = await this.getAds(ads);
    this.helper.log("The following Ads are returned from the request", results);
    for (x=0;x<results.length; x++){
        for (var key in ads){
            if(results[x].slotName === ads[key].slotName){
                this.helper.log("We found this ad for position: "+ key, results[x])
                results[x].destination = ads[key].containingElementId;
                ads[key].ToRenderAd = results[x];
                if (this.config.safeframe === true)
                    this.safeframe.addPositions([results[x]]);
            }
        }
    }
}

Adhese.prototype.getAds = async function(ads, previewURL){
	try {
		this.helper.log("Fetching ads for the following positions:", ads);
		let url = "";
		let options = {}
		if (this.config.requestType === "GET" || typeof previewURL !== "undefined"){
			url = typeof previewURL !== "undefined" && previewURL ? previewURL : this.getMultipleRequestUri(Object.values(ads), {'type':'json'});
		}else{
			url = this.config.host+"json";
			options = {
				method: "POST",
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(this.getRequestPayload(ads, this.config))
			}
		}	
		const call = await fetch(url, options);
		const result = await call.json();	
		return result;
	}
	catch(err) {
		console.log(err);
	}	
}

Adhese.prototype.lazyRequestAds = function(changes, observer){
    changes.forEach(async element => {
        if(!element.target.dataset.loaded && element.intersectionRatio === 1){
            this.helper.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++",element.target.id + " Became visible! Requesting and rendering Ad in position.");
            let results = await this.getAds([this.ads.lazyRequest[element.target.id]]);
			results[0].destination = this.ads.lazyRequest[element.target.id].containingElementId;
			this.helper.log("The following ad is returned", results[0])
            this.ads.lazyRequest[element.target.id].ToRenderAd = results[0];
			if (this.config.safeframe === true)
				this.safeframe.addPositions([this.ads.lazyRequest[element.target.id].ToRenderAd]);
			this.helper.log("Rendering Lazy Requested Ad for: "+element.target.id)
			this.renderAd( this.ads.lazyRequest[element.target.id])
		}
    });
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

		case 'stack':
		uri += 'm/stack/';
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
	uri += typeof options.type !== "undefined" && options.type === "stack" ? '&max_ads=' + ad.maxAds : "";
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