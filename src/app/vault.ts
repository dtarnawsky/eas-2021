import { IdentityVaultConfig, Vault } from '@ionic-enterprise/identity-vault';
import { App } from '@capacitor/app';
import { Queue } from './queue';



export class Vault2 {
    private vault: Vault;
    private lockAfterBackgrounded: number | undefined;
    private unlockVaultOnLoad: boolean | undefined;
    private config: IdentityVaultConfig;
    private backgrounded: Date;
    private queue: Queue = new Queue();

    public async createVault(
        desiredConfig: IdentityVaultConfig): Promise<void> {
        await this.queue.enqueue('createVault', async () => {
            // We need to override lockAfterBackgrounded and unlockVaultOnLoad because we cannot tell when it finishes
            this.lockAfterBackgrounded = desiredConfig.lockAfterBackgrounded;
            this.unlockVaultOnLoad = desiredConfig.unlockVaultOnLoad;
            desiredConfig.lockAfterBackgrounded = undefined;
            desiredConfig.unlockVaultOnLoad = undefined;
            this.config = desiredConfig;

            this.vault = new Vault(desiredConfig);

            App.addListener('resume', async () => {
                if (this.lockAfterBackgrounded) {
                    if (new Date().getTime() - this.backgrounded.getTime() > this.lockAfterBackgrounded) {
                        this.backgrounded = undefined;
                        await this.lock();
                    }
                }
            });
            App.addListener('pause', () => {
                this.backgrounded = new Date();
            });
            // The vault constructor cannot be awaited and has no error handling
            // so we sleep for a bit and hope there were no errors and it finishes
            await this.sleep(1000);
        });
    }

    public onConfigChanged(method: any) {
        if (!this.vault) {
            console.error('onConfigChanged called before vault created');
        }
        this.vault.onConfigChanged(method);
    }

    public onError(method: any) {

        if (!this.vault) {
            console.error('onError called before vault created');
        }
        this.vault.onError(method);
    }

    public onLock(method: any) {
        if (!this.vault) {
            console.error('onLock called before vault created');
        }
        this.vault.onLock(method);
    }

    public onUnlock(method: any) {
        if (!this.vault) {
            console.error('onUnlock called before vault created');
        }
        this.vault.onUnlock(method);
    }

    public onPasscodeRequested(method: any) {
        if (!this.vault) {
            console.error('onPasscodeRequested called before vault created');
        }
        this.vault.onPasscodeRequested(method);
    }

    public async clear() {
        await this.queue.enqueue('clear', async () => {
            await this.vault.clear();
        });
    }

    public async setValue(key: string, value: any) {
        await this.queue.enqueue('setValue', async () => {
            await this.vault.setValue(key, value);
        });
    }

    public async getValue(key: string): Promise<any> {
        let value: any;
        await this.queue.enqueue('getValue', async () => {
            value = await this.vault.getValue(key);
        });
        return value;
    }

    public async getKeys(): Promise<string[]> {
        let value: string[];
        await this.queue.enqueue('getKeys', async () => {
            value = await this.vault.getKeys();
        });
        return value;
    }

    public async isEmpty(): Promise<boolean> {
        let value: boolean;
        await this.queue.enqueue('getKeys', async () => {
            value = await this.vault.isEmpty();
        });
        return value;
    }

    public async exportVault(): Promise<{ [key: string]: string }> {
        let value: any;
        await this.queue.enqueue('exportVault', async () => {
            value = await this.vault.exportVault();
        });
        return value;
    }

    public async importVault(data: { [key: string]: string }): Promise<void> {
        await this.queue.enqueue('importVault', async () => {
            await this.vault.importVault(data);
        });
    }

    public async isLocked(): Promise<boolean> {
        let value: boolean;
        await this.queue.enqueue('isLocked', async () => {
            value = await this.vault.isLocked();
        });
        return value;
    }

    public async lock(): Promise<void> {
        await this.queue.enqueue('lock', async () => {
            await this.vault.lock();
        });
    }

    public async unlock(): Promise<void> {
        await this.queue.enqueue('unlock', async () => {
            await this.vault.unlock();
        });
    }

    public async removeValue(key: string): Promise<void> {
        await this.queue.enqueue('removeValue', async () => {
            await this.vault.removeValue(key);
        });
    }

    public async setCustomPasscode(passcode: string): Promise<void> {
        return await this.vault.setCustomPasscode(passcode);
    }

    public async updateConfig(config: IdentityVaultConfig) {
        await this.queue.enqueue('updateConfig', async () => {
            await this.vault.updateConfig(config);
        });
    }

    // This is called internally by Auth Connect
    public getConfig() {
        return this.config;
    }

    // This is called internally by Auth Connect
    public async storeValue(key: string, value: any) {
        await this.setValue(key, value);
    }

    // This is called internally by Auth Connect
    protected async getVault() {
        //(this.vault as any).getConfig = () => this.config;
        return Promise.resolve(this);
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
