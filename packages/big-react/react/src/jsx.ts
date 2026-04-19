import {
  type ReactElement as ReactElementType,
  ElementType,
  Key,
  Props,
  Ref,
} from '@xuhan/react-shared/ReactTypes';
import { REACT_ELEMENT_TYPE } from '@xuhan/react-shared/ReactSymbols';

export const ReactElement = (
  type: ElementType,
  key: Key,
  ref: Ref,
  props: Props
): ReactElementType => {
  const element = {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref,
    props,
    __mark: 'xuhan',
  };
  return element;
};

export const jsx = (type: ElementType, config: any, ...maybeChildren: any[]) => {
  const { key = null, ref = null, ...props } = config;
  const maybeChildrenLength = maybeChildren.length;
  if (maybeChildrenLength) {
    props.children = maybeChildrenLength === 1 ? maybeChildren[0] : maybeChildren;
  }
  return ReactElement(type, key, ref, props);
};

export const jsxDEV = (type: ElementType, config: any) => {
  const { key = null, ref = null, ...props } = config;
  return ReactElement(type, key, ref, props);
};
