import tailwindcssOutput from '../dist/tailwind-output.css?inline'
import Button from '@src/components/Button.vue'

const createAppWithoutShadow = (
  element: HTMLElement,
  component: any,
  name: string = 'app-root',
  position: 'top' | 'bottom' = 'top',
  props: Record<string, any> = {},
): void => {
  if (document.getElementById(name)) {
    return
  }

  const rootIntoApp = document.createElement('div')
  rootIntoApp.id = name

  if (position === 'top') {
    element.insertBefore(rootIntoApp, element.firstChild)
  } else {
    element.appendChild(rootIntoApp)
  }

  // Добавляем стили через <style>
  const style = document.createElement('style')
  style.textContent = tailwindcssOutput
  document.head.appendChild(style)

  const AppWithoutShadow = defineComponent({
    props: {
      ...Object.keys(props).reduce((acc: any, key) => {
        const propValue = props[key]
        let propType

        if (propValue === null) {
          propType = null
        } else if (Array.isArray(propValue)) {
          propType = Array
        } else {
          switch (typeof propValue) {
            case 'string':
              propType = String
              break
            case 'number':
              propType = Number
              break
            case 'boolean':
              propType = Boolean
              break
            case 'object':
            case 'function':
            case 'symbol':
            case 'bigint':
            case 'undefined':
            default:
              propType = Object
              break
          }
        }

        acc[key] = {
          type: propType,
          default: propValue,
        }
        return acc
      }, {}),
    },
    render() {
      return h(component, {
        ...this.$props,
      })
    },
  })

  createApp(AppWithoutShadow).mount(rootIntoApp)
}

// Функция для обработки страницы предмета
const handleButtonPage = () => {
  const secondaryElement = document.querySelector<HTMLElement>('#largeiteminfo_item_actions')
  if (secondaryElement && !secondaryElement.querySelector('#app-root-button')) {
    const link = document.querySelector<HTMLAnchorElement>('.btn_small.btn_grey_white_innerfade')
    if (link) {
      const href = link.getAttribute('href')
      createAppWithoutShadow(secondaryElement, Button, 'app-root-button', 'top', { href })
    }
  }
}

const handleButtonsPage = () => {
  const listingRows = document.querySelectorAll<HTMLElement>('.market_listing_row:not(.js-button-processed)')

  listingRows.forEach(row => {
    const actionCell = row.querySelector<HTMLElement>('.market_listing_row_action')
    if (!actionCell) return

    const inspectLink = actionCell.querySelector<HTMLAnchorElement>('a[href^="steam://"]')
    if (!inspectLink) return

    // Помечаем строку как обработанную
    row.classList.add('js-button-processed')

    // Создаем контейнер для кнопки
    const buttonContainer = document.createElement('div')
    buttonContainer.className = 'custom-button-container'
    buttonContainer.style.marginBottom = '4px'

    // Вставляем перед ссылкой инспектирования
    actionCell.insertBefore(buttonContainer, inspectLink)

    createAppWithoutShadow(buttonContainer, Button, `app-root-button-${row.id}`, 'top', {
      href: inspectLink.getAttribute('href'),
      listingId: row.id.replace('listing_', ''),
    })
  })
}

// Улучшенный наблюдатель
const createObserver = () => {
  const observer = new MutationObserver(mutations => {
    if (window.location.href.includes('steamcommunity.com/market/listings')) {
      // Проверяем изменения в основном контейнере
      const resultsContainer = document.querySelector('#searchResultsRows')
      if (resultsContainer) {
        handleButtonsPage()
      }
      handleButtonPage()
    }
  })

  // Наблюдаем за изменениями в body и контейнере результатов
  const targetNode = document.querySelector('body')
  if (targetNode) {
    observer.observe(targetNode, {
      childList: true,
      subtree: true,
    })
  }

  // Дополнительно наблюдаем за контейнером пагинации
  const paginationContainer = document.querySelector('.market_paging_summary')
  if (paginationContainer) {
    observer.observe(paginationContainer, {
      childList: true,
      subtree: true,
    })
  }
}

// Инициализация
if (window.location.href.includes('steamcommunity.com/market/listings')) {
  // Первоначальная загрузка
  handleButtonsPage()
  handleButtonPage()

  // Создаем наблюдатель
  createObserver()

  // Дополнительный обработчик для AJAX-загрузки
  document.addEventListener('DOMNodeInserted', e => {
    if (e.target instanceof HTMLElement && e.target.classList.contains('market_listing_row')) {
      handleButtonsPage()
    }
  })
}
