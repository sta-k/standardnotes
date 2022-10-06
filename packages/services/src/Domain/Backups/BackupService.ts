import { ContentType, Uuid } from '@standardnotes/common'
import { EncryptionProviderInterface } from '@standardnotes/encryption'
import { PayloadEmitSource, FileItem, CreateEncryptedBackupFileContextPayload } from '@standardnotes/models'
import { ClientDisplayableError } from '@standardnotes/responses'
import { FilesApiInterface, FileBackupMetadataFile, FileBackupsDevice, FileBackupsMapping } from '@standardnotes/files'
import { InternalEventBusInterface } from '../Internal/InternalEventBusInterface'
import { ItemManagerInterface } from '../Item/ItemManagerInterface'
import { AbstractService } from '../Service/AbstractService'
import { StatusServiceInterface } from '../Status/StatusServiceInterface'

export class FilesBackupService extends AbstractService {
  private itemsObserverDisposer: () => void
  private pendingFiles = new Set<Uuid>()

  constructor(
    private items: ItemManagerInterface,
    private api: FilesApiInterface,
    private encryptor: EncryptionProviderInterface,
    private device: FileBackupsDevice,
    private status: StatusServiceInterface,
    protected override internalEventBus: InternalEventBusInterface,
  ) {
    super(internalEventBus)

    this.itemsObserverDisposer = items.addObserver<FileItem>(ContentType.File, ({ changed, inserted, source }) => {
      const applicableSources = [
        PayloadEmitSource.LocalDatabaseLoaded,
        PayloadEmitSource.RemoteSaved,
        PayloadEmitSource.RemoteRetrieved,
      ]

      if (applicableSources.includes(source)) {
        void this.handleChangedFiles([...changed, ...inserted])
      }
    })
  }

  override deinit() {
    this.itemsObserverDisposer()
  }

  public isFilesBackupsEnabled(): Promise<boolean> {
    return this.device.isFilesBackupsEnabled()
  }

  public async enableFilesBackups(): Promise<void> {
    await this.device.enableFilesBackups()

    if (!(await this.isFilesBackupsEnabled())) {
      return
    }

    this.backupAllFiles()
  }

  private backupAllFiles(): void {
    const files = this.items.getItems<FileItem>(ContentType.File)

    void this.handleChangedFiles(files)
  }

  public disableFilesBackups(): Promise<void> {
    return this.device.disableFilesBackups()
  }

  public changeFilesBackupsLocation(): Promise<string | undefined> {
    return this.device.changeFilesBackupsLocation()
  }

  public getFilesBackupsLocation(): Promise<string> {
    return this.device.getFilesBackupsLocation()
  }

  public openFilesBackupsLocation(): Promise<void> {
    return this.device.openFilesBackupsLocation()
  }

  private async getBackupsMapping(): Promise<FileBackupsMapping['files']> {
    return (await this.device.getFilesBackupsMappingFile()).files
  }

  private async handleChangedFiles(files: FileItem[]): Promise<void> {
    if (files.length === 0) {
      return
    }

    if (!(await this.isFilesBackupsEnabled())) {
      return
    }

    const mapping = await this.getBackupsMapping()

    for (const file of files) {
      if (this.pendingFiles.has(file.uuid)) {
        continue
      }

      const record = mapping[file.uuid]

      if (record == undefined) {
        this.pendingFiles.add(file.uuid)

        await this.performBackupOperation(file)

        this.pendingFiles.delete(file.uuid)
      }
    }
  }

  private async performBackupOperation(file: FileItem): Promise<'success' | 'failed' | 'aborted'> {
    const messageId = this.status.addMessage(`Backing up file ${file.name}...`)

    const encryptedFile = await this.encryptor.encryptSplitSingle({
      usesItemsKeyWithKeyLookup: {
        items: [file.payload],
      },
    })

    const itemsKey = this.items.getDisplayableItemsKeys().find((k) => k.uuid === encryptedFile.items_key_id)

    if (!itemsKey) {
      return 'failed'
    }

    const encryptedItemsKey = await this.encryptor.encryptSplitSingle({
      usesRootKeyWithKeyLookup: {
        items: [itemsKey.payload],
      },
    })

    const token = await this.api.createFileValetToken(file.remoteIdentifier, 'read')

    if (token instanceof ClientDisplayableError) {
      return 'failed'
    }

    const metaFile: FileBackupMetadataFile = {
      info: {
        warning: 'Do not edit this file.',
        information: 'The file and key data below is encrypted with your account password.',
        instructions:
          'Drag and drop this metadata file into the File Backups preferences pane in the Standard Notes desktop or web application interface.',
      },
      file: CreateEncryptedBackupFileContextPayload(encryptedFile.ejected()),
      itemsKey: CreateEncryptedBackupFileContextPayload(encryptedItemsKey.ejected()),
      version: '1.0.0',
    }

    const metaFileAsString = JSON.stringify(metaFile, null, 2)

    const result = await this.device.saveFilesBackupsFile(file.uuid, metaFileAsString, {
      chunkSizes: file.encryptedChunkSizes,
      url: this.api.getFilesDownloadUrl(),
      valetToken: token,
    })

    this.status.removeMessage(messageId)

    if (result === 'failed') {
      const failMessageId = this.status.addMessage(`Failed to back up ${file.name}...`)
      setTimeout(() => {
        this.status.removeMessage(failMessageId)
      }, 2000)
    }

    return result
  }
}
