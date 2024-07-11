---
'@builder.io/sdk-react-nextjs': minor
---

Fix: stop automatically providing `builderComponents` and `builderLinkComponents` to all RSC custom components. Instead, use the `shouldReceiveBuilderProps` to configure whether they should be provided or not.
