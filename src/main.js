import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

const form = document.querySelector('.form');
const input = document.querySelector('input[name="search-text"]');
const loadMoreBtn = document.querySelector('.btn');

let currentQuery = '';
let currentPage = 1;
const IMAGES_PER_PAGE = 15;

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = input.value.trim();

  if (!query) {
    iziToast.warning({
      message: 'Please enter a search query!',
      position: 'topCenter',
    });
    return;
  }

  currentQuery = query;
  currentPage = 1;

  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);

    if (data.hits.length === 0) {
      iziToast.error({
        message: 'Sorry, there are no images matching your search query. Please try again!',
        position: 'topCenter',
      });
      return;
    }

    createGallery(data.hits);

    if (data.totalHits > IMAGES_PER_PAGE) {
      showLoadMoreButton();
    }
  } catch (error) {
    iziToast.error({
      message: 'An error occurred while fetching data.',
      position: 'topCenter',
    });
  } finally {
    hideLoader();
    form.reset();
  }
});

loadMoreBtn.addEventListener('click', async () => {
  currentPage += 1;
  hideLoadMoreButton();
  showLoader();

  const startTime = Date.now();
  const MIN_LOADER_TIME = 2000;

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);

    if (data.hits.length === 0) {
      iziToast.info({
        message: 'No more images to load.',
        position: 'topCenter',
      });
      return;
    }

    createGallery(data.hits);

    const totalPages = Math.ceil(data.totalHits / IMAGES_PER_PAGE);
    if (currentPage < totalPages) {
      showLoadMoreButton();
    }

    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  } catch (error) {
    iziToast.error({
      message: 'An error occurred while loading more images.',
      position: 'topCenter',
    });
  } finally {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = MIN_LOADER_TIME - elapsedTime;

    if (remainingTime > 0) {
      setTimeout(() => {
        hideLoader();
      }, remainingTime);
    } else {
      hideLoader();
    }
  }
});
