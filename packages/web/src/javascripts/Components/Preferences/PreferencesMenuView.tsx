import { observer } from 'mobx-react-lite'
import { FunctionComponent, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import Dropdown from '../Dropdown/Dropdown'
import { DropdownItem } from '../Dropdown/DropdownItem'
import PreferencesMenuItem from './PreferencesComponents/MenuItem'
import { PreferencesMenu } from './PreferencesMenu'
import { PreferenceId } from '@standardnotes/ui-services'
import { useApplication } from '../ApplicationProvider'
import { classNames, Environment } from '@standardnotes/snjs'
import { isIOS } from '@/Utils'

type Props = {
  menu: PreferencesMenu
}

const StyledDropdown = styled(Dropdown)`
  [data-reach-listbox-button] {
    background: var(--sn-stylekit-contrast-background-color);
    color: var(--sn-stylekit-info-color);
    font-weight: bold;
    padding: 0.55rem 0.875rem;

    [data-reach-listbox-arrow] svg {
      fill: var(--sn-stylekit-info-color);
    }
  }
`

const PreferencesMenuView: FunctionComponent<Props> = ({ menu }) => {
  const application = useApplication()
  const { selectedPaneId, selectPane, menuItems } = menu

  const dropdownMenuItems: DropdownItem[] = useMemo(
    () =>
      menuItems
        .filter((pref) => pref.id !== 'filesend')
        .map((menuItem) => ({
          icon: menuItem.icon,
          label: menuItem.label,
          value: menuItem.id,
        })),
    [menuItems],
  )

  const openFileSend = useCallback(() => {
    const link = 'https://filesend.standardnotes.com/'

    if (application.isNativeMobileWeb()) {
      application.mobileDevice().openUrl(link)
      return
    } else if (application.environment === Environment.Desktop) {
      application.desktopDevice?.openUrl(link)
      return
    }

    window.open(link, '_blank')
  }, [application])

  return (
    <div
      className={classNames(
        'border-t border-border bg-default px-5 pt-2 md:border-0 md:bg-contrast md:px-0 md:py-0',
        isIOS() ? 'pb-safe-bottom' : 'pb-2 md:pb-0',
      )}
    >
      <div className="hidden min-w-55 flex-col overflow-y-auto px-3 py-6 md:flex">
        {menuItems.map((pref) => (
          <PreferencesMenuItem
            key={pref.id}
            iconType={pref.icon}
            label={pref.label}
            selected={pref.selected}
            hasBubble={pref.hasBubble}
            onClick={() => {
              if (pref.id === 'filesend') {
                openFileSend()
                return
              }
              selectPane(pref.id)
            }}
          />
        ))}
      </div>
      <div className="md:hidden">
        <StyledDropdown
          id="preferences-menu"
          items={dropdownMenuItems}
          label="Preferences Menu"
          value={selectedPaneId}
          onChange={(paneId) => {
            selectPane(paneId as PreferenceId)
          }}
          classNameOverride={{
            wrapper: 'relative',
            popover: 'bottom-full w-full max-h-max',
          }}
          portal={false}
        />
      </div>
    </div>
  )
}

export default observer(PreferencesMenuView)
