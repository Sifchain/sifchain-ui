# Style and Principles

Here are some notes about programming style.

# Principles of programming in practice

People talk about the [SOLID](https://en.wikipedia.org/wiki/SOLID) principles - generally it boils down to some key points:

1. Stuff that **changes** together should live together
1. **Encapsulate** things with a well thought out interface
1. Create dynamic systems by **substituting** components that comply with your interface
1. Interfaces should only specify what a component **actually needs**
1. Extend functionality with either composition or **inversion of control** (aka **injection**)

Most of this is pretty straight forward to understand but some trip up on IoC. Incase it is unclear this is how you might extend a function with inversion of control

```ts
function runWorkflow(afterWorkflow?: () => void) {
  runMainFunction();

  // The caller can define their own function to run here
  if (afterWorkflow) {
    afterWorkflow();
  }
}
```

# Dependency injection

A trick that will make your code design much much better and far more testable is utilizing dependeny injection.

### The following is hard to test

Say we have a function:

```ts
import Cookie from "js-cookie";

export function setEnv(env: string) {
  Cookie.set("mycookie", env.toUpperCase());
}
```

This is actually quite hard to test as it sets state on the browser. We would need to mock `js-cookie` or simulate a browser...

### Pass your dependencies to your functions

A better way to manage this is to allow overrides with input arguments like so:

```ts
import Cookie from "js-cookie";

type Cookie = typeof Cookie;

type SetEnvArgs = { env: string; cookie: Cookie };

export function setEnv({ env, cookie = Cookie }: SetEnvArgs) {
  cookie.set("mycookie", env.toUpperCase());
}
```

However this means we need to mock the entire API of `Cookie` in our test!

### Use `Pick<T,K>` to select the API you actually use.

A trick to avoid this is to use Pick on all our dependency types to make it so we only need to mock what we need to.

```ts
import Cookie from "js-cookie";

type Cookie = typeof Cookie;

type SetEnvArgs = { env: string; cookie: Pick<Cookie, "set"> };

export function setEnv({ env, cookie = Cookie }: SetEnvArgs) {
  cookie.set("mycookie", env.toUpperCase());
}
```

Now we can easily test our function!!

```ts
import { setEnv } from "./setEnv";
it("should set the env as a cookie", () => {
  const cookie = { set: jest.fn() };
  setEnv({ env: "foo", cookie });
  expect(cookie.set).toHaveBeenCalledWith("foo");
});
```

Notice that by using `Pick` and injecting all our dependencies we are complying with the principles:

- Encapsulate stuff using a well thought out interface
- Interfaces should only require what they actually need.
- Enable dynamic substitution (say for testing)
- Utilize inversion of control

The only thing we have not seen here directly is the single responsability principle.

# Avoiding `this`

Often in Javascript when we use `this` in a function it is not clear on how to use it or using it leads to a dependency overhead. Eg.

```ts
export class Cow {
  sound: string;
  constructor(sound: string) {
    this.sound = sound;
  }
  say() {
    return this.sound;
  }
}
```

```ts
const c: Cow = new Cow("moo");

const { say } = c;

// We are 'dependent' on the this from the Cow class
console.log(say()); // this is undefined
```

We can get more utility by forgoing inheritence and using the module pattern. Caveat being we need to export a shadow type for our function and we get class like type effects but without the `this` problem.

```ts
// ./Cow.ts
export function Cow(sound: string) {
  return {
    say() {
      return sound;
    },
  };
}
export type Cow = ReturnType<typeof Cow>;
```

```ts
import { Cow } from "./Cow";

const c: Cow = Cow("moo");

const { say } = c;

console.log(say()); // moo
```

Inheritence is always a bad idea so there is no drawback to using this pattern.

# Test Driven Development

By writing your tests first you will begin to apply good code design without even realising it. If something is hard to test you probably have poor code design and should try to modularize it. So if you save your code design until after you have written a set of unit tests your code will be more composable with a better and more modular API and better separation of concerns by default. I normally start a feature in a test file in core and then move it out to it's own file before checking in progress. It is slower to refactor without tests so writing tests as you write your code will actually mean you get your feature out quicker with better design and with fewer bugs.

Sometimes you need to experiment with a design to prototype a feature to see if something is possible. This could be kept on a separate branch as a sketch to influence the final implementation. That is fine. A good practice in this case would be to open the branch on github and then in your editor on a fresh branch write a failing testcases for your idea as you create each module. You will probably find you have made it hard to test or not modular enough and will need to tweak your design.

# Clean Architecture

If we follow the principles above and extend it to our architecture we will end up with what is generally known as the Clean Architecture.

Here we focus on `Usecases` as the place where we store all the business logic in our system. We store all the logic here as it is the key place for testing that logic. We then inject all the services that those Usecases need to manage the state of the system.

See [architecture](architecture.md) docs for how we use the clean architecture.

# Continuous Integration and feature flags

Basically we should not shy away from delivering PRs that are simply partial features. As we set up new features we should dark launch them. Perhaps start off an interface component in storybook. Start off a set of tests and a function that passes those tests in core. It is not finished but tests are passing and the day is done. Throw up a PR and assuming there are no glaring mistakes, tests all pass and there are no security holes your PR should be merged with some feedback for you to address as you move forward. This only works if every dark feature is well unit tested.

The smaller the amount of changes in a PR the better. If you are refactoring something pair with another team mate and get them to review your small PRs and tag team.
