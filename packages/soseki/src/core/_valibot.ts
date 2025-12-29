import { type InferOutput, rawTransform, type RawTransformAction, safeParse } from "valibot";
import captureStackTrace from "./_capture-stack-trace.js";
import isError from "./_is-error.js";
import { UnexpectedValidationError } from "./errors.js";

/***************************************************************************************************
 *
 * 共通の型
 *
 **************************************************************************************************/

/**
 * Valibot のスキーマの基底型を抽出するための型定義です。
 */
type BaseSchema = typeof safeParse extends (schema: infer TSchema, ...args: any) => any ? TSchema
  : never;

/***************************************************************************************************
 *
 * 再エクスポート
 *
 **************************************************************************************************/

export {
  brand,
  minValue,
  nullable,
  number,
  object,
  pipe,
  safeInteger,
  string,
  union,
  url,
  uuid,
} from "valibot";
export type { InferInput, InferOutput } from "valibot";

/***************************************************************************************************
 *
 * transform
 *
 **************************************************************************************************/

/**
 * 入力値を変換するアクションを作成します。例外が投げられた場合は Issue として登録します。
 *
 * @template TInput 入力値の型です。
 * @template TOutput 出力値の型です。
 * @param operation 変換処理を行う関数です。
 * @returns Valibot の RawTransformAction オブジェクトです。
 */
export function transform<TInput, TOutput>(
  operation: (input: TInput) => TOutput,
): RawTransformAction<TInput, TOutput> {
  return rawTransform<TInput, TOutput>(({ dataset, addIssue, NEVER }) => {
    const input = dataset.value;
    try {
      return operation(input);
    } catch (ex) {
      let message: string;
      if (isError(ex)) {
        message = `${ex.name}: ${ex.message}`;
      } else {
        try {
          message = JSON.stringify(ex);
        } catch {
          message = String(ex);
        }
      }

      addIssue({
        input,
        message,
      });

      return NEVER;
    }
  });
}

/***************************************************************************************************
 *
 * parse
 *
 **************************************************************************************************/

// /**
//  * バリデーションエラーを生成するためのコンストラクター型インターフェースです。
//  */
// export interface IParseErrorConstructor {
//   new(issues: [Issue, ...Issue[]], input: unknown): ValidationErrorBase<ErrorMeta>;
// }

// /**
//  * 指定されたスキーマに従って入力を検証し、失敗した場合は指定されたエラーを投げます。
//  *
//  * @template TSchema 使用するスキーマの型です。
//  * @param schema 検証に使用する Valibot スキーマです。
//  * @param input 検証対象の入力値です。
//  * @param Error バリデーション失敗時に投げるエラークラスです。デフォルトは InvalidInputError です。
//  * @returns 検証に成功した出力値です。
//  * @throws 検証に失敗した場合、指定された Error を投げます。
//  */
// export function parse<const TSchema extends BaseSchema>(
//   schema: TSchema,
//   input: unknown,
//   Error: IParseErrorConstructor = InvalidInputError,
// ): InferOutput<TSchema> {
//   const result = safeParse(schema, input);
//   if (result.success) {
//     return result.output;
//   }

//   const error = new Error(result.issues, input);
//   captureStackTrace(error, parse);
//   throw error;
// }

/***************************************************************************************************
 *
 * expect
 *
 **************************************************************************************************/

/**
 * 指定されたスキーマに従って入力を検証し、失敗した場合は UnexpectedValidationError を投げます。
 *
 * @template TSchema 使用するスキーマの型です。
 * @param schema 検証に使用する Valibot スキーマです。
 * @param input 検証対象の入力値です。
 * @returns 検証に成功した出力値です。
 * @throws 検証に失敗した場合、UnexpectedValidationError を投げます。
 */
export function expect<const TSchema extends BaseSchema>(
  schema: TSchema,
  input: unknown,
): InferOutput<TSchema> {
  const result = safeParse(schema, input);
  if (result.success) {
    return result.output;
  }

  const error = new UnexpectedValidationError(result.issues, input);
  captureStackTrace(error, expect);
  throw error;
}
