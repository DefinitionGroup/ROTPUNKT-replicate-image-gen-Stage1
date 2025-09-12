import components from './components'
import { pageBuilderType } from './pageBuilderType'
import { pageType } from './pageType'
import objects from './objects'

export const schemaTypes = [
  pageType,
  pageBuilderType,
  ...components,
  ...objects,
]
