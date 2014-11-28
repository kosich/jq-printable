
(function init_jq_draggability(){
	'use strict';
	var currentlyDraggingElement;
	
	function onDragStart(e) {
		if (!e.target.id)
			e.target.id = 'draggable_' + GUID();
		e.originalEvent.dataTransfer.setData('text/html', e.target.outerHTML);
		console.log('started dragging');
		currentlyDraggingElement = e.target;
	}
	
	function onDragEnd(e) {
		console.log('stopped dragging!');
		if(e.target === currentlyDraggingElement)
			currentlyDraggingElement = null;
	}	
	
	$.fn.draggability = function(settings, outManager){
	
		outManager = outManager || {};
		var self = this, draggables = outManager.draggables = $();
		
		/**
		* adds draggable element to the draggable area
		*/
		var addDraggable = outManager.addDraggable = function(element){
			if(!element)
				return this;
				
			console.log('extending draggables ', draggables, ' with ', element);
			draggables = draggables.add($(element));
			bindDraggables();
			return this;
		};
		
		/**
		* rebinds draggable function;
		*/
		function bindDraggables() {
			console.log('binding draggables', draggables.length);
			draggables.attr('draggable',true).attr("contenteditable", false).off('dragstart').on('dragstart', onDragStart).off('dragend').on('dragend', onDragEnd);
		};

		addDraggable(settings.draggables);
		
		this.on('dragover', function (e) {
			if(currentlyDraggingElement && $(currentlyDraggingElement).length){
				e.preventDefault();
				return false;
			}
		}).on('drop', function(e) {
			//dropping our element
			if(currentlyDraggingElement && $(currentlyDraggingElement).length){
				var e = e.originalEvent;
				var content = e.dataTransfer.getData('text/html');
				var range = null;
				if (document.caretRangeFromPoint) { // Chrome
					range = document.caretRangeFromPoint(e.clientX, e.clientY);
				} else if (e.rangeParent) { // Firefox
					range = document.createRange();
					range.setStart(e.rangeParent, e.rangeOffset);
				}
				
				//range.collapse(true);
				
				console.log('range', range);
				console.log('drag objecto ', content);
				
				var sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
				
				self.get(0).focus(); // essential			
				
				var removed_element_id = $(currentlyDraggingElement).attr('id');
				$(currentlyDraggingElement).remove();
				console.log('REMOVED ', currentlyDraggingElement);
				draggables = draggables.not($(currentlyDraggingElement));
				//document.execCommand('insertHTML',false, content);
				//document.execCommand('insertHTML', false, '<p>s</p>');
				insertElement(range.startContainer, range.startOffset, $(content));
				addDraggable($('#' + removed_element_id));
				
				sel.removeAllRanges();
				bindDraggables();
				
				e.preventDefault();
				return false;
			} else {
				//throw 'cannot insert in here';
			}			
		});
		return this;
	};
})();