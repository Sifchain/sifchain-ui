import { switchEnv } from "./switchEnv";

it("switches the env when provided with an _env string", () => {
  const loc = {
    href: "/#/foo",
    search: "?_env=1",
  };
  const setEnv = jest.fn();
  switchEnv({ location: loc, cookies: { setEnv } });
  expect(setEnv).toHaveBeenCalledWith("1");
  expect(loc.href).toBe("/");
});

it("switches the env when provided with a second _env string", () => {
  const loc = {
    href: "/#/foo",
    search: "?_env=0",
  };
  const setEnv = jest.fn();
  switchEnv({ location: loc, cookies: { setEnv } });
  expect(setEnv).toHaveBeenCalledWith("0");
  expect(loc.href).toBe("/");
});

it("doesnt switch the env when no string is provided", () => {
  const loc = {
    href: "/#/foo",
    search: "",
  };
  const setEnv = jest.fn();
  switchEnv({ location: loc, cookies: { setEnv } });
  expect(setEnv).not.toHaveBeenCalled();
  expect(loc.href).toBe("/#/foo");
});

it("doesnt switch the env when provided with an _env string out of bounds of SifEnv", () => {
  const loc = {
    href: "/#/foo",
    search: "?_env=7",
  };
  const setEnv = jest.fn();
  switchEnv({ location: loc, cookies: { setEnv } });
  expect(setEnv).not.toHaveBeenCalled();
  expect(loc.href).toBe("/#/foo");
});

it("doesnt switch the env when provided with another _env string out of bounds of SifEnv", () => {
  const loc = {
    href: "/#/foo",
    search: "?_env=-1",
  };
  const setEnv = jest.fn();
  switchEnv({ location: loc, cookies: { setEnv } });
  expect(setEnv).not.toHaveBeenCalled();
  expect(loc.href).toBe("/#/foo");
});

it("doesnt react to garbage", () => {
  const loc = {
    href: "/#/foo",
    search: "?_env=akjshdlkasjhdlkj",
  };
  const setEnv = jest.fn();
  switchEnv({ location: loc, cookies: { setEnv } });
  expect(setEnv).not.toHaveBeenCalled();
  expect(loc.href).toBe("/#/foo");
});
