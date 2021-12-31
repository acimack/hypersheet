import { UserFields, allUserFields } from '.'

export interface IUserProperty {
  fieldName: UserFields
  value: any
}

export function makeIUserProperty(fieldName: UserFields, newValue: any): IUserProperty {
  return {
    fieldName: fieldName,
    value: newValue,
  }
}

export function isIUserProperty(object: any): boolean {
  const propsDefined: boolean =
    typeof (object as IUserProperty).fieldName !== 'undefined' &&
    typeof (object as IUserProperty).value !== 'undefined'
  if (propsDefined && allUserFields.includes((object as IUserProperty).fieldName)) {
    switch ((object as IUserProperty).fieldName) {
      case 'userId':
        return typeof (object as IUserProperty).value === 'string'
      case 'email':
        return typeof (object as IUserProperty).value === 'string'
      case 'imgUrl':
        return typeof (object as IUserProperty).value === 'string'
      case 'changedNodes':
        return typeof (object as IUserProperty).value === 'object'
      default:
        return true
    }
  }
  return false
}
