(function() {
	window.emmet=function(selector,parent) {
		if(typeof selector=='string') {

			var nestFix=function(array) {
				if(Array.isArray(array)) {
					if(array.length==1 && Array.isArray(array[0])) return nestFix(array[0]);
					else return array;
				}
				else return array;
			};

			var Element=function(tagName,id,className,attributes,innerHTML,content) {
				var that=this;
				this.check={
					get tagName(){return typeof that.tagName=='string' ? (that.tagName.match(/^[a-zA-Z0-9\-_]+$/) ? true : false) : false;},
					get id(){return typeof that.id=='string' ? (that.id.match(/^[a-zA-Z0-9\-_]+$/) ? true : false) : false;},
					get className(){return typeof that.className=='string' ? (that.className.match(/^[a-zA-Z0-9\-_\s]+$/) ? true : false) : false;},
					get attributes() {
						if(Array.isArray(that.attributes)) {
							for(var i=0; i<that.attributes.length; i++) {
								if(typeof that.attributes[i]=='object') {
									if(typeof that.attributes[i].name!='string' || typeof that.attributes[i].value!='string') return false;
								}
								else return false;
							}
						}
						else return false;
						return true;
					},
					get innerHTML(){return typeof that.innerHTML=='string' ? that.innerHTML : false;},
					get content() {
						var content=nestFix(that.content);
						if(Array.isArray(content)) {
							for(var i=0; i<content.length; i++) if(!(content[i] instanceof Element)) return false;
						}
						else return false;
						return true;
					}
				};

				var check=this.check;

				this.tagName=tagName;
				this.id=id;
				this.className=className;
				this.attributes=attributes;
				this.innerHTML=innerHTML;
				this.content=Array.isArray(content) ? content : [];

				this.create=function() {
					if(check.tagName) {
						var element=document.createElement(this.tagName);
						if(check.id) element.id=this.id;
						if(check.className) element.className=this.className;
						if(check.attributes) for(var i=0; i<this.attributes.length; i++) element.setAttribute(this.attributes[i].name,this.attributes[i].value);
						if(check.innerHTML) element.innerHTML=this.innerHTML;
						if(check.content) {
							var content=nestFix(this.content);
							for(var i=0; i<content.length; i++) {
								if(content[i] instanceof Element) {
									var subElement=content[i].create();
									if(subElement!==false) element.appendChild(subElement);
								}
							}
						}
						return element;
					}
					else return false;
				}
			};

			// Escape
			var escape=function(selector) {
				var r={
					'>':'&#62;',
					'^':'&#94;',
					'#':'&#35;',
					'.':'&#46;',
					'*':'&#42;'
				};
				var d=[
					{s:{c:'{',r:'&#123;'},e:{c:'}',r:'&#125;'},l:0},
					{s:{c:'[',r:'&#91;'},e:{c:']',r:'&#93;'},l:0}
				];

				var regexEscape=function(str) {
					return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&");
				}

				var eSelector='';
				for(var i=0; i<selector.length; i++) {
					var c=selector[i];
					for(var j=0; j<d.length; j++) {
						if(c==d[j].s.c || c==d[j].e.c) {
							if(c==d[j].s.c) {
								if(d[j].l>0) c=d[j].s.r;
								d[j].l++;
							}
							else if(c==d[j].e.c) {
								d[j].l--;
								if(d[j].l>0) c=d[j].e.r;
							}
						}
						else if(d[j].l>0) {
							for(var k=0; k<d.length; k++) {
								if(k!=j) {
									if(c==d[k].s.c) c=d[k].s.r;
									if(c==d[k].e.c) c=d[k].e.r;
								}
							}
							c=typeof r[c]=='string' ? r[c] : c;
						}
					}
					eSelector+=c;
				}
				for(var i=0; i<d.length; i++) {
					var count={
						s:(eSelector.match(new RegExp(regexEscape(d[i].s.c),'g')) || []).length,
						e:(eSelector.match(new RegExp(regexEscape(d[i].e.c),'g')) || []).length
					};
					if(count.s!=count.e) return false;
				}
				return eSelector;
			}

			// Element parser
			var elementParse=function(selector) {
				var Data=function() {
					return {
						innerHTML:function(selector) {
							var innerHTML=selector.match(/\{([^\.#\{\}\[\]\*]+)\}/);
							this.innerHTML=innerHTML==null ? null : innerHTML[1];
						},
						attributes:function(selector) {
							var attributes=selector.match(/\[([^\.#\{\}\[\]\*]+)\]/);
							var eAttributes=[];
							if(attributes!=null) {
								attributes=attributes[1];
								var attr='';
								var string=false;
								for(var i=0; i<attributes.length; i++) {
									if(attributes[i]=='"') string=!string;
									attr+=string && attributes[i]==' ' ? '&nbsp;' : attributes[i];
								}
								attributes=attr.split(' ');
								for(var i=0; i<attributes.length; i++) {
									var match=attributes[i].match(/^([a-zA-Z0-9\-_]+)="([^"]*)"$/);
									if(match==null) match=attributes[i].match(/^([a-zA-Z0-9\-_]+)=([^"]*)$/);
									if(match==null) match=attributes[i].match(/^([a-zA-Z0-9\-_]+)$/);
									if(match!=null) eAttributes.push({name:match[1],value:match.length>2 ? match[2] : ''});
								}
							}
							this.attributes=eAttributes;
						},
						className:function(selector) {
							var className=selector.match(/\.[^\.#\{\}\[\]\*]+/g);
							var eClassName='';
							if(className!==null) for(var i=0; i<className.length; i++) eClassName+=className[i].substr(1)+' ';
							this.className=eClassName.trim();
						},
						id:function(selector) {
							var id=selector.match(/#[^\.#\{\}\[\]\*]+/);
							this.id=id==null ? null : id[0].substr(1);
						},
						tagName:function(selector) {
							var tagName=selector.match(/^([^\.#\{\}\[\]\*]+)/);
							this.tagName=tagName==null ? null : tagName[0];
						}
					};
				};

				var multiplicator=selector.match(/\*(\d+)/);
				if(multiplicator!=null) {
					multiplicator=parseInt(multiplicator[1]);
					var aNumbering=selector.match(/\$+@?-?\d*/g) || [];
					var numbering=[];
					if(aNumbering.length>0) {
						for(var i=0; i<aNumbering.length; i++) {
							var match=aNumbering[i].match(/^(\$+)(@?)(-?)(\d*)$/);
							var num={length:match[1].length,from:1,direction:1,regex:new RegExp(match[1].replace(/\$/g,'\\$')+match[2]+match[3]+match[4])};
							if(match[2]!='') {
								num.from=match[4]=='' ? 1 : parseInt(match[4]);
								num.direction=match[3]=='' ? 1 : -1;
							}
							numbering.push(num);
						}
					}
					var elements=[];
					for(var i=0; i<multiplicator; i++) {
						var localSelector=selector+'';
						for(var j=0; j<numbering.length; j++) {
							var num=numbering[j];
							var number=((num.direction==1 ? i : multiplicator-i-1)+num.from).toString();
							for(var k=number.length; k<num.length; k++) number='0'+number;
							localSelector=localSelector.replace(num.regex,number);
						}
						var data=new Data;
						for(var key in data) data[key](localSelector);
						elements.push(new Element(data.tagName,data.id,data.className,data.attributes,data.innerHTML));
					}
					return elements;
				}
				else {
					var data=new Data;
					for(var key in data) data[key](selector);
					return new Element(data.tagName,data.id,data.className,data.attributes,data.innerHTML);
				}
			}

			// Tree navigator
			var treeNav=function(selector) {
				var n=(selector[0]=='^' ? [] : [selector.match(/^([^\^]+)\^?/)[1]]).concat(selector.match(/\^+[^\^]+/g) || []);
				var nav=[];
				for(var i=0; i<n.length; i++) {
					var t=n[i].split('^');
					nav.push({direction:t.length==1 ? 0 : t.length,selector:t[t.length-1]});
				}
				return nav;
			}

			// Tree constructor
			var makeTree=function(selector) {
				var tree=[];
				var position=[0];
				selector=escape(selector);
				if(selector!==false) {
					var position=[0];
					selector=selector.split('>');
					for(var i=0; i<selector.length; i++) {
						if(i==0) tree.push(elementParse(selector[i]));
						else {
							var nav=treeNav(selector[i]);
							for(var j=0; j<nav.length; j++) {
								var p=nav[j].direction>position.length-1 ? position.length-1 : nav[j].direction;
								position=position.splice(0,position.length-p);
								var currentElement=tree[position[0]];
								for(var k=1; k<position.length; k++) currentElement=currentElement.content[position[k]];
								if(Array.isArray(currentElement)) {
									for(var k=0; k<currentElement.length; k++) currentElement[k].content.push(elementParse(nav[j].selector));
								}
								else currentElement.content.push(elementParse(nav[j].selector));
								position.push(0);
							}
						}
					}
					return tree;
				}
				else return false;
			}

			var result=nestFix(makeTree(selector));
			if(parent instanceof Node) {
				var elements=[];
				for(var i=0; i<result.length; i++) {
					var el=result[i].create();
					if(el!==false) {
						elements.push(el);
						parent.appendChild(el);
					}
					else return false;
				}
			}
			else {
				var elements=[];
				for(var i=0; i<result.length; i++) {
					var el=result[i].create();
					if(el!==false) elements.push(el);
					else return false;
				}
			}
			return elements.length==1 ? elements[0] : elements;
		}
		else return false;
	};

	window.Node.prototype.emmet=function(selector){return window.emmet(selector,this);};
	window.NodeList.prototype.emmet=function(selector) {
		var result=true;
		for(var i=0; i<this.length; i++) result=result && this[i].emmet(selector,this[i]);
		return result;
	};

})();
