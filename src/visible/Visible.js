/**
* This function is used for viewability measurement and makes use of the IntersectionObserver API. Default settings are based on IAB.
* @param  {object} target   Object to which we will add the observer. Can be the safeframe object or another one.
* @param  {object} settings Viewability settings such as duration and in view percentage. When set to true, default IAB settings will be used.
*/
Adhese.prototype.enableViewabilityTracking = function (target, settings) {

	target.viewability = {
		contentBox: document.querySelector("body"),
		trackers: {},
		trackerTimeout: 0
	}

	observerOptions = {
		root: null,
		rootMargin: "0px",
		threshold: []
	};

	if (typeof settings === 'object' && settings !== null) {
		settings.inViewPercentage ? observerOptions.threshold.push(settings.inViewPercentage) : observerOptions.threshold.push(0.5);
		if (settings.rootMargin) {
			observerOptions.rootMargin = settings.rootMargin;
		}		
		target.viewability.trackerTimeout = settings.duration && settings.duration !== '' ? settings.duration : 1;
		target.viewability.inViewPercentage = observerOptions.threshold[observerOptions.threshold.length-1];
	} else {
		observerOptions.threshold.push(0.5);
		target.viewability.trackerTimeout = 1;
		target.viewability.inViewPercentage = observerOptions.threshold[observerOptions.threshold.length-1];
	}

	target.viewability.intersectionCallback = function (entries) {
		entries.forEach(function (entry) {
			var adBox = entry.target;
			if (entry.isIntersecting) {
				if (entry.intersectionRatio >= target.viewability.inViewPercentage && target.viewability.trackerTimeout > 0) {
					adBox.timerRunning = true;
					adBox.timer = window.setTimeout(function () {
						target.viewability.adObserver.unobserve(adBox);
						if (target.viewability.trackers[adBox.id]) {
                            target.helper.log("Firing Viewabilty Tracking pixel for: "+adBox.id);
							target.helper.addTrackingPixel(target.viewability.trackers[adBox.id]);
						}						
					}, target.viewability.trackerTimeout * 1000);
				} else if (entry.intersectionRatio >= target.viewability.inViewPercentage) {
					target.viewability.adObserver.unobserve(adBox);
					if (target.viewability.trackers[adBox.id]) {
                        target.helper.log("Firing Viewabilty Tracking pixel for: "+adBox.id);
						target.helper.addTrackingPixel(target.viewability.trackers[adBox.id]);
					}
				} 
			} else if (adBox.timerRunning) {
					window.clearTimeout(adBox.timer);
					adBox.timerRunning = false;
			}
		});
	}
	target.viewability.adObserver = new IntersectionObserver(target.viewability.intersectionCallback, observerOptions);
};
