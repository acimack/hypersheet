import { INode, IUser } from '.'

export interface IChange {
  user: IUser // user who made the change
  timeStamp: Date // date that the change was made
  prevNode?: string // the previous node, node state before change
}

export const allChangeFields: string[] = ['user', 'timeStamp', 'prevNode']

export function makeIChange(user: any, timeStamp: any, prevNode?: any): IChange {
  return {
    user: user ?? null,
    timeStamp: timeStamp ?? null,
    prevNode: prevNode ?? null,
  }
}
