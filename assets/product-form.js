if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.variantIdInput.disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.submitButton = this.querySelector('[type="submit"]');
        this.submitButtonText = this.submitButton.querySelector('span');

        if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');

        this.hideErrors = this.dataset.hideErrors === 'true';
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

        this.handleErrorMessage();
        const formData = new FormData(this.form);
        // if (formData.get('id') === '') {  
        //   $(".product-form__input.product-form__input--pill").addClass("size-button");
        // 	const variantErrorMessage = document.querySelector('.product-variant__error-message');
        // 	variantErrorMessage.textContent = " Please select a size";
        // 	const variantSelectsElement = document.querySelector('variant-selects');
        // 	if (variantErrorMessage) {
	      //       variantErrorMessage.scrollIntoView({
	      //         behavior: 'smooth',
	      //         block: 'center',
	      //       });
	      //     }
        // }
        this.submitButton.setAttribute('aria-disabled', true);
        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];
        
        if (this.cart) {
          formData.append(
            'sections',
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append('sections_url', window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                errors: response.errors || response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description);
              const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
              if (!soldOutMessage) return;
              this.submitButton.setAttribute('aria-disabled', true);
              this.submitButtonText.classList.add('hidden');
              soldOutMessage.classList.remove('hidden');
              this.error = true;
              return;
            } 
            else if (!this.cart) {
              window.location = window.routes.cart_url;
              return;
            }
            if (!this.error)
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                cartData: response,
              });
            
            this.error = false;
            const quickAddModal = this.closest('quick-add-modal');
            if (quickAddModal) {
              document.body.addEventListener(
                'modalClosed',
                () => {
                  setTimeout(() => {
                    this.cart.renderContents(response);
                  });
                },
                { once: true }
              );
              quickAddModal.hide(true);
            }
            else {
              this.cart.renderContents(response);
            }
            document.querySelector('.addtocartbtnDiv').classList.add('hidden');
            document.querySelector('.bagBtn').classList.remove('hidden');
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
            if (!this.error) this.submitButton.removeAttribute('aria-disabled');
            
          });
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;
        this.errorMessageWrapper =
        this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');
        const variantErrorMessage = document.querySelector('.product-variant__error-message');
        if (errorMessage) {
           $(".product-form__input.product-form__input--pill").addClass("size-button");
          if (errorMessage === "Required parameter missing or invalid: id" || errorMessage ===  'Cart Error' ) {
            variantErrorMessage.textContent = " Please select a size";
          } else {
            variantErrorMessage.textContent = errorMessage;
          }
          const variantSelectsElement = document.querySelector('variant-selects');
          if (variantErrorMessage) {
            variantErrorMessage.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
          if (this.errorMessage) {
            this.errorMessage.classList.add('new-error-class');
        }
          // setTimeout(function() {
          //   variantErrorMessage.textContent = ""
          // }, 4000);
        }              
      }

      toggleSubmitButton(disable = true, text) {
        if (disable) {
          this.submitButton.setAttribute('disabled', 'disabled');
          if (text) this.submitButtonText.textContent = text;
        } else {
          this.submitButton.removeAttribute('disabled');
          this.submitButtonText.textContent = window.variantStrings.addToCart;
        }
      }

      get variantIdInput() {
        return this.form.querySelector('[name=id]');
      }
    }
  );
}

