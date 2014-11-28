var anchorParents = $.makeArray($(selection.anchorNode).parents());
var focusParents = $.makeArray($(selection.focusNode).parents());
var intersection = anchorParents.filter(function(n) {
	return focusParents.indexOf(n) != -1
});

/* GRABBING THE CONTENCE OF THE SELECTION */
if (intersection.length !== 0){
	console.log('intersection element: ', intersection[0]);
}				

			