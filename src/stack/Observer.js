
Adhese.prototype.observeStackAds = function(ads){
    this.addObserver("ad", this.lazyRenderStackAds)
    for(div_name in ads){
        if(!ads[div_name].options.lazyRequest){
            if(!ads[div_name].options.disableLazyRender){
                this.helper.log("enabled an obverser for: " + div_name + " Rendering ad when div becomes visible.");
                var destination = document.getElementById(div_name);
                this.observers.ad.observe(destination);
            }else{
                this.helper.log("Lazy Rendering disabled for "+div_name+" position. Rendering the ad!");
                this.renderStackAd(ads[div_name]);
            }
        }
    }

}