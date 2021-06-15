# Sifchain Styles

- [ ] Maybe link Figma

## Storybook

We use Storybook to develop our components in isolation.

### Getting Started

You can simply run;

```
yarn storybook
```

to get started.

## Design Language

> A design language or design vocabulary is an overarching scheme or style that guides the design of a complement of products or architectural settings.

As developers, we should work in tandem with our designers.

This Design Language doc is an attempt to merge our programmatic styles with our designers vision.

It is very fluid process, so any bullet point below should just be treated as a guideline.

### Goals: 

- Make frontend code cleaner by agreeing on sensible semantics e.g. We should be able to communicate what a SubHeading is instead of describing it as 18px/bold etc
- Communication - Increase speed of our product chats by having known and agreed upon rudimentary elements/components
- The labelled designs in Figma should pretty much be mapped to the code directly e.g. Figma designed component called Tooltip should map to our codified Tooltip component and be easily viewed in Storybook
- Reduce wherever possible any absolute values in components. Most things should have predefined values that we can draw on e.g. $color, $margin-space, $border-radius, $animation-speed. Such that we can change the feel of the entire app by just editing base values in our variables.scss file.

### Examples

- https://design.theguardian.com/
- Material design

### App Personality: 

- Trust
- Accurate
- Convenient
- Journey (Using poetic license here, we should maximise on our brand to build a loyal customer/fan base)

### Colors: 

- When building components, where semantically possible we should use named colors e.g.  color: $danger, $success, $primary, $brand etc
- Keep color variations to an absolute minimum. E.g. have one red colour, then we need variations for an active red, disabled red, hovered red etc. - - - Depending on how we treat our palette, this can be done by just adjusting contracts/brightness etc. e.g. If our danger red was just #FF0000 then our disabled red could just be `lighten(#FF0000, 40%)` such that we maintain a small amount of base calculations and rely on color-math to derive the other states
- Make sure our Figma board always has REAL color values, don’t rely on things like opacity to choose color, otherwise it gets messy.
- Limit to 4-6 base colors with 3-4 modified variations through using color-calcs such as brightness/contrast

### Shadows/Depth/Elevation

- No clear notes here, request for comments.
- Material design goes into this facet -> https://material.io/design/environment/elevation.html
- Limit to 3-6 variations

### Typography 

- In my opinion we should never be writing custom font settings for components. They should inherit from a small mixture of base typographic settings. E.g. Heading, SubHeading, Label, Input, Copy/Body, Accent. The design in Figma should also follow this rule. Anytime you find yourself manually shifting a pixel size for a font you need to figure out why.
- When working with finance we should make list of numbers intuitively easy to scan with the eye
- Limit to 4-6 variations

### Spacing

- To keep everything aligned a designer will usually have a few predefined measurements.
- We should add this to our frontend variables. (margin and padding)
- Limit to 3-4 variations e.g. (12px, 24px, 48px)

### Curves/Rounded Borders: 

- Limit to 3-4 variations e.g. (2px, 4px, 8px)

### Animation: 

- Everything interactable needs to be reactive to user feedback (hover states, mouse-down etc)
- Use loaders/spinners/transitions to lower perceived loading time -> https://developer.mozilla.org/en-US/docs/Learn/Performance/Perceived_performance
- Speed - Limit to 2-3 variations (slow, med, fast) (150ms, 300ms, 600ms)
- Style - Limit to 2-3 e.g. fade, in, out
