import { INode } from '.'

export class ChangeWrapper {
  node: INode
  children: ChangeWrapper[]

  constructor(node: INode) {
    this.node = node
    this.children = []
  }

  addChild(child: ChangeWrapper) {
    this.children.push(child)
  }
}

export function traverseChange(change: ChangeWrapper, callback: (change: ChangeWrapper) => void) {
  callback(change)
  if (change.children) {
    change.children.map((child) => traverseChange(child, callback))
  }
}
