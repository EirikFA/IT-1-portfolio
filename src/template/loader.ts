interface TemplateScript {
  default: () => void;
}

interface Template {
  containerId: string;
  importPromise: Promise<string>;
  scripts?: Promise<TemplateScript>[];
}

const templates: Template[] = [
  {
    containerId: "nav-container",
    importPromise: import("./base/nav.html"),
    scripts: [import("./base/nav")]
  },
  {
    containerId: "footer-container",
    importPromise: import("./base/footer.html")
  }
];

for (const template of templates) {
  const container = document.getElementById(template.containerId);
  if (container) {
    template.importPromise.then(html => {
      // Put the markup in a template to make it act like any other DOM node (instead of a string)
      const el = document.createElement("template");
      el.innerHTML = html;

      container.appendChild(el.content);

      // Load all template scripts and run their default export (must be a function)
      Promise.all(template.scripts || []).then(modules => modules.forEach(m => m.default()));
    });
  }
}
