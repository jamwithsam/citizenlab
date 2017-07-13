import {
  LOAD_COMMENTS_XLSX_ERROR, LOAD_COMMENTS_XLSX_REQUEST, LOAD_COMMENTS_XLSX_SUCCESS,
  LOAD_IDEAS_XLSX_ERROR, LOAD_IDEAS_XLSX_REQUEST, LOAD_IDEAS_XLSX_SUCCESS,
} from './constants';

export function loadIdeasXlsxRequest() {
  return {
    type: LOAD_IDEAS_XLSX_REQUEST,
  };
}

export function ideasXlsxLoaded() {
  return {
    type: LOAD_IDEAS_XLSX_SUCCESS,
  };
}

export function ideasXlsxLoadError() {
  return {
    type: LOAD_IDEAS_XLSX_ERROR,
  };
}

export function loadCommentsXlsxRequest() {
  return {
    type: LOAD_COMMENTS_XLSX_REQUEST,
  };
}

export function commentsXlsxLoaded() {
  return {
    type: LOAD_COMMENTS_XLSX_SUCCESS,
  };
}

export function commentsXlsxLoadError() {
  return {
    type: LOAD_COMMENTS_XLSX_ERROR,
  };
}
