class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    this.querySelector('#CartDrawer-Overlay').addEventListener('click', this.close.bind(this));
    this.setHeaderCartIconAccessibility();
  }
  setHeaderCartIconAccessibility() {
    const cartLink = document.querySelector('#cart-icon-bubble');
    if (!cartLink) return;

    cartLink.setAttribute('role', 'button');
    cartLink.setAttribute('aria-haspopup', 'dialog');
    cartLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.open(cartLink);
    });
    cartLink.addEventListener('keydown', (event) => {
      if (event.code.toUpperCase() === 'SPACE') {
        event.preventDefault();
        this.open(cartLink);
      }
    });
  }
  open(triggeredBy) {
    if (triggeredBy) this.setActiveElement(triggeredBy);
    const cartDrawerNote = this.querySelector('[id^="Details-"] summary');
    if (cartDrawerNote && !cartDrawerNote.hasAttribute('role')) this.setSummaryAccessibility(cartDrawerNote);
    setTimeout(() => {
      this.classList.add('animate', 'active');
    });

    this.addEventListener(
      'transitionend',
      () => {
        const containerToTrapFocusOn = this.classList.contains('is-empty')
          ? this.querySelector('.drawer__inner-empty')
          : document.getElementById('CartDrawer');
        const focusElement = this.querySelector('.drawer__inner') || this.querySelector('.drawer__close');
        trapFocus(containerToTrapFocusOn, focusElement);
      },
      { once: true }
    );

    document.body.classList.add('overflow-hidden');
  }
  close() {
    this.classList.remove('active');
    removeTrapFocus(this.activeElement);
    document.body.classList.remove('overflow-hidden');
  }
  setSummaryAccessibility(cartDrawerNote) {
    cartDrawerNote.setAttribute('role', 'button');
    cartDrawerNote.setAttribute('aria-expanded', 'false');
    if (cartDrawerNote.nextElementSibling.getAttribute('id')) { cartDrawerNote.setAttribute('aria-controls', cartDrawerNote.nextElementSibling.id);}
    cartDrawerNote.addEventListener('click', (event) => { event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));});
    cartDrawerNote.parentElement.addEventListener('keyup', onKeyUpEscape);
  }
  renderContents(parsedState) {
    this.querySelector('.drawer__inner').classList.contains('is-empty') &&
    this.querySelector('.drawer__inner').classList.remove('is-empty');
    this.productId = parsedState.id;
    this.getSectionsToRender().forEach((section) => {
      const sectionElement = section.selector
        ? document.querySelector(section.selector)
        : document.getElementById(section.id);
      if (!sectionElement) return;
      sectionElement.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
    });
    setTimeout(() => {
      this.querySelector('#CartDrawer-Overlay').addEventListener('click', this.close.bind(this));
      //this.open();
      setTimeout(function () {initializeSwiperForCart();}, 2000);
    });
  }
  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }
  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer',
        selector: '#CartDrawer',
      },
      {
        id: 'cart-icon-bubble',
      },
      {
        id: 'cart-footer-icon-bubble',
      },
    ];
  }
  getSectionDOM(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector);
  }
  setActiveElement(element) { this.activeElement = element; }
}
customElements.define('cart-drawer', CartDrawer);
class CartDrawerItems extends CartItems {
  getSectionsToRender() {
    return [
      {
        id: 'CartDrawer',
        section: 'cart-drawer',
        selector: '.drawer__inner',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section',
      },
      {
        id: 'cart-footer-icon-bubble',
        section: 'cart-footer-icon-bubble',
        selector: '.shopify-section',
      },
    ];
  }
}
customElements.define('cart-drawer-items', CartDrawerItems);
function cartVariantUpdate(selectedElement) {
    const selectedVariantId = selectedElement.value;
    const lineQty = selectedElement.closest('.cart-item').querySelector('.quantity__input').value;
    updateCartWithVariant(selectedVariantId, lineQty, selectedElement);
}
function updateCartWithVariant(variantId, qty, selectedElementnew) {  
  const removeButton = selectedElementnew.closest('.cart-item').querySelector('cart-remove-button');
    if (removeButton) {
        console.log("Found the closest remove button:", removeButton);
        removeButton.click();
        setTimeout(function(){
          $('cart-drawer').removeClass('is-empty');
          $('cart-drawer-items').removeClass('is-empty');
        }, 200);
    } else {
        console.log("No closest cart-remove-button found.");
    }
  setTimeout(function(){
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/cart/add.js", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    const data = JSON.stringify({
        id: variantId,
        quantity: qty
    });
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            $.getJSON('/cart.json').then(cart => {
                fetch('/cart?view=item').then(response => response.text())
                    .then(text => {
                        const sectionInnerHTML = new DOMParser().parseFromString(text, 'text/html');
                        const cartFormInnerHTML = sectionInnerHTML.getElementById('CartDrawer').innerHTML;
                        $('#CartDrawer').html(cartFormInnerHTML);
                        $('cart-drawer').removeClass('is-empty');
                        $('cart-drawer-items').removeClass('is-empty');
                        if ($('#cart-icon-bubble .cart-count-bubble').length === 0) {
                            const cartNumber = document.createElement('div');
                            cartNumber.className = 'cart-count-bubble';
                            cartNumber.innerHTML = `
                                <span aria-hidden="true">${cart.item_count}</span>
                                <span class="visually-hidden">${cart.item_count} items</span>
                            `;
                            $('#cart-icon-bubble').append(cartNumber);
                        } else {
                            $('.cart-count-bubble span[aria-hidden="true"]').each((_, count) => $(count).text(cart.item_count));
                        }
                        $('#cart-icon-bubble')[0].click();
                        $('#CartDrawer-Overlay').on('click', () => {
                            $('cart-drawer').removeClass('active');
                            $('body').removeClass('overflow-hidden');
                        });
                       setTimeout(function () {
                        initializeSwiperForCart();
                      }, 200);
                    });
            });
        } else if (xhr.readyState === 4) {
            console.error("Failed to add item to cart:", xhr.status, xhr.responseText);
        }
    };
    xhr.send(data);
      }, 500);
}