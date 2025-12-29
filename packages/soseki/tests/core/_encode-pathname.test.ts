import { describe, test } from "vitest";
import encodePathname from "../../src/core/_encode-pathname.js";

describe("パスの正規化に関する振る舞い", () => {
  test("スラッシュから始まるパス名を渡したとき、そのままの形で返る", ({ expect }) => {
    // Arrange
    const pathname = "/foo/bar";

    // Act
    const result = encodePathname(pathname);

    // Assert
    expect(result).toBe("/foo/bar");
  });

  test("スラッシュから始まらないパス名を渡したとき、先頭にスラッシュが付与される", ({ expect }) => {
    // Arrange
    const pathname = "foo/bar";

    // Act
    const result = encodePathname(pathname);

    // Assert
    expect(result).toBe("/foo/bar");
  });

  test("連続したスラッシュが含まれる場合、それらは 1 にまとめられる", ({ expect }) => {
    // Arrange
    const input = "///assets//images///logo.png";

    // Act
    const result = encodePathname(input);

    // Assert
    expect(result).toBe("/assets/images/logo.png");
  });
});

describe("URL エンコードに関する振る舞い", () => {
  test("日本語の文字列が含まれる場合、パーセントエンコーディングされたパスが返る", ({ expect }) => {
    // Arrange
    const input = "/ディレクトリ/ファイル.txt";

    // Act
    const result = encodePathname(input);

    // Assert
    expect(result).toBe(
      "/%E3%83%87%E3%82%A3%E3%83%AC%E3%82%AF%E3%83%88%E3%83%AA/%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB.txt",
    );
  });

  test("特殊文字やスペースが含まれる場合、適切にエンコードされたパスが返る", ({ expect }) => {
    // Arrange
    const input = "/path with spaces/test?query";

    // Act
    const result = encodePathname(input);

    // Assert
    // URL オブジェクトの仕様に基づき、 '?' 以降は query と見なされ pathname からは除外される振る舞いを検証
    expect(result).toBe("/path%20with%20spaces/test");
  });

  test("一部が既にエンコードされている場合、未エンコードの箇所のみがエンコードされ、二重エンコードにならない", ({ expect }) => {
    // Arrange
    // "テスト" はエンコード済み（ %E3%83%86%E3%82%B9%E3%83%88 ）、 "データ" は未エンコード
    const input = "/%E3%83%86%E3%82%B9%E3%83%88/データ.txt";

    // Act
    const result = encodePathname(input);

    // Assert
    // 既にエンコードされた部分は維持され、 "データ" のみがエンコードされることを確認
    expect(result).toBe("/%E3%83%86%E3%82%B9%E3%83%88/%E3%83%87%E3%83%BC%E3%82%BF.txt");
  });
});
