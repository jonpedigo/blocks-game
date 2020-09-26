import React, { Component } from 'react';
import axios from 'axios';

export default class ImageSelect extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { onSelect } = this.props;

    return (
      <div className="ImageSelect">
        {Object.keys(GAME.library.images).map((imageName) => {
          const image = GAME.library.images[imageName]
          if(image.url) {
            return <img className="ImageSelect__image" onClick={() => onSelect(image)} src={image.url}/>
          }
        })}
      </div>
    );
  }
}
