/*
 * sTip
 *
 *
 * Copyright (c) 2013 Siddhartha Gudipati
 * Licensed under the yes license.
 */

;(function( $, window, document, undefined) {


  // our plugin constructor
  var sTip = function( elem, options ){
      this.elem = elem;
      this.$elem = $(elem);
      this.options = options;

      // This next line takes advantage of HTML5 data attributes
      // to support customization of the plugin on a per-element
      // basis. For example,
      // <div class=item' data-stip-options='{"message":"Goodbye World!"}'></div>
      this.metadata = this.$elem.data( 'sTip-options' );
    };


 sTip.prototype = {
    defaults: {
       // # sTip Version
    sTip: "0.1.0",

    // # Instance Variables

    // Specify the "target" onto which the FlowTip instance should be anchored to.
    target: null,

    // Specify if the FlowTip instance should be visible or not.
    visible: false,

    // Specify the parent element into which the FlowTip instance will be appended.
    appendTo: document.body,

    // Specify the content of the content element (`flowtip-content`). Can also be set by calling
    // `setTooltipContent(content, options)`.
    tooltipContent: "<h2> asdfasdfasDF</h2>",

    // The default, preferred region the FlowTip instance will appear. This is only the "preferred"
    // region meaning that if there is no room for FlowTip in that region, edge-detection algorithm
    // will be used to find the next available region for display.
    region: "bottom",

    // Specify if the "tail" of the FlowTip should be visible or not.
    hasTail: true,

    // ### Class Name
    //
    // Values for class names will be appended to a default class name for the corresponding
    // element.

    // Class name for the overall FlowTip element. Appended to "flowtip".
    tipClassName: "",

    // Class name for the FlowTip content element. Appended to "flowtip-content".
    contentClassName: "",

    // Class name for the FlowTip tail element. Appended to "flowtip-tail".
    tailClassName: "",

    // ### Dimensions

    width: null,
    height: "auto",
    minWidth: null,
    minHeight: null,
    maxWidth: null,
    maxHeight: null,

    tailWidth: 20,
    tailHeight: 10,

    targetAlign: "center",
    targetAlignOffset: 0,
    rootAlign: "center",
    rootAlignOffset: 0,
    // ### Offsets

    // Specify the distance of the edge of the FlowTip element to the target element.
    targetOffset: 10,

    // Specify how close to the edge of the boundary the target can be before the FlowTip is
    // rotated.
    rotationOffset: 30,

    // Specify how close to the edge of the boundary the target can be before the FlowTip is
    // flipped.
    edgeOffset: 30,

    topDisabled: false,
    bottomDisabled: false,
    leftDisabled: false,
    rightDisabled: false,

    hideInDisabledRegions: false,
    persevere: false,
    targetOffsetFrom: "root"
    },
    init: function() {
      this.options = $.extend({}, this.defaults, this.options);
      this.options.target = this.options.target || this.$elem;
      this.setTarget(this.elem);
      this._attachEvents()
    },
    setTarget: function(target) {
      this.$target = $(target);
      this.target = this.$target[0];
    },
    prepareToolTip: function() {
      if (this.$root) return this._renderContent();
      // Prepare the tootltip
      this.root = document.createElement("div");
      this.root.className = "stip " + this.options.tipClassName;
      this.root.style.position = "absolute";
      this.root.style.display = "none";
      // Prepare content
      this.content = document.createElement("div");
      this.content.className = "stip-content " + this.options.contentClassName;

      this._renderContent();

      this._repositionCount = 0;
      this.root.appendChild(this.content);
      // Create the tail
      this.tail = document.createElement("div");
      this.tail.className = "stip-tail " + this.options.tailClassName;
      this.tail.style.position = "absolute";

      this.tail.appendChild(document.createElement("div"));
      this.root.appendChild(this.tail);

      this.$root = $(this.root);
      this.$content = $(this.content);
      this.$tail = $(this.tail);
      this.$appendTo = $(this.options.appendTo || (this.options.appendTo = document.body));

      this.options.appendTo = this.$appendTo[0];
      this._insertToDOM();
    },

    reposition: function() {
      if (this.options.target) {
        this.$root.width(this.options.width);
        // this.$root.height(this.options.height);
        this.$root.css({
          minWidth: this.options.minWidth,
          minHeight: this.options.minHeight,
          maxWidth: this.options.maxWidth,
          maxHeight: this.options.maxHeight
        });
        if ("auto" === this.options.width || "auto" === this.options.height) this.content.style.position = "relative";
        this.$tail.width(this.options.tailWidth);
        this.$tail.height(this.options.tailHeight);
        this._updateRegion();

        this._updatePosition();
      }
    },
    showToolTip: function(region) {
      var self = this;
      if (this.options.visible) {
        return this;
      }

      console.log(self)


      this.prepareToolTip();
      this.options.visible = true;
      this.root.style.display = "block";
      this.root.style.opacity = 0;
      this._setupPosition(region);
      this.reposition();
      setTimeout(function() {
        self._setupPosition(region);
        self.reposition();
        self.root.style.opacity = 1;
        self.trigger('show');
      }, 16);
      return this;
    },

    _showToolTip: function(self){
      this.showToolTip();
    },

    // Triggers a specific Javascript event on the target of the FlowTip instance.
    //
    // The event will be suffixed with `.flowtip` (i.e. "show.flowtip").
    trigger: function(eventName, args) {
      this.$root.trigger(eventName + ".sTip", args || []);
    },
    // Private methods
    _renderContent: function() {
      var c;
      if ("string" === typeof this.options.tooltipContent)
        return $(this.content).html(this.options.tooltipContent);
      this.$tooltipContent = $(this.options.tooltipContent);
      this.$tooltipContent.length && (c = this.$tooltipContent[0], this.content.contains(c) && this.content.removeChild(c));
      this.content.innerHTML = "";
      if (c) return this.content.appendChild(c)
    },
      // Insert the sTip instance DOM elements into the DOM tree.
    _insertToDOM: function() {
      var position;
      position = this.$appendTo.css("position");
      "relative" !== position && ("absolute" !==
        position && "fixed" !== position) && (position = "relative");
      this.options.appendTo.style.position = position;
      return this.options.appendTo.appendChild(this.root)
    },
        // Setup position hash for jQuery.position.
    _setupPosition: function(region) {
      var _this = this;
      this.options.region = region || this.options.region;

      if (this.options.region == "bottom") {
        console.log("===================");
        this._position = {
          my: "center top",
          at: "center bottom",
          of: this.$target,
          collision: 'fit',
          using: function() {
            return _this._setOffset.apply(_this, arguments);
          },
          tail: {
            type: "top",
            of: this.root
          }
        };
      } else if (this.options.region == "top") {
        this._position = {
          my: "center bottom",
          at: "center top",
          of: this.$target,
          collision: 'fit',
          using: function() {
            return _this._setOffset.apply(_this, arguments);
          },
          tail: {
            type: "bottom",
            of: this.root
          }
        };
      } else if (this.options.region == "left") {
        this._position = {
          my: "right center",
          at: "left center",
          of: this.$target,
          collision: 'fit',
          using: function() {
            return _this._setOffset.apply(_this, arguments);
          },
          tail: {
            type: "right",
            of: this.root
          }
        };
      } else if (this.options.region == "right") {
        this._position = {
          my: "left center",
          at: "right center",
          of: this.$target,
          collision: 'fit',
          using: function() {
            return _this._setOffset.apply(_this, arguments);
          },
          tail: {
            type: "left",
            of: this.root
          }
        };
      }
    },

    _rootPivot: function(c, f, a) {
      var b,
        d, g, j, h;
      h = this._targetPivot(c, f);
      g = this._rootAlign(c);
      j = this._rootAlignOffset(c);
      "center" === g ? (d = "top" === c || "bottom" === c ? h - a.width / 2 : "left" === c || "right" === c ? h - a.height / 2 : void 0, b = "top" === c || "right" === c ? j : "bottom" === c || "left" === c ? -j : void 0) : "edge" === g && (a = "top" === c || "bottom" === c ? [h, h - a.width] : "left" === c || "right" === c ? [h, h - a.height] : void 0, b = 0 <= j, d = "top" === c || "right" === c ? b ? a[1] : a[0] : "bottom" === c || "left" === c ? b ? a[0] : a[1] : void 0, b = "top" === c || "right" === c ? j : "bottom" === c || "left" === c ? -j : void 0);
      return d + b +
        this._targetAlignmentOffset(c, f)
    },
    _tailPivot: function(c, f, a, b) {
      var d;
      d = this._targetPivot(c, f);
      a = "top" === c || "bottom" === c ? d - b.left - a.width / 2 : "left" === c || "right" === c ? d - b.top - a.height / 2 : void 0;
      c = this._targetAlignmentOffset(c, f);
      return a + c
    },

    _targetAlignmentOffset: function(c) {
      var f, a;
      f = this._targetAlign(c);
      a = this._targetAlignOffset(c);
      if ("center" === f) {
        if ("top" === c || "right" === c) return a;
        if ("bottom" === c || "left" === c) return -a
      } else if ("edge" === f) {
        if ("top" === c || "right" === c) return -a;
        if ("bottom" === c || "left" === c) return a
      }
    },
    _rootAlign: function(c) {
      return this["" +
        c + "RootAlign"] || this.options.rootAlign
    },
    _rootAlignOffset: function(c) {
      return this["" + c + "RootAlignOffset"] || this.options.rootAlignOffset
    },
    _targetAlign: function(c) {
      return this["" + c + "TargetAlign"] || this.options.targetAlign
    },
    _targetAlignOffset: function(c) {
      return this["" + c + "TargetAlignOffset"] || this.options.targetAlignOffset
    },
    _rootDimension: function() {
      return {
        width: this.$root.width(),
        height: this.$root.height()
      }
    },
    _tailDimension: function(c) {
      var f, a, b;
      f = this.tail.getAttribute("original-width") &&
        this.tail.getAttribute("original-height") ? {
          width: parseInt(this.tail.getAttribute("original-width")),
          height: parseInt(this.tail.getAttribute("original-height"))
      } : (this.tail.setAttribute("original-width", b = this.$tail.width()), this.tail.setAttribute("original-height", a = this.$tail.height()), {
        width: b,
        height: a
      });
      return "left" === c || "right" === c ? {
        width: f.height,
        height: f.width
      } : f
    },
    _tailType: function(c) {
      switch (c) {
        case "top":
          return "bottom";
        case "bottom":
          return "top";
        case "left":
          return "right";
        case "right":
          return "left"
      }
    },
    _targetParameter: function() {
      var targetOffset, appendToOffset;

      targetOffset = this.$target.offset();
      appendToOffset = this.$appendTo.offset();
      return {
        top: targetOffset.top - appendToOffset.top,
        left: targetOffset.left - appendToOffset.left,
        height: this.$target.outerHeight(),
        width: this.$target.outerWidth()
      }
    },
    _parentParameter: function() {
      var c;
      c = this.$appendTo.offset();
      return {
        top: c.top,
        left: c.left,
        height: this.$appendTo.outerHeight(),
        width: this.$appendTo.outerWidth()
      }
    },
    _regionParameter: function() {
      return {
        top: {
          fits: this._fitsInRegion("top"),
          availables: this._availableRegion("top")
        },
        bottom: {
          fits: this._fitsInRegion("bottom"),
          availables: this._availableRegion("bottom")
        },
        left: {
          fits: this._fitsInRegion("left"),
          availables: this._availableRegion("left")
        },
        right: {
          fits: this._fitsInRegion("right"),
          availables: this._availableRegion("right")
        }
      }
    },
    _targetPivot: function(c, f) {
      var a, b, d;
      d = this._targetAlign(c);
      b = this._targetAlignOffset(c);
      "center" === d ? a = "top" === c || "bottom" === c ? f.left + f.width / 2 : "left" === c || "right" === c ? f.top + f.height / 2 : void 0 : "edge" === d && (a = "top" === c || "bottom" === c ? [f.left, f.left +
        f.width
      ] : "left" === c || "right" === c ? [f.top, f.top + f.height] : void 0, b = 0 <= b, a = "top" === c || "right" === c ? b ? a[1] : a[0] : "bottom" === c || "left" === c ? b ? a[0] : a[1] : void 0);
      console.log(a)
      return a
    },

  _calculatePosition: function(c) {
      var f, a, b, d, g, j, h, l;
      rootDimentions = this._rootDimension();
      a = this._parentParameter();
      l = this._targetParameter();
      j = h = 0;
      this.options.hasTail && (g = this._tailDimension(c), h = g.width, j = g.height);
      b = {};
      f = "root" === this.options.targetOffsetFrom ? this.options.targetOffset : "tail" === this.options.targetOffsetFrom ? "top" === c || "bottom" === c ? j + this.options.targetOffset : "left" === c || "right" === c ? h + this.options.targetOffset : void 0 : void 0;

      console.log("_calculatePosition f is ")
      console.log(f)
      switch (c) {
        case "top":
          b = {
            top: l.top - rootDimentions.height - f,
            left: this._rootPivot(c, l, rootDimentions),
            tail: {
              top: rootDimentions.height
            }
          };
          break;
        case "bottom":
          b = {
            top: l.top + l.height + f,
            left: this._rootPivot(c, l, rootDimentions),
            tail: {
              top: -j
            }
          };
          break;
        case "left":
          b = {
            top: this._rootPivot(c, l, rootDimentions),
            left: l.left - rootDimentions.width - f,
            tail: {
              left: rootDimentions.width
            }
          };
          break;
        case "right":
          b = {
            top: this._rootPivot(c, l, rootDimentions),
            left: l.left + l.width + f,
            tail: {
              left: -h
            }
          }
      }

      console.log("_rootDimension b is ==" );
      console.log(b);
      switch (c) {
        case "top":
        case "bottom":
          b.left < this.options.edgeOffset ? b.left = this.options.edgeOffset : b.left + rootDimentions.width > a.width - this.options.edgeOffset && (b.left = a.width - rootDimentions.width - this.options.edgeOffset);
          break;
        case "left":
        case "right":
          b.top < this.options.edgeOffset ? b.top = this.options.edgeOffset : b.top + rootDimentions.height > a.height -
            this.options.edgeOffset && (b.top = a.height - rootDimentions.height - this.options.edgeOffset)
      }
      this.options.hasTail && (b.tail = function() {
        switch (c) {
          case "top":
            return {
              top: rootDimentions.height,
              left: this._tailPivot(c, l, g, b)
            };
          case "bottom":
            return {
              top: -j,
              left: this._tailPivot(c, l, g, b)
            };
          case "left":
            return {
              top: this._tailPivot(c, l, g, b),
              left: rootDimentions.width
            };
          case "right":
            return {
              top: this._tailPivot(c, l, g, b),
              left: -h
            }
        }
      }.call(this), b.tail.width = h, b.tail.height = j);
      return b
    },

    _updatePosition: function() {
      var f, a, b;
      c = this._calculatePosition(this._region);
      this.root.style.top = "" + (Math.round(c.top) + this.$appendTo.scrollTop()) + "px";
      this.root.style.left = "" + (Math.round(c.left) + this.$appendTo.scrollLeft()) + "px";
      b = this.$root.height();
      f = this.$content.height();
      a = this.$content.outerHeight(!0);
      f = a - f;
      a > b && (this.content.style.maxHeight = "" + (b - f) + "px", this.$root.addClass("content-overflow"));
      this.options.hasTail ?
        (this.tail.style.display = "block", this.tail.style.top = "" + Math.round(c.tail.top) + "px", this.tail.style.left = "" + Math.round(c.tail.left) + "px", this.tail.style.width = "" + c.tail.width + "px", this.tail.style.height = "" + c.tail.height + "px", this.tail.className = "stip-tail " + this.options.tailClassName + " " + this._tailType(this._region), this.root.className = this.root.className.replace(/tail-at-[\w]+/, ""), this.root.className = "" + this.root.className + " tail-at-" + this._tailType(this._region)) : this.tail.style.display = "none";
      return this._updateVisibility(this._availableRegion(this._region))
    },

_updateVisibility: function(c) {
      return this.root.style.opacity =
        c ? 1 : 0
    },
    _availableRegion: function(c) {
      return !this["" + c + "Disabled"]
    },
    _availableAndFitsIn: function(c, f, a) {
      var b;
      a || (a = c[0]);
      b = c[0];
      return !c ||
        0 >= c.length ? this.hideInDisabledRegions ? a : this._region : f[b].availables && f[b].fits ? b : this._availableAndFitsIn(c.slice(1), f, a)
    },
    _fitsInRegion: function(c) {
      var f, a, b;
      a = this._calculatePosition(c);
      b = this._rootDimension();
      f = this._parentParameter();
      switch (c) {
        case "top":
          return 0 <= a.top - this.options.edgeOffset;
        case "bottom":
          return a.top + b.height + this.options.edgeOffset <= f.height;
        case "left":
          return 0 <= a.left - this.options.edgeOffset;
        case "right":
          return a.left + b.width + this.options.edgeOffset <= f.width
      }
    },
    _updateRegion: function() {
      var c, f, a, b, d;
      console.log(this._region)
      console.log(this.options.region)
      this._region || (this._region = this.options.region);
      this.options.persevere && (this._region = this.options.region);
      c = this._parentParameter();
      b = this._targetParameter();
      f = this._regionParameter();
      "top" === this._region && !f.top.fits ? this._region = this._availableAndFitsIn(["bottom", "left", "right"], f) : "bottom" === this._region && !f.bottom.fits ? this._region = this._availableAndFitsIn(["top",
        "left", "right"
      ], f) : "left" === this._region && !f.left.fits ? this._region = this._availableAndFitsIn(["right", "top", "bottom"], f) : "right" === this._region && !f.right.fits && (this._region = this._availableAndFitsIn(["left", "top", "bottom"], f));
      if (("top" === (a = this._region) || "bottom" === a) && !f.top.fits && !f.bottom.fits) this._region = this._availableAndFitsIn(["left", "right"], f);
      else if (("left" === (d = this._region) || "right" === d) && !f.left.fits && !f.right.fits) this._region = this._availableAndFitsIn(["top", "bottom"], f);
      if (a = function() {
        switch (this._region) {
          case "top":
          case "bottom":
            if (c.width -
              (b.left + b.width / 2) - this.options.edgeOffset < this.rotationOffset) return "top" === this._region ? ["left", "bottom"] : ["left", "top"];
            if (b.left + b.width / 2 - this.options.edgeOffset < this.rotationOffset) return "top" === this._region ? ["right", "bottom"] : ["right", "top"];
            break;
          case "left":
          case "right":
            if (c.height - (b.top + b.height / 2) - this.options.edgeOffset < this.rotationOffset) return "left" === this._region ? ["top", "right"] : ["top", "left"];
            if (b.top + b.height / 2 - this.options.edgeOffset < this.rotationOffset) return "left" === this._region ? ["bottom", "right"] : ["bottom",
              "left"
            ]
        }
      }.call(this)) return this._region = this._availableAndFitsIn(a, f)
    },

    // Custom positioning function for jQuery.position.
    _setOffset: function(position, properties) {

/* Edge Offset */
      if (this.options.region == "left" || this.options.region == "right") {
        this.root.style.margin = this.options.edgeOffset + "px 0px";
        position.top += this.options.edgeOffset;
      } else if (this.options.region == "top" || this.options.region == "bottom") {
        this.root.style.margin = "0px " + this.options.edgeOffset + "px";
        position.left += this.options.edgeOffset;
      }

      /* Target Offset */
      if (this.options.region == "top") {
        position.top -= this.options.targetOffset;
      } else if (this.options.region == "bottom") {
        position.top += this.options.targetOffset;
      } else if (this.options.region == "left") {
        position.left -= this.options.targetOffset;
      } else if (this.options.region == "right") {
        position.left += this.options.targetOffset;
      }

      properties.element.element.offset(position);

      if (this._resizeContent) {
        this.content.style.maxHeight = null;
        this.$root.removeClass("content-overflow");
      }

      var elOffset = this.$root.offset(),
          elWidth = this.$root.width(),
          elHeight = this.$root.height(),
          contentHeight = this.$content.height(),
          contentOuterHeight = this.$content.outerHeight(true),
          contentSpacing = contentOuterHeight - contentHeight;

      /* Content Scrolling */
      if (contentOuterHeight > elHeight) {
        this.content.style.maxHeight = (elHeight - contentSpacing) + "px";
        this.$root.addClass("content-overflow");
      }

      if (!this.options.hasTail) {
        this.tail.style.display = "none";
        return;
      } else {
        this.tail.style.display = "block";
      }

      var _tailPosition = $.extend({}, this._position.tail);

      /* Tail Position */
      if (this.options.region == "top" || this.options.region == "bottom") {
        if (properties.vertical == "top") {
          _tailPosition.my = "center bottom";
          _tailPosition.at = "center top";
        } else if (properties.vertical == "bottom") {
          _tailPosition.my = "center top";
          _tailPosition.at = "center bottom";
        }
        _tailPosition.type = this.options.region == "top" ? "bottom" : "top";
      } else if (this.options.region == "left" || this.options.region == "right") {
        if (properties.horizontal == "left") {
          _tailPosition.my = "right center";
          _tailPosition.at = "left center";
        } else if (properties.horizontal == "right") {
          _tailPosition.my = "left center";
          _tailPosition.at = "right center";
        }
        _tailPosition.type = this.options.region == "left" ? "right" : "left";
      }

      /* Tail Offset */
      if (this.options.region == "top" || this.options.region == "bottom") {
        var targetMid = properties.target.left + (properties.target.width / 2),
            elementMid = elOffset.left + (elWidth / 2);
        if (targetMid != elementMid) {
          _tailPosition.offset = (targetMid - elementMid) + " 0";
        }
      } else if (this.options.region == "left" || this.options.region == "right") {
        var targetMid = properties.target.top + (properties.target.height / 2),
            elementMid = elOffset.top + (elHeight / 2)
        if (targetMid != elementMid) {
          _tailPosition.offset = "0 " + (targetMid - elementMid);
        }
      }

      if (!_tailPosition.at) {
        return;
      }

      this.tail.className = "flowtip-tail " + this.options.tailClassName + " " + _tailPosition.type;
      this.$tail.position(_tailPosition);
    },
    // Attach the event to the element
    _attachEvents: function () {
      var self = this;
      $(document).on("click", this.elem, function(evt) {
        evt.preventDefault();
        self._showToolTip(self)
        });
    }


  };

  sTip.defaults = sTip.prototype.defaults;

  $.fn.sTip = function(options) {
    return this.each(function() {
      new sTip(this, options).init();
    });
  };

})(jQuery, window , document);
