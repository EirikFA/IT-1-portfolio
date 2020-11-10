export default (path: string): Element | null => {
  const input = document.querySelector(`input[name=${path}], textarea[name=${path}]`);
  if (input) {
    let field = input.parentElement?.parentElement;
    // File fields
    if (field && !field.classList.contains("field")) field = field?.parentElement;

    if (field) {
      const errorEl = field.querySelector("p.help.is-danger");
      return errorEl;
    }
  }

  return null;
};
