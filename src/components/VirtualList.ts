// Virtual List Component - For performance with large lists
import { LitElement, html, css } from 'lit'
import { property, query } from 'lit/decorators.js'

interface VirtualListItem {
  id: string | number
  data: any
}

export class VirtualList extends LitElement {
  @property({ type: Array }) items: VirtualListItem[] = []
  @property({ type: Number }) itemHeight: number = 120
  @property({ type: Number }) containerHeight: number = 600
  @property({ type: Function }) renderItem: ((item: VirtualListItem) => unknown) | null = null

  @query('.virtual-list-container') private container: HTMLElement | null = null

  private scrollTop = 0
  private visibleRange = { start: 0, end: 0 }

  static styles = css`
    .virtual-list-container {
      height: var(--container-height, 600px);
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
      will-change: scroll-position;
    }

    .virtual-list-content {
      position: relative;
      width: 100%;
    }

    .virtual-list-item {
      position: absolute;
      left: 0;
      right: 0;
      height: var(--item-height, 120px);
    }

    .virtual-list-spacer {
      position: absolute;
      left: 0;
      width: 100%;
      pointer-events: none;
    }
  `

  connectedCallback(): void {
    super.connectedCallback()
    this.updateVisibleRange()
  }

  render() {
    const { start, end } = this.visibleRange
    const visibleItems = this.items.slice(start, end)
    const offsetY = start * this.itemHeight

    return html`
      <div
        class="virtual-list-container"
        style="--container-height: ${this.containerHeight}px; --item-height: ${this.itemHeight}px"
        @scroll=${this.handleScroll}
      >
        <div class="virtual-list-content" style="height: ${this.items.length * this.itemHeight}px">
          ${visibleItems.map(
            (item, index) => html`
              <div
                class="virtual-list-item"
                style="top: ${(start + index) * this.itemHeight}px"
                key=${item.id}
              >
                ${this.renderItem?.(item)}
              </div>
            `
          )}
        </div>
      </div>
    `
  }

  private handleScroll(event: Event): void {
    this.scrollTop = (event.target as HTMLElement).scrollTop
    this.updateVisibleRange()
    this.requestUpdate()
  }

  private updateVisibleRange(): void {
    const start = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - 1)
    const end = Math.min(
      this.items.length,
      Math.ceil((this.scrollTop + this.containerHeight) / this.itemHeight) + 1
    )

    this.visibleRange = { start, end }
  }

  scrollToIndex(index: number): void {
    if (this.container) {
      this.container.scrollTop = Math.max(0, index * this.itemHeight - this.containerHeight / 2)
    }
  }
}

if (!customElements.get('virtual-list')) {
  customElements.define('virtual-list', VirtualList)
}
