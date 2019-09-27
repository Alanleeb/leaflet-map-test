import React, { Component } from 'react';
import Joi from 'joi';
import L from 'leaflet';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, Button, CardTitle, CardText, Form, FormGroup, Label, Input } from 'reactstrap';

import './App.css';


var myIcon = L.icon({
  iconUrl: 'http://pixsector.com/cache/c95a2c53/av56723fbd0880d93eefa.png',
  iconSize: [41,41],
  iconAnchor: [20.5, 41],
  popupAnchor: [0,-35],
});

const schema = Joi.object().keys({
  produce: Joi.string().min(1).max(100).required(),
  message: Joi.string().min(1).max(500).required(),
});

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api/v1/messages' : 'production-url-here'

class App extends Component {
  state = {
    location: {
    lat: 51.505,
    lng: -0.09,
  },
  haveUsersLocation: false,
    zoom: 2,
    userMessage: {
      produce: '',
      message: ''
    },
    messages: []
  }
  
    componentDidMount() {
      fetch(API_URL)
      .then(res => res.json())
      .then(messages => {
        this.setState({
          messages
        })
      })
      navigator.geolocation.getCurrentPosition((position) => {
        this.setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          haveUsersLocation: true,
          zoom: 13
        });
      }, () => {
        fetch('https://ipapi.co/json')
        .then(res => res.json())
        .then(location => {
          console.log(location);
          this.setState({
            location: {
              lat: location.latitude,
              lng: location.longitude
            },
            haveUsersLocation: true,
            zoom: 13
          });
        });
      });
    }

    formIsValid = () => {
      const userMessage = {
        produce: this.state.userMessage.produce,
        message: this.state.userMessage.message
      };
      const result = Joi.validate(userMessage, schema);

      return !result.error && this.state.haveUsersLocation ? true : false;
    }

    formSubmitted = (event) => {
      event.preventDefault();
     
      if(this.formIsValid()) {
        fetch(API_URL, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            produce: this.state.userMessage.produce,
            message: this.state.userMessage.message,
            latitude: this.state.location.lat,
            longitude: this.state.location.lng,
          })
        }).then(res => res.json())
        .then(message => {
          console.log(message);
        });
      }
    }

    valueChanged = (event) => {
      const { name, value } = event.target;
        this.setState((prevState) =>({
        userMessage: {
          ...prevState.userMessage,
          [name]: value
        }
      }))
    }

  render() {
    const position = [this.state.location.lat, this.state.location.lng];
    return (
      <div className="map">
        <Map className="map" center={position} zoom={this.state.zoom}> 
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        { 
          this.state.haveUsersLocation ?
          <Marker 
          position={position}
          icon={myIcon}>
            <Popup>
              These are some tasty peaches <br /> Come and get them.
            </Popup>
          </Marker> : '' 
        }
        {this.state.messages.map(message => (
            <Marker 
            position={[message.latitude, message.longitude]}
            icon={myIcon}>
              <Popup>
                <em>{message.produce}:</em> {message.message}
              </Popup>
            </Marker> : '' 
        ))}
        </Map> 
        <Card body id="message-form">
          <CardTitle>Special Title</CardTitle>
          <CardText>Bla bla bla</CardText>
          <Form onSubmit={this.formSubmitted}>
            <FormGroup>
              <Label for="Produce">Produce</Label>
              <Input 
                onChange={this.valueChanged}
                type="text" 
                name="produce" 
                id="produce" 
                placeholder="Enter Produce" />
            </FormGroup>
            <FormGroup>
              <Label for="message">Message</Label>
              <Input 
                onChange={this.valueChanged}
                type="textarea"
                name="message" 
                id="message" 
                placeholder="Enter Message" />
            </FormGroup>
            <Button type="submit" color="info" disabled={!this.formIsValid()}>Submit</Button>
          </Form>
        </Card>
        </div> 
    );
    }
}

export default App;
