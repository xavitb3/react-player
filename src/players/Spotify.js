import React, { Component } from 'react'

import { callPlayer, getSDK, parseStartTime } from '../utils'
import createSinglePlayer from '../singlePlayer'

const SDK_URL = 'https://sdk.scdn.co/spotify-player.js'
const SDK_GLOBAL = 'Spotify'
const SDK_GLOBAL_READY = 'onSpotifyWebPlaybackSDKReady'
const MATCH_URL = /^spotify:.+/

export class Spotify extends Component {
  static displayName = 'Spotify'
  static canPlay = url => MATCH_URL.test(url)

  callPlayer = callPlayer
  load (url, isReady) {

    getSDK(SDK_URL, SDK_GLOBAL, SDK_GLOBAL_READY).then(Spotify => {
      const access_token = 'BQBU--s5d0sSCORNOh9goRMNh1uiNBROf6R2SNyGnhhlJ3WUvM6KjqB5k01vzcEeZAJNJI331z1EMr3QW6fU8ACtNX_a1XgW-bjNzNHrv7KEas4eUIo4w505zVo2tXqIoQm7_14wdB6PiNAbxTbNgCdM--1EdBah9Bw'
      const player = new Spotify.Player({ name: "...", getOAuthToken: cb => { cb(access_token); } })
      const { id } = player._options


      // Error handling
      player.addListener('initialization_error', ({ message }) => { console.error(message); });
      player.addListener('authentication_error', ({ message }) => { console.error(message); });
      player.addListener('account_error', ({ message }) => { console.error(message); });
      player.addListener('playback_error', ({ message }) => { console.error(message); });

      // Playback status updates
      player.addListener('player_state_changed', state => { console.log(state); });

      // Ready
      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);

        window.fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
          method: 'PUT',
          body: JSON.stringify({ uris: [url] }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
          },
        });
      });

      // Connect to the player!
      player.connect();
    })

    // const { playsinline, controls, config, onError } = this.props
    // const id = url && url.match(MATCH_URL)[1]
    // if (isReady) {
    //   this.player.cueVideoById({
    //     videoId: id,
    //     startSeconds: parseStartTime(url)
    //   })
    //   return
    // }
    // getSDK(SDK_URL, SDK_GLOBAL, SDK_GLOBAL_READY, YT => YT.loaded).then(YT => {
    //   if (!this.container) return
    //   this.player = new YT.Player(this.container, {
    //     width: '100%',
    //     height: '100%',
    //     videoId: id,
    //     playerVars: {
    //       controls: controls ? 1 : 0,
    //       start: parseStartTime(url),
    //       origin: window.location.origin,
    //       playsinline: playsinline,
    //       ...config.youtube.playerVars
    //     },
    //     events: {
    //       onReady: this.props.onReady,
    //       onStateChange: this.onStateChange,
    //       onError: event => onError(event.data)
    //     }
    //   })
    // }, onError)
  }
  onStateChange = ({ data }) => {
    const { onPlay, onPause, onBuffer, onEnded, onReady } = this.props
    const { PLAYING, PAUSED, BUFFERING, ENDED, CUED } = window[SDK_GLOBAL].PlayerState
    if (data === PLAYING) onPlay()
    if (data === PAUSED) onPause()
    if (data === BUFFERING) onBuffer()
    if (data === ENDED) onEnded()
    if (data === CUED) onReady()
  }
  play () {
    this.callPlayer('playVideo')
  }
  pause () {
    this.callPlayer('pauseVideo')
  }
  stop () {
    if (!document.body.contains(this.callPlayer('getIframe'))) return
    this.callPlayer('stopVideo')
  }
  seekTo (amount) {
    this.callPlayer('seekTo', amount)
  }
  setVolume (fraction) {
    this.callPlayer('setVolume', fraction * 100)
  }
  setPlaybackRate (rate) {
    this.callPlayer('setPlaybackRate', rate)
  }
  getDuration () {
    return this.callPlayer('getDuration')
  }
  getCurrentTime () {
    return this.callPlayer('getCurrentTime')
  }
  getSecondsLoaded () {
    return this.callPlayer('getVideoLoadedFraction') * this.getDuration()
  }
  ref = container => {
    this.container = container
  }
  render () {
    const style = {
      width: '100%',
      height: '100%',
      ...this.props.style
    }
    return (
      <div style={style}>
        <div ref={this.ref} />
      </div>
    )
  }
}

export default createSinglePlayer(Spotify)
