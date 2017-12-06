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

// Resize and position the #map element when the window is resized
$(window).resize(function() {
  var headerHeight = $('header').height();
  var pageHeight = $(document).height();
  var mapHeight = 100-(headerHeight/pageHeight*100);
  $('#map').height(mapHeight + "%").css("top", headerHeight + "px");
}).resize();


function ViewModel() {
  var self = this;

  this.places = ko.observableArray([]);
  this.bounds = new google.maps.LatLngBounds();

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.760772, lng: -111.898087},
    zoom: 14
  });

  // Create Markers and Info Windows for all of the breweries
  for (var i=0; i<breweries.length; i++) {
    self.places.push(new Brewery(breweries[i]));
    self.bounds.extend(breweries[i].location);
  }
  // Dynamically adjust bounds of map after markers are loaded
  map.fitBounds(this.bounds);

}

function Brewery(place) {
  var self = this;
  this.position = place.location;
  this.title = place.name;
  this.infoWindow = new google.maps.InfoWindow();

  this.marker = new google.maps.Marker({
    position: self.position,
    title: self.title,
    map: map,
    animation: google.maps.Animation.DROP
  });

}


ko.applyBindings(new ViewModel());
