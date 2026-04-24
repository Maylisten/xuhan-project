import { Key, Props, Ref } from '@xuhan/react-shared/ReactTypes';
import { WorkTag } from './workTags';
import { FiberFlags, NoFlags } from './fiberFlags';

export class FiberNode {
  type: any;
  tag: WorkTag;
  pendingProps: Props;
  memorizedProps: Props | null;
  key: Key;
  ref: Ref;
  stateNode: any;
  return: FiberNode | null;
  sibling: FiberNode | null;
  child: FiberNode | null;
  alternate: FiberNode | null;
  index: number;
  flags: FiberFlags;

  constructor(tag: WorkTag, pendingProps: Props, key: Key) {
    this.tag = tag;
    this.key = key;
    this.stateNode = null;
    this.type = null;
    this.ref = null;

    this.return = null;
    this.sibling = null;
    this.child = null;
    this.alternate = null;
    this.index = 0;

    this.pendingProps = pendingProps;
    this.memorizedProps = null;
    this.flags = NoFlags;
  }
}

export class FiberRootNode {
  container: Container;
}
