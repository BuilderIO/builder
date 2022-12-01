beforeEach(() => {
  jest.spyOn(global.Math, 'random').mockReturnValue(0.123456789);
});
afterEach(() => {
  jest.spyOn(global.Math, 'random').mockRestore();
});
