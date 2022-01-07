export default function handleTokenDropdownScrolling(isArrowDown: boolean, isArrowUp: boolean, highlightedTokenRect: DOMRect, tokensListContainerRect: DOMRect, tokenScrollContainer: HTMLElement,) {


  if (isArrowDown && tokensListContainerRect && tokensListContainerRect?.bottom <= highlightedTokenRect?.bottom) {
    // if the highlighted token is closer to viewport bottom than the tokens container, the scrollbar needs to adjust to bring highlighted token into view
    const bottomsDiff: number = highlightedTokenRect.bottom - tokensListContainerRect.bottom

    tokenScrollContainer?.scrollBy({ top: bottomsDiff, behavior: 'smooth' })
  } else if (isArrowUp && highlightedTokenRect && tokensListContainerRect && highlightedTokenRect.top < tokensListContainerRect.top) {
    // if the highlighted token is closer to viewport top than the tokens container, the  scrollbar needs to adjust to bring highlighted token into view
    const topsDiff: number = highlightedTokenRect.top - tokensListContainerRect?.top - 29
    tokenScrollContainer?.scrollBy({ top: topsDiff, behavior: 'smooth' })
  }
}
