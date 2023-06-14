import { of, lastValueFrom, forkJoin } from 'rxjs';
import { toArray, delay, concatMap } from 'rxjs/operators';
import { getCategories$, getFeaturedPlaylists$, getNewReleases$ } from "./spotifyHttp";
import { httpGet$, httpPost$ } from "./http"

jest.mock('./http', () => {
  return {
    httpGet$: jest.fn(),
    httpPost$: jest.fn(),
  }
})

const sleep = async (seconds) => {
  await lastValueFrom(of(null).pipe(delay(seconds * 1000)));
}

describe('Spotify requests', () => {
  beforeEach(() => {
    httpGet$.mockReturnValue(of({
      albums: {
        items: [1, 2, 3]
      },
      playlists: {
        items: [4, 5, 6]
      },
      categories: {
        items: [7, 8, 9]
      }
    }))

    // Expriy as 1 second
    httpPost$.mockReturnValue(of({ access_token: 'fakeToken', expires_in: 1 }))
  })

  afterEach(() => {
    jest.clearAllMocks();
  })

  describe('Concurrent requests', () => {
    it('should request access token only once', async () => {
      // Make sure the token can expire
      await sleep(1);

      const source$ = forkJoin([
        getNewReleases$(),
        getFeaturedPlaylists$(),
        getCategories$(),
      ]);

      const result = await lastValueFrom(source$);

      const [albums, playlists, categories] = result;

      expect(albums).toEqual([1, 2, 3])
      expect(playlists).toEqual([4, 5, 6])
      expect(categories).toEqual([7, 8, 9])

      expect(httpPost$).toHaveBeenCalledTimes(1);
      expect(httpPost$).toHaveBeenCalledWith('https://accounts.spotify.com/api/token', expect.anything(), expect.anything());
      expect(httpGet$).toHaveBeenCalledTimes(3);
      expect(httpGet$).toHaveBeenCalledWith('https://api.spotify.com/v1/browse/new-releases', {
        Authorization: `Bearer fakeToken`,
      });
      expect(httpGet$).toHaveBeenCalledWith('https://api.spotify.com/v1/browse/featured-playlists', {
        Authorization: `Bearer fakeToken`,
      });
      expect(httpGet$).toHaveBeenCalledWith('https://api.spotify.com/v1/browse/categories', {
        Authorization: `Bearer fakeToken`,
      });
    })
  })

  describe('Sequencial requests', () => {
    it('should request access token only once', async () => {
      // Make sure the token can expire
      await sleep(1);

      const source$ = of(
        getNewReleases$(),
        getFeaturedPlaylists$(),
        getCategories$(),
      ).pipe(
        concatMap(s => s),
        toArray(),
      );

      const result = await lastValueFrom(source$);
      const [albums, playlists, categories] = result;

      expect(albums).toEqual([1, 2, 3])
      expect(playlists).toEqual([4, 5, 6])
      expect(categories).toEqual([7, 8, 9])

      expect(httpPost$).toHaveBeenCalledTimes(1);
      expect(httpPost$).toHaveBeenCalledWith('https://accounts.spotify.com/api/token', expect.anything(), expect.anything());
      expect(httpGet$).toHaveBeenCalledTimes(3);
      expect(httpGet$).toHaveBeenCalledWith('https://api.spotify.com/v1/browse/new-releases', {
        Authorization: `Bearer fakeToken`,
      });
      expect(httpGet$).toHaveBeenCalledWith('https://api.spotify.com/v1/browse/featured-playlists', {
        Authorization: `Bearer fakeToken`,
      });
      expect(httpGet$).toHaveBeenCalledWith('https://api.spotify.com/v1/browse/categories', {
        Authorization: `Bearer fakeToken`,
      });
    })
  })

  describe('Access token has expired', () => {
    it('should request access token again', async () => {
      // Make sure the token can expire
      await sleep(1);

      await lastValueFrom(getNewReleases$());
      expect(httpPost$).toHaveBeenCalledTimes(1);
      expect(httpGet$).toHaveBeenCalledTimes(1);

      // Sleep 0.5 second
      await lastValueFrom(of(null).pipe(delay(500)));

      // Token still alive
      await lastValueFrom(getNewReleases$());
      expect(httpPost$).toHaveBeenCalledTimes(1);
      expect(httpGet$).toHaveBeenCalledTimes(2);

      // Sleep 0.5 second
      await lastValueFrom(of(null).pipe(delay(500)));

      // Access token has expired. Should retrigger token API one more time.
      await lastValueFrom(getNewReleases$());
      expect(httpPost$).toHaveBeenCalledTimes(2);
      expect(httpGet$).toHaveBeenCalledTimes(3);

      expect(httpPost$).toHaveBeenNthCalledWith(1, 'https://accounts.spotify.com/api/token', expect.anything(), expect.anything());
      expect(httpPost$).toHaveBeenNthCalledWith(2, 'https://accounts.spotify.com/api/token', expect.anything(), expect.anything());
    })
  })
})

