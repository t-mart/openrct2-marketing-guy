# openrct2-marketing-guy

The last marketing guy was too inflexible, so we fired him and got this new marketing guy. He lets
us start campaigns that are really long.

## Development

For an faster development feedback loop,
[enable hot reloading](https://github.com/OpenRCT2/OpenRCT2/blob/develop/distribution/scripting.md#writing-scripts)
by changing the following setting in your `config.ini` **while the game is NOT running** (else, it
will be overwritten):

```diff
[plugin]
- enable_hot_reloading = false
+ enable_hot_reloading = true
```

### TODO

- make language consistent and update name. Are we "auto subscribing" "auto renewing", "running"?
  etc
