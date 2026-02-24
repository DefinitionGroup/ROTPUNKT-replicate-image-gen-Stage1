import components from './components'
import { pageType } from './pageType'
import objects from './objects'

export const schemaTypes = [
  pageType,
  ...components,
  ...objects,
]
