export default function handleTokenDropdownScrolling(isArrowDown: boolean, isArrowUp: boolean, highlightedToken: HTMLElement | null, nextHighlightedToken: HTMLElement, firstTokenInList: HTMLElement, tokensListContainerRect: DOMRect, tokenScrollContainer: HTMLElement, nextHighlightedTokenRect: DOMRect | undefined) {
  if (!highlightedToken) {
    // if user keys down from the input text field, highlight the first item in tne symbols
    firstTokenInList?.classList.add('bg-gray-base')
    return
  } else {
    // highlight the next symbol in list after user keys up or down
    nextHighlightedToken?.classList.add('bg-gray-base')
    highlightedToken.classList.remove('bg-gray-base')
  }

  if (isArrowDown && nextHighlightedTokenRect && tokensListContainerRect && tokensListContainerRect?.bottom <= nextHighlightedTokenRect?.bottom) {
    // if the highlighted token is closer to viewport bottom than the tokens container, the scrollbar needs to adjust to bring highlighted token into view
    const bottomsDiff: number = nextHighlightedTokenRect.bottom - tokensListContainerRect.bottom

    tokenScrollContainer?.scrollBy({ top: bottomsDiff, behavior: 'smooth' })
  } else if (isArrowUp && nextHighlightedTokenRect && tokensListContainerRect && nextHighlightedTokenRect.top < tokensListContainerRect.top) {
    // if the highlighted token is closer to viewport top than the tokens container, the  scrollbar needs to adjust to bring highlighted token into view
    const topsDiff: number = nextHighlightedTokenRect.top - tokensListContainerRect?.top - 29
    tokenScrollContainer?.scrollBy({ top: topsDiff, behavior: 'smooth' })
  }
}
