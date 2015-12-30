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

      it('should set the relative sizes for the child widgets in the layout', () => {
        let layout = new LogLayout(factory);
        let children = [new Widget(), new Widget()];
        let parent = new Widget();
        layout.addChild(children[0]);
        layout.addChild(children[1]);
        parent.layout = layout;
        parent.attach(document.body);
        layout.setSizes([1, 4]);
        expect(layout.sizes()).to.eql([0.2, 0.8]);
        parent.dispose();
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

  });

  // describe('SplitPanel', () => {



  //   describe('.orientationProperty', () => {

  //     it('should be a property descriptor', () => {
  //       expect(SplitPanel.orientationProperty instanceof Property).to.be(true);
  //     });

  //     it('should have the name `orientation`', () => {
  //       expect(SplitPanel.orientationProperty.name).to.be('orientation');
  //     });

  //     it('should default to `Horizontal`', () => {
  //       let panel = new SplitPanel();
  //       let orientation = SplitPanel.orientationProperty.get(panel);
  //       expect(orientation).to.be(Orientation.Horizontal);
  //     });

  //     it('should toggle the orientation classes', () => {
  //       let panel = new SplitPanel();
  //       expect(panel.hasClass('p-mod-horizontal')).to.be(true);
  //       expect(panel.hasClass('p-mod-vertical')).to.be(false);
  //       SplitPanel.orientationProperty.set(panel, Orientation.Vertical);
  //       expect(panel.hasClass('p-mod-horizontal')).to.be(false);
  //       expect(panel.hasClass('p-mod-vertical')).to.be(true);
  //     });

  //     it('should post a `layout-request`', (done) => {
  //       let panel = new LogPanel();
  //       SplitPanel.orientationProperty.set(panel, Orientation.Vertical);
  //       expect(panel.messages.indexOf('layout-request')).to.be(-1);
  //       requestAnimationFrame(() => {
  //         expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
  //         done();
  //       });
  //     });

  //   });

  //   describe('.spacingProperty', () => {

  //     it('should be a property descriptor', () => {
  //       expect(SplitPanel.spacingProperty instanceof Property).to.be(true);
  //     });

  //     it('should have the name `spacing`', () => {
  //       expect(SplitPanel.spacingProperty.name).to.be('spacing');
  //     });

  //     it('should default to `3`', () => {
  //       let panel = new SplitPanel();
  //       expect(SplitPanel.spacingProperty.get(panel)).to.be(3);
  //     });

  //     it('should post a `layout-request`', (done) => {
  //       let panel = new LogPanel();
  //       SplitPanel.spacingProperty.set(panel, 4);
  //       expect(panel.messages.indexOf('layout-request')).to.be(-1);
  //       requestAnimationFrame(() => {
  //         expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
  //         done();
  //       });
  //     });

  //   });

  //   describe('.stretchProperty', () => {

  //     it('should be a property descriptor', () => {
  //       expect(SplitPanel.stretchProperty instanceof Property).to.be(true);
  //     });

  //     it('should have the name `stretch`', () => {
  //       expect(SplitPanel.stretchProperty.name).to.be('stretch');
  //     });

  //     it('should default to `0`', () => {
  //       let widget = new Widget();
  //       expect(SplitPanel.stretchProperty.get(widget)).to.be(0);
  //     });

  //     it('should post a `layout-request`', (done) => {
  //       let panel = new LogPanel();
  //       let widget = new Widget();
  //       panel.addChild(widget);
  //       clearMessageData(panel);
  //       SplitPanel.stretchProperty.set(widget, 4);
  //       expect(panel.messages.indexOf('layout-request')).to.be(-1);
  //       requestAnimationFrame(() => {
  //         expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
  //         done();
  //       });
  //     });

  //   });












  //   describe('#onChildAdded()', () => {

  //     it('should be invoked when a child is added', () => {
  //       let panel = new LogPanel();
  //       let widget = new LogWidget();
  //       panel.attach(document.body);
  //       panel.addChild(widget);
  //       expect(panel.messages.indexOf('child-added')).to.not.be(-1);
  //       panel.dispose();
  //     });

  //     it('should send `after-attach` to the child', () => {
  //       let panel = new LogPanel();
  //       let widget = new LogWidget();
  //       panel.attach(document.body);
  //       panel.addChild(widget);
  //       expect(widget.messages.indexOf('after-attach')).to.not.be(-1);
  //       panel.dispose();
  //     });

  //     it('should post a `layout-request`', (done) => {
  //       let panel = new LogPanel();
  //       let widget = new LogWidget();
  //       panel.attach(document.body);
  //       expect(panel.messages.indexOf('layout-request')).to.be(-1);
  //       panel.addChild(widget);
  //       requestAnimationFrame(() => {
  //         expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
  //         panel.dispose();
  //         done();
  //       });
  //     });

  //   });

  //   describe('#onChildRemoved()', () => {

  //     it('should be invoked when a child is removed', () => {
  //       let panel = new LogPanel();
  //       let widget = new Widget();
  //       panel.attach(document.body);
  //       panel.addChild(widget);
  //       expect(panel.messages.indexOf('child-removed')).to.be(-1);
  //       widget.remove();
  //       expect(panel.messages.indexOf('child-removed')).to.not.be(-1);
  //       panel.dispose();
  //     });

  //     it('should send `before-detach` to the child', () => {
  //       let panel = new LogPanel();
  //       let widget = new LogWidget();
  //       panel.attach(document.body);
  //       panel.addChild(widget);
  //       expect(widget.messages.indexOf('before-detach')).to.be(-1);
  //       widget.remove();
  //       expect(widget.messages.indexOf('before-detach')).to.not.be(-1);
  //       panel.dispose();
  //     });

  //     it('should be post a `layout-request`', (done) => {
  //       let panel = new LogPanel();
  //       let widget = new Widget();
  //       panel.attach(document.body);
  //       panel.addChild(widget);
  //       clearMessageData(panel);
  //       panel.messages = [];
  //       widget.remove();
  //       requestAnimationFrame(() => {
  //         expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
  //         panel.dispose();
  //         done();
  //       });
  //     });

  //   });

  //   describe('#onChildMoved()', () => {

  //     it('should be invoked when a child is moved', () => {
  //       let panel = new LogPanel();
  //       let widget0 = new Widget();
  //       let widget1 = new Widget();
  //       panel.addChild(widget0);
  //       panel.addChild(widget1);
  //       panel.attach(document.body);
  //       panel.messages = [];
  //       panel.addChild(widget0);
  //       expect(panel.messages.indexOf('child-moved')).to.not.be(-1);
  //       panel.dispose();
  //     });

  //     it('should reorder the sizes appropriately', () => {
  //       let panel = new LogPanel();
  //       let widget0 = new Widget();
  //       let widget1 = new Widget();
  //       panel.addChild(widget0);
  //       panel.addChild(widget1);
  //       panel.setSizes([0.3, 0.7]);
  //       panel.attach(document.body);
  //       panel.messages = [];
  //       panel.addChild(widget0);
  //       expect(panel.sizes()).to.eql([0.7, 0.3]);
  //       panel.dispose();
  //     });

  //     it('should post a `layout-request`', (done) => {
  //       let panel = new LogPanel();
  //       let widget0 = new Widget();
  //       let widget1 = new Widget();
  //       panel.addChild(widget0);
  //       panel.addChild(widget1);
  //       panel.attach(document.body);
  //       clearMessageData(panel);
  //       panel.messages = [];
  //       panel.addChild(widget0);
  //       requestAnimationFrame(() => {
  //         expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
  //         panel.dispose();
  //         done();
  //       });
  //     });

  //   });

  //   describe('#onAfterShow()', () => {

  //     it('should send an `update-request`', () => {
  //       let panel = new LogPanel();
  //       panel.attach(document.body);
  //       panel.hidden = true;
  //       panel.messages = [];
  //       panel.hidden = false;
  //       expect(panel.messages.indexOf('update-request')).to.not.be(-1);
  //       panel.dispose();
  //     });

  //   });



  //   describe('#onChildShown()', () => {

  //     it('should post a `layout-request`', (done) => {
  //       let panel = new LogPanel();
  //       let widget = new Widget();
  //       widget.hidden = true;
  //       panel.addChild(widget);
  //       panel.attach(document.body);
  //       clearMessageData(panel);
  //       panel.messages = [];
  //       widget.hidden = false;
  //       requestAnimationFrame(() => {
  //         expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
  //         panel.dispose();
  //         done();
  //       });
  //     });

  //   });

  //   describe('#onChildHidden()', () => {

  //     it('should post a `layout-request`', (done) => {
  //       let panel = new LogPanel();
  //       let widget = new Widget();
  //       panel.addChild(widget);
  //       panel.attach(document.body);
  //       clearMessageData(panel);
  //       panel.messages = [];
  //       widget.hidden = true;
  //       requestAnimationFrame(() => {
  //         expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
  //         panel.dispose();
  //         done();
  //       });
  //     });

  //   });

  //   describe('#onResize()', () => {

  //     it('should be invoked on `resize` message', () => {
  //       let panel = new LogPanel();
  //       let message = new ResizeMessage(100, 100);
  //       panel.attach(document.body);
  //       sendMessage(panel, message);
  //       expect(panel.messages.indexOf('resize')).to.not.be(-1);
  //       panel.dispose();
  //     });

  //     it('should handle an unknown size', () => {
  //       let panel = new LogPanel();
  //       panel.attach(document.body);
  //       sendMessage(panel, ResizeMessage.UnknownSize);
  //       expect(panel.messages.indexOf('resize')).to.not.be(-1);
  //       panel.dispose();
  //     });

  //     it('should resize the children', () => {
  //       let panel = new SplitPanel();
  //       let child0 = new Widget();
  //       let child1 = new Widget();
  //       panel.orientation = Orientation.Vertical;
  //       panel.addChild(child0);
  //       panel.addChild(child1);
  //       panel.attach(document.body);
  //       panel.node.style.position = 'absolute';
  //       panel.node.style.top = '0px';
  //       panel.node.style.left = '0px';
  //       panel.node.style.width = '0px';
  //       panel.node.style.height = '0px';
  //       sendMessage(panel, Widget.MsgLayoutRequest);
  //       panel.node.style.width = '101px';
  //       panel.node.style.height = '101px';
  //       sendMessage(panel, new ResizeMessage(101, 101));
  //       expect(child0.node.offsetTop).to.be(0);
  //       expect(child0.node.offsetLeft).to.be(0);
  //       expect(child0.node.offsetWidth).to.be(101);
  //       expect(child0.node.offsetHeight).to.be(49);
  //       expect(child1.node.offsetTop).to.be(52);
  //       expect(child1.node.offsetLeft).to.be(0);
  //       expect(child1.node.offsetWidth).to.be(101);
  //       expect(child1.node.offsetHeight).to.be(49);
  //       panel.dispose();
  //     });

  //   });

  //   describe('#onUpdate()', () => {

  //     it('should be invoked on an `update-request` message', () => {
  //       let panel = new LogPanel();
  //       sendMessage(panel, Widget.MsgUpdateRequest);
  //       expect(panel.messages.indexOf('update-request')).to.not.be(-1);
  //     });

  //     it('should resize the children', () => {
  //       let panel = new SplitPanel();
  //       let child0 = new Widget();
  //       let child1 = new Widget();
  //       panel.orientation = Orientation.Vertical;
  //       panel.addChild(child0);
  //       panel.addChild(child1);
  //       panel.attach(document.body);
  //       panel.node.style.position = 'absolute';
  //       panel.node.style.top = '0px';
  //       panel.node.style.left = '0px';
  //       panel.node.style.width = '0px';
  //       panel.node.style.height = '0px';
  //       sendMessage(panel, Widget.MsgLayoutRequest);
  //       panel.node.style.width = '201px';
  //       panel.node.style.height = '201px';
  //       sendMessage(panel, Widget.MsgUpdateRequest);
  //       expect(child0.node.offsetTop).to.be(0);
  //       expect(child0.node.offsetLeft).to.be(0);
  //       expect(child0.node.offsetWidth).to.be(201);
  //       expect(child0.node.offsetHeight).to.be(99);
  //       expect(child1.node.offsetTop).to.be(102);
  //       expect(child1.node.offsetLeft).to.be(0);
  //       expect(child1.node.offsetWidth).to.be(201);
  //       expect(child1.node.offsetHeight).to.be(99);
  //       panel.dispose();
  //     });

  //   });

  //   describe('#onLayoutRequest()', () => {

  //     it('should be invoked on a `layout-request` message', () => {
  //       let panel = new LogPanel();
  //       sendMessage(panel, Widget.MsgLayoutRequest);
  //       expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
  //     });

  //     it('should send a `layout-request` to its parent', () => {
  //       let panel1 = new LogPanel();
  //       let panel2 = new LogPanel();
  //       panel1.addChild(panel2);
  //       panel1.attach(document.body);
  //       clearMessageData(panel1);
  //       clearMessageData(panel2);
  //       expect(panel1.messages.indexOf('layout-request')).to.be(-1);
  //       sendMessage(panel2, Widget.MsgLayoutRequest);
  //       expect(panel1.messages.indexOf('layout-request')).to.not.be(-1);
  //       panel1.dispose();
  //     });

  //     it('should setup the geometry of the panel', () => {
  //       let panel = new SplitPanel();
  //       let child = new Widget();
  //       child.node.style.minWidth = '50px';
  //       child.node.style.minHeight = '50px';
  //       panel.addChild(child);
  //       panel.attach(document.body);
  //       expect(panel.node.style.minWidth).to.be('');
  //       expect(panel.node.style.minHeight).to.be('');
  //       sendMessage(panel, Widget.MsgLayoutRequest);
  //       expect(panel.node.style.minWidth).to.be('50px');
  //       expect(panel.node.style.minHeight).to.be('50px');
  //       panel.dispose();
  //     });

  //   });



});
