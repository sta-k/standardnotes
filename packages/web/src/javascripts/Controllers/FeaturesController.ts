import { WebApplication } from '@/Application/Application'
import { destroyAllObjectProperties } from '@/Utils'
import {
  ApplicationEvent,
  FeatureIdentifier,
  FeatureStatus,
  InternalEventBus,
  InternalEventInterface,
} from '@standardnotes/snjs'
import { action, makeObservable, observable, runInAction, when } from 'mobx'
import { AbstractViewController } from './Abstract/AbstractViewController'
import { CrossControllerEvent } from './CrossControllerEvent'

export class FeaturesController extends AbstractViewController {
  hasFolders: boolean
  hasSmartViews: boolean
  hasFiles: boolean
  premiumAlertFeatureName: string | undefined

  override deinit() {
    super.deinit()
    ;(this.showPremiumAlert as unknown) = undefined
    ;(this.closePremiumAlert as unknown) = undefined
    ;(this.hasFolders as unknown) = undefined
    ;(this.hasSmartViews as unknown) = undefined
    ;(this.hasFiles as unknown) = undefined
    ;(this.premiumAlertFeatureName as unknown) = undefined

    destroyAllObjectProperties(this)
  }

  constructor(application: WebApplication, eventBus: InternalEventBus) {
    super(application, eventBus)

    this.hasFolders = this.isEntitledToFolders()
    this.hasSmartViews = this.isEntitledToSmartViews()
    this.hasFiles = this.isEntitledToFiles()
    this.premiumAlertFeatureName = undefined

    eventBus.addEventHandler(this, CrossControllerEvent.DisplayPremiumModal)

    makeObservable(this, {
      hasFolders: observable,
      hasSmartViews: observable,
      hasFiles: observable,

      premiumAlertFeatureName: observable,
      showPremiumAlert: action,
      closePremiumAlert: action,
    })

    this.showPremiumAlert = this.showPremiumAlert.bind(this)
    this.closePremiumAlert = this.closePremiumAlert.bind(this)

    this.disposers.push(
      application.addEventObserver(async (event) => {
        switch (event) {
          case ApplicationEvent.FeaturesUpdated:
          case ApplicationEvent.Launched:
            runInAction(() => {
              this.hasFolders = this.isEntitledToFolders()
              this.hasSmartViews = this.isEntitledToSmartViews()
              this.hasFiles = this.isEntitledToFiles()
            })
        }
      }),
    )
  }

  async handleEvent(event: InternalEventInterface): Promise<void> {
    if (event.type === CrossControllerEvent.DisplayPremiumModal) {
      const payload = event.payload as { featureName: string }
      void this.showPremiumAlert(payload.featureName)
    }
  }

  public async showPremiumAlert(featureName: string): Promise<void> {
    this.premiumAlertFeatureName = featureName
    return when(() => this.premiumAlertFeatureName === undefined)
  }

  public closePremiumAlert() {
    this.premiumAlertFeatureName = undefined
  }

  private isEntitledToFiles(): boolean {
    const status = this.application.features.getFeatureStatus(FeatureIdentifier.Files)

    return status === FeatureStatus.Entitled
  }

  private isEntitledToFolders(): boolean {
    const status = this.application.features.getFeatureStatus(FeatureIdentifier.TagNesting)

    return status === FeatureStatus.Entitled
  }

  private isEntitledToSmartViews(): boolean {
    const status = this.application.features.getFeatureStatus(FeatureIdentifier.SmartFilters)

    return status === FeatureStatus.Entitled
  }
}
