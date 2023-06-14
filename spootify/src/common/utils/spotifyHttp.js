import { httpGet$, httpPost$ } from "./http"
import { of } from 'rxjs';
import { map, switchMap, share, finalize } from 'rxjs/operators';

const BASE_URL = `https://api.spotify.com/v1/browse`;
const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

let tokenExpireAt = null;
let currentToken = null;
let authTokenSource$ = null;

const getAuthToken$ = () => {
  const body = 'grant_type=client_credentials';

  const headers = {
    'Authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
    'Content-Type': 'application/x-www-form-urlencoded',
  }
  return httpPost$('https://accounts.spotify.com/api/token', body, headers);
}

const getAccessToken$ = () => {
  const now = Date.now();
  if (!currentToken || tokenExpireAt < now) {
    if (!authTokenSource$) {
      authTokenSource$ = getAuthToken$().pipe(
        map(({ access_token, expires_in }) => {
          tokenExpireAt = now + expires_in * 1000;
          currentToken = access_token
          return currentToken;
        }),
        finalize(() => authTokenSource$ = null),
        share()
      )
    }

    return authTokenSource$;
  }
  return of(currentToken);
};

const getHeaders$ = () => {
  return getAccessToken$()
    .pipe(
      map(token => ({
        Authorization: `Bearer ${token}`,
      }))
    )
}

export const getNewReleases$ = () => {
  return getHeaders$().pipe(
    switchMap(headers => httpGet$(`${BASE_URL}/new-releases`, headers)),
    map(r => r.albums.items)
  )
}

export const getFeaturedPlaylists$ = () => {
  return getHeaders$().pipe(
    switchMap(headers => httpGet$(`${BASE_URL}/featured-playlists`, headers)),
    map(r => r.playlists.items)
  )
}

export const getCategories$ = () => {
  return getHeaders$().pipe(
    switchMap(headers => httpGet$(`${BASE_URL}/categories`, headers)),
    map(r => r.categories.items)
  )
}

