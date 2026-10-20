# Antom Integration for Builder.io

Add the official **antom-integration** Skill to your Builder project through the
**Antom** plugin tab.

The plugin prepares an installation prompt. **Builder Agent retrieves and writes
the Skill files** in your current project; the plugin does not install files
directly or perform payment integration by itself.

This release offers only **Payment integration**. Reconciliation installation is
not offered.

## 1. Add the plugin to Builder

1. Open your Builder **Space Settings**.
2. Find **Plugins** under **Integrations**, click **Edit**, then **Add Plugin**.
3. Enter the plugin package name below, click **Save**, and reload Builder.

```text
@builder.io/plugin-antom-payment
```

![Builder.io plugin installation settings](./docs/media/builder-installation.png)

Use the package name in Builder's plugin settings; no GitHub URL or terminal
installation is needed. If you previously loaded a development version, replace
that entry rather than loading two copies of the plugin.

## 2. Install antom-integration

![Antom plugin interaction walkthrough](./docs/media/antom-integration-demo.gif)

1. Open your application project in Builder and select the **Antom** tab.
2. Leave **Payment integration** selected and click **Copy install prompt**.
3. Paste the prompt into the **current project's Builder Agent chat** and send it.
4. Wait for the Agent to download, install and verify the Skill.
5. After the Agent confirms successful installation, start a new chat **in the
   same project** and use `antom-integration`.

## 3. Use the Skill

Click **Copy example** in the Antom tab and send it in your new chat, or describe
your payment-integration needs:

> Use antom-integration to add Antom sandbox payments to this project.

Configure any required real credentials through the application's server-side
Secrets, never in plugin settings or chat. Test the payment flow in the sandbox
before going live.

## License

See [LICENSE](LICENSE).
The original Skill retains its upstream license.
