import Button from '@/Components/Button/Button'
import DecoratedInput from '@/Components/Input/DecoratedInput'
import { observer } from 'mobx-react-lite'
import { FunctionComponent } from 'react'
import Bullet from './Bullet'
import { TwoFactorActivation } from './TwoFactorActivation'
import ModalDialog from '@/Components/Shared/ModalDialog'
import ModalDialogButtons from '@/Components/Shared/ModalDialogButtons'
import ModalDialogDescription from '@/Components/Shared/ModalDialogDescription'
import ModalDialogLabel from '@/Components/Shared/ModalDialogLabel'

type Props = {
  activation: TwoFactorActivation
}

const Verification: FunctionComponent<Props> = ({ activation: act }) => {
  const secretKeyClass = act.verificationStatus === 'invalid-secret' ? 'border-danger' : ''
  const authTokenClass = act.verificationStatus === 'invalid-auth-code' ? 'border-danger' : ''
  return (
    <ModalDialog>
      <ModalDialogLabel closeDialog={act.cancelActivation}>Step 3 of 3 - Verification</ModalDialogLabel>
      <ModalDialogDescription className="h-33 flex flex-row items-center">
        <div className="flex flex-grow flex-col gap-4">
          <div className="flex flex-row flex-wrap items-center gap-1">
            <div className="text-sm">
              <Bullet className="align-middle" />
              <span className="align-middle">
                Enter your <b>secret key</b>:
              </span>
            </div>
            <DecoratedInput
              className={{ container: `ml-2 w-full md:w-96 ${secretKeyClass}` }}
              onChange={act.setInputSecretKey}
            />
          </div>
          <div className="flex flex-row flex-wrap items-center gap-1">
            <div className="text-sm">
              <Bullet className="align-middle" />
              <span className="align-middle">
                Verify the <b>authentication code</b> generated by your authenticator app:
              </span>
            </div>
            <DecoratedInput
              className={{ container: `ml-2 w-full md:w-30 ${authTokenClass}` }}
              onChange={act.setInputOtpToken}
            />
          </div>
        </div>
      </ModalDialogDescription>
      <ModalDialogButtons>
        {act.verificationStatus === 'invalid-auth-code' && (
          <div className="flex-grow text-sm text-danger">Incorrect authentication code, please try again.</div>
        )}
        {act.verificationStatus === 'invalid-secret' && (
          <div className="flex-grow text-sm text-danger">Incorrect secret key, please try again.</div>
        )}
        <Button className="min-w-20" label="Back" onClick={act.openSaveSecretKey} />
        <Button className="min-w-20" primary label="Next" onClick={act.enable2FA} />
      </ModalDialogButtons>
    </ModalDialog>
  )
}

export default observer(Verification)
