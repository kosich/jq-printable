/**
 *	Inserts a dom element into a text node
 *	@param {Node} node  Dom text node element
 *	@param {Number} offset  offset where to insert the node
 *	@param {Node} content the element to insert
 *	@return {Array} returns an array with three elements: starting text-node, inserted node and ending text-node
 */
function insertInTextNode(node, offset, content) {
	//TODO: change to DOM constants
	if (node.nodeType !== document.TEXT_NODE) {
		throw 'Expecting a text node as a first parameter';
	}

	var text = node.data,
	firstPart = document.createTextNode(text.substring(0, offset)),
	latterPart = document.createTextNode(text.substring(offset));

	var replacementArray = [firstPart, content, latterPart];
	$(node).replaceWith(replacementArray);
	return replacementArray;
}

function insertElement(node, offset, content, shouldInsertBefore) {
	if (node.nodeType === document.TEXT_NODE) {
		return insertInTextNode(node, offset, content);
	} else {
		debugger;
		$(node)[shouldInsertBefore ? 'append' : 'prepend'](content);
		return [, , shouldInsertBefore ? node : content];//TODO: refactor this shit
	}
}

/**
 * @param {Node} node1 The first node to compare
 * @param {Node} node2 The second node to compare
 * @return {Number} 0 if the nodes are the same node, a negative number if node1 is before node2, and a positive number if node2 is before node1.
 */
function compareNodeOrder(node1, node2) {
	/*
	 * https://code.google.com/p/doctype-mirror/wiki/ArticleNodeCompareDocumentOrder
	 */
	// Fall out quickly for equality.
	if (node1 === node2) {
		return 0;
	}

	// Use compareDocumentPosition where available
	if (node1.compareDocumentPosition) {
		// 4 is the bitmask for FOLLOWS.
		return node1.compareDocumentPosition(node2) & 2 ? 1 : -1;
	}

	throw 'couldn\'t compare the nodes due to old browser';
}

function GUID() {
	return GUID.PATTERN.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0,
		v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}
GUID.PATTERN = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
