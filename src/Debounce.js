Adhese.prototype.Debounce = function (fn, delay, context) {
	delay = delay || 250
	context = context || this
  
	var timer = false
  
	return function () {
	  var args = arguments
  	  clearTimeout(timer)
  	  timer = setTimeout(function () {
		fn.apply(context, args)
	  }, delay)
	}
 };	