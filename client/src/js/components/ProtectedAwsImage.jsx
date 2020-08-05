import React, { Component } from 'react';
import axios from 'axios';

export default class Image extends Component {
  constructor(props) {
    super(props)

    this.state = { message: '' };
  }

  formHandler = e => {
    e.preventDefault();
    this.setState({ message: 'Loading...' });
    const filename = document.querySelector('#filename').value;
    const generateGetUrl = 'http://localhost:4000/generate-get-url';
    const options = {
      params: {
        Key: filename,
        ContentType: 'image/jpeg'
      }
    };
    axios.get(generateGetUrl, options).then(res => {
      const { data: url } = res;
      this.setState({ url });
    });
  };

  handleImageLoaded = () => {
    this.setState({ message: 'Done' });
  };

  handleImageError = () => {
    this.setState({ message: 'Sorry, something went wrong. Please check if the remote file exists.' });
  };

  render() {
    const { url, message } = this.state;

    return (
      <React.Fragment>
        <h1>Retrieve Image from AWS S3 Bucket</h1>
        <form onSubmit={this.formHandler}>
          <label> Image name:</label>
          <input id='filename' />
          <p>
            <i>Image name must include the extension, eg. cat.jpeg</i>
          </p>
          <button>Load</button>
        </form>
        <p>{message}</p>
        <div className='preview-container'>
          {url && (
            <React.Fragment>
              <div className='preview'>
                <img
                  id='show-picture'
                  src={url}
                  alt='File stored in AWS S3'
                  onLoad={this.handleImageLoaded}
                  onError={this.handleImageError}
                />
              </div>
            </React.Fragment>
          )}
        </div>
      </React.Fragment>
    );
  }
}
