var app = angular.module("sdkApp");

app.factory("dataService", function($rootScope) {
	var generateUuid = function() {
    	return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
	};
	var findPositionArray = function(array, name) {
		for (var i = 0; i < array.length; i++) {
			var content = array[i];
			if (content.name === name) {
				return content.array;
			} else if (content.array) {
				var result = findPositionArray(content.array, name);
				if (result) {
					return result;
				}
			}
		}
	};
	var findParentId = function(array, name) {
		for (var i = 0; i < array.length; i++) {
			var content = array[i];
			if (content.name === name) {
				return "FIND";
			} else if (content.array) {
				var result = findParentId(content.array, name);
				if (result) {
					if (result === "FIND") {
						result = content.name;
					}
					return result;
				}
			}
		}
	};
	var findBlockPosition = function(array, name) {
		for (var i = 0; i < array.length; i++) {
			var content = array[i];
			if (content.name === name) {
				return i;
			} else if (content.array) {
				var result = findBlockPosition(content.array, name);
				if (result >= 0) {
					return result;
				}
			}
		}
	};
	var getBlockHierarchy = function(array, name) {
		for (var i = 0; i < array.length; i++) {
			var content = array[i];
			if (content.name === name) {
				return 0;
			} else if (content.array) {
				var result = getBlockHierarchy(content.array, name);
				if (result >= 0) {
					return result + 1;
				}
			}
		}
	};
		var deleteBlockModule = function(arrray) {
			arrray.forEach(function(value) {
				delete blockMap[value.name];
				if (value.array) {
					blockMap(value.array);
				}
			});
		};
		var createModule = function(compile, scope, target, position, type, parentId, block) {
            var elemetId = generateUuid() + generateUuid() + generateUuid();
			var	newElement = compile("<div block-module element-id='" + elemetId + "' view-type='" + type + "'></div>")(scope);
            // record position
            var targetArray = findPositionArray(blockPositionTree, parentId);
			if (position < 0) {
                target.append(newElement);
                targetArray.push({
	                name: elemetId,
	                array: []
                });
            } else {
            	newElement.insertBefore(target);
            	targetArray.splice(position, 0, {
	                name: elemetId,
	                array: []
            	});
            }

            if (!block) {
            	block = {};
				block.type = type;
				if (type === "block" || type === "component") {
					block.width = -1;
					block.height = -2;
				} else if (type === "button") {
					block.width = -2;
					block.height = -2;
					block.text = type;
					block.size = 24;
					block.image = "local:normal;local:hover;local:disable";
				} else if (type === "label") {
					block.width = -2;
					block.height = -2;
					block.text = type;
					block.textalign = "left";
					block.size = 18;
				} else if (type === "img") {
					block.width = -2;
					block.height = -2;
				} else if (type === "line") {
					block.width = -1;
					block.height = -2;
				} else if (type === "link") {

				}
            }

            // record ontent
            blockMap[elemetId] = block;

            return elemetId;
		};
    var createView = function(compile, scope, target, append, elementId) {
	   	var block = blockMap[elementId];
		if (block.content === 'bottomView') {
			target = bottomBar;
		}
		var directive = 'item-view';
	    if (block.type === 'expandableSelector') {
	    	directive = 'expandable-selector';
	    } 
		var element = compile("<div " + directive + " element-id='" + elementId + "'></div>")(scope);
		if (append) {
            target.append(element);
        } else {
            element.insertBefore(target);
        }
   	};
		var collectActions = function(actionList, script) {
			if (script instanceof Array) {
				for (var index in script) {
					collectActions(actionList, script[index]);
				}
			} else if (typeof script === 'object') {
				for (var key in script) {
					var content = script[key];

					if (typeof content === 'object') {
						if (key === 'action') {
							actionList.push(content);
						}

						collectActions(actionList, content);
					} else if (content instanceof Array) {
						collectActions(actionList, content);
					}
				}

				if ('action' in script) {
					var actionName = script.action.name;
					delete script.action;
					script.action = actionName;
				}
			}
		};
		var assenbleAction = function(action, script) {
			if (script instanceof Array) {
				for (var index in script) {
					var result = assenbleAction(action, script[index]);
					if (result) {
						return result;
					}
				}
			} else if (typeof script === 'object') {
				for (var key in script) {
					var content = script[key];

					if (key === 'action') {
						var ss = 'sss';
					}

					if (typeof content === 'object' || content instanceof Array) {
						var result = assenbleAction(action, content);
						if (result) {
							return result;
						}
					} else if (key === 'action' && content === action.name) {
						script[key] = action;
						return true;
					}
				}
			}
		};

	var hierarchyColor = ['#428bca', '#5cb85c', '#5bc0de', '#f0ad4e', '#d9534f',
							'#428bca', '#5cb85c', '#5bc0de', '#f0ad4e', '#d9534f'];
	var defProtocol = {
		root: {
			digest: 'text',
			fn: 'text',
			sessionId: 'text',
			success: ['true', 'false'],
			tid: 'text',
			tv: 'text',
			cmd: 'object'
		},
		cmd: {
			cancel: 'text',
			load: 'text',
			ner: 'text',
			netTryCount: 'num',
			ok: 'text',
			retry: 'text',
			ser: 'text',
			up2g: ['T', 'F'],
			upLog: ['T', 'F'],
			wCookie: ['T', 'F']
		},
		form: {
			actionBar: 'object',
			onback: 'object',
			wapintercept: 'object',
			scroll: ['true', 'false'],
			syncScrollState: 'text',
			type: ['fullscreen', 'popupwin']
		},
		blocks: {
			type: ["block", "component", "button", "label", "img", "icon", "link", "line", "expandableSelector"],
			block: ['width','height', 'align', 'vertical-align', 'margin', 'padding',
						'image', 'filter', 'css', 'display'],
			component: ['width','height', 'align', 'vertical-align', 'margin', 'padding',
						'image', 'filter', 'css', 'display'],
			button: ['width','height', 'align', 'vertical-align', 'margin', 'padding', 'color', 'size',
						'image', 'text', 'filter', 'css', 'display'],
			label: ['width','height', 'align', 'vertical-align', 'margin', 'padding', 'color', 'size',
						'image', 'text', 'text-align', 'filter', 'html', 'underline', 'css', 'display'],
			img: ['width','height', 'align', 'vertical-align', 'margin', 'padding', 'color',
						'image', 'css', 'display'],
			icon: ['width','height', 'align', 'vertical-align', 'margin', 'padding', 'color',
						'image', 'css', 'display'],
			link: ['width','height', 'align', 'vertical-align', 'margin', 'padding', 'color', 'size',
						'image', 'text', 'text-align', 'filter', 'html', 'underline', 'css', 'display'],
			line: ['width','height', 'align', 'vertical-align', 'margin', 'padding', 'color', 'size',
						'image', 'text', 'text-align', 'filter', 'html', 'underline', 'css', 'display'],
			expandableSelector: ['width','height', 'align', 'vertical-align', 'margin', 'padding', 'color', 'size',
						'image', 'text', 'text-align', 'filter', 'html', 'underline', 'css', 'display'],
		},
		actionBar: {
			title: 'text'
		},
		onback: {
			allowBack: ['true', 'false'],
			backDialog: 'text',
			disableBack: ['true', 'false'],
			name: 'text'
		},
		wapintercept: {
			value: 'list'
		},
		wapinterceptvalue: {
			name: ['pc', 'mobile'],
			exitOnBack: 'text',
			whitelist: 'array'
		}
	};
	var moduleProtocol = {
		width: 'text',
		height: 'text',
		align: ['left', 'center', 'right'],
		verticalAlign: ['top', 'middle', 'bottom'],
		margin: 'text',
		padding: 'text',
		color: 'color',
		size: 'text',
		image: 'color',
		text: 'text',
		textAlign: ['left', 'center', 'right'],
		filter: 'text',
		html: 'text',
		underline: ['true', 'false'],
		css: 'text',
		display: ['true', 'false']
	};

	var actionList = [];
	var mainForm = {
		form: {},
		blocks: [],
		name: 'main-form'
	};
	var selectedForm;
	var selectedFormIndex;
	var scriptRoot = {};

	var blockMap = {};
	var blockPositionTree = [{
		name: 'root',
		array: []
	}];

	var itemSelection = {
		value: ''
	};
	var bottomBar;

	return {
		assembleScript: function() {
			var script = {};
			jQuery.extend(script, scriptRoot);
			script.form = {};
			jQuery.extend(script.form, mainForm.form);
			script.form.blocks = [];
			for (var index in mainForm.blocks) {
				script.form.blocks[index] = {};
				jQuery.extend(script.form.blocks[index], mainForm.blocks[index]);
			}

			for (var index in actionList) {
				assenbleAction(actionList[index], script.form.blocks);
			}
			return script;
		},
		selectForm: function(index) {
			if (selectedFormIndex == index) {
				return;
			}

			selectedFormIndex = index;
			selectedForm = index < 0 ? mainForm : actionList[index];
			blockMap = {};
			blockPositionTree = [{
				name: 'root',
				array: []
			}];
			$rootScope.$broadcast('sdk:panelSelectionChange');
		},
		getSelectedForm: function() {
			return selectedForm;
		},
		getScriptRoot: function() {
			return scriptRoot;
		},
		loadScript: function(newScript) {
			selectedFormIndex = -2;

			var mainBlocks = newScript.form.blocks;
			delete newScript.form.blocks;
			mainForm = {
				form: newScript.form,
				blocks: mainBlocks,
				name: 'main-form'
			};
			actionList.length = 0;
			collectActions(actionList, mainBlocks);
			for (var index in actionList) {
				var action = actionList[index];
				if (action.form && action.form.blocks) {
					action.blocks = action.form.blocks;
					delete action.form.blocks;
				}
			}

			delete newScript.form;
			scriptRoot = newScript;
			$rootScope.$broadcast('sdk:newScriptLoaded');
		},
		getActionList: function() {
			return actionList;
		},
		getProtocol: function(sector) {
			return defProtocol[sector];
		},
		getModuleProtocol: function() {
			return moduleProtocol;
		},
		getPropertyDefaultValue: function(name) {
                    if (name === 'align' || name === 'text-align') {
                        return 'left';
                    } else if (name === 'width') {
                        return -1;
                    } else if (name === 'height') {
                        return -2;
                    } else if (name === 'vertical-align') {
                        return 'top';
                    } else {
                    	return '';
                    }
		},
		moduleDataToView: function(view, module) {
				var processedItem = [];
				var widthHeight = this.processWidthHeight(module.width, module.height);
				view.size = module.size * 2 / 3;
				view.width = widthHeight[0];
				view.height = widthHeight[1];
				view.horWidth = view.width;
				processedItem.push('width');
				processedItem.push('height');
				processedItem.push('size');

				var text = this.processText(module.text);
				if (text) {
					view.text = text;
				}
				processedItem.push('text');

				var hvAlign = this.processAlign(module.align, module['vertical-align'], module['text-align']);
				view.align = hvAlign[0];
				view.verticalAlign = hvAlign[1];
				if (view.align === 'center' || view.align === 'flex-end') {
					view.horWidth = '100%';
				}
				processedItem.push('verticalAlign');
				processedItem.push('textAlign');
				processedItem.push('align');
				
				if (module.html === 'true' && module.text) {
					element.html(module.text);
				}
				processedItem.push('html');

				view.image = module.image;
				view.color = module.color;

				processedItem.push('image');
				processedItem.push('color');

				var padding = this.processPadding(module.padding);
	            view.paddingTop = padding[0];
	            view.paddingLeft = padding[1];
	            view.paddingBottom = padding[2];
	            view.paddingRight = padding[3];
	            processedItem.push('padding');

				var margin = this.processPadding(module.margin);
	            view.marginTop = margin[0];
	            view.marginLeft = margin[1];
	            view.marginBottom = margin[2];
	            view.marginRight = margin[3];
	            processedItem.push('margin');

	            var filterMap = this.processFilter(module.filter);
	            if ('corner' in filterMap) {
	            	view.borderRadius = filterMap['corner'];
	            }
	            processedItem.push('filter');

	            for (var property in module) {
	            	if (!(property in processedItem)) {
	            		// view[property] = module[property];
	            	}
	            }
		},
		processFilter: function(filter) {
			var result = {};
				if (filter) {
	                var start = filter.indexOf('(');
	                var end = filter.indexOf(')')
	                if (start > 0 && end > start + 1) {
	                    var filterName = filter.slice(0, start);
	                    var filterValue = filter.slice(start + 1, end);
	                    if (filterName === 'corner') {
	                    	result[filterName] = filterValue + 'px';
	                    }
	                }
	            }
	        return result;
		},
		processAlign: function(align, verticlAlign, textalign) {
				var result = ['flex-start', 'flex-start'];
				if (align) {
					if (align == 'left') {
						result[0] = 'flex-start';
					} else if (align == 'center') {
						result[0] = 'center';
					} else if (align == 'right') {
						result[0] = 'flex-end';
					}
				}
				if (verticlAlign) {
					if (verticlAlign == 'top') {
						result[1] = 'flex-start';
					} else if (verticlAlign == 'middle') {
						result[1] = 'center';
					} else if (verticlAlign == 'bottom') {
						result[1] = 'flex-end';
					}
				}
				return result;
		},
		processText: function(text) {
				if (text) {
					var result = '';
					var start = text.indexOf('{{');
					var end = text.indexOf('}}');
					if (start >= 0 && end > start + 2) {
						var key = text.slice(start + 2, end);
						var value = this.getVariable(key);
						if (value) {
							return value;
						} else {
							return text;
						}
					} else {
						return text;
					}
				}
		},
		processWidthHeight: function(width, height) {
            	var result = [];
            	if (width) {
					if (width == -1) {
						result[0] = "100%";
					} else if (width == -2) {
						result[0] = '';
					} else {
						var presentIndex = width.indexOf('%');
						if (presentIndex < 0) {
							var pxIndex = width.indexOf('px');
							if (pxIndex > 0) {
								width = width.splice(0, pxIndex);
							}
							result[0] = width * 2 / 3 +'px';
						} else {
							result[0] = width;
						}
					}
            	} else {
            		result[0] = "100%";
            	}
            	if (height) {
					if (height == -1) {
						result[1] = "100%";
					} else if (height == -2) {
						result[1] = '';
					} else {
						var pxIndex = height.indexOf('px');
						if (pxIndex > 0) {
							height = height.substr(0, pxIndex);
						}
						result[1] = height * 2 / 3 + 'px';
					}
            	} else {
            		result[1] = '';
            	}
            	return result;
		},
		processPadding: function(padding) {
			var result = [];
            if (padding) {
	            var margins = padding.split(" ");
	            result.push((margins[0] ? margins[0].trim() *2/3 : 0) + 'px');
	            result.push((margins[1] ? margins[1].trim() *2/3 : 0) + 'px');
	            result.push((margins[2] ? margins[2].trim() *2/3 : 0) + 'px');
	            result.push((margins[3] ? margins[3].trim() *2/3 : 0) + 'px');
            } else {
	            result.push('0px');
	            result.push('0px');
	            result.push('0px');
	            result.push('0px');
            }
            return result;
		},
		resetSelection: function(tree) {
			if (itemSelection.value !== tree) {
				itemSelection.value = tree;
			} else {
				itemSelection.value = '';
			}
		},
		getItemSelection: function() {
			return itemSelection;
		},
		getModuleProperties: function() {
			return fullProperites;
		},
		getHierarchyColor: function(elementId) {
			var hierarchy = getBlockHierarchy(blockPositionTree, elementId);
			return hierarchyColor[hierarchy];
		},
		getVariable: function(key) {
			return variable.value[key];
		},
		setBottomBar: function(element) {
			bottomBar = element;
		},
		createModule: function(compile, scope, target, position, type, parentId, block) {
			return createModule(compile, scope, target, position, type, parentId, block)
		},
        recursiveProcessModule: function(compile, scope, container, parentId, values) {
        	var newTask = 0;
			values.forEach(function (value, index) {
				var type;
                if ('type' in value) {
                    type = value.type;
                } else if ('name' in value) {
                    type = value.name;
                }

                createModule(compile, scope, container, -1, type, parentId, value);
                newTask++;
            });
            return newTask;
        },
		getModuleBlock: function(elementId) {
			return blockMap[elementId];
		},
		getBlockParentId: function(elementId) {
			return findParentId(blockPositionTree, elementId);
		},
		getBlockPosition: function(elementId) {
			return findBlockPosition(blockPositionTree, elementId);
		},
		getBlockChilds: function(elementId) {
			return findPositionArray(blockPositionTree, elementId);
		},
		createView: function(compile, scope, target, append, elementId) {
			createView(compile, scope, target, append, elementId)
		},
    	recursiveProcessView: function(compile, scope, target, parentId) {
    		var values = findPositionArray(blockPositionTree, parentId);
    		if (!values) {
    			return;
    		}
    		
	    	values.forEach(function (value, index) {
	    		createView(compile, scope, target, true, value.name);
	    	});
    	},
		deleteBlockModule: function(elementId) {
			delete blockMap[elementId];
			var parentId = findParentId(blockPositionTree, elementId);
			var changeArray = findPositionArray(blockPositionTree, parentId);
			var deleteInedx = findBlockPosition(changeArray, elementId);
			var deleteItem = changeArray.splice(deleteInedx, 1);
			if (deleteItem.array) {
				deleteBlockModule(deleteItem.array);
			}
		}
	};
});