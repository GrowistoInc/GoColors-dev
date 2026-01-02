document.addEventListener("DOMContentLoaded", function () {
  var predictiveSearch2 =
    window.innerWidth < 768
      ? document.querySelector(".large-up-hide.mob-head.hide-mob-heade #Search-In-Modal")
      : document.querySelector(".small-hide.medium-hide.desk-search #Search-In-Modal");
  if (predictiveSearch2) {
    predictiveSearch2.addEventListener("click", function () {
      setTimeout(function () {
        window.addEventListener("scroll", function () {
          var autoCompleteWrapper = document.querySelector(".wizzy-autocomplete-wrapper");
          if (!autoCompleteWrapper) {return;}
          var predictiveSearch2 =
            window.innerWidth < 768
              ? document.querySelector( ".large-up-hide.mob-head.hide-mob-heade #Search-In-Modal" )
              : document.querySelector( ".small-hide.medium-hide.desk-search #Search-In-Modal" );
          if (predictiveSearch2) {
            var positionInfo = predictiveSearch2.getBoundingClientRect(),
            top = positionInfo.top + positionInfo.height;
            autoCompleteWrapper.style.setProperty("top", top + "px", "important");
          } else {}
        });
      }, 250);
    });
  } else {}
});
function findHaxCode(key) {
  const hex = window.colorMap.get(key);
  return hex && hex.trim() !== "" && hex !== "invalid" ? hex : key;
}
function findColorSwatchUrl(key) {
  const url = window.colorSwatchMap.get(key);
  return url;
}
function filtersApplied(str) {
  return str.includes("[]");
}
function checkWizzyfiltersApplied(url) {
  const hasCollections = url.includes("/collections");
  const hasAppliedFilters = url.includes("[]");
  return hasCollections && hasAppliedFilters;
}
function showDefaultCollectionGrid() {
  let wizzySearchResults = document.querySelector( "#wizzy-shopify-collection-page-wrapper .wizzy-search-results");
  let collectionDefaultProducts = document.querySelector(".wizzy-custom-collection" );
  let shopifySectionCollectionMain = document.querySelector("#ProductGridContainer");
  let wizzyPagination = document.querySelector(".wizzy-search-pagination");
  if (wizzySearchResults && shopifySectionCollectionMain && collectionDefaultProducts && wizzyPagination ) {
            collectionDefaultProducts.innerHTML = "";
            wizzySearchResults.innerHTML = "";
            wizzyPagination.style.display = "none";
            collectionDefaultProducts.appendChild(shopifySectionCollectionMain);
            shopifySectionCollectionMain.style.display = "block";
            let wizzyCollectionResult = document.querySelector("#wizzy-shopify-collection-page-wrapper");
            let wizzySkelotonCustom = document.querySelector(".wizzy-custom-grid-collection .wizzy-skeleton-product-filters");
            let wizzySortSkeleton = document.querySelector(".wizzy-skeleton-summary-and-sort");
            if (wizzyCollectionResult) { wizzyCollectionResult.style.display = "block"; }
            if (wizzySkelotonCustom) { wizzySkelotonCustom.style.display = "none";}
            if (wizzySortSkeleton) { wizzySortSkeleton.style.display = "none"; }
      }
}
window.isGridFiltersRendered = false;
function moveGridFilterToDefaultGrid() {
  const defaultProductCountPerPage = 16;
  const params = new URLSearchParams(window.location.search);
  const currentPage = parseInt(params.get("page") || "1", 10) - 1;
  const gridFilters = window.wizzyConfig.gridFilters.filters;
  var currentPageProductIndexRange = {
    start: currentPage * defaultProductCountPerPage + 1,
    end: (currentPage + 1) * defaultProductCountPerPage,
  };
  const filteredGridFilters = gridFilters.filter(function (item) {
    var webValue = window.innerWidth < 768 ? item.after.mobile : item.after.web;
    return ( webValue >= currentPageProductIndexRange.start && webValue <= currentPageProductIndexRange.end );
  });
    if (!window.isGridFiltersRendered) {
      filteredGridFilters.forEach((filteredGridFilter) => {
        getGridFilterBasedOnKey(filteredGridFilter.key, filteredGridFilter,defaultProductCountPerPage);
      });
      window.isGridFiltersRendered = true;
    }
}
function getGridFilterBasedOnKey(key, filteredGridFilter,defaultProductCountPerPage) {
  let wizzyFacetBlocks = document.querySelectorAll(
    ".wizzy-search-filters-left-wrapper .wizzy-facet-list-block .wizzy-filters-facet-block"
  );
  var gridBox;
  wizzyFacetBlocks.forEach((facetBlock) => {
    if (facetBlock.getAttribute("data-key") === key) {
      gridBox = facetBlock.cloneNode(true);
    }
  });
  if (gridBox) {
    gridBox.classList.add("wizzy-grid-filters-box");
    const gridBoxHead = gridBox.querySelector(".wizzy-facet-head");
    gridBox.querySelector('.facet-search-wrapper')?.remove();
    if (gridBoxHead) {
      gridBoxHead.setAttribute("title", filteredGridFilter.question);
      gridBoxHead.querySelector(".facet-head-title").textContent = filteredGridFilter.question;
    }
  }else{return;}
  try {
    const container = document.querySelector(".wizzy-custom-grid-collection ul");
    const productItems = container.querySelectorAll(".grid__item");
    const insertMap = {  [filteredGridFilter.after.web % defaultProductCountPerPage - 1]: "gridBox", };
    Object.keys(insertMap).forEach((indexStr) => {
      const index = parseInt(indexStr, 10);
      const target = productItems[index];
      if (target) {
        target.parentNode.insertBefore(gridBox, target.nextSibling);
      }
    });
  } catch (error) {}
}
function removeDefaultCollectionGrid() {
  let defaultCollectionGrid = document.querySelector( "#ProductGridContainer");
  let wizzyFilterSkeleton = document.querySelector("#ProductGridContainer .wizzy-skeleton-results-filters");
  let wizzySkeletonSort = document.querySelector(".wizzy-skeleton-summary-and-sort");
  let wizzySearchResult = document.querySelector( "#wizzy-shopify-collection-page-wrapper");
  if (defaultCollectionGrid && wizzyFilterSkeleton && wizzySkeletonSort && wizzySearchResult) {
    defaultCollectionGrid.style.display = "none";
    wizzyFilterSkeleton.style.display = "none";
    wizzySearchResult.style.display = "block";
    wizzySkeletonSort.innerHTML = "";
  }
}
window.onWizzyScriptLoaded = function () {
  window.wizzyConfig.events.registerEvent(
    window.wizzyConfig.events.allowedEvents.BEFORE_LAZY_INIT,
    function (data) {
      data.filters.configs.keepOpenedInMobileAfterApply = true;
      window.innerWidth < 768
        ? (data.common.lazyDOMConfig.searchInputIdentifiers[0] = {
            dom: ".large-up-hide.mob-head.hide-mob-heade #Search-In-Modal",
            type: "search",
          })
        : (data.common.lazyDOMConfig.searchInputIdentifiers[0] = {
            dom: ".small-hide.medium-hide.desk-search #Search-In-Modal",
            type: "search",
          });
      window.wizzyConfig.search.configs.pagination.type = 'numbered';
      return data;
    }
  );
  window.wizzyConfig.events.registerEvent(
    window.wizzyConfig.events.allowedEvents.BEFORE_SEARCH_EXECUTED,
    function (data) {
      const productModal = document.querySelector(".product-media-modal.media-modal" );
      if (productModal) { productModal.style.display = "none";}
      return data;
    }
  );
  window.wizzyConfig.events.registerEvent(
    window.wizzyConfig.events.allowedEvents.BEFORE_RENDER_RESULTS,
    function (data) {      
      data?.response?.payload?.result.forEach((product) => {
        if (!product.quickViewResource) { product.quickViewResource = product.url + "&view=wizzy-quickview"; }
      });
      return data;
    }
  );
  window.wizzyConfig.events.registerEvent(
    window.wizzyConfig.events.allowedEvents.BEFORE_FILTERS_EXECUTED,
    function (data) {
      data.filters.attributeFacetValuesLimit = 50;
      if (data.filters.type === "AUTOCOMPLETE_DEFAULT" && data.filters.sort[0].field == "relevance") {
        data.filters.sort.push({
          "field" : "product_wizzy-best-selling_sortOrder:float",
          "order" : "asc"
        })
      }
      return data;
    }
  );
  window.wizzyConfig.events.registerEvent(
    window.wizzyConfig.events.allowedEvents.BEFORE_SEARCH_EXECUTED,
    function (data) {
      data.attributeFacetValuesLimit = 50;
      return data;
    }
  );
  window.wizzyConfig.events.registerEvent(
    window.wizzyConfig.events.allowedEvents.BEFORE_AUTOCOMPLETE_EXECUTED,
    function (data) {
      data.attributeFacetValuesLimit = 50;
      return data;
    }
  );
  
  window.wizzyConfig.events.registerEvent(
    window.wizzyConfig.events.allowedEvents.VIEW_RENDERED,
    function (data) {
      if (checkWizzyfiltersApplied(window.location.href)) {
        removeDefaultCollectionGrid(); 
      } else {
        try { moveGridFilterToDefaultGrid(); showDefaultCollectionGrid(); }
        catch (error) {console.log(error); }
      }
      return data;
    }
  );
  window.wizzyConfig.events.registerEvent(
    window.wizzyConfig.events.allowedEvents.PRODUCTS_CACHED_RESULTS_RENDERED,
    function (data) {
      if (checkWizzyfiltersApplied(window.location.href)) {
        removeDefaultCollectionGrid(); 
      } else {
        try {
          moveGridFilterToDefaultGrid();
        showDefaultCollectionGrid(); 
        } catch (error) { console.log(error); }  
      }
      return data;
    }
  );

  window.wizzyConfig.events.registerEvent(
    window.wizzyConfig.events.allowedEvents.AFTER_PRODUCTS_TRANSFORMED,
    function (products) {
      products.forEach((product) => {
        // console.log("After products : ",product);?
        if (product.inStock === false) { product.soldOut = true;}
        if (product.discountPercentage != 0) {
         if (product.price > product.sellingPrice) { product.onSale = true;}
        }
        product?.attributes.forEach((attr) => {
          if (attr.id === "product_pfs:label_tags") {
            product.haveTag = true;
            const tagVal = attr.values[0].value[0];
            if (tagVal) { product.tagValue = tagVal;}
          } else if (attr.id == "product_badge_judgeme") {
            let divElement = document.createElement("div");
            divElement.innerHTML = attr.values[0].value[0];
            product.isOnCategory = window.wizzyConfig.common.isOnCategoryPage;
            var jdgmPrevBadge = divElement.querySelector(".jdgm-prev-badge");
            var numberOfReviews = jdgmPrevBadge.getAttribute( "data-number-of-reviews" );
            var jdgmReviewData = jdgmPrevBadge.getAttribute("data-average-rating" );
            if (numberOfReviews > 0) {
              product.numberOfReviews = numberOfReviews;
              product.jdgmReviewData = parseFloat(jdgmReviewData).toFixed(1);
            }
            product.reviewData = attr.values[0].value[0];
          }
        });
        if (product.price) {
          product.price = Number(product.price.replace(/,/g, "")).toFixed(0);
        }
        if (product.sellingPrice) {
          product.sellingPrice = Number(
            product.sellingPrice.replace(/,/g, "")
          ).toFixed(0);
        }
        if (!product.quickViewResource) {
          product.quickViewResource = product.url + "&view=wizzy-quickview";
        }
      });
      return products;
    }
  );
  window.wizzyConfig.events.registerEvent(
    window.wizzyConfig.events.allowedEvents.BEFORE_RENDER_RESULTS,
    function (payload) {
      // console.log("BEFORE_RENDER_RESULTS",payload);
      if (payload.api === "search" || payload.api === "filter") {
        var facets = payload.response.payload.facets;
        facets.forEach((facet) => {
          facet.key === "product_color_Color" &&
            facet.data.forEach((item) => {
              let color = findHaxCode(item.key);
              (item.isSwatch = !0),
                (item.isURLSwatch = true),
                (item.isVisualSwatch = !0),
                (item.swatchValue = color),
                (item.data = {
                  value: item.key,
                  swatch: {
                    type: "visual",
                    value: color,
                  },
                });
            });
        });
        for (let i = 0; i < facets.length; i++) {
          if (facets[i].key == "product_SIZE") {
              let sizes = facets[i].data;
              let temp = [ "6", "8", "10", "12", "14", "26", "28", "30", "32", "34", "36", "38","XS", "S", "M", "L", "XL", "SM", "LX", "2X", "2P", "3P", "4P", "3X", "4X", "FS"];            
              let newArray = [];
              let addedKeys = new Set();
              for (let j = 0; j < temp.length; j++) {
                  for (let k = 0; k < sizes.length; k++) {
                      if (sizes[k].key === temp[j]) {
                          newArray.push(sizes[k]);
                          addedKeys.add(sizes[k].key);
                      }
                  }
              }
              for (let k = 0; k < sizes.length; k++) {
                  if (!addedKeys.has(sizes[k].key)) {
                      newArray.push(sizes[k]);
                  }
              }
              facets[i].data = newArray;
          }
        }
      }
      return payload;
    }
  );
  window.wizzyConfig.events.registerEvent(
    window.wizzyConfig.events.allowedEvents.AFTER_WIZZY_API_RESPONDED,
    function (data) {
      if (data.api === "search" || data.api === "filter") {
        data?.response?.payload?.result.forEach((product) => {
          product.attributes?.forEach((attr) => {
            if (
              attr.id === "product_palatte_solids_PalatteSolids" &&
              attr.values?.[0]?.value?.[0]
            ) {
              const colorStr = attr.values[0].value[0];
              let colorSwatch = [];

              colorStr.split(",").forEach((pair) => {
                // const underscoreIndex = pair.indexOf("_");
                const pipeIndex = pair.indexOf("|");

                if (
                  pipeIndex !== -1
                ) {
                  const colorName = pair.slice(0, pipeIndex).trim();
                  // const hex = pair.slice(underscoreIndex + 1, pipeIndex).trim();
                  const swatchUrl = findColorSwatchUrl(colorName);
                  const handle = pair.slice(pipeIndex + 1).trim();
                  colorSwatch.push({
                    swatchUrl,
                    url: "https://gocolors.com/products/" + handle,
                  });
                }
              });
              if (colorSwatch.length > 4) {
                swatchCount = colorSwatch.length - 4;
                product.swatchCount = swatchCount;
                colorSwatch = colorSwatch.slice(0, 4);
              }
              product.colorSwatch = colorSwatch;
            }
            else if (
              attr.id === "product_palatte_prints_PalattePrints" &&
              attr.values?.[0]?.value?.[0]
            ) {
              const colorStr = attr.values[0].value[0];
              let colorSwatch = [];

              colorStr.split(",").forEach((pair) => {
                // const underscoreIndex = pair.indexOf("_");
                const pipeIndex = pair.indexOf("|");

                if (
                  pipeIndex !== -1
                ) {
                  const colorName = pair.slice(0, pipeIndex).trim();
                  // const hex = pair.slice(underscoreIndex + 1, pipeIndex).trim();
                  const swatchUrl = findColorSwatchUrl(colorName);
                  const handle = pair.slice(pipeIndex + 1).trim();
                  colorSwatch.push({
                    swatchUrl,
                    url: "https://gocolors.com/products/" + handle,
                  });
                }
              });
              if (colorSwatch.length > 4) {
                swatchCount = colorSwatch.length - 4;
                product.swatchCount = swatchCount;
                colorSwatch = colorSwatch.slice(0, 4);
              }
              product.colorSwatch = colorSwatch;
            }
            else if (
              attr.id === "product_palatte_metallic_PalatteMetallic" &&
              attr.values?.[0]?.value?.[0]
            ) {
              const colorStr = attr.values[0].value[0];
              let colorSwatch = [];

              colorStr.split(",").forEach((pair) => {
                // const underscoreIndex = pair.indexOf("_");
                const pipeIndex = pair.indexOf("|");

                if (
                  pipeIndex !== -1
                ) {
                  const colorName = pair.slice(0, pipeIndex).trim();
                  // const hex = pair.slice(underscoreIndex + 1, pipeIndex).trim();
                  const swatchUrl = findColorSwatchUrl(colorName);
                  const handle = pair.slice(pipeIndex + 1).trim();
                  colorSwatch.push({
                    swatchUrl,
                    url: "https://gocolors.com/products/" + handle,
                  });
                }
              });
              if (colorSwatch.length > 4) {
                swatchCount = colorSwatch.length - 4;
                product.swatchCount = swatchCount;
                colorSwatch = colorSwatch.slice(0, 4);
              }
              product.colorSwatch = colorSwatch;
            }
            else if (
              attr.id === "product_palatte_denims_PalatteDenims" &&
              attr.values?.[0]?.value?.[0]
            ) {
              const colorStr = attr.values[0].value[0];
              let colorSwatch = [];

              colorStr.split(",").forEach((pair) => {
                // const underscoreIndex = pair.indexOf("_");
                const pipeIndex = pair.indexOf("|");

                if (
                  pipeIndex !== -1
                ) {
                  const colorName = pair.slice(0, pipeIndex).trim();
                  // const hex = pair.slice(underscoreIndex + 1, pipeIndex).trim();
                  const swatchUrl = findColorSwatchUrl(colorName);
                  const handle = pair.slice(pipeIndex + 1).trim();
                  colorSwatch.push({
                    swatchUrl,
                    url: "https://gocolors.com/products/" + handle,
                  });
                }
              });
              if (colorSwatch.length > 4) {
                swatchCount = colorSwatch.length - 4;
                product.swatchCount = swatchCount;
                colorSwatch = colorSwatch.slice(0, 4);
              }
              product.colorSwatch = colorSwatch;
            }
            else if (
              attr.id === "product_palatte_cotton_PalatteCotton" &&
              attr.values?.[0]?.value?.[0]
            ) {
              const colorStr = attr.values[0].value[0];
              let colorSwatch = [];

              colorStr.split(",").forEach((pair) => {
                // const underscoreIndex = pair.indexOf("_");
                const pipeIndex = pair.indexOf("|");

                if (
                  pipeIndex !== -1
                ) {
                  const colorName = pair.slice(0, pipeIndex).trim();
                  // const hex = pair.slice(underscoreIndex + 1, pipeIndex).trim();
                  const swatchUrl = findColorSwatchUrl(colorName);
                  const handle = pair.slice(pipeIndex + 1).trim();
                  colorSwatch.push({
                    swatchUrl,
                    url: "https://gocolors.com/products/" + handle,
                  });
                }
              });
              if (colorSwatch.length > 4) {
                swatchCount = colorSwatch.length - 4;
                product.swatchCount = swatchCount;
                colorSwatch = colorSwatch.slice(0, 4);
              }
              product.colorSwatch = colorSwatch;
            }
          });
        });
      }
      return data;
    }
  );
};
