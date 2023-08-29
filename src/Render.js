Adhese.prototype.lazyRenderAds = function(changes, observer){
    changes.forEach(element => {
        if(!element.target.dataset.loaded && element.intersectionRatio === 1){
            this.helper.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++", element.target.id + " Became visible! Rendering Ad in position.");
            this.renderAd(this.ads.initRequest[element.target.id]);
        }
    });
}

Adhese.prototype.renderAds = function(ads){
    this.helper.log("----------------------------------- Rendering Ads Without lazy loading -------------------------------------------------");
    for(let adPosition in ads){
        this.renderAd(ads[adPosition]);
        this.helper.log("Rendered Position: " + adPosition)
    }
}

Adhese.prototype.renderAd = function(ad){
    element = document.getElementById(ad.containingElementId);
    if (this.config.safeframe === true)
        this.safeframe.render(ad.containingElementId);
    else
        this.friendlyIframeRender(ad.ToRenderAd , ad.containingElementId)
    
    this.helper.log("Firing Impression pixel for: "+ad.containingElementId);
    this.helper.addTrackingPixel(ad.ToRenderAd.impressionCounter)

    if (this.viewability && ad.ToRenderAd.viewableImpressionCounter && ad.ToRenderAd.viewableImpressionCounter !== '') {
        this.viewability.trackers[ad.containingElementId] = ad.ToRenderAd.viewableImpressionCounter;
        this.viewability.adObserver.observe(document.getElementById(ad.containingElementId));
    }
    document.getElementById(ad.containingElementId).dataset.loaded = true;
    this.AdheseInfo(ad.ToRenderAd, document.getElementById(ad.containingElementId).parentNode);
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

