import { INode } from '.'
export interface IUser {
  userId: string
  email: string
  imgUrl: string
  changedNodes: INode[]
}

export type UserFields = keyof IUser

/**
 * right now parameters don't need names in tests, is this wrong?
 * will ask
 */
export function makeIUser(
  userId: string,
  email: string,
  imgUrl: string,
  changedNodes: INode[]
): IUser {
  return {
    userId: userId,
    email: email,
    imgUrl: imgUrl,
    changedNodes: changedNodes,
  }
}

export const allUserFields: string[] = ['userId', 'email', 'imgUrl', 'changedNodes']

export function isIUser(object: any): object is IUser {
  return (
    typeof (object as IUser).userId === 'string' &&
    typeof (object as IUser).email === 'string' &&
    typeof (object as IUser).imgUrl === 'string' &&
    typeof (object as IUser).changedNodes == 'object'
  )
}

export function isSameUser(u1: IUser, u2: IUser): boolean {
  return (
    u1.userId === u2.userId && u1.email === u2.email && u1.imgUrl === u2.imgUrl
    // u1.changedNodes == u2.changedNodes
  )
}
