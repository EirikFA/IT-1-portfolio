import { ObjectSchema } from "yup";

import { FileUploader, TagsInput } from ".";
import { FileType } from "./FileUploader";

export type InputTypes = {
  [name: string]: typeof Date | typeof FileUploader | typeof Number | typeof String | typeof TagsInput;
};

export type FormValues<Types extends InputTypes> = {
  [K in keyof Types]: InstanceType<Types[K]>;
};

type InputHandlers<Types extends InputTypes> = {
  [K in keyof Types]?: FileUploader | TagsInput;
};

export default class Form<Schema extends ObjectSchema, T extends InputTypes> {
  private readonly formEl: HTMLFormElement;

  private readonly getErrorEl: (path: string) => Element | null;

  private inputHandlers: InputHandlers<T>;

  private readonly inputs: T;

  private readonly schema: Schema;

  private readonly submitCallback: (values: FormValues<T>) => any;

  public constructor (
    formEl: HTMLFormElement,
    getErrorEl: (path: string) => Element | null,
    inputs: T,
    schema: Schema,
    submitCallback: (values: FormValues<T>) => any,
    initialValues: Partial<FormValues<T>> = {}
  ) {
    this.formEl = formEl;
    this.getErrorEl = getErrorEl;
    this.inputHandlers = {};
    this.inputs = inputs;
    this.schema = schema;
    this.submitCallback = submitCallback;

    for (const [name, value] of Object.entries(initialValues)) {
      const el = this.formEl.elements.namedItem(name);

      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        if (value instanceof Date && el instanceof HTMLInputElement) {
          el.valueAsDate = value;
        } else if (typeof value === "number") {
          el.value = value.toString();
        } else if (typeof value === "string") {
          el.value = value;
        }
      }
    }

    this.setupHandlers(initialValues);
    this.formEl.addEventListener("submit", this.handleSubmit.bind(this));
  }

  private clearErrors (): void {
    for (let i = 0; i < this.formEl.elements.length; i++) {
      const el = this.formEl.elements.item(i);
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        this.setError(el.name, "");
      }
    }
  }

  private async handleSubmit (event: Event): Promise<void> {
    event.preventDefault();
    this.clearErrors();

    let hasError = false;

    const values: Partial<FormValues<T>> = {};

    for (const [name, type] of Object.entries(this.inputs)) {
      const el = this.formEl.elements.namedItem(name);

      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        const handler = this.inputHandlers[name];

        if (type === FileUploader) {
          if (handler && handler instanceof FileUploader) {
            try {
              handler.validate();
              values[name as keyof T] = handler as FormValues<T>[keyof T];
            } catch (e) {
              // `instanceof ValidationError` not working ¯\_(ツ)_/¯
              if (e.name === "ValidationError") {
                this.setError(name, e.message);
              } else {
                this.setError(name, "Unknown error occurred");
              }

              hasError = true;
            }
          }
        } else if (type === TagsInput) {
          if (handler && handler instanceof TagsInput) {
            values[name as keyof T] = handler as FormValues<T>[keyof T];
          }
        } else {
          values[name as keyof T] = el.value as FormValues<T>[keyof T];
        }
      }
    }

    try {
      // Yup casts some values for us (e. g. dates)
      const castValues = await this.schema.validate(values, { abortEarly: false });
      // To avoid submitting if file handler has error (see above try/catch clause)
      if (!hasError) this.submitCallback(castValues as FormValues<T>);
    } catch (e) {
      if (e.inner.length > 0) {
        for (const error of e.inner) {
          this.setError(error.path, error.message);
        }
      } else {
        this.setError(e.path, e.message);
      }
    }
  }

  private setError (path: string, message: string): void {
    const errorEl = this.getErrorEl(path);
    if (errorEl instanceof HTMLElement) {
      errorEl.textContent = message;
    }
  }

  private setupHandlers (initialValues: Partial<FormValues<T>>): void {
    for (const [name, type] of Object.entries(this.inputs)) {
      const initial = initialValues[name];
      const el = this.formEl.elements.namedItem(name);

      if (initial) {
        // Casting `initial` because TypeScript is not aware `initialValues[name]` has same type as `inputHandlers[name]`
        this.inputHandlers[name as keyof T] = initial as InputHandlers<T>[keyof T];
      } else if (el instanceof HTMLInputElement) {
        if (type === FileUploader) {
          const nameEl = el.parentElement?.querySelector(".file-name");

          const { fileType } = el.dataset;

          this.inputHandlers[name as keyof T] = new FileUploader(el, fileType as FileType, nameEl);
        } else if (type === TagsInput) {
          if (el.parentElement) {
            this.inputHandlers[name as keyof T] = new TagsInput(el, el.parentElement);
          }
        }
      }
    }
  }
}
