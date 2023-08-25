Adhese.prototype.addObserver = function (type, callback){
    this.helper.log("************************************ ADDING "+type.toUpperCase()+" OBSERVER *******************************************************");
    let options = {
        root: null, // relative to document viewport 
        rootMargin: '200px', // margin around root. Values are similar to css property. Unitless values not allowed 
        threshold: 1.0 // visible amount of item shown in relation to root 
    }
    if (typeof this.config.lazyloading === 'object' && this.config.lazyloading.settings !== null) {
            options.root = this.config.lazyloading.settings.parent !== undefined ? this.config.lazyloading.settings.parent : options.root, // relative to document viewport 
            options.rootMargin = this.config.lazyloading.settings.rootMargin !== undefined ? this.config.lazyloading.settings.rootMargin : options.rootMargin, // margin around root. Values are similar to css property. Unitless values not allowed 
            options.threshold = this.config.lazyloading.settings.threshold !== undefined ? this.config.lazyloading.settings.threshold : options.threshold // visible amount of item shown in relation to root 
    }
    this.observers[type] = new IntersectionObserver(callback.bind(this), options)
}

Adhese.prototype.observeAds = function(){
    this.addObserver("ad", this.lazyRenderAds)
    for(div_name in this.ads){
        if(!this.ads[div_name].options.lazyRequest){
            if(!this.ads[div_name].options.disableLazyRender){
                this.helper.log("enabled an obverser for: " + div_name + " Rendering ad when div becomes visible.");
                var destination = document.getElementById(div_name);
                this.observers.ad.observe(destination);
            }else{
                this.helper.log("Lazy Rendering disabled for "+div_name+" position. Rendering the ad!");
                this.renderAd(div_name);
            }
        }
    }
}

Adhese.prototype.observeRequests = function(ads){
	this.addObserver("request", this.lazyRequestAds)
    for(div_name in this.ads){
		if(this.ads[div_name].options.lazyRequest){
			this.helper.log("enabled an obverser for: " + div_name + " Requesting ad when div becomes visible.");
			var destination = document.getElementById(div_name);
			this.observers.request.observe(destination);
		}
    }
}