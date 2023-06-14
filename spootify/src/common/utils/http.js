import * as axios from 'axios';
import { ajax } from 'rxjs/ajax';
import { interval, take, lastValueFrom, map } from 'rxjs';


const httpRequest$ = (url, method, headers, body) => {
  return ajax({
    url,
    method,
    crossDomain: true,
    headers,
    body,
  }).pipe(
    map(r => r.response)
  )
}

export const httpGet$ = (url, headers = null) => {
  return httpRequest$(url, 'GET', headers)
}

export const httpPost$ = (url, body, headers = null) => {
  return httpRequest$(url, 'POST', headers, body);
}