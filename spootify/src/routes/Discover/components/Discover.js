import React, { Component } from 'react';
import DiscoverBlock from './DiscoverBlock/components/DiscoverBlock';
import '../styles/_discover.scss';
import { getCategories$, getFeaturedPlaylists$, getNewReleases$ } from '../../../common/utils/spotifyHttp';



const Discover = () => {

  const [newReleases, setNewReleases] = React.useState([]);
  const [playlists, setPlaylists] = React.useState([]);
  const [categories, setCategories] = React.useState([]);

  React.useEffect(() => {
    const sub$ = getNewReleases$().subscribe(setNewReleases);
    return () => sub$.unsubscribe();
  }, [])

  React.useEffect(() => {
    const sub$ = getFeaturedPlaylists$().subscribe(setPlaylists);
    return () => sub$.unsubscribe();
  }, [])

  React.useEffect(() => {
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
