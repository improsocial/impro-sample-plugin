import { Modal, Plugin, PluginSettingTab, Setting } from "./pluginWorker.js";

const DEFAULT_SETTINGS = {
  greeting: "Hello",
  loud: false,
  buttonStyle: "primary",
};

class SampleModal extends Modal {
  constructor(settings) {
    super();
    this.settings = settings;
  }

  onOpen() {
    this.titleEl.setText("Sample modal");
    const message = this.settings.loud
      ? `${this.settings.greeting}!!!`
      : `${this.settings.greeting}.`;
    this.contentEl.createEl("p", {
      text: message,
      cls: "modal-dialog-message",
    });
    const buttons = this.contentEl.createDiv({ cls: "modal-dialog-buttons" });
    buttons
      .createEl("button", {
        text: "OK",
        cls: `modal-dialog-button ${this.settings.buttonStyle}-button`,
      })
      .onClick(() => this.close());
  }

  onClose() {
    this.titleEl.empty();
    this.contentEl.empty();
  }
}

class SampleSettingTab extends PluginSettingTab {
  constructor() {
    super();
    this.setName("Impro Sample Plugin");
  }

  display() {
    new Setting(this.containerEl)
      .setName("Greeting")
      .setDesc("Text shown in the sample modal")
      .addText((text) =>
        text
          .setPlaceholder("Hello")
          .setValue(this.plugin.settings.greeting)
          .onChange(async (value) => {
            this.plugin.settings.greeting = value;
            await this.plugin.saveData(this.plugin.settings);
          }),
      );

    new Setting(this.containerEl)
      .setName("Loud mode")
      .setDesc("Adds exclamation marks to the greeting")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.loud).onChange(async (value) => {
          this.plugin.settings.loud = value;
          await this.plugin.saveData(this.plugin.settings);
        }),
      );

    new Setting(this.containerEl)
      .setName("Button style")
      .setDesc("Modal button style")
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({ primary: "Primary", danger: "Danger" })
          .setValue(this.plugin.settings.buttonStyle)
          .onChange(async (value) => {
            this.plugin.settings.buttonStyle = value;
            await this.plugin.saveData(this.plugin.settings);
          }),
      );

    new Setting(this.containerEl)
      .setName("Reset settings")
      .setDesc("Reset all settings to defaults")
      .addButton((button) =>
        button.setButtonText("Reset").onClick(async () => {
          this.plugin.settings = { ...DEFAULT_SETTINGS };
          await this.plugin.saveData(this.plugin.settings);
          this.refresh();
        }),
      );
  }
}

class ImproSamplePlugin extends Plugin {
  async onload() {
    const saved = await this.loadData();
    this.settings = { ...DEFAULT_SETTINGS, ...(saved ?? {}) };

    this.addSettingTab(new SampleSettingTab());

    this.addSidebarItem("lightning-bolt", "Open modal", () => {
      new SampleModal(this.settings).open();
    });
    this.app.on("post-context-menu", (menu) => {
      menu.addItem((item) =>
        item
          .setTitle("Open modal")
          .setIcon("lightning-bolt")
          .onClick(() => {
            new SampleModal(this.settings).open();
          }),
      );
    });

    this.onSettingsChange((data) => {
      this.settings = { ...DEFAULT_SETTINGS, ...(data ?? {}) };
    });
  }
}

ImproSamplePlugin.register();
