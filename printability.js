/**
 * This is yet another jQuery plugin
 */
(function ($) {
	'use strict';

	//Settings defaults
	var _defaults = {
		frequency : 100 //frequency to check the selection change event
	};

	//CONSTANTS
	var TOOL_BAR_CLASS = 'jq-printabilityToolBar',
		PRINTABLE_APPLY_BUTTON_CLASS = 'jq-printabilityApplyBtn',
		PRINTABLE_AREA_CLASS = 'jq-printabilityArea',
		PRINTABLE_ELEMENT_CLASS = 'jq-printableElement',
		PRINTABLE_BUTTON_CLASS = 'jq-printabilityPrintBtn',
		BODY_PRINTABLE_CLASS = 'jq-printability-active',
		PRINTABLE_ELEMENT_ID_DATA_ATTR = 'data-printableID';

	//Globals
	var toolBarInitialyzed = false,
		toolBar,
		makePrintableButton,
		printingModeActive = false;

	//Selection wrapper
	function Selection(DOMSelection) {
		this.anchorNode = DOMSelection.anchorNode;
		this.anchorOffset = DOMSelection.anchorOffset;

		this.focusNode = DOMSelection.focusNode;
		this.focusOffset = DOMSelection.focusOffset;
		
		this.isCollapsed = DOMSelection.isCollapsed;
		
		this._DOMSelection = DOMSelection;		
	}
	
	makeProtoMethod(Selection, 'isCollapsed', '_DOMSelection');
	makeProtoMethod(Selection, 'removeAllRanges', '_DOMSelection');
	makeProtoMethod(Selection, 'addRange', '_DOMSelection');
	
	function makeProtoMethod(constructorFunction, methodName, innerObjectName){
		constructorFunction.prototype[methodName] = function(){ return this[innerObjectName][methodName].apply(this[innerObjectName], arguments); };
	}

	Selection.prototype.equals = function (other) {
		return this.anchorNode === other.anchorNode &&
		this.anchorOffset === other.anchorOffset &&
		this.focusNode === other.focusNode &&
		this.focusOffset === other.focusOffset;
	};
	
	$.fn.printability = function jq_fn_printability(settings) {
		var $this = $(this);

		if ($this.length !== 1) {
			return;
		}
		
		var draggableManager = {};
		$this.draggability({}, draggableManager);

		settings = $.extend({}, _defaults, settings);

		var timerId,
		exSelection;

		//ensure or create the toolbar
		if (!toolBarInitialyzed) {
			var usingExistingToolBar = false;
			toolBar = $('body>.' + TOOL_BAR_CLASS);
			if (toolBar.length === 0) {
				toolBar = $('<div></div>').addClass(TOOL_BAR_CLASS).hide();
			} else {
				usingExistingToolBar = true;
			}

			makePrintableButton = toolBar.find('.' + PRINTABLE_APPLY_BUTTON_CLASS);
			if (makePrintableButton.length === 0) {
				makePrintableButton = $('<a></a>').addClass(PRINTABLE_APPLY_BUTTON_CLASS).attr('href', '#');
				toolBar.append(makePrintableButton);
			}
			
			if (!usingExistingToolBar) {
				$('body').append(toolBar);
			}

			toolBarInitialyzed = true;
		}

		var checkIfSelectionChanged = function () {
			if(printingModeActive)
				return;
		
			var currentSelection = new Selection(window.getSelection());

			if (!exSelection.equals(currentSelection)) {
				exSelection = currentSelection;

				if (($this[0] === currentSelection.anchorNode || $.contains($this[0], currentSelection.anchorNode)) && //checking if current selection is within plugin-applied element
					($this[0] === currentSelection.focusNode || $.contains($this[0], currentSelection.focusNode)) &&
					!currentSelection.isCollapsed) {
					activateToolBar();
				} else {
					deactivateToolBar();
				}
			}

			if (currentSelection.isCollapsed) {
				deactivateToolBar();
			}

			timerId = setTimeout(checkIfSelectionChanged, settings.frequency);
		};

		function deactivateToolBar() {
			toolBar.hide();
		}

		function activateToolBar() {
			toolBar.show();
		}

		makePrintableButton.on('click', function () {
			var selection = new Selection(window.getSelection())
				console.log('Making printable...', selection);

			/* DEFINING THE BORDERS OF THE SELECTION*/
			//inserting the borders of the printable area
			var guid = GUID();

			var bb = $('<b></b>').text('[').addClass(PRINTABLE_ELEMENT_CLASS).attr(PRINTABLE_ELEMENT_ID_DATA_ATTR, guid),
				be = $('<b></b>').text(']').addClass(PRINTABLE_ELEMENT_CLASS).css('color', 'red').attr(PRINTABLE_ELEMENT_ID_DATA_ATTR, guid),
				a = $('<b></b>').attr(PRINTABLE_ELEMENT_ID_DATA_ATTR, guid).addClass(PRINTABLE_BUTTON_CLASS).addClass(PRINTABLE_ELEMENT_CLASS),
				isSingleElementSelection = false,
				elementsOrder = 0;

			if(window.navigator.appName!=="Microsoft Internet Explorer")//IE has built-in tools for moving inline-block elements.
				draggableManager.addDraggable(bb).addDraggable(be).addDraggable(a);
				
			bb = a.add(bb); //adding starting brackets to the print button

			//detecting if its single-element selection
			isSingleElementSelection = selection.anchorNode === selection.focusNode;

			//detect if the selection is straightforward
			elementsOrder = compareNodeOrder(selection.anchorNode, selection.focusNode);

			//refine the selection if it was created in backward order
			//TODO: check if some of the nodes is a parent to another, then the logic of setting the brackets changes
			if (elementsOrder > 0 || (elementsOrder === 0 && selection.anchorOffset > selection.focusOffset)) {
				var range = document.createRange();
				range.setStart(selection.focusNode, selection.focusOffset);
				range.setEnd(selection.anchorNode, selection.anchorOffset);
				selection.removeAllRanges();
				selection.addRange(range);
				selection = new Selection(selection._DOMSelection);
			}

			if (!isSingleElementSelection) {
				insertElement(selection.anchorNode, selection.anchorOffset, bb, true);
				insertElement(selection.focusNode, selection.focusOffset, be);
			} else {
				var replacementArray = insertElement(selection.anchorNode, selection.anchorOffset, bb, true);
				insertElement(replacementArray[2], selection.focusOffset - selection.anchorOffset, be);
			}

			selection.removeAllRanges();
		});

		$this.on('click', function (e) {
			var $target = $(e.target),
			printableID, anchorNode, focusNode, brackets, relatedElems;
			if($target.hasClass(PRINTABLE_BUTTON_CLASS)){
			
				
			
				console.log('trying to select the range');
				
				printableID = $target.attr(PRINTABLE_ELEMENT_ID_DATA_ATTR);
				relatedElems = $this.find('.' + PRINTABLE_ELEMENT_CLASS+'[' + PRINTABLE_ELEMENT_ID_DATA_ATTR +'='+ printableID +']');
				brackets = relatedElems.not('.' + PRINTABLE_BUTTON_CLASS); //getting needed brackets by printable-id attribute
				if(brackets.length!==2){//clean elements, if the brackets aren't closed
					relatedElems.remove();
					return;
				}
				
				if(!confirm('Перейти к печати?'))
					return false;
				
				var range = document.createRange();
				
				anchorNode = brackets[0].childNodes[0];//TODO: refactor these indexes
				focusNode = brackets[1].childNodes[0];
				range.setStart(anchorNode, 1);
				range.setEnd(focusNode, 0);

				var selection = window.getSelection(); //TODO: warning: make a version for ie compatibility

				selection.removeAllRanges();
				selection.addRange(range);

				var selectedContence = range.extractContents();
				selection.removeAllRanges();
				$(range.commonAncestorContainer).empty().append(selectedContence).addClass(PRINTABLE_AREA_CLASS);
				$('body').addClass(BODY_PRINTABLE_CLASS);
				printingModeActive = true;
				$('body').height($(range.commonAncestorContainer).outerHeight());
			}
		});
		
		exSelection = new Selection(window.getSelection());
		timerId = setTimeout(checkIfSelectionChanged, settings.frequency);

	};

})(jQuery);


