export function debounce(callback, wait) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        return new Promise((resolve) => {
            timer = setTimeout(() => resolve(callback(...args)), wait);
        });
    };
}
//# sourceMappingURL=debounce.js.map