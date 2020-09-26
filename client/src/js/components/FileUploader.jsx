import React, { Component } from 'react';
import axios from 'axios';

export default class FileUploader extends Component {
  constructor(props) {
    super(props)

    this.state = {
      message:''
    };
  }

  getImage = e => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.setState({ file });
    }
  };

  uploadFile = e => {
    e.preventDefault();
    const { file } = this.state;
    this.setState({message:'Uploading...'})
    const contentType = file.type; // eg. image/jpeg or image/svg+xml

    const generatePutUrl = 'http://localhost:4000/generate-put-url';
    const options = {
      params: {
        Key: file.name,
        ContentType: contentType
      },
      headers: {
        'Content-Type': contentType
      }
    };

    axios.get(generatePutUrl, options).then(res => {
      axios
        .put("https://cors-anywhere.herokuapp.com/" + res.data.url, file, options)
        .then(res => {
          this.setState({message:'Upload Successful'})
          setTimeout(()=>{
            this.setState({message:''});
            document.querySelector('#upload-image').value='';
          }, 2000)
        })
        .catch(err => {
          this.setState({message:'Sorry, something went wrong'})
          console.log('err', err);
        });
    });
  };

  render() {
    return (
      <React.Fragment>
        <h1>Upload an image to AWS S3 bucket</h1>
        <input
          id='upload-image'
          type='file'
          accept='image/*'
          onChange={this.getImage}
        />
        <p>{this.state.message}</p>
        <form onSubmit={this.uploadFile}>
          <button id='file-upload-button'>Upload</button>
        </form>
      </React.Fragment>
    );
  }
}
