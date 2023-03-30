interface QueueItem {
    name: string;
    method: () => Promise<void>;
    resolve: (value: unknown) => void;
    reject: (reason?: any) => void;
}


export class Queue {
    queue: Array<QueueItem> = [];
    pendingPromise = false;
    workingOnPromise = false;


    public enqueue(name: string, method): Promise<void> {
        return new Promise((resolve, reject) => {
            this.queue.push({
                name,
                method,
                resolve,
                reject,
            });
            this.dequeue();
        });
    }

    private async dequeue() {
        if (this.workingOnPromise) {
            return false;
        }
        const item = this.queue.shift();
        if (!item) {
            return false;
        }
        this.workingOnPromise = true;
        console.log(`Calling ${item.name}...`);
        try {
            const value = await item.method();
            this.workingOnPromise = false;
            console.log(`Finished ${item.name}`);
            item.resolve(value);
            this.dequeue();
        } catch (error) {
            console.log(`Failed ${item.name}`);
            this.workingOnPromise = false;
            item.reject(error);
            this.dequeue();
        }
        return true;
    }
}
