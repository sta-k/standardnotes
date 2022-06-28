import { ViewControllerManager } from '@/Services/ViewControllerManager'
import { observer } from 'mobx-react-lite'
import AutocompleteTagInput from '@/Components/TagAutocomplete/AutocompleteTagInput'
import NoteTag from './NoteTag'
import { useEffect } from 'react'

type Props = {
  viewControllerManager: ViewControllerManager
}

const NoteTagsContainer = ({ viewControllerManager }: Props) => {
  const { tags, tagsContainerMaxWidth } = viewControllerManager.noteTagsController

  useEffect(() => {
    viewControllerManager.noteTagsController.reloadTagsContainerMaxWidth()
  }, [viewControllerManager])

  return (
    <div
      className="-mt-1 -mr-2 flex min-w-80 flex-wrap bg-transparent"
      style={{
        maxWidth: tagsContainerMaxWidth,
      }}
    >
      {tags.map((tag) => (
        <NoteTag key={tag.uuid} viewControllerManager={viewControllerManager} tag={tag} />
      ))}
      <AutocompleteTagInput viewControllerManager={viewControllerManager} />
    </div>
  )
}

export default observer(NoteTagsContainer)
