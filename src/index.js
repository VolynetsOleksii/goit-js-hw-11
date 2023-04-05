import './css/styles.css';
import { pixabaySerch } from './js/pixabaySerch.js';
import { markupCreate } from './js/markup.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
  form: document.querySelector('.search-form'),
  input: document.querySelector('.search-form input'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};
const simpleLightBox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
  captionsData: 'alt',
});

let page = 1;
let totalAmount = 0;
let searchInput;
refs.form.addEventListener('submit', onSearchBtnClick);

async function onSearchBtnClick(e) {
  e.preventDefault();
  simpleLightBox.refresh();
  searchInput = refs.input.value.trim();

  if (searchInput !== '') {
    clearMarkup();
    const {
      data: { hits, totalHits },
    } = await pixabaySerch(searchInput, page);
    totalAmount = totalHits;
    if (totalAmount === 0) {
      refs.loadMoreBtn.classList.add('visually-hidden');
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    Notify.success(`Hooray! We found ${totalAmount} images.`);

    refreshGallery(hits);
  } else {
    refs.loadMoreBtn.classList.add('visually-hidden');
    clearMarkup();
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }
}

function clearMarkup() {
  refs.gallery.innerHTML = '';
}

refs.loadMoreBtn.addEventListener('click', onLoadMoreBtnClick);
async function onLoadMoreBtnClick() {
  page += 1;
  totalAmount -= 40;
  const {
    data: { hits },
  } = await pixabaySerch(searchInput, page);
  refreshGallery(hits);
  pageScroll();
}

function refreshGallery(data) {
  if (totalAmount > 40) {
    refs.loadMoreBtn.classList.remove('visually-hidden');
  }
  else {
    refs.loadMoreBtn.classList.add('visually-hidden');
    Notify.info("We're sorry, but you've reached the end of search results.");
  }
  const markup = markupCreate(data);

  refs.gallery.insertAdjacentHTML('beforeend', markup);
  simpleLightBox.refresh();
}

function pageScroll() {
    const { height: cardHeight } = document
  .querySelector(".gallery")
  .firstElementChild.getBoundingClientRect();

window.scrollBy({
  top: cardHeight * 2,
  behavior: "smooth",
});
}
