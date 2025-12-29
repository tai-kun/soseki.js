import { describe, test } from "vitest";
import unreachable from "../../src/core/_unreachable.js";
import { UnreachableError } from "../../src/core/errors.js";

describe("引数なしで呼び出した場合", () => {
  test("UnreachableError がスローされる", ({ expect }) => {
    // Arrange
    const act = () => {
      unreachable();
    };

    // Act & Assert
    expect(act).toThrow(UnreachableError);
  });
});

describe("switch 文の網羅性チェックなどで予期しない値が渡された場合", () => {
  test("渡された値を含む UnreachableError がスローされる", ({ expect }) => {
    // Arrange
    type Shape = "circle" | "square";
    const shape = "triangle" as unknown as Shape;

    // Act
    const act = () => {
      switch (shape) {
        case "circle":
          return 1;
        case "square":
          return 2;
        default:
          return unreachable(shape);
      }
    };

    // Assert
    expect(act).toThrow(UnreachableError);
  });
});
