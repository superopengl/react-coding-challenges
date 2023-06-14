import { httpGet, httpPost } from "./http"

const BASE_URL = `https://api.spotify.com/v1/browse`;
const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

let tokenExpireAt = null;
let currentToken = null;

const getAuthToken = async () => {
  const body = 'grant_type=client_credentials';

  const headers = {
    'Authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
    'Content-Type': 'application/x-www-form-urlencoded',
  }
  const responseBody = await httpPost('https://accounts.spotify.com/api/token', body, headers);
  return responseBody;
}

const getAccessToken = async () => {
  if(tokenExpireAt < Date.now()) {
    const {access_token, expires_in} = await getAuthToken();
    tokenExpireAt = Date.now() + expires_in * 1000;
    currentToken = access_token
  }

  return currentToken;
}

const getHeaders = async () => {
  const token = await getAccessToken();
  return {
    Authorization: `Bearer ${token}`,
  }
}

export const getNewReleases = async () => {
  const headers = await getHeaders();
  const result = await httpGet(`${BASE_URL}/new-releases`, headers);
  return result.albums.items;
}

export const getFeaturedPlaylists = async () => {
  const headers = await getHeaders();
  const result = await  httpGet(`${BASE_URL}/featured-playlists`, headers);
  return result.playlists.items;
}

export const getCategories = async () => {
  const headers = await getHeaders();
  const result = await  httpGet(`${BASE_URL}/categories`, headers);
  return result.categories.items;
}

