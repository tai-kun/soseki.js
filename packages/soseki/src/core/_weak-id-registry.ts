import unreachable from "./_unreachable.js";

/**
 * 識別子（ID）の型エイリアスです。
 *
 * ID は増分カウンターを36進数エンコードしたものです。
 */
export type Id = string;

/**
 * `WeakIdRegistry` クラスは、オブジェクトに対する ID の割り当てと管理を行います。
 *
 * オブジェクト自体は `WeakMap` と `WeakRef` を使用して保持されるため、参照がなくなったオブジェクトはガベージコレクション（GC）の対象になります。
 *
 * @template TValue ID を割り当てる対象となるオブジェクトの型です。`object` 型のサブタイプである必要があります。
 */
export default class WeakIdRegistry<TValue extends object> {
  /**
   * ID 生成のための内部カウンターです。BigInt を使用することで、非常に大きな数値まで ID を生成できます。
   */
  private counter: bigint;

  /**
   * オブジェクト (関数を含む) から、割り当てられた ID へのマッピングを保持する `WeakMap` です。
   *
   * `WeakMap` を使用することで、キーであるオブジェクトが他の場所から参照されなくなった場合、このマッピングも自動的に破棄され、GC が可能になります。
   */
  private readonly v2id: WeakMap<TValue, Id>;

  /**
   * ID から、対応するオブジェクトへの弱い参照 (`WeakRef`) のマッピングを保持する `Map` です。
   *
   * オブジェクト自体が GC される可能性があるため、`WeakRef` を使用しています。
   */
  private readonly id2v: Map<Id, WeakRef<TValue>>;

  /**
   * オブジェクトが GC されたときに実行されるコールバックを登録するための `FinalizationRegistry` です。
   *
   * オブジェクトが GC されると、登録された ID がコールバックに渡され、その ID に対応するエントリーを `id2v` マップから削除するために使用されます。
   */
  private readonly gc: FinalizationRegistry<Id>;

  /**
   * `WeakIdRegistry` クラスの新しいインスタンスを作成します。
   */
  public constructor() {
    this.counter = 0n;
    this.v2id = new WeakMap();
    this.id2v = new Map();
    this.gc = new FinalizationRegistry(id => {
      this.id2v.delete(id);
    });
  }

  /**
   * 指定されたオブジェクトに一意の ID を割り当てて登録します。
   *
   * すでに ID が割り当てられているオブジェクトであれば、既存の ID を返します。
   *
   * @param value ID を割り当てる対象のオブジェクトです。
   * @returns 割り当てられた、または既存の一意の ID です。
   */
  public set(value: TValue): Id {
    if (!this.v2id.has(value)) {
      const id = (this.counter++).toString(36);
      this.v2id.set(value, id);
      this.id2v.set(id, new WeakRef(value));
      // `FinalizationRegistry` にオブジェクトとそれに対応する ID を登録します。
      // これにより、オブジェクトが GC されたときに `id2v` からエントリーが削除されます。
      this.gc.register(value, id);

      return id;
    }

    const id = this.v2id.get(value)!;
    switch (typeof id) {
      case "string":
        return id;
      default:
        // `id` は必ず文字列になるはずです。
        unreachable(id);
    }
  }

  /**
   * 指定されたオブジェクトに ID が割り当てられているかどうかを確認します。
   *
   * @param value 確認するオブジェクトです。
   * @returns ID が割り当てられていれば `true`、そうでなければ `false` を返します。
   */
  public has(value: TValue): boolean {
    return this.v2id.has(value);
  }

  /**
   * 指定されたオブジェクトに対応する ID を取得します。
   *
   * オブジェクトが未登録の場合は `undefined` を返します。
   *
   * @param value 取得したい ID のオブジェクトです。
   * @returns 対応する ID、またはオブジェクトが未登録の場合は `undefined` を返します。
   */
  public get(value: TValue): Id | undefined;

  /**
   * 指定された ID に対応するオブジェクトを取得します。
   *
   * オブジェクトが既に GC されている場合は `undefined` を返します。
   *
   * @param id 取得したいオブジェクトの ID です。
   * @returns 対応するオブジェクト、またはオブジェクトが GC されている場合は `undefined` を返します。
   */
  public get(id: Id): TValue | undefined;

  public get(idOrValue: Id | TValue): unknown {
    if (typeof idOrValue === "string") {
      const id = idOrValue;
      return this.id2v.get(id)?.deref();
    } else {
      const value = idOrValue;
      return this.v2id.get(value);
    }
  }
}
