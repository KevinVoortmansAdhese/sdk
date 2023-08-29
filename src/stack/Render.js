
Adhese.prototype.lazyRenderStackAds = function(changes, observer){
    changes.forEach(element => {
        if(!element.target.dataset.loaded && element.intersectionRatio === 1){
            this.helper.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++", element.target.id + " Became visible! Rendering Stack Ad in position.");
            this.renderStackAd(this.stackAds.initRequest[element.target.id]);
        }
    });
}

Adhese.prototype.renderStackAds = function(ads){
    this.helper.log("----------------------------------- Rendering Ads Without lazy loading -------------------------------------------------");
    for(let adPosition in ads){
        this.renderStackAd(ads[adPosition]);
        this.helper.log("Rendered Position: " + adPosition)
    }
}

Adhese.prototype.renderStackAd = function(ad){
    this.helper.log("Rendering Stack Ads's", ad.ToRenderAds);
}