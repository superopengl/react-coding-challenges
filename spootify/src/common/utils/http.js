import * as axios from 'axios';
import { ajax } from 'rxjs/ajax';
import { interval, take, lastValueFrom } from 'rxjs';

export const httpGet = async (url, headers = null) => {
  const result = await lastValueFrom(ajax({
    url,
    method: 'GET',
    crossDomain: true,
    headers: {
      ...headers,
    },
  }))
  return result.response;
}

export const httpPost = async (url, body, headers = null) => {
  const result = await lastValueFrom(ajax({
    url,
    method: 'POST',
    crossDomain: true,
    headers: {
      ...headers,
    },
    body,
  }))

  return result.response;
}