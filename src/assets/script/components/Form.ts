import { ObjectSchema } from "yup";

import { FileUploader, TagsInput } from ".";
import { FileType } from "./FileUploader";

export type ValueTypes = {
  [name: string]: typeof String | typeof FileUploader | typeof TagsInput;
};

export type FormValues<Types extends ValueTypes> = {
  [K in keyof Types]: InstanceType<Types[K]>;
};

type InputHandlers<Types extends ValueTypes> = {
  [K in keyof Types]?: FileUploader | TagsInput;
};

export default class Form<Schema extends ObjectSchema, V extends ValueTypes> {
  private readonly formEl: HTMLFormElement;

  private readonly getErrorEl: (path: string) => Element | null;

  private inputHandlers: InputHandlers<V>;

  private readonly inputs: V;

  private readonly schema: Schema;

  private readonly submitCallback: (values: FormValues<V>) => any;

  public constructor (
    formEl: HTMLFormElement,
    getErrorEl: (path: string) => Element | null,
    inputs: V,
    schema: Schema,
    submitCallback: (values: FormValues<V>) => any
  ) {
    this.formEl = formEl;
    this.getErrorEl = getErrorEl;
    this.inputHandlers = {};
    this.inputs = inputs;
    this.schema = schema;
    this.submitCallback = submitCallback;

    this.setupHandlers();
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

    const values: Partial<FormValues<V>> = {};

    for (const [name, type] of Object.entries(this.inputs)) {
      const el = this.formEl.elements.namedItem(name);

      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        const handler = this.inputHandlers[name];

        if (type === FileUploader) {
          if (handler && handler instanceof FileUploader) {
            try {
              handler.validate();
              values[name as keyof V] = handler as FormValues<V>[keyof V];
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
            values[name as keyof V] = handler as FormValues<V>[keyof V];
          }
        } else {
          values[name as keyof V] = el.value as FormValues<V>[keyof V];
        }
      }
    }

    try {
      await this.schema.validate(values, { abortEarly: false });
      // To avoid submitting if file handler has error (see above try/catch clause)
      if (!hasError) this.submitCallback(values as FormValues<V>);
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

  private setupHandlers (): void {
    for (const [name, type] of Object.entries(this.inputs)) {
      const el = this.formEl.elements.namedItem(name);

      if (el instanceof HTMLInputElement) {
        if (type === FileUploader) {
          const nameEl = el.parentElement?.querySelector(".file-name");

          const { fileType } = el.dataset;

          this.inputHandlers[name as keyof V] = new FileUploader(el, nameEl, fileType as FileType);
        } else if (type === TagsInput) {
          if (el.parentElement) {
            this.inputHandlers[name as keyof V] = new TagsInput(el, el.parentElement);
          }
        }
      }
    }
  }
}
