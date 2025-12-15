/// <reference types="@rbxts/testez/globals" />

export = () => {
  describe("Sample tests", () => {
    it("adds numbers correctly", () => {
      const result = 1 + 1;
      expect(result).to.equal(2);
    });
  });
};
