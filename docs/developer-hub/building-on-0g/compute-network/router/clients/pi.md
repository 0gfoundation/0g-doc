---
id: pi
title: Pi
sidebar_position: 3
description: "Use every 0G Compute Router chat model in Pi with the pi-0g-provider extension."
keywords: [Pi, pi coding agent, pi-0g-provider, 0G Private Computer, Router, extension, OG_API_KEY, coding tools]
---

# Pi

[Pi](https://pi.dev) reaches the Router through the `pi-0g-provider` extension, which
registers a `0g` provider with every chat model the Router serves.

:::tip Skip the manual setup
[0gpc](./0gpc-cli) can also connect Pi, with the model you pick.
:::

## Install

```bash
pi install npm:pi-0g-provider
export OG_API_KEY=YOUR_API_KEY
pi --model 0g/glm-5.3-flash
```

`pi --list-models 0g` lists the models.

## What the extension does

- **Models** are read from the public [model list](./connection-settings#the-values) when
  Pi starts, so new models appear without an update. Context window, output limit, image
  input and prices come from the same list. If the Router cannot be reached, the last list
  fetched is used.
- **Thinking levels** map to `reasoning_effort` on models that take it.
- Source: [github.com/jake11-oho/pi-0g](https://github.com/jake11-oho/pi-0g).
