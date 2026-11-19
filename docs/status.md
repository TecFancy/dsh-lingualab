# Status

English | [简体中文](status.zh.md)

This document records what is built, how the page is opened from the left rail's 「更多」 menu, and where a change goes on its way to a release. Read it before changing how the panel is registered, or when you need to know whether a piece of the product exists yet.

## Both halves are written

The host provides the library scan, import route, media routes with `Range` support, browsable picker, notes read/write path and review list; the client provides the home, practice view, kept-sentences column and review, plus the browsing and media-folder layers.

## The page is a main panel, not a rail row

The page has **no rail row of its own**, and no card on the 「应用」 page either. It is registered as a `main` panel under the key `lingualab`, and the entry is the first row of the left rail's 「更多」 menu. This plugin registers that row into `sidebar.panellist.actions` itself, and selecting it calls `layout.selectPanel('lingualab')`. The rail still does not grow a row per plugin, and the entry now belongs to the plugin, so it no longer depends on `dsh-apps-panel` being installed.

## Changes land on `development` and reach users through `main`

It is developed on `development` and released by merging into `main`. The release workflow then tags the version and publishes it to npm. [Releasing](releasing.md) walks through the command and what CI does.
