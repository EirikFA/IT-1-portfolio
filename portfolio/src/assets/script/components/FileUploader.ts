import { storage } from "firebase/app";

import ValidationError from "../../../util/ValidationError";

export type FileType = "image";

export default class FileUploader {
  private _currentFile?: File;

  public get currentFile (): File | undefined {
    return this._currentFile;
  }

  private readonly fileType?: FileType;

  private readonly inputEl: HTMLInputElement;

  private readonly nameEl: Element;

  public constructor (inputEl: HTMLInputElement, nameEl: Element, fileType?: FileType) {
    this.fileType = fileType;
    this.inputEl = inputEl;
    this.nameEl = nameEl;

    this.inputEl.addEventListener("change", this.handleFileChange.bind(this));
  }

  public clean (): void {
    this.inputEl.removeEventListener("change", this.handleFileChange.bind(this));
  }

  public upload (ref: storage.Reference): storage.UploadTask {
    if (!this.currentFile) throw new ValidationError("NoValue");

    // If uploader should validate field type and the type is wrong, throw error
    if (this.fileType && !this.currentFile.type.startsWith(this.fileType)) {
      throw new ValidationError("InvalidFileFormat");
    }

    return ref.put(this.currentFile);
  }

  private handleFileChange () {
    const { files } = this.inputEl;

    if (files && files.length > 0) {
      // Non-null assertion - we check length
      this._currentFile = files.item(0)!;
      this.nameEl.textContent = this._currentFile.name;
    }
  }
}
