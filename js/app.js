
var breweries = [
  {
    name: 'Epic Brewing Company',
    location: {lat: 40.7511580, lng: -111.8878130}
  },
  {
    name: 'Fisher Brewing Company',
    location: {lat: 40.7521570, lng: -111.9004480}
  },
  {
    name: 'Proper Brewing Co.',
    location: {lat: 40.7505630, lng: -111.8906990}
  },
  {
    name: 'Shades of Pale Brewery',
    location: {lat: 40.7238790, lng: -111.8952380}
  },
  {
    name: 'RoHa Brewing Project',
    location: {lat: 40.7364690, lng: -111.8900970}
  },
  {
    name: 'Mountain West Cider',
    location: {lat: 40.7787720, lng: -111.9030370}
  },
  {
    name: 'Red Rock Brewing Co.',
    location: {lat: 40.7636480, lng: -111.8972400}
  }
];

var map;
var bounds;
var infoWindow;

// Resize and position the #map element when the window is resized
$(window).resize(function() {
  var headerHeight = $('header').height();
  var pageHeight = $(document).height();
  var mapHeight = 100-(headerHeight/pageHeight*100);
  $('#map').height(mapHeight + "%").css("top", headerHeight + "px");
}).resize();


function Brewery(place) {
  var self = this;

  this.title = place.name;
  this.position = place.location;
  this.location = "";
  this.website = "";
  this.hours = "";
  this.venueID = "";
  this.businessID = "";
  this.infoWindowContent = "<div><strong>" + self.title + "</strong></div><br>";
  this.defaultMarker = 'img/beer_icon_dark.png';
  this.highlightedMarker = 'img/beer_icon_light.png';

  var CLIENTID = "fTINc3XGawRKK2RCEJ6o-3eUTXHoFG7Vczl96kklKgvMUygr3lA3M6eJMo71pZI-HotNMDqKN_3BCzKRf5JIILL1SWuqw24yQ_WkxGW09ndeXbrdRxXhVdgj7S8zWnYx";

  var idURL = "https://api.yelp.com/v3/businesses/";
  var searchURL = "https://api.yelp.com/v3/businesses/search"
  searchURL += '?' + $.param({
    'latitude': self.position['lat'],
    'longitude': self.position['lng'],
    'term': self.title,
    'limit': 1
  });

  $.ajax({
    url: searchURL,
    headers: {
      Authorization: "Bearer " + CLIENTID,
      Access-Control-Allow-Origin: '*'
    },
    success: function(data) {
      console.log('success');
    }
  });

  /*
  $.getJSON(searchURL).done(function(data) {
    var results = data.response.venues[0];
    // Get address
    if (results.location.address) {
      self.location = results.location.address;
      self.infoWindowContent += "<div>" + self.location + "</div>";
    }
    // Get venue ID to get more info
    self.venueID = results.id;

    // Send second request
    idURL += self.venueID + '?' + $.param({
      'client_id': CLIENTID,
      'client_secret': CLIENT_SECRET,
      'v': '20171212'
    });
    $.getJSON(idURL).done(function(data2) {
      var results2 = data2.response.venue;
      if (results2.hours) {
        self.hours = results2.hours.status;
        self.infoWindowContent += "<div>" + self.hours + "</div>";
      }
    });

    if (results.url) {
        self.website = results.url;
        self.infoWindowContent += "<div><a target='_blank' href='" + self.website + "'>" + self.website + "</a></div><br>";
    }
  });
  */

  this.marker = new google.maps.Marker({
    position: self.position,
    title: self.title,
    map: map,
    icon: self.defaultMarker,
    animation: google.maps.Animation.DROP
  });

  this.setInfoWindowContent = function() {

  }

  // Change marker symbol on mouseover
  this.marker.addListener('mouseover', function() {
    this.setIcon(self.highlightedMarker);
  });
  this.marker.addListener('mouseout', function() {
    this.setIcon(self.defaultMarker);
  });

  // Open info window onclick
  this.marker.addListener('click', function() {
    self.openInfoWindow(this, infoWindow);
  });

  this.openInfoWindow = function(marker, infoWindow) {
    if (infoWindow.marker != marker) {
      infoWindow.marker = marker;
      infoWindow.setContent(self.infoWindowContent);
      infoWindow.open(map, marker);
      infoWindow.addListener('closeclick', function() {
        infoWindow.marker = null;
      });
    }
  }

  this.menuClick = function(place) {
    google.maps.event.trigger(self.marker, 'click');
    map.setCenter(self.position);
    map.setZoom(14);
    // Animate marker
    self.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      self.marker.setAnimation(null);
    }, 3500);
    // Close nav pane when link is clicked
    $('.mdl-layout__drawer').removeClass('is-visible');
    $('.mdl-layout__obfuscator').removeClass('is-visible');
  }

}


function ViewModel() {
  var self = this;

  this.places = ko.observableArray([]);
  this.filter = ko.observable('');

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.760772, lng: -111.898087},
    zoom: 14,
    fullscreenControl: false
  });

  infoWindow = new google.maps.InfoWindow();
  this.bounds = new google.maps.LatLngBounds();

  // Create Markers and Info Windows for all of the breweries
  breweries.forEach(function(brewery) {
    self.places.push(new Brewery(brewery));
    self.bounds.extend(brewery.location);
  });
  // Dynamically adjust bounds of map after markers are loaded
  map.fitBounds(this.bounds);

  this.filteredBreweries = ko.computed(function() {
    var filter = self.filter().toLowerCase();
    if (!filter) {
      return self.places();
    } else {
      return ko.utils.arrayFilter(self.places(), function(place) {
        var name = place.title.toLowerCase().includes(filter);
        return name;
      });
    }
  }, self);

}

function initMap() {
  ko.applyBindings(new ViewModel());
}
