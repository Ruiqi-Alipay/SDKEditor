var app = angular.module("sdkApp");

app.factory("dataService", function($rootScope, $timeout) {
	var dpiRatio = 2 / 3;
	var generateUuid = function() {
    	return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
	};
	var findPosition = function(array, name) {
		for (var i = 0; i < array.length; i++) {
			var content = array[i];
			if (content.name === name) {
				return content;
			} else if (content.array) {
				var result = findPosition(content.array, name);
				if (result) {
					return result;
				}
			}
		}
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
	var getBlockHierarchyLevel = function(array, name) {
		for (var i = 0; i < array.length; i++) {
			var content = array[i];
			if (content.name === name) {
				return 0;
			} else if (content.array) {
				var result = getBlockHierarchyLevel(content.array, name);
				if (result >= 0) {
					return result + 1;
				}
			}
		}
	};
	var getBlockHierarchy = function(array, name) {
		for (var i = 0; i < array.length; i++) {
			var content = array[i];
			if (content.name === name) {
				return [content.name];
			} else if (content.array) {
				var result = getBlockHierarchy(content.array, name);
				if (result) {
					result.push(content.name);
					return result;
				}
			}
		}
	};

		var deleteBlockModule = function(arrray) {
			arrray.forEach(function(value) {
				delete moduleMap[value.name];
				delete moduleStyleMap[value.name];
				if (value.array) {
					deleteBlockModule(value.array);
				}
			});
		};
		var createModule = function(compile, scope, target, position, type, parentId, module) {
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

            if (!module) {
            	module = {};
				module.type = type;
				if (type === "block" || type === "component") {
					module.width = -1;
					module.height = -2;
				} else if (type === "button") {
					module.width = -2;
					module.height = -2;
					module.text = 'Button';
					module.size = 34;
					module.image = "local:normal;local:hover;local:disable";
				} else if (type === "label" || type === 'link') {
					module.width = -2;
					module.height = -2;
					module.text = type;
					module.textAlign = "left";
					module.size = 34;
					if (type === 'link') {
						module.underline = 'true';
					}
				} else if (type === "img") {
					module.width = -2;
					module.height = -2;
					module.src = '';
				} else if (type === "line") {
					module.width = -1;
					module.height = 1;
					module.image = 'rgb(255, 0, 0)';
				}
            }

            // record
            moduleMap[elemetId] = module;

            return elemetId;
		};
    var createView = function(compile, scope, target, append, elementId) {
	   	var block = moduleMap[elementId];
		var directive = 'item-view';
	    if (block.type === 'expandableSelector') {
	    	directive = 'expandable-selector';
	    }  else if (block.type === 'combox') {
	    	directive = 'combox-selector';
	    }
		var element = compile("<div " + directive + " element-id='" + elementId + "'></div>")(scope);
		var module = moduleMap[elementId];
		if (module.content === 'bottomView') {
			target = bottomBar;
		}
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
							actionList.push({parameter: content});
						}

						collectActions(actionList, content);
					} else if (content instanceof Array) {
						collectActions(actionList, content);
					}
				}

				if ('action' in script && script['action'] instanceof Object) {
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
						if (ss != key) {
							var f = parseInt(1);
						}
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

		var assembleBlocks = function(resultArray, sourceArray) {
			sourceArray.forEach(function(value, index) {
				resultArray[index] = moduleMap[value.name];
				if (value.array) {
					resultArray[index].value = [];
					assembleBlocks(resultArray[index].value, value.array);
				}
			});
		};

		var saveCurrentForm = function() {
			if (selectedForm && blockPositionTree[0].array) {
				selectedForm.blocks = [];
				assembleBlocks(selectedForm.blocks, blockPositionTree[0].array);
			}
		};
	function parseBackground (imageCode) {
		if (imageCode === 'local:middle_line') {
			return '#C0C0C0';
		} else if (imageCode === 'local:normal;local:hover;local:disable') {
			return 'rgb(214,15,15)';
		} else if (imageCode === 'local:normal;local:disable;local:hover') {
			return 'rgb(163, 163, 163)';
		} else if (imageCode === 'local:normal_second;local:hover_second;local:disable_second') {
			return 'rgb(255, 255, 255)';
		} else if (imageCode.slice(0, 6) === 'local:') {
			return 'url(res/' + imageCode.slice(6) + '.png) no-repeat';
		} else {
			return imageCode;
		}
	}
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
		parameter: {
			name: 'text',
			display: ['true', 'false'],
			params: 'object',
			progressBar: 'object',
			form: 'object'
		},
		params: {
			channelType: ['balance'],
			sessionId: 'text'
		},
		progressBar: {
			needCover: ['true', 'false'],
			text: 'text'
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
			oneTime: ['true', 'false'],
			actionBar: 'object',
			onback: 'object',
			wapintercept: 'object',
			scroll: ['true', 'false'],
			syncScrollState: 'text',
			type: ['fullscreen', 'popupwin']
		},
		blocks: {
			type: ["block", "component", "button", "checkbox", "label", "img", "icon", "link", "line", "expandableSelector", "spassword"],
			block: ['width','height', 'align', 'vertical-align', 'margin', 'padding',
						'image', 'filter', 'css', 'display', 'content'],
			component: ['width','height', 'align', 'vertical-align', 'margin', 'padding',
						'image', 'filter', 'css', 'display', 'content'],
			button: ['action', 'width','height', 'align', 'vertical-align', 'margin', 'padding', 'color', 'size',
						'image', 'text', 'filter', 'css', 'display', 'submit', 'checkInput'],
			label: ['width','height', 'align', 'vertical-align', 'margin', 'padding', 'color', 'size',
						'image', 'text', 'text-align', 'filter', 'html', 'underline', 'css', 'display'],
			img: ['width','height', 'align', 'vertical-align', 'margin', 'padding', 'color',
						'image', 'css', 'display'],
			icon: ['width','height', 'align', 'vertical-align', 'margin', 'padding', 'color',
						'image', 'css', 'display'],
			link: ['action', 'width','height', 'align', 'vertical-align', 'margin', 'padding', 'color', 'size',
						'image', 'text', 'text-align', 'filter', 'html', 'underline', 'css', 'display'],
			line: ['width','height', 'align', 'vertical-align', 'margin', 'padding', 'color', 'size',
						'image', 'text', 'text-align', 'filter', 'html', 'underline', 'css', 'display'],
			input: ['width','height', 'align', 'vertical-align', 'margin', 'padding', 'display', 'imeAct',
						'hint', 'empty_msg', 'keyboard'],
			checkbox: ['width','height', 'align', 'vertical-align', 'margin', 'padding', 'display',
						'format_msg', 'must'],
			password: ['width','height', 'align', 'vertical-align', 'margin', 'padding', 'display', 'imeAct',
						'hint', 'empty_msg', 'keyboard'],
			expandableSelector: ['width','height', 'align', 'vertical-align', 'margin', 'padding', 'color', 'size',
						'image', 'text', 'text-align', 'filter', 'html', 'underline', 'css', 'display'],
			spassword: ['width','height', 'align', 'vertical-align', 'margin', 'padding',
						'css', 'display', 'cursor', 'auto', 'keyboard', 'action']
		},
		actionBar: {
			title: 'text',
			left: 'text'
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
		'vertical-align': ['top', 'middle', 'bottom'],
		margin: 'text',
		padding: 'text',
		color: 'color',
		size: 'text',
		image: 'color',
		text: 'text',
		'text-align': ['left', 'center', 'right'],
		filter: 'text',
		html: 'text',
		underline: ['true', 'false'],
		css: 'text',
		display: ['true', 'false'],
		content: ['bottomView'],
		action: 'text',
		imeAct: ['next', 'done'],
		hint: 'text',
		empty_msg: 'text',
		keyboard: ['en', 'cn', 'num'],
		auto: ['true', 'false'],
		cursor: ['true', 'false'],
		must: ['true', 'false'],
		format_msg: 'text',
		submit: ['true', 'false'],
		checkInput: ['true', 'false']
	};

	var actionList = [];
	var mainForm = {
		parameter: {
			form: {}
		},
		blocks: []
	};
	var selectedForm = mainForm;
	var selectedFormIndex;
	var scriptRoot = {};

	var moduleMap = {};
	var moduleStyleMap = {};
	var blockPositionTree = [{
		name: 'root'
	}];
	var bottomBar;
	var highlightView = {
		elementId: ''
	};
	var manualCreateId;

	return {
		setBottombar: function(bar) {
			bottomBar = bar;
		},
		getBottombar: function() {
			return bottomBar;
		},
		assembleScript: function() {
			saveCurrentForm();

			var script = {};
			jQuery.extend(script, scriptRoot);
			script.form = {};
			jQuery.extend(script.form, mainForm.parameter.form);
			script.form.blocks = [];
			for (var index in mainForm.blocks) {
				script.form.blocks[index] = {};
				jQuery.extend(script.form.blocks[index], mainForm.blocks[index]);
			}

			for (var index in actionList) {
				var actionCopy = {};
				jQuery.extend(actionCopy, actionList[index].parameter);
				if (actionList[index].blocks) {
					actionCopy.form.blocks = actionList[index].blocks;
				}
				assenbleAction(actionCopy, script.form.blocks);
			}

			return script;
		},
		createNewAction: function() {
			actionList.push({
				parameter: {
					name: 'js://'
				}
			});
			this.selectForm(actionList.length - 1);
		},
		deleteAction: function() {
			actionList.splice(selectedFormIndex, 1);
			selectedFormIndex = -2;
			if (actionList.length == 0) {
				this.selectForm(-1);
			} else {
				this.selectForm(0);
			}
		},
		selectForm: function(index) {
			if (selectedFormIndex == index) {
				return;
			}

			saveCurrentForm();

			selectedFormIndex = index;
			selectedForm = index < 0 ? mainForm : actionList[index];
			moduleMap = {};
			moduleStyleMap = {};
			if (selectedForm.blocks) {
				blockPositionTree[0].array = [];
			} else {
				delete blockPositionTree[0]['array'];
			}
			$rootScope.$broadcast('sdk:panelSelectionChange');
		},
		createSelectFormBlocks: function() {
			selectedForm.blocks = [];
			blockPositionTree[0].array = [];
		},
		getSelectedFormIndex: function() {
			return selectedFormIndex;
		},
		getSelectForm: function() {
			return selectedForm;
		},
		getSelectedFormParameters: function() {
			return selectedForm.parameter;
		},
		getSelectedFormBlocks: function() {
			return selectedForm.blocks;
		},
		getScriptRoot: function() {
			return scriptRoot;
		},
		loadScript: function(newScript) {
			if (!newScript || !newScript.form) {
				actionList.length = 0;
				mainForm = {
					parameter: {
						form: {}
					},
					blocks: []
				};
				selectedForm = mainForm;
				selectedFormIndex = -1;
				scriptRoot = {};
				moduleMap = {};
				moduleStyleMap = {};
				blockPositionTree[0].array = [];
				bottomBar = undefined;
				highlightView = {
					elementId: ''
				};
				$rootScope.$broadcast('sdk:newScriptLoaded');
				return;
			}
			selectedFormIndex = -2;

			var mainBlocks = newScript.form.blocks;
			delete newScript.form.blocks;
			mainForm = {
				parameter: {
					form: newScript.form
				},
				blocks: mainBlocks
			};
			actionList.length = 0;
			collectActions(actionList, mainBlocks);
			for (var index in actionList) {
				var action = actionList[index];
				if (action.parameter.form && action.parameter.form.blocks) {
					action.blocks = action.parameter.form.blocks;
					delete action.parameter.form.blocks;
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
		moduleDataToCSS: function(style, module, elementId) {
				var width = this.processWidth(module.width, module.type);
				var height = this.processHeight(module.height, module.type);
				var margin = this.processPadding(module.margin);
	            style['margin-top'] = margin[0];
	            style['margin-left'] = margin[1];
	            style['margin-bottom']  = margin[2];
	            style['margin-right'] = margin[3];
	            if (width.indexOf('%') > 0) {
	            	var marginLR = parseInt(margin[1].slice(0, margin[1].indexOf('px')))
	            			+ parseInt(margin[3].slice(0, margin[3].indexOf('px')));
	            	width = 'calc(' + width + ' - ' + marginLR + 'px)';
	            }

				style['font-size'] = module.size * dpiRatio;
				style['width'] = width;
				style['height'] = height;
				style['max-width'] = width;
				style['max-height'] = height;
				if (module.type === 'img' || module.type === 'icon') {
					style['min-width'] = width;
					style['min-height'] = height;
				}

				var text = this.processText(module.text);
				if (text) {
					style['text'] = text;
				}

				if (elementId) {
					var hvAlign = this.processAlign(module.align, module['vertical-align']);
					var parentId = findParentId(blockPositionTree, elementId);
					var parentStyle = moduleStyleMap[parentId];
					var parentModule = moduleMap[parentId];
					if (parentId == 'root' || parentModule.type === 'block') {
						style['align-self'] = hvAlign[0];
						parentStyle['justify-content'] = hvAlign[1];
					} else if (parentModule.type === 'component') {
						style['align-self'] = hvAlign[1];
						if ((parentStyle['justify-content'] === 'space-between') || (parentStyle['justify-content'] === 'flex-start' && hvAlign[0] === 'flex-end')
							|| (parentStyle['justify-content'] === 'flex-end' && hvAlign[0] === 'flex-start')) {
							parentStyle['justify-content'] = 'space-between';
						} else {
							parentStyle['justify-content'] = hvAlign[0];
						}
					}
					style['text-align'] = module['text-align'];
				}
				
				if (module.html === 'true' && module.text) {
					// element.html(module.text);
				}

				if (module.type === 'block' || module.type === 'component'
						|| module.type === 'line' || module.type === 'button') {
					if (module.image) {
						style['background'] = parseBackground(module.image);	
					} else if (module.color) {
						style['background'] = module.color;
					}
				} else if (module.type === 'img' || module.type === 'icon') {
					if (module.image) {
						if (module.image.slice(0, 6) === 'local:') {
							style['src'] = 'res/' + module.image.slice(6) + '.png';
						} else {
							style['src'] = 'res/' + module.image + '.png';
						}
					}
				}
				style['color'] = module.color;
				if (module.type === 'label' && !(module.color)) {
					style['color'] = "rgb(0, 0, 0)";
				}

				var padding = this.processPadding(module.padding);
	            style['padding-top'] = padding[0];
	            style['padding-left']  = padding[1];
	            style['padding-bottom']  = padding[2];
	            style['padding-right']  = padding[3];

	            if ((module.type === 'input' || module.type === 'password') && style['padding-left'] === '0px') {
	            	style['padding-left'] = '8px';
	            } else if (module.type === 'button') {
	            	if (style['padding-top'] === '0px') {
	            		style['padding-top'] = '8px';
	            	}
	            	if (style['padding-bottom'] === '0px') {
	            		style['padding-bottom'] = '8px';
	            	}
	            }

	            var filterMap = this.processFilter(module.filter);
	            if ('corner' in filterMap) {
	            	style['border-radius'] = filterMap['corner'];
	            }

	            if (module.hint) {
	            	style['placeholder'] = module.hint;
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
	                    	result[filterName] = filterValue * dpiRatio + 'px';
	                    }
	                }
	            }
	        return result;
		},
		processAlign: function(align, verticlAlign) {
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
		processWidth: function(width, moduleType) {
            	if (width) {
					if (width == -1) {
						return "100%";
					} else if (width == -2) {
						return '';
					} else {
						var presentIndex = width.indexOf('%');
						if (presentIndex < 0) {
							var pxIndex = width.indexOf('px');
							if (pxIndex > 0) {
								width = width.slice(0, pxIndex);
							}
							return width * dpiRatio +'px';
						} else {
							return width;
						}
					}
            	} else {
            		if (moduleType === 'block' || moduleType === 'component' || moduleType === 'button') {
            			return '100%';
            		} else {
            			return '';
            		}
            	}
		},
		processHeight: function(height, moduleType) {
            	if (height) {
					if (height == -1) {
						return "100%";
					} else if (height == -2) {
						return '';
					} else {
						var presentIndex = height.indexOf('%');
						if (presentIndex < 0) {
							var pxIndex = height.indexOf('px');
							if (pxIndex > 0) {
								height = height.slice(0, pxIndex);
							}
							return height * dpiRatio +'px';
						} else {
							return height;
						}
					}
            	} else {
            		return '';
            	}
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
		setHighlightViewId: function(elementId) {
			highlightView.elementId = elementId;
		},
		getHighlightView: function() {
			return highlightView;
		},
		getModuleProperties: function() {
			return fullProperites;
		},
		getHierarchyColor: function(elementId) {
			var hierarchy = getBlockHierarchyLevel(blockPositionTree, elementId);
			return hierarchyColor[hierarchy];
		},
		getPosition: function(elementId) {
			return findPosition(blockPositionTree, elementId);
		},
		getBlockRoot: function() {
			return blockPositionTree[0];
		},
		selectPanel: function(elementId) {
			var selectBranch = getBlockHierarchy(blockPositionTree, elementId);
			var selectHash = {};
			selectBranch.forEach(function(value) {
				selectHash[value] = '';
			});

			for (var i = selectBranch.length - 1; i >= 0; i--) {
				$rootScope.$broadcast('module:open-' + selectBranch[i]);
			}
			for (var element in moduleMap) {
				if (!(element in selectHash)) {
					$rootScope.$broadcast('module:close-' + element);
				}
			}
		    $timeout(function() {
				$rootScope.$broadcast('module:open-' + elementId + '-finished');
		    }, 500);
		},
		getVariable: function(key) {
			return variable.value[key];
		},
		createModule: function(compile, scope, target, position, type, parentId, block) {
			manualCreateId = createModule(compile, scope, target, position, type, parentId, block);
			return manualCreateId;
		},
		getManualCreateId: function() {
			return manualCreateId;
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
			return moduleMap[elementId];
		},
		getModuleCssStyle: function(elementId) {
			var style = moduleStyleMap[elementId];
			if (!style) {
				style = {
					'box-sizing': 'border-box'
				};
				moduleStyleMap[elementId] = style;
			}
			return style;
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
			delete moduleMap[elementId];
			delete moduleStyleMap[elementId];
			if (elementId === 'root') {
				var deleteArray = findPositionArray(blockPositionTree, elementId);
				deleteArray.forEach(function(item) {
					delete moduleMap[item.name];
					delete moduleStyleMap[item.name];
					if (item.array) {
						deleteBlockModule(item.array);
					}
				});

				delete blockPositionTree[0]['array'];
			} else {
				var parentId = findParentId(blockPositionTree, elementId);
				var changeArray = findPositionArray(blockPositionTree, parentId);
				var deleteInedx = findBlockPosition(changeArray, elementId);
				var deleteItem = changeArray.splice(deleteInedx, 1);
				if (deleteItem.array) {
					deleteBlockModule(deleteItem.array);
				}
			}
		}
	};
});