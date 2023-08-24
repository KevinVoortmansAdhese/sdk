Adhese.prototype.lazyRenderAds = function(changes, observer){
    changes.forEach(element => {
        if(!element.target.dataset.loaded && element.intersectionRatio === 1){
            this.helper.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++", element.target.id + " Became visible! Rendering Ad in position.");
            this.renderAd(element.target.id);
        }
    });
}

Adhese.prototype.renderAds = function(){
    this.helper.log("----------------------------------- Rendering Ads Without lazy loading -------------------------------------------------");
    for(let adPosition in this.ads){
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
    for(let key in this.previewAds){
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

