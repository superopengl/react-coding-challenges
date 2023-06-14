import React, { useState, useEffect } from 'react';
import DiscoverBlock from './DiscoverBlock/components/DiscoverBlock';
import '../styles/_discover.scss';
import { getCategories$, getFeaturedPlaylists$, getNewReleases$ } from '../../../common/utils/spotifyHttp';



const Discover = () => {

  const [newReleases, setNewReleases] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const sub$ = getNewReleases$().subscribe(setNewReleases);
    return () => sub$.unsubscribe();
  }, [])

  useEffect(() => {
    const sub$ = getFeaturedPlaylists$().subscribe(setPlaylists);
    return () => sub$.unsubscribe();
  }, [])

  useEffect(() => {
    const sub$ = getCategories$().subscribe(setCategories);
    return () => sub$.unsubscribe();
  }, [])

  return (
    <div className="discover">
      <DiscoverBlock text="RELEASED THIS WEEK" id="released" data={newReleases} />
      <DiscoverBlock text="FEATURED PLAYLISTS" id="featured" data={playlists} />
      <DiscoverBlock text="BROWSE" id="browse" data={categories} imagesKey="icons" />
    </div>
  );
}

export default Discover;
