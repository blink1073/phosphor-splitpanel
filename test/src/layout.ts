/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import expect = require('expect.js');

import {
  Message, clearMessageData, sendMessage
} from 'phosphor-messaging';

import {
  Property
} from 'phosphor-properties';

import {
  ChildMessage, ResizeMessage, Widget
} from 'phosphor-widget';

import {
  Orientation, SplitHandle, SplitLayout, SplitPanel
} from '../../lib/index';


class LogLayout extends SplitLayout {

  messages: string[] = [];

  methods: string[] = [];

  processParentMessage(msg: Message): void {
    super.processParentMessage(msg);
    this.messages.push(msg.type);
  }

  protected initialize(): void {
    super.initialize();
    this.methods.push('initialize');
  }

  protected attachChild(index: number, child: Widget): void {
    super.attachChild(index, child);
    this.methods.push('attachChild');
  }

  protected moveChild(fromIndex: number, toIndex: number, child: Widget): void {
    super.moveChild(fromIndex, toIndex, child);
    this.methods.push('moveChild');
  }

  protected detachChild(index: number, child: Widget): void {
    super.detachChild(index, child);
    this.methods.push('detachChild');
  }

  protected onAfterShow(msg: Message): void {
    super.onAfterShow(msg);
    this.methods.push('onAfterShow');
  }

  protected onAfterAttach(msg: Message): void {
     super.onAfterAttach(msg);
     this.methods.push('onAfterAttach');
  }

  protected onChildShown(msg: ChildMessage): void {
    super.onChildShown(msg);
    this.methods.push('onChildShown');
  }

  protected onChildHidden(msg: ChildMessage): void {
    super.onChildHidden(msg);
    this.methods.push('onChildHidden');
  }

  protected onResize(msg: ResizeMessage): void {
    super.onResize(msg);
    this.methods.push('onResize');
  }

  protected onUpdateRequest(msg: Message): void {
    super.onUpdateRequest(msg);
    this.methods.push('onUpdateRequest');
  }

  protected onFitRequest(msg: Message): void {
    super.onFitRequest(msg);
    this.methods.push('onFitRequest');
  }

}


class LogWidget extends Widget {

  messages: string[] = [];

  processMessage(msg: Message): void {
    super.processMessage(msg);
    this.messages.push(msg.type);
  }
}


function triggerMouseEvent(node: HTMLElement, eventType: string, options: any = {}) {
  options.bubbles = true;
  let clickEvent = document.createEvent('MouseEvent');
  clickEvent.initMouseEvent(
    eventType,
    options.bubbles,
    options.cancelable,
    options.view,
    options.detail,
    options.screenX,
    options.screenY,
    options.clientX,
    options.clientY,
    options.ctrlKey,
    options.altKey,
    options.shiftKey,
    options.metaKey,
    options.button,
    options.relatedTarget
  );
  node.dispatchEvent(clickEvent);
}


function triggerKeyEvent(node: HTMLElement, eventType: string, options: any = {}) {
  let event = document.createEvent('Event');
  event.initEvent(eventType, true, true);
  for (let prop in options) {
    (<any>event)[prop] = options[prop];
  }
  node.dispatchEvent(event);
}


let factory = {
  createHandle: () => { return new SplitHandle(); }
}


