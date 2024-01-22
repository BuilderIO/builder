# Content State

This document outlines how content state is managed in the Builder.io SDKs.

## Overview

The user provides multiple props that dictate what the content will be:

- `content`: the content JSON
- `data`: the data to be used for data bindings
- `locale`: locale-specific overrides

All of that is used to generate the initial value of the context in Content.

## Updating Content
