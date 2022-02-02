export class DomUtils {

    static isOrContains(selector: string, element: HTMLElement): boolean {
        return element.id === selector.substring(1)
            || element.classList.contains(selector.substring(1))
            || document.querySelector(selector).contains(element);
    }

    static notIsOrContains(selector: string, element: HTMLElement): boolean {
        return !this.isOrContains(selector, element);
    }

    static isOrHasParent(selector: string, element: HTMLElement): boolean {
        return element.id === selector.substring(1)
            || element.classList.contains(selector.substring(1))
            || !!element.parentElement && this.isOrHasParent(selector, element.parentElement);
    }

    static notIsOrHasParent(selector: string, element: HTMLElement): boolean {
        return !this.isOrHasParent(selector, element);
    }

}