describe('phosphor-splitpanel', () => {

  describe('SplitLayout', () => {

    describe('.Horizontal', () => {

      it('should be an alias of the `Horizontal` Orientation', () => {
          expect(SplitLayout.Horizontal).to.be(Orientation.Horizontal);
      });

    });

    describe('.Vertical', () => {

      it('should be an alias of the `Vertical` Orientation', () => {
          expect(SplitLayout.Vertical).to.be(Orientation.Vertical);
      });

    });

    describe('.getStretch', () => {

      it('should return the layout stretch factor for the given widget', () => {
        let widget = new Widget();
        expect(SplitLayout.getStretch(widget)).to.be(0);
      });

    });

    describe('.setStretch', () => {

      it('should set the split layout stretch factor for the given widget.', () => {
        let widget = new Widget();
        SplitLayout.setStretch(widget, 1);
        expect(SplitLayout.getStretch(widget)).to.be(1);
      });

    });

    describe('#constructor()', () => {

      it('should take a handle factory argument', () => {
        let layout = new SplitLayout(factory);
        expect(layout instanceof SplitLayout).to.be(true);
      });

    });


    describe('#orientation', () => {

      it('should get the orientation of the split layout', () => {
        let layout = new SplitLayout(factory);
        expect(layout.orientation).to.be(Orientation.Horizontal);
      });

      it('should set the orientation of the split layout', () => {
        let layout = new SplitLayout(factory);
        layout.orientation = Orientation.Vertical
        expect(layout.orientation).to.be(Orientation.Vertical);
      });

    });

    describe('#spacing', () => {

      it('should get the inter-element spacing', () => {
        let layout = new SplitLayout(factory);
        expect(layout.spacing).to.be(3);
      });

      it('should set the inter-element spacing', () => {
        let layout = new SplitLayout(factory);
        layout.spacing = 5;
        expect(layout.spacing).to.be(5);
      });

    });

    describe('#sizes()', () => {

      it('should get the normalized sizes of the widgets in the layout', () => {
        let layout = new SplitLayout(factory);
        let parent = new Widget();
        let widget0 = new Widget();
        let widget1 = new Widget();
        layout.addChild(widget0);
        layout.addChild(widget1);
        parent.layout = layout;
        parent.attach(document.body);
        expect(layout.sizes()).to.eql([0.5, 0.5]);
        layout.setSizes([2, 3]);
        expect(layout.sizes()).to.eql([0.4, 0.6]);
        parent.dispose();
      });

    });

    describe('#setSizes()', () => {

      it('should set the relative sizes for the child widgets in the layout', (done) => {
        let layout = new LogLayout(factory);
        let children = [new Widget(), new Widget()];
        let parent = new LogWidget();
        layout.addChild(children[0]);
        layout.addChild(children[1]);
        parent.layout = layout;
        parent.attach(document.body);
        layout.setSizes([1, 4]);
        expect(layout.sizes()).to.eql([0.2, 0.8]);
        parent.messages = [];
        requestAnimationFrame(() => {
          expect(parent.messages.indexOf('update-request')).to.not.be(-1);
          parent.dispose();
          done();
        });

      });

    });

    describe('#handleAt()', () => {

      it('should get the split handle for the widget at the given index', () => {
        let layout = new SplitLayout(factory);
        let widget0 = new Widget();
        let widget1 = new Widget();
        let parent = new Widget();
        layout.addChild(widget0);
        layout.addChild(widget1);
        parent.layout = layout;
        parent.attach(document.body);
        expect(layout.handleAt(0) instanceof SplitHandle).to.be(true);
        parent.dispose();
      });

      it('should return `undefined` if the index is invalid', () => {
        let layout = new SplitLayout(factory);
        expect(layout.handleAt(0)).to.be(void 0);
      });

    });

    describe('#moveHandle()', () => {

      it('should move a split handle to the specified offset position', (done) => {
        let layout = new SplitLayout(factory);
        let widget0 = new LogWidget();
        let widget1 = new LogWidget();
        let parent = new LogWidget();
        layout.addChild(widget0);
        layout.addChild(widget1);
        parent.layout = layout;
        parent.attach(document.body);
        requestAnimationFrame(() => {
          let left = layout.handleAt(0).node.offsetLeft;
          parent.messages = [];
          layout.moveHandle(0, left - 100);
          requestAnimationFrame(() => {
            expect(layout.handleAt(0).node.offsetLeft).to.be(left - 100);
            expect(parent.messages.indexOf('update-request')).to.not.be(-1);
            parent.dispose();
            done();
          });
        });
      });

      it('should be a no-op if there is no movement', (done) => {
        let layout = new SplitLayout(factory);
        let widget0 = new LogWidget();
        let widget1 = new LogWidget();
        let parent = new LogWidget();
        layout.addChild(widget0);
        layout.addChild(widget1);
        parent.layout = layout;
        parent.attach(document.body);
        requestAnimationFrame(() => {
          let handle = layout.handleAt(0);
          let left = handle.node.offsetLeft;
          parent.messages = [];
          layout.moveHandle(0, left);
          requestAnimationFrame(() => {
            expect(handle.node.offsetLeft).to.be(left);
            expect(parent.messages.indexOf('update-request')).to.be(-1);
            parent.dispose();
            done();
          });
        });
      });

      it('should be a no-op if invalid handle number', (done) => {
        let layout = new SplitLayout(factory);
        let widget0 = new LogWidget();
        let widget1 = new LogWidget();
        let parent = new LogWidget();
        layout.addChild(widget0);
        layout.addChild(widget1);
        parent.layout = layout;
        parent.attach(document.body);
        requestAnimationFrame(() => {
          let handle = layout.handleAt(0);
          parent.messages = [];
          layout.moveHandle(2, 100);
          requestAnimationFrame(() => {
            expect(parent.messages.indexOf('update-request')).to.be(-1);
            parent.dispose();
            done();
          });
        });
      });

      it('should be a no-op if handle is hidden', (done) => {
        let layout = new SplitLayout(factory);
        let widget0 = new LogWidget();
        let widget1 = new LogWidget();
        let parent = new LogWidget();
        layout.addChild(widget0);
        layout.addChild(widget1);
        parent.layout = layout;
        parent.attach(document.body);
        requestAnimationFrame(() => {
          let handle = layout.handleAt(0);
          let left = handle.node.offsetLeft;
          handle.hidden = true;
          parent.messages = [];
          layout.moveHandle(0, left - 100);
          requestAnimationFrame(() => {
            expect(handle.node.offsetLeft).to.be(left);
            expect(parent.messages.indexOf('update-request')).to.be(-1);
            parent.dispose();
            done();
          });
        });
      });

    });

    describe('#initialize()', () => {

      it('should set the orientation class on the parent', () => {
        let layout = new LogLayout(factory);
        let parent = new LogWidget();
        parent.layout = layout;
        expect(layout.methods.indexOf('initialize')).to.not.be(-1);
        expect(parent.hasClass('p-mod-horizontal')).to.be(true);
      });

    });

    describe('#attachChild', () => {

      it("should attach a child widget to the parent's DOM node", (done) => {
        let layout = new LogLayout(factory);
        let widget0 = new LogWidget();
        let widget1 = new LogWidget();
        let parent = new LogWidget();
        layout.addChild(widget0);
        layout.addChild(widget1);
        parent.layout = layout;
        parent.attach(document.body);
        requestAnimationFrame(() => {
          expect(layout.methods.indexOf('attachChild')).to.not.be(-1);
          expect(parent.node.contains(widget0.node)).to.be(true);
          expect(parent.node.contains(widget1.node)).to.be(true);
          parent.dispose();
          done();
        });

      });

      it('should send `after-attach` to the children', (done) => {
        let layout = new LogLayout(factory);
        let widget0 = new LogWidget();
        let widget1 = new LogWidget();
        let parent = new LogWidget();
        layout.addChild(widget0);
        layout.addChild(widget1);
        parent.layout = layout;
        parent.attach(document.body);
        requestAnimationFrame(() => {
          expect(layout.methods.indexOf('attachChild')).to.not.be(-1);
          expect(widget0.messages.indexOf('after-attach')).to.not.be(-1);
          expect(widget1.messages.indexOf('after-attach')).to.not.be(-1);
          parent.dispose();
          done();
        });

      });

      it('should call fit on the parent', (done) => {
        let layout = new LogLayout(factory);
        let widget0 = new LogWidget();
        let widget1 = new LogWidget();
        let parent = new LogWidget();
        layout.addChild(widget0);
        layout.addChild(widget1);
        parent.layout = layout;
        parent.attach(document.body);
        requestAnimationFrame(() => {
          expect(layout.methods.indexOf('attachChild')).to.not.be(-1);
          parent.messages = [];
          requestAnimationFrame(() => {
            expect(layout.messages.indexOf('fit-request')).to.not.be(-1);
            parent.dispose();
            done();
          });
        });
      });

    });

    describe('#moveChild()', () => {

      it('should be called when a child is moved', () => {
        let widget = new Widget();
        let children = [new Widget(), new Widget()];
        let layout = new LogLayout(factory);
        widget.layout = layout;
        layout.addChild(children[0]);
        layout.addChild(children[1]);
        layout.insertChild(0, children[1]);
        expect(layout.methods.indexOf('moveChild')).to.not.be(-1);
      });

      it("should send a fit request to the parent", (done) => {
        let widget = new LogWidget();
        let children = [new LogWidget(), new LogWidget()];
        let layout = new LogLayout(factory);
        layout.addChild(children[0]);
        layout.addChild(children[1]);
        widget.layout = layout;
        children[1].messages = [];
        widget.attach(document.body);
        layout.insertChild(0, children[1]);
        expect(layout.methods.indexOf('moveChild')).to.not.be(-1);
        requestAnimationFrame(() => {
          expect(widget.messages.indexOf('fit-request')).to.not.be(-1);
          widget.dispose();
          done();
        });
      });

    });

    describe('#detachChild()', () => {

      it('should be called when a child is detached', () => {
        let widget = new Widget();
        let children = [new Widget(), new Widget()];
        let layout = new LogLayout(factory);
        layout.addChild(children[0]);
        layout.addChild(children[1]);
        widget.layout = layout;
        widget.attach(document.body);
        children[1].parent = null;
        expect(layout.methods.indexOf('detachChild')).to.not.be(-1);
        widget.dispose();
      });

      it("should send a `'before-detach'` message if appropriate", () => {
        let widget = new Widget();
        let children = [new LogWidget(), new LogWidget()];
        let layout = new LogLayout(factory);
        layout.addChild(children[0]);
        layout.addChild(children[1]);
        widget.layout = layout;
        widget.attach(document.body);
        children[1].parent = null;
        expect(layout.methods.indexOf('detachChild')).to.not.be(-1);
        expect(children[1].messages.indexOf('before-detach')).to.not.be(-1);
        layout.dispose();
      });

      it('should send a fit request to the parent', (done) => {
        let widget = new LogWidget();
        let children = [new LogWidget(), new LogWidget()];
        let layout = new LogLayout(factory);
        layout.addChild(children[0]);
        layout.addChild(children[1]);
        widget.layout = layout;
        widget.attach(document.body);
        children[1].parent = null;
        expect(layout.methods.indexOf('detachChild')).to.not.be(-1);
        layout.messages = [];
        requestAnimationFrame(() => {
          expect(layout.messages.indexOf('fit-request')).to.not.be(-1);
          widget.dispose();
          done();
        });
      });

    });

    describe('#onAfterShow()', () => {

      it('should call update on the parent', (done) => {
        let widget = new LogWidget();
        let layout = new LogLayout(factory);
        widget.layout = layout;
        widget.attach(document.body);
        widget.hide();
        widget.show();
        expect(layout.methods.indexOf('onAfterShow')).to.not.be(-1);
        requestAnimationFrame(() => {
          expect(widget.messages.indexOf('update-request')).to.not.be(-1);
          widget.dispose();
          done();
        });
      });

    });

    describe('#onAfterAttach()', () => {

      it('should call fit on the parent', (done) => {
        let widget = new LogWidget();
        let layout = new LogLayout(factory);
        widget.layout = layout;
        widget.attach(document.body);
        expect(layout.methods.indexOf('onAfterAttach')).to.not.be(-1);
        requestAnimationFrame(() => {
          expect(widget.messages.indexOf('fit-request')).to.not.be(-1);
          widget.dispose();
          done();
        });
      });

    });

    describe('#onChildShown()', () => {

      it('should post or send fit message to the parent', (done) => {
        let widget = new LogWidget();
        let layout = new LogLayout(factory);
        widget.layout = layout;
        layout.addChild(new Widget());
        layout.addChild(new Widget());
        widget.attach(document.body);
        layout.childAt(0).hide();
        layout.childAt(0).show();
        expect(layout.methods.indexOf('onChildShown')).to.not.be(-1);
        requestAnimationFrame(() => {
          expect(widget.messages.indexOf('fit-request')).to.not.be(-1);
          widget.dispose();
          done();
        });
      });

    });

    describe('#onChildHidden()', () => {

      it('should post or send fit message to the parent', (done) => {
        let widget = new LogWidget();
        let layout = new LogLayout(factory);
        widget.layout = layout;
        layout.addChild(new Widget());
        layout.addChild(new Widget());
        widget.attach(document.body);
        layout.childAt(0).hide();
        expect(layout.methods.indexOf('onChildHidden')).to.not.be(-1);
        requestAnimationFrame(() => {
          expect(widget.messages.indexOf('fit-request')).to.not.be(-1);
          widget.dispose();
          done();
        });
      });

    });

    describe('#onResize()', () => {

      it('should lay out the children', () => {
        let widget = new LogWidget();
        let children = [new Widget(), new Widget()];
        widget.node.style.width = '50px';
        widget.node.style.height = '50px';
        let layout = new LogLayout(factory);
        widget.layout = layout;
        widget.attach(document.body);
        layout.addChild(children[0]);
        layout.addChild(children[1]);
        expect(children[0].node.style.width).to.be('');
        expect(children[1].node.style.width).to.be('');
        sendMessage(widget, ResizeMessage.UnknownSize);
        expect(layout.methods.indexOf('onResize')).to.not.be(-1);
        expect(layout.childAt(0).node.style.width).to.be('25px');
        expect(layout.childAt(1).node.style.width).to.be('25px');
        widget.dispose();
      });

    });

    describe('#onUpdateRequest()', () => {

      it('should lay out the children', () => {
        let widget = new LogWidget();
        let children = [new Widget(), new Widget()];
        widget.node.style.width = '50px';
        widget.node.style.height = '50px';
        let layout = new LogLayout(factory);
        widget.layout = layout;
        widget.attach(document.body);
        layout.addChild(children[0]);
        layout.addChild(children[1]);
        expect(children[0].node.style.width).to.be('');
        expect(children[1].node.style.width).to.be('');
        sendMessage(widget, Widget.MsgUpdateRequest);
        expect(layout.methods.indexOf('onUpdateRequest')).to.not.be(-1);
        expect(layout.childAt(0).node.style.width).to.be('25px');
        expect(layout.childAt(1).node.style.width).to.be('25px');
        widget.dispose();
      });

    });

    describe('#onFitRequest()', () => {

      it('should fit to the size required by the children', (done) => {
        let widget = new LogWidget();
        let children = [new Widget(), new Widget()];
        let layout = new LogLayout(factory);
        widget.layout = layout;
        widget.attach(document.body);
        layout.addChild(children[0]);
        layout.addChild(children[1]);
        children[0].node.style.minWidth = '100px';
        children[1].node.style.minWidth = '100px';
        expect(widget.node.style.minHeight).to.be('');
        widget.fit();
        requestAnimationFrame(() => {
          expect(layout.methods.indexOf('onFitRequest')).to.not.be(-1);
          expect(widget.node.style.minWidth).to.be('203px');
          widget.dispose();
          done();
        });
      });

      it('should handle `Vertical`', (done) => {
        let widget = new LogWidget();
        let children = [new Widget(), new Widget()];
        let layout = new LogLayout(factory);
        layout.orientation = LogLayout.Vertical;
        widget.layout = layout;
        widget.attach(document.body);
        layout.addChild(children[0]);
        layout.addChild(children[1]);
        children[0].node.style.minHeight = '100px';
        children[1].node.style.minHeight = '100px';
        expect(widget.node.style.minHeight).to.be('');
        widget.fit();
        requestAnimationFrame(() => {
          expect(layout.methods.indexOf('onFitRequest')).to.not.be(-1);
          expect(widget.node.style.minHeight).to.be('203px');
          widget.dispose();
          done();
        });
      });

    });

  });

});
