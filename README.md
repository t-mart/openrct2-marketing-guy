# openrct2-perpertual-ads

Run park/ride advertising perpetually (without cheats).

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
