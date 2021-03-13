export default class Queue<T> {
  _store: T[] = [];

  /**
   * Add an item to the queue (returns queue length)
   * @param val
   */
  enqueue(val: T): number {
    return this._store.push(val);
  }

  /**
   * Returns undefined if the queue is empty.
   */
  dequeue(): T | undefined {
    return this._store.shift();
  }

  isEmpty(): boolean {
      return this._store.length === 0;
  }
}