Adhese.prototype.observeAds = function(){
    this.helper.log("************************************ Setting up lazy loading *******************************************************");
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
    let adObserver = new IntersectionObserver(this.lazyRenderAds.bind(this), options)
    for(div_name in this.ads){
        this.helper.log("enabled an obverser for: " + div_name + " Rendering ad when div becomes visible.");
        var destination = document.getElementById(div_name);
        adObserver.observe(destination);
    }
    this.helper.log("-----------------------------------Waiting for adposition to come into view ... -------------------------------------------------");

}

Adhese.prototype.lazyRenderAds = function(changes, observer){
    changes.forEach(element => {
        if(!element.target.dataset.loaded && element.intersectionRatio === 1){
            this.helper.log(element.target.id + " Became visible! Rendering Ad in position.");
            this.renderAd(element.target.id);
        }
    });
}

Adhese.prototype.renderAds = function(){
    this.helper.log("----------------------------------- Rendering Ads Without lazy loading -------------------------------------------------");
    for(var adPosition in this.ads){
        this.renderAd(adPosition);
        this.helper.log("Rendered Position: " + adPosition)
    }
}

Adhese.prototype.renderAd = function(adPosition){
    element = document.getElementById(this.ads[adPosition].containingElementId);
    if (this.config.safeframe === true)
        this.safeframe.render(this.ads[adPosition].containingElementId);
    else
        this.friendlyIframeRender(this.ads[adPosition].ToRenderAd , this.ads[adPosition].containingElementId)
    
    this.helper.log("Firing Impression pixel for: "+adPosition);
    this.helper.addTrackingPixel(this.ads[adPosition].ToRenderAd.impressionCounter)

    if (this.viewability && this.ads[adPosition].ToRenderAd.viewableImpressionCounter && this.ads[adPosition].ToRenderAd.viewableImpressionCounter !== '') {
        this.viewability.trackers[adPosition] = this.ads[adPosition].ToRenderAd.viewableImpressionCounter;
        this.viewability.adObserver.observe(document.getElementById(adPosition));
    }
    document.getElementById(adPosition).dataset.loaded = true;
    this.AdheseInfo(this.ads[adPosition].ToRenderAd, document.getElementById(adPosition));
}

Adhese.prototype.renderPreviewAds = function(){
    for(key in this.previewAds){
        if (this.config.safeframe === true)
            this.safeframe.render(this.previewAds[key].containingElementId);
        else
            this.friendlyIframeRender(this.previewAds[key].ToRenderAd , this.previewAds[key].containingElementId)
    }
    this.showPreviewSign();
}


Adhese.prototype.AdheseInfo = function(ad, destination){
    let adhese_info = document.createElement("AdheseInfo");
    adhese_info.dataset.campaingid = ad.orderId;
    adhese_info.dataset.bookingid = ad.adspaceId;
    adhese_info.dataset.creativeid = ad.libId;
    destination.appendChild(adhese_info);
}

Adhese.prototype.friendlyIframeRender = function(ad, destination_ID) {
    destination = document.getElementById(destination_ID);
    let iframe = document.createElement("iframe");
    iframe.style.width = ad.width+"px";
    iframe.style.height = ad.height+"px";
    iframe.style.border = "none";
    iframe.style.margin = "0 auto";
    iframe.style.padding = "0px";
    iframe.style.display = "block";
    iframe.frameBorder = 0;
    iframe.seamless = true;
    iframe.scrolling = "no";
    destination.appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.writeln("<style>body{margin:0px;padding:0px;}</style>");
    iframe.contentDocument.writeln(ad.tag);
    iframe.contentDocument.close();
}

