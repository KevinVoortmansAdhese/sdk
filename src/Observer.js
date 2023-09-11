Adhese.prototype.addObserver = function (type, callback){
    this.helper.log("************************************ ADDING "+type.toUpperCase()+" OBSERVER *******************************************************");
    let options = {
        root: null, // relative to document viewport 
        rootMargin: '200px', // margin around root. Values are similar to css property. Unitless values not allowed 
        threshold: 1.0 // visible amount of item shown in relation to root 
    }
    if (typeof this.config.lazyLoading === 'object' && this.config.lazyLoading.settings !== null) {
            options.root = this.config.lazyLoading.settings.parent !== undefined ? this.config.lazyLoading.settings.parent : options.root, // relative to document viewport 
            options.rootMargin = this.config.lazyLoading.settings.rootMargin !== undefined ? this.config.lazyLoading.settings.rootMargin : options.rootMargin, // margin around root. Values are similar to css property. Unitless values not allowed 
            options.threshold = this.config.lazyLoading.settings.threshold !== undefined ? this.config.lazyLoading.settings.threshold : options.threshold // visible amount of item shown in relation to root 
    }
    this.observers[type] = new IntersectionObserver(callback.bind(this), options)
}

Adhese.prototype.observeAds = function(ads){
    this.addObserver("ad", this.lazyRenderAds)
    for(div_name in ads){
        if(!ads[div_name].options.lazyRequest){
            if(!ads[div_name].options.disableLazyRender){
                this.helper.log("enabled an obverser for: " + div_name + " Rendering ad when div becomes visible.");
                var destination = document.getElementById(div_name);
                this.observers.ad.observe(destination);
            }else{
                this.helper.log("Lazy Rendering disabled for "+div_name+" position. Rendering the ad!");
                this.renderAd(ads[div_name]);
            }
        }
    }
}

Adhese.prototype.observeRequests = function(ads){
	this.addObserver("request", this.lazyRequestAds)
    for(div_name in ads){
        this.helper.log("enabled an obverser for: " + div_name + " Requesting ad when div becomes visible.");
        var destination = document.getElementById(div_name);
        this.observers.request.observe(destination);
    }
}