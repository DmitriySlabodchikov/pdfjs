(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.pdfjs = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

var BaseElement = module.exports = function(Node) {
  this.Node = Node
}

BaseElement.prototype.createNode = function(x, y, width) {
  var node = new this.Node(this)
  return node
}

},{}],2:[function(require,module,exports){
'use strict'

var BoxStyle = require('../style/box')

var Box = module.exports = function(style, opts) {
  Box.super_.call(this, require('../pdf/node/box'))

  this.style = new BoxStyle(style, opts)
}

require('../pdf/utils').inherits(Box, require('./container'))

},{"../pdf/node/box":20,"../pdf/utils":56,"../style/box":58,"./container":4}],3:[function(require,module,exports){
'use strict'

var TableStyle = require('../style/table')

var Cell = module.exports = function(str, style) {
  Cell.super_.call(this, require('../pdf/node/cell'))

  this.style = new TableStyle(style)

  if (str !== undefined && str !== null) {
    this.text(str, this.style)
  }
}

require('../pdf/utils').inherits(Cell, require('./container'))

var Table = require('./table')
Cell.prototype.table = function(opts) {
  var table = new Table(this.style.merge(TableStyle.reset), opts)
  this.children.push(table)
  return table
}

},{"../pdf/node/cell":21,"../pdf/utils":56,"../style/table":62,"./container":4,"./table":13}],4:[function(require,module,exports){
'use strict'

var ContainerStyle = require('../style/container')

var Container = module.exports = function(Node) {
  Container.super_.call(this, Node)

  this.children = []
}

require('../pdf/utils').inherits(Container, require('./base'))

var Text = require('./text')
Container.prototype.text = function(text, opts) {
  if (text && typeof text === 'object') {
    opts = text
    text = undefined
  }

  var child = new Text(text, this.style.merge(opts))
  this.children.push(child)
  return child
}

var Box = require('./box')
Container.prototype.box = function(opts) {
  var box = new Box(this.style.merge(ContainerStyle.reset), opts)
  this.children.push(box)
  return box
}

var Table = require('./table')
Container.prototype.table = function(opts) {
  var table = new Table(this.style.merge(ContainerStyle.reset), opts)
  this.children.push(table)
  return table
}

var Image = require('./image')
Container.prototype.image = function(img, opts) {
  var image = new Image(img, opts)
  this.children.push(image)
  return image
}

var Operations = require('./operations')
Container.prototype.ops = function() {
  var ops = new Operations()
  this.children.push(ops)
  return ops
}

},{"../pdf/utils":56,"../style/container":59,"./base":1,"./box":2,"./image":7,"./operations":9,"./table":13,"./text":14}],5:[function(require,module,exports){
'use strict'

var DocumentStyle = require('../style/document')
var PDF = require('../pdf')

var Document = module.exports = function(opts) {
  Document.super_.call(this, require('../pdf/node/document'))

  opts        = opts || {}
  opts.width  = opts.width  || 595.296
  opts.height = opts.height || 841.896

  this.style   = new DocumentStyle(opts)
  this._header = null
  this._footer = null
}

require('../pdf/utils').inherits(Document, require('./container'))

var Box = require('./box')

Document.prototype.header = function(opts) {
  if (this._header) {
    return this._header
  }

  if (opts && !opts.width) {
    opts.width = '100%'
  }

  this._header = new Box(this.style.merge(DocumentStyle.super_.reset), opts)
  return this._header
}

Document.prototype.footer = function(opts) {
  if (this._footer) {
    return this._footer
  }

  if (opts && !opts.width) {
    opts.width = '100%'
  }

  this._footer = new Box(this.style.merge(DocumentStyle.super_.reset), opts)
  return this._footer
}

Document.prototype.render = function() {
  return new PDF(this.createNode(this))
}

},{"../pdf":18,"../pdf/node/document":22,"../pdf/utils":56,"../style/document":60,"./box":2,"./container":4}],6:[function(require,module,exports){
'use strict'

var TTFFont = require('ttfjs')
var utils   = require('../../pdf/utils')
var uuid    = require('node-uuid')

var Font = module.exports = function(src) {
  this.uuid = uuid.v4()
  this.ttf  = new TTFFont(utils.toArrayBuffer(src))
}

Font.prototype.subset = function() {
  return this.ttf.subset({ remap: true, trimNames: true })
}

Font.prototype.stringWidth = function(string, size) {
  return this.ttf.stringWidth(string, size)
}

Font.prototype.lineHeight = function(size, includeGap) {
  return this.ttf.lineHeight(size, includeGap)
}

Font.prototype.lineDescent = function(size) {
  return this.ttf.lineDescent(size)
}

},{"../../pdf/utils":56,"node-uuid":75,"ttfjs":88}],7:[function(require,module,exports){
'use strict'

var ImageStyle = require('../style/image')

var Image = module.exports = function(img, style, opts) {
  this.uuid = img.uuid
  this.img  = img

  Image.super_.call(this, require('../pdf/node/image'))

  this.style = new ImageStyle(style, opts)
}

require('../pdf/utils').inherits(Image, require('./base'))

},{"../pdf/node/image":23,"../pdf/utils":56,"../style/image":61,"./base":1}],8:[function(require,module,exports){
'use strict'

var LineBreak = module.exports = function(style) {
  LineBreak.super_.call(this, require('../pdf/node/linebreak'))

  this.style = style
}

require('../pdf/utils').inherits(LineBreak, require('./base'))

Object.defineProperties(LineBreak.prototype, {
  width: {
    enumerable: true,
    get: function() {
      return 0
    }
  },

  height: {
    enumerable: true,
    get: function() {
      var height = this.style.font.lineHeight(this.style.fontSize, true) * this.style.lineHeight

      return height
    }
  },

  spacing: {
    enumerable: true,
    get: function() {
      return 0
    }
  }
})

},{"../pdf/node/linebreak":24,"../pdf/utils":56,"./base":1}],9:[function(require,module,exports){
'use strict'

var Operations = module.exports = function() {
  Operations.super_.call(this, require('../pdf/node/operations'))

  this.ops = []
}

require('../pdf/utils').inherits(Operations, require('./base'))

Operations.prototype.op = function(fn) {
  if (fn && typeof fn === 'function') {
    this.ops.push(fn)
  } else {
    this.ops.push(Array.prototype.slice.call(arguments))
  }
}
},{"../pdf/node/operations":25,"../pdf/utils":56,"./base":1}],10:[function(require,module,exports){
'use strict'

var Word = require('./word')

var PageCount = module.exports = function(style) {
  Word.call(this, '0', style)
  Word.super_.call(this, require('../pdf/node/page-count'))
}

require('../pdf/utils').inherits(PageCount, Word)

},{"../pdf/node/page-count":26,"../pdf/utils":56,"./word":15}],11:[function(require,module,exports){
'use strict'

var Word = require('./word')

var PageNumber = module.exports = function(style) {
  Word.call(this, '0', style)
  Word.super_.call(this, require('../pdf/node/page-number'))
}

require('../pdf/utils').inherits(PageNumber, Word)

},{"../pdf/node/page-number":27,"../pdf/utils":56,"./word":15}],12:[function(require,module,exports){
'use strict'

var TableStyle = require('../style/table')

var Row = module.exports = function(style) {
  Row.super_.call(this, require('../pdf/node/row'))

  this.style    = new TableStyle(style)
  this.children = []
}

require('../pdf/utils').inherits(Row, require('./base'))

var Cell = require('./cell')
Row.prototype.td = function(text, opts) {
  if (text && typeof text === 'object') {
    opts = text
    text = undefined
  }

  var td = new Cell(text, this.style.merge(opts))
  this.children.push(td)
  return td
}

},{"../pdf/node/row":29,"../pdf/utils":56,"../style/table":62,"./base":1,"./cell":3}],13:[function(require,module,exports){
'use strict'

var TableStyle = require('../style/table')

var Table = module.exports = function(style, opts) {
  Table.super_.call(this, require('../pdf/node/table'))

  this.style    = new TableStyle(style, opts)
  this.children = []

  this.beforeBreakChildren = []
}

require('../pdf/utils').inherits(Table, require('./base'))

var Row = require('./row')
Table.prototype.tr = function(opts) {
  var tr = new Row(this.style.merge(TableStyle.reset, opts))
  this.children.push(tr)
  return tr
}

Table.prototype.beforeBreak = function(fnOrOpts, opts) {
  if (typeof fnOrOpts === 'function') {
    fnOrOpts.opts = this.style.merge(TableStyle.reset, opts)
    this.beforeBreakChildren.push(fnOrOpts)
  } else {
    var tr = new Row(this.style.merge(TableStyle.reset, fnOrOpts))
    this.beforeBreakChildren.push(tr)
    return tr
  }
}

},{"../pdf/node/table":31,"../pdf/utils":56,"../style/table":62,"./base":1,"./row":12}],14:[function(require,module,exports){
'use strict'

var TextStyle = require('../style/text')

var Text = module.exports = function(text, style, opts) {
  Text.super_.call(this, require('../pdf/node/text'))

  this.style    = new TextStyle(style, opts)
  this.children = []

  if (text !== undefined && text !== null) {
    this.add(text)
  }
}

require('../pdf/utils').inherits(Text, require('./base'))

var LineBreaker = require('linebreak')
var Word        = require('./word')
var LineBreak   = require('./linebreak')
var PageNumber  = require('./page-number')
var PageCount   = require('./page-count')

Text.prototype.add = function(str, opts, append) {
  var style     = this.style.merge(opts)
  var lastChild = this.children[this.children.length - 1]
  var appendTo  = append && lastChild && lastChild.children ? lastChild : this

  if (str instanceof Word) {
    appendTo.children.push(str)
    return this
  }

  str = String(str)

  var breaker = new LineBreaker(str)
  var last = 0, bk

  while ((bk = breaker.nextBreak())) {
    // get the string between the last break and this one
    var word = str.slice(last, bk.position)
    last = bk.position

    var linebreaks = 0
    while (!bk.required && word.match(/(\r\n|\n|\r)$/)) {
      word = word.replace(/(\r\n|\n|\r)$/, '')
      linebreaks++
    }

    // remove trailing whitespaces if white-space style is set to normal
    if (style.whiteSpace === 'normal') {
      word = word.replace(/^\s+/, '').replace(/\s+$/, '')
    }

    // remove newline characters
    if (bk.required) {
      word = word.replace(/(\r\n|\n|\r)/, '')
    }

    if (word.length) {
      appendTo.children.push(new Word(word, style))
    }

    appendTo = this

    // add linebreak
    if (bk.required) {
      this.children.push(new LineBreak(style))
    }

    // add trailing line breaks
    for (var i = 0; i < linebreaks; ++i) {
      this.children.push(new LineBreak(style))
    }
  }

  return this
}

Text.prototype.line = function(str, opts) {
  return this.add(str + '\n', opts)
}

Text.prototype.append = function(str, opts) {
  return this.add(str, opts, true)
}

Text.prototype.br = function() {
  this.children.push(new LineBreak(this.style))
  return this
}

Text.prototype.pageNumber = function(opts, append) {
  return this.add(new PageNumber(this.style.merge(opts)), opts, append)
}

Text.prototype.appendPageNumber = function(opts) {
  return this.pageNumber(opts, true)
}

Text.prototype.pageCount = function(opts, append) {
  return this.add(new PageCount(this.style.merge(opts)), opts, append)
}

Text.prototype.appendPageCount = function(opts) {
  return this.pageCount(opts, true)
}

},{"../pdf/node/text":32,"../pdf/utils":56,"../style/text":63,"./base":1,"./linebreak":8,"./page-count":10,"./page-number":11,"./word":15,"linebreak":73}],15:[function(require,module,exports){
'use strict'

var unorm = require('unorm')

var Word = module.exports = function(word, style) {
  Word.super_.call(this, require('../pdf/node/word'))

  if (!style.font) {
    throw new TypeError('Text must have a font set or inherited')
  }

  this.word     = unorm.nfc(word)
  this.style    = style
  this.children = [this]
}

require('../pdf/utils').inherits(Word, require('./base'))

Object.defineProperties(Word.prototype, {
  width: {
    enumerable: true,
    get: function() {
      var width = this.children.map(function(word) {
        return this.style.font.stringWidth(word.word, word.style.fontSize)
      }, this).reduce(function(lhs, rhs) {
        return lhs + rhs
      }, 0)

      return width
    }
  },

  height: {
    enumerable: true,
    get: function() {
      var height = Math.max.apply(Math, this.children.map(function(word) {
        return word.style.font.lineHeight(word.style.fontSize, true) * word.style.lineHeight
      }, this))

      return height
    }
  },

  spacing: {
    enumerable: true,
    get: function() {
      var last = this.children[this.children.length - 1]
      var spacing = last.style.font.stringWidth(' ', last.style.fontSize)

      return spacing
    }
  }
})

Word.prototype.toString = function() {
  return this.children.map(function(word) {
    return word.word
  }, this).reduce(function(lhs, rhs) {
    return lhs + rhs
  }, '')
}

},{"../pdf/node/word":33,"../pdf/utils":56,"./base":1,"unorm":97}],16:[function(require,module,exports){
'use strict'

var utils = require('./pdf/utils')
var uuid  = require('node-uuid')

module.exports = function(src) {
  this.uuid = uuid.v4()
  this.src  = utils.toArrayBuffer(src)

  this.type = parseType(this.src)

  switch (this.type) {
    case 'jpeg':
      this.info = parseJpegInfo(this.src)
      this.width = this.info.width
      this.height = this.info.height

      switch (this.info.colorSpace) {
      case 3:
        this.colorSpace = 'DeviceRGB'
        break
      case 1:
        this.colorSpace = 'DeviceGRAY'
        break
      default:
        break
      }
      break
    case 'pdf':
      this.info = parsePDFInfo(this.src)
      break
  }
}

function parseType(buffer) {
  var pdf = String.fromCharCode.apply(null, new Uint8Array(buffer, 0, 5))
  if (pdf === '%PDF-') {
    return 'pdf'
  }

  var view = new DataView(buffer)
  if (view.getUint8(0) === 0xff || view.getUint8(1) === 0xd8) {
    return 'jpeg'
  }

  throw new TypeError('Unsupported image type')
}

function parseJpegInfo(buffer) {
  var view = new DataView(buffer)
  if (view.getUint8(0) !== 0xff || view.getUint8(1) !== 0xd8) {
    throw new Error('Invalid JPEG image.')
  }

  var blockLength = view.getUint8(4) * 256 + view.getUint8(5)
  var i = 4, len = view.byteLength

  while ( i < len ) {
    i += blockLength

    if (view.getUint8(i) !== 0xff) {
      throw new Error('Could not read JPEG the image size')
    }

    if (
      view.getUint8(i + 1) === 0xc0 || //(SOF) Huffman  - Baseline DCT
      view.getUint8(i + 1) === 0xc1 || //(SOF) Huffman  - Extended sequential DCT
      view.getUint8(i + 1) === 0xc2 || // Progressive DCT (SOF2)
      view.getUint8(i + 1) === 0xc3 || // Spatial (sequential) lossless (SOF3)
      view.getUint8(i + 1) === 0xc4 || // Differential sequential DCT (SOF5)
      view.getUint8(i + 1) === 0xc5 || // Differential progressive DCT (SOF6)
      view.getUint8(i + 1) === 0xc6 || // Differential spatial (SOF7)
      view.getUint8(i + 1) === 0xc7
    ) {
      return {
        height: view.getUint8(i + 5) * 256 + view.getUint8(i + 6),
        width: view.getUint8(i + 7) * 256 + view.getUint8(i + 8),
        colorSpace: view.getUint8(i + 9)
      }
    } else {
      i += 2
      blockLength = view.getUint8(i) * 256 + view.getUint8(i + 1)
    }
  }
}

var Parser = require('./pdf/parser/document')

function parsePDFInfo(buffer) {
  var parser = new Parser(buffer)
  parser.parse()

  var catalog  = parser.trailer.get('Root').object.properties
  var pages    = catalog.get('Pages').object.properties
  var first    = pages.get('Kids')[0].object.properties
  var mediaBox = first.get('MediaBox') || pages.get('MediaBox')

  return {
    page:     first,
    width:    mediaBox[2],
    height:   mediaBox[3]
  }
}

},{"./pdf/parser/document":53,"./pdf/utils":56,"node-uuid":75}],17:[function(require,module,exports){
'use strict'

var Page = function(nr, header, footer, afterBreak) {
  this.nr         = nr
  this.header     = header
  this.footer     = footer
  this.afterBreak = afterBreak

  this.top = this.bottom = 0
}

Page.prototype.setup = function(cursor) {
  var style = cursor.style
  var top = this.top = cursor.y = style.height - style.paddingTop

  cursor.y -= cursor.offset || 0
  var y = cursor.y

  var x = cursor.x
  cursor.x = style.paddingLeft

  var shift = style.paddingTop

  if (this.header) {
    this.header.compute(cursor)
    this.top -= this.header.height
    shift += this.header.height
  }

  if (this.afterBreak && this.afterBreak.length) {
    this.afterBreak.forEach(function(node) {
      node.compute(cursor)
      this.top -= node.height
      shift += node.height
    }, this)
  }

  if (this.nr > 1) {
    if (this.header) {
      this.header.shift(shift * -1)
    }

    if (this.afterBreak && this.afterBreak.length) {
      this.afterBreak.forEach(function(node) {
        node.shift(shift * -1)
      }, this)
    }
  }

  this.bottom = style.paddingBottom
  if (this.footer) {
    cursor.y = y
    cursor.x = style.paddingLeft

    this.footer.compute(cursor)
    this.bottom += this.footer.height

    var offset = top - this.bottom
    if (this.nr > 1) {
      offset += shift * -1
    }
    this.footer.shift(offset)
  }

  cursor.x = x
}

var CursorFactory = module.exports = function(doc) {
  this.doc         = doc
  this.style       = doc.style
  this.header      = doc.doc._header
  this.footer      = doc.doc._footer
  this.afterBreak  = []

  this.innerWidth  = this.style.width - this.style.paddingLeft - this.style.paddingRight

  this.currentPage = 1
  this.pages       = []
  this.pageBreaks  = []
  this.addPage()

  this.nextPageBreakId  = 1
  this.validBreaks = Object.create(null)

  this.reset()
  this.force = true

  this.x = this.style.paddingLeft
  this.y = this.top
}

Object.defineProperties(CursorFactory.prototype, {
  top: {
    enumerable: true,
    get: function() {
      return this.pages[this.currentPage - 1].top
    }
  },
  bottom: {
    enumerable: true,
    get: function() { return this.pages[this.currentPage - 1].bottom }
  }
})

CursorFactory.prototype.create = function(w) {
  if (!w) {
    w = this.innerWidth
  }

  var self = this

  return {
    get style() {
      return self.style
    },
    get width() {
      return w
    },
    get x() {
      return self.x
    },
    set x(val) {
      self.x = val
    },
    get y() {
      return self.y
    },
    set y(val) {
      self.y = val
    },
    get bottom() {
      return self.bottom
    },
    get right() {
      return self.style.width - self.style.paddingRight
    },
    get pageHeight() {
      return self.top - self.bottom
    },
    get force() {
      return self.force
    },
    set force(val) {
      self.force = val
    },
    get currentPage() {
      return self.currentPage
    },
    get pageCount() {
      return self.pages.length
    },
    get offset() {
      return self.offset
    },
    set offset(val) {
      self.offset = val
    },
    setPage: function(page) {
      if (page < 1) {
        return 1
      }
      return self.currentPage = page
    },
    mustBreak: function(node) {
      if (node.allowBreak) {
        return false
      }

      var offset = self.offset
      var mustBreak = (node.y - node.height) + offset < self.bottom
      if (!mustBreak) {
        return false
      }

      if (node.height > this.pageHeight) {
        return false
      }

      return true
    },
    create: function(narrow) {
      return self.create(narrow || w)
    },
    reset: this.reset.bind(this),
    pageBreak: this.pageBreak.bind(this),
    applyBreak: this.applyBreak.bind(this),
    beforeContent: function(node) {
      if (node.afterBreak) {
        self.afterBreak.push(node.afterBreak)
      }

      var cursor = node.beforeContent(this)
      return cursor
    },
    afterContent: function(node) {
      if (node.afterBreak) {
        self.afterBreak.pop()
      }

      node.afterContent(this)
    }
  }
}

CursorFactory.prototype.reset = function() {
  this.force  = false
  this.y      = this.style.height
  this.offset = 0

  this.currentPage = 1
  this.visitedBreaks = Object.create(null)
  this.highestVisitedBreak = 0
}

CursorFactory.prototype.addPage = function() {
  var page = new Page(
    this.currentPage,
    this.header && this.header.createNode(),
    this.footer && this.footer.createNode(),
    (this.afterBreak[this.afterBreak.length - 1] || []).map(function(child) {
      return child.clone()
    })
  )

  this.pages.push(page)

  page.setup(this.create())

  if (this.currentPage > 1) {
    var offset = this.top - this.style.height
    this.offset += offset
    this.pageBreaks[this.currentPage - 1].offset += offset
  }

  this.doc.headers[this.currentPage] = page.header
  this.doc.footers[this.currentPage] = page.footer
  this.doc.afterBreaks[this.currentPage] = page.afterBreak
}

CursorFactory.prototype.applyBreak = function(pageBreak) {
  this.offset += pageBreak.offset
  this.currentPage++
}

CursorFactory.prototype.pageBreak = function(pageBreak, parent, idx) {
  if (!pageBreak) {

    var offset = this.style.height - this.y - this.offset
    this.offset += offset

    if (this.currentPage in this.pageBreaks && this.visitedBreaks[this.pageBreaks[this.currentPage].id] === true) {
      pageBreak = this.pageBreaks[this.currentPage]
    } else {
      pageBreak = new parent.PageBreakType(this.nextPageBreakId++, offset, parent, idx)
      pageBreak.page = this.currentPage
      this.pageBreaks[this.currentPage] = pageBreak
      this.validBreaks[pageBreak.id] = true
    }

    if (++this.currentPage > this.pages.length) {
      this.addPage()
    }
  } else {
    var isValid = this.validBreaks[pageBreak.id] === true
    var isVisited = this.visitedBreaks[pageBreak.id] === true
    var possibleInvalid = this.highestVisitedBreak > pageBreak.id
    if (!isValid || (!isVisited && possibleInvalid)) {
      this.validBreaks = this.visitedBreaks
      delete this.pageBreaks[this.currentPage]
      return null
    }

    this.visitedBreaks[pageBreak.id] = true
    this.highestVisitedBreak = Math.max(this.highestVisitedBreak, pageBreak.id)
  }

  return pageBreak
}

},{}],18:[function(require,module,exports){
'use strict'

var PDFObject  = require('./object/object')
var PDFXObject = require('./object/xobject')
var Pages      = require('./object/pages')
var Page       = require('./object/page')
var uuid       = require('node-uuid')
var debug      = require('debug')('pdfjs')

var version = require('../../package.json').version

var PDF = module.exports = function PDF(doc) {
  this.doc = doc

  this.version = 1.3

  this.info = {
    id:           uuid.v4(),
    producer:     'pdfjs v' + version + ' (github.com/rkusa/pdfjs)',
    creationDate: null
  }

  this.offset = 0
}

PDF.prototype.addObject = function(object) {
  this.objects.push(object)
}

PDF.prototype.createObject = function(type) {
  var object = new PDFObject()
  if (type) object.addProperty('Type', type)
  this.addObject(object)
  return object
}

PDF.prototype.createXObject = function(subtype) {
  var xobject = new PDFXObject()
  if (subtype) xobject.addProperty('Subtype', subtype)
  this.addObject(xobject)
  return xobject
}

// PDF.prototype.createImage = function(data) {
//   var image = new Image('Im' + (this.images.length + 1), data)
//   this.images.push(image)
//   this.addObject(image.xobject)
//   return image
// }

PDF.prototype.createPage = function() {
  var pages = this.pages.pages
  var index = pages.indexOf(this.currentPage)

  if (index + 1 < pages.length) {
    return this.currentPage = pages[index + 1]
  } else {
    var page = this.currentPage = new Page(this.pages)

    this.pages.add(page)

    return page
  }
}

PDF.prototype.Tm = function(a, b, c, d, e, f) {
  this.write(a, b, c, d, e, f + this.offset, 'Tm')
}

PDF.prototype.Tj = function(str) {
  this.write(str, 'Tj')
}

PDF.prototype.Td = function(x, y) {
  this.write(x, y, 'Td')
}

PDF.prototype.Tf = function(font, size) {
  this.write(font, size, 'Tf')
}

PDF.prototype.rg = function(r, g, b) {
  this.write(r, g, b, 'rg')
}

PDF.prototype.RG = function(r, g, b) {
  this.write(r, g, b, 'RG')
}

PDF.prototype.BT = function() {
  this.write('BT')
}

PDF.prototype.ET = function() {
  this.write('ET')
}

PDF.prototype.re = function(x, y, width, height) {
  this.write(x, y + this.offset, width, height, 're')
}

PDF.prototype.rectangle = function(x, y, width, height) {
  y += this.offset

  var top = this.doc.style.height - this.doc.style.paddingTop

  if (y < this.doc.style.paddingBottom) {
    var delta = this.doc.style.paddingBottom - y
    y = this.doc.style.paddingBottom
    height -= delta
  } else if (y + height > top) {
    height -= (y + height) - top
  }

  if (height > this.doc.style.innerHeight) {
    height = this.doc.style.innerHeight
  }

  this.re(x, y - this.offset, width, height, 're')
}

PDF.prototype.f = function() {
  this.write('f')
}

PDF.prototype.w = function(lineWidth) {
  this.write(lineWidth, 'w')
}

PDF.prototype.S = function() {
  var path = Array.prototype.slice.call(arguments)
  for (var i = 0, len = path.length; i < len; ++i) {
    // every second (1, because we start at 0)
    if (i % 3 === 1) {
      path[i] += this.offset
    }
  }

  this.write.apply(this, path.concat('S'))
}

PDF.prototype.line = function(x1, y1, x2, y2) {
  y1 += this.offset
  y2 += this.offset

  var top = this.doc.style.height - this.doc.style.paddingTop
  var bottom = this.doc.style.paddingBottom
  var left = this.doc.style.paddingLeft
  var right = this.doc.style.width - this.doc.style.paddingRight

  if ((y1 > top && y2 > top) || (y1 < bottom && y2 < bottom) || (x1 < left && x2 < left) || (x1 > right && x2 > right)) {
    return
  }

  // top
  var topIntersection = intersect(x1, y1, x2, y2, left, top, right, top)
  if (topIntersection) {
    if (y1 > top) {
      x1 = topIntersection[0]
      y1 = topIntersection[1]
    } else if(y2 > top) {
      x2 = topIntersection[0]
      y2 = topIntersection[1]
    }
  }

  // // left
  var leftIntersection = intersect(x1, y1, x2, y2, left, top, left, bottom)
  if (leftIntersection) {
    if (x1 < left) {
      x1 = leftIntersection[0]
      y1 = leftIntersection[1]
    } else if (x2 < left) {
      x2 = leftIntersection[0]
      y2 = leftIntersection[1]
    }
  }

  // right
  var rightIntersection = intersect(x1, y1, x2, y2, right, top, right, bottom)
  if (rightIntersection) {
    if (x1 > right) {
      x1 = rightIntersection[0]
      y1 = rightIntersection[1]
    } else if (x2 > right) {
      x2 = rightIntersection[0]
      y2 = rightIntersection[1]
    }
  }

  // bottom
  var bottomIntersection = intersect(x1, y1, x2, y2, left, bottom, right, bottom)
  if (bottomIntersection) {
    if (y1 < bottom) {
      x1 = bottomIntersection[0]
      y1 = bottomIntersection[1]
    } else if (y2 < bottom) {
      x2 = bottomIntersection[0]
      y2 = bottomIntersection[1]
    }
  }

  this.S(x1, y1 - this.offset, 'm', x2, y2 - this.offset, 'l')
}

// save graphics state
PDF.prototype.q = function() {
  this.write('q')
}

PDF.prototype.cm = function(a, b, c, d, e, f) {
  this.write(a, b, c, d, e, f + this.offset, 'cm')
}

// paint image
PDF.prototype.Do = function(name) {
  this.write(name, 'Do')
}

// restore graphics state
PDF.prototype.Q = function() {
  this.write('Q')
}

function toFixed(num, precision) {
  if (isNaN(num)) {
    var stack = (new Error).stack.split('\n')
    stack.splice(0, 5)
    stack = stack.join('\n')
    console.warn("Writing NaN - there probably went something wrong.\nPlease report this issue to http://github.com/rkusa/pdfjs/issues\nStack Trace:\n" + stack)
  }
  return (+(Math.floor(+(num + 'e' + precision)) + 'e' + -precision)).toFixed(precision)
}

PDF.prototype.write = function() {
  var line = Array.prototype.slice.call(arguments).map(function(arg) {
    return typeof arg === 'number' ? toFixed(arg, this.doc.style.precision) : arg
  }, this).join(' ')
  this.currentPage.contents.writeLine(line)
}

var CursorFactory = require('./cursor')

PDF.prototype._compute = function() {
  var cursorFactory = new CursorFactory(this.doc)
  var cursor = cursorFactory.create()

  this.doc.compute(cursor)
  cursor.reset()

  var iteration = 0
  var threshold = this.doc.style.threshold

  while (!this.doc.arrange(cursor)) {
    debug('------- Computation Iteration %d -------', iteration)
    cursor.reset()
    this.doc.compute(cursor)
    cursor.reset()

    if (++iteration >= threshold) {
      throw new Error('Endless rendering?')
    }
  }
}

PDF.prototype._build = function(ast, parent) {
  if (hasFunction(ast, 'begin')) {
    ast.begin(this, parent)
  }

  if (hasFunction(ast, 'render')) {
    ast.render(this, parent)
  }

  if (hasChildren(ast)) {
    if (ast.direction === 'leftRight') {
      var rowPage = this.currentPage
      var rowOffset = this.offset
      var endOffset = this.offset
    }

    ast.children.forEach(function(child) {
      this._build(child, { parent: parent, node: ast })

      if (ast.direction === 'leftRight') {
        endOffset = Math.max(endOffset, this.offset)
        this.currentPage = rowPage
        this.offset = rowOffset
      }
    }, this)

    if (ast.direction === 'leftRight') {
      this.currentPage = this.pages.pages[this.pages.pages.length - 1]
      this.offset = endOffset
    }
  }

  if (hasFunction(ast, 'end')) {
    ast.end(this, parent)
  }
}

var PDFXref       = require('./object/xref')
var PDFTrailer    = require('./object/trailer')

PDF.prototype.build = function() {
  this.objects = []

  // node to object mapping
  this.mapping = Object.create(null)

  // list of all fonts in this document
  this.fonts   = []

  // list of all images in this document
  this.images  = []

  // the catalog and pages tree
  this.pages = new Pages(this.doc.style.width, this.doc.style.height)
  this.createPage()

  this.catalog = this.createObject('Catalog')
  this.catalog.prop('Pages', this.pages.toReference())

  this._compute()
  this._build(this.doc, null)

  this.pages.embed(this)

  // this.pagebreak()
  // this.render(this.cursor)
  this.fonts.forEach(function(font) {
    font.embed(this)
  }, this)
  this.images.forEach(function(image) {
    image.embed(this)
  }, this)

  this.objects.forEach(function(obj, i) {
    obj.id = i + 1
  })

  var buf  = ''

  // header
  buf += '%PDF-' + this.version.toString() + '\n'

  // The PDF format mandates that we add at least 4 commented binary characters
  // (ASCII value >= 128), so that generic tools have a chance to detect
  // that it's a binary file
  buf += '%\xFF\xFF\xFF\xFF\n\n'

  // body
  var xref = new PDFXref
  this.objects.forEach(function(object) {
    xref.add(object.id, buf.length, object)
    buf += object.toString() + '\n\n'
  })

  // to support random access to individual objects, a PDF file
  // contains a cross-reference table that can be used to locate
  // and directly access pages and other important objects within the file
  var startxref = buf.length
  buf += xref.toString()

  // trailer
  var trailer = new PDFTrailer(this.objects.length + 1, this.catalog, this.info)
  buf += trailer.toString() + '\n'

  // startxref
  buf += 'startxref\n'
  buf += startxref + '\n'
  buf += '%%EOF'

  return buf
}

PDF.prototype.toString = function() {
  return this.build()
}

var base64 = require('base-64')
PDF.prototype.toBase64 = function() {
  return base64.encode(this.build())
}

PDF.prototype.toDataURL = function() {
  return 'data:application/pdf;base64,' + this.toBase64()
}


function hasFunction(obj, name) {
  return typeof obj[name] === 'function'
}

function hasChildren(obj) {
  return obj.children && Array.isArray(obj.children)
}

function intersect(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
  var s1x = p1x - p0x
  var s1y = p1y - p0y
  var s2x = p3x - p2x
  var s2y = p3y - p2y

  var s = (-s1y * (p0x - p2x) + s1x * (p0y - p2y)) / (-s2x * s1y + s1x * s2y)
  var t = ( s2x * (p0y - p2y) - s2y * (p0x - p2x)) / (-s2x * s1y + s1x * s2y)

  if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
    // Collision detected
    var intX = p0x + (t * s1x)
    var intY = p0y + (t * s1y)
    return [intX, intY]
  }

  return null // No collision
}

},{"../../package.json":98,"./cursor":17,"./object/object":43,"./object/page":44,"./object/pages":45,"./object/trailer":49,"./object/xobject":51,"./object/xref":52,"base-64":64,"debug":66,"node-uuid":75}],19:[function(require,module,exports){
'use strict'

var debug = require('debug')('pdfjs:break')

var BaseNode = module.exports = function() {
  this.type = 'BaseNode'
  this.allowBreak = false
  this.PageBreakType = require('./pagebreak')
  this.direction = 'topDown'
  this.page = 0
  this.computed = false
  this.arranged = false
}

BaseNode.prototype.mustUpdate = function(/* cursor */) {
  return false
}

BaseNode.prototype.beforeContent = function(cursor) {
  return cursor
}

BaseNode.prototype.afterContent = function(cursor) {
  return cursor
}

BaseNode.prototype._compute = function(cursor) {
  this.x = cursor.x
  this.y = cursor.y

  this.width  = 0
  this.height = 0
}

BaseNode.prototype.compute = function(cursor) {
  cursor.setPage(this.page)

  var must = this.mustUpdate(cursor) || !this.computed || cursor.force

  if (must) {
    this._compute(cursor)
    this.computed = true
    this.arranged = false
    cursor.force = true
  }

  cursor = this.beforeContent(cursor)

  if ('children' in this) {
    this.children.forEach(function(child) {
      child.compute(cursor)
    })
  }

  this.afterContent(cursor)
}

BaseNode.prototype.shift = function(offset) {
  this.y -= offset

  if (this.children) {
    this.children.forEach(function(child) {
      child.shift(offset)
    })
  }
}

BaseNode.prototype.arrange = function(cursor) {
  var must = !this.arranged || cursor.force


  this.page = cursor.currentPage

  if (must) {
    this.arranged = true
    cursor.force = true
  }

  cursor = cursor.beforeContent(this)

  if ('children' in this) {

    if (this.direction === 'leftRight') {
      var rowPage = cursor.currentPage
      var endPage = cursor.currentPage
      var rowOffset = cursor.offset
      var endOffset = cursor.offset
      var rowY = cursor.y
      var endY = cursor.y
    }

    var idx = -1 // the index without page break nodes
    for (var i = 0; i < this.children.length; ++i) {
      var child = this.children[i]

      if (child.type === 'PageBreakNode') {
        if (cursor.pageBreak(child, this, idx) === null) {
          debug('INVALIDATE %d', child.id)
          this.children.splice(i, 1)
          --i
        } else {
          debug('VALID break %d', child.id)
          if (child.height && cursor.y - child.height < cursor.bottom - cursor.offset) {
            debug('FORCE BREAK %s (%d height)', child.type, child.height)

            child.offset -= child.height

            if (i === 0) {
              child.children.length = 0
            } else {
              child.update(idx)

              this.children.splice(i, 1)
              this.children.splice(i - 1, 0, child)
            }

            return false
          }

          cursor.applyBreak(child)
        }

        continue
      }

      idx++

      if (cursor.mustBreak(child)) {
        debug('BREAK %s at Page %d', child.type, cursor.currentPage)

        // page break
        this.children.splice(i, 0, cursor.pageBreak(null, this, idx))
        child.page = cursor.currentPage

        return false
      }

      if (!child.arrange(cursor)) {
        return false
      }

      if (this.direction === 'leftRight') {
        endPage = Math.max(endPage, cursor.currentPage)
        endOffset = Math.max(endOffset, cursor.offset)
        endY = Math.min(endY, cursor.y)
        cursor.setPage(rowPage)
        cursor.offset = rowOffset
        cursor.y = rowY
      }
    }

    if (this.direction === 'leftRight') {
      cursor.setPage(endPage)
      cursor.offset = endOffset
      cursor.y = endY
    }
  }

  cursor.afterContent(this)

  return true
}

},{"./pagebreak":28,"debug":66}],20:[function(require,module,exports){
'use strict'

var utils = require('../utils')

var BoxNode = module.exports = function(box) {
  BoxNode.super_.call(this)

  this.type = 'BoxNode'
  this.allowBreak = false

  this.box       = box
  this.style     = box.style
  this.children  = this.box.children.map(function(child) {
    return child.createNode()
  })
}

utils.inherits(BoxNode, require('./base'))

Object.defineProperties(BoxNode.prototype, {
  height: {
    enumerable: true,
    configurable: true,
    get: function() {
      var height = this.children
          .map(function(child) { return child.height })
          .reduce(function(lhs, rhs) { return lhs + rhs }, 0)
        + this.style.getBorderTopWidth() + this.style.paddingTop
        + this.style.paddingBottom + this.style.getBorderBottomWidth()

      return height < this.style.minHeight ? this.style.minHeight : height
    }
  },
  beforeBreakHeight: {
    enumerable: true,
    configurable: true,
    get: function() {
      return this.style.paddingBottom + this.style.getBorderBottomWidth()
    }
  }
})

BoxNode.prototype.beforeContent = function(cursor) {
  var top = this.style.getBorderTopWidth() + this.style.paddingTop
  if (top > 0) {
    cursor.y -= top
  }

  this.xBefore = cursor.x
  if (this.style.x !== null && this.style.x !== undefined) {
    cursor.x = this.style.x
  }

  var left = this.style.getBorderLeftWidth() + this.style.paddingLeft
  if (left > 0) {
    cursor.x += left
  }

  return cursor.create(this.width)
}

BoxNode.prototype.afterContent = function(cursor) {
  var bottom = this.style.getBorderBottomWidth() + this.style.paddingBottom
  if (bottom > 0) {
    cursor.y -= bottom
  }

  cursor.x = this.xBefore
  cursor.y = this.y - this.height

  return cursor
}

BoxNode.prototype._compute = function(cursor) {
  this.x = this.style.x !== null ? this.style.x : cursor.x
  this.y = cursor.y = this.style.y !== null ? this.style.y : cursor.y

  var maxWidth = cursor.width
  if (this.x + maxWidth > cursor.right) {
    maxWidth = cursor.right - this.x
  }

  this.width = utils.resolveWidth(this.style.width, maxWidth)
             - this.style.paddingLeft - this.style.getBorderLeftWidth()
             - this.style.paddingRight - this.style.getBorderRightWidth()
}

BoxNode.prototype.begin = function(doc, parent) {
  var height = this.height
  var width  = this.style.getBorderLeftWidth() + this.style.paddingLeft + this.width + this.style.paddingRight + this.style.getBorderRightWidth()
  var left   = this.x + (this.style.getBorderLeftWidth() / 2)
  var top    = this.y - (this.style.getBorderTopWidth() / 2)
  var right  = this.x + width - (this.style.getBorderRightWidth() / 2)
  var bottom = this.y - height + (this.style.getBorderBottomWidth() / 2)

  // backogrund color
  if (this.style.backgroundColor !== null) {
    drawBackground(doc, left - (this.style.getBorderLeftWidth() / 2),
                        bottom - (this.style.getBorderBottomWidth() / 2),
                        width, height,
                        this.style.backgroundColor)
  }

  // border top
  if (this.style.getBorderTopWidth() > 0) {
    drawLine(doc, this.style.getBorderTopWidth(),
                  [left - (this.style.getBorderLeftWidth() / 2), top],
                  [right + (this.style.getBorderRightWidth() / 2), top],
                  this.style.getBorderTopColor())
  }


  // border right
  if (this.style.getBorderRightWidth() > 0) {
    drawLine(doc, this.style.getBorderRightWidth(),
                  [right, top + (this.style.getBorderTopWidth() / 2)],
                  [right, bottom - (this.style.getBorderBottomWidth() / 2)],
                  this.style.getBorderRightColor())
  }

  // border bottom
  if (this.style.getBorderBottomWidth() > 0) {
    drawLine(doc, this.style.getBorderBottomWidth(),
                  [right + (this.style.getBorderRightWidth() / 2), bottom],
                  [left - (this.style.getBorderLeftWidth() / 2), bottom],
                  this.style.getBorderBottomColor())
  }

  // border left
  if (this.style.getBorderLeftWidth() > 0) {
    drawLine(doc, this.style.getBorderLeftWidth(),
                  [left, bottom - (this.style.getBorderBottomWidth() / 2)],
                  [left, top + (this.style.getBorderTopWidth() / 2)],
                  this.style.getBorderLeftColor())
  }
}

function drawLine(doc, lineWidth, from, to, color) {
  doc.RG.apply(doc, utils.colorToRgb(color || 0x000000))
  doc.w(lineWidth)
  doc.line(from[0], from[1], to[0], to[1])
}

function drawBackground(doc, x, y, width, height, color) {
  doc.rg.apply(doc, utils.colorToRgb(color || 0x000000))
  doc.rectangle(x, y, width, height)
  doc.f()
}

},{"../utils":56,"./base":19}],21:[function(require,module,exports){
'use strict'

var utils = require('../utils')
var BoxNode = require('./box')

var CellNode = module.exports = function(cell) {
  CellNode.super_.call(this, cell)

  this.type = 'CellNode'
  this.allowBreak = cell.style.allowBreak !== null
        ? cell.style.allowBreak
        : this.allowBreak

  this.cell = cell
}

utils.inherits(CellNode, BoxNode)

Object.defineProperties(CellNode.prototype, {
  minHeight: {
    enumerable: true,
    get: function() {
      return Math.max(
        this.style.height || 0,
        this.children.map(function(child) { return child.height })
                     .reduce(function(lhs, rhs) { return lhs + rhs }, 0)
      )
    }
  },
  height: {
    enumerable: true,
    value: 0,
    writable: true
  }
})

CellNode.prototype.clone = function() {
  var clone = new CellNode(this.cell)
  clone.style = this.style
  return clone
}

CellNode.prototype.mustUpdate = function(cursor) {
  for (var i = 0, len = this.children.length; i < len; ++i) {
    if (this.children[i].mustUpdate(cursor)) {
      return true
    }
  }

  return false
}

CellNode.prototype.beforeContent = function(cursor) {
  cursor.x = this.x
  cursor.y = this.y

  return BoxNode.prototype.beforeContent.call(this, cursor)
}

CellNode.prototype._compute = function(cursor) {
  // this.x = cursor.x
  // this.y = cursor.y

  // this.width = resolveWidth(this.style.width, cursor.width)
  //            - this.style.paddingLeft - this.style.getBorderLeftWidth()
  //            - this.style.paddingRight - this.style.getBorderRightWidth()
}

},{"../utils":56,"./box":20}],22:[function(require,module,exports){
'use strict'

var DocumentNode = module.exports = function(doc) {
  DocumentNode.super_.call(this)

  this.type = 'DocumentNode'
  this.allowBreak = true

  this.doc      = doc
  this.style    = doc.style

  this.children = this.doc.children.map(function(child) {
    return child.createNode(this)
  }, this)

  this.headers     = []
  this.footers     = []
  this.afterBreaks = []
}

require('../utils').inherits(DocumentNode, require('./base'))

DocumentNode.prototype.begin = function(doc, parent) {
  var currentPage = doc.pages.kids.length
  var header = this.headers[currentPage]
  if (header) {
    doc._build(header, { parent: parent, node: this })
  }

  var afterBreak = this.afterBreaks[currentPage]
  if (afterBreak) {
    afterBreak.forEach(function(child) {
      doc._build(child, { parent: parent, node: this })
    }, this)
  }
}

DocumentNode.prototype.end = function(doc, parent) {
  var currentPage = doc.pages.kids.length
  var footer = this.footers[currentPage]
  if (footer) {
    doc._build(footer, { parent: parent, node: this })
  }
}

},{"../utils":56,"./base":19}],23:[function(require,module,exports){
'use strict'

var utils = require('../utils')
var PDFImage = require('../object/image')
var PDFFormXObject = require('../object/formxobject')

var ImageNode = module.exports = function(image) {
  ImageNode.super_.call(this)

  this.type = 'ImageNode'

  this.image  = image
  this.style  = image.style
  this.type   = this.image.img.type
  this.info   = this.image.img.info
}

require('../utils').inherits(ImageNode, require('./base'))

ImageNode.prototype._compute = function(cursor) {
  this.x = cursor.x
  this.y = cursor.y

  this.renderWidth = this.info.width
  this.renderHeight = this.info.height

  switch (this.type) {
    case 'jpeg':
      switch (this.info.colorSpace) {
      case 3:
        this.colorSpace = 'DeviceRGB'
        break
      case 1:
        this.colorSpace = 'DeviceGRAY'
        break
      default:
        break
      }
      break
    case 'pdf':
      break
  }

  if (this.style.width && this.style.height) {
    this.renderWidth  = this.style.width
    this.renderHeight = this.style.height
  } else if(this.style.width) {
    this.renderWidth  = this.style.width
    this.renderHeight = this.info.height * (this.style.width / this.info.width)
  } else if (this.style.height) {
    this.renderHeight = this.style.height
    this.renderWidth  = this.info.width * (this.style.height / this.info.height)
  } else {
    this.renderWidth  = Math.min(this.info.width, cursor.width)
    this.renderHeight = this.info.height * (this.renderWidth / this.info.width)

    if (this.renderHeight > cursor.pageHeight) {
      this.renderHeight = cursor.pageHeight
      this.renderWidth  = this.info.width * (this.renderHeight / this.info.height)
    }
  }

  if (this.style.maxWidth) {
    var maxWidth = utils.resolveWidth(this.style.maxWidth, cursor.width)
    if (this.renderWidth > maxWidth) {
      this.renderHeight = this.renderHeight * (maxWidth / this.renderWidth)
      this.renderWidth  = maxWidth
    }
  }

  switch (this.style.align) {
    case 'right':
      this.x += cursor.width - this.renderWidth
      break
    case 'center':
      this.x += (cursor.width - this.renderWidth) / 2
      break
    case 'left':
    default:
      break
  }

  if (this.style.wrap) {
    this.width  = this.renderWidth
    this.height = this.renderHeight
  } else {
    this.width  = 0
    this.height = 0
  }
}

ImageNode.prototype.beforeContent = function(cursor) {
  if (this.style.wrap) {
    cursor.y -= this.renderHeight
  }

  return cursor
}

ImageNode.prototype.render = function(doc) {
  var image = doc.mapping[this.image.uuid]
  if (!image) {
    switch (this.type) {
      case 'jpeg':
        image = new PDFImage(doc.images.length + 1, this)
        break
      case 'pdf':
        image = new PDFFormXObject(doc.images.length + 1, this)
        break
    }
    doc.mapping[this.image.uuid] = image
    doc.images.push(image)
  }

  if (!doc.currentPage.xobjects.has(image.alias)) {
    doc.currentPage.xobjects.add(image.alias, image.toReference())
  }

  var x = this.x
  var y = this.y - this.renderHeight


  if (this.style.wrap === false) {
    x = this.style.x !== null ? this.style.x : x
    y = this.style.y !== null ? (this.style.y - doc.offset) : y
  }

  var width, height
  switch (this.type) {
    case 'pdf':
      width  = this.renderWidth / this.info.width
      height = this.renderHeight / this.info.height
      break
    case 'jpeg':
    default:
      width  = this.renderWidth
      height = this.renderHeight
      break
  }

  doc.q()
  doc.cm(width, 0, 0, height, x, y)
  doc.Do(image.alias)
  doc.Q()
}

},{"../object/formxobject":38,"../object/image":39,"../utils":56,"./base":19}],24:[function(require,module,exports){
'use strict'

var LineBreakNode = module.exports = function(linebreak) {
  LineBreakNode.super_.call(this)

  this.type = 'LineBreakNode'
  this.allowBreak = true

  this.linebreak = linebreak
  this.children  = []
  this.isEmptyLine = false
}

require('../utils').inherits(LineBreakNode, require('./base'))

LineBreakNode.prototype.beforeContent = function(cursor) {
  if (this.isEmptyLine) {
    cursor.y -= this.height
  }

  return cursor
}

LineBreakNode.prototype._compute = function(cursor) {
  this.x = cursor.x
  this.y = cursor.y

  this.width  = 0
  this.height = this.linebreak.height
}

},{"../utils":56,"./base":19}],25:[function(require,module,exports){
'use strict'

var utils = require('../utils')

var OperationsNode = module.exports = function(ops) {
  OperationsNode.super_.call(this)

  this.type = 'OperationsNode'

  this.height = this.width = 0
  this.ops = ops.ops
}

utils.inherits(OperationsNode, require('./base'))

OperationsNode.prototype._compute = function(cursor) {
  this.ops.forEach(function(op) {
    if (typeof op === 'function') {
      op.x = cursor.x
      op.y = cursor.y
    }
  })
}

OperationsNode.prototype.render = function(doc) {
  this.ops.forEach(function(op) {
    if (typeof op === 'function') {
      var args = op(op.x, op.y)
      if (!Array.isArray(args)) {
        args = [args]
      }
    } else {
      args = op
    }

    doc.write.apply(doc, args)
  })
}

},{"../utils":56,"./base":19}],26:[function(require,module,exports){
'use strict'

var utils     = require('../utils')
var Word      = require('../../element/word')
var WordNode  = require('./word')

var PageCount = module.exports = function(pageCount) {
  PageCount.super_.call(this, pageCount)

  this.type = 'PageCount'

  this.number = 0
}

utils.inherits(PageCount, WordNode)

PageCount.prototype.mustUpdate = function(cursor) {
  var updateRequired = false

  if (this.number !== cursor.pageCount) {
    this.number = cursor.pageCount
    var width  = this.word.width
    var height = this.word.height
    this.word.word = String(cursor.pageCount)
    return this.word.width !== width || this.word.height !== height
  }

  return updateRequired || WordNode.prototype.mustUpdate.call(this, cursor)
}

},{"../../element/word":15,"../utils":56,"./word":33}],27:[function(require,module,exports){
'use strict'

var utils = require('../utils')
var Word      = require('../../element/word')
var WordNode  = require('./word')

var PageNumber = module.exports = function(pageNumber) {
  PageNumber.super_.call(this, pageNumber)

  this.type = 'PageNumber'

  this.number = 0
}

utils.inherits(PageNumber, WordNode)

PageNumber.prototype.mustUpdate = function(cursor) {
  var updateRequired = false

  if (this.number !== cursor.currentPage) {
    this.number = cursor.currentPage
    var width  = this.word.width
    var height = this.word.height
    this.word.word = String(cursor.currentPage)
    updateRequired = this.word.width !== width || this.word.height !== height
  }

  return updateRequired || WordNode.prototype.mustUpdate.call(this, cursor)
}

},{"../../element/word":15,"../utils":56,"./word":33}],28:[function(require,module,exports){
'use strict'

var PageBreakNode = module.exports = function(id, offset) {
  PageBreakNode.super_.call(this)

  this.type   = 'PageBreakNode'
  this.id     = id
  this.offset = offset

  this.begun  = []
  this.broken = []
  this.ended  = []
}

require('../utils').inherits(PageBreakNode, require('./base'))

PageBreakNode.prototype.end = function(doc, parent) {
  var parents = [], p = parent
  while (p) {
    parents.unshift(p)
    p = p.parent
  }

  parents.forEach(function(p) {
    if (hasFunction(p.node, 'end') && this.ended.indexOf(p.node) === -1) {
      p.node.end(doc, p.parent)

      this.ended.push(p.node)
    }
  }, this)

  doc.createPage()

  var offset = doc.offset + this.offset
  doc.offset = 0

  parents.forEach(function(p) {
    if (hasFunction(p.node, 'afterBreak') && this.broken.indexOf(p.node) === -1) {
      p.node.afterBreak(doc, p.parent)

      this.broken.push(p.node)
    }
  }, this)

  doc.offset = offset

  parents.forEach(function(p) {
    if (hasFunction(p.node, 'begin') && this.begun.indexOf(p.node) === -1) {
      p.node.begin(doc, p.parent)

      this.begun.push(p.node)
    }
  }, this)

  this.rendered = true
}

function hasFunction(obj, name) {
  return typeof obj[name] === 'function'
}

},{"../utils":56,"./base":19}],29:[function(require,module,exports){
'use strict'

var RowNode = module.exports = function(row) {
  RowNode.super_.call(this)

  this.type = 'RowNode'
  this.direction = 'leftRight'
  this.allowBreak = row.style.allowBreak !== null
        ? row.style.allowBreak
        : this.allowBreak

  this.row      = row
  this.style    = row.style
  this.children = this.row.children.map(function(child) {
    return child.createNode()
  })
  this.isFirst  = false

  this.refs = []
  for (var i = 0; i < this.children.length; ++i) {
    var child = this.children[i]
    this.refs.push(child)

    if (child.style.colspan > 1) {
      for (var j = 1; j < child.style.colspan; ++j) {
        this.refs.push(child)
      }
    }
  }
}

require('../utils').inherits(RowNode, require('./base'))

Object.defineProperties(RowNode.prototype, {
  height: {
    enumerable: true,
    get: function() {
      return Math.max.apply(Math, this.children.map(function(child) {
        var height = child.minHeight
                   + child.style.paddingTop + child.style.paddingBottom
                   + child.style.getBorderTopWidth() + child.style.getBorderBottomWidth()

        return height
      }, this))
    }
  }
})

RowNode.prototype.clone = function() {
  var clone = new RowNode(this.row)
  clone.style = this.style
  clone.width = this.width
  clone.widths = this.widths
  clone.children = this.children.map(function(child) {
    return child.clone()
  })
  return clone
}

RowNode.prototype.mustUpdate = function(cursor) {
  for (var i = 0, len = this.children.length; i < len; ++i) {
    if (this.children[i].mustUpdate(cursor)) {
      return true
    }
  }

  return false
}

RowNode.prototype._compute = function(cursor) {
  this.x = cursor.x
  this.y = cursor.y

  var offset = 0, index = 0
  this.children.forEach(function(child, i) {
    // set width
    child.width = (this.widths[index++] || 0)
               - child.style.getBorderLeftWidth() - child.style.paddingLeft
               - child.style.paddingRight - child.style.getBorderRightWidth()

    if (child.style.colspan > 1) {
      for (var j = 1; j < child.style.colspan; ++j) {
        child.width += this.widths[index++] || 0
      }
    }

    child.y = cursor.y
    child.x = cursor.x + offset
    offset += child.width
            + child.style.paddingLeft + child.style.paddingRight
            + child.style.getBorderRightWidth() + child.style.getBorderLeftWidth()
  }, this)
}

RowNode.prototype.afterContent = function(cursor) {
  var height = this.height

  this.children.forEach(function(child) {
    child.height = height
  })

  cursor.x = this.x
  cursor.y = this.y - this.height

  return cursor
}

var BoxNode = require('./box')

RowNode.prototype.begin = function(doc, parent) {
  this.children.forEach(function(child) {
    BoxNode.prototype.begin.call(child, doc, parent)
  })
}

},{"../utils":56,"./base":19,"./box":20}],30:[function(require,module,exports){
'use strict'

var TablePageBreakNode = module.exports = function(id, offset) {
  TablePageBreakNode.super_.call(this, id, offset)

  this.children = []
}

require('../utils').inherits(TablePageBreakNode, require('./pagebreak'))

Object.defineProperties(TablePageBreakNode.prototype, {
  height: {
    enumerable: true,
    get: function() {
      return this.children.map(function(child) { return child.height })
                          .reduce(function(lhs, rhs) { return lhs + rhs }, 0)
    }
  }
})

TablePageBreakNode.with = function(children) {
  return function(id, offset, parent, idx) {
    var node = new TablePageBreakNode(id, offset)

    node.update = function(idx) {
      node.children = children.map(function(child) {
        return child.create(idx)
      })
    }

    node.update(idx)

    return node
  }
}

TablePageBreakNode.prototype._compute = function(cursor) {
  this.x = cursor.x
  this.y = cursor.y
}

TablePageBreakNode.prototype.beforeContent = function(cursor) {
  this.yBefore = cursor.y
  return cursor
}

TablePageBreakNode.prototype.afterContent = function(cursor) {
  cursor.y = this.yBefore
}

},{"../utils":56,"./pagebreak":28}],31:[function(require,module,exports){
'use strict'

var utils = require('../utils')
var TablePageBreakNode = require('./table-pagebreak')
var RowProxy = require('../proxy/row')

var TableNode = module.exports = function(table) {
  TableNode.super_.call(this)

  this.type = 'TableNode'
  this.allowBreak = true

  this.table    = table
  this.style    = table.style
  this.children = this.table.children.map(function(child) {
    return child.createNode()
  })

  if (this.children.length) {
    this.children[0].isFirst = true
  }

  this.beforeBreakChildren = table.beforeBreakChildren.map(function(child) {
    return new RowProxy(child)
  })
  this.PageBreakType = TablePageBreakNode.with(this.beforeBreakChildren)

  this.afterBreak = this.children.slice(0, this.style.headerRows)
}

utils.inherits(TableNode, require('./base'))

Object.defineProperties(TableNode.prototype, {
  height: {
    enumerable: true,
    get: function() {
      return this.children.map(function(child) { return child.height })
                          .reduce(function(lhs, rhs) { return lhs + rhs }, 0)
    }
  }
})

TableNode.prototype.mustUpdate = function(cursor) {
  for (var i = 0, len = this.children.length; i < len; ++i) {
    if (this.children[i].mustUpdate(cursor)) {
      return true
    }
  }

  return false
}

TableNode.prototype._compute = function(cursor) {
  this.x = cursor.x
  this.y = cursor.y

  this.width = utils.resolveWidth(this.style.width, cursor.width)

  switch (this.style.tableLayout) {
    case 'fixed':
      var spaceLeft = this.width

      this.widths = this.style.widths
      // absolute widths
      .map(function(width) {
        if (!utils.isRelative(width)) {
          width = parseFloat(width, 10)
          spaceLeft -= width
        }

        return width
      })
      // relative widths
      .map(function(width) {
        if (utils.isRelative(width)) {
          width = parseFloat(width, 10)
          if (spaceLeft > 0) {
            return (width / 100) * spaceLeft
          } else {
            return 0
          }
        } else {
          return width
        }
      })

      break
    default:
      throw new Error('Table layout `' + this.style.tableLayout + '` not implemented')
  }

  this.children.forEach(function(row, j) {
    row.width = this.width
    row.widths = this.widths

    // unify border
    var index = 0
    row.children.forEach(function(cell, i) {
      if (j > 0) {
        var onTop = this.children[j - 1].refs[index++]
        if (!onTop) {
          return
        }

        if (cell.style.getBorderTopWidth()) {
          var horizontalWidth, horizontalColor

          if (cell.style.getBorderTopWidth() > onTop.style.getBorderBottomWidth()) {
            horizontalWidth = cell.style.getBorderTopWidth() / 2
            horizontalColor = cell.style.getBorderTopColor()
          } else {
            horizontalWidth = onTop.style.getBorderBottomWidth() / 2
            horizontalColor = onTop.style.getBorderBottomColor()
          }

          onTop.style = onTop.style.merge({
            borderBottomWidth: horizontalWidth,
            borderBottomColor: horizontalColor
          })

          cell.style = cell.style.merge({
            borderTopWidth: horizontalWidth,
            borderTopColor: horizontalColor
          })

          if (cell.style.colspan > 1) {
            for (var k = 1; k < cell.style.colspan; ++k) {
              var next = this.children[j - 1].children[index++]
              if (!next) {
                break
              }
              next.style = next.style.merge({
                borderBottomWidth: horizontalWidth,
                borderBottomColor: horizontalColor
              })
            }
          }
        }
      }

      if (i > 0) {
        var onLeft = row.children[i - 1]

        if (cell.style.getBorderLeftWidth() > 0) {
          var verticalWidth, verticalColor

          if (cell.style.getBorderLeftWidth() > onLeft.style.getBorderRightWidth()) {
            verticalWidth = cell.style.getBorderLeftWidth() / 2
            verticalColor = cell.style.getBorderLeftColor()
          } else {
            verticalWidth = onLeft.style.getBorderRightWidth() / 2
            verticalColor = onLeft.style.getBorderRightColor()
          }

          onLeft.style = onLeft.style.merge({
            borderRightWidth: verticalWidth,
            borderRightColor: verticalColor
          })

          cell.style = cell.style.merge({
            borderLeftWidth: verticalWidth,
            borderLeftColor: verticalColor
          })
        }
      }
    }, this)
  }, this)

  this.beforeBreakChildren.forEach(function(row, j) {
    row.width = this.width
    row.widths = this.widths
  }, this)
}

},{"../proxy/row":55,"../utils":56,"./base":19,"./table-pagebreak":30}],32:[function(require,module,exports){
'use strict'

var TextNode = module.exports = function(text) {
  TextNode.super_.call(this)

  this.type = 'TextNode'
  this.allowBreak = true

  this.text     = text
  this.style    = this.currentStyle = text.style
  this.children = this.text.children.map(function(child) {
    return child.createNode()
  })
}

require('../utils').inherits(TextNode, require('./base'))

TextNode.prototype.mustUpdate = function(cursor) {
  for (var i = 0, len = this.children.length; i < len; ++i) {
    if (this.children[i].mustUpdate(cursor)) {
      return true
    }
  }

  return false
}

TextNode.prototype.afterContent = function(cursor) {
  if (this.children.length) {
    cursor.y += this.descent
  }

  return cursor
}

TextNode.prototype._compute = function(cursor) {
  this.x = cursor.x
  var y = this.y = cursor.y
  this.width  = cursor.width
  this.height = 0
  this.descent = 0

  var line  = []
  var spaceLeft = cursor.width
  var isLastLine = false

  var self = this
  var renderLine = function() {
    if (!line.length) {
      return
    }

    if (isLastLine) {
      self.descent = 0
    }

    var left = cursor.x

    var height = Math.max.apply(Math, line.map(function(word) {
      return word.word.height
    }))

    var emptySpace = cursor.width - line.map(function(word, i) {
      return word.word.width + (i > 0 ? word.word.spacing : 0)
    }).reduce(function(lhs, rhs) {
      return lhs + rhs
    }, 0)

    var count = line.length
    var spacing = 0

    // alignement
    switch (self.text.style.textAlign) {
      case 'right':
        left += emptySpace
        break
      case 'center':
        left += cursor.width / 2 - (cursor.width - emptySpace) / 2
        break
      case 'justify':
        if (isLastLine && emptySpace / cursor.width > .2) {
          break
        }
        spacing = emptySpace / (count - 1)
        break
    }

    line[0].isFirst = true
    line[line.length - 1].isLast = true

    line.forEach(function(word, i) {
      var width = word.word.width + word.word.spacing + spacing

      word.setBoundingBox(left, cursor.y, width, height)
      left = left
      left += width

      self.descent = Math.min(self.descent, word.style.font.lineDescent(word.style.fontSize))
    }, this)

    self.height += height
    y -= height

    line.length = 0
    spaceLeft = cursor.width
    isLastLine = false
  }

  this.children.forEach(function(word, i) {
    if (word.type === 'PageBreakNode') {
      return
    } else if (word.type === 'LineBreakNode') {
      isLastLine = true

      if (line.length) {
        renderLine()
      } else {
        word.isEmptyLine = true
        self.height += word.linebreak.height
        y -= word.linebreak.height
      }
      return
    }

    // reset isFirst and isLast for possible rearrangment
    word.isFirst = false
    word.isLast = false

    var wordWidth = word.word.width
    if (i > 0) wordWidth += word.word.spacing

    if (line.length > 0 && (spaceLeft - wordWidth) < 0) {
      renderLine()
    }

    spaceLeft -= wordWidth
    line.push(word)
  }, this)

  isLastLine = true
  renderLine()

  this.height -= this.descent // substract, because descent is negative
}

var WordNode = require('./word')

TextNode.prototype.begin = function(doc, parent) {
  doc.BT()
  WordNode.prototype.buildStyle.call(this, doc, parent)
}

TextNode.prototype.end = function(doc) {
  doc.ET()
}

},{"../utils":56,"./base":19,"./word":33}],33:[function(require,module,exports){
'use strict'

var WordNode = module.exports = function(word) {
  WordNode.super_.call(this)

  this.type = 'WordNode'

  this.word    = word
  this.style   = word.style
  this.isFirst = false
  this.isLast  = false

  this.content = this.word.children.filter(function(child, i) {
    return i > 0
  }).map(function(child) {
    return child.createNode()
  })
}

require('../utils').inherits(WordNode, require('./base'))

WordNode.prototype.mustUpdate = function(cursor) {
  for (var i = 0, len = this.content.length; i < len; ++i) {
    if (this.content[i].mustUpdate(cursor)) {
      return true
    }
  }

  return false
}

WordNode.prototype.beforeContent = function(cursor) {
  if (this.isLast) {
    cursor.y -= this.height
  }

  return cursor
}

WordNode.prototype._compute = function(cursor) {
  this.y = cursor.y
}

WordNode.prototype.setBoundingBox = function(x, y, width, height) {
  this.x = x
  this.y = y

  this.width  = width
  this.height = height
}

var PDFString = require('../object/string')
var TTFFont   = require('../object/font/ttf')
var utils     = require('../utils')

WordNode.prototype.buildStyle = function(doc, parent) {
  var font = doc.mapping[this.style.font.uuid]
  if (!font) {
    font = new TTFFont(doc.fonts.length + 1, this.style.font)
    doc.mapping[this.style.font.uuid] = font
    doc.fonts.push(font)
  }

  if (!doc.currentPage.fonts.has(font.alias)) {
    doc.currentPage.fonts.add(font.alias, font.toReference())
  }

  if (parent.node.style !== this.style || parent.node.currentStyle !== this.style) {
    doc.Tf(font.alias, this.style.fontSize)
    doc.rg.apply(doc, utils.colorToRgb(this.style.color))
    parent.node.currentStyle = this.style
  }
}

WordNode.prototype.render = function(doc, parent) {
  this.buildStyle(doc, parent)

  var font = doc.mapping[this.style.font.uuid]

  if (this.isFirst) {
    doc.Tm(1, 0, 0, 1, this.x, this.y - this.height)
  }

  var str = font.encode(this.word.toString())
  doc.Tj((new PDFString(str)).toHexString())

  if (!this.isLast) {
    doc.Td(this.width, 0)
  }
}

},{"../object/font/ttf":37,"../object/string":48,"../utils":56,"./base":19}],34:[function(require,module,exports){
var PDFArray = module.exports = function(array) {
  if (!array) array = []

  array.toString = function() {
    return '[' +
            this.map(function(item) {
              return String(item)
            }).join(' ') +
           ']'
  }

  return array
}

var PDFValue = require('./value')

PDFArray.parse = function(xref, lexer, trial) {
  if (lexer.getString(1) !== '[') {
    if (trial) {
      return undefined
    }

    throw new Error('Invalid array')
  }

  lexer.shift(1)
  lexer.skipWhitespace(null, true)

  var values = []

  while (lexer.getString(1) !== ']') {
    values.push(PDFValue.parse(xref, lexer))
    lexer.skipWhitespace(null, true)
  }

  lexer.shift(1)

  return new PDFArray(values)
}

},{"./value":50}],35:[function(require,module,exports){
exports.parse = function(xref, lexer, trial) {
  var isTrue = lexer.getString(4) === 'true'
  var isFalse = !isTrue && lexer.getString(5) === 'false'

  if (!isTrue && !isFalse) {
    if (trial) {
      return undefined
    }

    throw new Error('Invalid boolean')
  }

  if (isTrue) {
    lexer.shift(4)
  } else {
    lexer.shift(5)
  }

  return isTrue
}

},{}],36:[function(require,module,exports){
var PDFName = require('./name')

var PDFDictionary = module.exports = function(dictionary) {
  this.dictionary = {}
  if (dictionary) {
    for (var key in dictionary) {
      this.add(key, dictionary[key])
    }
  }
}

PDFDictionary.prototype.add = PDFDictionary.prototype.set = function(key, val) {
  key = new PDFName(key)
  if (typeof val === 'string') val = new PDFName(val)
  this.dictionary[key] = val
}

PDFDictionary.prototype.has = function(key) {
  return String(new PDFName(key)) in this.dictionary
}

PDFDictionary.prototype.get = function(key) {
  return this.dictionary[new PDFName(key)]
}

PDFDictionary.prototype.toString = function() {
  var self = this
  return '<<\n' +
           Object.keys(this.dictionary).map(function(key) {
             var value = self.dictionary[key] && self.dictionary[key].toString() || 'null'
             return key.toString() + ' ' + value
           }).join('\n').replace(/^/gm, '\t') + '\n' +
         '>>'
}

Object.defineProperty(PDFDictionary.prototype, 'length', {
  get: function() {
    return Object.keys(this.dictionary).length
  },
  enumerable: true
})

var PDFValue = require('./value')

PDFDictionary.parse = function(xref, lexer, trial) {
  if (lexer.getString(2) !== '<<') {
    if (trial) {
      return undefined
    }

    throw new Error('Invalid dictionary')
  }

  lexer.shift(2)
  lexer.skipWhitespace(null, true)

  var dictionary = new PDFDictionary

  while (lexer.getString(2) !== '>>') {
    var key = PDFName.parse(xref, lexer)
    lexer.skipWhitespace(null, true)

    var value = PDFValue.parse(xref, lexer)
    dictionary.set(key, value)

    lexer.skipWhitespace(null, true)
  }

  lexer.shift(2)

  return dictionary
}

},{"./name":40,"./value":50}],37:[function(require,module,exports){
'use strict'

var PDFObject     = require('../object')
var PDFArray      = require('../array')
var PDFStream     = require('../stream')
var PDFDictionary = require('../dictionary')
var PDFString     = require('../string')
var PDFName       = require('../name')

var utils = require('../../utils')

var TTFFont = module.exports = function(id, font) {
  this.alias = new PDFName('F' + id)

  this.font = font
  this.subset = this.font.subset()
  this.subset.use(' ')

  // font descriptor
  this.descriptor = new PDFObject('FontDescriptor')
  this.descriptor.prop('FontName', this.font.ttf.fontName)
  this.descriptor.prop('Flags', this.font.ttf.flags)
  this.descriptor.prop('FontBBox', new PDFArray(this.font.ttf.bbox))
  this.descriptor.prop('ItalicAngle', this.font.ttf.italicAngle)
  this.descriptor.prop('Ascent', this.font.ttf.ascent)
  this.descriptor.prop('Descent', this.font.ttf.descent)
  this.descriptor.prop('CapHeight', this.font.ttf.capHeight)
  this.descriptor.prop('StemV', this.font.ttf.stemV)

  this.descendant = new PDFObject('Font')
  this.descendant.prop('Subtype', 'CIDFontType2')
  this.descendant.prop('BaseFont', this.font.ttf.fontName)
  this.descendant.prop('DW', 1000)
  this.descendant.prop('CIDToGIDMap', 'Identity')
  this.descendant.prop('CIDSystemInfo', new PDFDictionary({
    'Ordering':   new PDFString('Identity'),
    'Registry':   new PDFString('Adobe'),
    'Supplement': 0
  }))
  this.descendant.prop('FontDescriptor', this.descriptor.toReference())

  PDFObject.call(this, 'Font')
  this.prop('Subtype', 'Type0')
  this.prop('BaseFont', this.font.ttf.fontName)
  this.prop('Encoding', 'Identity-H')
  this.prop('DescendantFonts', new PDFArray([
    this.descendant.toReference()
  ]))
}

utils.inherits(TTFFont, PDFObject)

TTFFont.prototype.encode = function(str) {
  this.subset.use(str)
  return this.subset.encode(str)
}

TTFFont.prototype.embed = function(doc) {
  this.subset.embed()

  // widths array
  var metrics = [], codeMap = this.subset.cmap()
  for (var code in codeMap) {
    if (code < 32) continue
    var gid = codeMap[code]
    var width = Math.round(this.font.ttf.tables.hmtx.metrics[gid] * this.font.ttf.scaleFactor)
    metrics.push(code - 31)
    metrics.push(new PDFArray([width]))
  }

  this.descendant.prop('W', new PDFArray(metrics))

  // unicode map
  var cmap = new PDFStream(doc.createObject())
  cmap.writeLine('/CIDInit /ProcSet findresource begin')
  cmap.writeLine('12 dict begin')
  cmap.writeLine('begincmap')
  cmap.writeLine('/CIDSystemInfo <<')
  cmap.writeLine('  /Registry (Adobe)')
  cmap.writeLine('  /Ordering (Identity)')
  cmap.writeLine('  /Supplement 0')
  cmap.writeLine('>> def')
  cmap.writeLine('/CMapName /Identity-H')
  cmap.writeLine('/CMapType 2 def')
  cmap.writeLine('1 begincodespacerange')
  cmap.writeLine('<0000><ffff>')
  cmap.writeLine('endcodespacerange')

  var mapping = this.subset.subset, lines = []
  for (code in mapping) {
    if (lines.length >= 100) {
      cmap.writeLine(lines.length + ' beginbfchar')
      for (var i = 0; i < lines.length; ++i) {
        cmap.writeLine(lines[i])
      }
      cmap.writeLine('endbfchar')
      lines = []
    }

    lines.push(
      '<' + ('0000' + (+code - 31).toString(16)).slice(-4) + '>' + // cid
      '<' + ('0000' + mapping[code].toString(16)).slice(-4) + '>'  // gid
    )
  }

  if (lines.length) {
    cmap.writeLine(lines.length + ' beginbfchar')
    lines.forEach(function(line) {
      cmap.writeLine(line)
    })
    cmap.writeLine('endbfchar')
  }

  cmap.writeLine('endcmap')
  cmap.writeLine('CMapName currentdict /CMap defineresource pop')
  cmap.writeLine('end')
  cmap.writeLine('end')

  this.prop('ToUnicode', cmap.toReference())

  // font file
  var data = this.subset.save()
  var hex = utils.asHex(data)

  var file = new PDFStream(doc.createObject())
  file.object.prop('Length', hex.length + 1)
  file.object.prop('Length1', data.byteLength)
  file.object.prop('Filter', 'ASCIIHexDecode')
  file.content = hex + '>\n'

  this.descriptor.prop('FontFile2', file.toReference())

  doc.addObject(this)
  doc.addObject(this.descriptor)
  doc.addObject(this.descendant)
}

},{"../../utils":56,"../array":34,"../dictionary":36,"../name":40,"../object":43,"../stream":47,"../string":48}],38:[function(require,module,exports){
var PDFObject = require('./object')
var PDFStream = require('./stream')
var PDFArray  = require('./array')
var PDFName   = require('./name')
var utils     = require('../utils')

var PDFFormXObject = module.exports = function(id, img) {
  this.alias = new PDFName('FXO' + id)
  this.img = img

  PDFObject.call(this, id)

  this.resources = img.info.page.get('Resources')

  this.prop('Type', 'XObject')
  this.prop('Subtype', 'Form')
  this.prop('FormType', 1)
  this.prop('BBox', new PDFArray([0, 0, img.info.width, img.info.height]))
  this.prop('Resources', this.resources instanceof PDFObject ? this.resources.toReference() : this.resources)

  var contents = img.info.page.get('Contents').object
  this.content = new PDFStream(this)
  this.content.content = contents.content.content

  if (contents.properties.has('Filter')) {
    this.prop('Filter', contents.properties.get('Filter'))
  }
  this.prop('Length',  contents.properties.get('Length'))
  if (contents.properties.has('Length1')) {
    this.prop('Length1', contents.properties.get('Length1'))
  }

  this.objects = []
  this.addObjectsRecursive(this)
}

utils.inherits(PDFFormXObject, PDFObject)

PDFFormXObject.prototype.embed = function(doc) {
  doc.addObject(this)

  this.objects.forEach(function(obj) {
    doc.addObject(obj)
  })
}

var PDFDictionary = require('../object/dictionary')
var PDFReference  = require('../object/reference')

PDFFormXObject.prototype.addObjectsRecursive = function(value) {
  switch (true) {
    case value instanceof PDFReference:
      if (this.objects.indexOf(value.object) > -1) {
        break
      }
      this.objects.push(value.object)
      this.addObjectsRecursive(value.object)
      break
    case value instanceof PDFObject:
      this.addObjectsRecursive(value.properties)
      this.addObjectsRecursive(value.content)
      break
    case value instanceof PDFDictionary:
      for (var key in value.dictionary) {
        this.addObjectsRecursive(value.dictionary[key])
      }
      break
    case Array.isArray(value):
      value.forEach(function(item) {
        this.addObjectsRecursive(item)
      }, this)
      break
  }
}

},{"../object/dictionary":36,"../object/reference":46,"../utils":56,"./array":34,"./name":40,"./object":43,"./stream":47}],39:[function(require,module,exports){
'use strict'

var PDFXObject    = require('../object/xobject')
var PDFArray      = require('../object/array')
var PDFName       = require('../object/name')
var utils         = require('../utils')

var Image = module.exports = function(id, img) {
  this.alias = new PDFName('I' + id)
  this.img = img

  PDFXObject.call(this)
  this.prop('Subtype', 'Image')
  this.prop('Width',  img.info.width)
  this.prop('Height', img.info.height)
  this.prop('ColorSpace', img.colorSpace)
  this.prop('BitsPerComponent', 8)
}

utils.inherits(Image, PDFXObject)

Image.prototype.embed = function(doc) {
  var src = this.img.image.img.src
  var hex = utils.asHex(src)
  this.prop('Filter', new PDFArray(['/ASCIIHexDecode', '/DCTDecode']))
  this.prop('Length', hex.length + 1)
  this.prop('Length1', src.byteLength)
  this.content.content = hex + '>\n'

  doc.addObject(this)
}

},{"../object/array":34,"../object/name":40,"../object/xobject":51,"../utils":56}],40:[function(require,module,exports){
var PDFName = module.exports = function(name) {
  if (!name) throw new Error('A Name cannot be undefined')

  if (name instanceof PDFName) return name

  // white-space characters are not allowed
  if (name.match(/[\x00]/)) {
    throw new Error('A Name mustn\'t contain the null characters')
  }

  // delimiter characters are not allowed
  if (name.match(/[\(\)<>\[\]\{\}\/\%]/)) {
    throw new Error('A Name mustn\'t contain delimiter characters')
  }

  name = name.toString()
  // Beginning with PDF 1.2, any character except null (character code 0)
  // may be included in a name by writing its 2-digit hexadecimal code,
  // preceded by the number sign character (#)
  // ... it is recommended but not required for characters whose codes
  // are outside the range 33 (!) to 126 (~)
  name = name.replace(/[^\x21-\x7e]/g, function(c) {
    var code = c.charCodeAt(0)
    // replace unicode characters with `_`
    if (code > 0xff) code = 0x5f
    return '#' + code
  })

  this.name = name
}

PDFName.prototype.toString = function() {
  return '/' + this.name
}

PDFName.parse = function(xref, lexer, trial) {
  if (lexer.getString(1) !== '/') {
    if (trial) {
      return undefined
    }

    throw new Error('Invalid name')
  }

  lexer.shift(1)

  var name = ''

  var done = false
  var c
  while (!done && (c = lexer._nextCharCode()) >= 0) {
    switch (true) {
      case c === 0x28: // (
      case c === 0x29: // )
      case c === 0x3c: // <
      case c === 0x3e: // >
      case c === 0x5b: // [
      case c === 0x5d: // ]
      case c === 0x7b: // {
      case c === 0x7d: // }
      case c === 0x2f: // /
      case c === 0x25: // %
        done = true
        break
      case c === 0x23: // #
        var hex = lexer.readString(2)
        name += String.fromCharCode(parseInt(hex, 16))
        break
      case c >= 0x22 && c <= 0x7e: // inside range of 33 (!) to 126 (~)
        name += String.fromCharCode(c)
        break
      default:
        done = true
        break
    }
  }

  lexer.shift(-1)

  return new PDFName(name)
}

},{}],41:[function(require,module,exports){
exports.parse = function(xref, lexer, trial) {
  var isNull = lexer.getString(4) === 'null'

  if (!isNull) {
    if (trial) {
      return undefined
    }

    throw new Error('Invalid null')
  }

  lexer.shift(4)

  return null
}

},{}],42:[function(require,module,exports){
exports.parse = function(xref, lexer, trial) {
  var n = lexer.readNumber(true)

  if (n === undefined) {
    if (trial) {
      return undefined
    }

    throw new Error('Invalid number')
  }

  return n
}

},{}],43:[function(require,module,exports){
// > Objects may be labeled so that they can be referred to by other objects.
//   A labeled object is called an indirect object.
// pdfjs just calls them `references`

var PDFReference  = require('./reference')
var PDFDictionary = require('./dictionary')
var PDFStream     = require('./stream')

var PDFObject = module.exports = function(id, rev) {
  this.id         = id || null
  this.rev        = rev || 0
  this.properties = new PDFDictionary()
  this.reference  = new PDFReference(this)
  this.content    = null

  // used to have obj.object API for both indirect and direct objects
  this.object = this
}

PDFObject.prototype.addProperty = PDFObject.prototype.prop = function(key, val) {
  this.properties.add(key, val)
}

PDFObject.prototype.toReference = function() {
  return this.reference
}

PDFObject.prototype.toString = function() {
  return this.id.toString() + ' ' + this.rev + ' obj\n' +
         (this.properties.length ? this.properties.toString() + '\n' : '') +
         (this.content !== null ? this.content.toString() + '\n' : '') +
         'endobj'
}

var PDFValue = require('./value')

PDFObject.parse = function(xref, lexer, trial) {
  var before = lexer.pos

  var id = lexer.readNumber(trial)
  if (id === undefined && !trial) {
    throw new Error('Invalid object')
  }

  lexer.skipSpace(1, trial)
  var generation = lexer.readNumber(trial)
  if (generation === undefined && !trial) {
    throw new Error('Invalid object')
  }

  lexer.skipSpace(1, trial)
  if (lexer.getString(3) !== 'obj') {
    if (trial) {
      lexer.pos = before
      return undefined
    }

    throw new Error('Invalid object')
  }

  lexer.shift(3)

  lexer.skipEOL(1)
  lexer.skipWhitespace(null, true)

  var value = PDFValue.parse(xref, lexer, true)
  if (value === undefined) {
    throw new Error('Empty object')
  }

  lexer.skipWhitespace(null, true)

  var obj = new PDFObject(id, generation)
  if (value instanceof PDFDictionary) {
    obj.properties = value

    if (lexer.getString(6) === 'stream') {
      lexer.shift(6)
      lexer.skipEOL(1)

      var length = obj.properties.get('Length')
      if (length === undefined) {
        throw new Error('Invalid Stream: no length specified')
      }

      if (typeof length === 'object') {
        var pos = lexer.pos
        length = length.object.content
        lexer.pos = pos
      }

      var stream = new PDFStream(obj)
      stream.content = lexer.read(length)
      lexer.skipEOL(1)

      if (lexer.readString(9) !== 'endstream') {
        throw new Error('Invalid stream: `endstream` not found')
      }

      lexer.skipEOL(1)
    }
  } else {
    obj.content = value
  }

  lexer.skipWhitespace(null, true)

  if (lexer.readString(3) !== 'end') {
    throw new Error('Invalid object: `end` not found')
  }

  return obj
}

},{"./dictionary":36,"./reference":46,"./stream":47,"./value":50}],44:[function(require,module,exports){
'use strict'

var PDFObject     = require('./object')
var PDFStream     = require('./stream')
var PDFDictionary = require('./dictionary')
var PDFArray      = require('./array')
var PDFName       = require('./name')

var utils = require('../utils')

var Page = module.exports = function(parent) {
  PDFObject.call(this, 'Page')

  this.contents = new PDFStream(new PDFObject)
  this.fonts    = new PDFDictionary({})
  this.xobjects = new PDFDictionary({})

  this.prop('Parent', parent.toReference())
  this.prop('Contents', this.contents.toReference())
  this.prop('Resources', new PDFDictionary({
    ProcSet: new PDFArray([
      new PDFName('PDF'),
      new PDFName('Text'),
      new PDFName('ImageB'),
      new PDFName('ImageC'),
      new PDFName('ImageI')
    ]),
    Font:    this.fonts,
    XObject: this.xobjects
  }))
}

utils.inherits(Page, PDFObject)

Page.prototype.embed = function(doc) {
  doc.addObject(this)
  doc.addObject(this.contents.object)
}

},{"../utils":56,"./array":34,"./dictionary":36,"./name":40,"./object":43,"./stream":47}],45:[function(require,module,exports){
'use strict'

var PDFObject = require('./object')
var PDFArray  = require('./array')

var Pages = module.exports = function(width, height) {
  PDFObject.call(this, 'Pages')

  this.pages = []
  this.kids  = new PDFArray()

  this.prop('MediaBox', new PDFArray([
    0, 0,
    width,
    height
  ]))
  this.prop('Kids',  this.kids)
  this.prop('Count', this.kids.length)
}

require('../utils').inherits(Pages, PDFObject)


Pages.prototype.add = function(page) {
  this.pages.push(page)
  this.kids.push(page.toReference())
  this.prop('Count', this.kids.length)
}

Pages.prototype.embed = function(doc) {
  doc.addObject(this)
  this.pages.forEach(function(page) {
    page.embed(doc)
  })
}

},{"../utils":56,"./array":34,"./object":43}],46:[function(require,module,exports){
var PDFReference = module.exports = function(object) {
  this._object = object
}

Object.defineProperty(PDFReference.prototype, 'object', {
  enumerable: true,
  get: function() {
    if (!this._object) {
      return undefined
    }

    if (typeof this._object === 'function') {
      this._object = this._object()
    }

    return this._object
  }
})

PDFReference.prototype.toString = function() {
  return this.object.id + ' ' + this.object.rev + ' R'
}

PDFReference.parse = function(xref, lexer, trial) {
  var before = lexer.pos

  var id = lexer.readNumber(trial)
  if (id === undefined && !trial) {
    throw new Error('Invalid indirect')
  }

  lexer.skipSpace(1, trial)
  var generation = lexer.readNumber(trial)
  if (generation === undefined && !trial) {
    throw new Error('Invalid indirect')
  }

  lexer.skipSpace(1, trial)
  if (lexer.getString(1) !== 'R') {
    if (trial) {
      lexer.pos = before
      return undefined
    }

    throw new Error('Invalid indirect')
  }

  lexer.shift(1)

  return new PDFReference(parseObject.bind(null, xref, lexer, id))
}

function parseObject(xref, lexer, id) {
  var obj = xref.get(id)
  if (obj) {
    return obj
  }

  var offset = xref.getOffset(id)
  lexer.pos = offset

  var PDFObject = require('./object')
  return PDFObject.parse(xref, lexer)
}

},{"./object":43}],47:[function(require,module,exports){
// page 60
// Filters: page 65

var utils = require('../utils')

var PDFStream = module.exports = function(object) {
  object.content = this
  this.object    = object
  this.content   = ''
}

PDFStream.prototype.slice = function(begin, end) {
  this.content = this.content.slice(begin, end)
  this.object.prop('Length', this.content.length - 1)
}

PDFStream.prototype.writeLine = function(str) {
  this.content += str + '\n'
  this.object.prop('Length', this.content.length - 1)
}

PDFStream.prototype.toReference = function() {
  return this.object.toReference()
}

PDFStream.prototype.toString = function() {
  var content = this.content
  if (content instanceof Uint8Array) {
    content = utils.uint8ToString(content) + '\n'
  }

  return 'stream\n' + content + 'endstream'
}

},{"../utils":56}],48:[function(require,module,exports){
var PDFString = module.exports = function(str) {
  this.str = str
}

PDFString.prototype.toLiteralString = function() {
  return '(' + this.str.replace(/\\/g, '\\\\')
                       .replace(/\(/g, '\\(')
                       .replace(/\)/g, '\\)') + ')'
}

PDFString.prototype.toHexString = function() {
  var self = this
  return '<' + ((function() {
    var results = []
    for (var i = 0, len = self.str.length; i < len; ++i) {
      var hex = (self.str.charCodeAt(i) - 31).toString(16)
      results.push(('0000' + hex).slice(-4))
    }
    return results
  })()).join('') + '>'
}

PDFString.prototype.toString = function() {
  return this.toLiteralString()
}

PDFString.parse = function(xref, lexer, trial) {
  var literal = PDFString.parseLiteral(lexer, trial)
  var hex = literal === undefined && PDFString.parseHex(lexer, trial)

  if (!literal && !hex) {
    if (trial) {
      return undefined
    }

    throw new Error('Invalid string')
  }

  return literal || hex
}

PDFString.parseLiteral = function(lexer, trial) {
  if (lexer.getString(1) !== '(') {
    if (trial) {
      return undefined
    }

    throw new Error('Invalid literal string')
  }

  lexer.shift(1)

  var str = ''

  var done = false
  var open = 0
  var c
  while (!done && (c = lexer._nextCharCode()) >= 0) {
    switch (true) {
      case c === 0x28: // (
        open++
        str += String.fromCharCode('(')
        break
      case c === 0x29: // )
        if (open === 0) {
          done = true
        } else {
          open--
          str += String.fromCharCode(')')
        }
        break
      case c === 0x5c: // \
        c = lexer._nextCharCode()
        switch (c) {
          case 0x6e: // \n
            str += '\n'
            break
          case 0x72: // \r
            str += '\r'
            break
          case 0x74: // \t
            str += '\t'
            break
          case 0x62: // \b
            str += '\b'
            break
          case 0x66: // \f
            str += '\f'
            break
          case 0x28: // '('
          case 0x29: // ')'
          case 0x5c: // '\'
            str += String.fromCharCode(c)
            break
          default:
            var hex = lexer.readString(3)
            str += String.fromCharCode(parseInt(hex, 16))
            break
        }
        break
      case 0x0d: // CR
      case 0x0a: // LF
        lexer.skipEOL(1)
        break
      default:
        str += String.fromCharCode(c)
        break
    }
  }

  return new PDFString(str)
}

PDFString.parseHex = function(lexer, trial) {
  if (lexer.getString(1) !== '<') {
    if (trial) {
      return undefined
    }

    throw new Error('Invalid hex string')
  }

  lexer.shift(1)

  var str = ''

  var done = false
  var digits = []
  var addCharacter = function(force) {
    if (digits.length !== 2) {
      if (digits.length === 1 && force) {
        digits.push('0')
      } else {
        return
      }
    }

    str += String.fromCharCode(parseInt(digits.join(''), 16))
    digits.length = 0
  }

  var c
  while (!done && (c = lexer._nextCharCode()) >= 0) {
    switch (true) {
      case c === 0x3e: // >
        done = true
        break
      case c >= 0x30 && c <= 0x39: // 0 - 9
      case c >= 0x41 && c <= 0x5a: // A - B
      case c >= 0x61 && c <= 0x7a: // a - b
        digits.push(String.fromCharCode(c))
        addCharacter()
        break
      case lexer.isWhiteSpace(c):
        break
      default:
        lexer._warning('invalid character `' + String.fromCharCode(c) + '` in hex string')
        break
    }
  }

  addCharacter(true)

  return new PDFString(str)
}

},{}],49:[function(require,module,exports){
var PDFDictionary = require('./dictionary')
var PDFArray      = require('./array')
var PDFString     = require('./string')
var utils         = require('../utils')

var PDFTrailer = module.exports = function(size, root, info) {
  PDFDictionary.call(this)

  this.set('Size', size)
  this.set('Root', root && root.toReference())

  var id = (new PDFString(info.id)).toHexString()
  this.set('ID', new PDFArray([id, id]))

  this.set('Info', new PDFDictionary({
    Producer: new PDFString(info.producer),
    CreationDate: new PDFString(utils.formatDate(info.creationDate || new Date))
  }))
}

PDFTrailer.prototype = Object.create(PDFDictionary.prototype, {
  constructor: { value: PDFTrailer }
})

PDFTrailer.prototype.toString = function() {
  return 'trailer\n' + PDFDictionary.prototype.toString.call(this)
}

PDFTrailer.parse = function(xref, lexer) {
  lexer.skipWhitespace(null, true)

  if (lexer.readString(7) !== 'trailer') {
    throw new Error('Invalid trailer: trailer expected but not found')
  }

  lexer.skipWhitespace(null, true)

  var dict = PDFDictionary.parse(xref, lexer)
  return dict
}

},{"../utils":56,"./array":34,"./dictionary":36,"./string":48}],50:[function(require,module,exports){
var Objects = []

exports.parse = function(xref, lexer) {
  // lazy load, cause circular referecnes
  if (!Objects.length) {
    Objects.push.apply(Objects, [
      require('./boolean'),
      require('./null'),
      require('./name'),
      require('./dictionary'), // must be tried before string!
      require('./string'),
      require('./array'),
      require('./reference'), // must be tried before number!
      require('./number')
    ])
  }

  // try
  for (var i = 0; i < Objects.length; ++i) {
    var value = Objects[i].parse(xref, lexer, true)
    if (value !== undefined) {
      return value
    }
  }

  lexer._error('Invalid value')
  return undefined
}

},{"./array":34,"./boolean":35,"./dictionary":36,"./name":40,"./null":41,"./number":42,"./reference":46,"./string":48}],51:[function(require,module,exports){
var PDFObject = require('./object')
var PDFStream = require('./stream')

var PDFXObject = module.exports = function(id, rev) {
  PDFObject.call(this, id, rev)

  this.content = new PDFStream(this)

  this.prop('Type', 'XObject')
  this.prop('Filter', 'ASCIIHexDecode')
}

PDFXObject.prototype = Object.create(PDFObject.prototype, {
  constructor: { value: PDFXObject }
})

},{"./object":43,"./stream":47}],52:[function(require,module,exports){
var PDFXref = module.exports = function() {
  this.objects = []
}

PDFXref.prototype.add = function(id, offset, obj) {
  this.objects[id] = {
    offset: offset,
    obj:    obj
  }
}

PDFXref.prototype.get = function(id) {
  return this.objects[id] && this.objects[id].obj
}

PDFXref.prototype.getOffset = function(id) {
  return this.objects[id] && this.objects[id].offset
}

PDFXref.prototype.toString = function() {
  var xref = 'xref\n'

  var range  = { from: 0, refs: [0] }
  var ranges = [range]

  for (var i = 1; i < this.objects.length; ++i) {
    var obj = this.objects[i]
    if (!obj) {
      if (range) {
        range = null
      }
      continue
    }

    if (!range) {
      range = { from: i, refs: [] }
      ranges.push(range)
    }

    range.refs.push(obj.offset)
  }

  ranges.forEach(function(range) {
    xref += range.from + ' ' + range.refs.length + '\n'

    range.refs.forEach(function(ref, i) {
      if (range.from === 0 && i === 0) {
        xref += '0000000000 65535 f \n'
      } else {
        xref += '0000000000'.substr(ref.toString().length) + ref + ' 00000 n \n'
      }
    })
  })

  return xref
}

PDFXref.parse = function(_, lexer) {
  var xref = new PDFXref

  if (lexer.readString(4) !== 'xref') {
    throw new Error('Invalid xref: xref expected but not found')
  }

  lexer.skipEOL(1)

  var start
  while ((start = lexer.readNumber(true)) !== undefined) {
    lexer.skipSpace(1)
    var count = lexer.readNumber()
    lexer.skipEOL(1)

    for (var i = 0, len = 0 + count; i < len; ++i) {
      var offset = lexer.readNumber()
      lexer.skipSpace(1)
      lexer.readNumber() // generation
      lexer.skipSpace(1)
      var key = lexer.readString(1)
      lexer.skipSpace(null, true)
      lexer.skipEOL(1)

      var id = start + i
      if (id > 0 && key === 'n') {
        xref.add(id, offset, null)
      }
    }
  }

  return xref
}

},{}],53:[function(require,module,exports){
'use strict'

var utils = require('../utils')
var Lexer = require('./lexer')

var PDFXref    = require('../object/xref')
var PDFTrailer = require('../object/trailer')

var Document = module.exports = function(src) {
  this.src = new Uint8Array(utils.toArrayBuffer(src))
}

Document.prototype.parse = function() {
  var index = lastIndexOf(this.src, 'startxref', 128)
  if (index === -1) {
    throw new Error('Invalid PDF: startxref not found')
  }

  index += 'startxref'.length

  // skip whitespaces
  while (Lexer.isWhiteSpace(this.src[++index])) {
  }

  var str = ''
  while (this.src[index] >= 0x30 && this.src[index] <= 0x39) { // between 0 and 9
    str +=  String.fromCharCode(this.src[index++])
  }

  var startXRef = parseInt(str, 10)

  if (isNaN(startXRef)) {
    throw new Error('Invalid PDF: startxref is not a number')
  }

  var lexer = new Lexer(this.src)
  lexer.shift(startXRef)

  this.xref    = PDFXref.parse(null, lexer)
  this.trailer = PDFTrailer.parse(this.xref, lexer)

  var trailer = this.trailer
  while (trailer.has('Prev')) {
    lexer.pos = trailer.get('Prev')
    var xref = PDFXref.parse(null, lexer)

    for (var i = 0; i < xref.objects.length; ++i) {
      var obj = xref.objects[i]
      if (obj && !this.xref.objects[i]) {
        this.xref.objects[i] = obj
      }
    }

    trailer = PDFTrailer.parse(xref, lexer)
  }
}

function lastIndexOf(src, key, step) {
  if (!step) step = 1024
  var pos = src.length, index = -1

  while (index === -1 && pos > 0) {
    pos -= step - key.length
    index = find(src, key, Math.max(pos, 0), step, true)
  }

  return index
}

function find(src, key, pos, limit, backwards) {
  if (pos + limit > src.length) {
    limit = src.length - pos
  }

  var str = String.fromCharCode.apply(null, src.subarray(pos, pos + limit))
  var index = backwards ? str.lastIndexOf(key) : str.indexOf(key)
  if (index > -1) {
    index += pos
  }
  return index
}

},{"../object/trailer":49,"../object/xref":52,"../utils":56,"./lexer":54}],54:[function(require,module,exports){
var Lexer = module.exports = function(buf) {
  this.buf = buf
  this.pos = 0
  this.objects = Object.create(null)
}

Lexer.prototype.read = function(len) {
  var buf = this.buf.subarray(this.pos, this.pos + len)
  this.pos += len
  return buf
}

Lexer.prototype.getString = function(len) {
  return String.fromCharCode.apply(null, this.buf.subarray(this.pos, this.pos + len))
}

Lexer.prototype.readString = function(len) {
  var str = this.getString(len)
  this.pos += len
  return str
}

Lexer.prototype.skipEOL = function(len, trial) {
  var before = this.pos

  var done  = false
  var count = 0
  while (!done && (!len || count < len)) {
    switch (this.buf[this.pos]) {
      case 0x0d: // CR
        if (this.buf[this.pos + 1] === 0x0a) { // CR LF
          this.pos++
        }
        // falls through
      case 0x0a: // LF
        this.pos++
        count++
        break
      default:
        done = true
        break
    }
  }

  if (!count || (len && count < len)) {
    if (!trial) {
      this._error('EOL expected but not found')
    }
    this.pos = before
    return false
  }

  return true
}

Lexer.prototype.skipWhitespace = function(len, trial) {
  var before = this.pos

  var done  = false
  var count = 0
  while (!done && (!len || count < len)) {
    if (Lexer.isWhiteSpace(this.buf[this.pos])) {
      this.pos++
      count++
    } else {
      done = true
    }
  }

  if (!count || (len && count < len)) {
    if (!trial) {
      this._error('Whitespace expected but not found')
    }
    this.pos = before
    return false
  }

  return true
}

Lexer.prototype.skipSpace = function(len, trial) {
  var before = this.pos

  var done  = false
  var count = 0
  while (!done && (!len || count < len)) {
    if (this.buf[this.pos] === 0x20) {
      this.pos++
      count++
    } else {
      done = true
    }
  }

  if (!count || (len && count < len)) {
    if (!trial) {
      this._error('Space expected but not found')
    }
    this.pos = before
    return false
  }

  return true
}

Lexer.prototype.shift = function(offset) {
  this.pos += offset
}

Lexer.prototype._nextCharCode = function() {
  return this.buf[this.pos++]
}

Lexer.prototype._nextChar = function() {
  return String.fromCharCode(this.buf[this.pos++])
}

Lexer.prototype._error = function(err) {
  throw new Error(err)
}

Lexer.prototype._warning = function(warning) {
  console.warn(warning)
}

// e.g. 123 43445 +17 −98 0 34.5 −3.62 +123.6 4. −.002 0.0
Lexer.prototype.readNumber = function(trial) {
  var before = this.pos

  var c = this._nextCharCode()
  var sign = 1
  var isFloat = false
  var str = ''

  switch (true) {
    case c === 0x2b: // '+'
      break
    case c === 0x2d: // '-'
      sign = -1
      break
    case c === 0x2e: // '.'
      isFloat = true
      str = '0.'
      break
    case c < 0x30 || c > 0x39: // not a number
      if (!trial) {
        this._error('Invalid number: ' + String.fromCharCode(c))
      }
      this.pos = before
      return undefined
    default:
      str += String.fromCharCode(c)
      break
  }

  var done = false
  while (!done && (c = this._nextCharCode()) >= 0) {
    switch (true) {
      case c === 0x2e: // '.'
        if (isFloat) {
          done = true
        } else {
          isFloat = true
          str += '.'
        }
        break
      case c >= 0x30 && c <= 0x39: // 0 - 9
        str += String.fromCharCode(c)
        break
      default:
        done = true
        break
    }
  }

  this.pos--

  var nr = isFloat ? parseFloat(str, 10) : parseInt(str, 10)
  return nr * sign
}

Lexer.isWhiteSpace = Lexer.prototype.isWhiteSpace = function(c) {
  return (
    c === 0x00 || // NULL
    c === 0x09 || // TAB
    c === 0x0A || // LF
    c === 0x0C || // FF
    c === 0x0D || // CR
    c === 0x20    // SP
  )
}

},{}],55:[function(require,module,exports){
'use strict'

var Row = require('../../element/row')

var RowProxy = module.exports = function(row) {
  this.type = 'RowNode'
  this.row  = row

  this.width = this.widths = null
}

RowProxy.prototype.create = function(idx) {
  var node
  if (typeof this.row === 'function') {
    var row = new Row(this.row.opts)
    this.row(row, idx)
    node = row.createNode()
  } else {
    node = this.row.createNode()
  }

  node.width = this.width
  node.widths = this.widths

  return node
}

},{"../../element/row":12}],56:[function(require,module,exports){
// exports.extend = function(destination, source) {
//   for (var prop in source) {
//     if (prop in destination) continue
//     destination[prop] = source[prop]
//   }
//   return destination
// }

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: { value: ctor, enumerable: false }
  })
}

// exports.round = function(num) {
//   return Math.round(num * 100) / 100
// }

exports.toHex = function(n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

exports.asHex = function(ab) {
  var view = new Uint8Array(ab), hex = ''
  for (var i = 0, len = ab.byteLength; i < len; ++i) {
    hex += exports.toHex(view[i])
  }
  return hex
}

exports.toArrayBuffer = function(buf) {
  // GLOBAL[('Buffer').toString()] is used instead of Buffer to trick browserify
  // to not load a Buffer polyfill just for instance testing. The `toString()` part
  // is used to trick eslint to not throw
  var isArrayBuffer = buf instanceof ArrayBuffer
  var isBuffer = typeof GLOBAL !== 'undefined' && buf instanceof GLOBAL[('Buffer').toString()]
  if (!isArrayBuffer && !isBuffer) {
    throw new TypeError('Data must be provided as either Buffer or Arraybuffer.')
  }

  if (buf instanceof ArrayBuffer) {
    return buf
  }

  var ab = new ArrayBuffer(buf.length)
  var view = new Uint8Array(ab)
  for (var i = 0; i < buf.length; ++i) {
      view[i] = buf[i]
  }
  return ab
}

// source: http://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string/12713326#12713326
exports.uint8ToString = function(u8a) {
  var CHUNK_SZ = 0x8000
  var c = []
  for (var i = 0; i < u8a.length; i += CHUNK_SZ) {
    c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)))
  }
  return c.join('')
}

exports.formatDate = function(date) {
  var str = 'D:'
          + date.getFullYear()
          + ('00' + (date.getMonth() + 1)).slice(-2)
          + ('00' + date.getDate()).slice(-2)
          + ('00' + date.getHours()).slice(-2)
          + ('00' + date.getMinutes()).slice(-2)
          + ('00' + date.getSeconds()).slice(-2)

  var offset = date.getTimezoneOffset()
  var rel = offset === 0 ? 'Z' : (offset > 0 ? '-' : '+')
  offset = Math.abs(offset)
  var hoursOffset = Math.floor(offset / 60)
  var minutesOffset = offset - hoursOffset * 60

  str += rel
      + ('00' + hoursOffset).slice(-2)   + '\''
      + ('00' + minutesOffset).slice(-2) + '\''

  return str
}

// exports.fixedFloat = function(n) {
//  return parseFloat(n.toFixed(2))
// }

exports.colorToRgb = function(hex) {
  if (typeof hex === 'string') {
    hex = parseInt(hex.replace('#', ''), 16)
  }

  var r = (hex >> 16) / 255
  var g = ((hex >> 8) & 255) / 255
  var b = (hex & 255) / 255

  return [r, g, b]
}

exports.isRelative = function(n) {
  if (typeof n === 'number') {
    return false
  }

  return String(n).indexOf('%') > -1
}

exports.resolveWidth = function(width, maxWidth) {
  if (!width) {
    return maxWidth
  }

  var isRelative = exports.isRelative(width)
  width = parseFloat(width)
  if (isRelative) {
    if (width >= 100) return maxWidth
    return (width / 100) * maxWidth
  } else {
    if (width > maxWidth) return maxWidth
    else return width
  }
}

},{}],57:[function(require,module,exports){
'use strict'

var BaseStyle = module.exports = function() {
  this.allowBreak = null

  var args = Array.prototype.slice.call(arguments)
  if (args.length) {
    args.forEach(function(values) {
      for (var key in values) {
        if (key in this) {
          this[key] = values[key]
        }
      }
    }, this)
  }

  Object.freeze(this)
}

BaseStyle.prototype.merge = function() {
  var changed = false

  var args = Array.prototype.slice.call(arguments)
  if (args.length) {
    args.forEach(function(values) {
      for (var key in values) {
        if (key in this && this[key] !== values[key]) {
          changed = true
          break
        }
      }
    }, this)
  }

  if (changed) {
    var constructor = this.constructor
    var F = function(a) {
      return constructor.apply(this, a)
    }
    F.prototype = constructor.prototype

    return new F([this].concat(args))
  } else {
    return this
  }
}

},{}],58:[function(require,module,exports){
'use strict'

var SIDES = ['Top', 'Right', 'Bottom', 'Left']

var BoxStyle = module.exports = function() {
  this.backgroundColor = null
  this.x = null
  this.y = null
  this.minHeight = null

  this.borderWidth = 0
  this.borderColor = 0x000000
  SIDES.forEach(function(side) {
    this['border' + side + 'Width'] = null
    this['border' + side + 'Color'] = null
  }, this)

  BoxStyle.super_.apply(this, arguments)
}

require('../pdf/utils').inherits(BoxStyle, require('./container'))

SIDES.forEach(function(side) {
  BoxStyle.prototype['getBorder' + side + 'Width'] = function() {
    var value = this['border' + side + 'Width']
    return Math.max(0, value != null ? value : this.borderWidth || 0)
  }

  BoxStyle.prototype['getBorder' + side + 'Color'] = function() {
    var value = this['border' + side + 'Color']
    return value != null ? value : this.borderColor || 0x000000
  }
})

},{"../pdf/utils":56,"./container":59}],59:[function(require,module,exports){
'use strict'

var ContainerStyle = module.exports = function(values) {
  this.padding = 20

  var sides = ['Top', 'Right', 'Bottom', 'Left']
  sides.forEach(function(side) {
    var value = null
    Object.defineProperty(this, 'padding' + side, {
      enumerable: true,
      get: function() { return Math.max(0, value || this.padding || 0) },
      set: function(val) { value = val }
    })
  }, this)

  this.width  = this.minWidth  = this.maxWidth  = null
  this.height = this.minHeight = this.maxHeight = null

  ContainerStyle.super_.apply(this, arguments)
}

require('../pdf/utils').inherits(ContainerStyle, require('./text'))

ContainerStyle.reset = {
  padding: 0,
  paddingTop: 0,
  paddingRight: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  height: null
}

Object.defineProperties(ContainerStyle.prototype, {
  innerHeight: {
    enumerable: true,
    get: function() {
      return this.height - this.paddingTop - this.paddingBottom
    },
    set: function() {}
  },
  innerWidth: {
    enumerable: true,
    get: function() {
      return this.width - this.paddingLeft - this.paddingRight
    },
    set: function() {}
  }
})

},{"../pdf/utils":56,"./text":63}],60:[function(require,module,exports){
'use strict'

var DocumentStyle = module.exports = function(values) {
  this.precision = 3
  this.threshold = 64

  DocumentStyle.super_.apply(this, arguments)
}

require('../pdf/utils').inherits(DocumentStyle, require('./container'))

},{"../pdf/utils":56,"./container":59}],61:[function(require,module,exports){
'use strict'

var ImageStyle = module.exports = function() {
  this.width = null
  this.maxWidth = null
  this.height = null
  this.align = 'left'
  this.x = null
  this.y = null
  this.wrap = true

  ImageStyle.super_.apply(this, arguments)
}

require('../pdf/utils').inherits(ImageStyle, require('./base'))

},{"../pdf/utils":56,"./base":57}],62:[function(require,module,exports){
'use strict'

var DIRECTIONS = ['Vertical', 'Horizontal']
var SIDES = ['Top', 'Right', 'Bottom', 'Left']

var TableStyle = module.exports = function() {
  this.tableLayout = 'fixed'
  this.widths = []
  this.colspan = 1
  this.headerRows = 0
  this.backgroundColor = null
  this.borderWidth = 0
  this.borderColor = 0x000000

  DIRECTIONS.forEach(function(direction) {
    this['border' + direction + 'Width'] = null
    this[ 'border' + direction + 'Color'] = null
  }, this)

  SIDES.forEach(function(side) {
    this['border' + side + 'Width'] = null
    this['border' + side + 'Color'] = null
  }, this)

  TableStyle.super_.apply(this, arguments)
}

require('../pdf/utils').inherits(TableStyle, require('./container'))

DIRECTIONS.forEach(function(direction) {
  TableStyle.prototype['getBorder' + direction + 'Width'] = function() {
    var value = this['border' + direction + 'Width']
    return Math.max(0, value != null ? value : (this.borderWidth || 0))
  }

  TableStyle.prototype['getBorder' + direction + 'Color'] = function() {
    var value = this['border' + direction + 'Color']
    return value != null ? value : (this.borderColor || 0x000000)
  }
})

SIDES.forEach(function(side) {
  var direction = side === 'Right' || side === 'Left' ? 'Vertical' : 'Horizontal'

  TableStyle.prototype['getBorder' + side + 'Width'] = function() {
    var value = this['border' + side + 'Width']
    return Math.max(0, value !== null ? value : this['border' + direction + 'Width'] || this.borderWidth || 0)
  }

  TableStyle.prototype['getBorder' + side + 'Color'] = function() {
    var value = this['border' + side + 'Color']
    return value != null ? value : (this['border' + direction + 'Color'] || this.borderColor || 0x000000)
  }
})

TableStyle.reset = {
  colspan: 1,
  allowBreak: false,
  // height: null
}

},{"../pdf/utils":56,"./container":59}],63:[function(require,module,exports){
'use strict'

var TextStyle = module.exports = function() {
  this.font       = null
  this.color      = 0x000000
  this.textAlign  = 'left'
  this.fontSize   = 11
  this.lineHeight = 1
  this.whiteSpace = 'normal'

  TextStyle.super_.apply(this, arguments)
}

require('../pdf/utils').inherits(TextStyle, require('./base'))

},{"../pdf/utils":56,"./base":57}],64:[function(require,module,exports){
(function (global){
/*! http://mths.be/base64 v0.1.0 by @mathias | MIT license */
;(function(root) {

	// Detect free variables `exports`.
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`.
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code, and use
	// it as `root`.
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var InvalidCharacterError = function(message) {
		this.message = message;
	};
	InvalidCharacterError.prototype = new Error;
	InvalidCharacterError.prototype.name = 'InvalidCharacterError';

	var error = function(message) {
		// Note: the error messages used throughout this file match those used by
		// the native `atob`/`btoa` implementation in Chromium.
		throw new InvalidCharacterError(message);
	};

	var TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	// http://whatwg.org/html/common-microsyntaxes.html#space-character
	var REGEX_SPACE_CHARACTERS = /[\t\n\f\r ]/g;

	// `decode` is designed to be fully compatible with `atob` as described in the
	// HTML Standard. http://whatwg.org/html/webappapis.html#dom-windowbase64-atob
	// The optimized base64-decoding algorithm used is based on @atk’s excellent
	// implementation. https://gist.github.com/atk/1020396
	var decode = function(input) {
		input = String(input)
			.replace(REGEX_SPACE_CHARACTERS, '');
		var length = input.length;
		if (length % 4 == 0) {
			input = input.replace(/==?$/, '');
			length = input.length;
		}
		if (
			length % 4 == 1 ||
			// http://whatwg.org/C#alphanumeric-ascii-characters
			/[^+a-zA-Z0-9/]/.test(input)
		) {
			error(
				'Invalid character: the string to be decoded is not correctly encoded.'
			);
		}
		var bitCounter = 0;
		var bitStorage;
		var buffer;
		var output = '';
		var position = -1;
		while (++position < length) {
			buffer = TABLE.indexOf(input.charAt(position));
			bitStorage = bitCounter % 4 ? bitStorage * 64 + buffer : buffer;
			// Unless this is the first of a group of 4 characters…
			if (bitCounter++ % 4) {
				// …convert the first 8 bits to a single ASCII character.
				output += String.fromCharCode(
					0xFF & bitStorage >> (-2 * bitCounter & 6)
				);
			}
		}
		return output;
	};

	// `encode` is designed to be fully compatible with `btoa` as described in the
	// HTML Standard: http://whatwg.org/html/webappapis.html#dom-windowbase64-btoa
	var encode = function(input) {
		input = String(input);
		if (/[^\0-\xFF]/.test(input)) {
			// Note: no need to special-case astral symbols here, as surrogates are
			// matched, and the input is supposed to only contain ASCII anyway.
			error(
				'The string to be encoded contains characters outside of the ' +
				'Latin1 range.'
			);
		}
		var padding = input.length % 3;
		var output = '';
		var position = -1;
		var a;
		var b;
		var c;
		var d;
		var buffer;
		// Make sure any padding is handled outside of the loop.
		var length = input.length - padding;

		while (++position < length) {
			// Read three bytes, i.e. 24 bits.
			a = input.charCodeAt(position) << 16;
			b = input.charCodeAt(++position) << 8;
			c = input.charCodeAt(++position);
			buffer = a + b + c;
			// Turn the 24 bits into four chunks of 6 bits each, and append the
			// matching character for each of them to the output.
			output += (
				TABLE.charAt(buffer >> 18 & 0x3F) +
				TABLE.charAt(buffer >> 12 & 0x3F) +
				TABLE.charAt(buffer >> 6 & 0x3F) +
				TABLE.charAt(buffer & 0x3F)
			);
		}

		if (padding == 2) {
			a = input.charCodeAt(position) << 8;
			b = input.charCodeAt(++position);
			buffer = a + b;
			output += (
				TABLE.charAt(buffer >> 10) +
				TABLE.charAt((buffer >> 4) & 0x3F) +
				TABLE.charAt((buffer << 2) & 0x3F) +
				'='
			);
		} else if (padding == 1) {
			buffer = input.charCodeAt(position);
			output += (
				TABLE.charAt(buffer >> 2) +
				TABLE.charAt((buffer << 4) & 0x3F) +
				'=='
			);
		}

		return output;
	};

	var base64 = {
		'encode': encode,
		'decode': decode,
		'version': '0.1.0'
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return base64;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = base64;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (var key in base64) {
				base64.hasOwnProperty(key) && (freeExports[key] = base64[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.base64 = base64;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],65:[function(require,module,exports){

},{}],66:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

},{"./debug":67}],67:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":68}],68:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = '' + str;
  if (str.length > 10000) return;
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],69:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],70:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
var UnicodeTrie, inflate;

inflate = require('tiny-inflate');

UnicodeTrie = (function() {
  var DATA_BLOCK_LENGTH, DATA_GRANULARITY, DATA_MASK, INDEX_1_OFFSET, INDEX_2_BLOCK_LENGTH, INDEX_2_BMP_LENGTH, INDEX_2_MASK, INDEX_SHIFT, LSCP_INDEX_2_LENGTH, LSCP_INDEX_2_OFFSET, OMITTED_BMP_INDEX_1_LENGTH, SHIFT_1, SHIFT_1_2, SHIFT_2, UTF8_2B_INDEX_2_LENGTH, UTF8_2B_INDEX_2_OFFSET;

  SHIFT_1 = 6 + 5;

  SHIFT_2 = 5;

  SHIFT_1_2 = SHIFT_1 - SHIFT_2;

  OMITTED_BMP_INDEX_1_LENGTH = 0x10000 >> SHIFT_1;

  INDEX_2_BLOCK_LENGTH = 1 << SHIFT_1_2;

  INDEX_2_MASK = INDEX_2_BLOCK_LENGTH - 1;

  INDEX_SHIFT = 2;

  DATA_BLOCK_LENGTH = 1 << SHIFT_2;

  DATA_MASK = DATA_BLOCK_LENGTH - 1;

  LSCP_INDEX_2_OFFSET = 0x10000 >> SHIFT_2;

  LSCP_INDEX_2_LENGTH = 0x400 >> SHIFT_2;

  INDEX_2_BMP_LENGTH = LSCP_INDEX_2_OFFSET + LSCP_INDEX_2_LENGTH;

  UTF8_2B_INDEX_2_OFFSET = INDEX_2_BMP_LENGTH;

  UTF8_2B_INDEX_2_LENGTH = 0x800 >> 6;

  INDEX_1_OFFSET = UTF8_2B_INDEX_2_OFFSET + UTF8_2B_INDEX_2_LENGTH;

  DATA_GRANULARITY = 1 << INDEX_SHIFT;

  function UnicodeTrie(data) {
    var isBuffer, uncompressedLength, view;
    isBuffer = typeof data.readUInt32BE === 'function' && typeof data.slice === 'function';
    if (isBuffer || data instanceof Uint8Array) {
      if (isBuffer) {
        this.highStart = data.readUInt32BE(0);
        this.errorValue = data.readUInt32BE(4);
        uncompressedLength = data.readUInt32BE(8);
        data = data.slice(12);
      } else {
        view = new DataView(data.buffer);
        this.highStart = view.getUint32(0);
        this.errorValue = view.getUint32(4);
        uncompressedLength = view.getUint32(8);
        data = data.subarray(12);
      }
      data = inflate(data, new Uint8Array(uncompressedLength));
      data = inflate(data, new Uint8Array(uncompressedLength));
      this.data = new Uint32Array(data.buffer);
    } else {
      this.data = data.data, this.highStart = data.highStart, this.errorValue = data.errorValue;
    }
  }

  UnicodeTrie.prototype.get = function(codePoint) {
    var index;
    if (codePoint < 0 || codePoint > 0x10ffff) {
      return this.errorValue;
    }
    if (codePoint < 0xd800 || (codePoint > 0xdbff && codePoint <= 0xffff)) {
      index = (this.data[codePoint >> SHIFT_2] << INDEX_SHIFT) + (codePoint & DATA_MASK);
      return this.data[index];
    }
    if (codePoint <= 0xffff) {
      index = (this.data[LSCP_INDEX_2_OFFSET + ((codePoint - 0xd800) >> SHIFT_2)] << INDEX_SHIFT) + (codePoint & DATA_MASK);
      return this.data[index];
    }
    if (codePoint < this.highStart) {
      index = this.data[(INDEX_1_OFFSET - OMITTED_BMP_INDEX_1_LENGTH) + (codePoint >> SHIFT_1)];
      index = this.data[index + ((codePoint >> SHIFT_2) & INDEX_2_MASK)];
      index = (index << INDEX_SHIFT) + (codePoint & DATA_MASK);
      return this.data[index];
    }
    return this.data[this.data.length - DATA_GRANULARITY];
  };

  return UnicodeTrie;

})();

module.exports = UnicodeTrie;

},{"tiny-inflate":71}],71:[function(require,module,exports){
var TINF_OK = 0;
var TINF_DATA_ERROR = -3;

function Tree() {
  this.table = new Uint16Array(16);   /* table of code length counts */
  this.trans = new Uint16Array(288);  /* code -> symbol translation table */
}

function Data(source, dest) {
  this.source = source;
  this.sourceIndex = 0;
  this.tag = 0;
  this.bitcount = 0;
  
  this.dest = dest;
  this.destLen = 0;
  
  this.ltree = new Tree();  /* dynamic length/symbol tree */
  this.dtree = new Tree();  /* dynamic distance tree */
}

/* --------------------------------------------------- *
 * -- uninitialized global data (static structures) -- *
 * --------------------------------------------------- */

var sltree = new Tree();
var sdtree = new Tree();

/* extra bits and base tables for length codes */
var length_bits = new Uint8Array(30);
var length_base = new Uint16Array(30);

/* extra bits and base tables for distance codes */
var dist_bits = new Uint8Array(30);
var dist_base = new Uint16Array(30);

/* special ordering of code length codes */
var clcidx = new Uint8Array([
  16, 17, 18, 0, 8, 7, 9, 6,
  10, 5, 11, 4, 12, 3, 13, 2,
  14, 1, 15
]);

/* used by tinf_decode_trees, avoids allocations every call */
var code_tree = new Tree();
var lengths = new Uint8Array(288 + 32);

/* ----------------------- *
 * -- utility functions -- *
 * ----------------------- */

/* build extra bits and base tables */
function tinf_build_bits_base(bits, base, delta, first) {
  var i, sum;

  /* build bits table */
  for (i = 0; i < delta; ++i) bits[i] = 0;
  for (i = 0; i < 30 - delta; ++i) bits[i + delta] = i / delta | 0;

  /* build base table */
  for (sum = first, i = 0; i < 30; ++i) {
    base[i] = sum;
    sum += 1 << bits[i];
  }
}

/* build the fixed huffman trees */
function tinf_build_fixed_trees(lt, dt) {
  var i;

  /* build fixed length tree */
  for (i = 0; i < 7; ++i) lt.table[i] = 0;

  lt.table[7] = 24;
  lt.table[8] = 152;
  lt.table[9] = 112;

  for (i = 0; i < 24; ++i) lt.trans[i] = 256 + i;
  for (i = 0; i < 144; ++i) lt.trans[24 + i] = i;
  for (i = 0; i < 8; ++i) lt.trans[24 + 144 + i] = 280 + i;
  for (i = 0; i < 112; ++i) lt.trans[24 + 144 + 8 + i] = 144 + i;

  /* build fixed distance tree */
  for (i = 0; i < 5; ++i) dt.table[i] = 0;

  dt.table[5] = 32;

  for (i = 0; i < 32; ++i) dt.trans[i] = i;
}

/* given an array of code lengths, build a tree */
var offs = new Uint16Array(16);

function tinf_build_tree(t, lengths, off, num) {
  var i, sum;

  /* clear code length count table */
  for (i = 0; i < 16; ++i) t.table[i] = 0;

  /* scan symbol lengths, and sum code length counts */
  for (i = 0; i < num; ++i) t.table[lengths[off + i]]++;

  t.table[0] = 0;

  /* compute offset table for distribution sort */
  for (sum = 0, i = 0; i < 16; ++i) {
    offs[i] = sum;
    sum += t.table[i];
  }

  /* create code->symbol translation table (symbols sorted by code) */
  for (i = 0; i < num; ++i) {
    if (lengths[off + i]) t.trans[offs[lengths[off + i]]++] = i;
  }
}

/* ---------------------- *
 * -- decode functions -- *
 * ---------------------- */

/* get one bit from source stream */
function tinf_getbit(d) {
  /* check if tag is empty */
  if (!d.bitcount--) {
    /* load next tag */
    d.tag = d.source[d.sourceIndex++];
    d.bitcount = 7;
  }

  /* shift bit out of tag */
  var bit = d.tag & 1;
  d.tag >>>= 1;

  return bit;
}

/* read a num bit value from a stream and add base */
function tinf_read_bits(d, num, base) {
  if (!num)
    return base;

  while (d.bitcount < 24) {
    d.tag |= d.source[d.sourceIndex++] << d.bitcount;
    d.bitcount += 8;
  }

  var val = d.tag & (0xffff >>> (16 - num));
  d.tag >>>= num;
  d.bitcount -= num;
  return val + base;
}

/* given a data stream and a tree, decode a symbol */
function tinf_decode_symbol(d, t) {
  while (d.bitcount < 24) {
    d.tag |= d.source[d.sourceIndex++] << d.bitcount;
    d.bitcount += 8;
  }
  
  var sum = 0, cur = 0, len = 0;
  var tag = d.tag;

  /* get more bits while code value is above sum */
  do {
    cur = 2 * cur + (tag & 1);
    tag >>>= 1;
    ++len;

    sum += t.table[len];
    cur -= t.table[len];
  } while (cur >= 0);
  
  d.tag = tag;
  d.bitcount -= len;

  return t.trans[sum + cur];
}

/* given a data stream, decode dynamic trees from it */
function tinf_decode_trees(d, lt, dt) {
  var hlit, hdist, hclen;
  var i, num, length;

  /* get 5 bits HLIT (257-286) */
  hlit = tinf_read_bits(d, 5, 257);

  /* get 5 bits HDIST (1-32) */
  hdist = tinf_read_bits(d, 5, 1);

  /* get 4 bits HCLEN (4-19) */
  hclen = tinf_read_bits(d, 4, 4);

  for (i = 0; i < 19; ++i) lengths[i] = 0;

  /* read code lengths for code length alphabet */
  for (i = 0; i < hclen; ++i) {
    /* get 3 bits code length (0-7) */
    var clen = tinf_read_bits(d, 3, 0);
    lengths[clcidx[i]] = clen;
  }

  /* build code length tree */
  tinf_build_tree(code_tree, lengths, 0, 19);

  /* decode code lengths for the dynamic trees */
  for (num = 0; num < hlit + hdist;) {
    var sym = tinf_decode_symbol(d, code_tree);

    switch (sym) {
      case 16:
        /* copy previous code length 3-6 times (read 2 bits) */
        var prev = lengths[num - 1];
        for (length = tinf_read_bits(d, 2, 3); length; --length) {
          lengths[num++] = prev;
        }
        break;
      case 17:
        /* repeat code length 0 for 3-10 times (read 3 bits) */
        for (length = tinf_read_bits(d, 3, 3); length; --length) {
          lengths[num++] = 0;
        }
        break;
      case 18:
        /* repeat code length 0 for 11-138 times (read 7 bits) */
        for (length = tinf_read_bits(d, 7, 11); length; --length) {
          lengths[num++] = 0;
        }
        break;
      default:
        /* values 0-15 represent the actual code lengths */
        lengths[num++] = sym;
        break;
    }
  }

  /* build dynamic trees */
  tinf_build_tree(lt, lengths, 0, hlit);
  tinf_build_tree(dt, lengths, hlit, hdist);
}

/* ----------------------------- *
 * -- block inflate functions -- *
 * ----------------------------- */

/* given a stream and two trees, inflate a block of data */
function tinf_inflate_block_data(d, lt, dt) {
  while (1) {
    var sym = tinf_decode_symbol(d, lt);

    /* check for end of block */
    if (sym === 256) {
      return TINF_OK;
    }

    if (sym < 256) {
      d.dest[d.destLen++] = sym;
    } else {
      var length, dist, offs;
      var i;

      sym -= 257;

      /* possibly get more bits from length code */
      length = tinf_read_bits(d, length_bits[sym], length_base[sym]);

      dist = tinf_decode_symbol(d, dt);

      /* possibly get more bits from distance code */
      offs = d.destLen - tinf_read_bits(d, dist_bits[dist], dist_base[dist]);

      /* copy match */
      for (i = offs; i < offs + length; ++i) {
        d.dest[d.destLen++] = d.dest[i];
      }
    }
  }
}

/* inflate an uncompressed block of data */
function tinf_inflate_uncompressed_block(d) {
  var length, invlength;
  var i;
  
  /* unread from bitbuffer */
  while (d.bitcount > 8) {
    d.sourceIndex--;
    d.bitcount -= 8;
  }

  /* get length */
  length = d.source[d.sourceIndex + 1];
  length = 256 * length + d.source[d.sourceIndex];

  /* get one's complement of length */
  invlength = d.source[d.sourceIndex + 3];
  invlength = 256 * invlength + d.source[d.sourceIndex + 2];

  /* check length */
  if (length !== (~invlength & 0x0000ffff))
    return TINF_DATA_ERROR;

  d.sourceIndex += 4;

  /* copy block */
  for (i = length; i; --i)
    d.dest[d.destLen++] = d.source[d.sourceIndex++];

  /* make sure we start next block on a byte boundary */
  d.bitcount = 0;

  return TINF_OK;
}

/* inflate stream from source to dest */
function tinf_uncompress(source, dest) {
  var d = new Data(source, dest);
  var bfinal, res;

  do {
    /* read final block flag */
    bfinal = tinf_getbit(d);

    /* read block type (2 bits) */
    btype = tinf_read_bits(d, 2, 0);

    /* decompress block */
    switch (btype) {
      case 0:
        /* decompress uncompressed block */
        res = tinf_inflate_uncompressed_block(d);
        break;
      case 1:
        /* decompress block with fixed huffman trees */
        res = tinf_inflate_block_data(d, sltree, sdtree);
        break;
      case 2:
        /* decompress block with dynamic huffman trees */
        tinf_decode_trees(d, d.ltree, d.dtree);
        res = tinf_inflate_block_data(d, d.ltree, d.dtree);
        break;
      default:
        res = TINF_DATA_ERROR;
    }

    if (res !== TINF_OK)
      throw new Error('Data error');

  } while (!bfinal);

  if (d.destLen < d.dest.length) {
    if (typeof d.dest.slice === 'function')
      return d.dest.slice(0, d.destLen);
    else
      return d.dest.subarray(0, d.destLen);
  }
  
  return d.dest;
}

/* -------------------- *
 * -- initialization -- *
 * -------------------- */

/* build fixed huffman trees */
tinf_build_fixed_trees(sltree, sdtree);

/* build extra bits and base tables */
tinf_build_bits_base(length_bits, length_base, 4, 3);
tinf_build_bits_base(dist_bits, dist_base, 2, 1);

/* fix a special case */
length_bits[28] = 0;
length_base[28] = 258;

module.exports = tinf_uncompress;

},{}],72:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
(function() {
  var AI, AL, B2, BA, BB, BK, CB, CJ, CL, CM, CP, CR, EX, GL, H2, H3, HL, HY, ID, IN, IS, JL, JT, JV, LF, NL, NS, NU, OP, PO, PR, QU, RI, SA, SG, SP, SY, WJ, XX, ZW;

  exports.OP = OP = 0;

  exports.CL = CL = 1;

  exports.CP = CP = 2;

  exports.QU = QU = 3;

  exports.GL = GL = 4;

  exports.NS = NS = 5;

  exports.EX = EX = 6;

  exports.SY = SY = 7;

  exports.IS = IS = 8;

  exports.PR = PR = 9;

  exports.PO = PO = 10;

  exports.NU = NU = 11;

  exports.AL = AL = 12;

  exports.HL = HL = 13;

  exports.ID = ID = 14;

  exports.IN = IN = 15;

  exports.HY = HY = 16;

  exports.BA = BA = 17;

  exports.BB = BB = 18;

  exports.B2 = B2 = 19;

  exports.ZW = ZW = 20;

  exports.CM = CM = 21;

  exports.WJ = WJ = 22;

  exports.H2 = H2 = 23;

  exports.H3 = H3 = 24;

  exports.JL = JL = 25;

  exports.JV = JV = 26;

  exports.JT = JT = 27;

  exports.RI = RI = 28;

  exports.AI = AI = 29;

  exports.BK = BK = 30;

  exports.CB = CB = 31;

  exports.CJ = CJ = 32;

  exports.CR = CR = 33;

  exports.LF = LF = 34;

  exports.NL = NL = 35;

  exports.SA = SA = 36;

  exports.SG = SG = 37;

  exports.SP = SP = 38;

  exports.XX = XX = 39;

}).call(this);

},{}],73:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
(function() {
  var AI, AL, BA, BK, CB, CI_BRK, CJ, CP_BRK, CR, DI_BRK, ID, IN_BRK, LF, LineBreaker, NL, NS, PR_BRK, SA, SG, SP, UnicodeTrie, WJ, XX, base64, characterClasses, classTrie, data, fs, pairTable, _ref, _ref1;

  UnicodeTrie = require('unicode-trie');

  

  base64 = require('base64-js');

  _ref = require('./classes'), BK = _ref.BK, CR = _ref.CR, LF = _ref.LF, NL = _ref.NL, CB = _ref.CB, BA = _ref.BA, SP = _ref.SP, WJ = _ref.WJ, SP = _ref.SP, BK = _ref.BK, LF = _ref.LF, NL = _ref.NL, AI = _ref.AI, AL = _ref.AL, SA = _ref.SA, SG = _ref.SG, XX = _ref.XX, CJ = _ref.CJ, ID = _ref.ID, NS = _ref.NS, characterClasses = _ref.characterClasses;

  _ref1 = require('./pairs'), DI_BRK = _ref1.DI_BRK, IN_BRK = _ref1.IN_BRK, CI_BRK = _ref1.CI_BRK, CP_BRK = _ref1.CP_BRK, PR_BRK = _ref1.PR_BRK, pairTable = _ref1.pairTable;

  data = base64.toByteArray("AA4IAAAAAAAAAhqg5VV7NJtZvz7fTC8zU5deplUlMrQoWqmqahD5So0aipYWrUhVFSVBQ10iSTtUtW6nKDVF6k7d75eQfEUbFcQ9KiFS90tQEolcP23nrLPmO+esr/+f39rr/a293t/e7/P8nmfvlz0O6RvrBJADtbBNaD88IOKTOmOrCqhu9zE770vc1pBV/xL5dxj2V7Zj4FGSomFKStCWNlV7hG1VabZfZ1LaHbFrRwzzLjzPoi1UHDnlV/lWbhgIIJvLBp/pu7AHEdRnIY+ROdXxg4fNpMdTxVnnm08OjozejAVsBqwqz8kddGRlRxsd8c55dNZoPuex6a7Dt6L0NNb03sqgTlR2/OT7eTt0Y0WnpUXxLsp5SMANc4DsmX4zJUBQvznwexm9tsMH+C9uRYMPOd96ZHB29NZjCIM2nfO7tsmQveX3l2r7ft0N4/SRJ7kO6Y8ZCaeuUQ4gMTZ67cp7TgxvlNDsPgOBdZi2YTam5Q7m3+00l+XG7PrDe6YoPmHgK+yLih7fAR16ZFCeD9WvOVt+gfNW/KT5/M6rb/9KERt+N1lad5RneVjzxXHsLofuU+TvrEsr3+26sVz5WJh6L/svoPK3qepFH9bysDljWtD1F7KrxzW1i9r+e/NLxV/acts7zuo304J9+t3Pd6Y6u8f3EAqxNRgv5DZjaI3unyvkvHPya/v3mWVYOC38qBq11+yHZ2bAyP1HbkV92vdno7r2lxz9UwCdCJVfd14NLcpO2CadHS/XPJ9doXgz5vLv/1OBVS3gX0D9n6LiNIDfpilO9RsLgZ2W/wIy8W/Rh93jfoz4qmRV2xElv6p2lRXQdO6/Cv8f5nGn3u0wLXjhnvClabL1o+7yvIpvLfT/xsKG30y/sTvq30ia9Czxp9dr9v/e7Yn/O0QJXxxBOJmceP/DBFa1q1v6oudn/e6qc/37dUoNvnYL4plQ9OoneYOh/r8fOFm7yl7FETHY9dXd5K2n/qEc53dOEe1TTJcvCfp1dpTC334l0vyaFL6mttNEbFjzO+ZV2mLk0qc3BrxJ4d9gweMmjRorxb7vic0rSq6D4wzAyFWas1TqPE0sLI8XLAryC8tPChaN3ALEZSWmtB34SyZcxXYn/E4Tg0LeMIPhgPKD9zyHGMxxhxnDDih7eI86xECTM8zodUCdgffUmRh4rQ8zyA6ow/Aei+01a8OMfziQQ+GAEkhwN/cqUFYAVzA9ex4n6jgtsiMvXf5BtXxEU4hSphvx3v8+9au8eEekEEpkrkne/zB1M+HAPuXIz3paxKlfe8aDMfGWAX6Md6PuuAdKHFVH++Ed5LEji94Z5zeiJIxbmWeN7rr1/ZcaBl5/nimdHsHgIH/ssyLUXZ4fDQ46HnBb+hQqG8yNiKRrXL/b1IPYDUsu3dFKtRMcjqlRvONd4xBvOufx2cUHuk8pmG1D7PyOQmUmluisVFS9OWS8fPIe8LiCtjwJKnEC9hrS9uKmISI3Wa5+vdXUG9dtyfr7g/oJv2wbzeZU838G6mEvntUb3SVV/fBZ6H/sL+lElzeRrHy2Xbe7UWX1q5sgOQ81rv+2baej4fP4m5Mf/GkoxfDtT3++KP7do9Jn26aa6xAhCf5L9RZVfkWKCcjI1eYbm2plvTEqkDxKC402bGzXCYaGnuALHabBT1dFLuOSB7RorOPEhZah1NjZIgR/UFGfK3p1ElYnevOMBDLURdpIjrI+qZk4sffGbRFiXuEmdFjiAODlQCJvIaB1rW61Ljg3y4eS4LAcSgDxxZQs0DYa15wA032Z+lGUfpoyOrFo3mg1sRQtN/fHHCx3TrM8eTrldMbYisDLXbUDoXMLejSq0fUNuO1muX0gEa8vgyegkqiqqbC3W0S4cC9Kmt8MuS/hFO7Xei3f8rSvIjeveMM7kxjUixOrl6gJshe4JU7PhOHpfrRYvu7yoAZKa3Buyk2J+K5W+nNTz1nhJDhRUfDJLiUXxjxXCJeeaOe/r7HlBP/uURc/5efaZEPxr55Qj39rfTLkugUGyMrwo7HAglfEjDriehF1jXtwJkPoiYkYQ5aoXSA7qbCBGKq5hwtu2VkpI9xVDop/1xrC52eiIvCoPWx4lLl40jm9upvycVPfpaH9/o2D4xKXpeNjE2HPQRS+3RFaYTc4Txw7Dvq5X6JBRwzs9mvoB49BK6b+XgsZVJYiInTlSXZ+62FT18mkFVcPKCJsoF5ahb19WheZLUYsSwdrrVM3aQ2XE6SzU2xHDS6iWkodk5AF6F8WUNmmushi8aVpMPwiIfEiQWo3CApONDRjrhDiVnkaFsaP5rjIJkmsN6V26li5LNM3JxGSyKgomknTyyrhcnwv9Qcqaq5utAh44W30SWo8Q0XHKR0glPF4fWst1FUCnk2woFq3iy9fAbzcjJ8fvSjgKVOfn14RDqyQuIgaGJZuswTywdCFSa89SakMf6fe+9KaQMYQlKxiJBczuPSho4wmBjdA+ag6QUOr2GdpcbSl51Ay6khhBt5UXdrnxc7ZGMxCvz96A4oLocxh2+px+1zkyLacCGrxnPzTRSgrLKpStFpH5ppKWm7PgMKZtwgytKLOjbGCOQLTm+KOowqa1sdut9raj1CZFkZD0jbaKNLpJUarSH5Qknx1YiOxdA5L6d5sfI/unmkSF65Ic/AvtXt98Pnrdwl5vgppQ3dYzWFwknZsy6xh2llmLxpegF8ayLwniknlXRHiF4hzzrgB8jQ4wdIqcaHCEAxyJwCeGkXPBZYSrrGa4vMwZvNN9aK0F4JBOK9mQ8g8EjEbIQVwvfS2D8GuCYsdqwqSWbQrfWdTRUJMqmpnWPax4Z7E137I6brHbvjpPlfNZpF1d7PP7HB/MPHcHVKTMhLO4f3CZcaccZEOiS2DpKiQB5KXDJ+Ospcz4qTRCRxgrKEQIgUkKLTKKwskdx2DWo3bg3PEoB5h2nA24olwfKSR+QR6TAvEDi/0czhUT59RZmO1MGeKGeEfuOSPWfL+XKmhqpZmOVR9mJVNDPKOS49Lq+Um10YsBybzDMtemlPCOJEtE8zaXhsaqEs9bngSJGhlOTTMlCXly9Qv5cRN3PVLK7zoMptutf7ihutrQ/Xj7VqeCdUwleTTKklOI8Wep9h7fCY0kVtDtIWKnubWAvbNZtsRRqOYl802vebPEkZRSZc6wXOfPtpPtN5HI63EUFfsy7U/TLr8NkIzaY3vx4A28x765XZMzRZTpMk81YIMuwJ5+/zoCuZj1wGnaHObxa5rpKZj4WhT670maRw04w0e3cZW74Z0aZe2n05hjZaxm6urenz8Ef5O6Yu1J2aqYAlqsCXs5ZB5o1JJ5l3xkTVr8rJQ09NLsBqRRDT2IIjOPmcJa6xQ1R5yGP9jAsj23xYDTezdyqG8YWZ7vJBIWK56K+iDgcHimiQOTIasNSua1fOBxsKMMEKd15jxTl+3CyvGCR+UyRwuSI2XuwRIPoNNclPihfJhaq2mKkNijwYLY6feqohktukmI3KDvOpN7ItCqHHhNuKlxMfBAEO5LjW2RKh6lE5Hd1dtAOopac/Z4FdsNsjMhXz/ug8JGmbVJTA+VOBJXdrYyJcIn5+OEeoK8kWEWF+wdG8ZtZHKSquWDtDVyhFPkRVqguKFkLkKCz46hcU1SUY9oJ2Sk+dmq0kglqk4kqKT1CV9JDELPjK1WsWGkEXF87g9P98e5ff0mIupm/w6vc3kCeq04X5bgJQlcMFRjlFWmSk+kssXCAVikfeAlMuzpUvCSdXiG+dc6KrIiLxxhbEVuKf7vW7KmDQI95bZe3H9mN3/77F6fZ2Yx/F9yClllj8gXpLWLpd5+v90iOaFa9sd7Pvx0lNa1o1+bkiZ69wCiC2x9UIb6/boBCuNMB/HYR0RC6+FD9Oe5qrgQl6JbXtkaYn0wkdNhROLqyhv6cKvyMj1Fvs2o3OOKoMYTubGENLfY5F6H9d8wX1cnINsvz+wZFQu3zhWVlwJvwBEp69Dqu/ZnkBf3nIfbx4TK7zOVJH5sGJX+IMwkn1vVBn38GbpTg9bJnMcTOb5F6Ci5gOn9Fcy6Qzcu+FL6mYJJ+f2ZZJGda1VqruZ0JRXItp8X0aTjIcJgzdaXlha7q7kV4ebrMsunfsRyRa9qYuryBHA0hc1KVsKdE+oI0ljLmSAyMze8lWmc5/lQ18slyTVC/vADTc+SNM5++gztTBLz4m0aVUKcfgOEExuKVomJ7XQDZuziMDjG6JP9tgR7JXZTeo9RGetW/Xm9/TgPJpTgHACPOGvmy2mDm9fl09WeMm9sQUAXP3Su2uApeCwJVT5iWCXDgmcuTsFgU9Nm6/PusJzSbDQIMfl6INY/OAEvZRN54BSSXUClM51im6Wn9VhVamKJmzOaFJErgJcs0etFZ40LIF3EPkjFTjGmAhsd174NnOwJW8TdJ1Dja+E6Wa6FVS22Haj1DDA474EesoMP5nbspAPJLWJ8rYcP1DwCslhnn+gTFm+sS9wY+U6SogAa9tiwpoxuaFeqm2OK+uozR6SfiLCOPz36LiDlzXr6UWd7BpY6mlrNANkTOeme5EgnnAkQRTGo9T6iYxbUKfGJcI9B+ub2PcyUOgpwXbOf3bHFWtygD7FYbRhb+vkzi87dB0JeXl/vBpBUz93VtqZi7AL7C1VowTF+tGmyurw7DBcktc+UMY0E10Jw4URojf8NdaNpN6E1q4+Oz+4YePtMLy8FPRP");

  classTrie = new UnicodeTrie(data);

  LineBreaker = (function() {
    var Break, mapClass, mapFirst;

    function LineBreaker(string) {
      this.string = string;
      this.pos = 0;
      this.lastPos = 0;
      this.curClass = null;
      this.nextClass = null;
    }

    LineBreaker.prototype.nextCodePoint = function() {
      var code, next;
      code = this.string.charCodeAt(this.pos++);
      next = this.string.charCodeAt(this.pos);
      if ((0xd800 <= code && code <= 0xdbff) && (0xdc00 <= next && next <= 0xdfff)) {
        this.pos++;
        return ((code - 0xd800) * 0x400) + (next - 0xdc00) + 0x10000;
      }
      return code;
    };

    mapClass = function(c) {
      switch (c) {
        case AI:
          return AL;
        case SA:
        case SG:
        case XX:
          return AL;
        case CJ:
          return NS;
        default:
          return c;
      }
    };

    mapFirst = function(c) {
      switch (c) {
        case LF:
        case NL:
          return BK;
        case CB:
          return BA;
        case SP:
          return WJ;
        default:
          return c;
      }
    };

    LineBreaker.prototype.nextCharClass = function(first) {
      if (first == null) {
        first = false;
      }
      return mapClass(classTrie.get(this.nextCodePoint()));
    };

    Break = (function() {
      function Break(position, required) {
        this.position = position;
        this.required = required != null ? required : false;
      }

      return Break;

    })();

    LineBreaker.prototype.nextBreak = function() {
      var cur, lastClass, shouldBreak;
      if (this.curClass == null) {
        this.curClass = mapFirst(this.nextCharClass());
      }
      while (this.pos < this.string.length) {
        this.lastPos = this.pos;
        lastClass = this.nextClass;
        this.nextClass = this.nextCharClass();
        if (this.curClass === BK || (this.curClass === CR && this.nextClass !== LF)) {
          this.curClass = mapFirst(mapClass(this.nextClass));
          return new Break(this.lastPos, true);
        }
        cur = (function() {
          switch (this.nextClass) {
            case SP:
              return this.curClass;
            case BK:
            case LF:
            case NL:
              return BK;
            case CR:
              return CR;
            case CB:
              return BA;
          }
        }).call(this);
        if (cur != null) {
          this.curClass = cur;
          if (this.nextClass === CB) {
            return new Break(this.lastPos);
          }
          continue;
        }
        shouldBreak = false;
        switch (pairTable[this.curClass][this.nextClass]) {
          case DI_BRK:
            shouldBreak = true;
            break;
          case IN_BRK:
            shouldBreak = lastClass === SP;
            break;
          case CI_BRK:
            shouldBreak = lastClass === SP;
            if (!shouldBreak) {
              continue;
            }
            break;
          case CP_BRK:
            if (lastClass !== SP) {
              continue;
            }
        }
        this.curClass = this.nextClass;
        if (shouldBreak) {
          return new Break(this.lastPos);
        }
      }
      if (this.pos >= this.string.length) {
        if (this.lastPos < this.string.length) {
          this.lastPos = this.string.length;
          return new Break(this.string.length);
        } else {
          return null;
        }
      }
    };

    return LineBreaker;

  })();

  module.exports = LineBreaker;

}).call(this);

},{"./classes":72,"./pairs":74,"base64-js":69,"unicode-trie":70}],74:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
(function() {
  var CI_BRK, CP_BRK, DI_BRK, IN_BRK, PR_BRK;

  exports.DI_BRK = DI_BRK = 0;

  exports.IN_BRK = IN_BRK = 1;

  exports.CI_BRK = CI_BRK = 2;

  exports.CP_BRK = CP_BRK = 3;

  exports.PR_BRK = PR_BRK = 4;

  exports.pairTable = [[PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, CP_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [PR_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, CI_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK], [IN_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, CI_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, IN_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [IN_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK], [IN_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [IN_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [IN_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [IN_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, IN_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, DI_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, IN_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, DI_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [IN_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, CI_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, PR_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [IN_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [IN_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, CI_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, IN_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, IN_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, IN_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, IN_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, IN_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK]];

}).call(this);

},{}],75:[function(require,module,exports){
//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

(function() {
  var _global = this;

  // Unique ID creation requires a high quality random # generator.  We feature
  // detect to determine the best RNG source, normalizing to a function that
  // returns 128-bits of randomness, since that's what's usually required
  var _rng;

  // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
  //
  // Moderately fast, high quality
  if (typeof(_global.require) == 'function') {
    try {
      var _rb = _global.require('crypto').randomBytes;
      _rng = _rb && function() {return _rb(16);};
    } catch(e) {}
  }

  if (!_rng && _global.crypto && crypto.getRandomValues) {
    // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
    //
    // Moderately fast, high quality
    var _rnds8 = new Uint8Array(16);
    _rng = function whatwgRNG() {
      crypto.getRandomValues(_rnds8);
      return _rnds8;
    };
  }

  if (!_rng) {
    // Math.random()-based (RNG)
    //
    // If all else fails, use Math.random().  It's fast, but is of unspecified
    // quality.
    var  _rnds = new Array(16);
    _rng = function() {
      for (var i = 0, r; i < 16; i++) {
        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
        _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
      }

      return _rnds;
    };
  }

  // Buffer class to use
  var BufferClass = typeof(_global.Buffer) == 'function' ? _global.Buffer : Array;

  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) { // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }

  // **`v1()` - Generate time-based UUID**
  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html

  // random #'s we need to init node and clockseq
  var _seedBytes = _rng();

  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
  var _nodeId = [
    _seedBytes[0] | 0x01,
    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
  ];

  // Per 4.2.2, randomize (14 bit) clockseq
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

  // Previous uuid creation time
  var _lastMSecs = 0, _lastNSecs = 0;

  // See https://github.com/broofa/node-uuid for API details
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];

    options = options || {};

    var clockseq = options.clockseq != null ? options.clockseq : _clockseq;

    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
    var msecs = options.msecs != null ? options.msecs : new Date().getTime();

    // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
    var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;

    // Time since last uuid creation (in msecs)
    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

    // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq == null) {
      clockseq = clockseq + 1 & 0x3fff;
    }

    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
      nsecs = 0;
    }

    // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;

    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000;

    // `time_low`
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;

    // `time_mid`
    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;

    // `time_high_and_version`
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;

    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = clockseq >>> 8 | 0x80;

    // `clock_seq_low`
    b[i++] = clockseq & 0xff;

    // `node`
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }

    return buf ? buf : unparse(b);
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof(options) == 'string') {
      buf = options == 'binary' ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  var uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;

  if (typeof(module) != 'undefined' && module.exports) {
    // Publish as node.js module
    module.exports = uuid;
  } else  if (typeof define === 'function' && define.amd) {
    // Publish as AMD module
    define(function() {return uuid;});
 

  } else {
    // Publish as global (in browsers)
    var _previousRoot = _global.uuid;

    // **`noConflict()` - (browser only) to reset global 'uuid' var**
    uuid.noConflict = function() {
      _global.uuid = _previousRoot;
      return uuid;
    };

    _global.uuid = uuid;
  }
}).call(this);

},{}],76:[function(require,module,exports){
var Struct = require('structjs')

var Entry = module.exports = new Struct({
  tag:      Struct.String(4),
  checkSum: Struct.Uint32,
  offset:   Struct.Uint32,
  length:   Struct.Uint32
})

var Directory = module.exports = new Struct({
  scalerType:    Struct.Int32,
  numTables:     Struct.Uint16,
  searchRange:   Struct.Uint16.with({
    $packing: function() {
      return easySearchable(this.numTables) * 16
    }
  }),
  entrySelector: Struct.Uint16.with({
    $packing: function() {
      return Math.log(easySearchable(this.numTables)) / Math.LN2
    }
  }),
  rangeShift:    Struct.Uint16.with({
    $packing: function() {
      var searchRange = easySearchable(this.numTables) * 16
      return this.numTables * 16 - searchRange
    }
  }),
  entries:       Struct.Hash(Entry, 'tag', Struct.Ref('numTables'))
})

function easySearchable(numTables) {
  var result, next = 1
  while ((next = next * 2) <= numTables) {
    result = next
  }
  return result
}

},{"structjs":89}],77:[function(require,module,exports){
var Subset = module.exports = function(font, opts) {
  this.font    = font.clone()
  this.opts    = opts || {}
  this.subset  = { '32': 32 }
  this.mapping = { '32': 32 }
  this.pos     = 33
}

Subset.prototype.use = function(chars) {
  for (var i = 0, len = chars.length; i < len; ++i) {
    var code = chars.charCodeAt(i)
    if (code in this.mapping || code < 33) {
      continue
    }

    if (this.opts.remap === false) {
      this.subset[code] = code
      this.mapping[code] = code
    } else {
      this.subset[this.pos] = code
      this.mapping[code] = this.pos++
    }
  }
}

Subset.prototype.encode = function(str) {
  var codes = []
  for (var i = 0, len = str.length; i < len; ++i) {
    codes.push(this.mapping[str.charCodeAt(i)])
  }
  return String.fromCharCode.apply(String, codes)
}

Subset.prototype.cmap = function() {
  var mapping = {}
  for (code in this.subset) {
    var value = this.font.codeMap[this.subset[code]]
    if (value !== undefined) mapping[code] = value
  }
  return mapping
}

Subset.prototype.glyphs = function() {
  // collect used glyph ids
  var self = this, ids = [0]
  for (var pos in this.subset) {
    var code = this.subset[pos]
      , val = this.font.codeMap[code]
    if (val !== undefined && !!!~ids.indexOf(val))
      ids.push(val)
  }
  ids.sort()

  // collect the actual glyphs
  function collect(ids) {
    var glyphs = {}
    ids.forEach(function(id) {
      var glyph = self.font.tables.glyf.for(id)
      glyphs[id] = glyph
      if (glyph !== null ? glyph.isCompound : false) {
        var compounds = collect(glyph.ids)
        for (id in compounds) {
          glyphs[id] =  compounds[id]
        }
      }
    })
    return glyphs
  }

  return collect(ids)
}

Subset.prototype.embed = function() {
  var cmap   = this.font.tables.cmap.embed(this.cmap())
    , glyphs = this.glyphs()

  this.font.tables.cmap.subtables = [cmap.subtable]

  var old2new = { 0: 0 }
  for (var code in cmap.charMap) {
    var ids = cmap.charMap[code]
    old2new[ids.old] = ids.new
  }

  var nextGlyphID = cmap.maxGlyphID
  for (var oldID in glyphs) {
    if (!(oldID in old2new))
      old2new[oldID] = nextGlyphID++
  }

  var new2old = {}
  for (var id in old2new) {
    new2old[old2new[id]] = id
  }
  var newIDs = Object.keys(new2old).sort(function(a, b) {
    return a - b
  })
  var oldIDs = newIDs.map(function(id) {
    return new2old[id]
  })

  // encode the font tables
  var offsets = this.font.tables.glyf.embed(glyphs, oldIDs, old2new)
  this.font.tables.loca.embed(offsets)
  this.font.tables.hmtx.embed(oldIDs)
  this.font.tables.hhea.embed(oldIDs)
  this.font.tables.maxp.embed(oldIDs)
  this.font.tables.name.embed(cmap.charMap, this.opts.trimNames)
}

Subset.prototype.save = function() {
  return this.font.save()
}
},{}],78:[function(require,module,exports){
var Struct = require('structjs')

var Table = new Struct({
  format:        Struct.Uint16
}, { storage: true, offset: Struct.Ref('offset') })

Table.conditional(function() { return this.format === 4 }, {
  length:          Struct.Uint16,
  language:        Struct.Uint16,
  segCount:        Struct.Uint16.with({
    $unpacked: function(value) {
      return value / 2
    },
    $packing: function(value) {
      return value * 2
    }
  }),
  searchRange:     Struct.Uint16,
  entrySelector:   Struct.Uint16,
  rangeShift:      Struct.Uint16,
  endCode:         Struct.Array(Struct.Uint16, Struct.Ref('segCount')),
  reservedPad:     Struct.Uint16,
  startCode:       Struct.Array(Struct.Uint16, Struct.Ref('segCount')),
  idDelta:         Struct.Array(Struct.Uint16, Struct.Ref('segCount')),
  idRangeOffset:   Struct.Array(Struct.Uint16, Struct.Ref('segCount')),
  glyphIndexArray: Struct.Array(Struct.Uint16, function() {
    var length = (this.length - (8 + this.segCount * 4) * 2) / 2
    return length
  })
})

Table.prototype.$unpacked = function() {
  if (this.format !== 4) return
  this.codeMap = {}
  for (var i = 0, len = this.segCount; i < len; ++i) {
    var endCode = this.endCode[i], startCode = this.startCode[i]
      , idDelta = this.idDelta[i], idRangeOffset = this.idRangeOffset[i]
    
    for (var code = startCode; code <= endCode; ++code) {
      var id
      if (idRangeOffset === 0) id = code + idDelta
      else {
        var index = idRangeOffset / 2 + (code - startCode) - (this.segCount - i)
        id = this.glyphIndexArray[index] || 0 // because some TTF fonts are broken
        if (id != 0) id += idDelta
      }
      
      this.codeMap[code] = id & 0xFFFF
    }
  }
}

var SubTable = new Struct({
  platformID:         Struct.Uint16,
  platformSpecificID: Struct.Uint16,
  offset:             Struct.Uint32,
  format:             Struct.Uint16.from(Struct.Ref('offset')),
  table:              Table
})

Object.defineProperty(SubTable.prototype, 'isUnicode', {
  enumerable: true,
  get: function() {
           //this.format === 4 &&
    return ((this.platformID === 3 // Windows platform-specific encoding
             && this.platformSpecificID === 1) // http://www.microsoft.com/typography/otspec/name.htm
           || this.platformID === 0) // Unicode platform-specific encoding
  }
})

var Cmap = module.exports = new Struct({
  version:         Struct.Uint16,
  numberSubtables: Struct.Uint16,
  subtables:       Struct.Array(SubTable, Struct.Ref('numberSubtables')),
  tables:          Struct.Storage('subtables.table')
})

Cmap.prototype.embed = function(cmap) {
  var codes = Object.keys(cmap).sort(function(a, b) {
    return a - b
  })
  
  var nextId = 0, map = {}, charMap = {}, last = diff = null, endCodes = [], startCodes = []
  codes.forEach(function(code) {
    var old = cmap[code]
    if (map[old] === undefined) map[old] = ++nextId
    charMap[code] = { old: old, new: map[old] }
    var delta = map[old] - code
    if (last === null || delta !== diff) {
      if (last) endCodes.push(last)
      startCodes.push(code)
      diff = delta
    }
    last = code
  })
  
  if (last) endCodes.push(last)
  endCodes.push(0xFFFF)
  startCodes.push(0xFFFF)
  
  var segCount      = startCodes.length
    , segCountX2    = segCount * 2
    , searchRange   = 2 * Math.pow(Math.log(segCount) / Math.LN2, 2)
    , entrySelector = Math.log(searchRange / 2) / Math.LN2
    , rangeShift    = 2 * segCount - searchRange
  
  var deltas = []
    , rangeOffsets = []
    , glyphIDs = []
  
  for (var i = 0, len = startCodes.length; i < len; ++i) {
    var startCode = startCodes[i]
      , endCode = endCodes[i]
      
    if (startCode === 0xFFFF) {
      deltas.push(0)
      rangeOffsets.push(0)
      break
    }
    
    var startGlyph = charMap[startCode].new
    if (startCode - startGlyph >= 0x8000) {
      deltas.push(0)
      rangeOffsets.push(2 * (glyphIDs.length + segCount - i))
      
      for (var code = startCode; code < endCode; ++startCode) {
        glyphIDs.push(charMap[code].new)
      }
    } else {
      deltas.push(startGlyph - startCode)
      rangeOffsets.push(0)
    }
  }
  
  var subtable = new SubTable({
    platformID: 3,
    platformSpecificID: 1,
    offset: 12,
    table: new Table({
      format: 4,
      length: 16 + segCount * 8 + glyphIDs.length * 2,
      language: 0,
      segCount: segCount,
      searchRange: searchRange,
      entrySelector: entrySelector,
      rangeShift: rangeShift,
      endCode: endCodes,
      reservedPad: 0,
      startCode: startCodes,
      idDelta: deltas,
      idRangeOffset: rangeOffsets,
      glyphIndexArray: glyphIDs
    })
  })
      
  return {
    charMap: charMap,
    subtable: subtable,
    maxGlyphID: nextId + 1
  }
}
},{"structjs":89}],79:[function(require,module,exports){
var Struct = require('structjs')

module.exports = function(loca) {
  return new Glyf(loca)
}

var Glyf = function(loca) {
  this.loca  = loca
  this.cache = {}
}

Glyf.prototype.clone = function() {
  var clone = new Glyf(this.loca)
  clone.cache = this.cache
  return clone
}

Glyf.prototype.embed = function(glyphs, mapping, old2new) {
  var offsets = [], offset = 0
  this.mapping = mapping
  this.glyphs = glyphs
  mapping.forEach(function(id) {
    var glyph = glyphs[id]
    offsets.push(offset)
    if (!glyph) return
    glyph.embed(old2new)
    offset += glyph.lengthFor() * glyph.sizeFor()
  })
  offsets.push(offset)
  return offsets
}

Glyf.prototype.for = function(id) {
  if (id in this.cache) return this.cache[id]
  
  var index  = this.loca.indexOf(id)
    , length = this.loca.lengthOf(id)
    
  if (length === 0) return this.cache[id] = null
  return this.cache[id] = (new Glyph()).unpack(new DataView(this.view.buffer, this.view.byteOffset + index, length))
}

Glyf.prototype.unpack = function(view) {
  this.view = view
  return this
}

Glyf.prototype.pack = function(view, offset) {
  var self = this
  this.mapping.forEach(function(id) {
    var glyph = self.glyphs[id]
    if (!glyph) return
    glyph.pack(view, offset)
    offset += glyph.lengthFor() * glyph.sizeFor()
  })
}

Glyf.prototype.lengthFor = function() {
  return 1
}

Glyf.prototype.sizeFor = function() {
  var size = 0
  for (var id in this.cache) {
    var glyph = this.cache[id]
    if (!glyph) continue
    size += glyph.lengthFor() * glyph.sizeFor()
  }
  return size
}

var ARG_1_AND_2_ARE_WORDS    = 0x0001
  , WE_HAVE_A_SCALE          = 0x0008
  , MORE_COMPONENTS          = 0x0020
  , WE_HAVE_AN_X_AND_Y_SCALE = 0x0040
  , WE_HAVE_A_TWO_BY_TWO     = 0x0080
  , WE_HAVE_INSTRUCTIONS     = 0x0100

// Currently, it is all about being able to create font subsets.
// Therefore, it is not necessary to actually decompose the glyph
// into it's parts. Important are the locations within the provided
// buffer to be able to rewrite the glyph ids for subsets.
var Glyph = function() {
}

Glyph.prototype.unpack = function(view) {
  this.view = view
  this.isCompound = view.getInt16(0) === -1
  
  if (this.isCompound) {
    this.ids = []
    this.offsets = []
    var offset = 10

    // thanks to https://github.com/prawnpdf/ttfunk
    while(true) {
      var flags = this.view.getInt16(offset)
        , id    = this.view.getInt16(offset + 2)
      this.ids.push(id)
      this.offsets.push(offset + 2)
      
      if (!(flags & MORE_COMPONENTS)) break
      
      offset += 4
      
      if (flags & ARG_1_AND_2_ARE_WORDS) offset += 4
      else                               offset += 2
      
      if (flags & WE_HAVE_A_TWO_BY_TWO)          offset += 8
      else if (flags & WE_HAVE_AN_X_AND_Y_SCALE) offset += 4
      else if (flags & WE_HAVE_A_SCALE)          offset += 2
    }
  }
  
  return this
}

Glyph.prototype.pack = function(view, offset) {
  for (var i = 0, len = this.view.byteLength; i < len; ++i) {
    view.setUint8(offset + i, this.view.getUint8(i))
  }
}

Glyph.prototype.lengthFor = function() {
  return 1
}

Glyph.prototype.sizeFor = function() {
  return this.view.byteLength
}

Glyph.prototype.embed = function(mapping) {
  if (!this.isCompound) return
  var self = this
  this.ids.forEach(function(id, i) {
    self.view.setUint16(self.offsets[i], mapping[id])
  })
}
},{"structjs":89}],80:[function(require,module,exports){
var Struct = require('structjs')
module.exports = new Struct({
  version:            Struct.Int32,
  fontRevision:       Struct.Int32,
  checkSumAdjustment: Struct.Uint32,
  magicNumber:        Struct.Uint32,
  flags:              Struct.Uint16,
  unitsPerEm:         Struct.Uint16,
  createdA:           Struct.Int32,
  createdB:           Struct.Int32,
  modifiedA:          Struct.Int32,
  modifiedB:          Struct.Int32,
  xMin:               Struct.Int16,
  yMin:               Struct.Int16,
  xMax:               Struct.Int16,
  yMax:               Struct.Int16,
  macStyle:           Struct.Uint16,
  lowestRecPPEM:      Struct.Uint16,
  fontDirectionHint:  Struct.Int16,
  indexToLocFormat:   Struct.Int16,
  glyphDataFormat:    Struct.Int16
})
},{"structjs":89}],81:[function(require,module,exports){
var Struct = require('structjs')

var Hhea = module.exports = new Struct({
  version:             Struct.Int32,
  ascent:              Struct.Int16,
  descent:             Struct.Int16,
  lineGap:             Struct.Int16,
  advanceWidthMax:     Struct.Uint16,
  minLeftSideBearing:  Struct.Int16,
  minRightSideBearing: Struct.Int16,
  xMaxExtent:          Struct.Int16,
  caretSlopeRise:      Struct.Int16,
  caretSlopeRun:       Struct.Int16,
  caretOffset:         Struct.Int16,
  reserved1:           Struct.Int16,
  reserved2:           Struct.Int16,
  reserved3:           Struct.Int16,
  reserved4:           Struct.Int16,
  metricDataFormat:    Struct.Int16,
  numOfLongHorMetrics: Struct.Uint16
})

Hhea.prototype.embed = function(ids) {
  this.numOfLongHorMetrics = ids.length
}
},{"structjs":89}],82:[function(require,module,exports){
var Struct = require('structjs')

var AdvanceWidth = new Struct({
  advanceWidth:    Struct.Uint16,
  leftSideBearing: Struct.Int16
})

module.exports = function(numOfLongHorMetrics, numGlyphs) {
  var Hmtx = new Struct({
    hMetrics:        Struct.Array(AdvanceWidth, numOfLongHorMetrics),
    leftSideBearing: Struct.Array(Struct.Uint16, numGlyphs - numOfLongHorMetrics)
  })
  
  Hmtx.prototype.$unpacked = function() {
    var metrics = this.metrics = []
    this.hMetrics.forEach(function(e) {
      metrics.push(e.advanceWidth)
    })
    var last = metrics[metrics.length - 1]
    this.leftSideBearing.forEach(function(mapping) {
      metrics.push(last)
    })
  }
  
  Hmtx.prototype.for = function(id) {
    if (id in this.hMetrics) return this.hMetrics[id]
    
    return new AdvanceWidth({
      advanceWidth:    this.hMetrics[this.hMetrics.length - 1].advance,
      leftSideBearing: this.leftSideBearing[id - this.hMetrics.length]
    })
  }
  
  Hmtx.prototype.embed = function(ids) {
    var self = this, metrics = []
    ids.forEach(function(id) {
      metrics.push(self.for(id))
    })
    
    this.hMetrics = metrics
    this.leftSideBearing = []
    
    this._definition.hMetrics._length = ids.length
    this._definition.leftSideBearing._length = 0
  }
  
  return Hmtx
}


},{"structjs":89}],83:[function(require,module,exports){
var Struct = require('structjs')
module.exports = function(indexToLocFormat, numGlyphs) {
  var Loca
  switch (indexToLocFormat) {
    case 0:
      Loca = new Struct({
        offsets: Struct.Array(Struct.Uint16, numGlyphs + 1)
      })
      Loca.prototype.$unpacked = function() {
        for (var i = 0, len = this.offsets.length; i < len; ++i) {
          this.offsets[i] *= 2
        }
      }
      Loca.prototype.$packing = function() {
        for (var i = 0, len = this.offsets.length; i < len; ++i) {
          this.offsets[i] /= 2
        }
      }
      break
    case 1:
      Loca = new Struct({
        offsets: Struct.Array(Struct.Uint32, numGlyphs + 1)
      })
      break
  }
  
  Loca.prototype.indexOf = function(id) {
    return this.offsets[id]
  }

  Loca.prototype.lengthOf = function(id) {
    return this.offsets[id + 1] - this.offsets[id]
  }
  
  Loca.prototype.embed = function(offsets) {
    this._definition.offsets._length = offsets.length
    this.offsets = offsets
  }
  
  return Loca
}
},{"structjs":89}],84:[function(require,module,exports){
var Struct = require('structjs')

var Maxp = module.exports = new Struct({
  version:               Struct.Int32,
  numGlyphs:             Struct.Uint16,
  maxPoints:             Struct.Uint16,
  maxContours:           Struct.Uint16,
  maxComponentPoints:    Struct.Uint16,
  maxComponentContours:  Struct.Uint16,
  maxZones:              Struct.Uint16,
  maxTwilightPoints:     Struct.Uint16,
  maxStorage:            Struct.Uint16,
  maxFunctionDefs:       Struct.Uint16,
  maxInstructionDefs:    Struct.Uint16,
  maxStackElements:      Struct.Uint16,
  maxSizeOfInstructions: Struct.Uint16,
  maxComponentElements:  Struct.Uint16,
  maxComponentDepth:     Struct.Uint16
})

Maxp.prototype.embed = function(ids) {
  this.numGlyphs = ids.length
}
},{"structjs":89}],85:[function(require,module,exports){
var Struct = require('structjs')

var Record = new Struct({
  platformID: Struct.Uint16,
  encodingID: Struct.Uint16,
  languageID: Struct.Uint16,
  nameID:     Struct.Uint16,
  length:     Struct.Uint16.with({
    $unpacked: function(value) {
      return value / 2
    },
    $packing: function(value) {
      return value * 2
    }
  }),
  offset:     Struct.Uint16,
  string:     Struct.String({
    storage: true, size: 2,
    length: Struct.Ref('length'),
    offset: Struct.Ref('offset')
  })
})

var Name = module.exports = new Struct({
  format:       Struct.Uint16,
  count:        Struct.Uint16,
  stringOffset: Struct.Uint16,
  records:      Struct.Array(Record, Struct.Ref('count')),
  names:        Struct.Storage('records.string', Struct.Ref('stringOffset'))
})

Name.prototype.embed = function(charMap, trimNames) {
  var postscriptName = null
  for (var i = 0; i < this.records.length; ++i) {
    var record = this.records[i]

    if (trimNames && record.platformID !== 0) { // unicode
      this.records.splice(i--, 1)
      continue
    }

    switch (record.nameID) {
      case 0: // copyright
      case 2: // font subfamily name
      case 5: // version string
      case 7: // trademark
      case 13: // license description
      case 14: // license info URL
        // preserve
        break
      case 1: // font family name
      case 3: // unique font identifier
      case 4: // full font name
      case 6: // postscript name
        record.string = "TTFJS+" + record.string
        break
      default:
        this.records.splice(i--, 1)
        break
    }
  }
}
},{"structjs":89}],86:[function(require,module,exports){
var Struct = require('structjs')
module.exports = (new Struct({
  version:             Struct.Uint16,
  xAvgCharWidth:       Struct.Int16,
  usWeightClass:       Struct.Uint16,
  usWidthClass:        Struct.Uint16,
  fsType:              Struct.Uint16,
  ySubscriptXSize:     Struct.Int16,
  ySubscriptYSize:     Struct.Int16,
  ySubscriptXOffset:   Struct.Int16,
  ySubscriptYOffset:   Struct.Int16,
  ySuperscriptXSize:   Struct.Int16,
  ySuperscriptYSize:   Struct.Int16,
  ySuperscriptXOffset: Struct.Int16,
  ySuperscriptYOffset: Struct.Int16,
  yStrikeoutSize:      Struct.Int16,
  yStrikeoutPosition:  Struct.Int16,
  sFamilyClass:        Struct.Int16,
  panose:              Struct.Array(Struct.Uint8, 10),
  ulUnicodeRange1:     Struct.Uint32,
  ulUnicodeRange2:     Struct.Uint32,
  ulUnicodeRange3:     Struct.Uint32,
  ulUnicodeRange4:     Struct.Uint32,
  achVendID:           Struct.Array(Struct.Int8, 4),
  fsSelection:         Struct.Uint16,
  usFirstCharIndex:    Struct.Uint16,
  usLastCharIndex:     Struct.Uint16
}))
.conditional(function() { return this.version > 0 }, {
  sTypoAscender:       Struct.Int16,
  sTypoDescender:      Struct.Int16,
  sTypoLineGap:        Struct.Int16,
  usWinAscent:         Struct.Uint16,
  usWinDescent:        Struct.Uint16,
  ulCodePageRange1:    Struct.Uint32,
  ulCodePageRange2:    Struct.Uint32
})
.conditional(function() { return this.version > 1 }, {
  sxHeight:            Struct.Int16,
  sCapHeight:          Struct.Int16,
  usDefaultChar:       Struct.Uint16,
  usBreakChar:         Struct.Uint16,
  usMaxContext:        Struct.Uint16
})


},{"structjs":89}],87:[function(require,module,exports){
var Struct = require('structjs')

var Post = module.exports = new Struct({
  version:            Struct.Int32,
  italicAngleHi:      Struct.Int16,
  italicAngleLow:     Struct.Int16,
  underlinePosition:  Struct.Int16,
  underlineThickness: Struct.Int16,
  isFixedPitch:       Struct.Uint32,
  minMemType42:       Struct.Uint32,
  maxMemType42:       Struct.Uint32,
  minMemType1:        Struct.Uint32,
  maxMemType1:        Struct.Uint32
})
},{"structjs":89}],88:[function(require,module,exports){
var Directory = require('./directory')
  , Subset = require('./subset')

var TTFFont = module.exports = function(buffer) {
  var self = this
  this.buffer = buffer instanceof TTFFont
                ? buffer.buffer
                : buffer = buffer instanceof ArrayBuffer ? buffer : toArrayBuffer(buffer)

  if (buffer instanceof TTFFont) {
    this.directory = buffer.directory.clone()
  } else {
    this.directory = new Directory()
    this.directory.unpack(new DataView(buffer))
  }

  var scalerType = this.directory.scalerType.toString(16)
  if (scalerType !== '74727565' && scalerType !== '10000') {
    throw new Error('Not a TrueType font')
  }

  this.tables = {}
  function unpackTable(table, args) {
    var name = table.replace(/[^a-z0-9]/ig, '').toLowerCase()
      , entry = self.directory.entries[table]
    if (!entry) return
    if (buffer instanceof TTFFont) {
      self.tables[name] = self.tables[table] = buffer.tables[table].clone()
      return
    }
    var Table = require('./table/' + name)
      , view  = new DataView(buffer, entry.offset, entry.length)
    if (args) Table = Table.apply(undefined, args)
    self.tables[name] = self.tables[table] = (typeof Table === 'function' ? new Table : Table).unpack(view)
  }

  // workaround for browserify
  if (false) {
    require('./table/cmap')
    require('./table/head')
    require('./table/hhea')
    require('./table/maxp')
    require('./table/hmtx')
    require('./table/loca')
    require('./table/glyf')
    require('./table/name')
    require('./table/post')
    require('./table/os2')
  }

  unpackTable('cmap')
  for (var i = 0, len = this.tables.cmap.subtables.length; i < len; ++i) {
    var subtable = this.tables.cmap.subtables[i]
    if (subtable.isUnicode) {
      self.codeMap = subtable.table.codeMap
      break
    }
  }
  if (!this.codeMap) throw new Error('Font does not contain a Unicode Cmap.')

  unpackTable('head')
  unpackTable('hhea')
  unpackTable('maxp')
  unpackTable('hmtx', [this.tables.hhea.numOfLongHorMetrics, this.tables.maxp.numGlyphs])
  unpackTable('loca', [this.tables.head.indexToLocFormat, this.tables.maxp.numGlyphs])
  unpackTable('glyf', [this.tables.loca])
  unpackTable('name')
  unpackTable('post')
  // I don't want to bother with post's versions, therefore skip glyhp names
  // by setting version to 3.0, TODO: bother with it ...
  this.tables.post.version = 196608
  unpackTable('OS/2')

  this.baseFont = this.tables.name.records.filter(function(record) {
    return record.nameID === 6
  })[0].string
  this.fontName = 'TTFJS+' + this.baseFont

  this.scaleFactor = 1000.0 / this.tables.head.unitsPerEm

  this.italicAngle = parseFloat(this.tables.post.italicAngleHi + '.' + this.tables.post.italicAngleLow)
  var os2 = this.tables.os2 || {}
  this.ascent      = Math.round((os2.sTypoAscender  || this.tables.hhea.ascent) * this.scaleFactor)
  this.descent     = Math.round((os2.sTypoDescender || this.tables.hhea.descent) * this.scaleFactor)
  this.lineGap     = Math.round((os2.sTypoLineGap   || this.tables.hhea.lineGap) * this.scaleFactor)
  this.capHeight   = os2.sCapHeight || this.ascent
  this.stemV       = 0
  this.bbox        = [this.tables.head.xMin, this.tables.head.yMin, this.tables.head.xMax, this.tables.head.yMax].map(function(val) {
    return Math.round(val * self.scaleFactor)
  })

  var flags = 0, familyClass = (os2.sFamilyClass || 0) >> 8
    , isSerif = !!~[1, 2, 3, 4, 5, 6, 7].indexOf(familyClass)
  if (this.tables.post.isFixedPitch) flags |= 1 << 0
  if (isSerif)                       flags |= 1 << 1
  if (familyClass === 10)            flags |= 1 << 3
  if (this.italicAngle !== 0)        flags |= 1 << 6
  /* assume not being symbolic */    flags |= 1 << 5
  this.flags = flags

  this.avgCharWidth = this.tables.os2 && this.tables.os2.xAvgCharWidth || 0
}

TTFFont.prototype.stringWidth = function(string, size) {
  var width = 0, scale = size / this.tables.head.unitsPerEm
  for (var i = 0, len = string.length; i < len; ++i) {
    var code = string.charCodeAt(i) //- 32 // - 32 because of non AFM font

    if (code < 32) {
      continue
    }

    var gid = this.codeMap[code]
    width += this.tables.hmtx.metrics[gid] || this.avgCharWidth
  }
  return width * scale
}

TTFFont.prototype.lineHeight = function(size, includeGap) {
  if (includeGap == null) includeGap = false
  var gap = includeGap ? this.lineGap : 0
  return (this.ascent + gap - this.descent) / 1000 * size
}

TTFFont.prototype.lineDescent = function(size) {
  return this.descent / 1000 * size
}

TTFFont.prototype.subset = function(opts) {
  return new Subset(this, opts)
}

TTFFont.TABLES = ['cmap', 'glyf', 'loca', 'hmtx', 'hhea', 'maxp', 'post', 'name', 'head', 'OS/2']

TTFFont.prototype.clone = function() {
  var clone = new TTFFont(this)
  clone.tables.glyf.view = this.tables.glyf.view
  return clone
}

TTFFont.prototype.save = function() {
  var self = this, tables = TTFFont.TABLES
  for (var name in this.directory.entries) {
    if (!!!~tables.indexOf(name)) delete this.directory.entries[name]
  }

  // calculate total size
  var size = offset = this.directory.lengthFor(this.directory, true) * this.directory.sizeFor(this.directory, true)

  tables.forEach(function(name) {
    if (!(name in self.directory.entries)) return
    var table = self.tables[name]
    var length = table ? table.lengthFor(table, true) * table.sizeFor(table, true)
                       : self.directory.entries[name].length
    size += length + length % 4
  })

  // prepare head
  this.tables.head.checkSumAdjustment = 0

  var view = new DataView(new ArrayBuffer(size))

  tables.forEach(function(name) {
    if (!(name in self.directory.entries)) return
    var table = self.tables[name], entry = self.directory.entries[name]
    if (!table) {
      var from = new DataView(self.buffer, entry.offset, entry.length)
      for (var i = 0; i < entry.length; ++i) view.setUint8(offset + i, from.getUint8(i))
      entry.offset = offset
    } else {
      table.pack(view, offset)
      entry.offset = offset
      entry.length = table.lengthFor(table, true) * table.sizeFor(table, true)
    }

    // pad up to a length completely divisible by 4
    var padding = entry.length % 4, length = entry.length + padding
    for (var i = entry.offset + entry.length, to = i + padding; i < to; ++i)
      view.setInt8(i, 0)

    // checksum
    var sum = 0
    for (var i = 0; i < length; i += 4)
      sum += view.getInt32(offset + i)
    entry.checkSum = sum

    // update offset for the next table
    offset += length
  })

  this.directory.pack(view, 0)

  // file checksum
  var sum = 0
  for (var i = 0; i < size; i += 4)
    sum += view.getInt32(i)
  this.tables.head.checkSumAdjustment = 0xB1B0AFBA - sum
  this.tables.head.pack(view, this.directory.entries.head.offset)

  return view.buffer
}

TTFFont.Subset = Subset

function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
  }
  return ab;
}
},{"./directory":76,"./subset":77,"./table/cmap":78,"./table/glyf":79,"./table/head":80,"./table/hhea":81,"./table/hmtx":82,"./table/loca":83,"./table/maxp":84,"./table/name":85,"./table/os2":86,"./table/post":87}],89:[function(require,module,exports){
var StructNumber    = require('./types/number')
  , StructString    = require('./types/string')
  , StructHash      = require('./types/hash')
  , StructArray     = require('./types/array')
  , StructReference = require('./types/reference')
  , StructStorage   = require('./types/storage')
  , utils           = require('./utils')

var Struct = module.exports = function(definition, opts) {
  if (!opts) opts = {}
    
  var StructType = function(values) {
    Object.defineProperties(this, {
      _view:       { writable: true, value: null },
      _offset:     { writable: true, value: null },
      _definition: { writable: false, value: definition}
    })
    
    for (var key in values) {
      if (key in definition) this[key] = cloneValue(values[key])
    }
    
    var self = this
    extensions.forEach(function(extension) {
      for (var key in values) {
        if (key in extension.extension) self[key] = cloneValue(values[key])
      }
    })
  }

  Object.defineProperties(StructType, {
    _offset:     { writable: true,  value: null },
    _definition: { writable: false, value: definition }
  })
  StructType.storage = opts.storage
  StructType._offset = opts.offset
  utils.methodsFor(StructType, '_offset',  'offsetFor', 'setOffset')

  var extensions = []
  StructType.conditional = function(condition, extension) {
    extensions.push({ condition: condition, extension: extension })
    return this
  }

  StructType.prototype.unpack = function(view, offset) {
    if (!(view instanceof DataView))
      throw new Error('DataView expected')
  
    if (!offset) offset = 0
    
    this._view = view
  
    var self = this
    function apply(definition) {
      for (var prop in definition) {
        var type = definition[prop]
        definition[prop].prop = prop
        if (type.storage) continue
        self[prop] = type.read(view, offset)
        if (typeof type.$unpacked === 'function')
          self[prop] = type.$unpacked.call(self, self[prop])
        if (self[prop] === undefined) delete self[prop]
        if (!type.external)
          offset += type.lengthFor(self) * type.sizeFor(self)
      }
    }
    apply.parent = this
    apply(definition)

    extensions.forEach(function(extension) {
      if (!extension.condition.call(self)) return
      apply(extension.extension)
    })
  
    if (typeof this.$unpacked === 'function')
      this.$unpacked()
  
    return this
  }

  StructType.prototype.pack = function(view, offset) {
    // console.log('Size: %d, Length: %d', this.sizeFor(this, true), this.lengthFor(this, true))
    if (typeof this.$packing === 'function')
      this.$packing()
      
    if (!view) view = new DataView(new ArrayBuffer(this.lengthFor(this, true) * this.sizeFor(this, true)))
    if (!offset) offset = 0

    var self = this
    function apply(definition) {
      var start = offset
      // write Storages first
      for (var prop in definition) {
        var type = definition[prop]
        if (type.external || type.storage) continue
        if (type instanceof StructStorage)
          type.write(view, offset, self[prop], offset - start)
        offset += type.lengthFor(self, true) * type.sizeFor(self, true)
      }
      offset = start
      // write everything left other than StructNumber second
      for (var prop in definition) {
        var type = definition[prop]
        if (type.external || type.storage) continue
        if (!(type instanceof StructNumber) && !(type instanceof StructStorage))
          type.write(view, offset, self[prop])
        offset += type.lengthFor(self, true) * type.sizeFor(self, true)
      }
      // write StructNumber last
      offset = start
      for (var prop in definition) {
        var type = definition[prop]
        if (type.external || type.storage) continue
        var value = self[prop]
        if (typeof type.$packing === 'function')
          value = type.$packing.call(self, value)
        if (type instanceof StructNumber)
          type.write(view, offset, value)
        offset += type.lengthFor(self, true) * type.sizeFor(self, true)
      }
    }
    apply.parent = this
    apply(definition)

    extensions.forEach(function(extension) {
      if (!extension.condition.call(self)) return
      apply(extension.extension)
    })

    return view.buffer
  }
  
  StructType.read = function read(buffer, offset) {
    var self = new this, parent = read.caller.parent
      , shift = this.storage ? this.offsetFor(parent) : offset
    self.unpack(buffer, shift)
    return self
  }

  StructType.write = function write(buffer, offset, value, relativeOffset) {
    var parent = write.caller.parent
      , shift = this.storage ? offset + this.offsetFor(parent) : offset
    this.setOffset(this.storage ? relativeOffset + this.offsetFor(parent) : offset, parent)
    value.pack(buffer, shift)
  }

  StructType.prototype.lengthFor = StructType.lengthFor = function() {
    return 1
  }

  StructType.prototype.sizeFor = StructType.sizeFor = function(parent, writing) {
    var self = this
    function sizeOf(definition) {
      return Object.keys(definition)
      .filter(function(prop) {
        return !definition[prop].external && !definition[prop].storage
      })
      .map(function(prop) {
        return definition[prop].lengthFor(parent, !!writing) * definition[prop].sizeFor(parent, !!writing)
      })
      .reduce(function(lhs, rhs) {
        return lhs + rhs
      }, 0)
    }
    var size = sizeOf(definition)
    extensions.forEach(function(extension) {
      if (!extension.condition.call(parent)) return
      size += sizeOf(extension.extension)
    })
    return size
  }
  
  StructType.prototype.clone = function() {
    var clone = new StructType(this)
    if (typeof clone.$unpacked === 'function') clone.$unpacked()
    return clone
  }

  return StructType
}

Struct.Int8    = new StructNumber('getInt8',    'setInt8',    1)
Struct.Uint8   = new StructNumber('getUint8',   'setUint8',   1)
Struct.Int16   = new StructNumber('getInt16',   'setInt16',   2)
Struct.Uint16  = new StructNumber('getUint16',  'setUint16',  2)
Struct.Int32   = new StructNumber('getInt32',   'setInt32',   4)
Struct.Uint32  = new StructNumber('getUint32',  'setUint32',  4)
Struct.Float32 = new StructNumber('getFloat32', 'setFloat32', 4)
Struct.Float64 = new StructNumber('getFloat64', 'setFloat64', 8)

Struct.String = function(length) {
  return new StructString(length)
}

Struct.Hash = function(struct, key, length) {
  return new StructHash(struct, key, length)
}

Struct.Array = function(struct, length) {
  return new StructArray(struct, length)
}

Struct.Reference = Struct.Ref = function(prop) {
  return new StructReference(prop)
}

Struct.Storage = function(path, opts) {
  return new StructStorage(path, opts)
}

// Helper

function cloneValue(val) {
  if (val === undefined) {
    return undefined
  } else if (typeof val.clone === 'function') {
    return val.clone()
  } else if (Array.isArray(val)) {
    return [].concat(val)
  } else if (typeof val === 'object') {
    var clone = {}
    for (key in val)
      clone[key] = cloneValue(val[key])
    return clone
  } else {
    return val
  }
}
},{"./types/array":90,"./types/hash":91,"./types/number":92,"./types/reference":93,"./types/storage":94,"./types/string":95,"./utils":96}],90:[function(require,module,exports){
var utils = require('../utils')
  , StructReference = require('./reference')

var StructArray = module.exports = function(struct, length) {
  this.struct = struct
  Object.defineProperties(this, {
    _length: { value: length, writable: true }
  })
}

StructArray.prototype.read = function read(buffer, offset) {
  var arr = [], parent = read.caller.parent
  for (var i = 0, len = this.lengthFor(parent); i < len; ++i) {
    var child
    if (typeof this.struct === 'function') {
      child = new this.struct
      child.unpack(buffer, offset)
      offset += child.lengthFor(parent) * child.sizeFor(parent)
    } else {
      child = this.struct.read(buffer, offset)
      offset += this.struct.lengthFor(parent) * this.struct.sizeFor(parent)
    }
    arr.push(child)
  }
  return arr
}

StructArray.prototype.write = function write(buffer, offset, arr) {
  var parent = write.caller.parent, child
  this.setLength(this.lengthFor(parent, true), parent)
  for (var i = 0, len = this.lengthFor(parent, true); i < len; ++i) {
    if ((child = arr[i]) === undefined) break
    if (typeof this.struct === 'function') {
      child.pack(buffer, offset)
      offset += child.lengthFor(parent) * child.sizeFor(parent)
    } else {
      this.struct.write(buffer, offset, child)
      offset += this.struct.lengthFor(parent) * this.struct.sizeFor(parent)
    }
  }
}

StructArray.prototype.sizeFor = function(parent) {
  return (this.struct.sizeFor ? this.struct.sizeFor(parent) : this.struct.prototype.sizeFor(parent))
       * (this.struct.lengthFor ? this.struct.lengthFor(parent) : this.struct.prototype.lengthFor(parent))
}

StructArray.prototype.lengthFor = function(parent, writing) {
  if (!this._length) return 0
  if (this._length instanceof StructReference) {
    if (writing) return parent[this.prop].length
    return parent[this._length.prop]
  } else if (typeof this._length === 'function') {
    return this._length.call(parent)
  }
  return this._length
}

StructArray.prototype.setLength = function(value, parent) {
  if (this._length instanceof StructReference)
    parent[this._length.prop] = value
  else if (typeof this._length === 'function') {
    return
  } 
  else this._length = value
}
},{"../utils":96,"./reference":93}],91:[function(require,module,exports){
var utils = require('../utils')
  , StructReference = require('./reference')

var StructHash = module.exports = function(struct, key, length) {
  this.struct = struct
  this.key    = key
  Object.defineProperties(this, {
    _length: { value: length, writable: true }
  })
}

StructHash.prototype.read = function read(buffer, offset) {
  var hash = {}, parent = read.caller.parent
  for (var i = 0, len = this.lengthFor(parent); i < len; ++i) {
    var child = new this.struct
    child.unpack(buffer, offset)
    offset += child.lengthFor(parent) * child.sizeFor(parent)
    hash[child[this.key]] = child
  }
  return hash
}

StructHash.prototype.write = function write(buffer, offset, hash) {
  var keys = Object.keys(hash), parent = write.caller.parent, child
  this.setLength(this.lengthFor(parent, true), parent)
  for (var i = 0, len =  this.lengthFor(parent); i < len; ++i) {
    if (!(child = hash[keys[i]])) continue
    child.pack(buffer, offset)
    offset += child.lengthFor(parent) * child.sizeFor(parent)
  }
}

StructHash.prototype.sizeFor = function(parent) {
   return (this.struct.sizeFor ? this.struct.sizeFor(parent) : this.struct.prototype.sizeFor(parent))
        * (this.struct.lengthFor ? this.struct.lengthFor(parent) : this.struct.prototype.lengthFor(parent))
}

StructHash.prototype.lengthFor = function(parent, writing) {
  if (!this._length) return 0
  if (this._length instanceof StructReference) {
    if (writing) return Object.keys(parent[this.prop]).length
    return parent[this._length.prop]
  }
  return this._length
}

StructHash.prototype.setLength = function(value, parent) {
  if (this._length instanceof StructReference)
    parent[this._length.prop] = value
  else this._length = value
}

},{"../utils":96,"./reference":93}],92:[function(require,module,exports){
var utils = require('../utils')

var StructNumber = module.exports = function(read, write, length) {
  this.methods = { read: read, write: write }
  Object.defineProperties(this, {
    _offset: { value: null, writable: true },
    _length: { value: null, writable: true }
  })
  utils.options.call(this, length)
}

StructNumber.prototype.with = function(opts) {
  if (!opts.length) opts.length = this._length
  return new StructNumber(this.methods.read, this.methods.write, opts)
}

StructNumber.prototype.from = function(offset) {
  return this.with({ external: true, offset: offset })
}

StructNumber.prototype.read = function read(buffer, offset) {
  var parent = read.caller.parent
  return buffer[this.methods.read](this.external ? this.offsetFor(parent) : offset)
}

StructNumber.prototype.write = function write(buffer, offset, value) {
  var parent = write.caller.parent
  buffer[this.methods.write](this.external ? this.offsetFor(parent) : offset, value)
}

StructNumber.prototype.lengthFor = function() {
  return 1
}

StructNumber.prototype.sizeFor = function() {
  return this._length
}

utils.methodsFor(StructNumber.prototype, '_offset', 'offsetFor', 'setOffset')
},{"../utils":96}],93:[function(require,module,exports){
var StructReference = module.exports = function(prop) {
  this.prop = prop
}
},{}],94:[function(require,module,exports){
var utils = require('../utils')
  , StructReference = require('./reference')
  , StructArray     = require('./array')

var StructStorage = module.exports = function(path, opts) {
  this.path = path
  if (opts instanceof StructReference) 
    opts = { offset: opts }
  opts = opts || {}
  Object.defineProperties(this, {
    _offset: { value: opts.offset, writable: true }
  })
}

StructStorage.prototype.read = function read(view, offset) {
  var parent = read.caller.parent
    , shift  = this.offsetFor(parent) || offset
  !function traverse(path, definition, target) {
    var step = path.shift(), type = definition[step]
    traverse.parent = target
    if (!path.length) {
      target[step] = type.read(view, shift)
    } else if (type instanceof StructArray) {
      target[step].forEach(function(target) {
        traverse(path.concat([]), type.struct._definition, target)
      })
    } else {
      traverse(path, type, target[step])
    }
  }(this.path.split('.'), parent._definition, parent)
}

StructStorage.prototype.write = function write(view, offset, _, relativeOffset) {
  var parent = write.caller.parent, shift = 0
  this.setOffset(relativeOffset, parent)
  !function traverse(path, definition, target) {
    var step = path.shift(), type = definition[step]
    traverse.parent = target
    if (!path.length) {
      type.setOffset(shift, target)
      var value = target[step], target = type.prototype ? target[step] : target
      type.write(view, offset, value, relativeOffset)
      shift += type.lengthFor(target, true) * type.sizeFor(target, true)
    } else if (type instanceof StructArray) {
      target[step].forEach(function(target) {
        traverse(path.concat([]), type.struct._definition, target)
      })
    } else {
      traverse(path, type, target[step])
    }
  }(this.path.split('.'), parent._definition, parent)
}

StructStorage.prototype.lengthFor = function() {
  return 1
}

StructStorage.prototype.sizeFor = function(parent, writing) {
  var size = 0
  !function traverse(path, definition, target) {
    var step = path.shift(), type = definition[step]
    traverse.parent = target
    if (!path.length) {
      if (type.prototype) target = target[step]
      size += type.lengthFor(target, writing) * type.sizeFor(target, writing)
    } else if (type instanceof StructArray) {
      target[step].forEach(function(target) {
        traverse(path.concat([]), type.struct._definition, target)
      })
    } else {
      traverse(path, type, target[step])
    }
  }(this.path.split('.'), parent._definition, parent)
  return size
}

utils.methodsFor(StructStorage.prototype, '_offset', 'offsetFor', 'setOffset')
},{"../utils":96,"./array":90,"./reference":93}],95:[function(require,module,exports){
var utils = require('../utils')
  , StructReference = require('./reference')

var StructString = module.exports = function(length) {
  Object.defineProperties(this, {
    _offset: { value: null, writable: true },
    _length: { value: null, writable: true },
    _size:   { value: null, writable: true }
  })
  utils.options.call(this, length)
}

StructString.prototype.read = function read(buffer, offset) {
  var str = [], storage, parent = read.caller.parent
    , shift = this.external
      ? this.offsetFor(parent)
      : (this.storage ? offset + this.offsetFor(parent) : offset)
  for (var i = 0, len = this.lengthFor(parent), step = this.sizeFor() === 2 ? 2 : 1; i < len; ++i) {
    str.push(buffer[this.sizeFor() === 2 ? 'getUint16' : 'getUint8'](shift + i * step, this.littleEndian))
  }
  return String.fromCharCode.apply(null, str)
}

StructString.prototype.write = function write(buffer, offset, value) {
  var str = [], storage, parent = write.caller.parent
    , shift = this.external
      ? this.offsetFor(parent)
      : (this.storage ? offset + this.offsetFor(parent) : offset)
  this.setLength(this.lengthFor(parent, true), parent)
  for (var i = 0, len = this.lengthFor(parent), step = this.sizeFor() === 2 ? 2 : 1; i < len; ++i) {
    var code = value.charCodeAt(i) || 0x00
    buffer[this.sizeFor() === 2 ? 'setUint16' : 'setUint8'](shift + i * step, code, this.littleEndian)
  }
}

StructString.prototype.sizeFor = function() {
  return this._size || 1
}

StructString.prototype.lengthFor = function(parent, writing) {
  if (this._length instanceof StructReference) {
    if (writing) return parent[this.prop].length
    return parent[this._length.prop]
  }
  return this._length || 0
}

StructString.prototype.setLength = function(value, parent) {
  if (this._length instanceof StructReference)
    parent[this._length.prop] = value
  else this._length = value
}

utils.methodsFor(StructString.prototype, '_offset',  'offsetFor', 'setOffset')

},{"../utils":96,"./reference":93}],96:[function(require,module,exports){
var StructReference = require('./types/reference')

exports.methodsFor = function(obj, prop, get, set) {
  obj[get] = function(parent) {
    if (!this[prop]) return 0
    if (this[prop] instanceof StructReference)
      return parent[this[prop].prop]
    else if (typeof this[prop] === 'function')
      return this[prop].call(parent)
    return this[prop]
  }
  if (!set) return
  obj[set] = function(value, parent) {
    if (this[prop] instanceof StructReference)
      parent[this[prop].prop] = value
    else this[prop] = value
  }
}

exports.options = function(opts) {
  if (typeof opts === 'object') {
    this._offset      = opts.offset
    this._length      = opts.length
    this._size        = opts.size
    this.$unpacked    = opts.$unpacked
    this.$packing     = opts.$packing
    this.external     = opts.external === true
    this.storage      = opts.storage
    this.littleEndian = opts.littleEndian === true
  } else {
    this._length  = opts
  }
}
},{"./types/reference":93}],97:[function(require,module,exports){
(function (root) {
   "use strict";

/***** unorm.js *****/

/*
 * UnicodeNormalizer 1.0.0
 * Copyright (c) 2008 Matsuza
 * Dual licensed under the MIT (MIT-LICENSE.txt) and GPL (GPL-LICENSE.txt) licenses.
 * $Date: 2008-06-05 16:44:17 +0200 (Thu, 05 Jun 2008) $
 * $Rev: 13309 $
 */

   var DEFAULT_FEATURE = [null, 0, {}];
   var CACHE_THRESHOLD = 10;
   var SBase = 0xAC00, LBase = 0x1100, VBase = 0x1161, TBase = 0x11A7, LCount = 19, VCount = 21, TCount = 28;
   var NCount = VCount * TCount; // 588
   var SCount = LCount * NCount; // 11172

   var UChar = function(cp, feature){
      this.codepoint = cp;
      this.feature = feature;
   };

   // Strategies
   var cache = {};
   var cacheCounter = [];
   for (var i = 0; i <= 0xFF; ++i){
      cacheCounter[i] = 0;
   }

   function fromCache(next, cp, needFeature){
      var ret = cache[cp];
      if(!ret){
         ret = next(cp, needFeature);
         if(!!ret.feature && ++cacheCounter[(cp >> 8) & 0xFF] > CACHE_THRESHOLD){
            cache[cp] = ret;
         }
      }
      return ret;
   }

   function fromData(next, cp, needFeature){
      var hash = cp & 0xFF00;
      var dunit = UChar.udata[hash] || {};
      var f = dunit[cp];
      return f ? new UChar(cp, f) : new UChar(cp, DEFAULT_FEATURE);
   }
   function fromCpOnly(next, cp, needFeature){
      return !!needFeature ? next(cp, needFeature) : new UChar(cp, null);
   }
   function fromRuleBasedJamo(next, cp, needFeature){
      var j;
      if(cp < LBase || (LBase + LCount <= cp && cp < SBase) || (SBase + SCount < cp)){
         return next(cp, needFeature);
      }
      if(LBase <= cp && cp < LBase + LCount){
         var c = {};
         var base = (cp - LBase) * VCount;
         for (j = 0; j < VCount; ++j){
            c[VBase + j] = SBase + TCount * (j + base);
         }
         return new UChar(cp, [,,c]);
      }

      var SIndex = cp - SBase;
      var TIndex = SIndex % TCount;
      var feature = [];
      if(TIndex !== 0){
         feature[0] = [SBase + SIndex - TIndex, TBase + TIndex];
      } else {
         feature[0] = [LBase + Math.floor(SIndex / NCount), VBase + Math.floor((SIndex % NCount) / TCount)];
         feature[2] = {};
         for (j = 1; j < TCount; ++j){
            feature[2][TBase + j] = cp + j;
         }
      }
      return new UChar(cp, feature);
   }
   function fromCpFilter(next, cp, needFeature){
      return cp < 60 || 13311 < cp && cp < 42607 ? new UChar(cp, DEFAULT_FEATURE) : next(cp, needFeature);
   }

   var strategies = [fromCpFilter, fromCache, fromCpOnly, fromRuleBasedJamo, fromData];

   UChar.fromCharCode = strategies.reduceRight(function (next, strategy) {
      return function (cp, needFeature) {
         return strategy(next, cp, needFeature);
      };
   }, null);

   UChar.isHighSurrogate = function(cp){
      return cp >= 0xD800 && cp <= 0xDBFF;
   };
   UChar.isLowSurrogate = function(cp){
      return cp >= 0xDC00 && cp <= 0xDFFF;
   };

   UChar.prototype.prepFeature = function(){
      if(!this.feature){
         this.feature = UChar.fromCharCode(this.codepoint, true).feature;
      }
   };

   UChar.prototype.toString = function(){
      if(this.codepoint < 0x10000){
         return String.fromCharCode(this.codepoint);
      } else {
         var x = this.codepoint - 0x10000;
         return String.fromCharCode(Math.floor(x / 0x400) + 0xD800, x % 0x400 + 0xDC00);
      }
   };

   UChar.prototype.getDecomp = function(){
      this.prepFeature();
      return this.feature[0] || null;
   };

   UChar.prototype.isCompatibility = function(){
      this.prepFeature();
      return !!this.feature[1] && (this.feature[1] & (1 << 8));
   };
   UChar.prototype.isExclude = function(){
      this.prepFeature();
      return !!this.feature[1] && (this.feature[1] & (1 << 9));
   };
   UChar.prototype.getCanonicalClass = function(){
      this.prepFeature();
      return !!this.feature[1] ? (this.feature[1] & 0xff) : 0;
   };
   UChar.prototype.getComposite = function(following){
      this.prepFeature();
      if(!this.feature[2]){
         return null;
      }
      var cp = this.feature[2][following.codepoint];
      return cp ? UChar.fromCharCode(cp) : null;
   };

   var UCharIterator = function(str){
      this.str = str;
      this.cursor = 0;
   };
   UCharIterator.prototype.next = function(){
      if(!!this.str && this.cursor < this.str.length){
         var cp = this.str.charCodeAt(this.cursor++);
         var d;
         if(UChar.isHighSurrogate(cp) && this.cursor < this.str.length && UChar.isLowSurrogate((d = this.str.charCodeAt(this.cursor)))){
            cp = (cp - 0xD800) * 0x400 + (d -0xDC00) + 0x10000;
            ++this.cursor;
         }
         return UChar.fromCharCode(cp);
      } else {
         this.str = null;
         return null;
      }
   };

   var RecursDecompIterator = function(it, cano){
      this.it = it;
      this.canonical = cano;
      this.resBuf = [];
   };

   RecursDecompIterator.prototype.next = function(){
      function recursiveDecomp(cano, uchar){
         var decomp = uchar.getDecomp();
         if(!!decomp && !(cano && uchar.isCompatibility())){
            var ret = [];
            for(var i = 0; i < decomp.length; ++i){
               var a = recursiveDecomp(cano, UChar.fromCharCode(decomp[i]));
               //ret.concat(a); //<-why does not this work?
               //following block is a workaround.
               for(var j = 0; j < a.length; ++j){
                  ret.push(a[j]);
               }
            }
            return ret;
         } else {
            return [uchar];
         }
      }
      if(this.resBuf.length === 0){
         var uchar = this.it.next();
         if(!uchar){
            return null;
         }
         this.resBuf = recursiveDecomp(this.canonical, uchar);
      }
      return this.resBuf.shift();
   };

   var DecompIterator = function(it){
      this.it = it;
      this.resBuf = [];
   };

   DecompIterator.prototype.next = function(){
      var cc;
      if(this.resBuf.length === 0){
         do{
            var uchar = this.it.next();
            if(!uchar){
               break;
            }
            cc = uchar.getCanonicalClass();
            var inspt = this.resBuf.length;
            if(cc !== 0){
               for(; inspt > 0; --inspt){
                  var uchar2 = this.resBuf[inspt - 1];
                  var cc2 = uchar2.getCanonicalClass();
                  if(cc2 <= cc){
                     break;
                  }
               }
            }
            this.resBuf.splice(inspt, 0, uchar);
         } while(cc !== 0);
      }
      return this.resBuf.shift();
   };

   var CompIterator = function(it){
      this.it = it;
      this.procBuf = [];
      this.resBuf = [];
      this.lastClass = null;
   };

   CompIterator.prototype.next = function(){
      while(this.resBuf.length === 0){
         var uchar = this.it.next();
         if(!uchar){
            this.resBuf = this.procBuf;
            this.procBuf = [];
            break;
         }
         if(this.procBuf.length === 0){
            this.lastClass = uchar.getCanonicalClass();
            this.procBuf.push(uchar);
         } else {
            var starter = this.procBuf[0];
            var composite = starter.getComposite(uchar);
            var cc = uchar.getCanonicalClass();
            if(!!composite && (this.lastClass < cc || this.lastClass === 0)){
               this.procBuf[0] = composite;
            } else {
               if(cc === 0){
                  this.resBuf = this.procBuf;
                  this.procBuf = [];
               }
               this.lastClass = cc;
               this.procBuf.push(uchar);
            }
         }
      }
      return this.resBuf.shift();
   };

   var createIterator = function(mode, str){
      switch(mode){
         case "NFD":
            return new DecompIterator(new RecursDecompIterator(new UCharIterator(str), true));
         case "NFKD":
            return new DecompIterator(new RecursDecompIterator(new UCharIterator(str), false));
         case "NFC":
            return new CompIterator(new DecompIterator(new RecursDecompIterator(new UCharIterator(str), true)));
         case "NFKC":
            return new CompIterator(new DecompIterator(new RecursDecompIterator(new UCharIterator(str), false)));
      }
      throw mode + " is invalid";
   };
   var normalize = function(mode, str){
      var it = createIterator(mode, str);
      var ret = "";
      var uchar;
      while(!!(uchar = it.next())){
         ret += uchar.toString();
      }
      return ret;
   };

   /* API functions */
   function nfd(str){
      return normalize("NFD", str);
   }

   function nfkd(str){
      return normalize("NFKD", str);
   }

   function nfc(str){
      return normalize("NFC", str);
   }

   function nfkc(str){
      return normalize("NFKC", str);
   }

/* Unicode data */
UChar.udata={
0:{60:[,,{824:8814}],61:[,,{824:8800}],62:[,,{824:8815}],65:[,,{768:192,769:193,770:194,771:195,772:256,774:258,775:550,776:196,777:7842,778:197,780:461,783:512,785:514,803:7840,805:7680,808:260}],66:[,,{775:7682,803:7684,817:7686}],67:[,,{769:262,770:264,775:266,780:268,807:199}],68:[,,{775:7690,780:270,803:7692,807:7696,813:7698,817:7694}],69:[,,{768:200,769:201,770:202,771:7868,772:274,774:276,775:278,776:203,777:7866,780:282,783:516,785:518,803:7864,807:552,808:280,813:7704,816:7706}],70:[,,{775:7710}],71:[,,{769:500,770:284,772:7712,774:286,775:288,780:486,807:290}],72:[,,{770:292,775:7714,776:7718,780:542,803:7716,807:7720,814:7722}],73:[,,{768:204,769:205,770:206,771:296,772:298,774:300,775:304,776:207,777:7880,780:463,783:520,785:522,803:7882,808:302,816:7724}],74:[,,{770:308}],75:[,,{769:7728,780:488,803:7730,807:310,817:7732}],76:[,,{769:313,780:317,803:7734,807:315,813:7740,817:7738}],77:[,,{769:7742,775:7744,803:7746}],78:[,,{768:504,769:323,771:209,775:7748,780:327,803:7750,807:325,813:7754,817:7752}],79:[,,{768:210,769:211,770:212,771:213,772:332,774:334,775:558,776:214,777:7886,779:336,780:465,783:524,785:526,795:416,803:7884,808:490}],80:[,,{769:7764,775:7766}],82:[,,{769:340,775:7768,780:344,783:528,785:530,803:7770,807:342,817:7774}],83:[,,{769:346,770:348,775:7776,780:352,803:7778,806:536,807:350}],84:[,,{775:7786,780:356,803:7788,806:538,807:354,813:7792,817:7790}],85:[,,{768:217,769:218,770:219,771:360,772:362,774:364,776:220,777:7910,778:366,779:368,780:467,783:532,785:534,795:431,803:7908,804:7794,808:370,813:7798,816:7796}],86:[,,{771:7804,803:7806}],87:[,,{768:7808,769:7810,770:372,775:7814,776:7812,803:7816}],88:[,,{775:7818,776:7820}],89:[,,{768:7922,769:221,770:374,771:7928,772:562,775:7822,776:376,777:7926,803:7924}],90:[,,{769:377,770:7824,775:379,780:381,803:7826,817:7828}],97:[,,{768:224,769:225,770:226,771:227,772:257,774:259,775:551,776:228,777:7843,778:229,780:462,783:513,785:515,803:7841,805:7681,808:261}],98:[,,{775:7683,803:7685,817:7687}],99:[,,{769:263,770:265,775:267,780:269,807:231}],100:[,,{775:7691,780:271,803:7693,807:7697,813:7699,817:7695}],101:[,,{768:232,769:233,770:234,771:7869,772:275,774:277,775:279,776:235,777:7867,780:283,783:517,785:519,803:7865,807:553,808:281,813:7705,816:7707}],102:[,,{775:7711}],103:[,,{769:501,770:285,772:7713,774:287,775:289,780:487,807:291}],104:[,,{770:293,775:7715,776:7719,780:543,803:7717,807:7721,814:7723,817:7830}],105:[,,{768:236,769:237,770:238,771:297,772:299,774:301,776:239,777:7881,780:464,783:521,785:523,803:7883,808:303,816:7725}],106:[,,{770:309,780:496}],107:[,,{769:7729,780:489,803:7731,807:311,817:7733}],108:[,,{769:314,780:318,803:7735,807:316,813:7741,817:7739}],109:[,,{769:7743,775:7745,803:7747}],110:[,,{768:505,769:324,771:241,775:7749,780:328,803:7751,807:326,813:7755,817:7753}],111:[,,{768:242,769:243,770:244,771:245,772:333,774:335,775:559,776:246,777:7887,779:337,780:466,783:525,785:527,795:417,803:7885,808:491}],112:[,,{769:7765,775:7767}],114:[,,{769:341,775:7769,780:345,783:529,785:531,803:7771,807:343,817:7775}],115:[,,{769:347,770:349,775:7777,780:353,803:7779,806:537,807:351}],116:[,,{775:7787,776:7831,780:357,803:7789,806:539,807:355,813:7793,817:7791}],117:[,,{768:249,769:250,770:251,771:361,772:363,774:365,776:252,777:7911,778:367,779:369,780:468,783:533,785:535,795:432,803:7909,804:7795,808:371,813:7799,816:7797}],118:[,,{771:7805,803:7807}],119:[,,{768:7809,769:7811,770:373,775:7815,776:7813,778:7832,803:7817}],120:[,,{775:7819,776:7821}],121:[,,{768:7923,769:253,770:375,771:7929,772:563,775:7823,776:255,777:7927,778:7833,803:7925}],122:[,,{769:378,770:7825,775:380,780:382,803:7827,817:7829}],160:[[32],256],168:[[32,776],256,{768:8173,769:901,834:8129}],170:[[97],256],175:[[32,772],256],178:[[50],256],179:[[51],256],180:[[32,769],256],181:[[956],256],184:[[32,807],256],185:[[49],256],186:[[111],256],188:[[49,8260,52],256],189:[[49,8260,50],256],190:[[51,8260,52],256],192:[[65,768]],193:[[65,769]],194:[[65,770],,{768:7846,769:7844,771:7850,777:7848}],195:[[65,771]],196:[[65,776],,{772:478}],197:[[65,778],,{769:506}],198:[,,{769:508,772:482}],199:[[67,807],,{769:7688}],200:[[69,768]],201:[[69,769]],202:[[69,770],,{768:7872,769:7870,771:7876,777:7874}],203:[[69,776]],204:[[73,768]],205:[[73,769]],206:[[73,770]],207:[[73,776],,{769:7726}],209:[[78,771]],210:[[79,768]],211:[[79,769]],212:[[79,770],,{768:7890,769:7888,771:7894,777:7892}],213:[[79,771],,{769:7756,772:556,776:7758}],214:[[79,776],,{772:554}],216:[,,{769:510}],217:[[85,768]],218:[[85,769]],219:[[85,770]],220:[[85,776],,{768:475,769:471,772:469,780:473}],221:[[89,769]],224:[[97,768]],225:[[97,769]],226:[[97,770],,{768:7847,769:7845,771:7851,777:7849}],227:[[97,771]],228:[[97,776],,{772:479}],229:[[97,778],,{769:507}],230:[,,{769:509,772:483}],231:[[99,807],,{769:7689}],232:[[101,768]],233:[[101,769]],234:[[101,770],,{768:7873,769:7871,771:7877,777:7875}],235:[[101,776]],236:[[105,768]],237:[[105,769]],238:[[105,770]],239:[[105,776],,{769:7727}],241:[[110,771]],242:[[111,768]],243:[[111,769]],244:[[111,770],,{768:7891,769:7889,771:7895,777:7893}],245:[[111,771],,{769:7757,772:557,776:7759}],246:[[111,776],,{772:555}],248:[,,{769:511}],249:[[117,768]],250:[[117,769]],251:[[117,770]],252:[[117,776],,{768:476,769:472,772:470,780:474}],253:[[121,769]],255:[[121,776]]},
256:{256:[[65,772]],257:[[97,772]],258:[[65,774],,{768:7856,769:7854,771:7860,777:7858}],259:[[97,774],,{768:7857,769:7855,771:7861,777:7859}],260:[[65,808]],261:[[97,808]],262:[[67,769]],263:[[99,769]],264:[[67,770]],265:[[99,770]],266:[[67,775]],267:[[99,775]],268:[[67,780]],269:[[99,780]],270:[[68,780]],271:[[100,780]],274:[[69,772],,{768:7700,769:7702}],275:[[101,772],,{768:7701,769:7703}],276:[[69,774]],277:[[101,774]],278:[[69,775]],279:[[101,775]],280:[[69,808]],281:[[101,808]],282:[[69,780]],283:[[101,780]],284:[[71,770]],285:[[103,770]],286:[[71,774]],287:[[103,774]],288:[[71,775]],289:[[103,775]],290:[[71,807]],291:[[103,807]],292:[[72,770]],293:[[104,770]],296:[[73,771]],297:[[105,771]],298:[[73,772]],299:[[105,772]],300:[[73,774]],301:[[105,774]],302:[[73,808]],303:[[105,808]],304:[[73,775]],306:[[73,74],256],307:[[105,106],256],308:[[74,770]],309:[[106,770]],310:[[75,807]],311:[[107,807]],313:[[76,769]],314:[[108,769]],315:[[76,807]],316:[[108,807]],317:[[76,780]],318:[[108,780]],319:[[76,183],256],320:[[108,183],256],323:[[78,769]],324:[[110,769]],325:[[78,807]],326:[[110,807]],327:[[78,780]],328:[[110,780]],329:[[700,110],256],332:[[79,772],,{768:7760,769:7762}],333:[[111,772],,{768:7761,769:7763}],334:[[79,774]],335:[[111,774]],336:[[79,779]],337:[[111,779]],340:[[82,769]],341:[[114,769]],342:[[82,807]],343:[[114,807]],344:[[82,780]],345:[[114,780]],346:[[83,769],,{775:7780}],347:[[115,769],,{775:7781}],348:[[83,770]],349:[[115,770]],350:[[83,807]],351:[[115,807]],352:[[83,780],,{775:7782}],353:[[115,780],,{775:7783}],354:[[84,807]],355:[[116,807]],356:[[84,780]],357:[[116,780]],360:[[85,771],,{769:7800}],361:[[117,771],,{769:7801}],362:[[85,772],,{776:7802}],363:[[117,772],,{776:7803}],364:[[85,774]],365:[[117,774]],366:[[85,778]],367:[[117,778]],368:[[85,779]],369:[[117,779]],370:[[85,808]],371:[[117,808]],372:[[87,770]],373:[[119,770]],374:[[89,770]],375:[[121,770]],376:[[89,776]],377:[[90,769]],378:[[122,769]],379:[[90,775]],380:[[122,775]],381:[[90,780]],382:[[122,780]],383:[[115],256,{775:7835}],416:[[79,795],,{768:7900,769:7898,771:7904,777:7902,803:7906}],417:[[111,795],,{768:7901,769:7899,771:7905,777:7903,803:7907}],431:[[85,795],,{768:7914,769:7912,771:7918,777:7916,803:7920}],432:[[117,795],,{768:7915,769:7913,771:7919,777:7917,803:7921}],439:[,,{780:494}],452:[[68,381],256],453:[[68,382],256],454:[[100,382],256],455:[[76,74],256],456:[[76,106],256],457:[[108,106],256],458:[[78,74],256],459:[[78,106],256],460:[[110,106],256],461:[[65,780]],462:[[97,780]],463:[[73,780]],464:[[105,780]],465:[[79,780]],466:[[111,780]],467:[[85,780]],468:[[117,780]],469:[[220,772]],470:[[252,772]],471:[[220,769]],472:[[252,769]],473:[[220,780]],474:[[252,780]],475:[[220,768]],476:[[252,768]],478:[[196,772]],479:[[228,772]],480:[[550,772]],481:[[551,772]],482:[[198,772]],483:[[230,772]],486:[[71,780]],487:[[103,780]],488:[[75,780]],489:[[107,780]],490:[[79,808],,{772:492}],491:[[111,808],,{772:493}],492:[[490,772]],493:[[491,772]],494:[[439,780]],495:[[658,780]],496:[[106,780]],497:[[68,90],256],498:[[68,122],256],499:[[100,122],256],500:[[71,769]],501:[[103,769]],504:[[78,768]],505:[[110,768]],506:[[197,769]],507:[[229,769]],508:[[198,769]],509:[[230,769]],510:[[216,769]],511:[[248,769]],66045:[,220]},
512:{512:[[65,783]],513:[[97,783]],514:[[65,785]],515:[[97,785]],516:[[69,783]],517:[[101,783]],518:[[69,785]],519:[[101,785]],520:[[73,783]],521:[[105,783]],522:[[73,785]],523:[[105,785]],524:[[79,783]],525:[[111,783]],526:[[79,785]],527:[[111,785]],528:[[82,783]],529:[[114,783]],530:[[82,785]],531:[[114,785]],532:[[85,783]],533:[[117,783]],534:[[85,785]],535:[[117,785]],536:[[83,806]],537:[[115,806]],538:[[84,806]],539:[[116,806]],542:[[72,780]],543:[[104,780]],550:[[65,775],,{772:480}],551:[[97,775],,{772:481}],552:[[69,807],,{774:7708}],553:[[101,807],,{774:7709}],554:[[214,772]],555:[[246,772]],556:[[213,772]],557:[[245,772]],558:[[79,775],,{772:560}],559:[[111,775],,{772:561}],560:[[558,772]],561:[[559,772]],562:[[89,772]],563:[[121,772]],658:[,,{780:495}],688:[[104],256],689:[[614],256],690:[[106],256],691:[[114],256],692:[[633],256],693:[[635],256],694:[[641],256],695:[[119],256],696:[[121],256],728:[[32,774],256],729:[[32,775],256],730:[[32,778],256],731:[[32,808],256],732:[[32,771],256],733:[[32,779],256],736:[[611],256],737:[[108],256],738:[[115],256],739:[[120],256],740:[[661],256]},
768:{768:[,230],769:[,230],770:[,230],771:[,230],772:[,230],773:[,230],774:[,230],775:[,230],776:[,230,{769:836}],777:[,230],778:[,230],779:[,230],780:[,230],781:[,230],782:[,230],783:[,230],784:[,230],785:[,230],786:[,230],787:[,230],788:[,230],789:[,232],790:[,220],791:[,220],792:[,220],793:[,220],794:[,232],795:[,216],796:[,220],797:[,220],798:[,220],799:[,220],800:[,220],801:[,202],802:[,202],803:[,220],804:[,220],805:[,220],806:[,220],807:[,202],808:[,202],809:[,220],810:[,220],811:[,220],812:[,220],813:[,220],814:[,220],815:[,220],816:[,220],817:[,220],818:[,220],819:[,220],820:[,1],821:[,1],822:[,1],823:[,1],824:[,1],825:[,220],826:[,220],827:[,220],828:[,220],829:[,230],830:[,230],831:[,230],832:[[768],230],833:[[769],230],834:[,230],835:[[787],230],836:[[776,769],230],837:[,240],838:[,230],839:[,220],840:[,220],841:[,220],842:[,230],843:[,230],844:[,230],845:[,220],846:[,220],848:[,230],849:[,230],850:[,230],851:[,220],852:[,220],853:[,220],854:[,220],855:[,230],856:[,232],857:[,220],858:[,220],859:[,230],860:[,233],861:[,234],862:[,234],863:[,233],864:[,234],865:[,234],866:[,233],867:[,230],868:[,230],869:[,230],870:[,230],871:[,230],872:[,230],873:[,230],874:[,230],875:[,230],876:[,230],877:[,230],878:[,230],879:[,230],884:[[697]],890:[[32,837],256],894:[[59]],900:[[32,769],256],901:[[168,769]],902:[[913,769]],903:[[183]],904:[[917,769]],905:[[919,769]],906:[[921,769]],908:[[927,769]],910:[[933,769]],911:[[937,769]],912:[[970,769]],913:[,,{768:8122,769:902,772:8121,774:8120,787:7944,788:7945,837:8124}],917:[,,{768:8136,769:904,787:7960,788:7961}],919:[,,{768:8138,769:905,787:7976,788:7977,837:8140}],921:[,,{768:8154,769:906,772:8153,774:8152,776:938,787:7992,788:7993}],927:[,,{768:8184,769:908,787:8008,788:8009}],929:[,,{788:8172}],933:[,,{768:8170,769:910,772:8169,774:8168,776:939,788:8025}],937:[,,{768:8186,769:911,787:8040,788:8041,837:8188}],938:[[921,776]],939:[[933,776]],940:[[945,769],,{837:8116}],941:[[949,769]],942:[[951,769],,{837:8132}],943:[[953,769]],944:[[971,769]],945:[,,{768:8048,769:940,772:8113,774:8112,787:7936,788:7937,834:8118,837:8115}],949:[,,{768:8050,769:941,787:7952,788:7953}],951:[,,{768:8052,769:942,787:7968,788:7969,834:8134,837:8131}],953:[,,{768:8054,769:943,772:8145,774:8144,776:970,787:7984,788:7985,834:8150}],959:[,,{768:8056,769:972,787:8000,788:8001}],961:[,,{787:8164,788:8165}],965:[,,{768:8058,769:973,772:8161,774:8160,776:971,787:8016,788:8017,834:8166}],969:[,,{768:8060,769:974,787:8032,788:8033,834:8182,837:8179}],970:[[953,776],,{768:8146,769:912,834:8151}],971:[[965,776],,{768:8162,769:944,834:8167}],972:[[959,769]],973:[[965,769]],974:[[969,769],,{837:8180}],976:[[946],256],977:[[952],256],978:[[933],256,{769:979,776:980}],979:[[978,769]],980:[[978,776]],981:[[966],256],982:[[960],256],1008:[[954],256],1009:[[961],256],1010:[[962],256],1012:[[920],256],1013:[[949],256],1017:[[931],256]},
1024:{1024:[[1045,768]],1025:[[1045,776]],1027:[[1043,769]],1030:[,,{776:1031}],1031:[[1030,776]],1036:[[1050,769]],1037:[[1048,768]],1038:[[1059,774]],1040:[,,{774:1232,776:1234}],1043:[,,{769:1027}],1045:[,,{768:1024,774:1238,776:1025}],1046:[,,{774:1217,776:1244}],1047:[,,{776:1246}],1048:[,,{768:1037,772:1250,774:1049,776:1252}],1049:[[1048,774]],1050:[,,{769:1036}],1054:[,,{776:1254}],1059:[,,{772:1262,774:1038,776:1264,779:1266}],1063:[,,{776:1268}],1067:[,,{776:1272}],1069:[,,{776:1260}],1072:[,,{774:1233,776:1235}],1075:[,,{769:1107}],1077:[,,{768:1104,774:1239,776:1105}],1078:[,,{774:1218,776:1245}],1079:[,,{776:1247}],1080:[,,{768:1117,772:1251,774:1081,776:1253}],1081:[[1080,774]],1082:[,,{769:1116}],1086:[,,{776:1255}],1091:[,,{772:1263,774:1118,776:1265,779:1267}],1095:[,,{776:1269}],1099:[,,{776:1273}],1101:[,,{776:1261}],1104:[[1077,768]],1105:[[1077,776]],1107:[[1075,769]],1110:[,,{776:1111}],1111:[[1110,776]],1116:[[1082,769]],1117:[[1080,768]],1118:[[1091,774]],1140:[,,{783:1142}],1141:[,,{783:1143}],1142:[[1140,783]],1143:[[1141,783]],1155:[,230],1156:[,230],1157:[,230],1158:[,230],1159:[,230],1217:[[1046,774]],1218:[[1078,774]],1232:[[1040,774]],1233:[[1072,774]],1234:[[1040,776]],1235:[[1072,776]],1238:[[1045,774]],1239:[[1077,774]],1240:[,,{776:1242}],1241:[,,{776:1243}],1242:[[1240,776]],1243:[[1241,776]],1244:[[1046,776]],1245:[[1078,776]],1246:[[1047,776]],1247:[[1079,776]],1250:[[1048,772]],1251:[[1080,772]],1252:[[1048,776]],1253:[[1080,776]],1254:[[1054,776]],1255:[[1086,776]],1256:[,,{776:1258}],1257:[,,{776:1259}],1258:[[1256,776]],1259:[[1257,776]],1260:[[1069,776]],1261:[[1101,776]],1262:[[1059,772]],1263:[[1091,772]],1264:[[1059,776]],1265:[[1091,776]],1266:[[1059,779]],1267:[[1091,779]],1268:[[1063,776]],1269:[[1095,776]],1272:[[1067,776]],1273:[[1099,776]]},
1280:{1415:[[1381,1410],256],1425:[,220],1426:[,230],1427:[,230],1428:[,230],1429:[,230],1430:[,220],1431:[,230],1432:[,230],1433:[,230],1434:[,222],1435:[,220],1436:[,230],1437:[,230],1438:[,230],1439:[,230],1440:[,230],1441:[,230],1442:[,220],1443:[,220],1444:[,220],1445:[,220],1446:[,220],1447:[,220],1448:[,230],1449:[,230],1450:[,220],1451:[,230],1452:[,230],1453:[,222],1454:[,228],1455:[,230],1456:[,10],1457:[,11],1458:[,12],1459:[,13],1460:[,14],1461:[,15],1462:[,16],1463:[,17],1464:[,18],1465:[,19],1466:[,19],1467:[,20],1468:[,21],1469:[,22],1471:[,23],1473:[,24],1474:[,25],1476:[,230],1477:[,220],1479:[,18]},
1536:{1552:[,230],1553:[,230],1554:[,230],1555:[,230],1556:[,230],1557:[,230],1558:[,230],1559:[,230],1560:[,30],1561:[,31],1562:[,32],1570:[[1575,1619]],1571:[[1575,1620]],1572:[[1608,1620]],1573:[[1575,1621]],1574:[[1610,1620]],1575:[,,{1619:1570,1620:1571,1621:1573}],1608:[,,{1620:1572}],1610:[,,{1620:1574}],1611:[,27],1612:[,28],1613:[,29],1614:[,30],1615:[,31],1616:[,32],1617:[,33],1618:[,34],1619:[,230],1620:[,230],1621:[,220],1622:[,220],1623:[,230],1624:[,230],1625:[,230],1626:[,230],1627:[,230],1628:[,220],1629:[,230],1630:[,230],1631:[,220],1648:[,35],1653:[[1575,1652],256],1654:[[1608,1652],256],1655:[[1735,1652],256],1656:[[1610,1652],256],1728:[[1749,1620]],1729:[,,{1620:1730}],1730:[[1729,1620]],1746:[,,{1620:1747}],1747:[[1746,1620]],1749:[,,{1620:1728}],1750:[,230],1751:[,230],1752:[,230],1753:[,230],1754:[,230],1755:[,230],1756:[,230],1759:[,230],1760:[,230],1761:[,230],1762:[,230],1763:[,220],1764:[,230],1767:[,230],1768:[,230],1770:[,220],1771:[,230],1772:[,230],1773:[,220]},
1792:{1809:[,36],1840:[,230],1841:[,220],1842:[,230],1843:[,230],1844:[,220],1845:[,230],1846:[,230],1847:[,220],1848:[,220],1849:[,220],1850:[,230],1851:[,220],1852:[,220],1853:[,230],1854:[,220],1855:[,230],1856:[,230],1857:[,230],1858:[,220],1859:[,230],1860:[,220],1861:[,230],1862:[,220],1863:[,230],1864:[,220],1865:[,230],1866:[,230],2027:[,230],2028:[,230],2029:[,230],2030:[,230],2031:[,230],2032:[,230],2033:[,230],2034:[,220],2035:[,230]},
2048:{2070:[,230],2071:[,230],2072:[,230],2073:[,230],2075:[,230],2076:[,230],2077:[,230],2078:[,230],2079:[,230],2080:[,230],2081:[,230],2082:[,230],2083:[,230],2085:[,230],2086:[,230],2087:[,230],2089:[,230],2090:[,230],2091:[,230],2092:[,230],2093:[,230],2137:[,220],2138:[,220],2139:[,220],2276:[,230],2277:[,230],2278:[,220],2279:[,230],2280:[,230],2281:[,220],2282:[,230],2283:[,230],2284:[,230],2285:[,220],2286:[,220],2287:[,220],2288:[,27],2289:[,28],2290:[,29],2291:[,230],2292:[,230],2293:[,230],2294:[,220],2295:[,230],2296:[,230],2297:[,220],2298:[,220],2299:[,230],2300:[,230],2301:[,230],2302:[,230]},
2304:{2344:[,,{2364:2345}],2345:[[2344,2364]],2352:[,,{2364:2353}],2353:[[2352,2364]],2355:[,,{2364:2356}],2356:[[2355,2364]],2364:[,7],2381:[,9],2385:[,230],2386:[,220],2387:[,230],2388:[,230],2392:[[2325,2364],512],2393:[[2326,2364],512],2394:[[2327,2364],512],2395:[[2332,2364],512],2396:[[2337,2364],512],2397:[[2338,2364],512],2398:[[2347,2364],512],2399:[[2351,2364],512],2492:[,7],2503:[,,{2494:2507,2519:2508}],2507:[[2503,2494]],2508:[[2503,2519]],2509:[,9],2524:[[2465,2492],512],2525:[[2466,2492],512],2527:[[2479,2492],512]},
2560:{2611:[[2610,2620],512],2614:[[2616,2620],512],2620:[,7],2637:[,9],2649:[[2582,2620],512],2650:[[2583,2620],512],2651:[[2588,2620],512],2654:[[2603,2620],512],2748:[,7],2765:[,9],68109:[,220],68111:[,230],68152:[,230],68153:[,1],68154:[,220],68159:[,9]},
2816:{2876:[,7],2887:[,,{2878:2891,2902:2888,2903:2892}],2888:[[2887,2902]],2891:[[2887,2878]],2892:[[2887,2903]],2893:[,9],2908:[[2849,2876],512],2909:[[2850,2876],512],2962:[,,{3031:2964}],2964:[[2962,3031]],3014:[,,{3006:3018,3031:3020}],3015:[,,{3006:3019}],3018:[[3014,3006]],3019:[[3015,3006]],3020:[[3014,3031]],3021:[,9]},
3072:{3142:[,,{3158:3144}],3144:[[3142,3158]],3149:[,9],3157:[,84],3158:[,91],3260:[,7],3263:[,,{3285:3264}],3264:[[3263,3285]],3270:[,,{3266:3274,3285:3271,3286:3272}],3271:[[3270,3285]],3272:[[3270,3286]],3274:[[3270,3266],,{3285:3275}],3275:[[3274,3285]],3277:[,9]},
3328:{3398:[,,{3390:3402,3415:3404}],3399:[,,{3390:3403}],3402:[[3398,3390]],3403:[[3399,3390]],3404:[[3398,3415]],3405:[,9],3530:[,9],3545:[,,{3530:3546,3535:3548,3551:3550}],3546:[[3545,3530]],3548:[[3545,3535],,{3530:3549}],3549:[[3548,3530]],3550:[[3545,3551]]},
3584:{3635:[[3661,3634],256],3640:[,103],3641:[,103],3642:[,9],3656:[,107],3657:[,107],3658:[,107],3659:[,107],3763:[[3789,3762],256],3768:[,118],3769:[,118],3784:[,122],3785:[,122],3786:[,122],3787:[,122],3804:[[3755,3737],256],3805:[[3755,3745],256]},
3840:{3852:[[3851],256],3864:[,220],3865:[,220],3893:[,220],3895:[,220],3897:[,216],3907:[[3906,4023],512],3917:[[3916,4023],512],3922:[[3921,4023],512],3927:[[3926,4023],512],3932:[[3931,4023],512],3945:[[3904,4021],512],3953:[,129],3954:[,130],3955:[[3953,3954],512],3956:[,132],3957:[[3953,3956],512],3958:[[4018,3968],512],3959:[[4018,3969],256],3960:[[4019,3968],512],3961:[[4019,3969],256],3962:[,130],3963:[,130],3964:[,130],3965:[,130],3968:[,130],3969:[[3953,3968],512],3970:[,230],3971:[,230],3972:[,9],3974:[,230],3975:[,230],3987:[[3986,4023],512],3997:[[3996,4023],512],4002:[[4001,4023],512],4007:[[4006,4023],512],4012:[[4011,4023],512],4025:[[3984,4021],512],4038:[,220]},
4096:{4133:[,,{4142:4134}],4134:[[4133,4142]],4151:[,7],4153:[,9],4154:[,9],4237:[,220],4348:[[4316],256],69702:[,9],69785:[,,{69818:69786}],69786:[[69785,69818]],69787:[,,{69818:69788}],69788:[[69787,69818]],69797:[,,{69818:69803}],69803:[[69797,69818]],69817:[,9],69818:[,7]},
4352:{69888:[,230],69889:[,230],69890:[,230],69934:[[69937,69927]],69935:[[69938,69927]],69937:[,,{69927:69934}],69938:[,,{69927:69935}],69939:[,9],69940:[,9],70080:[,9]},
4864:{4957:[,230],4958:[,230],4959:[,230]},
5632:{71350:[,9],71351:[,7]},
5888:{5908:[,9],5940:[,9],6098:[,9],6109:[,230]},
6144:{6313:[,228]},
6400:{6457:[,222],6458:[,230],6459:[,220]},
6656:{6679:[,230],6680:[,220],6752:[,9],6773:[,230],6774:[,230],6775:[,230],6776:[,230],6777:[,230],6778:[,230],6779:[,230],6780:[,230],6783:[,220]},
6912:{6917:[,,{6965:6918}],6918:[[6917,6965]],6919:[,,{6965:6920}],6920:[[6919,6965]],6921:[,,{6965:6922}],6922:[[6921,6965]],6923:[,,{6965:6924}],6924:[[6923,6965]],6925:[,,{6965:6926}],6926:[[6925,6965]],6929:[,,{6965:6930}],6930:[[6929,6965]],6964:[,7],6970:[,,{6965:6971}],6971:[[6970,6965]],6972:[,,{6965:6973}],6973:[[6972,6965]],6974:[,,{6965:6976}],6975:[,,{6965:6977}],6976:[[6974,6965]],6977:[[6975,6965]],6978:[,,{6965:6979}],6979:[[6978,6965]],6980:[,9],7019:[,230],7020:[,220],7021:[,230],7022:[,230],7023:[,230],7024:[,230],7025:[,230],7026:[,230],7027:[,230],7082:[,9],7083:[,9],7142:[,7],7154:[,9],7155:[,9]},
7168:{7223:[,7],7376:[,230],7377:[,230],7378:[,230],7380:[,1],7381:[,220],7382:[,220],7383:[,220],7384:[,220],7385:[,220],7386:[,230],7387:[,230],7388:[,220],7389:[,220],7390:[,220],7391:[,220],7392:[,230],7394:[,1],7395:[,1],7396:[,1],7397:[,1],7398:[,1],7399:[,1],7400:[,1],7405:[,220],7412:[,230]},
7424:{7468:[[65],256],7469:[[198],256],7470:[[66],256],7472:[[68],256],7473:[[69],256],7474:[[398],256],7475:[[71],256],7476:[[72],256],7477:[[73],256],7478:[[74],256],7479:[[75],256],7480:[[76],256],7481:[[77],256],7482:[[78],256],7484:[[79],256],7485:[[546],256],7486:[[80],256],7487:[[82],256],7488:[[84],256],7489:[[85],256],7490:[[87],256],7491:[[97],256],7492:[[592],256],7493:[[593],256],7494:[[7426],256],7495:[[98],256],7496:[[100],256],7497:[[101],256],7498:[[601],256],7499:[[603],256],7500:[[604],256],7501:[[103],256],7503:[[107],256],7504:[[109],256],7505:[[331],256],7506:[[111],256],7507:[[596],256],7508:[[7446],256],7509:[[7447],256],7510:[[112],256],7511:[[116],256],7512:[[117],256],7513:[[7453],256],7514:[[623],256],7515:[[118],256],7516:[[7461],256],7517:[[946],256],7518:[[947],256],7519:[[948],256],7520:[[966],256],7521:[[967],256],7522:[[105],256],7523:[[114],256],7524:[[117],256],7525:[[118],256],7526:[[946],256],7527:[[947],256],7528:[[961],256],7529:[[966],256],7530:[[967],256],7544:[[1085],256],7579:[[594],256],7580:[[99],256],7581:[[597],256],7582:[[240],256],7583:[[604],256],7584:[[102],256],7585:[[607],256],7586:[[609],256],7587:[[613],256],7588:[[616],256],7589:[[617],256],7590:[[618],256],7591:[[7547],256],7592:[[669],256],7593:[[621],256],7594:[[7557],256],7595:[[671],256],7596:[[625],256],7597:[[624],256],7598:[[626],256],7599:[[627],256],7600:[[628],256],7601:[[629],256],7602:[[632],256],7603:[[642],256],7604:[[643],256],7605:[[427],256],7606:[[649],256],7607:[[650],256],7608:[[7452],256],7609:[[651],256],7610:[[652],256],7611:[[122],256],7612:[[656],256],7613:[[657],256],7614:[[658],256],7615:[[952],256],7616:[,230],7617:[,230],7618:[,220],7619:[,230],7620:[,230],7621:[,230],7622:[,230],7623:[,230],7624:[,230],7625:[,230],7626:[,220],7627:[,230],7628:[,230],7629:[,234],7630:[,214],7631:[,220],7632:[,202],7633:[,230],7634:[,230],7635:[,230],7636:[,230],7637:[,230],7638:[,230],7639:[,230],7640:[,230],7641:[,230],7642:[,230],7643:[,230],7644:[,230],7645:[,230],7646:[,230],7647:[,230],7648:[,230],7649:[,230],7650:[,230],7651:[,230],7652:[,230],7653:[,230],7654:[,230],7676:[,233],7677:[,220],7678:[,230],7679:[,220]},
7680:{7680:[[65,805]],7681:[[97,805]],7682:[[66,775]],7683:[[98,775]],7684:[[66,803]],7685:[[98,803]],7686:[[66,817]],7687:[[98,817]],7688:[[199,769]],7689:[[231,769]],7690:[[68,775]],7691:[[100,775]],7692:[[68,803]],7693:[[100,803]],7694:[[68,817]],7695:[[100,817]],7696:[[68,807]],7697:[[100,807]],7698:[[68,813]],7699:[[100,813]],7700:[[274,768]],7701:[[275,768]],7702:[[274,769]],7703:[[275,769]],7704:[[69,813]],7705:[[101,813]],7706:[[69,816]],7707:[[101,816]],7708:[[552,774]],7709:[[553,774]],7710:[[70,775]],7711:[[102,775]],7712:[[71,772]],7713:[[103,772]],7714:[[72,775]],7715:[[104,775]],7716:[[72,803]],7717:[[104,803]],7718:[[72,776]],7719:[[104,776]],7720:[[72,807]],7721:[[104,807]],7722:[[72,814]],7723:[[104,814]],7724:[[73,816]],7725:[[105,816]],7726:[[207,769]],7727:[[239,769]],7728:[[75,769]],7729:[[107,769]],7730:[[75,803]],7731:[[107,803]],7732:[[75,817]],7733:[[107,817]],7734:[[76,803],,{772:7736}],7735:[[108,803],,{772:7737}],7736:[[7734,772]],7737:[[7735,772]],7738:[[76,817]],7739:[[108,817]],7740:[[76,813]],7741:[[108,813]],7742:[[77,769]],7743:[[109,769]],7744:[[77,775]],7745:[[109,775]],7746:[[77,803]],7747:[[109,803]],7748:[[78,775]],7749:[[110,775]],7750:[[78,803]],7751:[[110,803]],7752:[[78,817]],7753:[[110,817]],7754:[[78,813]],7755:[[110,813]],7756:[[213,769]],7757:[[245,769]],7758:[[213,776]],7759:[[245,776]],7760:[[332,768]],7761:[[333,768]],7762:[[332,769]],7763:[[333,769]],7764:[[80,769]],7765:[[112,769]],7766:[[80,775]],7767:[[112,775]],7768:[[82,775]],7769:[[114,775]],7770:[[82,803],,{772:7772}],7771:[[114,803],,{772:7773}],7772:[[7770,772]],7773:[[7771,772]],7774:[[82,817]],7775:[[114,817]],7776:[[83,775]],7777:[[115,775]],7778:[[83,803],,{775:7784}],7779:[[115,803],,{775:7785}],7780:[[346,775]],7781:[[347,775]],7782:[[352,775]],7783:[[353,775]],7784:[[7778,775]],7785:[[7779,775]],7786:[[84,775]],7787:[[116,775]],7788:[[84,803]],7789:[[116,803]],7790:[[84,817]],7791:[[116,817]],7792:[[84,813]],7793:[[116,813]],7794:[[85,804]],7795:[[117,804]],7796:[[85,816]],7797:[[117,816]],7798:[[85,813]],7799:[[117,813]],7800:[[360,769]],7801:[[361,769]],7802:[[362,776]],7803:[[363,776]],7804:[[86,771]],7805:[[118,771]],7806:[[86,803]],7807:[[118,803]],7808:[[87,768]],7809:[[119,768]],7810:[[87,769]],7811:[[119,769]],7812:[[87,776]],7813:[[119,776]],7814:[[87,775]],7815:[[119,775]],7816:[[87,803]],7817:[[119,803]],7818:[[88,775]],7819:[[120,775]],7820:[[88,776]],7821:[[120,776]],7822:[[89,775]],7823:[[121,775]],7824:[[90,770]],7825:[[122,770]],7826:[[90,803]],7827:[[122,803]],7828:[[90,817]],7829:[[122,817]],7830:[[104,817]],7831:[[116,776]],7832:[[119,778]],7833:[[121,778]],7834:[[97,702],256],7835:[[383,775]],7840:[[65,803],,{770:7852,774:7862}],7841:[[97,803],,{770:7853,774:7863}],7842:[[65,777]],7843:[[97,777]],7844:[[194,769]],7845:[[226,769]],7846:[[194,768]],7847:[[226,768]],7848:[[194,777]],7849:[[226,777]],7850:[[194,771]],7851:[[226,771]],7852:[[7840,770]],7853:[[7841,770]],7854:[[258,769]],7855:[[259,769]],7856:[[258,768]],7857:[[259,768]],7858:[[258,777]],7859:[[259,777]],7860:[[258,771]],7861:[[259,771]],7862:[[7840,774]],7863:[[7841,774]],7864:[[69,803],,{770:7878}],7865:[[101,803],,{770:7879}],7866:[[69,777]],7867:[[101,777]],7868:[[69,771]],7869:[[101,771]],7870:[[202,769]],7871:[[234,769]],7872:[[202,768]],7873:[[234,768]],7874:[[202,777]],7875:[[234,777]],7876:[[202,771]],7877:[[234,771]],7878:[[7864,770]],7879:[[7865,770]],7880:[[73,777]],7881:[[105,777]],7882:[[73,803]],7883:[[105,803]],7884:[[79,803],,{770:7896}],7885:[[111,803],,{770:7897}],7886:[[79,777]],7887:[[111,777]],7888:[[212,769]],7889:[[244,769]],7890:[[212,768]],7891:[[244,768]],7892:[[212,777]],7893:[[244,777]],7894:[[212,771]],7895:[[244,771]],7896:[[7884,770]],7897:[[7885,770]],7898:[[416,769]],7899:[[417,769]],7900:[[416,768]],7901:[[417,768]],7902:[[416,777]],7903:[[417,777]],7904:[[416,771]],7905:[[417,771]],7906:[[416,803]],7907:[[417,803]],7908:[[85,803]],7909:[[117,803]],7910:[[85,777]],7911:[[117,777]],7912:[[431,769]],7913:[[432,769]],7914:[[431,768]],7915:[[432,768]],7916:[[431,777]],7917:[[432,777]],7918:[[431,771]],7919:[[432,771]],7920:[[431,803]],7921:[[432,803]],7922:[[89,768]],7923:[[121,768]],7924:[[89,803]],7925:[[121,803]],7926:[[89,777]],7927:[[121,777]],7928:[[89,771]],7929:[[121,771]]},
7936:{7936:[[945,787],,{768:7938,769:7940,834:7942,837:8064}],7937:[[945,788],,{768:7939,769:7941,834:7943,837:8065}],7938:[[7936,768],,{837:8066}],7939:[[7937,768],,{837:8067}],7940:[[7936,769],,{837:8068}],7941:[[7937,769],,{837:8069}],7942:[[7936,834],,{837:8070}],7943:[[7937,834],,{837:8071}],7944:[[913,787],,{768:7946,769:7948,834:7950,837:8072}],7945:[[913,788],,{768:7947,769:7949,834:7951,837:8073}],7946:[[7944,768],,{837:8074}],7947:[[7945,768],,{837:8075}],7948:[[7944,769],,{837:8076}],7949:[[7945,769],,{837:8077}],7950:[[7944,834],,{837:8078}],7951:[[7945,834],,{837:8079}],7952:[[949,787],,{768:7954,769:7956}],7953:[[949,788],,{768:7955,769:7957}],7954:[[7952,768]],7955:[[7953,768]],7956:[[7952,769]],7957:[[7953,769]],7960:[[917,787],,{768:7962,769:7964}],7961:[[917,788],,{768:7963,769:7965}],7962:[[7960,768]],7963:[[7961,768]],7964:[[7960,769]],7965:[[7961,769]],7968:[[951,787],,{768:7970,769:7972,834:7974,837:8080}],7969:[[951,788],,{768:7971,769:7973,834:7975,837:8081}],7970:[[7968,768],,{837:8082}],7971:[[7969,768],,{837:8083}],7972:[[7968,769],,{837:8084}],7973:[[7969,769],,{837:8085}],7974:[[7968,834],,{837:8086}],7975:[[7969,834],,{837:8087}],7976:[[919,787],,{768:7978,769:7980,834:7982,837:8088}],7977:[[919,788],,{768:7979,769:7981,834:7983,837:8089}],7978:[[7976,768],,{837:8090}],7979:[[7977,768],,{837:8091}],7980:[[7976,769],,{837:8092}],7981:[[7977,769],,{837:8093}],7982:[[7976,834],,{837:8094}],7983:[[7977,834],,{837:8095}],7984:[[953,787],,{768:7986,769:7988,834:7990}],7985:[[953,788],,{768:7987,769:7989,834:7991}],7986:[[7984,768]],7987:[[7985,768]],7988:[[7984,769]],7989:[[7985,769]],7990:[[7984,834]],7991:[[7985,834]],7992:[[921,787],,{768:7994,769:7996,834:7998}],7993:[[921,788],,{768:7995,769:7997,834:7999}],7994:[[7992,768]],7995:[[7993,768]],7996:[[7992,769]],7997:[[7993,769]],7998:[[7992,834]],7999:[[7993,834]],8000:[[959,787],,{768:8002,769:8004}],8001:[[959,788],,{768:8003,769:8005}],8002:[[8000,768]],8003:[[8001,768]],8004:[[8000,769]],8005:[[8001,769]],8008:[[927,787],,{768:8010,769:8012}],8009:[[927,788],,{768:8011,769:8013}],8010:[[8008,768]],8011:[[8009,768]],8012:[[8008,769]],8013:[[8009,769]],8016:[[965,787],,{768:8018,769:8020,834:8022}],8017:[[965,788],,{768:8019,769:8021,834:8023}],8018:[[8016,768]],8019:[[8017,768]],8020:[[8016,769]],8021:[[8017,769]],8022:[[8016,834]],8023:[[8017,834]],8025:[[933,788],,{768:8027,769:8029,834:8031}],8027:[[8025,768]],8029:[[8025,769]],8031:[[8025,834]],8032:[[969,787],,{768:8034,769:8036,834:8038,837:8096}],8033:[[969,788],,{768:8035,769:8037,834:8039,837:8097}],8034:[[8032,768],,{837:8098}],8035:[[8033,768],,{837:8099}],8036:[[8032,769],,{837:8100}],8037:[[8033,769],,{837:8101}],8038:[[8032,834],,{837:8102}],8039:[[8033,834],,{837:8103}],8040:[[937,787],,{768:8042,769:8044,834:8046,837:8104}],8041:[[937,788],,{768:8043,769:8045,834:8047,837:8105}],8042:[[8040,768],,{837:8106}],8043:[[8041,768],,{837:8107}],8044:[[8040,769],,{837:8108}],8045:[[8041,769],,{837:8109}],8046:[[8040,834],,{837:8110}],8047:[[8041,834],,{837:8111}],8048:[[945,768],,{837:8114}],8049:[[940]],8050:[[949,768]],8051:[[941]],8052:[[951,768],,{837:8130}],8053:[[942]],8054:[[953,768]],8055:[[943]],8056:[[959,768]],8057:[[972]],8058:[[965,768]],8059:[[973]],8060:[[969,768],,{837:8178}],8061:[[974]],8064:[[7936,837]],8065:[[7937,837]],8066:[[7938,837]],8067:[[7939,837]],8068:[[7940,837]],8069:[[7941,837]],8070:[[7942,837]],8071:[[7943,837]],8072:[[7944,837]],8073:[[7945,837]],8074:[[7946,837]],8075:[[7947,837]],8076:[[7948,837]],8077:[[7949,837]],8078:[[7950,837]],8079:[[7951,837]],8080:[[7968,837]],8081:[[7969,837]],8082:[[7970,837]],8083:[[7971,837]],8084:[[7972,837]],8085:[[7973,837]],8086:[[7974,837]],8087:[[7975,837]],8088:[[7976,837]],8089:[[7977,837]],8090:[[7978,837]],8091:[[7979,837]],8092:[[7980,837]],8093:[[7981,837]],8094:[[7982,837]],8095:[[7983,837]],8096:[[8032,837]],8097:[[8033,837]],8098:[[8034,837]],8099:[[8035,837]],8100:[[8036,837]],8101:[[8037,837]],8102:[[8038,837]],8103:[[8039,837]],8104:[[8040,837]],8105:[[8041,837]],8106:[[8042,837]],8107:[[8043,837]],8108:[[8044,837]],8109:[[8045,837]],8110:[[8046,837]],8111:[[8047,837]],8112:[[945,774]],8113:[[945,772]],8114:[[8048,837]],8115:[[945,837]],8116:[[940,837]],8118:[[945,834],,{837:8119}],8119:[[8118,837]],8120:[[913,774]],8121:[[913,772]],8122:[[913,768]],8123:[[902]],8124:[[913,837]],8125:[[32,787],256],8126:[[953]],8127:[[32,787],256,{768:8141,769:8142,834:8143}],8128:[[32,834],256],8129:[[168,834]],8130:[[8052,837]],8131:[[951,837]],8132:[[942,837]],8134:[[951,834],,{837:8135}],8135:[[8134,837]],8136:[[917,768]],8137:[[904]],8138:[[919,768]],8139:[[905]],8140:[[919,837]],8141:[[8127,768]],8142:[[8127,769]],8143:[[8127,834]],8144:[[953,774]],8145:[[953,772]],8146:[[970,768]],8147:[[912]],8150:[[953,834]],8151:[[970,834]],8152:[[921,774]],8153:[[921,772]],8154:[[921,768]],8155:[[906]],8157:[[8190,768]],8158:[[8190,769]],8159:[[8190,834]],8160:[[965,774]],8161:[[965,772]],8162:[[971,768]],8163:[[944]],8164:[[961,787]],8165:[[961,788]],8166:[[965,834]],8167:[[971,834]],8168:[[933,774]],8169:[[933,772]],8170:[[933,768]],8171:[[910]],8172:[[929,788]],8173:[[168,768]],8174:[[901]],8175:[[96]],8178:[[8060,837]],8179:[[969,837]],8180:[[974,837]],8182:[[969,834],,{837:8183}],8183:[[8182,837]],8184:[[927,768]],8185:[[908]],8186:[[937,768]],8187:[[911]],8188:[[937,837]],8189:[[180]],8190:[[32,788],256,{768:8157,769:8158,834:8159}]},
8192:{8192:[[8194]],8193:[[8195]],8194:[[32],256],8195:[[32],256],8196:[[32],256],8197:[[32],256],8198:[[32],256],8199:[[32],256],8200:[[32],256],8201:[[32],256],8202:[[32],256],8209:[[8208],256],8215:[[32,819],256],8228:[[46],256],8229:[[46,46],256],8230:[[46,46,46],256],8239:[[32],256],8243:[[8242,8242],256],8244:[[8242,8242,8242],256],8246:[[8245,8245],256],8247:[[8245,8245,8245],256],8252:[[33,33],256],8254:[[32,773],256],8263:[[63,63],256],8264:[[63,33],256],8265:[[33,63],256],8279:[[8242,8242,8242,8242],256],8287:[[32],256],8304:[[48],256],8305:[[105],256],8308:[[52],256],8309:[[53],256],8310:[[54],256],8311:[[55],256],8312:[[56],256],8313:[[57],256],8314:[[43],256],8315:[[8722],256],8316:[[61],256],8317:[[40],256],8318:[[41],256],8319:[[110],256],8320:[[48],256],8321:[[49],256],8322:[[50],256],8323:[[51],256],8324:[[52],256],8325:[[53],256],8326:[[54],256],8327:[[55],256],8328:[[56],256],8329:[[57],256],8330:[[43],256],8331:[[8722],256],8332:[[61],256],8333:[[40],256],8334:[[41],256],8336:[[97],256],8337:[[101],256],8338:[[111],256],8339:[[120],256],8340:[[601],256],8341:[[104],256],8342:[[107],256],8343:[[108],256],8344:[[109],256],8345:[[110],256],8346:[[112],256],8347:[[115],256],8348:[[116],256],8360:[[82,115],256],8400:[,230],8401:[,230],8402:[,1],8403:[,1],8404:[,230],8405:[,230],8406:[,230],8407:[,230],8408:[,1],8409:[,1],8410:[,1],8411:[,230],8412:[,230],8417:[,230],8421:[,1],8422:[,1],8423:[,230],8424:[,220],8425:[,230],8426:[,1],8427:[,1],8428:[,220],8429:[,220],8430:[,220],8431:[,220],8432:[,230]},
8448:{8448:[[97,47,99],256],8449:[[97,47,115],256],8450:[[67],256],8451:[[176,67],256],8453:[[99,47,111],256],8454:[[99,47,117],256],8455:[[400],256],8457:[[176,70],256],8458:[[103],256],8459:[[72],256],8460:[[72],256],8461:[[72],256],8462:[[104],256],8463:[[295],256],8464:[[73],256],8465:[[73],256],8466:[[76],256],8467:[[108],256],8469:[[78],256],8470:[[78,111],256],8473:[[80],256],8474:[[81],256],8475:[[82],256],8476:[[82],256],8477:[[82],256],8480:[[83,77],256],8481:[[84,69,76],256],8482:[[84,77],256],8484:[[90],256],8486:[[937]],8488:[[90],256],8490:[[75]],8491:[[197]],8492:[[66],256],8493:[[67],256],8495:[[101],256],8496:[[69],256],8497:[[70],256],8499:[[77],256],8500:[[111],256],8501:[[1488],256],8502:[[1489],256],8503:[[1490],256],8504:[[1491],256],8505:[[105],256],8507:[[70,65,88],256],8508:[[960],256],8509:[[947],256],8510:[[915],256],8511:[[928],256],8512:[[8721],256],8517:[[68],256],8518:[[100],256],8519:[[101],256],8520:[[105],256],8521:[[106],256],8528:[[49,8260,55],256],8529:[[49,8260,57],256],8530:[[49,8260,49,48],256],8531:[[49,8260,51],256],8532:[[50,8260,51],256],8533:[[49,8260,53],256],8534:[[50,8260,53],256],8535:[[51,8260,53],256],8536:[[52,8260,53],256],8537:[[49,8260,54],256],8538:[[53,8260,54],256],8539:[[49,8260,56],256],8540:[[51,8260,56],256],8541:[[53,8260,56],256],8542:[[55,8260,56],256],8543:[[49,8260],256],8544:[[73],256],8545:[[73,73],256],8546:[[73,73,73],256],8547:[[73,86],256],8548:[[86],256],8549:[[86,73],256],8550:[[86,73,73],256],8551:[[86,73,73,73],256],8552:[[73,88],256],8553:[[88],256],8554:[[88,73],256],8555:[[88,73,73],256],8556:[[76],256],8557:[[67],256],8558:[[68],256],8559:[[77],256],8560:[[105],256],8561:[[105,105],256],8562:[[105,105,105],256],8563:[[105,118],256],8564:[[118],256],8565:[[118,105],256],8566:[[118,105,105],256],8567:[[118,105,105,105],256],8568:[[105,120],256],8569:[[120],256],8570:[[120,105],256],8571:[[120,105,105],256],8572:[[108],256],8573:[[99],256],8574:[[100],256],8575:[[109],256],8585:[[48,8260,51],256],8592:[,,{824:8602}],8594:[,,{824:8603}],8596:[,,{824:8622}],8602:[[8592,824]],8603:[[8594,824]],8622:[[8596,824]],8653:[[8656,824]],8654:[[8660,824]],8655:[[8658,824]],8656:[,,{824:8653}],8658:[,,{824:8655}],8660:[,,{824:8654}]},
8704:{8707:[,,{824:8708}],8708:[[8707,824]],8712:[,,{824:8713}],8713:[[8712,824]],8715:[,,{824:8716}],8716:[[8715,824]],8739:[,,{824:8740}],8740:[[8739,824]],8741:[,,{824:8742}],8742:[[8741,824]],8748:[[8747,8747],256],8749:[[8747,8747,8747],256],8751:[[8750,8750],256],8752:[[8750,8750,8750],256],8764:[,,{824:8769}],8769:[[8764,824]],8771:[,,{824:8772}],8772:[[8771,824]],8773:[,,{824:8775}],8775:[[8773,824]],8776:[,,{824:8777}],8777:[[8776,824]],8781:[,,{824:8813}],8800:[[61,824]],8801:[,,{824:8802}],8802:[[8801,824]],8804:[,,{824:8816}],8805:[,,{824:8817}],8813:[[8781,824]],8814:[[60,824]],8815:[[62,824]],8816:[[8804,824]],8817:[[8805,824]],8818:[,,{824:8820}],8819:[,,{824:8821}],8820:[[8818,824]],8821:[[8819,824]],8822:[,,{824:8824}],8823:[,,{824:8825}],8824:[[8822,824]],8825:[[8823,824]],8826:[,,{824:8832}],8827:[,,{824:8833}],8828:[,,{824:8928}],8829:[,,{824:8929}],8832:[[8826,824]],8833:[[8827,824]],8834:[,,{824:8836}],8835:[,,{824:8837}],8836:[[8834,824]],8837:[[8835,824]],8838:[,,{824:8840}],8839:[,,{824:8841}],8840:[[8838,824]],8841:[[8839,824]],8849:[,,{824:8930}],8850:[,,{824:8931}],8866:[,,{824:8876}],8872:[,,{824:8877}],8873:[,,{824:8878}],8875:[,,{824:8879}],8876:[[8866,824]],8877:[[8872,824]],8878:[[8873,824]],8879:[[8875,824]],8882:[,,{824:8938}],8883:[,,{824:8939}],8884:[,,{824:8940}],8885:[,,{824:8941}],8928:[[8828,824]],8929:[[8829,824]],8930:[[8849,824]],8931:[[8850,824]],8938:[[8882,824]],8939:[[8883,824]],8940:[[8884,824]],8941:[[8885,824]]},
8960:{9001:[[12296]],9002:[[12297]]},
9216:{9312:[[49],256],9313:[[50],256],9314:[[51],256],9315:[[52],256],9316:[[53],256],9317:[[54],256],9318:[[55],256],9319:[[56],256],9320:[[57],256],9321:[[49,48],256],9322:[[49,49],256],9323:[[49,50],256],9324:[[49,51],256],9325:[[49,52],256],9326:[[49,53],256],9327:[[49,54],256],9328:[[49,55],256],9329:[[49,56],256],9330:[[49,57],256],9331:[[50,48],256],9332:[[40,49,41],256],9333:[[40,50,41],256],9334:[[40,51,41],256],9335:[[40,52,41],256],9336:[[40,53,41],256],9337:[[40,54,41],256],9338:[[40,55,41],256],9339:[[40,56,41],256],9340:[[40,57,41],256],9341:[[40,49,48,41],256],9342:[[40,49,49,41],256],9343:[[40,49,50,41],256],9344:[[40,49,51,41],256],9345:[[40,49,52,41],256],9346:[[40,49,53,41],256],9347:[[40,49,54,41],256],9348:[[40,49,55,41],256],9349:[[40,49,56,41],256],9350:[[40,49,57,41],256],9351:[[40,50,48,41],256],9352:[[49,46],256],9353:[[50,46],256],9354:[[51,46],256],9355:[[52,46],256],9356:[[53,46],256],9357:[[54,46],256],9358:[[55,46],256],9359:[[56,46],256],9360:[[57,46],256],9361:[[49,48,46],256],9362:[[49,49,46],256],9363:[[49,50,46],256],9364:[[49,51,46],256],9365:[[49,52,46],256],9366:[[49,53,46],256],9367:[[49,54,46],256],9368:[[49,55,46],256],9369:[[49,56,46],256],9370:[[49,57,46],256],9371:[[50,48,46],256],9372:[[40,97,41],256],9373:[[40,98,41],256],9374:[[40,99,41],256],9375:[[40,100,41],256],9376:[[40,101,41],256],9377:[[40,102,41],256],9378:[[40,103,41],256],9379:[[40,104,41],256],9380:[[40,105,41],256],9381:[[40,106,41],256],9382:[[40,107,41],256],9383:[[40,108,41],256],9384:[[40,109,41],256],9385:[[40,110,41],256],9386:[[40,111,41],256],9387:[[40,112,41],256],9388:[[40,113,41],256],9389:[[40,114,41],256],9390:[[40,115,41],256],9391:[[40,116,41],256],9392:[[40,117,41],256],9393:[[40,118,41],256],9394:[[40,119,41],256],9395:[[40,120,41],256],9396:[[40,121,41],256],9397:[[40,122,41],256],9398:[[65],256],9399:[[66],256],9400:[[67],256],9401:[[68],256],9402:[[69],256],9403:[[70],256],9404:[[71],256],9405:[[72],256],9406:[[73],256],9407:[[74],256],9408:[[75],256],9409:[[76],256],9410:[[77],256],9411:[[78],256],9412:[[79],256],9413:[[80],256],9414:[[81],256],9415:[[82],256],9416:[[83],256],9417:[[84],256],9418:[[85],256],9419:[[86],256],9420:[[87],256],9421:[[88],256],9422:[[89],256],9423:[[90],256],9424:[[97],256],9425:[[98],256],9426:[[99],256],9427:[[100],256],9428:[[101],256],9429:[[102],256],9430:[[103],256],9431:[[104],256],9432:[[105],256],9433:[[106],256],9434:[[107],256],9435:[[108],256],9436:[[109],256],9437:[[110],256],9438:[[111],256],9439:[[112],256],9440:[[113],256],9441:[[114],256],9442:[[115],256],9443:[[116],256],9444:[[117],256],9445:[[118],256],9446:[[119],256],9447:[[120],256],9448:[[121],256],9449:[[122],256],9450:[[48],256]},
10752:{10764:[[8747,8747,8747,8747],256],10868:[[58,58,61],256],10869:[[61,61],256],10870:[[61,61,61],256],10972:[[10973,824],512]},
11264:{11388:[[106],256],11389:[[86],256],11503:[,230],11504:[,230],11505:[,230]},
11520:{11631:[[11617],256],11647:[,9],11744:[,230],11745:[,230],11746:[,230],11747:[,230],11748:[,230],11749:[,230],11750:[,230],11751:[,230],11752:[,230],11753:[,230],11754:[,230],11755:[,230],11756:[,230],11757:[,230],11758:[,230],11759:[,230],11760:[,230],11761:[,230],11762:[,230],11763:[,230],11764:[,230],11765:[,230],11766:[,230],11767:[,230],11768:[,230],11769:[,230],11770:[,230],11771:[,230],11772:[,230],11773:[,230],11774:[,230],11775:[,230]},
11776:{11935:[[27597],256],12019:[[40863],256]},
12032:{12032:[[19968],256],12033:[[20008],256],12034:[[20022],256],12035:[[20031],256],12036:[[20057],256],12037:[[20101],256],12038:[[20108],256],12039:[[20128],256],12040:[[20154],256],12041:[[20799],256],12042:[[20837],256],12043:[[20843],256],12044:[[20866],256],12045:[[20886],256],12046:[[20907],256],12047:[[20960],256],12048:[[20981],256],12049:[[20992],256],12050:[[21147],256],12051:[[21241],256],12052:[[21269],256],12053:[[21274],256],12054:[[21304],256],12055:[[21313],256],12056:[[21340],256],12057:[[21353],256],12058:[[21378],256],12059:[[21430],256],12060:[[21448],256],12061:[[21475],256],12062:[[22231],256],12063:[[22303],256],12064:[[22763],256],12065:[[22786],256],12066:[[22794],256],12067:[[22805],256],12068:[[22823],256],12069:[[22899],256],12070:[[23376],256],12071:[[23424],256],12072:[[23544],256],12073:[[23567],256],12074:[[23586],256],12075:[[23608],256],12076:[[23662],256],12077:[[23665],256],12078:[[24027],256],12079:[[24037],256],12080:[[24049],256],12081:[[24062],256],12082:[[24178],256],12083:[[24186],256],12084:[[24191],256],12085:[[24308],256],12086:[[24318],256],12087:[[24331],256],12088:[[24339],256],12089:[[24400],256],12090:[[24417],256],12091:[[24435],256],12092:[[24515],256],12093:[[25096],256],12094:[[25142],256],12095:[[25163],256],12096:[[25903],256],12097:[[25908],256],12098:[[25991],256],12099:[[26007],256],12100:[[26020],256],12101:[[26041],256],12102:[[26080],256],12103:[[26085],256],12104:[[26352],256],12105:[[26376],256],12106:[[26408],256],12107:[[27424],256],12108:[[27490],256],12109:[[27513],256],12110:[[27571],256],12111:[[27595],256],12112:[[27604],256],12113:[[27611],256],12114:[[27663],256],12115:[[27668],256],12116:[[27700],256],12117:[[28779],256],12118:[[29226],256],12119:[[29238],256],12120:[[29243],256],12121:[[29247],256],12122:[[29255],256],12123:[[29273],256],12124:[[29275],256],12125:[[29356],256],12126:[[29572],256],12127:[[29577],256],12128:[[29916],256],12129:[[29926],256],12130:[[29976],256],12131:[[29983],256],12132:[[29992],256],12133:[[30000],256],12134:[[30091],256],12135:[[30098],256],12136:[[30326],256],12137:[[30333],256],12138:[[30382],256],12139:[[30399],256],12140:[[30446],256],12141:[[30683],256],12142:[[30690],256],12143:[[30707],256],12144:[[31034],256],12145:[[31160],256],12146:[[31166],256],12147:[[31348],256],12148:[[31435],256],12149:[[31481],256],12150:[[31859],256],12151:[[31992],256],12152:[[32566],256],12153:[[32593],256],12154:[[32650],256],12155:[[32701],256],12156:[[32769],256],12157:[[32780],256],12158:[[32786],256],12159:[[32819],256],12160:[[32895],256],12161:[[32905],256],12162:[[33251],256],12163:[[33258],256],12164:[[33267],256],12165:[[33276],256],12166:[[33292],256],12167:[[33307],256],12168:[[33311],256],12169:[[33390],256],12170:[[33394],256],12171:[[33400],256],12172:[[34381],256],12173:[[34411],256],12174:[[34880],256],12175:[[34892],256],12176:[[34915],256],12177:[[35198],256],12178:[[35211],256],12179:[[35282],256],12180:[[35328],256],12181:[[35895],256],12182:[[35910],256],12183:[[35925],256],12184:[[35960],256],12185:[[35997],256],12186:[[36196],256],12187:[[36208],256],12188:[[36275],256],12189:[[36523],256],12190:[[36554],256],12191:[[36763],256],12192:[[36784],256],12193:[[36789],256],12194:[[37009],256],12195:[[37193],256],12196:[[37318],256],12197:[[37324],256],12198:[[37329],256],12199:[[38263],256],12200:[[38272],256],12201:[[38428],256],12202:[[38582],256],12203:[[38585],256],12204:[[38632],256],12205:[[38737],256],12206:[[38750],256],12207:[[38754],256],12208:[[38761],256],12209:[[38859],256],12210:[[38893],256],12211:[[38899],256],12212:[[38913],256],12213:[[39080],256],12214:[[39131],256],12215:[[39135],256],12216:[[39318],256],12217:[[39321],256],12218:[[39340],256],12219:[[39592],256],12220:[[39640],256],12221:[[39647],256],12222:[[39717],256],12223:[[39727],256],12224:[[39730],256],12225:[[39740],256],12226:[[39770],256],12227:[[40165],256],12228:[[40565],256],12229:[[40575],256],12230:[[40613],256],12231:[[40635],256],12232:[[40643],256],12233:[[40653],256],12234:[[40657],256],12235:[[40697],256],12236:[[40701],256],12237:[[40718],256],12238:[[40723],256],12239:[[40736],256],12240:[[40763],256],12241:[[40778],256],12242:[[40786],256],12243:[[40845],256],12244:[[40860],256],12245:[[40864],256]},
12288:{12288:[[32],256],12330:[,218],12331:[,228],12332:[,232],12333:[,222],12334:[,224],12335:[,224],12342:[[12306],256],12344:[[21313],256],12345:[[21316],256],12346:[[21317],256],12358:[,,{12441:12436}],12363:[,,{12441:12364}],12364:[[12363,12441]],12365:[,,{12441:12366}],12366:[[12365,12441]],12367:[,,{12441:12368}],12368:[[12367,12441]],12369:[,,{12441:12370}],12370:[[12369,12441]],12371:[,,{12441:12372}],12372:[[12371,12441]],12373:[,,{12441:12374}],12374:[[12373,12441]],12375:[,,{12441:12376}],12376:[[12375,12441]],12377:[,,{12441:12378}],12378:[[12377,12441]],12379:[,,{12441:12380}],12380:[[12379,12441]],12381:[,,{12441:12382}],12382:[[12381,12441]],12383:[,,{12441:12384}],12384:[[12383,12441]],12385:[,,{12441:12386}],12386:[[12385,12441]],12388:[,,{12441:12389}],12389:[[12388,12441]],12390:[,,{12441:12391}],12391:[[12390,12441]],12392:[,,{12441:12393}],12393:[[12392,12441]],12399:[,,{12441:12400,12442:12401}],12400:[[12399,12441]],12401:[[12399,12442]],12402:[,,{12441:12403,12442:12404}],12403:[[12402,12441]],12404:[[12402,12442]],12405:[,,{12441:12406,12442:12407}],12406:[[12405,12441]],12407:[[12405,12442]],12408:[,,{12441:12409,12442:12410}],12409:[[12408,12441]],12410:[[12408,12442]],12411:[,,{12441:12412,12442:12413}],12412:[[12411,12441]],12413:[[12411,12442]],12436:[[12358,12441]],12441:[,8],12442:[,8],12443:[[32,12441],256],12444:[[32,12442],256],12445:[,,{12441:12446}],12446:[[12445,12441]],12447:[[12424,12426],256],12454:[,,{12441:12532}],12459:[,,{12441:12460}],12460:[[12459,12441]],12461:[,,{12441:12462}],12462:[[12461,12441]],12463:[,,{12441:12464}],12464:[[12463,12441]],12465:[,,{12441:12466}],12466:[[12465,12441]],12467:[,,{12441:12468}],12468:[[12467,12441]],12469:[,,{12441:12470}],12470:[[12469,12441]],12471:[,,{12441:12472}],12472:[[12471,12441]],12473:[,,{12441:12474}],12474:[[12473,12441]],12475:[,,{12441:12476}],12476:[[12475,12441]],12477:[,,{12441:12478}],12478:[[12477,12441]],12479:[,,{12441:12480}],12480:[[12479,12441]],12481:[,,{12441:12482}],12482:[[12481,12441]],12484:[,,{12441:12485}],12485:[[12484,12441]],12486:[,,{12441:12487}],12487:[[12486,12441]],12488:[,,{12441:12489}],12489:[[12488,12441]],12495:[,,{12441:12496,12442:12497}],12496:[[12495,12441]],12497:[[12495,12442]],12498:[,,{12441:12499,12442:12500}],12499:[[12498,12441]],12500:[[12498,12442]],12501:[,,{12441:12502,12442:12503}],12502:[[12501,12441]],12503:[[12501,12442]],12504:[,,{12441:12505,12442:12506}],12505:[[12504,12441]],12506:[[12504,12442]],12507:[,,{12441:12508,12442:12509}],12508:[[12507,12441]],12509:[[12507,12442]],12527:[,,{12441:12535}],12528:[,,{12441:12536}],12529:[,,{12441:12537}],12530:[,,{12441:12538}],12532:[[12454,12441]],12535:[[12527,12441]],12536:[[12528,12441]],12537:[[12529,12441]],12538:[[12530,12441]],12541:[,,{12441:12542}],12542:[[12541,12441]],12543:[[12467,12488],256]},
12544:{12593:[[4352],256],12594:[[4353],256],12595:[[4522],256],12596:[[4354],256],12597:[[4524],256],12598:[[4525],256],12599:[[4355],256],12600:[[4356],256],12601:[[4357],256],12602:[[4528],256],12603:[[4529],256],12604:[[4530],256],12605:[[4531],256],12606:[[4532],256],12607:[[4533],256],12608:[[4378],256],12609:[[4358],256],12610:[[4359],256],12611:[[4360],256],12612:[[4385],256],12613:[[4361],256],12614:[[4362],256],12615:[[4363],256],12616:[[4364],256],12617:[[4365],256],12618:[[4366],256],12619:[[4367],256],12620:[[4368],256],12621:[[4369],256],12622:[[4370],256],12623:[[4449],256],12624:[[4450],256],12625:[[4451],256],12626:[[4452],256],12627:[[4453],256],12628:[[4454],256],12629:[[4455],256],12630:[[4456],256],12631:[[4457],256],12632:[[4458],256],12633:[[4459],256],12634:[[4460],256],12635:[[4461],256],12636:[[4462],256],12637:[[4463],256],12638:[[4464],256],12639:[[4465],256],12640:[[4466],256],12641:[[4467],256],12642:[[4468],256],12643:[[4469],256],12644:[[4448],256],12645:[[4372],256],12646:[[4373],256],12647:[[4551],256],12648:[[4552],256],12649:[[4556],256],12650:[[4558],256],12651:[[4563],256],12652:[[4567],256],12653:[[4569],256],12654:[[4380],256],12655:[[4573],256],12656:[[4575],256],12657:[[4381],256],12658:[[4382],256],12659:[[4384],256],12660:[[4386],256],12661:[[4387],256],12662:[[4391],256],12663:[[4393],256],12664:[[4395],256],12665:[[4396],256],12666:[[4397],256],12667:[[4398],256],12668:[[4399],256],12669:[[4402],256],12670:[[4406],256],12671:[[4416],256],12672:[[4423],256],12673:[[4428],256],12674:[[4593],256],12675:[[4594],256],12676:[[4439],256],12677:[[4440],256],12678:[[4441],256],12679:[[4484],256],12680:[[4485],256],12681:[[4488],256],12682:[[4497],256],12683:[[4498],256],12684:[[4500],256],12685:[[4510],256],12686:[[4513],256],12690:[[19968],256],12691:[[20108],256],12692:[[19977],256],12693:[[22235],256],12694:[[19978],256],12695:[[20013],256],12696:[[19979],256],12697:[[30002],256],12698:[[20057],256],12699:[[19993],256],12700:[[19969],256],12701:[[22825],256],12702:[[22320],256],12703:[[20154],256]},
12800:{12800:[[40,4352,41],256],12801:[[40,4354,41],256],12802:[[40,4355,41],256],12803:[[40,4357,41],256],12804:[[40,4358,41],256],12805:[[40,4359,41],256],12806:[[40,4361,41],256],12807:[[40,4363,41],256],12808:[[40,4364,41],256],12809:[[40,4366,41],256],12810:[[40,4367,41],256],12811:[[40,4368,41],256],12812:[[40,4369,41],256],12813:[[40,4370,41],256],12814:[[40,4352,4449,41],256],12815:[[40,4354,4449,41],256],12816:[[40,4355,4449,41],256],12817:[[40,4357,4449,41],256],12818:[[40,4358,4449,41],256],12819:[[40,4359,4449,41],256],12820:[[40,4361,4449,41],256],12821:[[40,4363,4449,41],256],12822:[[40,4364,4449,41],256],12823:[[40,4366,4449,41],256],12824:[[40,4367,4449,41],256],12825:[[40,4368,4449,41],256],12826:[[40,4369,4449,41],256],12827:[[40,4370,4449,41],256],12828:[[40,4364,4462,41],256],12829:[[40,4363,4457,4364,4453,4523,41],256],12830:[[40,4363,4457,4370,4462,41],256],12832:[[40,19968,41],256],12833:[[40,20108,41],256],12834:[[40,19977,41],256],12835:[[40,22235,41],256],12836:[[40,20116,41],256],12837:[[40,20845,41],256],12838:[[40,19971,41],256],12839:[[40,20843,41],256],12840:[[40,20061,41],256],12841:[[40,21313,41],256],12842:[[40,26376,41],256],12843:[[40,28779,41],256],12844:[[40,27700,41],256],12845:[[40,26408,41],256],12846:[[40,37329,41],256],12847:[[40,22303,41],256],12848:[[40,26085,41],256],12849:[[40,26666,41],256],12850:[[40,26377,41],256],12851:[[40,31038,41],256],12852:[[40,21517,41],256],12853:[[40,29305,41],256],12854:[[40,36001,41],256],12855:[[40,31069,41],256],12856:[[40,21172,41],256],12857:[[40,20195,41],256],12858:[[40,21628,41],256],12859:[[40,23398,41],256],12860:[[40,30435,41],256],12861:[[40,20225,41],256],12862:[[40,36039,41],256],12863:[[40,21332,41],256],12864:[[40,31085,41],256],12865:[[40,20241,41],256],12866:[[40,33258,41],256],12867:[[40,33267,41],256],12868:[[21839],256],12869:[[24188],256],12870:[[25991],256],12871:[[31631],256],12880:[[80,84,69],256],12881:[[50,49],256],12882:[[50,50],256],12883:[[50,51],256],12884:[[50,52],256],12885:[[50,53],256],12886:[[50,54],256],12887:[[50,55],256],12888:[[50,56],256],12889:[[50,57],256],12890:[[51,48],256],12891:[[51,49],256],12892:[[51,50],256],12893:[[51,51],256],12894:[[51,52],256],12895:[[51,53],256],12896:[[4352],256],12897:[[4354],256],12898:[[4355],256],12899:[[4357],256],12900:[[4358],256],12901:[[4359],256],12902:[[4361],256],12903:[[4363],256],12904:[[4364],256],12905:[[4366],256],12906:[[4367],256],12907:[[4368],256],12908:[[4369],256],12909:[[4370],256],12910:[[4352,4449],256],12911:[[4354,4449],256],12912:[[4355,4449],256],12913:[[4357,4449],256],12914:[[4358,4449],256],12915:[[4359,4449],256],12916:[[4361,4449],256],12917:[[4363,4449],256],12918:[[4364,4449],256],12919:[[4366,4449],256],12920:[[4367,4449],256],12921:[[4368,4449],256],12922:[[4369,4449],256],12923:[[4370,4449],256],12924:[[4366,4449,4535,4352,4457],256],12925:[[4364,4462,4363,4468],256],12926:[[4363,4462],256],12928:[[19968],256],12929:[[20108],256],12930:[[19977],256],12931:[[22235],256],12932:[[20116],256],12933:[[20845],256],12934:[[19971],256],12935:[[20843],256],12936:[[20061],256],12937:[[21313],256],12938:[[26376],256],12939:[[28779],256],12940:[[27700],256],12941:[[26408],256],12942:[[37329],256],12943:[[22303],256],12944:[[26085],256],12945:[[26666],256],12946:[[26377],256],12947:[[31038],256],12948:[[21517],256],12949:[[29305],256],12950:[[36001],256],12951:[[31069],256],12952:[[21172],256],12953:[[31192],256],12954:[[30007],256],12955:[[22899],256],12956:[[36969],256],12957:[[20778],256],12958:[[21360],256],12959:[[27880],256],12960:[[38917],256],12961:[[20241],256],12962:[[20889],256],12963:[[27491],256],12964:[[19978],256],12965:[[20013],256],12966:[[19979],256],12967:[[24038],256],12968:[[21491],256],12969:[[21307],256],12970:[[23447],256],12971:[[23398],256],12972:[[30435],256],12973:[[20225],256],12974:[[36039],256],12975:[[21332],256],12976:[[22812],256],12977:[[51,54],256],12978:[[51,55],256],12979:[[51,56],256],12980:[[51,57],256],12981:[[52,48],256],12982:[[52,49],256],12983:[[52,50],256],12984:[[52,51],256],12985:[[52,52],256],12986:[[52,53],256],12987:[[52,54],256],12988:[[52,55],256],12989:[[52,56],256],12990:[[52,57],256],12991:[[53,48],256],12992:[[49,26376],256],12993:[[50,26376],256],12994:[[51,26376],256],12995:[[52,26376],256],12996:[[53,26376],256],12997:[[54,26376],256],12998:[[55,26376],256],12999:[[56,26376],256],13000:[[57,26376],256],13001:[[49,48,26376],256],13002:[[49,49,26376],256],13003:[[49,50,26376],256],13004:[[72,103],256],13005:[[101,114,103],256],13006:[[101,86],256],13007:[[76,84,68],256],13008:[[12450],256],13009:[[12452],256],13010:[[12454],256],13011:[[12456],256],13012:[[12458],256],13013:[[12459],256],13014:[[12461],256],13015:[[12463],256],13016:[[12465],256],13017:[[12467],256],13018:[[12469],256],13019:[[12471],256],13020:[[12473],256],13021:[[12475],256],13022:[[12477],256],13023:[[12479],256],13024:[[12481],256],13025:[[12484],256],13026:[[12486],256],13027:[[12488],256],13028:[[12490],256],13029:[[12491],256],13030:[[12492],256],13031:[[12493],256],13032:[[12494],256],13033:[[12495],256],13034:[[12498],256],13035:[[12501],256],13036:[[12504],256],13037:[[12507],256],13038:[[12510],256],13039:[[12511],256],13040:[[12512],256],13041:[[12513],256],13042:[[12514],256],13043:[[12516],256],13044:[[12518],256],13045:[[12520],256],13046:[[12521],256],13047:[[12522],256],13048:[[12523],256],13049:[[12524],256],13050:[[12525],256],13051:[[12527],256],13052:[[12528],256],13053:[[12529],256],13054:[[12530],256]},
13056:{13056:[[12450,12497,12540,12488],256],13057:[[12450,12523,12501,12449],256],13058:[[12450,12531,12506,12450],256],13059:[[12450,12540,12523],256],13060:[[12452,12491,12531,12464],256],13061:[[12452,12531,12481],256],13062:[[12454,12457,12531],256],13063:[[12456,12473,12463,12540,12489],256],13064:[[12456,12540,12459,12540],256],13065:[[12458,12531,12473],256],13066:[[12458,12540,12512],256],13067:[[12459,12452,12522],256],13068:[[12459,12521,12483,12488],256],13069:[[12459,12525,12522,12540],256],13070:[[12460,12525,12531],256],13071:[[12460,12531,12510],256],13072:[[12462,12460],256],13073:[[12462,12491,12540],256],13074:[[12461,12517,12522,12540],256],13075:[[12462,12523,12480,12540],256],13076:[[12461,12525],256],13077:[[12461,12525,12464,12521,12512],256],13078:[[12461,12525,12513,12540,12488,12523],256],13079:[[12461,12525,12527,12483,12488],256],13080:[[12464,12521,12512],256],13081:[[12464,12521,12512,12488,12531],256],13082:[[12463,12523,12476,12452,12525],256],13083:[[12463,12525,12540,12493],256],13084:[[12465,12540,12473],256],13085:[[12467,12523,12490],256],13086:[[12467,12540,12509],256],13087:[[12469,12452,12463,12523],256],13088:[[12469,12531,12481,12540,12512],256],13089:[[12471,12522,12531,12464],256],13090:[[12475,12531,12481],256],13091:[[12475,12531,12488],256],13092:[[12480,12540,12473],256],13093:[[12487,12471],256],13094:[[12489,12523],256],13095:[[12488,12531],256],13096:[[12490,12494],256],13097:[[12494,12483,12488],256],13098:[[12495,12452,12484],256],13099:[[12497,12540,12475,12531,12488],256],13100:[[12497,12540,12484],256],13101:[[12496,12540,12524,12523],256],13102:[[12500,12450,12473,12488,12523],256],13103:[[12500,12463,12523],256],13104:[[12500,12467],256],13105:[[12499,12523],256],13106:[[12501,12449,12521,12483,12489],256],13107:[[12501,12451,12540,12488],256],13108:[[12502,12483,12471,12455,12523],256],13109:[[12501,12521,12531],256],13110:[[12504,12463,12479,12540,12523],256],13111:[[12506,12477],256],13112:[[12506,12491,12498],256],13113:[[12504,12523,12484],256],13114:[[12506,12531,12473],256],13115:[[12506,12540,12472],256],13116:[[12505,12540,12479],256],13117:[[12509,12452,12531,12488],256],13118:[[12508,12523,12488],256],13119:[[12507,12531],256],13120:[[12509,12531,12489],256],13121:[[12507,12540,12523],256],13122:[[12507,12540,12531],256],13123:[[12510,12452,12463,12525],256],13124:[[12510,12452,12523],256],13125:[[12510,12483,12495],256],13126:[[12510,12523,12463],256],13127:[[12510,12531,12471,12519,12531],256],13128:[[12511,12463,12525,12531],256],13129:[[12511,12522],256],13130:[[12511,12522,12496,12540,12523],256],13131:[[12513,12460],256],13132:[[12513,12460,12488,12531],256],13133:[[12513,12540,12488,12523],256],13134:[[12516,12540,12489],256],13135:[[12516,12540,12523],256],13136:[[12518,12450,12531],256],13137:[[12522,12483,12488,12523],256],13138:[[12522,12521],256],13139:[[12523,12500,12540],256],13140:[[12523,12540,12502,12523],256],13141:[[12524,12512],256],13142:[[12524,12531,12488,12466,12531],256],13143:[[12527,12483,12488],256],13144:[[48,28857],256],13145:[[49,28857],256],13146:[[50,28857],256],13147:[[51,28857],256],13148:[[52,28857],256],13149:[[53,28857],256],13150:[[54,28857],256],13151:[[55,28857],256],13152:[[56,28857],256],13153:[[57,28857],256],13154:[[49,48,28857],256],13155:[[49,49,28857],256],13156:[[49,50,28857],256],13157:[[49,51,28857],256],13158:[[49,52,28857],256],13159:[[49,53,28857],256],13160:[[49,54,28857],256],13161:[[49,55,28857],256],13162:[[49,56,28857],256],13163:[[49,57,28857],256],13164:[[50,48,28857],256],13165:[[50,49,28857],256],13166:[[50,50,28857],256],13167:[[50,51,28857],256],13168:[[50,52,28857],256],13169:[[104,80,97],256],13170:[[100,97],256],13171:[[65,85],256],13172:[[98,97,114],256],13173:[[111,86],256],13174:[[112,99],256],13175:[[100,109],256],13176:[[100,109,178],256],13177:[[100,109,179],256],13178:[[73,85],256],13179:[[24179,25104],256],13180:[[26157,21644],256],13181:[[22823,27491],256],13182:[[26126,27835],256],13183:[[26666,24335,20250,31038],256],13184:[[112,65],256],13185:[[110,65],256],13186:[[956,65],256],13187:[[109,65],256],13188:[[107,65],256],13189:[[75,66],256],13190:[[77,66],256],13191:[[71,66],256],13192:[[99,97,108],256],13193:[[107,99,97,108],256],13194:[[112,70],256],13195:[[110,70],256],13196:[[956,70],256],13197:[[956,103],256],13198:[[109,103],256],13199:[[107,103],256],13200:[[72,122],256],13201:[[107,72,122],256],13202:[[77,72,122],256],13203:[[71,72,122],256],13204:[[84,72,122],256],13205:[[956,8467],256],13206:[[109,8467],256],13207:[[100,8467],256],13208:[[107,8467],256],13209:[[102,109],256],13210:[[110,109],256],13211:[[956,109],256],13212:[[109,109],256],13213:[[99,109],256],13214:[[107,109],256],13215:[[109,109,178],256],13216:[[99,109,178],256],13217:[[109,178],256],13218:[[107,109,178],256],13219:[[109,109,179],256],13220:[[99,109,179],256],13221:[[109,179],256],13222:[[107,109,179],256],13223:[[109,8725,115],256],13224:[[109,8725,115,178],256],13225:[[80,97],256],13226:[[107,80,97],256],13227:[[77,80,97],256],13228:[[71,80,97],256],13229:[[114,97,100],256],13230:[[114,97,100,8725,115],256],13231:[[114,97,100,8725,115,178],256],13232:[[112,115],256],13233:[[110,115],256],13234:[[956,115],256],13235:[[109,115],256],13236:[[112,86],256],13237:[[110,86],256],13238:[[956,86],256],13239:[[109,86],256],13240:[[107,86],256],13241:[[77,86],256],13242:[[112,87],256],13243:[[110,87],256],13244:[[956,87],256],13245:[[109,87],256],13246:[[107,87],256],13247:[[77,87],256],13248:[[107,937],256],13249:[[77,937],256],13250:[[97,46,109,46],256],13251:[[66,113],256],13252:[[99,99],256],13253:[[99,100],256],13254:[[67,8725,107,103],256],13255:[[67,111,46],256],13256:[[100,66],256],13257:[[71,121],256],13258:[[104,97],256],13259:[[72,80],256],13260:[[105,110],256],13261:[[75,75],256],13262:[[75,77],256],13263:[[107,116],256],13264:[[108,109],256],13265:[[108,110],256],13266:[[108,111,103],256],13267:[[108,120],256],13268:[[109,98],256],13269:[[109,105,108],256],13270:[[109,111,108],256],13271:[[80,72],256],13272:[[112,46,109,46],256],13273:[[80,80,77],256],13274:[[80,82],256],13275:[[115,114],256],13276:[[83,118],256],13277:[[87,98],256],13278:[[86,8725,109],256],13279:[[65,8725,109],256],13280:[[49,26085],256],13281:[[50,26085],256],13282:[[51,26085],256],13283:[[52,26085],256],13284:[[53,26085],256],13285:[[54,26085],256],13286:[[55,26085],256],13287:[[56,26085],256],13288:[[57,26085],256],13289:[[49,48,26085],256],13290:[[49,49,26085],256],13291:[[49,50,26085],256],13292:[[49,51,26085],256],13293:[[49,52,26085],256],13294:[[49,53,26085],256],13295:[[49,54,26085],256],13296:[[49,55,26085],256],13297:[[49,56,26085],256],13298:[[49,57,26085],256],13299:[[50,48,26085],256],13300:[[50,49,26085],256],13301:[[50,50,26085],256],13302:[[50,51,26085],256],13303:[[50,52,26085],256],13304:[[50,53,26085],256],13305:[[50,54,26085],256],13306:[[50,55,26085],256],13307:[[50,56,26085],256],13308:[[50,57,26085],256],13309:[[51,48,26085],256],13310:[[51,49,26085],256],13311:[[103,97,108],256]},
42496:{42607:[,230],42612:[,230],42613:[,230],42614:[,230],42615:[,230],42616:[,230],42617:[,230],42618:[,230],42619:[,230],42620:[,230],42621:[,230],42655:[,230],42736:[,230],42737:[,230]},
42752:{42864:[[42863],256],43000:[[294],256],43001:[[339],256]},
43008:{43014:[,9],43204:[,9],43232:[,230],43233:[,230],43234:[,230],43235:[,230],43236:[,230],43237:[,230],43238:[,230],43239:[,230],43240:[,230],43241:[,230],43242:[,230],43243:[,230],43244:[,230],43245:[,230],43246:[,230],43247:[,230],43248:[,230],43249:[,230]},
43264:{43307:[,220],43308:[,220],43309:[,220],43347:[,9],43443:[,7],43456:[,9]},
43520:{43696:[,230],43698:[,230],43699:[,230],43700:[,220],43703:[,230],43704:[,230],43710:[,230],43711:[,230],43713:[,230],43766:[,9]},
43776:{44013:[,9]},
53504:{119134:[[119127,119141],512],119135:[[119128,119141],512],119136:[[119135,119150],512],119137:[[119135,119151],512],119138:[[119135,119152],512],119139:[[119135,119153],512],119140:[[119135,119154],512],119141:[,216],119142:[,216],119143:[,1],119144:[,1],119145:[,1],119149:[,226],119150:[,216],119151:[,216],119152:[,216],119153:[,216],119154:[,216],119163:[,220],119164:[,220],119165:[,220],119166:[,220],119167:[,220],119168:[,220],119169:[,220],119170:[,220],119173:[,230],119174:[,230],119175:[,230],119176:[,230],119177:[,230],119178:[,220],119179:[,220],119210:[,230],119211:[,230],119212:[,230],119213:[,230],119227:[[119225,119141],512],119228:[[119226,119141],512],119229:[[119227,119150],512],119230:[[119228,119150],512],119231:[[119227,119151],512],119232:[[119228,119151],512]},
53760:{119362:[,230],119363:[,230],119364:[,230]},
54272:{119808:[[65],256],119809:[[66],256],119810:[[67],256],119811:[[68],256],119812:[[69],256],119813:[[70],256],119814:[[71],256],119815:[[72],256],119816:[[73],256],119817:[[74],256],119818:[[75],256],119819:[[76],256],119820:[[77],256],119821:[[78],256],119822:[[79],256],119823:[[80],256],119824:[[81],256],119825:[[82],256],119826:[[83],256],119827:[[84],256],119828:[[85],256],119829:[[86],256],119830:[[87],256],119831:[[88],256],119832:[[89],256],119833:[[90],256],119834:[[97],256],119835:[[98],256],119836:[[99],256],119837:[[100],256],119838:[[101],256],119839:[[102],256],119840:[[103],256],119841:[[104],256],119842:[[105],256],119843:[[106],256],119844:[[107],256],119845:[[108],256],119846:[[109],256],119847:[[110],256],119848:[[111],256],119849:[[112],256],119850:[[113],256],119851:[[114],256],119852:[[115],256],119853:[[116],256],119854:[[117],256],119855:[[118],256],119856:[[119],256],119857:[[120],256],119858:[[121],256],119859:[[122],256],119860:[[65],256],119861:[[66],256],119862:[[67],256],119863:[[68],256],119864:[[69],256],119865:[[70],256],119866:[[71],256],119867:[[72],256],119868:[[73],256],119869:[[74],256],119870:[[75],256],119871:[[76],256],119872:[[77],256],119873:[[78],256],119874:[[79],256],119875:[[80],256],119876:[[81],256],119877:[[82],256],119878:[[83],256],119879:[[84],256],119880:[[85],256],119881:[[86],256],119882:[[87],256],119883:[[88],256],119884:[[89],256],119885:[[90],256],119886:[[97],256],119887:[[98],256],119888:[[99],256],119889:[[100],256],119890:[[101],256],119891:[[102],256],119892:[[103],256],119894:[[105],256],119895:[[106],256],119896:[[107],256],119897:[[108],256],119898:[[109],256],119899:[[110],256],119900:[[111],256],119901:[[112],256],119902:[[113],256],119903:[[114],256],119904:[[115],256],119905:[[116],256],119906:[[117],256],119907:[[118],256],119908:[[119],256],119909:[[120],256],119910:[[121],256],119911:[[122],256],119912:[[65],256],119913:[[66],256],119914:[[67],256],119915:[[68],256],119916:[[69],256],119917:[[70],256],119918:[[71],256],119919:[[72],256],119920:[[73],256],119921:[[74],256],119922:[[75],256],119923:[[76],256],119924:[[77],256],119925:[[78],256],119926:[[79],256],119927:[[80],256],119928:[[81],256],119929:[[82],256],119930:[[83],256],119931:[[84],256],119932:[[85],256],119933:[[86],256],119934:[[87],256],119935:[[88],256],119936:[[89],256],119937:[[90],256],119938:[[97],256],119939:[[98],256],119940:[[99],256],119941:[[100],256],119942:[[101],256],119943:[[102],256],119944:[[103],256],119945:[[104],256],119946:[[105],256],119947:[[106],256],119948:[[107],256],119949:[[108],256],119950:[[109],256],119951:[[110],256],119952:[[111],256],119953:[[112],256],119954:[[113],256],119955:[[114],256],119956:[[115],256],119957:[[116],256],119958:[[117],256],119959:[[118],256],119960:[[119],256],119961:[[120],256],119962:[[121],256],119963:[[122],256],119964:[[65],256],119966:[[67],256],119967:[[68],256],119970:[[71],256],119973:[[74],256],119974:[[75],256],119977:[[78],256],119978:[[79],256],119979:[[80],256],119980:[[81],256],119982:[[83],256],119983:[[84],256],119984:[[85],256],119985:[[86],256],119986:[[87],256],119987:[[88],256],119988:[[89],256],119989:[[90],256],119990:[[97],256],119991:[[98],256],119992:[[99],256],119993:[[100],256],119995:[[102],256],119997:[[104],256],119998:[[105],256],119999:[[106],256],120000:[[107],256],120001:[[108],256],120002:[[109],256],120003:[[110],256],120005:[[112],256],120006:[[113],256],120007:[[114],256],120008:[[115],256],120009:[[116],256],120010:[[117],256],120011:[[118],256],120012:[[119],256],120013:[[120],256],120014:[[121],256],120015:[[122],256],120016:[[65],256],120017:[[66],256],120018:[[67],256],120019:[[68],256],120020:[[69],256],120021:[[70],256],120022:[[71],256],120023:[[72],256],120024:[[73],256],120025:[[74],256],120026:[[75],256],120027:[[76],256],120028:[[77],256],120029:[[78],256],120030:[[79],256],120031:[[80],256],120032:[[81],256],120033:[[82],256],120034:[[83],256],120035:[[84],256],120036:[[85],256],120037:[[86],256],120038:[[87],256],120039:[[88],256],120040:[[89],256],120041:[[90],256],120042:[[97],256],120043:[[98],256],120044:[[99],256],120045:[[100],256],120046:[[101],256],120047:[[102],256],120048:[[103],256],120049:[[104],256],120050:[[105],256],120051:[[106],256],120052:[[107],256],120053:[[108],256],120054:[[109],256],120055:[[110],256],120056:[[111],256],120057:[[112],256],120058:[[113],256],120059:[[114],256],120060:[[115],256],120061:[[116],256],120062:[[117],256],120063:[[118],256]},
54528:{120064:[[119],256],120065:[[120],256],120066:[[121],256],120067:[[122],256],120068:[[65],256],120069:[[66],256],120071:[[68],256],120072:[[69],256],120073:[[70],256],120074:[[71],256],120077:[[74],256],120078:[[75],256],120079:[[76],256],120080:[[77],256],120081:[[78],256],120082:[[79],256],120083:[[80],256],120084:[[81],256],120086:[[83],256],120087:[[84],256],120088:[[85],256],120089:[[86],256],120090:[[87],256],120091:[[88],256],120092:[[89],256],120094:[[97],256],120095:[[98],256],120096:[[99],256],120097:[[100],256],120098:[[101],256],120099:[[102],256],120100:[[103],256],120101:[[104],256],120102:[[105],256],120103:[[106],256],120104:[[107],256],120105:[[108],256],120106:[[109],256],120107:[[110],256],120108:[[111],256],120109:[[112],256],120110:[[113],256],120111:[[114],256],120112:[[115],256],120113:[[116],256],120114:[[117],256],120115:[[118],256],120116:[[119],256],120117:[[120],256],120118:[[121],256],120119:[[122],256],120120:[[65],256],120121:[[66],256],120123:[[68],256],120124:[[69],256],120125:[[70],256],120126:[[71],256],120128:[[73],256],120129:[[74],256],120130:[[75],256],120131:[[76],256],120132:[[77],256],120134:[[79],256],120138:[[83],256],120139:[[84],256],120140:[[85],256],120141:[[86],256],120142:[[87],256],120143:[[88],256],120144:[[89],256],120146:[[97],256],120147:[[98],256],120148:[[99],256],120149:[[100],256],120150:[[101],256],120151:[[102],256],120152:[[103],256],120153:[[104],256],120154:[[105],256],120155:[[106],256],120156:[[107],256],120157:[[108],256],120158:[[109],256],120159:[[110],256],120160:[[111],256],120161:[[112],256],120162:[[113],256],120163:[[114],256],120164:[[115],256],120165:[[116],256],120166:[[117],256],120167:[[118],256],120168:[[119],256],120169:[[120],256],120170:[[121],256],120171:[[122],256],120172:[[65],256],120173:[[66],256],120174:[[67],256],120175:[[68],256],120176:[[69],256],120177:[[70],256],120178:[[71],256],120179:[[72],256],120180:[[73],256],120181:[[74],256],120182:[[75],256],120183:[[76],256],120184:[[77],256],120185:[[78],256],120186:[[79],256],120187:[[80],256],120188:[[81],256],120189:[[82],256],120190:[[83],256],120191:[[84],256],120192:[[85],256],120193:[[86],256],120194:[[87],256],120195:[[88],256],120196:[[89],256],120197:[[90],256],120198:[[97],256],120199:[[98],256],120200:[[99],256],120201:[[100],256],120202:[[101],256],120203:[[102],256],120204:[[103],256],120205:[[104],256],120206:[[105],256],120207:[[106],256],120208:[[107],256],120209:[[108],256],120210:[[109],256],120211:[[110],256],120212:[[111],256],120213:[[112],256],120214:[[113],256],120215:[[114],256],120216:[[115],256],120217:[[116],256],120218:[[117],256],120219:[[118],256],120220:[[119],256],120221:[[120],256],120222:[[121],256],120223:[[122],256],120224:[[65],256],120225:[[66],256],120226:[[67],256],120227:[[68],256],120228:[[69],256],120229:[[70],256],120230:[[71],256],120231:[[72],256],120232:[[73],256],120233:[[74],256],120234:[[75],256],120235:[[76],256],120236:[[77],256],120237:[[78],256],120238:[[79],256],120239:[[80],256],120240:[[81],256],120241:[[82],256],120242:[[83],256],120243:[[84],256],120244:[[85],256],120245:[[86],256],120246:[[87],256],120247:[[88],256],120248:[[89],256],120249:[[90],256],120250:[[97],256],120251:[[98],256],120252:[[99],256],120253:[[100],256],120254:[[101],256],120255:[[102],256],120256:[[103],256],120257:[[104],256],120258:[[105],256],120259:[[106],256],120260:[[107],256],120261:[[108],256],120262:[[109],256],120263:[[110],256],120264:[[111],256],120265:[[112],256],120266:[[113],256],120267:[[114],256],120268:[[115],256],120269:[[116],256],120270:[[117],256],120271:[[118],256],120272:[[119],256],120273:[[120],256],120274:[[121],256],120275:[[122],256],120276:[[65],256],120277:[[66],256],120278:[[67],256],120279:[[68],256],120280:[[69],256],120281:[[70],256],120282:[[71],256],120283:[[72],256],120284:[[73],256],120285:[[74],256],120286:[[75],256],120287:[[76],256],120288:[[77],256],120289:[[78],256],120290:[[79],256],120291:[[80],256],120292:[[81],256],120293:[[82],256],120294:[[83],256],120295:[[84],256],120296:[[85],256],120297:[[86],256],120298:[[87],256],120299:[[88],256],120300:[[89],256],120301:[[90],256],120302:[[97],256],120303:[[98],256],120304:[[99],256],120305:[[100],256],120306:[[101],256],120307:[[102],256],120308:[[103],256],120309:[[104],256],120310:[[105],256],120311:[[106],256],120312:[[107],256],120313:[[108],256],120314:[[109],256],120315:[[110],256],120316:[[111],256],120317:[[112],256],120318:[[113],256],120319:[[114],256]},
54784:{120320:[[115],256],120321:[[116],256],120322:[[117],256],120323:[[118],256],120324:[[119],256],120325:[[120],256],120326:[[121],256],120327:[[122],256],120328:[[65],256],120329:[[66],256],120330:[[67],256],120331:[[68],256],120332:[[69],256],120333:[[70],256],120334:[[71],256],120335:[[72],256],120336:[[73],256],120337:[[74],256],120338:[[75],256],120339:[[76],256],120340:[[77],256],120341:[[78],256],120342:[[79],256],120343:[[80],256],120344:[[81],256],120345:[[82],256],120346:[[83],256],120347:[[84],256],120348:[[85],256],120349:[[86],256],120350:[[87],256],120351:[[88],256],120352:[[89],256],120353:[[90],256],120354:[[97],256],120355:[[98],256],120356:[[99],256],120357:[[100],256],120358:[[101],256],120359:[[102],256],120360:[[103],256],120361:[[104],256],120362:[[105],256],120363:[[106],256],120364:[[107],256],120365:[[108],256],120366:[[109],256],120367:[[110],256],120368:[[111],256],120369:[[112],256],120370:[[113],256],120371:[[114],256],120372:[[115],256],120373:[[116],256],120374:[[117],256],120375:[[118],256],120376:[[119],256],120377:[[120],256],120378:[[121],256],120379:[[122],256],120380:[[65],256],120381:[[66],256],120382:[[67],256],120383:[[68],256],120384:[[69],256],120385:[[70],256],120386:[[71],256],120387:[[72],256],120388:[[73],256],120389:[[74],256],120390:[[75],256],120391:[[76],256],120392:[[77],256],120393:[[78],256],120394:[[79],256],120395:[[80],256],120396:[[81],256],120397:[[82],256],120398:[[83],256],120399:[[84],256],120400:[[85],256],120401:[[86],256],120402:[[87],256],120403:[[88],256],120404:[[89],256],120405:[[90],256],120406:[[97],256],120407:[[98],256],120408:[[99],256],120409:[[100],256],120410:[[101],256],120411:[[102],256],120412:[[103],256],120413:[[104],256],120414:[[105],256],120415:[[106],256],120416:[[107],256],120417:[[108],256],120418:[[109],256],120419:[[110],256],120420:[[111],256],120421:[[112],256],120422:[[113],256],120423:[[114],256],120424:[[115],256],120425:[[116],256],120426:[[117],256],120427:[[118],256],120428:[[119],256],120429:[[120],256],120430:[[121],256],120431:[[122],256],120432:[[65],256],120433:[[66],256],120434:[[67],256],120435:[[68],256],120436:[[69],256],120437:[[70],256],120438:[[71],256],120439:[[72],256],120440:[[73],256],120441:[[74],256],120442:[[75],256],120443:[[76],256],120444:[[77],256],120445:[[78],256],120446:[[79],256],120447:[[80],256],120448:[[81],256],120449:[[82],256],120450:[[83],256],120451:[[84],256],120452:[[85],256],120453:[[86],256],120454:[[87],256],120455:[[88],256],120456:[[89],256],120457:[[90],256],120458:[[97],256],120459:[[98],256],120460:[[99],256],120461:[[100],256],120462:[[101],256],120463:[[102],256],120464:[[103],256],120465:[[104],256],120466:[[105],256],120467:[[106],256],120468:[[107],256],120469:[[108],256],120470:[[109],256],120471:[[110],256],120472:[[111],256],120473:[[112],256],120474:[[113],256],120475:[[114],256],120476:[[115],256],120477:[[116],256],120478:[[117],256],120479:[[118],256],120480:[[119],256],120481:[[120],256],120482:[[121],256],120483:[[122],256],120484:[[305],256],120485:[[567],256],120488:[[913],256],120489:[[914],256],120490:[[915],256],120491:[[916],256],120492:[[917],256],120493:[[918],256],120494:[[919],256],120495:[[920],256],120496:[[921],256],120497:[[922],256],120498:[[923],256],120499:[[924],256],120500:[[925],256],120501:[[926],256],120502:[[927],256],120503:[[928],256],120504:[[929],256],120505:[[1012],256],120506:[[931],256],120507:[[932],256],120508:[[933],256],120509:[[934],256],120510:[[935],256],120511:[[936],256],120512:[[937],256],120513:[[8711],256],120514:[[945],256],120515:[[946],256],120516:[[947],256],120517:[[948],256],120518:[[949],256],120519:[[950],256],120520:[[951],256],120521:[[952],256],120522:[[953],256],120523:[[954],256],120524:[[955],256],120525:[[956],256],120526:[[957],256],120527:[[958],256],120528:[[959],256],120529:[[960],256],120530:[[961],256],120531:[[962],256],120532:[[963],256],120533:[[964],256],120534:[[965],256],120535:[[966],256],120536:[[967],256],120537:[[968],256],120538:[[969],256],120539:[[8706],256],120540:[[1013],256],120541:[[977],256],120542:[[1008],256],120543:[[981],256],120544:[[1009],256],120545:[[982],256],120546:[[913],256],120547:[[914],256],120548:[[915],256],120549:[[916],256],120550:[[917],256],120551:[[918],256],120552:[[919],256],120553:[[920],256],120554:[[921],256],120555:[[922],256],120556:[[923],256],120557:[[924],256],120558:[[925],256],120559:[[926],256],120560:[[927],256],120561:[[928],256],120562:[[929],256],120563:[[1012],256],120564:[[931],256],120565:[[932],256],120566:[[933],256],120567:[[934],256],120568:[[935],256],120569:[[936],256],120570:[[937],256],120571:[[8711],256],120572:[[945],256],120573:[[946],256],120574:[[947],256],120575:[[948],256]},
55040:{120576:[[949],256],120577:[[950],256],120578:[[951],256],120579:[[952],256],120580:[[953],256],120581:[[954],256],120582:[[955],256],120583:[[956],256],120584:[[957],256],120585:[[958],256],120586:[[959],256],120587:[[960],256],120588:[[961],256],120589:[[962],256],120590:[[963],256],120591:[[964],256],120592:[[965],256],120593:[[966],256],120594:[[967],256],120595:[[968],256],120596:[[969],256],120597:[[8706],256],120598:[[1013],256],120599:[[977],256],120600:[[1008],256],120601:[[981],256],120602:[[1009],256],120603:[[982],256],120604:[[913],256],120605:[[914],256],120606:[[915],256],120607:[[916],256],120608:[[917],256],120609:[[918],256],120610:[[919],256],120611:[[920],256],120612:[[921],256],120613:[[922],256],120614:[[923],256],120615:[[924],256],120616:[[925],256],120617:[[926],256],120618:[[927],256],120619:[[928],256],120620:[[929],256],120621:[[1012],256],120622:[[931],256],120623:[[932],256],120624:[[933],256],120625:[[934],256],120626:[[935],256],120627:[[936],256],120628:[[937],256],120629:[[8711],256],120630:[[945],256],120631:[[946],256],120632:[[947],256],120633:[[948],256],120634:[[949],256],120635:[[950],256],120636:[[951],256],120637:[[952],256],120638:[[953],256],120639:[[954],256],120640:[[955],256],120641:[[956],256],120642:[[957],256],120643:[[958],256],120644:[[959],256],120645:[[960],256],120646:[[961],256],120647:[[962],256],120648:[[963],256],120649:[[964],256],120650:[[965],256],120651:[[966],256],120652:[[967],256],120653:[[968],256],120654:[[969],256],120655:[[8706],256],120656:[[1013],256],120657:[[977],256],120658:[[1008],256],120659:[[981],256],120660:[[1009],256],120661:[[982],256],120662:[[913],256],120663:[[914],256],120664:[[915],256],120665:[[916],256],120666:[[917],256],120667:[[918],256],120668:[[919],256],120669:[[920],256],120670:[[921],256],120671:[[922],256],120672:[[923],256],120673:[[924],256],120674:[[925],256],120675:[[926],256],120676:[[927],256],120677:[[928],256],120678:[[929],256],120679:[[1012],256],120680:[[931],256],120681:[[932],256],120682:[[933],256],120683:[[934],256],120684:[[935],256],120685:[[936],256],120686:[[937],256],120687:[[8711],256],120688:[[945],256],120689:[[946],256],120690:[[947],256],120691:[[948],256],120692:[[949],256],120693:[[950],256],120694:[[951],256],120695:[[952],256],120696:[[953],256],120697:[[954],256],120698:[[955],256],120699:[[956],256],120700:[[957],256],120701:[[958],256],120702:[[959],256],120703:[[960],256],120704:[[961],256],120705:[[962],256],120706:[[963],256],120707:[[964],256],120708:[[965],256],120709:[[966],256],120710:[[967],256],120711:[[968],256],120712:[[969],256],120713:[[8706],256],120714:[[1013],256],120715:[[977],256],120716:[[1008],256],120717:[[981],256],120718:[[1009],256],120719:[[982],256],120720:[[913],256],120721:[[914],256],120722:[[915],256],120723:[[916],256],120724:[[917],256],120725:[[918],256],120726:[[919],256],120727:[[920],256],120728:[[921],256],120729:[[922],256],120730:[[923],256],120731:[[924],256],120732:[[925],256],120733:[[926],256],120734:[[927],256],120735:[[928],256],120736:[[929],256],120737:[[1012],256],120738:[[931],256],120739:[[932],256],120740:[[933],256],120741:[[934],256],120742:[[935],256],120743:[[936],256],120744:[[937],256],120745:[[8711],256],120746:[[945],256],120747:[[946],256],120748:[[947],256],120749:[[948],256],120750:[[949],256],120751:[[950],256],120752:[[951],256],120753:[[952],256],120754:[[953],256],120755:[[954],256],120756:[[955],256],120757:[[956],256],120758:[[957],256],120759:[[958],256],120760:[[959],256],120761:[[960],256],120762:[[961],256],120763:[[962],256],120764:[[963],256],120765:[[964],256],120766:[[965],256],120767:[[966],256],120768:[[967],256],120769:[[968],256],120770:[[969],256],120771:[[8706],256],120772:[[1013],256],120773:[[977],256],120774:[[1008],256],120775:[[981],256],120776:[[1009],256],120777:[[982],256],120778:[[988],256],120779:[[989],256],120782:[[48],256],120783:[[49],256],120784:[[50],256],120785:[[51],256],120786:[[52],256],120787:[[53],256],120788:[[54],256],120789:[[55],256],120790:[[56],256],120791:[[57],256],120792:[[48],256],120793:[[49],256],120794:[[50],256],120795:[[51],256],120796:[[52],256],120797:[[53],256],120798:[[54],256],120799:[[55],256],120800:[[56],256],120801:[[57],256],120802:[[48],256],120803:[[49],256],120804:[[50],256],120805:[[51],256],120806:[[52],256],120807:[[53],256],120808:[[54],256],120809:[[55],256],120810:[[56],256],120811:[[57],256],120812:[[48],256],120813:[[49],256],120814:[[50],256],120815:[[51],256],120816:[[52],256],120817:[[53],256],120818:[[54],256],120819:[[55],256],120820:[[56],256],120821:[[57],256],120822:[[48],256],120823:[[49],256],120824:[[50],256],120825:[[51],256],120826:[[52],256],120827:[[53],256],120828:[[54],256],120829:[[55],256],120830:[[56],256],120831:[[57],256]},
60928:{126464:[[1575],256],126465:[[1576],256],126466:[[1580],256],126467:[[1583],256],126469:[[1608],256],126470:[[1586],256],126471:[[1581],256],126472:[[1591],256],126473:[[1610],256],126474:[[1603],256],126475:[[1604],256],126476:[[1605],256],126477:[[1606],256],126478:[[1587],256],126479:[[1593],256],126480:[[1601],256],126481:[[1589],256],126482:[[1602],256],126483:[[1585],256],126484:[[1588],256],126485:[[1578],256],126486:[[1579],256],126487:[[1582],256],126488:[[1584],256],126489:[[1590],256],126490:[[1592],256],126491:[[1594],256],126492:[[1646],256],126493:[[1722],256],126494:[[1697],256],126495:[[1647],256],126497:[[1576],256],126498:[[1580],256],126500:[[1607],256],126503:[[1581],256],126505:[[1610],256],126506:[[1603],256],126507:[[1604],256],126508:[[1605],256],126509:[[1606],256],126510:[[1587],256],126511:[[1593],256],126512:[[1601],256],126513:[[1589],256],126514:[[1602],256],126516:[[1588],256],126517:[[1578],256],126518:[[1579],256],126519:[[1582],256],126521:[[1590],256],126523:[[1594],256],126530:[[1580],256],126535:[[1581],256],126537:[[1610],256],126539:[[1604],256],126541:[[1606],256],126542:[[1587],256],126543:[[1593],256],126545:[[1589],256],126546:[[1602],256],126548:[[1588],256],126551:[[1582],256],126553:[[1590],256],126555:[[1594],256],126557:[[1722],256],126559:[[1647],256],126561:[[1576],256],126562:[[1580],256],126564:[[1607],256],126567:[[1581],256],126568:[[1591],256],126569:[[1610],256],126570:[[1603],256],126572:[[1605],256],126573:[[1606],256],126574:[[1587],256],126575:[[1593],256],126576:[[1601],256],126577:[[1589],256],126578:[[1602],256],126580:[[1588],256],126581:[[1578],256],126582:[[1579],256],126583:[[1582],256],126585:[[1590],256],126586:[[1592],256],126587:[[1594],256],126588:[[1646],256],126590:[[1697],256],126592:[[1575],256],126593:[[1576],256],126594:[[1580],256],126595:[[1583],256],126596:[[1607],256],126597:[[1608],256],126598:[[1586],256],126599:[[1581],256],126600:[[1591],256],126601:[[1610],256],126603:[[1604],256],126604:[[1605],256],126605:[[1606],256],126606:[[1587],256],126607:[[1593],256],126608:[[1601],256],126609:[[1589],256],126610:[[1602],256],126611:[[1585],256],126612:[[1588],256],126613:[[1578],256],126614:[[1579],256],126615:[[1582],256],126616:[[1584],256],126617:[[1590],256],126618:[[1592],256],126619:[[1594],256],126625:[[1576],256],126626:[[1580],256],126627:[[1583],256],126629:[[1608],256],126630:[[1586],256],126631:[[1581],256],126632:[[1591],256],126633:[[1610],256],126635:[[1604],256],126636:[[1605],256],126637:[[1606],256],126638:[[1587],256],126639:[[1593],256],126640:[[1601],256],126641:[[1589],256],126642:[[1602],256],126643:[[1585],256],126644:[[1588],256],126645:[[1578],256],126646:[[1579],256],126647:[[1582],256],126648:[[1584],256],126649:[[1590],256],126650:[[1592],256],126651:[[1594],256]},
61696:{127232:[[48,46],256],127233:[[48,44],256],127234:[[49,44],256],127235:[[50,44],256],127236:[[51,44],256],127237:[[52,44],256],127238:[[53,44],256],127239:[[54,44],256],127240:[[55,44],256],127241:[[56,44],256],127242:[[57,44],256],127248:[[40,65,41],256],127249:[[40,66,41],256],127250:[[40,67,41],256],127251:[[40,68,41],256],127252:[[40,69,41],256],127253:[[40,70,41],256],127254:[[40,71,41],256],127255:[[40,72,41],256],127256:[[40,73,41],256],127257:[[40,74,41],256],127258:[[40,75,41],256],127259:[[40,76,41],256],127260:[[40,77,41],256],127261:[[40,78,41],256],127262:[[40,79,41],256],127263:[[40,80,41],256],127264:[[40,81,41],256],127265:[[40,82,41],256],127266:[[40,83,41],256],127267:[[40,84,41],256],127268:[[40,85,41],256],127269:[[40,86,41],256],127270:[[40,87,41],256],127271:[[40,88,41],256],127272:[[40,89,41],256],127273:[[40,90,41],256],127274:[[12308,83,12309],256],127275:[[67],256],127276:[[82],256],127277:[[67,68],256],127278:[[87,90],256],127280:[[65],256],127281:[[66],256],127282:[[67],256],127283:[[68],256],127284:[[69],256],127285:[[70],256],127286:[[71],256],127287:[[72],256],127288:[[73],256],127289:[[74],256],127290:[[75],256],127291:[[76],256],127292:[[77],256],127293:[[78],256],127294:[[79],256],127295:[[80],256],127296:[[81],256],127297:[[82],256],127298:[[83],256],127299:[[84],256],127300:[[85],256],127301:[[86],256],127302:[[87],256],127303:[[88],256],127304:[[89],256],127305:[[90],256],127306:[[72,86],256],127307:[[77,86],256],127308:[[83,68],256],127309:[[83,83],256],127310:[[80,80,86],256],127311:[[87,67],256],127338:[[77,67],256],127339:[[77,68],256],127376:[[68,74],256]},
61952:{127488:[[12411,12363],256],127489:[[12467,12467],256],127490:[[12469],256],127504:[[25163],256],127505:[[23383],256],127506:[[21452],256],127507:[[12487],256],127508:[[20108],256],127509:[[22810],256],127510:[[35299],256],127511:[[22825],256],127512:[[20132],256],127513:[[26144],256],127514:[[28961],256],127515:[[26009],256],127516:[[21069],256],127517:[[24460],256],127518:[[20877],256],127519:[[26032],256],127520:[[21021],256],127521:[[32066],256],127522:[[29983],256],127523:[[36009],256],127524:[[22768],256],127525:[[21561],256],127526:[[28436],256],127527:[[25237],256],127528:[[25429],256],127529:[[19968],256],127530:[[19977],256],127531:[[36938],256],127532:[[24038],256],127533:[[20013],256],127534:[[21491],256],127535:[[25351],256],127536:[[36208],256],127537:[[25171],256],127538:[[31105],256],127539:[[31354],256],127540:[[21512],256],127541:[[28288],256],127542:[[26377],256],127543:[[26376],256],127544:[[30003],256],127545:[[21106],256],127546:[[21942],256],127552:[[12308,26412,12309],256],127553:[[12308,19977,12309],256],127554:[[12308,20108,12309],256],127555:[[12308,23433,12309],256],127556:[[12308,28857,12309],256],127557:[[12308,25171,12309],256],127558:[[12308,30423,12309],256],127559:[[12308,21213,12309],256],127560:[[12308,25943,12309],256],127568:[[24471],256],127569:[[21487],256]},
63488:{194560:[[20029]],194561:[[20024]],194562:[[20033]],194563:[[131362]],194564:[[20320]],194565:[[20398]],194566:[[20411]],194567:[[20482]],194568:[[20602]],194569:[[20633]],194570:[[20711]],194571:[[20687]],194572:[[13470]],194573:[[132666]],194574:[[20813]],194575:[[20820]],194576:[[20836]],194577:[[20855]],194578:[[132380]],194579:[[13497]],194580:[[20839]],194581:[[20877]],194582:[[132427]],194583:[[20887]],194584:[[20900]],194585:[[20172]],194586:[[20908]],194587:[[20917]],194588:[[168415]],194589:[[20981]],194590:[[20995]],194591:[[13535]],194592:[[21051]],194593:[[21062]],194594:[[21106]],194595:[[21111]],194596:[[13589]],194597:[[21191]],194598:[[21193]],194599:[[21220]],194600:[[21242]],194601:[[21253]],194602:[[21254]],194603:[[21271]],194604:[[21321]],194605:[[21329]],194606:[[21338]],194607:[[21363]],194608:[[21373]],194609:[[21375]],194610:[[21375]],194611:[[21375]],194612:[[133676]],194613:[[28784]],194614:[[21450]],194615:[[21471]],194616:[[133987]],194617:[[21483]],194618:[[21489]],194619:[[21510]],194620:[[21662]],194621:[[21560]],194622:[[21576]],194623:[[21608]],194624:[[21666]],194625:[[21750]],194626:[[21776]],194627:[[21843]],194628:[[21859]],194629:[[21892]],194630:[[21892]],194631:[[21913]],194632:[[21931]],194633:[[21939]],194634:[[21954]],194635:[[22294]],194636:[[22022]],194637:[[22295]],194638:[[22097]],194639:[[22132]],194640:[[20999]],194641:[[22766]],194642:[[22478]],194643:[[22516]],194644:[[22541]],194645:[[22411]],194646:[[22578]],194647:[[22577]],194648:[[22700]],194649:[[136420]],194650:[[22770]],194651:[[22775]],194652:[[22790]],194653:[[22810]],194654:[[22818]],194655:[[22882]],194656:[[136872]],194657:[[136938]],194658:[[23020]],194659:[[23067]],194660:[[23079]],194661:[[23000]],194662:[[23142]],194663:[[14062]],194664:[[14076]],194665:[[23304]],194666:[[23358]],194667:[[23358]],194668:[[137672]],194669:[[23491]],194670:[[23512]],194671:[[23527]],194672:[[23539]],194673:[[138008]],194674:[[23551]],194675:[[23558]],194676:[[24403]],194677:[[23586]],194678:[[14209]],194679:[[23648]],194680:[[23662]],194681:[[23744]],194682:[[23693]],194683:[[138724]],194684:[[23875]],194685:[[138726]],194686:[[23918]],194687:[[23915]],194688:[[23932]],194689:[[24033]],194690:[[24034]],194691:[[14383]],194692:[[24061]],194693:[[24104]],194694:[[24125]],194695:[[24169]],194696:[[14434]],194697:[[139651]],194698:[[14460]],194699:[[24240]],194700:[[24243]],194701:[[24246]],194702:[[24266]],194703:[[172946]],194704:[[24318]],194705:[[140081]],194706:[[140081]],194707:[[33281]],194708:[[24354]],194709:[[24354]],194710:[[14535]],194711:[[144056]],194712:[[156122]],194713:[[24418]],194714:[[24427]],194715:[[14563]],194716:[[24474]],194717:[[24525]],194718:[[24535]],194719:[[24569]],194720:[[24705]],194721:[[14650]],194722:[[14620]],194723:[[24724]],194724:[[141012]],194725:[[24775]],194726:[[24904]],194727:[[24908]],194728:[[24910]],194729:[[24908]],194730:[[24954]],194731:[[24974]],194732:[[25010]],194733:[[24996]],194734:[[25007]],194735:[[25054]],194736:[[25074]],194737:[[25078]],194738:[[25104]],194739:[[25115]],194740:[[25181]],194741:[[25265]],194742:[[25300]],194743:[[25424]],194744:[[142092]],194745:[[25405]],194746:[[25340]],194747:[[25448]],194748:[[25475]],194749:[[25572]],194750:[[142321]],194751:[[25634]],194752:[[25541]],194753:[[25513]],194754:[[14894]],194755:[[25705]],194756:[[25726]],194757:[[25757]],194758:[[25719]],194759:[[14956]],194760:[[25935]],194761:[[25964]],194762:[[143370]],194763:[[26083]],194764:[[26360]],194765:[[26185]],194766:[[15129]],194767:[[26257]],194768:[[15112]],194769:[[15076]],194770:[[20882]],194771:[[20885]],194772:[[26368]],194773:[[26268]],194774:[[32941]],194775:[[17369]],194776:[[26391]],194777:[[26395]],194778:[[26401]],194779:[[26462]],194780:[[26451]],194781:[[144323]],194782:[[15177]],194783:[[26618]],194784:[[26501]],194785:[[26706]],194786:[[26757]],194787:[[144493]],194788:[[26766]],194789:[[26655]],194790:[[26900]],194791:[[15261]],194792:[[26946]],194793:[[27043]],194794:[[27114]],194795:[[27304]],194796:[[145059]],194797:[[27355]],194798:[[15384]],194799:[[27425]],194800:[[145575]],194801:[[27476]],194802:[[15438]],194803:[[27506]],194804:[[27551]],194805:[[27578]],194806:[[27579]],194807:[[146061]],194808:[[138507]],194809:[[146170]],194810:[[27726]],194811:[[146620]],194812:[[27839]],194813:[[27853]],194814:[[27751]],194815:[[27926]]},
63744:{63744:[[35912]],63745:[[26356]],63746:[[36554]],63747:[[36040]],63748:[[28369]],63749:[[20018]],63750:[[21477]],63751:[[40860]],63752:[[40860]],63753:[[22865]],63754:[[37329]],63755:[[21895]],63756:[[22856]],63757:[[25078]],63758:[[30313]],63759:[[32645]],63760:[[34367]],63761:[[34746]],63762:[[35064]],63763:[[37007]],63764:[[27138]],63765:[[27931]],63766:[[28889]],63767:[[29662]],63768:[[33853]],63769:[[37226]],63770:[[39409]],63771:[[20098]],63772:[[21365]],63773:[[27396]],63774:[[29211]],63775:[[34349]],63776:[[40478]],63777:[[23888]],63778:[[28651]],63779:[[34253]],63780:[[35172]],63781:[[25289]],63782:[[33240]],63783:[[34847]],63784:[[24266]],63785:[[26391]],63786:[[28010]],63787:[[29436]],63788:[[37070]],63789:[[20358]],63790:[[20919]],63791:[[21214]],63792:[[25796]],63793:[[27347]],63794:[[29200]],63795:[[30439]],63796:[[32769]],63797:[[34310]],63798:[[34396]],63799:[[36335]],63800:[[38706]],63801:[[39791]],63802:[[40442]],63803:[[30860]],63804:[[31103]],63805:[[32160]],63806:[[33737]],63807:[[37636]],63808:[[40575]],63809:[[35542]],63810:[[22751]],63811:[[24324]],63812:[[31840]],63813:[[32894]],63814:[[29282]],63815:[[30922]],63816:[[36034]],63817:[[38647]],63818:[[22744]],63819:[[23650]],63820:[[27155]],63821:[[28122]],63822:[[28431]],63823:[[32047]],63824:[[32311]],63825:[[38475]],63826:[[21202]],63827:[[32907]],63828:[[20956]],63829:[[20940]],63830:[[31260]],63831:[[32190]],63832:[[33777]],63833:[[38517]],63834:[[35712]],63835:[[25295]],63836:[[27138]],63837:[[35582]],63838:[[20025]],63839:[[23527]],63840:[[24594]],63841:[[29575]],63842:[[30064]],63843:[[21271]],63844:[[30971]],63845:[[20415]],63846:[[24489]],63847:[[19981]],63848:[[27852]],63849:[[25976]],63850:[[32034]],63851:[[21443]],63852:[[22622]],63853:[[30465]],63854:[[33865]],63855:[[35498]],63856:[[27578]],63857:[[36784]],63858:[[27784]],63859:[[25342]],63860:[[33509]],63861:[[25504]],63862:[[30053]],63863:[[20142]],63864:[[20841]],63865:[[20937]],63866:[[26753]],63867:[[31975]],63868:[[33391]],63869:[[35538]],63870:[[37327]],63871:[[21237]],63872:[[21570]],63873:[[22899]],63874:[[24300]],63875:[[26053]],63876:[[28670]],63877:[[31018]],63878:[[38317]],63879:[[39530]],63880:[[40599]],63881:[[40654]],63882:[[21147]],63883:[[26310]],63884:[[27511]],63885:[[36706]],63886:[[24180]],63887:[[24976]],63888:[[25088]],63889:[[25754]],63890:[[28451]],63891:[[29001]],63892:[[29833]],63893:[[31178]],63894:[[32244]],63895:[[32879]],63896:[[36646]],63897:[[34030]],63898:[[36899]],63899:[[37706]],63900:[[21015]],63901:[[21155]],63902:[[21693]],63903:[[28872]],63904:[[35010]],63905:[[35498]],63906:[[24265]],63907:[[24565]],63908:[[25467]],63909:[[27566]],63910:[[31806]],63911:[[29557]],63912:[[20196]],63913:[[22265]],63914:[[23527]],63915:[[23994]],63916:[[24604]],63917:[[29618]],63918:[[29801]],63919:[[32666]],63920:[[32838]],63921:[[37428]],63922:[[38646]],63923:[[38728]],63924:[[38936]],63925:[[20363]],63926:[[31150]],63927:[[37300]],63928:[[38584]],63929:[[24801]],63930:[[20102]],63931:[[20698]],63932:[[23534]],63933:[[23615]],63934:[[26009]],63935:[[27138]],63936:[[29134]],63937:[[30274]],63938:[[34044]],63939:[[36988]],63940:[[40845]],63941:[[26248]],63942:[[38446]],63943:[[21129]],63944:[[26491]],63945:[[26611]],63946:[[27969]],63947:[[28316]],63948:[[29705]],63949:[[30041]],63950:[[30827]],63951:[[32016]],63952:[[39006]],63953:[[20845]],63954:[[25134]],63955:[[38520]],63956:[[20523]],63957:[[23833]],63958:[[28138]],63959:[[36650]],63960:[[24459]],63961:[[24900]],63962:[[26647]],63963:[[29575]],63964:[[38534]],63965:[[21033]],63966:[[21519]],63967:[[23653]],63968:[[26131]],63969:[[26446]],63970:[[26792]],63971:[[27877]],63972:[[29702]],63973:[[30178]],63974:[[32633]],63975:[[35023]],63976:[[35041]],63977:[[37324]],63978:[[38626]],63979:[[21311]],63980:[[28346]],63981:[[21533]],63982:[[29136]],63983:[[29848]],63984:[[34298]],63985:[[38563]],63986:[[40023]],63987:[[40607]],63988:[[26519]],63989:[[28107]],63990:[[33256]],63991:[[31435]],63992:[[31520]],63993:[[31890]],63994:[[29376]],63995:[[28825]],63996:[[35672]],63997:[[20160]],63998:[[33590]],63999:[[21050]],194816:[[27966]],194817:[[28023]],194818:[[27969]],194819:[[28009]],194820:[[28024]],194821:[[28037]],194822:[[146718]],194823:[[27956]],194824:[[28207]],194825:[[28270]],194826:[[15667]],194827:[[28363]],194828:[[28359]],194829:[[147153]],194830:[[28153]],194831:[[28526]],194832:[[147294]],194833:[[147342]],194834:[[28614]],194835:[[28729]],194836:[[28702]],194837:[[28699]],194838:[[15766]],194839:[[28746]],194840:[[28797]],194841:[[28791]],194842:[[28845]],194843:[[132389]],194844:[[28997]],194845:[[148067]],194846:[[29084]],194847:[[148395]],194848:[[29224]],194849:[[29237]],194850:[[29264]],194851:[[149000]],194852:[[29312]],194853:[[29333]],194854:[[149301]],194855:[[149524]],194856:[[29562]],194857:[[29579]],194858:[[16044]],194859:[[29605]],194860:[[16056]],194861:[[16056]],194862:[[29767]],194863:[[29788]],194864:[[29809]],194865:[[29829]],194866:[[29898]],194867:[[16155]],194868:[[29988]],194869:[[150582]],194870:[[30014]],194871:[[150674]],194872:[[30064]],194873:[[139679]],194874:[[30224]],194875:[[151457]],194876:[[151480]],194877:[[151620]],194878:[[16380]],194879:[[16392]],194880:[[30452]],194881:[[151795]],194882:[[151794]],194883:[[151833]],194884:[[151859]],194885:[[30494]],194886:[[30495]],194887:[[30495]],194888:[[30538]],194889:[[16441]],194890:[[30603]],194891:[[16454]],194892:[[16534]],194893:[[152605]],194894:[[30798]],194895:[[30860]],194896:[[30924]],194897:[[16611]],194898:[[153126]],194899:[[31062]],194900:[[153242]],194901:[[153285]],194902:[[31119]],194903:[[31211]],194904:[[16687]],194905:[[31296]],194906:[[31306]],194907:[[31311]],194908:[[153980]],194909:[[154279]],194910:[[154279]],194911:[[31470]],194912:[[16898]],194913:[[154539]],194914:[[31686]],194915:[[31689]],194916:[[16935]],194917:[[154752]],194918:[[31954]],194919:[[17056]],194920:[[31976]],194921:[[31971]],194922:[[32000]],194923:[[155526]],194924:[[32099]],194925:[[17153]],194926:[[32199]],194927:[[32258]],194928:[[32325]],194929:[[17204]],194930:[[156200]],194931:[[156231]],194932:[[17241]],194933:[[156377]],194934:[[32634]],194935:[[156478]],194936:[[32661]],194937:[[32762]],194938:[[32773]],194939:[[156890]],194940:[[156963]],194941:[[32864]],194942:[[157096]],194943:[[32880]],194944:[[144223]],194945:[[17365]],194946:[[32946]],194947:[[33027]],194948:[[17419]],194949:[[33086]],194950:[[23221]],194951:[[157607]],194952:[[157621]],194953:[[144275]],194954:[[144284]],194955:[[33281]],194956:[[33284]],194957:[[36766]],194958:[[17515]],194959:[[33425]],194960:[[33419]],194961:[[33437]],194962:[[21171]],194963:[[33457]],194964:[[33459]],194965:[[33469]],194966:[[33510]],194967:[[158524]],194968:[[33509]],194969:[[33565]],194970:[[33635]],194971:[[33709]],194972:[[33571]],194973:[[33725]],194974:[[33767]],194975:[[33879]],194976:[[33619]],194977:[[33738]],194978:[[33740]],194979:[[33756]],194980:[[158774]],194981:[[159083]],194982:[[158933]],194983:[[17707]],194984:[[34033]],194985:[[34035]],194986:[[34070]],194987:[[160714]],194988:[[34148]],194989:[[159532]],194990:[[17757]],194991:[[17761]],194992:[[159665]],194993:[[159954]],194994:[[17771]],194995:[[34384]],194996:[[34396]],194997:[[34407]],194998:[[34409]],194999:[[34473]],195000:[[34440]],195001:[[34574]],195002:[[34530]],195003:[[34681]],195004:[[34600]],195005:[[34667]],195006:[[34694]],195007:[[17879]],195008:[[34785]],195009:[[34817]],195010:[[17913]],195011:[[34912]],195012:[[34915]],195013:[[161383]],195014:[[35031]],195015:[[35038]],195016:[[17973]],195017:[[35066]],195018:[[13499]],195019:[[161966]],195020:[[162150]],195021:[[18110]],195022:[[18119]],195023:[[35488]],195024:[[35565]],195025:[[35722]],195026:[[35925]],195027:[[162984]],195028:[[36011]],195029:[[36033]],195030:[[36123]],195031:[[36215]],195032:[[163631]],195033:[[133124]],195034:[[36299]],195035:[[36284]],195036:[[36336]],195037:[[133342]],195038:[[36564]],195039:[[36664]],195040:[[165330]],195041:[[165357]],195042:[[37012]],195043:[[37105]],195044:[[37137]],195045:[[165678]],195046:[[37147]],195047:[[37432]],195048:[[37591]],195049:[[37592]],195050:[[37500]],195051:[[37881]],195052:[[37909]],195053:[[166906]],195054:[[38283]],195055:[[18837]],195056:[[38327]],195057:[[167287]],195058:[[18918]],195059:[[38595]],195060:[[23986]],195061:[[38691]],195062:[[168261]],195063:[[168474]],195064:[[19054]],195065:[[19062]],195066:[[38880]],195067:[[168970]],195068:[[19122]],195069:[[169110]],195070:[[38923]],195071:[[38923]]},
64000:{64000:[[20999]],64001:[[24230]],64002:[[25299]],64003:[[31958]],64004:[[23429]],64005:[[27934]],64006:[[26292]],64007:[[36667]],64008:[[34892]],64009:[[38477]],64010:[[35211]],64011:[[24275]],64012:[[20800]],64013:[[21952]],64016:[[22618]],64018:[[26228]],64021:[[20958]],64022:[[29482]],64023:[[30410]],64024:[[31036]],64025:[[31070]],64026:[[31077]],64027:[[31119]],64028:[[38742]],64029:[[31934]],64030:[[32701]],64032:[[34322]],64034:[[35576]],64037:[[36920]],64038:[[37117]],64042:[[39151]],64043:[[39164]],64044:[[39208]],64045:[[40372]],64046:[[37086]],64047:[[38583]],64048:[[20398]],64049:[[20711]],64050:[[20813]],64051:[[21193]],64052:[[21220]],64053:[[21329]],64054:[[21917]],64055:[[22022]],64056:[[22120]],64057:[[22592]],64058:[[22696]],64059:[[23652]],64060:[[23662]],64061:[[24724]],64062:[[24936]],64063:[[24974]],64064:[[25074]],64065:[[25935]],64066:[[26082]],64067:[[26257]],64068:[[26757]],64069:[[28023]],64070:[[28186]],64071:[[28450]],64072:[[29038]],64073:[[29227]],64074:[[29730]],64075:[[30865]],64076:[[31038]],64077:[[31049]],64078:[[31048]],64079:[[31056]],64080:[[31062]],64081:[[31069]],64082:[[31117]],64083:[[31118]],64084:[[31296]],64085:[[31361]],64086:[[31680]],64087:[[32244]],64088:[[32265]],64089:[[32321]],64090:[[32626]],64091:[[32773]],64092:[[33261]],64093:[[33401]],64094:[[33401]],64095:[[33879]],64096:[[35088]],64097:[[35222]],64098:[[35585]],64099:[[35641]],64100:[[36051]],64101:[[36104]],64102:[[36790]],64103:[[36920]],64104:[[38627]],64105:[[38911]],64106:[[38971]],64107:[[24693]],64108:[[148206]],64109:[[33304]],64112:[[20006]],64113:[[20917]],64114:[[20840]],64115:[[20352]],64116:[[20805]],64117:[[20864]],64118:[[21191]],64119:[[21242]],64120:[[21917]],64121:[[21845]],64122:[[21913]],64123:[[21986]],64124:[[22618]],64125:[[22707]],64126:[[22852]],64127:[[22868]],64128:[[23138]],64129:[[23336]],64130:[[24274]],64131:[[24281]],64132:[[24425]],64133:[[24493]],64134:[[24792]],64135:[[24910]],64136:[[24840]],64137:[[24974]],64138:[[24928]],64139:[[25074]],64140:[[25140]],64141:[[25540]],64142:[[25628]],64143:[[25682]],64144:[[25942]],64145:[[26228]],64146:[[26391]],64147:[[26395]],64148:[[26454]],64149:[[27513]],64150:[[27578]],64151:[[27969]],64152:[[28379]],64153:[[28363]],64154:[[28450]],64155:[[28702]],64156:[[29038]],64157:[[30631]],64158:[[29237]],64159:[[29359]],64160:[[29482]],64161:[[29809]],64162:[[29958]],64163:[[30011]],64164:[[30237]],64165:[[30239]],64166:[[30410]],64167:[[30427]],64168:[[30452]],64169:[[30538]],64170:[[30528]],64171:[[30924]],64172:[[31409]],64173:[[31680]],64174:[[31867]],64175:[[32091]],64176:[[32244]],64177:[[32574]],64178:[[32773]],64179:[[33618]],64180:[[33775]],64181:[[34681]],64182:[[35137]],64183:[[35206]],64184:[[35222]],64185:[[35519]],64186:[[35576]],64187:[[35531]],64188:[[35585]],64189:[[35582]],64190:[[35565]],64191:[[35641]],64192:[[35722]],64193:[[36104]],64194:[[36664]],64195:[[36978]],64196:[[37273]],64197:[[37494]],64198:[[38524]],64199:[[38627]],64200:[[38742]],64201:[[38875]],64202:[[38911]],64203:[[38923]],64204:[[38971]],64205:[[39698]],64206:[[40860]],64207:[[141386]],64208:[[141380]],64209:[[144341]],64210:[[15261]],64211:[[16408]],64212:[[16441]],64213:[[152137]],64214:[[154832]],64215:[[163539]],64216:[[40771]],64217:[[40846]],195072:[[38953]],195073:[[169398]],195074:[[39138]],195075:[[19251]],195076:[[39209]],195077:[[39335]],195078:[[39362]],195079:[[39422]],195080:[[19406]],195081:[[170800]],195082:[[39698]],195083:[[40000]],195084:[[40189]],195085:[[19662]],195086:[[19693]],195087:[[40295]],195088:[[172238]],195089:[[19704]],195090:[[172293]],195091:[[172558]],195092:[[172689]],195093:[[40635]],195094:[[19798]],195095:[[40697]],195096:[[40702]],195097:[[40709]],195098:[[40719]],195099:[[40726]],195100:[[40763]],195101:[[173568]]},
64256:{64256:[[102,102],256],64257:[[102,105],256],64258:[[102,108],256],64259:[[102,102,105],256],64260:[[102,102,108],256],64261:[[383,116],256],64262:[[115,116],256],64275:[[1396,1398],256],64276:[[1396,1381],256],64277:[[1396,1387],256],64278:[[1406,1398],256],64279:[[1396,1389],256],64285:[[1497,1460],512],64286:[,26],64287:[[1522,1463],512],64288:[[1506],256],64289:[[1488],256],64290:[[1491],256],64291:[[1492],256],64292:[[1499],256],64293:[[1500],256],64294:[[1501],256],64295:[[1512],256],64296:[[1514],256],64297:[[43],256],64298:[[1513,1473],512],64299:[[1513,1474],512],64300:[[64329,1473],512],64301:[[64329,1474],512],64302:[[1488,1463],512],64303:[[1488,1464],512],64304:[[1488,1468],512],64305:[[1489,1468],512],64306:[[1490,1468],512],64307:[[1491,1468],512],64308:[[1492,1468],512],64309:[[1493,1468],512],64310:[[1494,1468],512],64312:[[1496,1468],512],64313:[[1497,1468],512],64314:[[1498,1468],512],64315:[[1499,1468],512],64316:[[1500,1468],512],64318:[[1502,1468],512],64320:[[1504,1468],512],64321:[[1505,1468],512],64323:[[1507,1468],512],64324:[[1508,1468],512],64326:[[1510,1468],512],64327:[[1511,1468],512],64328:[[1512,1468],512],64329:[[1513,1468],512],64330:[[1514,1468],512],64331:[[1493,1465],512],64332:[[1489,1471],512],64333:[[1499,1471],512],64334:[[1508,1471],512],64335:[[1488,1500],256],64336:[[1649],256],64337:[[1649],256],64338:[[1659],256],64339:[[1659],256],64340:[[1659],256],64341:[[1659],256],64342:[[1662],256],64343:[[1662],256],64344:[[1662],256],64345:[[1662],256],64346:[[1664],256],64347:[[1664],256],64348:[[1664],256],64349:[[1664],256],64350:[[1658],256],64351:[[1658],256],64352:[[1658],256],64353:[[1658],256],64354:[[1663],256],64355:[[1663],256],64356:[[1663],256],64357:[[1663],256],64358:[[1657],256],64359:[[1657],256],64360:[[1657],256],64361:[[1657],256],64362:[[1700],256],64363:[[1700],256],64364:[[1700],256],64365:[[1700],256],64366:[[1702],256],64367:[[1702],256],64368:[[1702],256],64369:[[1702],256],64370:[[1668],256],64371:[[1668],256],64372:[[1668],256],64373:[[1668],256],64374:[[1667],256],64375:[[1667],256],64376:[[1667],256],64377:[[1667],256],64378:[[1670],256],64379:[[1670],256],64380:[[1670],256],64381:[[1670],256],64382:[[1671],256],64383:[[1671],256],64384:[[1671],256],64385:[[1671],256],64386:[[1677],256],64387:[[1677],256],64388:[[1676],256],64389:[[1676],256],64390:[[1678],256],64391:[[1678],256],64392:[[1672],256],64393:[[1672],256],64394:[[1688],256],64395:[[1688],256],64396:[[1681],256],64397:[[1681],256],64398:[[1705],256],64399:[[1705],256],64400:[[1705],256],64401:[[1705],256],64402:[[1711],256],64403:[[1711],256],64404:[[1711],256],64405:[[1711],256],64406:[[1715],256],64407:[[1715],256],64408:[[1715],256],64409:[[1715],256],64410:[[1713],256],64411:[[1713],256],64412:[[1713],256],64413:[[1713],256],64414:[[1722],256],64415:[[1722],256],64416:[[1723],256],64417:[[1723],256],64418:[[1723],256],64419:[[1723],256],64420:[[1728],256],64421:[[1728],256],64422:[[1729],256],64423:[[1729],256],64424:[[1729],256],64425:[[1729],256],64426:[[1726],256],64427:[[1726],256],64428:[[1726],256],64429:[[1726],256],64430:[[1746],256],64431:[[1746],256],64432:[[1747],256],64433:[[1747],256],64467:[[1709],256],64468:[[1709],256],64469:[[1709],256],64470:[[1709],256],64471:[[1735],256],64472:[[1735],256],64473:[[1734],256],64474:[[1734],256],64475:[[1736],256],64476:[[1736],256],64477:[[1655],256],64478:[[1739],256],64479:[[1739],256],64480:[[1733],256],64481:[[1733],256],64482:[[1737],256],64483:[[1737],256],64484:[[1744],256],64485:[[1744],256],64486:[[1744],256],64487:[[1744],256],64488:[[1609],256],64489:[[1609],256],64490:[[1574,1575],256],64491:[[1574,1575],256],64492:[[1574,1749],256],64493:[[1574,1749],256],64494:[[1574,1608],256],64495:[[1574,1608],256],64496:[[1574,1735],256],64497:[[1574,1735],256],64498:[[1574,1734],256],64499:[[1574,1734],256],64500:[[1574,1736],256],64501:[[1574,1736],256],64502:[[1574,1744],256],64503:[[1574,1744],256],64504:[[1574,1744],256],64505:[[1574,1609],256],64506:[[1574,1609],256],64507:[[1574,1609],256],64508:[[1740],256],64509:[[1740],256],64510:[[1740],256],64511:[[1740],256]},
64512:{64512:[[1574,1580],256],64513:[[1574,1581],256],64514:[[1574,1605],256],64515:[[1574,1609],256],64516:[[1574,1610],256],64517:[[1576,1580],256],64518:[[1576,1581],256],64519:[[1576,1582],256],64520:[[1576,1605],256],64521:[[1576,1609],256],64522:[[1576,1610],256],64523:[[1578,1580],256],64524:[[1578,1581],256],64525:[[1578,1582],256],64526:[[1578,1605],256],64527:[[1578,1609],256],64528:[[1578,1610],256],64529:[[1579,1580],256],64530:[[1579,1605],256],64531:[[1579,1609],256],64532:[[1579,1610],256],64533:[[1580,1581],256],64534:[[1580,1605],256],64535:[[1581,1580],256],64536:[[1581,1605],256],64537:[[1582,1580],256],64538:[[1582,1581],256],64539:[[1582,1605],256],64540:[[1587,1580],256],64541:[[1587,1581],256],64542:[[1587,1582],256],64543:[[1587,1605],256],64544:[[1589,1581],256],64545:[[1589,1605],256],64546:[[1590,1580],256],64547:[[1590,1581],256],64548:[[1590,1582],256],64549:[[1590,1605],256],64550:[[1591,1581],256],64551:[[1591,1605],256],64552:[[1592,1605],256],64553:[[1593,1580],256],64554:[[1593,1605],256],64555:[[1594,1580],256],64556:[[1594,1605],256],64557:[[1601,1580],256],64558:[[1601,1581],256],64559:[[1601,1582],256],64560:[[1601,1605],256],64561:[[1601,1609],256],64562:[[1601,1610],256],64563:[[1602,1581],256],64564:[[1602,1605],256],64565:[[1602,1609],256],64566:[[1602,1610],256],64567:[[1603,1575],256],64568:[[1603,1580],256],64569:[[1603,1581],256],64570:[[1603,1582],256],64571:[[1603,1604],256],64572:[[1603,1605],256],64573:[[1603,1609],256],64574:[[1603,1610],256],64575:[[1604,1580],256],64576:[[1604,1581],256],64577:[[1604,1582],256],64578:[[1604,1605],256],64579:[[1604,1609],256],64580:[[1604,1610],256],64581:[[1605,1580],256],64582:[[1605,1581],256],64583:[[1605,1582],256],64584:[[1605,1605],256],64585:[[1605,1609],256],64586:[[1605,1610],256],64587:[[1606,1580],256],64588:[[1606,1581],256],64589:[[1606,1582],256],64590:[[1606,1605],256],64591:[[1606,1609],256],64592:[[1606,1610],256],64593:[[1607,1580],256],64594:[[1607,1605],256],64595:[[1607,1609],256],64596:[[1607,1610],256],64597:[[1610,1580],256],64598:[[1610,1581],256],64599:[[1610,1582],256],64600:[[1610,1605],256],64601:[[1610,1609],256],64602:[[1610,1610],256],64603:[[1584,1648],256],64604:[[1585,1648],256],64605:[[1609,1648],256],64606:[[32,1612,1617],256],64607:[[32,1613,1617],256],64608:[[32,1614,1617],256],64609:[[32,1615,1617],256],64610:[[32,1616,1617],256],64611:[[32,1617,1648],256],64612:[[1574,1585],256],64613:[[1574,1586],256],64614:[[1574,1605],256],64615:[[1574,1606],256],64616:[[1574,1609],256],64617:[[1574,1610],256],64618:[[1576,1585],256],64619:[[1576,1586],256],64620:[[1576,1605],256],64621:[[1576,1606],256],64622:[[1576,1609],256],64623:[[1576,1610],256],64624:[[1578,1585],256],64625:[[1578,1586],256],64626:[[1578,1605],256],64627:[[1578,1606],256],64628:[[1578,1609],256],64629:[[1578,1610],256],64630:[[1579,1585],256],64631:[[1579,1586],256],64632:[[1579,1605],256],64633:[[1579,1606],256],64634:[[1579,1609],256],64635:[[1579,1610],256],64636:[[1601,1609],256],64637:[[1601,1610],256],64638:[[1602,1609],256],64639:[[1602,1610],256],64640:[[1603,1575],256],64641:[[1603,1604],256],64642:[[1603,1605],256],64643:[[1603,1609],256],64644:[[1603,1610],256],64645:[[1604,1605],256],64646:[[1604,1609],256],64647:[[1604,1610],256],64648:[[1605,1575],256],64649:[[1605,1605],256],64650:[[1606,1585],256],64651:[[1606,1586],256],64652:[[1606,1605],256],64653:[[1606,1606],256],64654:[[1606,1609],256],64655:[[1606,1610],256],64656:[[1609,1648],256],64657:[[1610,1585],256],64658:[[1610,1586],256],64659:[[1610,1605],256],64660:[[1610,1606],256],64661:[[1610,1609],256],64662:[[1610,1610],256],64663:[[1574,1580],256],64664:[[1574,1581],256],64665:[[1574,1582],256],64666:[[1574,1605],256],64667:[[1574,1607],256],64668:[[1576,1580],256],64669:[[1576,1581],256],64670:[[1576,1582],256],64671:[[1576,1605],256],64672:[[1576,1607],256],64673:[[1578,1580],256],64674:[[1578,1581],256],64675:[[1578,1582],256],64676:[[1578,1605],256],64677:[[1578,1607],256],64678:[[1579,1605],256],64679:[[1580,1581],256],64680:[[1580,1605],256],64681:[[1581,1580],256],64682:[[1581,1605],256],64683:[[1582,1580],256],64684:[[1582,1605],256],64685:[[1587,1580],256],64686:[[1587,1581],256],64687:[[1587,1582],256],64688:[[1587,1605],256],64689:[[1589,1581],256],64690:[[1589,1582],256],64691:[[1589,1605],256],64692:[[1590,1580],256],64693:[[1590,1581],256],64694:[[1590,1582],256],64695:[[1590,1605],256],64696:[[1591,1581],256],64697:[[1592,1605],256],64698:[[1593,1580],256],64699:[[1593,1605],256],64700:[[1594,1580],256],64701:[[1594,1605],256],64702:[[1601,1580],256],64703:[[1601,1581],256],64704:[[1601,1582],256],64705:[[1601,1605],256],64706:[[1602,1581],256],64707:[[1602,1605],256],64708:[[1603,1580],256],64709:[[1603,1581],256],64710:[[1603,1582],256],64711:[[1603,1604],256],64712:[[1603,1605],256],64713:[[1604,1580],256],64714:[[1604,1581],256],64715:[[1604,1582],256],64716:[[1604,1605],256],64717:[[1604,1607],256],64718:[[1605,1580],256],64719:[[1605,1581],256],64720:[[1605,1582],256],64721:[[1605,1605],256],64722:[[1606,1580],256],64723:[[1606,1581],256],64724:[[1606,1582],256],64725:[[1606,1605],256],64726:[[1606,1607],256],64727:[[1607,1580],256],64728:[[1607,1605],256],64729:[[1607,1648],256],64730:[[1610,1580],256],64731:[[1610,1581],256],64732:[[1610,1582],256],64733:[[1610,1605],256],64734:[[1610,1607],256],64735:[[1574,1605],256],64736:[[1574,1607],256],64737:[[1576,1605],256],64738:[[1576,1607],256],64739:[[1578,1605],256],64740:[[1578,1607],256],64741:[[1579,1605],256],64742:[[1579,1607],256],64743:[[1587,1605],256],64744:[[1587,1607],256],64745:[[1588,1605],256],64746:[[1588,1607],256],64747:[[1603,1604],256],64748:[[1603,1605],256],64749:[[1604,1605],256],64750:[[1606,1605],256],64751:[[1606,1607],256],64752:[[1610,1605],256],64753:[[1610,1607],256],64754:[[1600,1614,1617],256],64755:[[1600,1615,1617],256],64756:[[1600,1616,1617],256],64757:[[1591,1609],256],64758:[[1591,1610],256],64759:[[1593,1609],256],64760:[[1593,1610],256],64761:[[1594,1609],256],64762:[[1594,1610],256],64763:[[1587,1609],256],64764:[[1587,1610],256],64765:[[1588,1609],256],64766:[[1588,1610],256],64767:[[1581,1609],256]},
64768:{64768:[[1581,1610],256],64769:[[1580,1609],256],64770:[[1580,1610],256],64771:[[1582,1609],256],64772:[[1582,1610],256],64773:[[1589,1609],256],64774:[[1589,1610],256],64775:[[1590,1609],256],64776:[[1590,1610],256],64777:[[1588,1580],256],64778:[[1588,1581],256],64779:[[1588,1582],256],64780:[[1588,1605],256],64781:[[1588,1585],256],64782:[[1587,1585],256],64783:[[1589,1585],256],64784:[[1590,1585],256],64785:[[1591,1609],256],64786:[[1591,1610],256],64787:[[1593,1609],256],64788:[[1593,1610],256],64789:[[1594,1609],256],64790:[[1594,1610],256],64791:[[1587,1609],256],64792:[[1587,1610],256],64793:[[1588,1609],256],64794:[[1588,1610],256],64795:[[1581,1609],256],64796:[[1581,1610],256],64797:[[1580,1609],256],64798:[[1580,1610],256],64799:[[1582,1609],256],64800:[[1582,1610],256],64801:[[1589,1609],256],64802:[[1589,1610],256],64803:[[1590,1609],256],64804:[[1590,1610],256],64805:[[1588,1580],256],64806:[[1588,1581],256],64807:[[1588,1582],256],64808:[[1588,1605],256],64809:[[1588,1585],256],64810:[[1587,1585],256],64811:[[1589,1585],256],64812:[[1590,1585],256],64813:[[1588,1580],256],64814:[[1588,1581],256],64815:[[1588,1582],256],64816:[[1588,1605],256],64817:[[1587,1607],256],64818:[[1588,1607],256],64819:[[1591,1605],256],64820:[[1587,1580],256],64821:[[1587,1581],256],64822:[[1587,1582],256],64823:[[1588,1580],256],64824:[[1588,1581],256],64825:[[1588,1582],256],64826:[[1591,1605],256],64827:[[1592,1605],256],64828:[[1575,1611],256],64829:[[1575,1611],256],64848:[[1578,1580,1605],256],64849:[[1578,1581,1580],256],64850:[[1578,1581,1580],256],64851:[[1578,1581,1605],256],64852:[[1578,1582,1605],256],64853:[[1578,1605,1580],256],64854:[[1578,1605,1581],256],64855:[[1578,1605,1582],256],64856:[[1580,1605,1581],256],64857:[[1580,1605,1581],256],64858:[[1581,1605,1610],256],64859:[[1581,1605,1609],256],64860:[[1587,1581,1580],256],64861:[[1587,1580,1581],256],64862:[[1587,1580,1609],256],64863:[[1587,1605,1581],256],64864:[[1587,1605,1581],256],64865:[[1587,1605,1580],256],64866:[[1587,1605,1605],256],64867:[[1587,1605,1605],256],64868:[[1589,1581,1581],256],64869:[[1589,1581,1581],256],64870:[[1589,1605,1605],256],64871:[[1588,1581,1605],256],64872:[[1588,1581,1605],256],64873:[[1588,1580,1610],256],64874:[[1588,1605,1582],256],64875:[[1588,1605,1582],256],64876:[[1588,1605,1605],256],64877:[[1588,1605,1605],256],64878:[[1590,1581,1609],256],64879:[[1590,1582,1605],256],64880:[[1590,1582,1605],256],64881:[[1591,1605,1581],256],64882:[[1591,1605,1581],256],64883:[[1591,1605,1605],256],64884:[[1591,1605,1610],256],64885:[[1593,1580,1605],256],64886:[[1593,1605,1605],256],64887:[[1593,1605,1605],256],64888:[[1593,1605,1609],256],64889:[[1594,1605,1605],256],64890:[[1594,1605,1610],256],64891:[[1594,1605,1609],256],64892:[[1601,1582,1605],256],64893:[[1601,1582,1605],256],64894:[[1602,1605,1581],256],64895:[[1602,1605,1605],256],64896:[[1604,1581,1605],256],64897:[[1604,1581,1610],256],64898:[[1604,1581,1609],256],64899:[[1604,1580,1580],256],64900:[[1604,1580,1580],256],64901:[[1604,1582,1605],256],64902:[[1604,1582,1605],256],64903:[[1604,1605,1581],256],64904:[[1604,1605,1581],256],64905:[[1605,1581,1580],256],64906:[[1605,1581,1605],256],64907:[[1605,1581,1610],256],64908:[[1605,1580,1581],256],64909:[[1605,1580,1605],256],64910:[[1605,1582,1580],256],64911:[[1605,1582,1605],256],64914:[[1605,1580,1582],256],64915:[[1607,1605,1580],256],64916:[[1607,1605,1605],256],64917:[[1606,1581,1605],256],64918:[[1606,1581,1609],256],64919:[[1606,1580,1605],256],64920:[[1606,1580,1605],256],64921:[[1606,1580,1609],256],64922:[[1606,1605,1610],256],64923:[[1606,1605,1609],256],64924:[[1610,1605,1605],256],64925:[[1610,1605,1605],256],64926:[[1576,1582,1610],256],64927:[[1578,1580,1610],256],64928:[[1578,1580,1609],256],64929:[[1578,1582,1610],256],64930:[[1578,1582,1609],256],64931:[[1578,1605,1610],256],64932:[[1578,1605,1609],256],64933:[[1580,1605,1610],256],64934:[[1580,1581,1609],256],64935:[[1580,1605,1609],256],64936:[[1587,1582,1609],256],64937:[[1589,1581,1610],256],64938:[[1588,1581,1610],256],64939:[[1590,1581,1610],256],64940:[[1604,1580,1610],256],64941:[[1604,1605,1610],256],64942:[[1610,1581,1610],256],64943:[[1610,1580,1610],256],64944:[[1610,1605,1610],256],64945:[[1605,1605,1610],256],64946:[[1602,1605,1610],256],64947:[[1606,1581,1610],256],64948:[[1602,1605,1581],256],64949:[[1604,1581,1605],256],64950:[[1593,1605,1610],256],64951:[[1603,1605,1610],256],64952:[[1606,1580,1581],256],64953:[[1605,1582,1610],256],64954:[[1604,1580,1605],256],64955:[[1603,1605,1605],256],64956:[[1604,1580,1605],256],64957:[[1606,1580,1581],256],64958:[[1580,1581,1610],256],64959:[[1581,1580,1610],256],64960:[[1605,1580,1610],256],64961:[[1601,1605,1610],256],64962:[[1576,1581,1610],256],64963:[[1603,1605,1605],256],64964:[[1593,1580,1605],256],64965:[[1589,1605,1605],256],64966:[[1587,1582,1610],256],64967:[[1606,1580,1610],256],65008:[[1589,1604,1746],256],65009:[[1602,1604,1746],256],65010:[[1575,1604,1604,1607],256],65011:[[1575,1603,1576,1585],256],65012:[[1605,1581,1605,1583],256],65013:[[1589,1604,1593,1605],256],65014:[[1585,1587,1608,1604],256],65015:[[1593,1604,1610,1607],256],65016:[[1608,1587,1604,1605],256],65017:[[1589,1604,1609],256],65018:[[1589,1604,1609,32,1575,1604,1604,1607,32,1593,1604,1610,1607,32,1608,1587,1604,1605],256],65019:[[1580,1604,32,1580,1604,1575,1604,1607],256],65020:[[1585,1740,1575,1604],256]},
65024:{65040:[[44],256],65041:[[12289],256],65042:[[12290],256],65043:[[58],256],65044:[[59],256],65045:[[33],256],65046:[[63],256],65047:[[12310],256],65048:[[12311],256],65049:[[8230],256],65056:[,230],65057:[,230],65058:[,230],65059:[,230],65060:[,230],65061:[,230],65062:[,230],65072:[[8229],256],65073:[[8212],256],65074:[[8211],256],65075:[[95],256],65076:[[95],256],65077:[[40],256],65078:[[41],256],65079:[[123],256],65080:[[125],256],65081:[[12308],256],65082:[[12309],256],65083:[[12304],256],65084:[[12305],256],65085:[[12298],256],65086:[[12299],256],65087:[[12296],256],65088:[[12297],256],65089:[[12300],256],65090:[[12301],256],65091:[[12302],256],65092:[[12303],256],65095:[[91],256],65096:[[93],256],65097:[[8254],256],65098:[[8254],256],65099:[[8254],256],65100:[[8254],256],65101:[[95],256],65102:[[95],256],65103:[[95],256],65104:[[44],256],65105:[[12289],256],65106:[[46],256],65108:[[59],256],65109:[[58],256],65110:[[63],256],65111:[[33],256],65112:[[8212],256],65113:[[40],256],65114:[[41],256],65115:[[123],256],65116:[[125],256],65117:[[12308],256],65118:[[12309],256],65119:[[35],256],65120:[[38],256],65121:[[42],256],65122:[[43],256],65123:[[45],256],65124:[[60],256],65125:[[62],256],65126:[[61],256],65128:[[92],256],65129:[[36],256],65130:[[37],256],65131:[[64],256],65136:[[32,1611],256],65137:[[1600,1611],256],65138:[[32,1612],256],65140:[[32,1613],256],65142:[[32,1614],256],65143:[[1600,1614],256],65144:[[32,1615],256],65145:[[1600,1615],256],65146:[[32,1616],256],65147:[[1600,1616],256],65148:[[32,1617],256],65149:[[1600,1617],256],65150:[[32,1618],256],65151:[[1600,1618],256],65152:[[1569],256],65153:[[1570],256],65154:[[1570],256],65155:[[1571],256],65156:[[1571],256],65157:[[1572],256],65158:[[1572],256],65159:[[1573],256],65160:[[1573],256],65161:[[1574],256],65162:[[1574],256],65163:[[1574],256],65164:[[1574],256],65165:[[1575],256],65166:[[1575],256],65167:[[1576],256],65168:[[1576],256],65169:[[1576],256],65170:[[1576],256],65171:[[1577],256],65172:[[1577],256],65173:[[1578],256],65174:[[1578],256],65175:[[1578],256],65176:[[1578],256],65177:[[1579],256],65178:[[1579],256],65179:[[1579],256],65180:[[1579],256],65181:[[1580],256],65182:[[1580],256],65183:[[1580],256],65184:[[1580],256],65185:[[1581],256],65186:[[1581],256],65187:[[1581],256],65188:[[1581],256],65189:[[1582],256],65190:[[1582],256],65191:[[1582],256],65192:[[1582],256],65193:[[1583],256],65194:[[1583],256],65195:[[1584],256],65196:[[1584],256],65197:[[1585],256],65198:[[1585],256],65199:[[1586],256],65200:[[1586],256],65201:[[1587],256],65202:[[1587],256],65203:[[1587],256],65204:[[1587],256],65205:[[1588],256],65206:[[1588],256],65207:[[1588],256],65208:[[1588],256],65209:[[1589],256],65210:[[1589],256],65211:[[1589],256],65212:[[1589],256],65213:[[1590],256],65214:[[1590],256],65215:[[1590],256],65216:[[1590],256],65217:[[1591],256],65218:[[1591],256],65219:[[1591],256],65220:[[1591],256],65221:[[1592],256],65222:[[1592],256],65223:[[1592],256],65224:[[1592],256],65225:[[1593],256],65226:[[1593],256],65227:[[1593],256],65228:[[1593],256],65229:[[1594],256],65230:[[1594],256],65231:[[1594],256],65232:[[1594],256],65233:[[1601],256],65234:[[1601],256],65235:[[1601],256],65236:[[1601],256],65237:[[1602],256],65238:[[1602],256],65239:[[1602],256],65240:[[1602],256],65241:[[1603],256],65242:[[1603],256],65243:[[1603],256],65244:[[1603],256],65245:[[1604],256],65246:[[1604],256],65247:[[1604],256],65248:[[1604],256],65249:[[1605],256],65250:[[1605],256],65251:[[1605],256],65252:[[1605],256],65253:[[1606],256],65254:[[1606],256],65255:[[1606],256],65256:[[1606],256],65257:[[1607],256],65258:[[1607],256],65259:[[1607],256],65260:[[1607],256],65261:[[1608],256],65262:[[1608],256],65263:[[1609],256],65264:[[1609],256],65265:[[1610],256],65266:[[1610],256],65267:[[1610],256],65268:[[1610],256],65269:[[1604,1570],256],65270:[[1604,1570],256],65271:[[1604,1571],256],65272:[[1604,1571],256],65273:[[1604,1573],256],65274:[[1604,1573],256],65275:[[1604,1575],256],65276:[[1604,1575],256]},
65280:{65281:[[33],256],65282:[[34],256],65283:[[35],256],65284:[[36],256],65285:[[37],256],65286:[[38],256],65287:[[39],256],65288:[[40],256],65289:[[41],256],65290:[[42],256],65291:[[43],256],65292:[[44],256],65293:[[45],256],65294:[[46],256],65295:[[47],256],65296:[[48],256],65297:[[49],256],65298:[[50],256],65299:[[51],256],65300:[[52],256],65301:[[53],256],65302:[[54],256],65303:[[55],256],65304:[[56],256],65305:[[57],256],65306:[[58],256],65307:[[59],256],65308:[[60],256],65309:[[61],256],65310:[[62],256],65311:[[63],256],65312:[[64],256],65313:[[65],256],65314:[[66],256],65315:[[67],256],65316:[[68],256],65317:[[69],256],65318:[[70],256],65319:[[71],256],65320:[[72],256],65321:[[73],256],65322:[[74],256],65323:[[75],256],65324:[[76],256],65325:[[77],256],65326:[[78],256],65327:[[79],256],65328:[[80],256],65329:[[81],256],65330:[[82],256],65331:[[83],256],65332:[[84],256],65333:[[85],256],65334:[[86],256],65335:[[87],256],65336:[[88],256],65337:[[89],256],65338:[[90],256],65339:[[91],256],65340:[[92],256],65341:[[93],256],65342:[[94],256],65343:[[95],256],65344:[[96],256],65345:[[97],256],65346:[[98],256],65347:[[99],256],65348:[[100],256],65349:[[101],256],65350:[[102],256],65351:[[103],256],65352:[[104],256],65353:[[105],256],65354:[[106],256],65355:[[107],256],65356:[[108],256],65357:[[109],256],65358:[[110],256],65359:[[111],256],65360:[[112],256],65361:[[113],256],65362:[[114],256],65363:[[115],256],65364:[[116],256],65365:[[117],256],65366:[[118],256],65367:[[119],256],65368:[[120],256],65369:[[121],256],65370:[[122],256],65371:[[123],256],65372:[[124],256],65373:[[125],256],65374:[[126],256],65375:[[10629],256],65376:[[10630],256],65377:[[12290],256],65378:[[12300],256],65379:[[12301],256],65380:[[12289],256],65381:[[12539],256],65382:[[12530],256],65383:[[12449],256],65384:[[12451],256],65385:[[12453],256],65386:[[12455],256],65387:[[12457],256],65388:[[12515],256],65389:[[12517],256],65390:[[12519],256],65391:[[12483],256],65392:[[12540],256],65393:[[12450],256],65394:[[12452],256],65395:[[12454],256],65396:[[12456],256],65397:[[12458],256],65398:[[12459],256],65399:[[12461],256],65400:[[12463],256],65401:[[12465],256],65402:[[12467],256],65403:[[12469],256],65404:[[12471],256],65405:[[12473],256],65406:[[12475],256],65407:[[12477],256],65408:[[12479],256],65409:[[12481],256],65410:[[12484],256],65411:[[12486],256],65412:[[12488],256],65413:[[12490],256],65414:[[12491],256],65415:[[12492],256],65416:[[12493],256],65417:[[12494],256],65418:[[12495],256],65419:[[12498],256],65420:[[12501],256],65421:[[12504],256],65422:[[12507],256],65423:[[12510],256],65424:[[12511],256],65425:[[12512],256],65426:[[12513],256],65427:[[12514],256],65428:[[12516],256],65429:[[12518],256],65430:[[12520],256],65431:[[12521],256],65432:[[12522],256],65433:[[12523],256],65434:[[12524],256],65435:[[12525],256],65436:[[12527],256],65437:[[12531],256],65438:[[12441],256],65439:[[12442],256],65440:[[12644],256],65441:[[12593],256],65442:[[12594],256],65443:[[12595],256],65444:[[12596],256],65445:[[12597],256],65446:[[12598],256],65447:[[12599],256],65448:[[12600],256],65449:[[12601],256],65450:[[12602],256],65451:[[12603],256],65452:[[12604],256],65453:[[12605],256],65454:[[12606],256],65455:[[12607],256],65456:[[12608],256],65457:[[12609],256],65458:[[12610],256],65459:[[12611],256],65460:[[12612],256],65461:[[12613],256],65462:[[12614],256],65463:[[12615],256],65464:[[12616],256],65465:[[12617],256],65466:[[12618],256],65467:[[12619],256],65468:[[12620],256],65469:[[12621],256],65470:[[12622],256],65474:[[12623],256],65475:[[12624],256],65476:[[12625],256],65477:[[12626],256],65478:[[12627],256],65479:[[12628],256],65482:[[12629],256],65483:[[12630],256],65484:[[12631],256],65485:[[12632],256],65486:[[12633],256],65487:[[12634],256],65490:[[12635],256],65491:[[12636],256],65492:[[12637],256],65493:[[12638],256],65494:[[12639],256],65495:[[12640],256],65498:[[12641],256],65499:[[12642],256],65500:[[12643],256],65504:[[162],256],65505:[[163],256],65506:[[172],256],65507:[[175],256],65508:[[166],256],65509:[[165],256],65510:[[8361],256],65512:[[9474],256],65513:[[8592],256],65514:[[8593],256],65515:[[8594],256],65516:[[8595],256],65517:[[9632],256],65518:[[9675],256]}

};

   /***** Module to export */
   var unorm = {
      nfc: nfc,
      nfd: nfd,
      nfkc: nfkc,
      nfkd: nfkd,
   };

   /*globals module:true,define:true*/

   // CommonJS
   if (typeof module === "object") {
      module.exports = unorm;

   // AMD
   } else if (typeof define === "function" && define.amd) {
      define("unorm", function () {
         return unorm;
      });

   // Global
   } else {
      root.unorm = unorm;
   }

   /***** Export as shim for String::normalize method *****/
   /*
      http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts#november_8_2013_draft_rev_21

      21.1.3.12 String.prototype.normalize(form="NFC")
      When the normalize method is called with one argument form, the following steps are taken:

      1. Let O be CheckObjectCoercible(this value).
      2. Let S be ToString(O).
      3. ReturnIfAbrupt(S).
      4. If form is not provided or undefined let form be "NFC".
      5. Let f be ToString(form).
      6. ReturnIfAbrupt(f).
      7. If f is not one of "NFC", "NFD", "NFKC", or "NFKD", then throw a RangeError Exception.
      8. Let ns be the String value is the result of normalizing S into the normalization form named by f as specified in Unicode Standard Annex #15, UnicodeNormalizatoin Forms.
      9. Return ns.

      The length property of the normalize method is 0.

      *NOTE* The normalize function is intentionally generic; it does not require that its this value be a String object. Therefore it can be transferred to other kinds of objects for use as a method.
   */
   if (!String.prototype.normalize) {
      String.prototype.normalize = function(form) {
         var str = "" + this;
         form =  form === undefined ? "NFC" : form;

         if (form === "NFC") {
            return unorm.nfc(str);
         } else if (form === "NFD") {
            return unorm.nfd(str);
         } else if (form === "NFKC") {
            return unorm.nfkc(str);
         } else if (form === "NFKD") {
            return unorm.nfkd(str);
         } else {
            throw new RangeError("Invalid normalization form: " + form);
         }
      };
   }
}(this));

},{}],98:[function(require,module,exports){
module.exports={
  "name": "pdfjs",
  "author": {
    "name": "Markus Ast",
    "email": "npm.m@rkusa.st"
  },
  "version": "1.0.0-alpha.3",
  "homepage": "https://github.com/rkusa/pdfjs",
  "description": "A Portable Document Format (PDF) generation library targeting both the server- and client-side.",
  "keywords": [
    "pdf",
    "generator"
  ],
  "license": "MIT",
  "main": "lib/index",
  "scripts": {
    "test": "tap strict test/index.js",
    "prepublish": "browserify lib/index.js --debug --standalone pdfjs --detect-globals false | exorcist dist/pdfjs.js.map > dist/pdfjs.js"
  },
  "dependencies": {
    "base-64": "^0.1.0",
    "debug": "^2.2",
    "linebreak": "^0.3.0",
    "node-uuid": "^1.4",
    "ttfjs": "^0.4.0",
    "unorm": "^1.3"
  },
  "devDependencies": {
    "browserify": "^10.2",
    "exorcist": "^0.4.0",
    "glob": "^5.0",
    "tap": "^1.0"
  },
  "bugs": "https://github.com/rkusa/pdfjs/issues",
  "repository": {
    "type": "git",
    "url": "git://github.com/rkusa/pdfjs.git"
  },
  "engines": {
    "node": ">=0.8"
  }
}

},{}],99:[function(require,module,exports){
'use strict'

var Document = exports.Document = require('./element/document')
exports.createDocument = function(style) {
  return new Document(style)
}

var TTFFont = exports.TTFFont = require('./element/font/ttf')
exports.createTTFFont = function(src) {
  return new TTFFont(src)
}


var Image = exports.Image = require('./image')
exports.createImage = function(src) {
  return new Image(src)
}

exports.Parser = require('./pdf/parser/document')

var isClient = typeof window !== 'undefined' && !!window.document
// trick browserify
var fs = (require)('fs')
exports.load = function(path, callback) {
  if (isClient) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', path, true)
    xhr.responseType = 'arraybuffer'

    if (xhr.overrideMimeType) {
      xhr.overrideMimeType('text/plain; charset=x-user-defined')
    } else {
      xhr.setRequestHeader('Accept-Charset', 'x-user-defined')
    }

    xhr.onload = function() {
      if (xhr.status === 200) {
        callback(null, xhr.response)
      } else {
        callback(new Error(xhr.statusText), null)
      }
    }

    xhr.send(null)
  } else {
    fs.readFile(path, callback)
  }
}

},{"./element/document":5,"./element/font/ttf":6,"./image":16,"./pdf/parser/document":53,"fs":65}]},{},[99])(99)
});
//# sourceMappingURL=pdfjs.js.map
