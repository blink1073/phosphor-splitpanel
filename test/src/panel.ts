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


class LogPanel extends SplitPanel {

  messages: string[] = [];

  methods: string[] = [];

  events: string[] = [];

  processMessage(msg: Message): void {
    super.processMessage(msg);
    this.messages.push(msg.type);
  }

  handleEvent(event: Event): void {
    super.handleEvent(event);
    this.events.push(event.type);
  }

  protected onAfterAttach(msg: Message): void {
     super.onAfterAttach(msg);
     this.methods.push('onAfterAttach');
  }

  protected onBeforeDetach(msg: Message): void {
    super.onBeforeDetach(msg);
    this.methods.push('onBeforeDetach');
  }

  protected onChildAdded(msg: ChildMessage): void {
    super.onChildAdded(msg);
    this.methods.push('onChildAdded');
  }

  protected onChildRemoved(msg: ChildMessage): void {
    super.onChildRemoved(msg);
    this.methods.push('onChildRemoved');
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


describe('phosphor-splitpanel', () => {

  describe('SplitHandle', () => {

    describe('SplitHandle', () => {

      describe('#hidden', () => {

        it('should get whether the split handle is hidden', () => {
          let handle = new SplitHandle();
          expect(handle.hidden).to.be(false);
        });

        it('should set whether the split handle is hidden', () => {
          let handle = new SplitHandle();
          handle.hidden = true;
          expect(handle.hidden).to.be(true);
        });

      });

    });

  });

  describe('SplitPanel', () => {

    describe('.createLayout()', () => {

      it('should create a split layout for the split panel', () => {
        let layout = SplitPanel.createLayout();
        expect(layout instanceof SplitLayout).to.be(true);
      });

    });

    describe('.createHandle()', () => {

      it('should create a split handle for use in the split panel', () => {
        let handle = SplitPanel.createHandle();
        expect(handle instanceof SplitHandle).to.be(true);
      });

    });

    describe('.Horizontal', () => {

      it('should be an alias of the `Horizontal` Orientation', () => {
          expect(SplitPanel.Horizontal).to.be(Orientation.Horizontal);
      });

    });

    describe('.Vertical', () => {

      it('should be an alias of the `Vertical` Orientation', () => {
          expect(SplitPanel.Vertical).to.be(Orientation.Vertical);
      });

    });

    describe('.getStretch', () => {

      it('should return the panel stretch factor for the given widget', () => {
        let widget = new Widget();
        expect(SplitPanel.getStretch(widget)).to.be(0);
      });

    });

    describe('.setStretch', () => {

      it('should set the split panel stretch factor for the given widget.', () => {
        let widget = new Widget();
        SplitPanel.setStretch(widget, 1);
        expect(SplitPanel.getStretch(widget)).to.be(1);
      });

    });

    describe('#constructor()', () => {

      it('should accept no arguments', () => {
        let panel = new SplitPanel();
        expect(panel instanceof SplitPanel).to.be(true);
      });

      it('should add the `p-SplitPanel` class', () => {
        let panel = new SplitPanel();
        expect(panel.hasClass('p-SplitPanel')).to.be(true);
      });

    });

    describe('#dispose()', () => {

      it('should dispose of the resources held by the panel', () => {
        let panel = new SplitPanel();
        panel.addChild(new Widget());
        panel.addChild(new Widget());
        panel.dispose();
        expect(panel.isDisposed).to.be(true);
        expect(panel.sizes.length).to.be(0);
      });

    });

    describe('#orientation', () => {

      it('should get the orientation of the split panel', () => {
        let panel = new SplitPanel();
        expect(panel.orientation).to.be(Orientation.Horizontal);
      });

      it('should set the orientation of the split panel', () => {
        let panel = new SplitPanel();
        panel.orientation = Orientation.Vertical
        expect(panel.orientation).to.be(Orientation.Vertical);
      });

    });

    describe('#spacing', () => {

      it('should get the inter-element spacing', () => {
        let panel = new SplitPanel();
        expect(panel.spacing).to.be(3);
      });

      it('should set the inter-element spacing', () => {
        let panel = new SplitPanel();
        panel.spacing = 5;
        expect(panel.spacing).to.be(5);
      });

    });

    describe('#sizes()', () => {

      it('should get the normalized sizes of the widgets in the panel', () => {
        let panel = new SplitPanel();
        let widget0 = new Widget();
        let widget1 = new Widget();
        panel.addChild(widget0);
        panel.addChild(widget1);
        expect(panel.sizes()).to.eql([0.5, 0.5]);
        panel.setSizes([2, 3]);
        expect(panel.sizes()).to.eql([0.4, 0.6]);
      });

    });

    describe('#setSizes()', () => {

      it('should set the relative sizes for the child widgets in the panel', () => {
        let panel = new LogPanel();
        let widget0 = new Widget();
        let widget1 = new Widget();
        panel.addChild(widget0);
        panel.addChild(widget1);
        panel.attach(document.body);
        panel.setSizes([1, 4]);
        expect(panel.sizes()).to.eql([0.2, 0.8]);
        panel.dispose();
      });

    });

    describe('#handleAt()', () => {

      it('should get the split handle for the widget at the given index', () => {
        let panel = new SplitPanel();
        let widget0 = new Widget();
        let widget1 = new Widget();
        panel.addChild(widget0);
        panel.addChild(widget1);
        expect(panel.handleAt(0) instanceof SplitHandle).to.be(true);
      });

      it('should return `undefined` if the index is invalid', () => {
        let panel = new SplitPanel();
        expect(panel.handleAt(0)).to.be(void 0);
      });

    });

    describe('#onAfterAttach()', () => {

      it('should add a mousedown listener', () => {
        let panel = new LogPanel();
        panel.attach(document.body);
        triggerMouseEvent(panel.node, 'mousedown');
        expect(panel.events.indexOf('mousedown')).to.not.be(-1);
        expect(panel.methods.indexOf('onAfterAttach')).to.not.be(-1);
        panel.dispose();
      });

    });

    describe('#onBeforeDetach()', () => {

      it('should remove the mousedown listener', () => {
        let panel = new LogPanel();
        panel.attach(document.body);
        panel.detach();
        triggerMouseEvent(panel.node, 'mousedown');
        expect(panel.events.indexOf('mousedown')).to.be(-1);
        expect(panel.methods.indexOf('onBeforeDetach')).to.not.be(-1);
      });

    });

    describe('#onChildAdded()', () => {

      it("should add `'p-SplitPanel-child'` to the child classList", () => {
        let panel = new LogPanel();
        let widget = new Widget();
        panel.addChild(widget);
        expect(widget.hasClass('p-SplitPanel-child')).to.be(true);
        expect(panel.methods.indexOf('onChildAdded')).to.not.be(-1);
      });

    });

    describe('#onChildRemoved()', () => {

      it("should remove `'p-SplitPanel-child'` from the child classList", () => {
        let panel = new LogPanel();
        let widget = new Widget();
        panel.addChild(widget);
        widget.parent = null;
        expect(widget.hasClass('p-SplitPanel-child')).to.be(false);
        expect(panel.methods.indexOf('onChildRemoved')).to.not.be(-1);
      });

    });

    context('mouse handling', () => {

      it('should adjust children on a handle grab and move', (done) => {
        let panel = new LogPanel();
        let widget0 = new Widget();
        let widget1 = new Widget();
        panel.addChild(widget0);
        panel.addChild(widget1);
        panel.attach(document.body);
        requestAnimationFrame(() => {
          let handle = panel.node.children[1] as HTMLElement;
          let left = handle.offsetLeft;
          triggerMouseEvent(handle, 'mousedown');
          triggerMouseEvent(handle, 'mousemove', { clientX: 20 });
          triggerMouseEvent(handle, 'mouseup');
          triggerMouseEvent(handle, 'mousedown');
          triggerMouseEvent(handle, 'mousemove', { clientX: -40 });
          triggerMouseEvent(handle, 'mouseup');
          expect(panel.events.indexOf('mousedown')).to.not.be(-1);
          expect(panel.events.indexOf('mousemove')).to.not.be(-1);
          expect(panel.events.indexOf('mouseup')).to.not.be(-1);
          requestAnimationFrame(() => {
            expect(handle.offsetLeft).to.be.lessThan(left - 10);
            panel.dispose();
            done();
          });
        });
      });

      it('should ignore anything except the left mouse button', (done) => {
        let panel = new LogPanel();
        let widget0 = new Widget();
        let widget1 = new Widget();
        panel.addChild(widget0);
        panel.addChild(widget1);
        panel.attach(document.body);
        requestAnimationFrame(() => {
          let handle = panel.node.children[1] as HTMLElement;
          triggerMouseEvent(handle, 'mousedown', { button: 1} );
          triggerMouseEvent(handle, 'mousemove');
          expect(panel.events.indexOf('mousedown')).to.not.be(-1);
          expect(panel.events.indexOf('mousemove')).to.be(-1);
          panel.dispose();
          done();
        });
      });

      it('should handle vertical orientation', (done) => {
        let panel = new LogPanel();
        let widget0 = new Widget();
        let widget1 = new Widget();
        panel.addChild(widget0);
        panel.addChild(widget1);
        panel.orientation = Orientation.Vertical;
        panel.attach(document.body);
        requestAnimationFrame(() => {
          let handle = panel.node.children[1] as HTMLElement;
          triggerMouseEvent(handle, 'mousedown');
          triggerMouseEvent(handle, 'mousemove', { clientY: 10 });
          triggerMouseEvent(handle, 'mouseup');
          expect(panel.events.indexOf('mousedown')).to.not.be(-1);
          expect(panel.events.indexOf('mousemove')).to.not.be(-1);
          expect(panel.events.indexOf('mouseup')).to.not.be(-1);
          panel.dispose();
          done();
        });
      });

      it('should be a no-op if a split handle is not pressed', (done) => {
        let panel = new LogPanel();
        let widget0 = new Widget();
        let widget1 = new Widget();
        panel.addChild(widget0);
        panel.addChild(widget1);
        panel.orientation = Orientation.Vertical;
        panel.attach(document.body);
        requestAnimationFrame(() => {
          triggerMouseEvent(panel.node, 'mousedown');
          triggerMouseEvent(panel.node, 'mousemove');
          expect(panel.events.indexOf('mousedown')).to.not.be(-1);
          expect(panel.events.indexOf('mousemove')).to.be(-1);
          panel.dispose();
          done();
        });
      });

      it('should ignore a non-left click on mousemove', (done) => {
        let panel = new LogPanel();
        let widget0 = new Widget();
        let widget1 = new Widget();
        panel.addChild(widget0);
        panel.addChild(widget1);
        panel.orientation = Orientation.Vertical;
        panel.attach(document.body);
        requestAnimationFrame(() => {
          let handle = panel.node.children[1] as HTMLElement;
          let left = handle.offsetLeft;
          triggerMouseEvent(handle, 'mousedown');
          triggerMouseEvent(handle, 'mousemove', { button: 1, clientY: 10 });
          triggerMouseEvent(document.body, 'contextmenu');
          triggerMouseEvent(handle, 'mouseup');
          expect(panel.events.indexOf('mousedown')).to.not.be(-1);
          expect(panel.events.indexOf('mousemove')).to.not.be(-1);
          expect(panel.events.indexOf('contextmenu')).to.not.be(-1);
          expect(panel.events.indexOf('mouseup')).to.not.be(-1);
          expect(handle.offsetLeft).to.be(left);
          panel.dispose();
          done();
        });
      });

      it('should ignore a non-left click on mouseup', (done) => {
        let panel = new LogPanel();
        let widget0 = new Widget();
        let widget1 = new Widget();
        panel.addChild(widget0);
        panel.addChild(widget1);
        panel.orientation = Orientation.Vertical;
        panel.attach(document.body);
        requestAnimationFrame(() => {
          let handle = panel.node.children[1] as HTMLElement;
          let left = handle.offsetLeft;
          triggerMouseEvent(handle, 'mousedown');
          triggerMouseEvent(handle, 'mousemove', { clientY: 10 });
          triggerMouseEvent(handle, 'mouseup', { button: 1 });
          expect(panel.events.indexOf('mousedown')).to.not.be(-1);
          expect(panel.events.indexOf('mousemove')).to.not.be(-1);
          expect(panel.events.indexOf('mouseup')).to.not.be(-1);
          expect(handle.offsetLeft).to.be(left);
          panel.dispose();
          done();
        });
      });

      it('should ignore keyboard input on resize', (done) => {
        let panel = new LogPanel();
        let widget0 = new Widget();
        let widget1 = new Widget();
        panel.addChild(widget0);
        panel.addChild(widget1);
        panel.orientation = Orientation.Vertical;
        panel.attach(document.body);
        requestAnimationFrame(() => {
          let handle = panel.node.children[1] as HTMLElement;
          let left = handle.offsetLeft;
          triggerMouseEvent(handle, 'mousedown');
          triggerMouseEvent(handle, 'mousemove', { button: 1, clientY: 10 });
          triggerKeyEvent(document.body, 'keydown', { keyCode: 65 });
          triggerKeyEvent(document.body, 'keyup', { keyCode: 65 });
          triggerKeyEvent(document.body, 'keypress', { keyCode: 65 });
          triggerMouseEvent(handle, 'mouseup');
          expect(panel.events.indexOf('mousedown')).to.not.be(-1);
          expect(panel.events.indexOf('mousemove')).to.not.be(-1);
          expect(panel.events.indexOf('keydown')).to.not.be(-1);
          expect(panel.events.indexOf('keyup')).to.not.be(-1);
          expect(panel.events.indexOf('keypress')).to.not.be(-1);
          expect(panel.events.indexOf('mouseup')).to.not.be(-1);
          expect(handle.offsetLeft).to.be(left);
          panel.dispose();
          done();
        });
      });

      it('should release mouse if ESC key is pressed during resize', (done) => {
        let panel = new LogPanel();
        let widget0 = new Widget();
        let widget1 = new Widget();
        panel.addChild(widget0);
        panel.addChild(widget1);
        panel.orientation = Orientation.Vertical;
        panel.attach(document.body);
        requestAnimationFrame(() => {
          let handle = panel.node.children[1] as HTMLElement;
          let left = handle.offsetLeft;
          triggerMouseEvent(handle, 'mousedown');
          triggerMouseEvent(handle, 'mousemove', { button: 1, clientY: 10 });
          triggerKeyEvent(document.body, 'keydown', { keyCode: 27 });
          triggerMouseEvent(handle, 'mouseup');
          expect(panel.events.indexOf('mousedown')).to.not.be(-1);
          expect(panel.events.indexOf('mousemove')).to.not.be(-1);
          expect(panel.events.indexOf('keydown')).to.not.be(-1);
          expect(panel.events.indexOf('mouseup')).to.be(-1);
          expect(handle.offsetLeft).to.be(left);
          panel.dispose();
          done();
        });
      });

      it('should be a no-op if the mouse does not move', (done) => {
        let panel = new LogPanel();
        let widget0 = new Widget();
        let widget1 = new Widget();
        panel.addChild(widget0);
        panel.addChild(widget1);
        panel.orientation = Orientation.Vertical;
        panel.attach(document.body);
        requestAnimationFrame(() => {
          let handle = panel.node.children[1] as HTMLElement;
          let left = handle.offsetLeft;
          triggerMouseEvent(handle, 'mousedown');
          triggerMouseEvent(handle, 'mousemove');
          triggerMouseEvent(handle, 'mouseup');
          expect(panel.events.indexOf('mousedown')).to.not.be(-1);
          expect(panel.events.indexOf('mousemove')).to.not.be(-1);
          expect(panel.events.indexOf('mouseup')).to.not.be(-1);
          expect(handle.offsetLeft).to.be(left);
          panel.dispose();
          done();
        });
      });

    });

    context('resize behavior', () => {

      it('should handle `Horizontal`', (done) => {
        let panel = new SplitPanel();
        let child0 = new Widget();
        let child1 = new Widget();
        let child2 = new Widget();
        child2.hide();
        panel.spacing = 8;
        panel.orientation = Orientation.Horizontal;
        child0.node.style.minWidth = '30px';
        child1.node.style.minHeight = '50px';
        panel.addChild(child0);
        panel.addChild(child1);
        panel.addChild(child2);
        panel.attach(document.body);
        panel.node.style.position = 'absolute';
        panel.node.style.top = '0px';
        panel.node.style.left = '0px';
        panel.node.style.width = '0px';
        panel.node.style.height = '0px';
        panel.fit();
        requestAnimationFrame(() => {
          panel.node.style.width = '50px';
          panel.node.style.height = '100px';
          sendMessage(panel, new ResizeMessage(50, 100));
          expect(child0.node.offsetTop).to.be(0);
          expect(child0.node.offsetLeft).to.be(0);
          expect(child0.node.offsetWidth).to.be(36);
          expect(child0.node.offsetHeight).to.be(100);
          expect(child1.node.offsetTop).to.be(0);
          expect(child1.node.offsetLeft).to.be(44);
          expect(child1.node.offsetWidth).to.be(6);
          expect(child1.node.offsetHeight).to.be(100);
          expect(panel.node.style.minWidth).to.be('38px');
          expect(panel.node.style.minHeight).to.be('50px');
          panel.dispose();
          done();
        });
      });

      it('should handle `Vertical`', (done) => {
        let panel = new SplitPanel();
        let child0 = new Widget();
        let child1 = new Widget();
        let child2 = new Widget();
        child2.hide();
        panel.spacing = 8;
        panel.orientation = Orientation.Vertical;
        child0.node.style.minWidth = '30px';
        child1.node.style.minHeight = '50px';
        panel.addChild(child0);
        panel.addChild(child1);
        panel.addChild(child2);
        panel.attach(document.body);
        panel.node.style.position = 'absolute';
        panel.node.style.top = '0px';
        panel.node.style.left = '0px';
        panel.node.style.width = '0px';
        panel.node.style.height = '0px';
        panel.fit();
        requestAnimationFrame(() => {
          panel.node.style.width = '100px';
          panel.node.style.height = '70px';
          sendMessage(panel, new ResizeMessage(100, 70));
          expect(child0.node.offsetTop).to.be(0);
          expect(child0.node.offsetLeft).to.be(0);
          expect(child0.node.offsetWidth).to.be(100);
          expect(child0.node.offsetHeight).to.be(6);
          expect(child1.node.offsetTop).to.be(14);
          expect(child1.node.offsetLeft).to.be(0);
          expect(child1.node.offsetWidth).to.be(100);
          expect(child1.node.offsetHeight).to.be(56);
          expect(panel.node.style.minWidth).to.be('30px');
          expect(panel.node.style.minHeight).to.be('58px');
          panel.dispose();
          done();
        });

      });

    });

  });

});
