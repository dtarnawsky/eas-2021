# Vault 2

This is a drop in replacement for `Vault`. Just remove:
```js
import { Vault } from '@ionic-enterprise/identity-vault';
```
and add:
```js
import { Vault2 } from '../vault';
```

You create a vault without a config:
```typescript
this.vault = new Vault2();
```

but you'll need to call `createVault`:
```typescript
await this.vault.createVault( this.config );
```

## Quirks
- All operations run in a queue so it will be a little slower (IV needs a `setValues` method to set multiple keys).