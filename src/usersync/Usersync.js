Adhese.prototype.usersync = function(){
    if (typeof this.config.consentString !== "undefined"){
        this.helper.log("Consentstring found! , placing usersync iframe!")
        url= "https://user-sync.adhese.com/iframe/user_sync.html?"
        url += "account="+this.config.account 
        url += "&gdpr=1&consentString="+this.config.consentString;
        iframe = document.createElement("iframe");
        iframe.src = url;
        document.body.appendChild(iframe);
    }else{
        this.helper.log("Can't find a consentstring, not usersyncing!")
    }

}