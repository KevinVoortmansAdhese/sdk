Adhese.prototype.requestStackAds = async function(ads){
    for (ad in ads){
        let results = await this.getStackAds(ads[ad]);
        this.helper.log("We found this ad for position: "+ ad, results.ads)
        ads[ad].ToRenderAds = results.ads;
    }
}

Adhese.prototype.getStackAds = async function(ads, previewURL){
	try {
		this.helper.log("Fetching Stackads for the following positions:", ads);
		let url = "";
		let options = {}
		// if (this.config.requestType === "GET" || typeof previewURL !== "undefined"){
			url = typeof previewURL !== "undefined" && previewURL ? previewURL : this.getRequestUri(ads, {"type":"stack"});
		// }else{
		// 	url = this.config.host+"json";
		// 	options = {
		// 		method: "POST",
		// 		headers: {
		// 			'Content-Type': 'application/json'
		// 		},
		// 		body: JSON.stringify(this.getRequestPayload([ads], this.config))
		// 	}
		// }	
		const call = await fetch(url, options);
		const result = await call.json();	
		return result;
	}
	catch(err) {
		console.log(err);
	}	
}