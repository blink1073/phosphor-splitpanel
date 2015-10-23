/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use-strict';

import {
SplitPanel
} from '../lib/index';

import {
IDisposable
} from 'phosphor-disposable';

import {
overrideCursor
} from 'phosphor-domutil';

import {
Message
} from 'phosphor-messaging';

import {
Widget, attachWidget, detachWidget
} from 'phosphor-widget';

import './dragdrop.css';

interface IPressData {
  drag: boolean;
  dummy?: Widget;
  override?: IDisposable;
  rect?: ClientRect;
  startX: number;
  startY: number;
}

class DraggableWidget extends Widget {

  constructor(private _threshold?: number) {
    super();
  }

  handleEvent(event: Event): void {
    switch (event.type) {
      case 'mousedown':
        this._evtMouseDown(<MouseEvent>event);
        break;
      case 'mousemove':
        this._evtMouseMove(<MouseEvent>event);
        break;
      case 'mouseup':
        this._evtMouseUp(<MouseEvent>event);
        break;
    }
  }

  protected onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    this.node.addEventListener('mousedown', this);
  }

  protected onBeforeDetach(msg: Message): void {
    super.onBeforeDetach(msg);
    this.node.removeEventListener('mousedown', this);
  }

  private _evtMouseDown(event: MouseEvent): void {
    console.log('called 1');
    // Ignore right-clicks.
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    var drag = false;
    var startX = event.clientX;
    var startY = event.clientY;
    this._pressData = { drag, startX, startY };
    document.addEventListener('mouseup', this, true);
    document.addEventListener('mousemove', this, true);
  }

  private _evtMouseMove(event: MouseEvent): void {
    if (!this._pressData.drag) {
      var { startX, startY } = this._pressData;
      var dX = Math.abs(startX - event.clientX);
      var dY = Math.abs(startY - event.clientY);
      var drag = Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2)) > this._threshold;
      if (!drag) {
        return;
      }
      this._pressData.drag = true;
      this._pressData.dummy = new Widget();
      this._pressData.dummy.addClass('drag');
      this._pressData.override = overrideCursor('move');
      this._pressData.rect = this.node.getBoundingClientRect();
      attachWidget(this._pressData.dummy, document.body);
    }
    var { rect, startX, startY } = this._pressData;
    var { left, top, width, height } = this._pressData.rect;
    var dX = event.clientX - startX;
    var dY = event.clientY - startY;
    this._pressData.dummy.setOffsetGeometry(left + dX, top + dY, width, height);
  }

  private _evtMouseUp(event: MouseEvent): void {
    detachWidget(this._pressData.dummy);
    this._pressData.dummy.dispose();
    this._pressData.override.dispose();
    this._pressData = null;
    document.removeEventListener('mouseup', this, true);
    document.removeEventListener('mousemove', this, true);
  }

  private _pressData: IPressData = null;
}

class DroppableWidget extends Widget {
  processMessage(msg: Message): void {
    switch (msg.type) {
      case 'drag-drop':
        this.onDragDrop();
        break;
      case 'drag-move':
        this.onDragMove();
        break;
      default:
        super.processMessage(msg);
    }
  }
  onDragDrop(): void {
    console.log('onDragDrop');
  }
  onDragMove(): void {
    console.log('onDragMove');
  }
}

function createDraggable(title: string): DraggableWidget {
  var widget = new DraggableWidget(20);
  widget.addClass('list-item');
  widget.addClass('yellow');
  return widget;
}

function createDroppable(): DroppableWidget {
  var widget = new DroppableWidget();
  widget.addClass('content');
  widget.addClass('green');
  return widget;
}

function createList(): Widget {
  var widget = new Widget();
  widget.addClass('content');
  widget.addClass('blue');
  return widget;
}

function populateList(list: Widget): void {
  var t1 = createDraggable('table one');
  var t2 = createDraggable('table two');
  list.addChild(t1);
  list.addChild(t2);
}


function main(): void {
  var list = createList();
  var droppable = createDroppable();
  var panel = new SplitPanel();
  panel.orientation = SplitPanel.Horizontal;
  panel.children = [list, droppable];
  SplitPanel.setStretch(list, 1);
  SplitPanel.setStretch(droppable, 5);
  populateList(list);
  panel.id = 'main';
  attachWidget(panel, document.body);
  window.onresize = () => panel.update();
}


window.onload = main;
