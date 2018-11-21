(function() {

if (typeof self === 'undefined' || !self.Prism || !self.document) {
	return;
}

Prism.hooks.add('complete', function (env) {
	if (!env.code) {
		return;
	}

	// Works only for <code> wrapped inside <pre> (not inline).
	var pre = env.element.parentNode;
	var clsReg = /\s*\binteractive-ruby\b\s*/;
	if (
		!pre || !/pre/i.test(pre.nodeName) ||
			// Abort only if neither the <pre> nor the <code> have the class
		(!clsReg.test(pre.className) && !clsReg.test(env.element.className))
	) {
		return;
	}

	if (env.element.querySelector('.interactive-ruby-prompt')) {
		// Abort if prompt already exists.
		return;
	}

	if (clsReg.test(env.element.className)) {
		// Remove the class "interactive-ruby" from the <code>
		env.element.className = env.element.className.replace(clsReg, '');
	}
	if (!clsReg.test(pre.className)) {
		// Add the class "interactive-ruby" to the <pre>
		pre.className += ' interactive-ruby';
	}

	var getAttribute = function(key, defaultValue) {
		return (pre.getAttribute(key) || defaultValue).replace(/"/g, '&quot');
	};

	// Store the line numbers of outputs. -- cwells
	var totalLines = env.code.split('\n').length;
	console.log(env.code.split('\n'));
	var outputLineNums = new Array();
	var outputSections = pre.getAttribute('data-output') || '';
	outputSections = outputSections.split(',');
	for (var i = 0; i < outputSections.length; i++) {
		var outputRange = outputSections[i].split('-');
		var outputStart = parseInt(outputRange[0]);
		var outputEnd = outputStart; // Default: end at the first line when it's not an actual range. -- cwells
		if (outputRange.length === 2) {
			outputEnd = parseInt(outputRange[1]);
		}

		if (!isNaN(outputStart) && !isNaN(outputEnd)) {
			for (var j = outputStart; j <= outputEnd && j <= totalLines; j++) {
				outputLineNums.push(j);
			}
		}
	}

	// Examples:
	// getPaddedNumber(1, 3)
	// => "001"
	// getPaddedNumber(25, 5)
	// => "00025"
	var getPaddedNumber = function(num, charCount) {
		if (typeof charCount == 'undefined') {
			charCount = 3;
		}

		var paddedNum = num.toString();
		while (paddedNum.length < charCount) {
			paddedNum = '0' + paddedNum;
		}
		return paddedNum;
	};

	// Create the "rows" that will become the interactive-ruby prompts. -- cwells
	var lines = '';
	var inputLineNum = 1;
	for (var i = 0; i < totalLines; i++) {
		var curLineNum = i + 1;
		if (outputLineNums.indexOf(curLineNum) === -1) {
			var promptText = 'irb(main):' + getPaddedNumber(inputLineNum) + ':0>';
			lines += '<span data-prompt="' + promptText + '"></span>';
			inputLineNum++;
		} else {
			lines += '<span></span>';
		}
	}

	// Create the wrapper element. -- cwells
	var prompt = document.createElement('span');
	prompt.className = 'interactive-ruby-prompt';
	prompt.innerHTML = lines;

	env.element.innerHTML = prompt.outerHTML + env.element.innerHTML;
});

}());
