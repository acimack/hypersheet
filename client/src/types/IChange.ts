// import { INode } from '.'
import { IUser } from './IUser'

// INode with node metadata
export interface IChange {
  user: IUser // user who made the change
  timeStamp: Date // date that the node was created
  prevNode: string // the previous node, before the change
}

/**
 * Function that creates an IChange given relevant inputs
 * @param user
 * @param timeStamp
 * @param prevNode
 * @returns IChange object
 */
export function makeIChange(user: any, timeStamp: any, prevNode?: any): IChange {
  return {
    user: user ?? null,
    timeStamp: timeStamp ?? null,
    prevNode: prevNode ?? null,
  }
}
