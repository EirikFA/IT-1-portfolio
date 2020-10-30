import { storage } from "firebase/app";

import ValidationError from "../../../util/ValidationError";

export type FileType = "image";

export default class FileUploader {
  private _currentFile?: File;

  public get currentFile (): Readonly<File> | undefined {
    return this._currentFile;
  }

  private readonly fileType?: FileType;

  private readonly inputEl: HTMLInputElement;

  private readonly nameEl?: Element | null;

  public constructor (inputEl: HTMLInputElement, nameEl?: Element | null, fileType?: FileType) {
    this.fileType = fileType;
    this.inputEl = inputEl;
    this.nameEl = nameEl;

    this.inputEl.addEventListener("change", this.handleFileChange.bind(this));
  }

  public clean (): void {
    this.inputEl.removeEventListener("change", this.handleFileChange.bind(this));
  }

  public upload (ref: storage.Reference | ((file: File) => storage.Reference)): storage.UploadTask {
    this.validate();

    if (typeof ref === "function") {
      // Can assert because of the call to `validate`
      return ref(this.currentFile!).put(this.currentFile!);
    }

    return ref.put(this.currentFile!);
  }

  public validate (): void {
    if (!this.currentFile) throw new ValidationError("NoValue", "File is required");

    // If uploader should validate field type and the type is wrong, throw error
    if (this.fileType && !this.currentFile.type.startsWith(this.fileType)) {
      throw new ValidationError("InvalidFileFormat", `File must be ${this.fileType}`);
    }
  }

  private handleFileChange () {
    const { files } = this.inputEl;

    if (files && files.length > 0) {
      // Non-null assertion - we check length
      this._currentFile = files.item(0)!;
      if (this.nameEl) this.nameEl.textContent = this._currentFile.name;
    }
  }
}
