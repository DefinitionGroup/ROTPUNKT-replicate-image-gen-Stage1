import type { StructureResolver } from 'sanity/structure'
import { DocumentIcon } from '@sanity/icons'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Custom grouping for Pages
      S.listItem()
        .title('Pages by Language')
        .icon(DocumentIcon)
        .child(
          S.list()
            .title('Pages')
            .items([
              S.listItem()
                .title('Deutsch')
                .child(
                  S.documentList()
                    .title('German Pages')
                    .filter('_type == "page" && language == "de"')
                ),
              S.listItem()
                .title('English')
                .child(
                  S.documentList()
                    .title('English Pages')
                    .filter('_type == "page" && language == "en"')
                ),
              S.divider(),
              S.listItem()
                .title('All Pages')
                .child(
                  S.documentTypeList('page')
                )
            ])
        ),
      S.divider(),
      // List all other document types except "page"
      ...S.documentTypeListItems().filter(
        (listItem) => listItem.getId() !== 'page'
      ),
    ])
